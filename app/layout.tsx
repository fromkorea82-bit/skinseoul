import type { Metadata } from "next";
import { inter, notoSansKr } from './fonts';
import "./globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://skinseoul.vercel.app'),
  title: {
    default: 'SkinSEOUL - AI K-Beauty Skin Analysis',
    template: '%s | SkinSEOUL',
  },
  description:
    'Discover your perfect K-Beauty routine with AI-powered skin analysis. Get personalized Korean skincare product recommendations in seconds.',
  keywords: [
    'K-Beauty',
    'Korean skincare',
    'skin analysis',
    'AI beauty',
    'skincare recommendations',
    'Seoul beauty',
  ],
  authors: [{ name: 'SkinSEOUL' }],
  creator: 'SkinSEOUL',
  publisher: 'SkinSEOUL',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skinseoul.vercel.app',
    title: 'SkinSEOUL - AI K-Beauty Skin Analysis',
    description: 'AI-powered skin analysis with personalized K-Beauty recommendations',
    siteName: 'SkinSEOUL',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkinSEOUL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkinSEOUL - AI K-Beauty Skin Analysis',
    description: 'Discover your perfect K-Beauty routine with AI',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${notoSansKr.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
