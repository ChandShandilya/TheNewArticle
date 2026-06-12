import type { FeedResponse, Story } from '@tna/types';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000';

// Short server-side cache: fast feeds, still fresh. Tune per route as needed.
const REVALIDATE = 60;

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // API down (e.g. before `npm run dev:api`) — degrade gracefully.
    return fallback;
  }
}

const EMPTY_FEED: FeedResponse = { items: [], page: 1, pageSize: 20, total: 0 };

export function getFeed(params: {
  region?: string;
  category?: string;
  page?: number;
}): Promise<FeedResponse> {
  const q = new URLSearchParams();
  if (params.region) q.set('region', params.region);
  if (params.category) q.set('category', params.category);
  if (params.page) q.set('page', String(params.page));
  return get<FeedResponse>(`/feed?${q.toString()}`, EMPTY_FEED);
}

export function getTop(): Promise<Story[]> {
  return get<Story[]>('/feed/top', []);
}

export function getStory(id: string): Promise<Story | null> {
  return get<Story | null>(`/story/${encodeURIComponent(id)}`, null);
}

export function search(q: string): Promise<Story[]> {
  return get<Story[]>(`/search?q=${encodeURIComponent(q)}`, []);
}
