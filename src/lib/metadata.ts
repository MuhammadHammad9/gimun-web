import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';
import { SHARE_IMAGES, type ShareImage } from '@/lib/share-images';
import { getSiteUrl } from '@/lib/site-config';

export interface MetadataProps {
  title?: string;
  description?: string;
  /** The link-preview image; see src/lib/share-images.ts. */
  image?: ShareImage;
  path?: string;
}

export async function constructMetadata({
  title,
  description = 'GIMUN 26 and GMC VII: GIKI Model United Nations and the GIKI Moot Cup, hosted by SOPHEP at Ghulam Ishaq Khan Institute (GIKI), Topi, from 4 to 6 December 2026.',
  image = SHARE_IMAGES.site,
  path = '',
}: MetadataProps = {}): Promise<Metadata> {
  const siteConfig = (await getSiteConfig());
  const siteUrl = getSiteUrl();
  const defaultTitle = `${siteConfig?.eventNames?.combined || 'GIMUN & GMC'} | Official Website`;
  const resolvedTitle = title || defaultTitle;
  const url = `${siteUrl}${path}`;

  return {
    // Page titles already carry the event name and year, so they are used as
    // written. Re-applying the layout template doubled the suffix
    // ("... | GIMUN & GMC 2027 | GIMUN & GMC 2027").
    title: title
      ? { absolute: title }
      : {
          default: resolvedTitle,
          template: `%s | ${siteConfig?.eventNames?.combined || 'GIMUN & GMC'}`,
        },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteConfig?.eventNames?.combined || 'GIMUN & GMC',
      images: [
        {
          url: image.url,
          secureUrl: new URL(image.url, siteUrl).href,
          type: 'image/jpeg',
          width: 1200,
          height: 630,
          alt: image.alt,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.ico' },
      ],
      apple: '/apple-icon.png',
    },
  };
}
