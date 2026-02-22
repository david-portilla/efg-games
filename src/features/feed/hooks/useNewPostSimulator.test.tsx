import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createTestStore } from '@/test/renderWithProviders';
import { useNewPostSimulator } from './useNewPostSimulator';

const makeSimulatedPost = () => ({
  id: 251,
  title: 'New post from the community',
  body: 'Something exciting just happened. Stay tuned for more updates.',
  userId: 1,
});

const mockFetch = vi.fn();

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify(makeSimulatedPost()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const makeWrapper = (store: ReturnType<typeof createTestStore>) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return Wrapper;
};

describe('useNewPostSimulator', () => {
  it('dispatches addNewPost after the first interval tick', async () => {
    const store = createTestStore();

    renderHook(() => useNewPostSimulator(), { wrapper: makeWrapper(store) });

    expect(store.getState().feed.newPosts).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });

    expect(store.getState().feed.newPosts).toHaveLength(1);
  });

  it('assigns a unique local id instead of the dummyjson id 251', async () => {
    const store = createTestStore();

    renderHook(() => useNewPostSimulator(), { wrapper: makeWrapper(store) });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });

    expect(store.getState().feed.newPosts).toHaveLength(1);

    const post = store.getState().feed.newPosts[0];
    expect(post.id).not.toBe(251);
    expect(post.id).toBeGreaterThanOrEqual(10_001);
  });

  it('prepends each new post to the top of newPosts', async () => {
    const store = createTestStore();

    // Simulate two separate dispatches directly to verify prepend order
    store.dispatch({
      type: 'feed/addNewPost',
      payload: { id: 10001, title: 'First', body: '', userId: 1 },
    });
    store.dispatch({
      type: 'feed/addNewPost',
      payload: { id: 10002, title: 'Second', body: '', userId: 1 },
    });

    const posts = store.getState().feed.newPosts;
    expect(posts).toHaveLength(2);
    expect(posts[0].id).toBe(10002); // most recent is first
    expect(posts[1].id).toBe(10001);
  });

  it('clears the interval on unmount', async () => {
    const store = createTestStore();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = renderHook(() => useNewPostSimulator(), { wrapper: makeWrapper(store) });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('does not dispatch if fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const store = createTestStore();

    renderHook(() => useNewPostSimulator(), { wrapper: makeWrapper(store) });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });

    expect(store.getState().feed.newPosts).toHaveLength(0);
  });
});
