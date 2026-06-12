import Link from 'next/link';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'TheNewArticle';

export function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap">
        <div className="row">
          <Link href="/" className="brand" aria-label={`${SITE_NAME} home`}>
            The<span>New</span>Article
          </Link>
          <span className="tagline">India-first · source-first · crystal clear</span>
        </div>
      </div>
    </header>
  );
}
