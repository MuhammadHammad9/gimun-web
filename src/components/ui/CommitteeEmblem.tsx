import { cn } from '@/lib/utils';

/**
 * The official emblem of each GIMUN 26 committee. The PNGs in
 * public/images/committees are single-colour masks, so the ink follows the
 * theme (--color-emblem): warm gold on dark grounds, a deeper gold on light
 * ones. Size it by height; the width follows. Decorative: the committee's
 * name is always beside it.
 *
 * Served as alpha-only WebP copies (scripts/optimize-mask-images.mjs): 256px
 * tall for the placards (at most 76 CSS px), full size for a committee page's
 * hero (`large`, up to 208 CSS px).
 */
const EMBLEMS: Record<string, { base: string; ratio: string }> = {
  unsc: { base: '/images/committees/unsc', ratio: '512 / 439' },
  unhrc: { base: '/images/committees/unhrc', ratio: '512 / 505' },
  disec: { base: '/images/committees/disec', ratio: '512 / 457' },
  unw: { base: '/images/committees/unw', ratio: '512 / 424' },
  pna: { base: '/images/committees/pna', ratio: '468 / 512' },
};

export function hasCommitteeEmblem(slug: string) {
  return slug in EMBLEMS;
}

export function CommitteeEmblem({ slug, className, large = false }: { slug: string; className?: string; large?: boolean }) {
  const emblem = EMBLEMS[slug];
  if (!emblem) return null;
  return (
    <span
      aria-hidden="true"
      className={cn('committee-emblem', className)}
      style={{ aspectRatio: emblem.ratio, ['--emblem' as string]: `url('${emblem.base}${large ? '' : '-256'}.webp')` }}
    />
  );
}
