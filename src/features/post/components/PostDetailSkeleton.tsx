/** Loading skeleton for the post detail view. */
export function PostDetailSkeleton() {
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
