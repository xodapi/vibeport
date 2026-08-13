import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VibePort - Your LLM Development Portal',
  description: 'Beautiful dashboard for LLM development. Test models, monitor quotas, manage proxy, track costs—all in one place.',
  keywords: ['LLM', 'dashboard', 'VibeMode', 'proxy', 'quota', 'monitoring', 'AI', 'models'],
  authors: [{ name: 'xodapi' }],
  creator: 'xodapi',
  publisher: 'xodapi',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://github.com/xodapi/vibeport',
    title: 'VibePort - Your LLM Development Portal',
    description: 'Beautiful dashboard for LLM development',
    siteName: 'VibePort',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibePort - Your LLM Development Portal',
    description: 'Beautiful dashboard for LLM development',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
