import type { Category, RawArticle, Region } from '@tna/types';
import { CATEGORIES } from '@tna/types';

/** A RawArticle after normalization + computed clustering metadata. */
export interface NormalizedArticle {
  raw: RawArticle;
  categories: Category[];
  region: Region;
  /** Deterministic key used as the stable identity of a story cluster. */
  clusterKey: string;
  /** Significant headline tokens, used for similarity-based clustering. */
  tokens: string[];
}

const CATEGORY_ALIASES: Record<string, Category> = {
  technology: 'tech',
  tech: 'tech',
  ai: 'ai',
  'artificial-intelligence': 'ai',
  science: 'science',
  politics: 'politics',
  government: 'politics',
  business: 'business',
  economy: 'business',
  finance: 'business',
  sports: 'sports',
  sport: 'sports',
  entertainment: 'entertainment',
  culture: 'art-culture',
  art: 'art-culture',
  'art-culture': 'art-culture',
};

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'in',
  'on',
  'for',
  'and',
  'with',
  'from',
  'at',
  'by',
  'as',
  'is',
  'are',
  'its',
  'new',
  'next',
  'generation',
]);

export function mapCategories(raw: string[]): Category[] {
  const mapped = new Set<Category>();
  for (const c of raw) {
    const key = c.trim().toLowerCase();
    const cat = CATEGORY_ALIASES[key];
    if (cat) mapped.add(cat);
    else if ((CATEGORIES as readonly string[]).includes(key)) {
      mapped.add(key as Category);
    }
  }
  if (mapped.size === 0) mapped.add('top');
  return [...mapped];
}

export function regionOf(country: string): Region {
  return country.toLowerCase() === 'in' ? 'india' : 'world';
}

/** Significant, lowercased headline tokens (stopwords + short words removed). */
export function tokensOf(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Stable, order-independent fingerprint of a headline. */
export function clusterKeyOf(title: string): string {
  return [...new Set(tokensOf(title))].sort().slice(0, 8).join('-');
}

export function normalize(raw: RawArticle): NormalizedArticle {
  return {
    raw,
    categories: mapCategories(raw.categories),
    region: regionOf(raw.country),
    clusterKey: clusterKeyOf(raw.title),
    tokens: tokensOf(raw.title),
  };
}
