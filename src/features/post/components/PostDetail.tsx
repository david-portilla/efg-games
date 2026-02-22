'use client';

import Image from 'next/image';
import { useGetPostByIdQuery } from '../api';
import { useGetUserByIdQuery } from '@/features/users/api';
import { PostDetailSkeleton } from './PostDetailSkeleton';

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

      <h1 className="text-text-primary mb-4 text-xl leading-snug font-semibold md:text-2xl">
        {post.title}
      </h1>

      <p className="text-text-secondary text-sm leading-relaxed md:text-base">{post.body}</p>
    </article>
  );
}
