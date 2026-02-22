'use client';

import Image from 'next/image';
import { useGetPostByIdQuery } from '../api';
import { useGetUserByIdQuery } from '@/features/users/api';

interface PostDetailProps {
  postId: number;
}

/** Full post detail view — avatar, author name, title heading, and untruncated body. */
export function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isFetching, isError } = useGetPostByIdQuery(postId);
  const { data: author } = useGetUserByIdQuery(post?.userId ?? 0, { skip: !post?.userId });

  if (isFetching) {
    return <PostDetailSkeleton />;
  }

  if (isError || !post) {
    return (
      <p className="text-text-secondary py-8 text-center text-sm">
        {isError ? 'Failed to load post. Please try again.' : 'Post not found.'}
      </p>
    );
  }

  const authorName = author ? `${author.firstName} ${author.lastName}` : '—';

  return (
    <article className="mx-auto max-w-prose">
      <div className="mb-6 flex flex-col items-center gap-2">
        {author?.image ? (
          <Image
            src={author.image}
            alt={`${authorName} avatar`}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="bg-skeleton h-20 w-20 animate-pulse rounded-full" />
        )}
        <span className="text-text-secondary text-sm font-medium">{authorName}</span>
      </div>

      <h1 className="text-text-primary mb-4 text-lg leading-snug font-semibold">{post.title}</h1>

      <p className="text-text-secondary leading-relaxed">{post.body}</p>
    </article>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-prose" aria-busy="true" aria-label="Loading post">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="bg-skeleton h-20 w-20 animate-pulse rounded-full" />
        <div className="bg-skeleton h-4 w-24 animate-pulse rounded" />
      </div>
      <div className="space-y-3">
        <div className="bg-skeleton h-5 w-3/4 animate-pulse rounded" />
        <div className="bg-skeleton h-4 w-full animate-pulse rounded" />
        <div className="bg-skeleton h-4 w-full animate-pulse rounded" />
        <div className="bg-skeleton h-4 w-5/6 animate-pulse rounded" />
      </div>
    </div>
  );
}
