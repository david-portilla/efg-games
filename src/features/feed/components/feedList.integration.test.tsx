import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FeedList } from './FeedList';

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

const makePosts = (count: number, startId = 1) =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Post ${startId + i}`,
    body: `Body of post ${startId + i}`,
    userId: 1,
  }));

const makeUser = () => ({
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  image: 'https://dummyjson.com/icon/janedoe/128',
});

const mockFetch = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallbacks: IntersectionCallback[] = [];

beforeEach(() => {
  intersectionCallbacks = [];
  vi.stubGlobal('fetch', mockFetch);

  const MockIntersectionObserver = vi.fn(function (this: unknown, callback: IntersectionCallback) {
    intersectionCallbacks.push(callback);
    return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
  });
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const makePaginatedResponse = (posts: ReturnType<typeof makePosts>, total: number, skip = 0) =>
  new Response(JSON.stringify({ posts, total, skip, limit: 20 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const makeUserResponse = () =>
  new Response(JSON.stringify(makeUser()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

describe('FeedList integration', () => {
  it('renders 20 posts on initial load', async () => {
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts')) return Promise.resolve(makePaginatedResponse(makePosts(20), 40));
      if (url.includes('/users')) return Promise.resolve(makeUserResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithProviders(<FeedList />);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(20);
    });
  });

  it('loads next 20 posts when sentinel intersects (scroll simulation)', async () => {
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts')) {
        const params = new URL(url).searchParams;
        const skip = Number(params.get('skip') ?? 0);
        const posts = makePosts(20, skip + 1);
        return Promise.resolve(makePaginatedResponse(posts, 40, skip));
      }
      if (url.includes('/users')) return Promise.resolve(makeUserResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithProviders(<FeedList />);

    // Wait for first page (20 posts)
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(20);
    });

    // Trigger scroll — simulate intersection observer
    act(() => {
      intersectionCallbacks.forEach((cb) => {
        cb([{ isIntersecting: true } as IntersectionObserverEntry]);
      });
    });

    // Wait for second page (40 total)
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(40);
    });
  });

  it('shows skeleton while loading', () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    renderWithProviders(<FeedList />);

    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows error message when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<FeedList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });
  });

  it('renders a new post at the top with data-new attribute when addNewPost is dispatched', async () => {
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts')) return Promise.resolve(makePaginatedResponse(makePosts(2), 40));
      if (url.includes('/users')) return Promise.resolve(makeUserResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const { store } = renderWithProviders(<FeedList />);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });

    // Directly dispatch — simulates what useNewPostSimulator does
    act(() => {
      store.dispatch({
        type: 'feed/addNewPost',
        payload: { id: 10001, title: 'Simulated Post', body: 'Just happened', userId: 1 },
      });
    });

    await waitFor(() => {
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);
      expect(articles[0]).toHaveAttribute('data-new', 'true');
      expect(articles[0].className).toContain('new-post-enter');
    });
  });
});
