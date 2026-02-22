import { useEffect, useLayoutEffect, useRef } from 'react';

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

  // Why: storing latest values in refs lets the observer callback always read
  // fresh state without recreating the observer on every render.
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);

  // Why: useLayoutEffect runs synchronously after DOM mutations — refs are
  // updated before the observer can fire, avoiding stale closure reads.
  useLayoutEffect(() => {
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Why: IntersectionObserver fires off the main thread — no scroll event
    // throttling needed, more performant than a scroll listener approach.
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
        onLoadMoreRef.current();
      }
    };

    const observer = new IntersectionObserver(handleIntersection, { rootMargin: '100px' });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []); // Why: empty deps — observer is created once, reads latest state via refs

  return { sentinelRef };
}
