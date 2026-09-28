import React, { useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Sponsor } from '@/lib/types';

export interface SponsorStripProps {
  sponsors: Sponsor[];
  /** Optional heading rendered above the marquee. Omit when the page supplies one. */
  title?: string;
  className?: string;
}

/**
 * Continuous partner marquee.
 *
 * Logos run at reduced opacity and resolve on hover, which is the convention
 * for a partner band — boxing each sponsor in its own bordered card, as this
 * previously did, reads as a placeholder grid rather than an endorsement.
 *
 * The track is duplicated once and translated by exactly -50%, so the loop is
 * seamless. Only the first copy is reachable by keyboard or screen reader; the
 * duplicate is inert.
 */
export function SponsorStrip({ sponsors, title, className }: SponsorStripProps) {
  const pauseId = useId();
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  const lane = [...sponsors, ...sponsors];

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <p className="mb-8 px-4 text-center font-mono text-meta uppercase tracking-[0.14em] text-text-4">
          {title}
        </p>
      )}

      {/* WCAG 2.2.2: moving content needs a pause control. CSS-only, so the
          strip stays a server component. */}
      <input
        id={pauseId}
        type="checkbox"
        className="marquee-pause peer sr-only"
      />
      <div className="marquee-clip mask-gradient">
        <div className="animate-marquee flex items-center gap-14 sm:gap-20">
          {lane.map((sponsor, idx) => {
            const isDuplicate = idx >= sponsors.length;
            return (
              <Link
                key={`${sponsor.id}-${idx}`}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isDuplicate ? -1 : undefined}
                aria-hidden={isDuplicate || undefined}
                title={sponsor.name}
                className="group flex shrink-0 items-center"
              >
                <Image
                  src={sponsor.logo}
                  alt={isDuplicate ? '' : sponsor.name}
                  width={400}
                  height={140}
                  sizes="160px"
                  loading="lazy"
                  className="h-8 w-auto opacity-45 transition-opacity duration-300 group-hover:opacity-90 sm:h-9"
                />
              </Link>
            );
          })}
        </div>
      </div>
      {/* peer-* variants reach sibling elements only, so they sit on this
          wrapper and style the label through it. */}
      <div className="mt-4 flex justify-center peer-checked:[&>label]:text-text-2 peer-focus-visible:[&>label]:ring-2 peer-focus-visible:[&>label]:ring-champagne">
        <label
          htmlFor={pauseId}
          className="inline-flex min-h-8 cursor-pointer items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-wider text-text-4 transition-colors hover:text-text-2"
        >
          Pause logo animation
        </label>
      </div>
    </div>
  );
}

export default SponsorStrip;
