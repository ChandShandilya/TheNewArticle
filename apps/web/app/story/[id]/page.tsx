import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Article } from '@tna/types';
import { getStory } from '../../../lib/api';
import { timeAgo, hostOf } from '../../../lib/format';

export const dynamic = 'force-dynamic';

function SourceRow({ article }: { article: Article }) {
  return (
    <li>
      <div className="src-head">
        <span className={`kind ${article.source.kind}`}>{article.source.kind}</span>
        <strong>{article.source.name}</strong>
        <span className="meta">· {timeAgo(article.publishedAt)}</span>
      </div>
      <div style={{ fontSize: 15, margin: '4px 0' }}>{article.title}</div>
      {article.summary ? (
        <p className="summary" style={{ margin: '2px 0 6px' }}>
          {article.summary}
        </p>
      ) : null}
      {article.aiSummary ? (
        <p className="summary" style={{ margin: '2px 0 6px' }}>
          <span className="ai-tag">AI summary</span> {article.aiSummary}
        </p>
      ) : null}
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        Read at {hostOf(article.url)} →
      </a>
    </li>
  );
}

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await getStory(params.id);
  if (!story) notFound();

  return (
    <article style={{ padding: '12px 0 40px' }}>
      <p className="meta" style={{ marginBottom: 6 }}>
        <Link href="/">← Back</Link>
      </p>
      <h1 style={{ fontSize: 24, lineHeight: 1.25, margin: '0 0 8px' }}>
        {story.title}
      </h1>
      <div className="meta">
        <span>{timeAgo(story.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>{story.sourceCount} sources covering this story</span>
      </div>
      <div className="cats">
        {story.categories.map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </div>

      <h2 style={{ fontSize: 14, marginTop: 20, color: 'var(--muted)' }}>
        All sources
      </h2>
      <ul className="sources">
        {story.articles.map((a) => (
          <SourceRow key={a.id} article={a} />
        ))}
      </ul>
    </article>
  );
}
