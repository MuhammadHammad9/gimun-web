import { cn } from '@/lib/utils';

/**
 * The shield: a laurel for GIMUN (crimson) and the scales for GMC
 * (champagne), from the site icon. Colours follow the theme, so the mark
 * stays legible on paper as well as on maroon. Decorative: the brand name
 * always sits beside it or in the link's accessible name.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" className={cn('shrink-0', className)}>
      <path
        d="M24 4L40 10V22C40 32.5 33.2 42 24 44C14.8 42 8 32.5 8 22V10L24 4Z"
        className="stroke-text-3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 18C14.5 20.5 14.5 24 16 27C17 29 19 30.5 21 31.5M14 20C12 21.5 12 23.5 14 25M17 14C15.5 15.5 15.5 17 17 18.5"
        className="stroke-crimson"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 14V34M20 34H28M19 18H29M29 18L33 24M25 24H33M33 24L31 28M32 18C33.5 20.5 33.5 24 32 27"
        className="stroke-champagne"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="14" r="2" className="fill-champagne" />
    </svg>
  );
}
