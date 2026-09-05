import type { Metadata } from 'next';

export interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

export function constructMetadata({
  title = 'GIMUN & GIKI Moot Cup 2027 | Official Website',
  description = 'Two flagship collegiate student competitions. One unified digital home at Ghulam Ishaq Khan Institute (GIKI), Topi. Model United Nations diplomacy meets appellate moot court advocacy.',
  image = '/images/og/default.jpg',
  path = '',
}: MetadataProps = {}): Metadata {
  const url = `https://gimungiki.org${path}`;

  return {
    title: {
      default: title,
      template: '%s | GIMUN & GIKI Moot Cup',
    },
    description,
    metadataBase: new URL('https://gimungiki.org'),
    openGraph: {
      title,
      description,
      url,
      siteName: 'GIMUN & GIKI Moot Cup',
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
