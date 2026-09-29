import { cn } from '@/lib/utils';

/**
 * The shield, split down the middle: the globe for GIMUN (crimson) on the
 * left, the scales for GMC (champagne) on the right. Drawn on a 48-unit grid
 * so it holds together at 24px. Colours follow the theme. Decorative: the
 * brand name always sits beside it or in the link's accessible name.
 *
 * public/icon.svg and the PNG icons are the same drawing in fixed colours.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" className={cn('shrink-0', className)}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4 40 9.5V22c0 10.6-6.6 19.2-16 22C14.6 41.2 8 32.6 8 22V9.5Z" className="stroke-text-3" strokeWidth="2" />
        <path d="M24 12v26" className="stroke-line-2" strokeWidth="1.25" />
        <g className="stroke-crimson" strokeWidth="1.75">
          <path d="M24 15a9 9 0 0 0 0 18" />
          <path d="M24 15c-4.2 2.6-4.2 15.4 0 18" />
          <path d="M15 24h9" />
        </g>
        <g className="stroke-champagne" strokeWidth="1.75">
          <path d="M31 17.5V32M28 32h6M27.5 19.5h7" />
          <path d="M27.5 19.5 25.6 25M27.5 19.5 29.4 25M34.5 19.5 32.6 25M34.5 19.5 36.4 25" strokeWidth="1" />
          <path d="M25.3 25h4.4a2.2 1.5 0 0 1-4.4 0ZM32.3 25h4.4a2.2 1.5 0 0 1-4.4 0Z" />
        </g>
        <circle cx="31" cy="16" r="1.4" className="fill-champagne" />
      </g>
    </svg>
  );
}
