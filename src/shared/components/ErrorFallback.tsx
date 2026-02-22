'use client';

interface FeedErrorFallbackProps {
  onRetry: () => void;
}

/** Fallback UI for the feed view — shows a retry button. */
export function FeedErrorFallback({ onRetry }: FeedErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-text-secondary text-sm">Something went wrong loading the feed.</p>
      <button
        onClick={onRetry}
        className="bg-accent hover:bg-accent/80 rounded-full px-5 py-2 text-sm font-medium text-white transition-colors duration-200"
      >
        Try again
      </button>
    </div>
  );
}

interface PostErrorFallbackProps {
  error: Error;
}

/** Fallback UI for the post detail view — distinguishes 404 from generic errors. */
export function PostErrorFallback({ error }: PostErrorFallbackProps) {
  const isNotFound =
    error.message.includes('404') || error.message.toLowerCase().includes('not found');

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {isNotFound ? (
        <>
          <p className="text-text-primary text-sm font-medium">Post not found</p>
          <p className="text-text-muted text-sm">
            This post doesn&apos;t exist or has been removed.
          </p>
        </>
      ) : (
        <>
          <p className="text-text-primary text-sm font-medium">Something went wrong</p>
          <p className="text-text-muted text-sm">
            Unable to load this post. Please go back and try again.
          </p>
        </>
      )}
    </div>
  );
}
