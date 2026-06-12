import Link from 'next/link';

export function SiteFooter({ textOnly }: { textOnly: boolean }) {
  return (
    <footer className="site">
      <div className="wrap">
        <div>
          TheNewArticle aggregates and links to original publishers. Radical
          transparency · minimal bias · maximum context.
        </div>
        <div className="controls">
          {/* Plain links — no client JS needed to toggle low-bandwidth mode. */}
          <Link href="/text-mode" prefetch={false}>
            {textOnly ? 'Disable text-only mode' : 'Enable text-only mode'}
          </Link>
          <Link href="/search" prefetch={false}>
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
