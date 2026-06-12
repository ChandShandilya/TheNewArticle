/**
 * TheNewArticle — shared domain model (@tna/types).
 * Canonical source of truth for the data shapes used across api + web.
 * See COPILOT_INSTRUCTIONS.md §3.
 */

/** Content verticals. `top` = cross-category trending. */
export const CATEGORIES = [
  'top',
  'ai',
  'tech',
  'science',
  'politics',
  'business',
  'sports',
  'entertainment',
  'art-culture',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const REGIONS = ['india', 'world'] as const;
export type Region = (typeof REGIONS)[number];

/** Type of outlet — used for transparency labelling in the UI. */
export const SOURCE_KINDS = [
  'national',
  'regional',
  'international',
  'wire',
  'government',
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** How a summary was produced. `ai` summaries MUST be labelled in the UI. */
export type SummaryKind = 'source' | 'ai';

export interface Source {
  id: string;
  name: string;
  homepageUrl: string;
  faviconUrl?: string;
  /** ISO 3166-1 alpha-2, lowercase (e.g. "in"). */
  country: string;
  /** ISO 639-1, lowercase (e.g. "en", "hi"). */
  language: string;
  kind: SourceKind;
}

/** A single published item from one source. */
export interface Article {
  id: string;
  storyId: string;
  title: string;
  summary?: string;
  fullText?: string;
  url: string;
  source: Source;
  language: string;
  country: string;
  categories: Category[];
  publishedAt: string; // ISO 8601
  rawTags: string[];
  aiSummary?: string;
  summaryKind: SummaryKind;
}

/** A cluster of articles from multiple sources about the same event. */
export interface Story {
  id: string;
  title: string;
  canonicalUrl: string;
  categories: Category[];
  region: Region;
  publishedAt: string; // ISO 8601 — newest article in the cluster
  sourceCount: number;
  articles: Article[];
}

/** Raw shape every ingestion adapter must emit before normalization. */
export interface RawArticle {
  title: string;
  url: string;
  summary?: string;
  fullText?: string;
  publishedAt: string;
  language: string;
  country: string;
  categories: string[];
  rawTags?: string[];
  source: {
    name: string;
    homepageUrl: string;
    faviconUrl?: string;
    country: string;
    language: string;
    kind: SourceKind;
  };
}

export interface NewsSourceAdapter {
  /** Stable id, e.g. "mock-india". */
  readonly id: string;
  fetch(): Promise<RawArticle[]>;
}

// --- API response contracts ---

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type FeedResponse = Paginated<Story>;

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value);
}
