import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PostDetail } from './PostDetail';

const mockFetch = vi.fn();

const makePost = () => ({
  id: 1,
  title: 'A full post title',
  body: 'This is the full untruncated body of the post. It contains much more text than what appears in the feed card.',
  userId: 1,
});

const makeAuthor = () => ({
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  image: 'https://dummyjson.com/icon/janedoe/128',
});

const makePostResponse = () =>
  new Response(JSON.stringify(makePost()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const makeAuthorResponse = () =>
  new Response(JSON.stringify(makeAuthor()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('PostDetail', () => {
  it('renders title and full body after loading', async () => {
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts/')) return Promise.resolve(makePostResponse());
      if (url.includes('/users/')) return Promise.resolve(makeAuthorResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithProviders(<PostDetail postId={1} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A full post title');
    });

    expect(screen.getByText(makePost().body)).toBeInTheDocument();
  });

  it('renders author name and avatar after loading', async () => {
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts/')) return Promise.resolve(makePostResponse());
      if (url.includes('/users/')) return Promise.resolve(makeAuthorResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithProviders(<PostDetail postId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Jane Doe avatar')).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    renderWithProviders(<PostDetail postId={1} />);

    const skeleton = screen.getByLabelText('Loading post');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('shows error message when post fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<PostDetail postId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load post/i)).toBeInTheDocument();
    });
  });

  it('does not truncate the body text', async () => {
    const longBody = 'A'.repeat(300);
    mockFetch.mockImplementation((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/posts/')) {
        return Promise.resolve(
          new Response(JSON.stringify({ ...makePost(), body: longBody }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (url.includes('/users/')) return Promise.resolve(makeAuthorResponse());
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    renderWithProviders(<PostDetail postId={1} />);

    await waitFor(() => {
      expect(screen.getByText(longBody)).toBeInTheDocument();
    });
  });
});
