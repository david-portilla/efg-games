import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PostDetailErrorBoundary, PostDetailSkeleton } from '@/features/post';

// Why: dynamic import keeps PostDetail's JS out of the feed bundle — only
// loaded when the user navigates to a post. Skeleton shown during hydration.
const PostDetail = dynamic(() => import('@/features/post').then((m) => m.PostDetail), {
  loading: () => <PostDetailSkeleton />,
});

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(`https://dummyjson.com/posts/${id}?select=title`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return { title: 'Post' };
  const { title } = await res.json();
  return { title };
}

/** Thin wrapper — all logic lives in `features/post`. */
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return (
    <main className="bg-bg-primary min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <nav className="mb-6">
          <Link
            href="/feed"
            aria-label="Back to feed"
            className="text-text-secondary hover:text-text-primary inline-flex min-h-[44px] items-center gap-1 text-sm transition-colors duration-200"
          >
            ← Back
          </Link>
        </nav>
        <PostDetailErrorBoundary>
          <PostDetail postId={postId} />
        </PostDetailErrorBoundary>
      </div>
    </main>
  );
}
