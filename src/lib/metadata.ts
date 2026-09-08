import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';
import { getSiteUrl } from '@/lib/site-config';

export interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

export function constructMetadata({
  title,
  description = 'Two flagship collegiate student competitions. One unified digital home at Ghulam Ishaq Khan Institute (GIKI), Topi. Model United Nations diplomacy meets appellate moot court advocacy.',
  image = '/images/og/default.jpg',
  path = '',
}: MetadataProps = {}): Metadata {
  const siteConfig = getSiteConfig();
  const siteUrl = getSiteUrl();
  const defaultTitle = `${siteConfig?.eventNames?.combined || 'GIMUN & GMC'} | Official Website`;
  const resolvedTitle = title || defaultTitle;
  const url = `${siteUrl}${path}`;

  return {
    title: {
      default: resolvedTitle,
      template: `%s | ${siteConfig?.eventNames?.combined || 'GIMUN & GMC'}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteConfig?.eventNames?.combined || 'GIMUN & GMC',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'GIMUN & GMC — Where Diplomacy Meets the Courtroom',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [image],
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico' },
      ],
      apple: '/apple-icon.png',
    },
  };
}
