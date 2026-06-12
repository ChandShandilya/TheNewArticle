import Link from 'next/link';

export function SiteFooter({ textOnly }: { textOnly: boolean }) {
  return (
    <footer className="site">
      <div className="wrap">
        <div>
          TheNewArticle aggregates and links to original publishers. Radical transparency · minimal
          bias · maximum context.
        </div>
        <div className="controls">
          {/* Plain anchor: a full navigation re-renders the layout with the
              freshly toggled cookie, and needs zero client JS. */}
          <a href="/text-mode">{textOnly ? 'Disable text-only mode' : 'Enable text-only mode'}</a>
          <Link href="/search" prefetch={false}>
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
