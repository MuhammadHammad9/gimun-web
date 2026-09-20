import React from 'react';
import { cn } from '@/lib/utils';

export interface Placard {
  /** The delegation or role, e.g. "Russian Federation" or "Minister of Finance". */
  name: string;
  /** Committee abbreviation shown above the name, e.g. "UNSC". */
  chamber?: string;
}

/**
 * The field of delegate placards behind the masthead.
 *
 * The obvious move here was a mosaic of product screenshots, which is what the
 * reference site does — but this event has no product shots, and a grid of
 * stock photography would say nothing. Its actual visual signature is the name
 * card sitting on a committee desk, so the backdrop is a scattered field of
 * those, built from the real country allocations in `content/committees.json`.
 *
 * It is decorative and `aria-hidden`; the allocations are presented properly on
 * each committee page. Being plain DOM rather than images, it adds no network
 * requests to the masthead and cannot delay the headline's paint — the whole
 * field costs a few kilobytes of markup.
 *
 * The settle-on-scroll is CSS scroll-driven animation (`.warp`), so there is no
 * JavaScript and no main-thread scroll work.
 */
export function HeroMosaic({
  placards,
  className,
}: {
  placards: Placard[];
  className?: string;
}) {
  if (placards.length === 0) return null;

  // Enough to fill the field at desktop width without visible repetition.
  const filled = Array.from(
    { length: 24 },
    (_, i) => placards[i % placards.length]
  );

  return (
    <div aria-hidden="true" className={cn('warp', className)}>
      <div className="warp-grid">
        {filled.map((placard, i) => (
          <div key={`${placard.name}-${i}`} className="wtile">
            {placard.chamber && (
              <span className="wtile-chamber">{placard.chamber}</span>
            )}
            <span className="wtile-name">{placard.name}</span>
          </div>
        ))}
      </div>
      <div className="warp-veil" />
    </div>
  );
}

export default HeroMosaic;
