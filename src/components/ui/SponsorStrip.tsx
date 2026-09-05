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
    <div className={cn('py-10 border-y border-gray-200/80 bg-white/50 backdrop-blur-sm overflow-hidden', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-[#5A5A6E] font-medium">
          {title}
        </p>
      </div>

      <div className="relative w-full overflow-hidden mask-gradient">
        <div className="animate-marquee flex items-center gap-12 sm:gap-16">
          {marqueeItems.map((sponsor, idx) => (
            <Link
              key={`${sponsor.id}-${idx}`}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 shrink-0 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 group"
              title={sponsor.name}
            >
              <div className="px-4 py-2 rounded-xl bg-white border border-gray-200/60 shadow-xs flex items-center justify-center min-w-[140px] h-[52px]">
                <span className="font-heading font-bold text-sm tracking-tight text-[#1E2A78] group-hover:text-[#FF6B35] transition-colors">
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
