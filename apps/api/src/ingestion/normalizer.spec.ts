import { clusterKeyOf, mapCategories, normalize, regionOf, tokensOf } from './normalizer';
import type { RawArticle } from '@tna/types';

function raw(partial: Partial<RawArticle> = {}): RawArticle {
  return {
    title: 'A sample headline about something',
    url: 'https://example.com/a',
    summary: 'summary',
    publishedAt: '2026-06-01T00:00:00.000Z',
    language: 'en',
    country: 'in',
    categories: ['tech'],
    rawTags: ['tech'],
    source: {
      name: 'Example',
      homepageUrl: 'https://example.com',
      country: 'in',
      language: 'en',
      kind: 'national',
    },
    ...partial,
  };
}

describe('mapCategories', () => {
  it('maps aliases to canonical categories', () => {
    expect(mapCategories(['technology'])).toEqual(['tech']);
    expect(mapCategories(['government'])).toEqual(['politics']);
    expect(mapCategories(['economy'])).toEqual(['business']);
  });

  it('keeps already-canonical categories and de-duplicates', () => {
    expect(mapCategories(['ai', 'ai', 'tech'])).toEqual(['ai', 'tech']);
  });

  it('falls back to "top" when nothing maps', () => {
    expect(mapCategories(['weather', 'unknown'])).toEqual(['top']);
    expect(mapCategories([])).toEqual(['top']);
  });
});

describe('regionOf', () => {
  it('treats IN as india and everything else as world', () => {
    expect(regionOf('in')).toBe('india');
    expect(regionOf('IN')).toBe('india');
    expect(regionOf('us')).toBe('world');
    expect(regionOf('gb')).toBe('world');
  });
});

describe('tokensOf', () => {
  it('drops stopwords and short words, lowercases', () => {
    expect(tokensOf('The new ISRO satellite is in orbit')).toEqual(['isro', 'satellite', 'orbit']);
  });

  it('strips punctuation', () => {
    expect(tokensOf('Budget 2027: big-ticket reforms!')).toEqual([
      'budget',
      '2027',
      'big',
      'ticket',
      'reforms',
    ]);
  });
});

describe('clusterKeyOf', () => {
  it('is order-independent and stable', () => {
    expect(clusterKeyOf('ISRO launches navigation satellite')).toBe(
      clusterKeyOf('Navigation satellite launches ISRO'),
    );
  });

  it('differs for clearly different headlines', () => {
    expect(clusterKeyOf('India wins cricket series')).not.toBe(
      clusterKeyOf('Monsoon forecast revised upward'),
    );
  });
});

describe('normalize', () => {
  it('produces categories, region, clusterKey and tokens', () => {
    const n = normalize(raw({ title: 'ISRO launches navigation satellite', country: 'in' }));
    expect(n.region).toBe('india');
    expect(n.categories).toEqual(['tech']);
    expect(n.tokens).toEqual(['isro', 'launches', 'navigation', 'satellite']);
    expect(n.clusterKey).toBe('isro-launches-navigation-satellite');
  });
});
