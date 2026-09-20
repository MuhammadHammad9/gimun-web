import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Sponsor } from '@/lib/types';

export interface SponsorStripProps {
  sponsors: Sponsor[];
  title?: string;
  className?: string;
}

export function SponsorStrip({
  sponsors,
  title = 'Proudly Supported By Institutional Partners & Sponsors',
  className,
}: SponsorStripProps) {
  if (!sponsors || sponsors.length === 0) {
    return null; // Graceful empty state (PRD §18.3)
  }

  // Duplicate sponsors for continuous marquee loop
  const marqueeItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <div className={cn('py-10 border-y border-champagne/20 bg-overlay/90 backdrop-blur-md overflow-hidden', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-champagne/80 font-bold">
          {title}
        </p>
      </div>

      <div className="relative w-full overflow-hidden mask-gradient">
        <div className="animate-marquee flex items-center gap-12 sm:gap-16">
          {marqueeItems.map((sponsor, idx) => (
            <Link
              key={`${sponsor.id}-${idx}`}
              href={sponsor.url}
              tabIndex={idx >= sponsors.length ? -1 : undefined}
              aria-hidden={idx >= sponsors.length ? true : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 shrink-0 opacity-80 hover:opacity-100 transition-all duration-300 group"
              title={sponsor.name}
            >
              <div className="px-5 py-2.5 rounded-xl bg-crest/80 border border-champagne/25 shadow-md flex items-center justify-center min-w-[140px] h-[52px] group-hover:border-champagne/50 transition-all">
                <span className="font-heading font-bold text-sm tracking-tight text-cream group-hover:text-champagne transition-colors">
                  {sponsor.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
