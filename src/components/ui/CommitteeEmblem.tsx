import { cn } from '@/lib/utils';

/**
 * The official emblem of each GIMUN 26 committee. The PNGs in
 * public/images/committees are single-colour masks, so the ink follows the
 * theme (--color-emblem): warm gold on dark grounds, a deeper gold on light
 * ones. Size it by height; the width follows. Decorative: the committee's
 * name is always beside it.
 */
const EMBLEMS: Record<string, { src: string; ratio: string }> = {
  unsc: { src: '/images/committees/unsc.png', ratio: '512 / 439' },
  unhrc: { src: '/images/committees/unhrc.png', ratio: '512 / 505' },
  disec: { src: '/images/committees/disec.png', ratio: '512 / 457' },
  unw: { src: '/images/committees/unw.png', ratio: '512 / 424' },
  pna: { src: '/images/committees/pna.png', ratio: '468 / 512' },
};

export function hasCommitteeEmblem(slug: string) {
  return slug in EMBLEMS;
}

export function CommitteeEmblem({ slug, className }: { slug: string; className?: string }) {
  const emblem = EMBLEMS[slug];
  if (!emblem) return null;
  return (
    <span
      aria-hidden="true"
      className={cn('committee-emblem', className)}
      style={{ aspectRatio: emblem.ratio, ['--emblem' as string]: `url('${emblem.src}')` }}
    />
  );
}
