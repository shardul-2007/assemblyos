import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AssemblyOS — AI-Powered 3D Assembly Guidance',
  description:
    'Explore, understand and assemble complex products through interactive 3D models and an AI-powered assembly copilot.',
  keywords: ['3D assembly', 'AI guidance', 'product assembly', 'interactive 3D', 'spatial computing'],
  openGraph: {
    title: 'AssemblyOS — AI that sees. Understands. Guides.',
    description:
      'AssemblyOS transforms complex products into interactive 3D assembly experiences with AI-guided instructions, spatial visualization and intelligent verification.',
    type: 'website',
    siteName: 'AssemblyOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AssemblyOS — AI-Powered 3D Assembly Guidance',
    description:
      'Interactive 3D assembly with AI copilot, exploded views, and visual guidance.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
