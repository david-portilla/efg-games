'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo } from 'react';
import type { Post } from '../types';
import type { Author } from '@/features/users/types';

interface PostCardProps {
  post: Post;
  author: Author | undefined;
  onNavigate?: () => void;
  /** Marks the card as newly arrived — used to apply the highlight animation. */
  isNew?: boolean;
}

const BODY_MAX_LENGTH = 100;

/** Renders a single post card with author avatar, name, title, and truncated body.
 * Wrapped in `React.memo` to avoid re-renders when the feed list updates. */
export const PostCard = memo(function PostCard({ post, author, onNavigate }: PostCardProps) {
  const truncatedBody =
    post.body.length > BODY_MAX_LENGTH ? `${post.body.slice(0, BODY_MAX_LENGTH)}...` : post.body;

  const authorName = author ? `${author.firstName} ${author.lastName}` : '—';

  return (
    <Link
      href={`/post/${post.id}`}
      className="block"
      aria-label={`Read post: ${post.title}`}
      onClick={onNavigate}
    >
      <article className="surface-card cursor-pointer rounded-xl p-4 transition-colors duration-200 md:p-5">
        <div className="flex items-center gap-3">
          {author?.image ? (
            <Image
              src={author.image}
              alt={`${authorName} avatar`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="bg-skeleton h-10 w-10 animate-pulse rounded-full" />
          )}
          <span className="text-text-primary text-sm font-medium">{authorName}</span>
        </div>

        <h2 className="text-text-primary mt-3 text-sm leading-snug font-semibold">{post.title}</h2>

        <p className="text-text-secondary mt-1 text-sm leading-relaxed">{truncatedBody}</p>
      </article>
    </Link>
  );
});
