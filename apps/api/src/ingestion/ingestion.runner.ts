import { PrismaClient } from '@prisma/client';
import type { NewsSourceAdapter } from '@tna/types';
import { MockIndiaSource } from './sources/mock-india.source';
import { normalize } from './normalizer';
import { deduplicate, type StoryCluster } from './deduplicator';

/** Adapter registry — select via the INGEST_SOURCE env var. */
const ADAPTERS: Record<string, () => NewsSourceAdapter> = {
  'mock-india': () => new MockIndiaSource(),
  // Real adapters (NewsAPI / NewsData.io / World News API) register here later,
  // behind the same NewsSourceAdapter interface.
};

export function getAdapter(id: string): NewsSourceAdapter {
  const factory = ADAPTERS[id];
  if (!factory) {
    throw new Error(
      `Unknown INGEST_SOURCE "${id}". Known: ${Object.keys(ADAPTERS).join(', ')}`,
    );
  }
  return factory();
}

export interface IngestSummary {
  source: string;
  fetched: number;
  clusters: number;
  storiesUpserted: number;
  articlesUpserted: number;
}

/** Idempotent: re-running upserts by stable keys and never duplicates. */
async function persistCluster(
  prisma: PrismaClient,
  cluster: StoryCluster,
): Promise<number> {
  const story = await prisma.story.upsert({
    where: { clusterKey: cluster.clusterKey },
    create: {
      clusterKey: cluster.clusterKey,
      title: cluster.title,
      canonicalUrl: cluster.canonicalUrl,
      region: cluster.region,
      categories: cluster.categories,
      publishedAt: new Date(cluster.publishedAt),
    },
    update: {
      categories: cluster.categories,
      publishedAt: new Date(cluster.publishedAt),
    },
  });

  let articles = 0;
  for (const item of cluster.articles) {
    const s = item.raw.source;
    const source = await prisma.source.upsert({
      where: { name: s.name },
      create: {
        name: s.name,
        homepageUrl: s.homepageUrl,
        faviconUrl: s.faviconUrl ?? null,
        country: s.country,
        language: s.language,
        kind: s.kind,
      },
      update: { homepageUrl: s.homepageUrl, kind: s.kind },
    });

    await prisma.article.upsert({
      where: { url: item.raw.url },
      create: {
        storyId: story.id,
        sourceId: source.id,
        title: item.raw.title,
        summary: item.raw.summary ?? null,
        fullText: item.raw.fullText ?? null,
        url: item.raw.url,
        language: item.raw.language,
        country: item.raw.country,
        categories: item.categories,
        rawTags: item.raw.rawTags ?? [],
        publishedAt: new Date(item.raw.publishedAt),
      },
      update: {
        storyId: story.id,
        categories: item.categories,
        publishedAt: new Date(item.raw.publishedAt),
      },
    });
    articles += 1;
  }

  return articles;
}

export async function runIngestion(
  prisma: PrismaClient,
  sourceId: string,
): Promise<IngestSummary> {
  const adapter = getAdapter(sourceId);
  const raw = await adapter.fetch();
  const normalized = raw.map(normalize);
  const clusters = deduplicate(normalized);

  let articlesUpserted = 0;
  for (const cluster of clusters) {
    articlesUpserted += await persistCluster(prisma, cluster);
  }

  return {
    source: adapter.id,
    fetched: raw.length,
    clusters: clusters.length,
    storiesUpserted: clusters.length,
    articlesUpserted,
  };
}
