import type { NewsSourceAdapter, RawArticle, SourceKind } from '@tna/types';

/**
 * Mock India + World source for Phase 1 — deterministic, no network, no keys.
 * Some stories intentionally appear from multiple outlets with near-identical
 * titles so the deduplicator clusters them (multiple sources per story).
 */

interface Outlet {
  name: string;
  homepageUrl: string;
  faviconUrl?: string;
  country: string;
  language: string;
  kind: SourceKind;
}

const OUTLETS: Record<string, Outlet> = {
  pti: {
    name: 'Press Trust of India',
    homepageUrl: 'https://www.ptinews.com',
    country: 'in',
    language: 'en',
    kind: 'wire',
  },
  toi: {
    name: 'The Times of India',
    homepageUrl: 'https://timesofindia.indiatimes.com',
    country: 'in',
    language: 'en',
    kind: 'national',
  },
  hindu: {
    name: 'The Hindu',
    homepageUrl: 'https://www.thehindu.com',
    country: 'in',
    language: 'en',
    kind: 'national',
  },
  ie: {
    name: 'The Indian Express',
    homepageUrl: 'https://indianexpress.com',
    country: 'in',
    language: 'en',
    kind: 'national',
  },
  dh: {
    name: 'Deccan Herald',
    homepageUrl: 'https://www.deccanherald.com',
    country: 'in',
    language: 'en',
    kind: 'regional',
  },
  pib: {
    name: 'Press Information Bureau',
    homepageUrl: 'https://pib.gov.in',
    country: 'in',
    language: 'en',
    kind: 'government',
  },
  reuters: {
    name: 'Reuters',
    homepageUrl: 'https://www.reuters.com',
    country: 'gb',
    language: 'en',
    kind: 'wire',
  },
  bbc: {
    name: 'BBC News',
    homepageUrl: 'https://www.bbc.com/news',
    country: 'gb',
    language: 'en',
    kind: 'international',
  },
};

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

interface Seed {
  outlet: keyof typeof OUTLETS;
  title: string;
  summary: string;
  categories: string[];
  hours: number;
  slug: string;
}

const SEEDS: Seed[] = [
  // --- Story A: ISRO launch (clustered across 3 Indian outlets) ---
  {
    outlet: 'pti',
    title: 'ISRO successfully launches next-generation navigation satellite',
    summary:
      'India space agency placed a new navigation satellite into orbit on Saturday, strengthening the NavIC system.',
    categories: ['science', 'tech'],
    hours: 2,
    slug: 'isro-navigation-satellite',
  },
  {
    outlet: 'toi',
    title: 'ISRO successfully launches next-generation navigation satellite',
    summary:
      'The launch from Sriharikota adds a second-generation satellite to the regional navigation constellation.',
    categories: ['science'],
    hours: 2,
    slug: 'isro-navigation-satellite',
  },
  {
    outlet: 'hindu',
    title: 'ISRO launches next-generation navigation satellite from Sriharikota',
    summary:
      'Officials said the satellite carries an atomic clock and an L1-band payload for civilian use.',
    categories: ['science', 'tech'],
    hours: 3,
    slug: 'isro-navigation-satellite',
  },

  // --- Story B: India AI policy (clustered across wire + national + gov) ---
  {
    outlet: 'pib',
    title: 'Government unveils national framework to regulate artificial intelligence',
    summary:
      'The framework proposes risk-tiered rules, transparency duties and an AI safety institute.',
    categories: ['ai', 'politics'],
    hours: 5,
    slug: 'india-ai-framework',
  },
  {
    outlet: 'ie',
    title: 'India unveils national framework to regulate artificial intelligence',
    summary:
      'Industry bodies welcomed the risk-based approach but sought clarity on compliance timelines.',
    categories: ['ai', 'business'],
    hours: 4,
    slug: 'india-ai-framework',
  },

  // --- Standalone India stories ---
  {
    outlet: 'dh',
    title: 'Bengaluru metro adds two new lines to ease tech-corridor traffic',
    summary:
      'The expansion connects the airport and the eastern IT hubs, cutting commute times.',
    categories: ['business'],
    hours: 6,
    slug: 'bengaluru-metro-expansion',
  },
  {
    outlet: 'toi',
    title: 'India clinch series win in final-over thriller',
    summary:
      'A composed finish saw the hosts chase down the target with one ball to spare.',
    categories: ['sports'],
    hours: 1,
    slug: 'india-series-win',
  },
  {
    outlet: 'hindu',
    title: 'Monsoon forecast revised upward for the southern peninsula',
    summary:
      'The weather department now expects above-normal rainfall across several districts.',
    categories: ['science'],
    hours: 8,
    slug: 'monsoon-forecast',
  },
  {
    outlet: 'ie',
    title: 'Homegrown startup unveils low-cost EV battery for two-wheelers',
    summary:
      'The company claims a 30 percent cost reduction using a sodium-ion chemistry.',
    categories: ['tech', 'business'],
    hours: 7,
    slug: 'ev-battery-startup',
  },

  // --- World stories (one clustered across Reuters + BBC) ---
  {
    outlet: 'reuters',
    title: 'Global chipmakers report record demand for AI accelerators',
    summary:
      'Quarterly results show data-centre demand outpacing supply for advanced chips.',
    categories: ['ai', 'business'],
    hours: 3,
    slug: 'global-ai-chip-demand',
  },
  {
    outlet: 'bbc',
    title: 'Chipmakers report record demand for AI accelerators worldwide',
    summary:
      'Analysts say the AI build-out is reshaping the semiconductor supply chain.',
    categories: ['ai', 'tech'],
    hours: 4,
    slug: 'global-ai-chip-demand',
  },
  {
    outlet: 'bbc',
    title: 'Major film festival announces lineup with strong Asian presence',
    summary:
      'Several debut features from India and Southeast Asia made the official selection.',
    categories: ['entertainment', 'art-culture'],
    hours: 9,
    slug: 'film-festival-lineup',
  },
];

export class MockIndiaSource implements NewsSourceAdapter {
  readonly id = 'mock-india';

  async fetch(): Promise<RawArticle[]> {
    return SEEDS.map((seed) => {
      const outlet = OUTLETS[seed.outlet];
      const path = `${seed.slug}-${seed.outlet}`;
      return {
        title: seed.title,
        url: `${outlet.homepageUrl}/article/${path}`,
        summary: seed.summary,
        publishedAt: hoursAgo(seed.hours),
        language: outlet.language,
        country: outlet.country,
        categories: seed.categories,
        rawTags: seed.categories,
        source: { ...outlet },
      } satisfies RawArticle;
    });
  }
}
