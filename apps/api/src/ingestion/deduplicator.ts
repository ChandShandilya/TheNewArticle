import type { Category, Region } from '@tna/types';
import { clusterKeyOf } from './normalizer';
import type { NormalizedArticle } from './normalizer';

/** A cluster of normalized articles that describe the same event. */
export interface StoryCluster {
  clusterKey: string;
  title: string;
  canonicalUrl: string;
  region: Region;
  categories: Category[];
  /** Newest publish time across the cluster. */
  publishedAt: string;
  articles: NormalizedArticle[];
}

/** Articles within this many hours can be considered the same breaking story. */
const TIME_WINDOW_HOURS = 36;
/** Token-set overlap required to merge two headlines into one story. */
const SIMILARITY_THRESHOLD = 0.4;

/** Jaccard similarity of two token sets: |A ∩ B| / |A ∪ B|. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

interface WorkingCluster {
  tokens: Set<string>;
  items: NormalizedArticle[];
}

function withinWindow(a: NormalizedArticle, b: NormalizedArticle): boolean {
  const diff = Math.abs(+new Date(a.raw.publishedAt) - +new Date(b.raw.publishedAt));
  return diff <= TIME_WINDOW_HOURS * 3_600_000;
}

/**
 * Greedy similarity clustering: an article joins the first existing cluster it
 * is similar enough to (by headline token overlap) within the time window;
 * otherwise it seeds a new cluster. Deterministic for a given input, so the
 * derived `clusterKey` is stable across runs (idempotent persistence).
 */
export function deduplicate(items: NormalizedArticle[]): StoryCluster[] {
  // Process oldest-first so the canonical (seed) article is the earliest one.
  const ordered = [...items].sort(
    (a, b) => +new Date(a.raw.publishedAt) - +new Date(b.raw.publishedAt),
  );

  const working: WorkingCluster[] = [];
  for (const item of ordered) {
    const tokens = new Set(item.tokens);
    const match = working.find(
      (c) => withinWindow(c.items[0], item) && jaccard(c.tokens, tokens) >= SIMILARITY_THRESHOLD,
    );
    if (match) {
      match.items.push(item);
      for (const t of tokens) match.tokens.add(t);
    } else {
      working.push({ tokens, items: [item] });
    }
  }

  const clusters = working.map<StoryCluster>((c) => {
    const seed = c.items[0]; // earliest-published article
    const newest = c.items.reduce((a, b) =>
      +new Date(b.raw.publishedAt) > +new Date(a.raw.publishedAt) ? b : a,
    );
    const categories = [...new Set(c.items.flatMap((g) => g.categories))] as Category[];

    return {
      clusterKey: clusterKeyOf(seed.raw.title),
      title: seed.raw.title,
      canonicalUrl: seed.raw.url,
      region: c.items.some((g) => g.region === 'india') ? 'india' : 'world',
      categories,
      publishedAt: newest.raw.publishedAt,
      articles: c.items,
    };
  });

  return clusters.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
