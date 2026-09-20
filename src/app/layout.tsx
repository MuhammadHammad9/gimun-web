import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { SiteConfigProvider } from '@/components/SiteConfigProvider';
import { getSiteConfig, getAnnouncements, getSponsors } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ReducedMotionProvider } from '@/components/motion/ReducedMotionProvider';
import { getAnalyticsMeasurementId } from '@/lib/site-config';

const satoshi = localFont({
  src: '../assets/fonts/Satoshi-Variable.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '300 900',
});

const generalSans = localFont({
  src: '../assets/fonts/GeneralSans-Variable.woff2',
  variable: '--font-body-sans',
  display: 'swap',
  weight: '200 700',
});

const jetbrainsMono = localFont({
  src: '../assets/fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: '400 600',
});

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata(); }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = (await getSiteConfig());
  const announcements = (await getAnnouncements());
  const sponsors = (await getSponsors());

  const activeAnnouncement =
    announcements.find((a) => a.pinnedFlag) || announcements[0];

  return (
    <html lang="en" className={`${satoshi.variable} ${generalSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-canvas text-text antialiased selection:bg-champagne selection:text-canvas">
        <ReducedMotionProvider>
          <GoogleAnalytics measurementId={getAnalyticsMeasurementId()} />
          <SiteConfigProvider value={siteConfig}>
            <SiteChrome site={siteConfig} announcement={activeAnnouncement} sponsors={sponsors}>{children}</SiteChrome>
          </SiteConfigProvider>
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
