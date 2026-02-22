'use client';

import { useState } from 'react';
import { FeedList } from './FeedList';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { FeedErrorFallback } from '@/shared/components/ErrorFallback';

/**
 * Root feed component — composes the feed layout with header and post list.
 * Imported by `app/feed/page.tsx` as a thin wrapper.
 */
export function Feed() {
  // Why: incrementing the key forces ErrorBoundary to remount, resetting error state.
  const [boundaryKey, setBoundaryKey] = useState(0);

  return (
    <main className="bg-bg-primary min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-text-primary text-xl font-semibold tracking-tight">Feed</h1>
        </header>
        <section aria-label="Posts feed">
          <ErrorBoundary
            key={boundaryKey}
            fallback={<FeedErrorFallback onRetry={() => setBoundaryKey((k) => k + 1)} />}
          >
            <FeedList />
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
