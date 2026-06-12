import Link from 'next/link';
import { CATEGORIES, type Category, type Region } from '@tna/types';

const LABELS: Record<Category, string> = {
  top: 'Top',
  ai: 'AI',
  tech: 'Tech',
  science: 'Science',
  politics: 'Politics',
  business: 'Business',
  sports: 'Sports',
  entertainment: 'Entertainment',
  'art-culture': 'Art & Culture',
};

function href(region: Region, category: Category): string {
  const q = new URLSearchParams({ region });
  if (category !== 'top') q.set('category', category);
  return `/?${q.toString()}`;
}

export function CategoryTabs({ region, active }: { region: Region; active: Category }) {
  return (
    <nav className="tabs" aria-label="Categories">
      {CATEGORIES.map((cat) => (
        <Link key={cat} href={href(region, cat)} className={cat === active ? 'active' : undefined}>
          {LABELS[cat]}
        </Link>
      ))}
    </nav>
  );
}

export function RegionTabs({ region, category }: { region: Region; category: Category }) {
  const make = (r: Region): string => href(r, category);
  return (
    <div className="regiontabs" aria-label="Region">
      <Link href={make('india')} className={region === 'india' ? 'active' : undefined}>
        India
      </Link>
      <Link href={make('world')} className={region === 'world' ? 'active' : undefined}>
        World
      </Link>
    </div>
  );
}
