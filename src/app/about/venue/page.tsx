import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getSiteConfig } from "@/lib/content";
import { VenueClient } from "./VenueClient";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: "Venue, Campus Guide & Travel Directions | GIKI Topi",
  path: '/about/venue',
  description:
    "Detailed visitor guide for GIKI Topi: M-1 motorway driving directions, airport shuttle schedules, student hostel accommodations, and campus security clearance protocols.",
}); }

export default async function VenuePage() {
  const siteConfig = (await getSiteConfig());

  return (
    <div className="space-y-12">
      {/* Modern Atmospheric Venue Hero */}
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Venue' }]}
        title={'Venue, Travel & Campus Guide'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-text-2 border border-white/15">
                        <MapPin className="w-3.5 h-3.5 text-champagne" />
                        GIKI Campus Headquarters
                      </span>
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        Topi, Khyber Pakhtunkhwa
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        The Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI) provides a secure, picturesque, and technologically advanced collegiate backdrop nestled in the foothills of Topi. Review directions, airport shuttles, residential hostelling, and security checkpoint clearance below.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <Button
                          variant="track-moot"
                          href="https://maps.google.com/?q=Ghulam+Ishaq+Khan+Institute+of+Engineering+Sciences+and+Technology"
                          icon={<Navigation className="w-4 h-4" />}
                        >
                          Open in Google Maps
                        </Button>
                        <Button variant="secondary" href="/schedule">
                          Conference Schedule
                        </Button>
                      </div>
          </>
        }
      />

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <VenueClient siteConfig={siteConfig} />
      </div>
    </div>
  );
}
