import type { Article, Category, Source, Story } from '@tna/types';
import type {
  Article as PrismaArticle,
  Source as PrismaSource,
  Story as PrismaStory,
} from '@prisma/client';

type ArticleWithSource = PrismaArticle & { source: PrismaSource };
type StoryWithArticles = PrismaStory & { articles: ArticleWithSource[] };

function toSource(s: PrismaSource): Source {
  return {
    id: s.id,
    name: s.name,
    homepageUrl: s.homepageUrl,
    faviconUrl: s.faviconUrl ?? undefined,
    country: s.country,
    language: s.language,
    kind: s.kind as Source['kind'],
  };
}

export function toArticle(a: ArticleWithSource): Article {
  return {
    id: a.id,
    storyId: a.storyId,
    title: a.title,
    summary: a.summary ?? undefined,
    fullText: a.fullText ?? undefined,
    url: a.url,
    source: toSource(a.source),
    language: a.language,
    country: a.country,
    categories: a.categories as Category[],
    publishedAt: a.publishedAt.toISOString(),
    rawTags: a.rawTags,
    aiSummary: a.aiSummary ?? undefined,
    summaryKind: a.summaryKind as Article['summaryKind'],
  };
}

export function toStory(s: StoryWithArticles): Story {
  return {
    id: s.id,
    title: s.title,
    canonicalUrl: s.canonicalUrl,
    categories: s.categories as Category[],
    region: s.region as Story['region'],
    publishedAt: s.publishedAt.toISOString(),
    sourceCount: s.articles.length,
    articles: s.articles.map(toArticle),
  };
}
