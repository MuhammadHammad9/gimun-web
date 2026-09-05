import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Venue & Travel | GIKI Campus Guide',
  description: 'Directions, shuttle services, campus maps, and accommodation details at GIKI, Topi.',
};

export default function VenuePage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-3">
        <span className="text-xs font-mono uppercase text-primary font-semibold">Campus & Travel</span>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-ink">
          Venue & Logistics
        </h1>
        <p className="text-neutral-gray text-base max-w-2xl">
          Everything you need to know about traveling to GIKI Topi, security protocols, and on-campus facilities.
        </p>
      </header>

      <div className="space-y-6">
        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">Campus Location</h2>
          <p className="text-sm text-neutral-gray">{config.venue}</p>
          <p className="text-sm text-neutral-gray leading-relaxed">
            GIKI is situated in the scenic district of Swabi, Khyber Pakhtunkhwa, adjacent to the Tarbela Dam reservoir. The campus is approximately 90 minutes from Islamabad via the M1 Motorway (Swabi Interchange).
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">Official Shuttles</h2>
          <p className="text-sm text-neutral-gray leading-relaxed">
            Designated shuttle transport is arranged for confirmed delegations arriving at Islamabad International Airport (ISB) and Rawalpindi/Peshawar bus terminals on the morning of Day 1.
          </p>
        </div>

        <div className="p-6 rounded-card bg-surface-elevated border border-whisper-border shadow-card space-y-3">
          <h2 className="text-xl font-heading font-bold text-ink">Hostel Accommodation</h2>
          <p className="text-sm text-neutral-gray leading-relaxed">
            All registered participants are assigned residential rooms within student hostels. Separate male and female wings are enforced with 24/7 security oversight.
          </p>
        </div>
      </div>
    </div>
  );
}
