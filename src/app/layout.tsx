import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { getSiteConfig, getAnnouncements, getSponsors } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { getAnalyticsMeasurementId } from '@/lib/site-config';

const outfit = localFont({
  src: '../assets/fonts/Outfit-Variable.woff2',
  variable: '--font-outfit',
  display: 'swap',
  weight: '400 800',
});

const inter = localFont({
  src: '../assets/fonts/Inter-Variable.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '400 700',
});

const jetbrainsMono = localFont({
  src: '../assets/fonts/JetBrainsMono-Variable.woff2',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: '400 600',
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = getSiteConfig();
  const announcements = getAnnouncements();
  const sponsors = getSponsors();

  const activeAnnouncement =
    announcements.find((a) => a.pinnedFlag) || announcements[0];

  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[#F8F8FC] text-[#1A1A2E] antialiased selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
        <GoogleAnalytics measurementId={getAnalyticsMeasurementId()} />
        {/* Top Dismissible Announcement Banner */}
        <div className="print:hidden">
          <AnnouncementBanner announcement={activeAnnouncement} />
        </div>

        {/* Fluid Island Persistent Navigation */}
        <div className="print:hidden">
          <Navbar siteConfig={siteConfig} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full print:p-0 print:m-0">{children}</main>

        {/* Global Multi-column Footer */}
        <div className="print:hidden">
          <Footer siteConfig={siteConfig} sponsors={sponsors} />
        </div>
      </body>
    </html>
  );
}
