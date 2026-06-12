import { deduplicate } from './deduplicator';
import { normalize } from './normalizer';
import type { RawArticle } from '@tna/types';

function raw(partial: Partial<RawArticle> = {}): RawArticle {
  return {
    title: 'A headline',
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

describe('deduplicate', () => {
  it('merges similar headlines within the time window into one cluster', () => {
    const items = [
      normalize(
        raw({
          title: 'ISRO launches navigation satellite',
          url: 'https://a.com/1',
          publishedAt: '2026-06-01T00:00:00.000Z',
        }),
      ),
      normalize(
        raw({
          title: 'ISRO launches new navigation satellite successfully',
          url: 'https://b.com/1',
          publishedAt: '2026-06-01T06:00:00.000Z',
        }),
      ),
    ];

    const clusters = deduplicate(items);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].articles).toHaveLength(2);
  });

  it('keeps dissimilar headlines in separate clusters', () => {
    const items = [
      normalize(raw({ title: 'ISRO launches navigation satellite' })),
      normalize(raw({ title: 'Monsoon forecast revised upward this week' })),
    ];

    const clusters = deduplicate(items);

    expect(clusters).toHaveLength(2);
  });

  it('does not merge identical headlines outside the 36h window', () => {
    const items = [
      normalize(
        raw({
          title: 'ISRO launches navigation satellite',
          url: 'https://a.com/1',
          publishedAt: '2026-06-01T00:00:00.000Z',
        }),
      ),
      normalize(
        raw({
          title: 'ISRO launches navigation satellite',
          url: 'https://b.com/1',
          publishedAt: '2026-06-03T12:00:00.000Z',
        }),
      ),
    ];

    const clusters = deduplicate(items);

    expect(clusters).toHaveLength(2);
  });

  it('uses the earliest article as canonical and newest time for the cluster', () => {
    const items = [
      normalize(
        raw({
          title: 'ISRO launches navigation satellite',
          url: 'https://earliest.com/1',
          publishedAt: '2026-06-01T00:00:00.000Z',
        }),
      ),
      normalize(
        raw({
          title: 'ISRO launches new navigation satellite successfully',
          url: 'https://later.com/1',
          publishedAt: '2026-06-01T08:00:00.000Z',
        }),
      ),
    ];

    const [cluster] = deduplicate(items);

    expect(cluster.canonicalUrl).toBe('https://earliest.com/1');
    expect(cluster.title).toBe('ISRO launches navigation satellite');
    expect(cluster.publishedAt).toBe('2026-06-01T08:00:00.000Z');
  });

  it('produces a deterministic clusterKey regardless of input order', () => {
    const a = normalize(
      raw({
        title: 'ISRO launches navigation satellite',
        url: 'https://a.com/1',
        publishedAt: '2026-06-01T00:00:00.000Z',
      }),
    );
    const b = normalize(
      raw({
        title: 'ISRO launches new navigation satellite successfully',
        url: 'https://b.com/1',
        publishedAt: '2026-06-01T06:00:00.000Z',
      }),
    );

    const forward = deduplicate([a, b])[0].clusterKey;
    const reverse = deduplicate([b, a])[0].clusterKey;

    expect(forward).toBe(reverse);
  });

  it('orders clusters newest-first', () => {
    const items = [
      normalize(
        raw({
          title: 'Older standalone story about cricket series',
          url: 'https://x.com/1',
          publishedAt: '2026-05-01T00:00:00.000Z',
        }),
      ),
      normalize(
        raw({
          title: 'Newer standalone story about budget reforms',
          url: 'https://y.com/1',
          publishedAt: '2026-06-01T00:00:00.000Z',
        }),
      ),
    ];

    const clusters = deduplicate(items);

    expect(clusters).toHaveLength(2);
    expect(+new Date(clusters[0].publishedAt)).toBeGreaterThan(+new Date(clusters[1].publishedAt));
  });
});
