import Link from 'next/link';
import type { Story } from '@tna/types';
import { timeAgo } from '../lib/format';

export function StoryCard({ story }: { story: Story }) {
  const lead = story.articles[0];
  const summary = lead?.summary;
  const hasAi = story.articles.some((a) => a.summaryKind === 'ai');
  return (
    <li className="story">
      <h2>
        <Link href={`/story/${story.id}`}>{story.title}</Link>
      </h2>
      {summary ? <p className="summary">{summary}</p> : null}
      <div className="meta">
        <span>{timeAgo(story.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>
          {story.sourceCount} source{story.sourceCount === 1 ? '' : 's'}
        </span>
        {hasAi ? <span className="ai-tag">AI summary</span> : null}
      </div>
      <div className="cats">
        {story.categories.map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </div>
    </li>
  );
}

export function StoryList({ stories }: { stories: Story[] }) {
  if (stories.length === 0) {
    return (
      <p className="empty">
        No stories yet. Run <code>npm run ingest</code> to load mock India news.
      </p>
    );
  }
  return (
    <ul className="stories">
      {stories.map((s) => (
        <StoryCard key={s.id} story={s} />
      ))}
    </ul>
  );
}
