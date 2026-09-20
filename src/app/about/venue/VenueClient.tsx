'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Bus,
  Car,
  ShieldAlert,
  Building2,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  Compass,
  Navigation,
} from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

interface VenueClientProps {
  siteConfig: SiteConfig;
}

type FacilityKey = 'auditorium' | 'courtrooms' | 'committees' | 'hostels' | 'dining' | 'sports';
type TransitKey = 'air' | 'bus' | 'road';

interface FacilityInfo {
  title: string;
  subtitle: string;
  badge: string;
  track?: 'gimun' | 'moot-cup' | 'shared';
  description: string;
  features: string[];
  capacity: string;
  locationDetails: string;
}

const FACILITIES: Record<FacilityKey, FacilityInfo> = {
  auditorium: {
    title: 'Aga Khan Main Auditorium',
    subtitle: 'Plenary Hall & Gala Ceremonies',
    badge: 'Flagship Plenary',
    track: 'shared',
    description:
      'The premier assembly hall of GIKI, featuring state-of-the-art acoustic staging, simultaneous translation booths, and theatre seating. Host to the Grand Opening Ceremony, Diplomatic Keynotes, and the Awards Gala.',
    features: [
      'Dolby acoustic staging & dual 4K visual display arrays',
      'Presidential dais seating for judicial and diplomatic guests',
      'High-bandwidth Wi-Fi for all attending delegations',
      'Air-conditioned plenary chamber with Tier-1 security access',
    ],
    capacity: '850+ Seated Delegates',
    locationDetails: 'Central Campus Complex, adjacent to the Administration Block',
  },
  courtrooms: {
    title: 'GIKI Appellate Courtroom Chambers',
    subtitle: 'High-Stakes Moot Pleading Benches',
    badge: 'Moot Court Track',
    track: 'moot-cup',
    description:
      'Modeled after traditional appellate courts, these dedicated chambers feature raised judicial benches for evaluators, counsel podiums, official timekeeping clocks, and gallery seating for observers and researchers.',
    features: [
      'Elevated five-judge bench with formal judicial gavels',
      'Dual opposing counsel lecterns with countdown pleading lights',
      'Stenographic audio recording for match archival and review',
      'Dedicated deliberation chambers for judicial score tabulation',
    ],
    capacity: '3 Moot Chambers (60 Observers per Chamber)',
    locationDetails: 'Faculty of Electrical Engineering (FEE) Ground Wing',
  },
  committees: {
    title: 'Specialized Committee Amphitheatres',
    subtitle: 'GIMUN Multilateral Debate Chambers',
    badge: 'GIMUN Track',
    track: 'gimun',
    description:
      'Tiered amphitheaters configured for multilateral diplomacy. Each committee chamber features designated delegation desks, microphone consoles, rapporteur podiums, and dedicated crisis backroom monitoring suites.',
    features: [
      'U-shaped diplomatic desk arrangement by country alphabet',
      'Dual projection screens for working papers and draft resolutions',
      'Direct secure runner dispatch channels to Crisis Command',
      'Microphone paging and unmoderated caucus collaboration zones',
    ],
    capacity: '4 Dedicated Amphitheatres (40–120 Delegates each)',
    locationDetails: 'Faculty of Computer Science & Engineering (FCSE)',
  },
  hostels: {
    title: 'On-Campus Student Residential Hostels',
    subtitle: 'Secure Boarding & Outstation Lodging',
    badge: 'Delegation Lodging',
    track: 'shared',
    description:
      'Comfortable, furnished residential rooms allocated exclusively to outstation delegations. Hostels feature 24/7 surveillance, separate gender-segregated wings, hot water, and dedicated common discussion halls.',
    features: [
      'Strictly segregated male and female residential hostel blocks',
      'Furnished rooms with bedding, mattresses, and study desks',
      '24/7 dedicated security guards and warden supervision',
      'High-speed campus eduroam / GIKI-Guest Wi-Fi network',
    ],
    capacity: '600+ Outstation Delegate Beds',
    locationDetails: 'Hostels 4, 8 & 12 (North & South Residential Zones)',
  },
  dining: {
    title: 'Central Mess & Executive Faculty Club',
    subtitle: 'Catered Meals & Formal Receptions',
    badge: 'Catering & Dining',
    track: 'shared',
    description:
      'All delegate registrations include three daily hygienic, freshly prepared meals (breakfast, lunch, and formal dinner) alongside afternoon coffee and green tea breaks served in landscaped courtyards.',
    features: [
      'Standardized halal cuisine with certified hygiene standards',
      'Vegetarian and allergy-accommodated meal service counters',
      'Evening formal delegate networking dinner and gala banquet',
      'Outdoor refreshment lawns during unmoderated caucus intervals',
    ],
    capacity: 'Over 1,000 Meals Served Simultaneously',
    locationDetails: 'GIKI Central Student Dining Complex',
  },
  sports: {
    title: 'Open Air Amphitheatre & Sports Complex',
    subtitle: 'Cultural Night & Recreation',
    badge: 'Evening Socials',
    track: 'shared',
    description:
      'Surrounded by the Himalayan foothills, the GIKI Open Air Theatre hosts the annual Cultural Night, celebrating traditional Pashtun hospitality, live musical performances, and delegate social mixers.',
    features: [
      'Open-air amphitheatre with stage lighting and live acoustic setup',
      'Olympic-sized swimming pool, indoor badminton and squash courts',
      'Floodlit basketball and futsal courts available post-session',
      'Safe perimeter walking tracks alongside Tarbela reservoir views',
    ],
    capacity: '1,200 Delegates & Students',
    locationDetails: 'Sports & Recreational Pavilion, GIKI Lakefront',
  },
};

export function VenueClient({ siteConfig }: VenueClientProps) {
  const [activeFacility, setActiveFacility] = useState<FacilityKey>('auditorium');
  const [activeTransit, setActiveTransit] = useState<TransitKey>('air');

  const currentFacility = FACILITIES[activeFacility];

  return (
    <div className="space-y-12">
      {/* Top Hero Banner & Coordinates Card */}
      <div className="p-6 md:p-10 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-champagne/15">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Campus Headquarters
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-cream">
              Ghulam Ishaq Khan Institute (GIKI)
            </h2>
            <p className="text-xs sm:text-sm text-champagne/80 max-w-xl leading-relaxed">
              Nestled in the tranquil foothills of Topi, Swabi, GIKI is one of Pakistan&apos;s most prestigious
              engineering and research universities, offering a world-class academic environment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="https://maps.google.com/?q=Ghulam+Ishaq+Khan+Institute+of+Engineering+Sciences+and+Technology"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest text-xs font-bold hover:brightness-110 transition-all shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <div className="p-3 rounded-xl bg-crest border border-champagne/30 text-center">
              <span className="text-[10px] font-mono uppercase text-champagne/70 block">
                GPS Coordinates
              </span>
              <span className="text-xs font-mono font-bold text-cream">
                34.0700° N, 72.6450° E
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-xl bg-crest/70 border border-champagne/20 space-y-1">
            <span className="text-[11px] font-mono uppercase text-champagne/70 block">Travel From ISB</span>
            <span className="text-sm font-heading font-bold text-cream">~90 Minutes</span>
          </div>
          <div className="p-3.5 rounded-xl bg-crest/70 border border-champagne/20 space-y-1">
            <span className="text-[11px] font-mono uppercase text-champagne/70 block">Motorway Route</span>
            <span className="text-sm font-heading font-bold text-cream">M-1 Swabi Exit</span>
          </div>
          <div className="p-3.5 rounded-xl bg-crest/70 border border-champagne/20 space-y-1">
            <span className="text-[11px] font-mono uppercase text-champagne/70 block">Campus Security</span>
            <span className="text-sm font-heading font-bold text-cream">24/7 Gated Access</span>
          </div>
          <div className="p-3.5 rounded-xl bg-crest/70 border border-champagne/20 space-y-1">
            <span className="text-[11px] font-mono uppercase text-champagne/70 block">Outstation Boarding</span>
            <span className="text-sm font-heading font-bold text-cream">Included On-Campus</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Interactive Campus Facility Explorer */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-champagne" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Facility Walkthrough
            </span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-cream">
            Interactive Venue &amp; Chamber Directory
          </h2>
          <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl">
            Explore the specialized academic arenas, courtrooms, residential hostels, and dining halls
            utilized during the four-day competition.
          </p>
        </div>

        {/* Facility Segmented Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-overlay/90 border border-champagne/20 shadow-inner">
          {(
            [
              { key: 'auditorium', label: 'Main Auditorium' },
              { key: 'courtrooms', label: 'Moot Courtrooms' },
              { key: 'committees', label: 'Committee Chambers' },
              { key: 'hostels', label: 'Residential Hostels' },
              { key: 'dining', label: 'Dining Complex' },
              { key: 'sports', label: 'Open Air Amphitheatre' },
            ] as const
          ).map(({ key, label }) => {
            const isSelected = activeFacility === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFacility(key)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-linear-to-r from-champagne via-champagne-hi to-champagne-lo text-crest font-bold shadow-md'
                    : 'text-champagne/70 hover:text-cream'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Facility Detail Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFacility}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-8 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-champagne/15">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      currentFacility.track === 'gimun'
                        ? 'bg-champagne/20 text-cream border-champagne/40'
                        : currentFacility.track === 'moot-cup'
                        ? 'bg-brand text-cream border-champagne/30'
                        : 'bg-crest text-champagne border-champagne/30'
                    }`}
                  >
                    {currentFacility.badge}
                  </span>
                  <span className="text-xs font-mono text-champagne/70">
                    Capacity: <strong className="text-cream">{currentFacility.capacity}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-cream">
                  {currentFacility.title}
                </h3>
                <p className="text-xs text-champagne/80">{currentFacility.subtitle}</p>
              </div>

              <div className="text-xs font-mono text-champagne/80 bg-crest px-3.5 py-2 rounded-xl border border-champagne/25">
                <span className="block text-[10px] uppercase text-champagne/70 font-bold">Campus Wing</span>
                <span className="text-cream font-semibold">{currentFacility.locationDetails}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-champagne/90 leading-relaxed">
              {currentFacility.description}
            </p>

            {/* Key Amenities Checklist */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono uppercase font-bold text-champagne tracking-wider block">
                Chamber Specifications &amp; Features
              </span>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {currentFacility.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-champagne/90">
                    <CheckCircle2 className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* SECTION 2: Travel & Transit Guidelines */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-champagne" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-champagne">
              Travel Directions
            </span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-cream">
            Reaching GIKI Topi from Outstation
          </h2>
          <p className="text-xs sm:text-sm text-champagne/80 max-w-2xl">
            Detailed guidance for national and international delegations arriving by air, motorway, or intercity coaches.
          </p>
        </div>

        {/* Transit Mode Switcher */}
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTransit('air')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              activeTransit === 'air'
                ? 'bg-overlay border-champagne shadow-lg ring-1 ring-champagne/40 text-cream'
                : 'bg-overlay/60 border-champagne/20 hover:border-champagne/40 text-champagne'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-crest text-champagne flex items-center justify-center shrink-0 border border-champagne/25">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-cream block">By Commercial Flight</span>
              <span className="text-[11px] text-champagne/70">Via Islamabad Airport (ISB)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTransit('bus')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              activeTransit === 'bus'
                ? 'bg-overlay border-champagne shadow-lg ring-1 ring-champagne/40 text-cream'
                : 'bg-overlay/60 border-champagne/20 hover:border-champagne/40 text-champagne'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-crest text-champagne flex items-center justify-center shrink-0 border border-champagne/25">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-cream block">By Intercity Coach</span>
              <span className="text-[11px] text-champagne/70">Daewoo / Faisal Terminal</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTransit('road')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              activeTransit === 'road'
                ? 'bg-overlay border-champagne shadow-lg ring-1 ring-champagne/40 text-cream'
                : 'bg-overlay/60 border-champagne/20 hover:border-champagne/40 text-champagne'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-crest text-champagne flex items-center justify-center shrink-0 border border-champagne/25">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-cream block">By Motorway / Car</span>
              <span className="text-[11px] text-champagne/70">M-1 Swabi Interchange</span>
            </div>
          </button>
        </div>

        {/* Transit Detail Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-4">
          {activeTransit === 'air' && (
            <div className="space-y-3">
              <h3 className="text-base font-heading font-bold text-cream flex items-center gap-2">
                <Plane className="w-4 h-4 text-champagne" />
                <span>Flight Arrival Protocol — Islamabad International Airport (ISB)</span>
              </h3>
              <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
                Islamabad International Airport (ISB) is the closest commercial airport, located approximately 110 km
                from campus. Delegations arriving by air must forward their confirmed flight itinerary to the Transport
                Directorate at least 5 business days in advance.
              </p>
              <div className="p-4 rounded-xl bg-crest/70 border border-champagne/20 space-y-2 text-xs text-champagne/90">
                <div className="font-bold text-cream">Official Airport Shuttle Pickup:</div>
                <div>• Day 1 Morning Window: Shuttles depart ISB at 09:00 AM and 01:00 PM.</div>
                <div>• Delegations are received by student liaison officers at the Domestic/International Arrival lounge.</div>
                <div>• Travel time to GIKI Topi is approx. 90 minutes via Islamabad-Peshawar M-1 Motorway.</div>
              </div>
            </div>
          )}

          {activeTransit === 'bus' && (
            <div className="space-y-3">
              <h3 className="text-base font-heading font-bold text-cream flex items-center gap-2">
                <Bus className="w-4 h-4 text-champagne" />
                <span>Intercity Bus &amp; Coach Terminals</span>
              </h3>
              <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
                Delegations traveling via Daewoo Express, Faisal Movers, or Bilal Travels can arrive at Rawalpindi/Islamabad
                terminals or direct Swabi feeder coaches.
              </p>
              <div className="p-4 rounded-xl bg-crest/70 border border-champagne/20 space-y-2 text-xs text-champagne/90">
                <div className="font-bold text-cream">Bus Terminal Shuttle Points:</div>
                <div>• Daewoo Express 26 Number Terminal, Rawalpindi (Morning Pickup: 09:30 AM).</div>
                <div>• Swabi Motorway Interchange Bus Stop (On-call pickup every 60 minutes).</div>
                <div>• Direct local coasters to Topi run regularly from Pirwadhai Terminal, Rawalpindi.</div>
              </div>
            </div>
          )}

          {activeTransit === 'road' && (
            <div className="space-y-3">
              <h3 className="text-base font-heading font-bold text-cream flex items-center gap-2">
                <Car className="w-4 h-4 text-champagne" />
                <span>Driving Directions via M-1 Motorway</span>
              </h3>
              <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
                From Islamabad/Rawalpindi or Peshawar, take the M-1 Motorway. Take the <strong>Swabi Interchange (Exit 5)</strong>.
                From the toll plaza, head east on Topi-Swabi Road for 14 km directly to the GIKI Main Security Gate.
              </p>
              <div className="p-4 rounded-xl bg-crest/70 border border-champagne/20 space-y-2 text-xs text-champagne/90">
                <div className="font-bold text-cream">Self-Drive &amp; Private Vehicle Instructions:</div>
                <div>• All vehicles must stop at the outer security checkpoint for registration check.</div>
                <div>• University vans and hired coasters must submit driver CNIC and vehicle number beforehand.</div>
                <div>• Dedicated visitor parking is allocated inside Gate 1 near the Sports Complex.</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Security & Checkpoint Protocols */}
      <section className="p-6 md:p-8 rounded-2xl bg-overlay/90 border border-champagne/30 shadow-xl space-y-4 text-left">
        <div className="flex items-center gap-2 text-champagne font-bold font-heading text-base">
          <ShieldAlert className="w-5 h-5 text-champagne" />
          <span>Campus Security Protocols &amp; Identification Clearance</span>
        </div>
        <p className="text-xs sm:text-sm text-champagne/80 leading-relaxed">
          GIKI maintains rigorous perimeter and gate protocols to ensure maximum security for all visiting students.
          Please review the following entry mandates prior to arrival:
        </p>
        <div className="grid sm:grid-cols-3 gap-4 pt-1 text-xs text-champagne/90">
          <div className="p-4 rounded-xl bg-crest/80 border border-champagne/25 space-y-1">
            <strong className="block text-cream">Original Photo CNIC</strong>
            <span>All delegates aged 18+ must present original CNIC; delegates under 18 must present NADRA B-Form.</span>
          </div>
          <div className="p-4 rounded-xl bg-crest/80 border border-champagne/25 space-y-1">
            <strong className="block text-cream">Official Reference Pass</strong>
            <span>Print and carry your official GIMUN / GMC Registration Reference confirmation slip.</span>
          </div>
          <div className="p-4 rounded-xl bg-crest/80 border border-champagne/25 space-y-1">
            <strong className="block text-cream">Student ID Verification</strong>
            <span>Carry your current school, college, or university student identity card for pass validation.</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: Emergency Contacts & Local Essentials */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xl font-heading font-bold text-cream">
          On-Campus Essentials &amp; Emergency Contacts
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-champagne uppercase">
              <PhoneCall className="w-4 h-4 text-champagne" />
              <span>Campus Medical Centre</span>
            </div>
            <p className="text-xs text-champagne/80">
              Fully equipped 24/7 clinic with resident medical officers, emergency ambulance, and basic pharmacy.
            </p>
            <div className="text-xs font-mono font-bold text-cream pt-1">
              {siteConfig.contactPhone || 'Contact the Secretariat by email'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-champagne uppercase">
              <Building2 className="w-4 h-4 text-champagne" />
              <span>Banking &amp; ATM Facilities</span>
            </div>
            <p className="text-xs text-champagne/80">
              Habib Bank Limited (HBL) and Allied Bank branches located inside campus with 24/7 1Link cash ATMs.
            </p>
            <div className="text-xs font-mono font-bold text-cream pt-1">
              Location: Commercial Centre GIKI
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-overlay/90 border border-champagne/25 shadow-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-champagne uppercase">
              <Bus className="w-4 h-4 text-champagne" />
              <span>Transport Directorate Desk</span>
            </div>
            <p className="text-xs text-champagne/80">
              For emergency shuttle delays, flight rescheduled notifications, or luggage transit queries.
            </p>
            <div className="text-xs font-mono font-bold text-cream pt-1">
              {siteConfig.contactEmails.general}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
