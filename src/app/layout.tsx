import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/shared/lib/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EFG Feed',
    template: '%s | EFG Feed',
  },
  description: 'A scrollable feed of posts with real-time updates.',
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <a
          href="#main-content"
          className="bg-accent text-text-primary fixed top-2 left-2 z-50 -translate-y-16 rounded px-3 py-1.5 text-sm font-medium transition-transform duration-150 focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
