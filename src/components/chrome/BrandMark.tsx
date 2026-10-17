import { cn } from '@/lib/utils';

/**
 * The two official logos side by side: the GIMUN globe, then the GMC
 * courthouse. Each PNG in public/images/brand is used as a mask so the ink
 * follows the theme (--color-logo): package-cover cream on dark grounds, the
 * packages' exact maroon on light ones. Size it by height; the width follows.
 * Decorative: the brand name always sits beside it or in the link's
 * accessible name.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('brand-logos', className)}>
      <span className="brand-logos__logo brand-logos__logo--gimun" />
      <span className="brand-logos__logo brand-logos__logo--gmc" />
    </span>
  );
}
