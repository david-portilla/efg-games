import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { setScrollPosition } from '../slice';

/**
 * Saves and restores the feed scroll position across navigation.
 * Next.js App Router does not restore scroll position when navigating
 * back to a page that was scrolled mid-feed. We persist the Y offset in
 * Redux so it survives the post detail → feed round-trip.
 */
export function useScrollRestore() {
  const dispatch = useAppDispatch();
  const savedPosition = useAppSelector((state) => state.feed.scrollPosition);

  // Restore scroll on mount if a saved position exists
  useEffect(() => {
    if (savedPosition > 0) {
      window.scrollTo({ top: savedPosition, behavior: 'instant' });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(setScrollPosition(window.scrollY));
    };

    // Why: 'pagehide' fires more reliably than 'beforeunload' on mobile Safari,
    // and also covers in-app Next.js navigations via the router.
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => window.removeEventListener('pagehide', handleBeforeUnload);
  }, [dispatch]);

  const saveScroll = () => dispatch(setScrollPosition(window.scrollY));

  return { saveScroll };
}
