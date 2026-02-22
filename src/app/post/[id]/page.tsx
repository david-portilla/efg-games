import Link from 'next/link';
import { PostDetail } from '@/features/post';

interface PostPageProps {
  params: Promise<{ id: string }>;
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
            className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1 text-sm transition-colors duration-200"
          >
            ← Back
          </Link>
        </nav>
        <PostDetail postId={postId} />
      </div>
    </main>
  );
}
