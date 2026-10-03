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
  title: 'AssemblyOS — AI-Powered Spatial Intelligence & Digital Twins',
  description:
    'Turn real physical spaces, workshops, machinery, and equipment into interactive 3D digital twins with camera capture, AI vision, and spatial intelligence.',
  keywords: ['spatial intelligence', 'digital twins', 'AI vision', 'industrial inspection', '3D digital twin', 'spatial computing'],
  openGraph: {
    title: 'AssemblyOS — AI that sees. Understands. Guides.',
    description:
      'AssemblyOS transforms physical rooms, machines, and equipment into interactive 3D digital twins with real-time camera scanning, AI vision, and spatial inspection.',
    type: 'website',
    siteName: 'AssemblyOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AssemblyOS — AI-Powered Spatial Intelligence & Digital Twins',
    description:
      'Interactive 3D digital twins with camera scan, multi-photo machine inspection, and spatial copilot.',
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
