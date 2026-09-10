import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { getSiteConfig, getAnnouncements, getSponsors } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F8F8FC] text-[#1A1A2E] antialiased selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
        {/* Top Dismissible Announcement Banner */}
        <AnnouncementBanner announcement={activeAnnouncement} />

        {/* Fluid Island Persistent Navigation */}
        <Navbar siteConfig={siteConfig} />

        {/* Main Content Area */}
        <main className="flex-1 w-full">{children}</main>

        {/* Global Multi-column Footer */}
        <Footer siteConfig={siteConfig} sponsors={sponsors} />
      </body>
    </html>
  );
}
