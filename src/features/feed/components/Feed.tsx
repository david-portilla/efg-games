'use client';

/**
 * Root feed component — composes the feed layout with header and post list.
 * Imported by `app/feed/page.tsx` as a thin wrapper.
 */
export function Feed() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6">
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Feed
          </h1>
        </header>
        <section aria-label="Posts feed">{/* FeedList goes here — EFG-019 */}</section>
      </div>
    </main>
  );
}
