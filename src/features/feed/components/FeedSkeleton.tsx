'use client';

/** Loading skeleton for the feed — renders 3 placeholder cards with pulse animation. */
export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="surface-card rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="bg-skeleton h-10 w-10 animate-pulse rounded-full" />
            <div className="bg-skeleton h-4 w-32 animate-pulse rounded" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="bg-skeleton h-3 w-full animate-pulse rounded" />
            <div className="bg-skeleton h-3 w-4/5 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
