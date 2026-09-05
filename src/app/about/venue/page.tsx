import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';
import { VenueClient } from './VenueClient';

export const metadata: Metadata = {
  title: 'Venue, Campus Guide & Travel Directions | GIKI Topi',
  description: 'Detailed visitor guide for GIKI Topi: M-1 motorway driving directions, airport shuttle schedules, student hostel accommodations, and campus security clearance protocols.',
};

export default function VenuePage() {
  const siteConfig = getSiteConfig();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-primary border border-slate-200">
            Campus Logistics
          </span>
          <span className="text-xs font-mono text-neutral-gray uppercase tracking-wider">
            PRD §18.2
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Venue, Travel & Campus Guide
        </h1>
        <p className="text-sm sm:text-base text-neutral-gray leading-relaxed">
          The Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI) provides a secure,
          picturesque, and technologically advanced backdrop for three days of intense diplomacy and judicial advocacy.
          Review transportation guidelines, security protocols, and on-campus facilities below.
        </p>
      </header>

      {/* Venue Client Island */}
      <VenueClient siteConfig={siteConfig} />
    </div>
  );
}
