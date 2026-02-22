import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

interface UseInfiniteScrollResult {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/** Observes a sentinel element at the bottom of a list and triggers `onLoadMore` when it enters the viewport. */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Why: IntersectionObserver fires off the main thread — no scroll event
    // throttling needed, more performant than a scroll listener approach.
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersection]);

  return { sentinelRef };
}
