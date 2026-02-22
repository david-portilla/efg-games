'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { useGetPostsPaginatedQuery } from '../api';
import { useGetUserByIdQuery } from '@/features/users/api';
import { useAppSelector } from '@/shared/lib/hooks';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useScrollRestore } from '../hooks/useScrollRestore';
import { useNewPostSimulator } from '../hooks/useNewPostSimulator';
import { PostCard } from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';
import type { Post } from '../types';

const PAGE_SIZE = 20;

/** Renders a single PostCard resolving the author via RTK Query.
 * Memoized so stable post/author/onNavigate props skip re-renders. */
const PostCardWithAuthor = memo(function PostCardWithAuthor({
  post,
  onNavigate,
  isNew = false,
}: {
  post: Post;
  onNavigate: () => void;
  isNew?: boolean;
}) {
  const { data: author } = useGetUserByIdQuery(post.userId);
  return <PostCard post={post} author={author} onNavigate={onNavigate} isNew={isNew} />;
});

/**
 * Infinite-scrolling list of posts — accumulates pages as the user scrolls.
 *
 * Why: posts from previous pages are merged into `loadedPosts` on each
 * `handleLoadMore` call — before advancing skip. This keeps accumulation
 * in event handler scope, avoiding setState-in-effect and ref-during-render.
 */
export function FeedList() {
  const [skip, setSkip] = useState(0);
  const [loadedPosts, setLoadedPosts] = useState<Post[]>([]);
  const { saveScroll } = useScrollRestore();
  const newPosts = useAppSelector((state) => state.feed.newPosts);
  useNewPostSimulator();

  const { data, isFetching, isError } = useGetPostsPaginatedQuery({ limit: PAGE_SIZE, skip });

  const currentPage = useMemo(() => data?.posts ?? [], [data?.posts]);
  const total = data?.total ?? 0;

  const allPosts = useMemo(() => {
    const existingIds = new Set(loadedPosts.map((p) => p.id));
    const newInCurrentPage = currentPage.filter((p) => !existingIds.has(p.id));
    return [...loadedPosts, ...newInCurrentPage];
  }, [loadedPosts, currentPage]);

  const hasMore = allPosts.length < total && total > 0;

  const handleLoadMore = useCallback(() => {
    setLoadedPosts(allPosts);
    setSkip((prev) => prev + PAGE_SIZE);
  }, [allPosts]);

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: handleLoadMore,
  });

  if (isError) {
    return (
      <p className="text-text-secondary py-8 text-center text-sm">
        Failed to load posts. Please try again.
      </p>
    );
  }

  return (
    <div role="feed" aria-busy={isFetching} aria-label="Posts">
      {/* Why: aria-live announces new posts to screen readers without moving focus. */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {newPosts.length > 0 &&
          `${newPosts.length} new post${newPosts.length > 1 ? 's' : ''} arrived`}
      </div>
      <div className="flex flex-col gap-3">
        {newPosts.map((post) => (
          <PostCardWithAuthor key={post.id} post={post} onNavigate={saveScroll} isNew />
        ))}
        {allPosts.map((post) => (
          <PostCardWithAuthor key={post.id} post={post} onNavigate={saveScroll} />
        ))}
      </div>

      {isFetching && <FeedSkeleton />}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
