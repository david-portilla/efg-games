'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo, useState } from 'react';
import type { Post } from '../types';
import type { Author } from '@/features/users/types';

interface PostCardProps {
  post: Post;
  author: Author | undefined;
  onNavigate?: () => void;
  /** Marks the card as newly arrived — triggers the entry animation and highlight. */
  isNew?: boolean;
}

const BODY_MAX_LENGTH = 100;

/** Renders a single post card with author avatar, name, title, and truncated body.
 * Wrapped in `React.memo` to avoid re-renders when the feed list updates. */
export const PostCard = memo(function PostCard({
  post,
  author,
  onNavigate,
  isNew = false,
}: PostCardProps) {
  const [imgError, setImgError] = useState(false);

  const truncatedBody =
    post.body.length > BODY_MAX_LENGTH ? `${post.body.slice(0, BODY_MAX_LENGTH)}...` : post.body;

  const authorName = author ? `${author.firstName} ${author.lastName}` : '—';

  const articleClass = [
    'surface-card relative overflow-hidden rounded-xl p-4 transition-colors duration-200 md:p-5',
    isNew ? 'new-post-enter new-post-glow cursor-not-allowed' : 'cursor-pointer',
  ].join(' ');

  const body = (
    <article className={articleClass} data-new={isNew || undefined}>
      {isNew && (
        <>
          <span
            aria-hidden="true"
            className="new-post-badge bg-accent absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase"
          >
            New
          </span>
          <span
            aria-label="Simulated post"
            className="new-post-simulated text-text-muted absolute top-3 right-3 rounded-full border border-dashed border-current px-2 py-0.5 text-[10px] tracking-wide"
          >
            Fake
          </span>
        </>
      )}

      <div className="flex items-center gap-3">
        {author?.image && !imgError ? (
          <Image
            src={author.image}
            alt={`${authorName} avatar`}
            width={40}
            height={40}
            className="shrink-0 rounded-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="bg-skeleton h-10 w-10 shrink-0 animate-pulse rounded-full" />
        )}
        <span className="text-text-primary text-sm font-medium">{authorName}</span>
      </div>

      <h2 className="text-text-primary mt-3 text-sm leading-snug font-semibold">{post.title}</h2>

      <p className="text-text-secondary mt-1 text-sm leading-relaxed">{truncatedBody}</p>
    </article>
  );

  // Tech debt: simulated posts are not navigable — dummyjson POST /posts/add
  // always returns id: 251 and local ids (≥10000) don't exist in the API.
  // Future: store full post data in Redux and serve detail from local state.
  if (isNew) return body;

  return (
    <Link
      href={`/post/${post.id}`}
      className="block"
      aria-label={`Read post: ${post.title}`}
      onClick={onNavigate}
    >
      {body}
    </Link>
  );
});
