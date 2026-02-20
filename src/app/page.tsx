import { redirect } from 'next/navigation';

// Redirect root to /feed — the actual entry point of the app.
export default function RootPage() {
  redirect('/feed');
}
