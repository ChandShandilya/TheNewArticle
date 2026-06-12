import { search } from '../../lib/api';
import { StoryList } from '../../components/StoryCard';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const results = q ? await search(q) : [];

  return (
    <section>
      {/* GET form — works with zero client JS. */}
      <form className="searchbar" action="/search" method="get" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search headlines…"
          aria-label="Search headlines"
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {q ? (
        <p className="meta" style={{ padding: '4px 0' }}>
          {results.length} result{results.length === 1 ? '' : 's'} for “{q}”
        </p>
      ) : (
        <p className="empty">Type a query to search across all sources.</p>
      )}

      {q ? <StoryList stories={results} /> : null}
    </section>
  );
}
