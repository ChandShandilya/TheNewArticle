import Link from 'next/link';
import { isCategory, isRegion, type Category, type Region } from '@tna/types';
import { getFeed, getTop } from '../lib/api';
import { CategoryTabs, RegionTabs } from '../components/CategoryTabs';
import { StoryList } from '../components/StoryCard';

export const dynamic = 'force-dynamic';

type SearchParams = { region?: string; category?: string; page?: string };

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const region: Region =
    searchParams.region && isRegion(searchParams.region) ? searchParams.region : 'india';
  const category: Category =
    searchParams.category && isCategory(searchParams.category) ? searchParams.category : 'top';
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);

  // "Top" is a curated, cross-category trending view (most sources first) with
  // no pagination; every other category is a chronological, paginated feed.
  const isTop = category === 'top';

  if (isTop) {
    const stories = await getTop(region);
    return (
      <>
        <RegionTabs region={region} category={category} />
        <CategoryTabs region={region} active={category} />
        <StoryList stories={stories} />
      </>
    );
  }

  const feed = await getFeed({ region, category, page });

  const totalPages = Math.max(1, Math.ceil(feed.total / feed.pageSize));
  const baseQuery = (p: number): string => {
    const q = new URLSearchParams({ region, category });
    if (p > 1) q.set('page', String(p));
    return `/?${q.toString()}`;
  };

  return (
    <>
      <RegionTabs region={region} category={category} />
      <CategoryTabs region={region} active={category} />
      <StoryList stories={feed.items} />

      {totalPages > 1 ? (
        <nav className="meta" aria-label="Pagination" style={{ paddingBottom: 24 }}>
          {page > 1 ? <Link href={baseQuery(page - 1)}>← Newer</Link> : null}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? <Link href={baseQuery(page + 1)}>Older →</Link> : null}
        </nav>
      ) : null}
    </>
  );
}
