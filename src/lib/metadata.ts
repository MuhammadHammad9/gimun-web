import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';

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
  const defaultTitle = `${siteConfig?.eventNames?.combined || 'GIMUN & GIKI Moot Cup'} | Official Website`;
  const resolvedTitle = title || defaultTitle;
  const url = `https://gimungiki.org${path}`;

  return {
    title: {
      default: resolvedTitle,
      template: `%s | ${siteConfig?.eventNames?.combined || 'GIMUN & GIKI Moot Cup'}`,
    },
    description,
    metadataBase: new URL('https://gimungiki.org'),
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteConfig?.eventNames?.combined || 'GIMUN & GIKI Moot Cup',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'GIMUN & GIKI Moot Cup — Where Diplomacy Meets the Courtroom',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}
