import type { Metadata } from 'next';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { getSiteConfig, getAnnouncements, getSponsors } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
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
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-[#F8F8FC] text-[#1A1A2E] antialiased selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
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
