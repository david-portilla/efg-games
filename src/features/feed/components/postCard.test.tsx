import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { Post } from '../types';
import type { Author } from '@/features/users/types';

const mockPost: Post = {
  id: 1,
  title: 'Test Post Title',
  body: 'This is the body of the test post.',
  userId: 1,
};

const mockAuthor: Author = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  image: 'https://dummyjson.com/icon/janedoe/128',
};

const longBody = 'a'.repeat(120);

describe('PostCard', () => {
  it('renders the post title', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders the post body', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    expect(screen.getByText(mockPost.body)).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('truncates body longer than 100 characters', () => {
    const post = { ...mockPost, body: longBody };
    render(<PostCard post={post} author={mockAuthor} />);
    expect(screen.getByText(`${'a'.repeat(100)}...`)).toBeInTheDocument();
  });

  it('does not truncate body shorter than or equal to 100 characters', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    expect(screen.getByText(mockPost.body)).toBeInTheDocument();
    expect(screen.queryByText(/\.\.\.$/)).not.toBeInTheDocument();
  });

  it('links to the correct post detail page', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    const link = screen.getByRole('link', { name: /Read post: Test Post Title/i });
    expect(link).toHaveAttribute('href', '/post/1');
  });

  it('shows a skeleton placeholder when author is undefined', () => {
    const { container } = render(<PostCard post={mockPost} author={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders the author avatar when author is defined', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);
    const avatar = screen.getByAltText('Jane Doe avatar');
    expect(avatar).toBeInTheDocument();
  });
});
