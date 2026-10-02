'use client';

import { useRenderedAt } from '@frontend/components/SiteConfigProvider';

const DAY = 86_400_000;

/**
 * "169 days to go", counted from the moment the page was rendered, so the
 * server HTML and the hydrated page always agree (no placeholder, no shift).
 * Pages refresh within a minute of any content change, which keeps it true.
 */
export function DaysToGo({ start, end }: { start: string; end: string }) {
  const now = useRenderedAt();
  const opens = new Date(`${start}T00:00:00+05:00`).getTime();
  const closes = new Date(`${end}T23:59:59+05:00`).getTime();
  if (!Number.isFinite(opens) || !Number.isFinite(closes)) return null;
  if (now > closes) return <span>The {new Date(opens).getUTCFullYear()} edition has ended</span>;
  if (now >= opens) return <span>Happening now</span>;
  const days = Math.ceil((opens - now) / DAY);
  return <span>{days === 1 ? '1 day to go' : `${days} days to go`}</span>;
}
