'use client';

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { PostErrorFallback } from '@/shared/components/ErrorFallback';
import type { ReactNode } from 'react';

/** Client wrapper — keeps the render-prop fallback on the client side. */
export function PostDetailErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={(error) => <PostErrorFallback error={error} />}>
      {children}
    </ErrorBoundary>
  );
}
