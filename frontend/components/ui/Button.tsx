'use client';

import React from 'react';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@frontend/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded';
  withArrow?: boolean;
  href?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** Swaps the icon for a spinner and blocks interaction. */
  loading?: boolean;
}

/**
 * The site's only button.
 *
 * Variant meanings carry the CTA hierarchy, and track colour is never
 * decorative:
 *
 *  - `primary`      solid champagne (brown in the light theme). One per view.
 *  - `track-gimun`  solid crimson. GIMUN actions only.
 *  - `track-moot`   champagne outline, filling on hover. GMC actions only.
 *  - `secondary`    hairline outline. Supporting actions.
 *  - `ghost`        text only. Tertiary.
 *
 * Every colour comes from theme tokens, so each variant stays legible in
 * both themes and inside any chapter tone. High-intent buttons carry their
 * icon in its own small disc, which nudges forward on hover.
 */
export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  shape,
  withArrow = false,
  href,
  icon,
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isHighIntent = variant === 'primary' || variant === 'track-gimun' || variant === 'track-moot';
  const resolvedShape = shape || (isHighIntent ? 'pill' : 'rounded');
  const isDisabled = disabled || loading;

  const baseStyles =
    'group relative inline-flex items-center justify-center font-medium select-none cursor-pointer whitespace-nowrap ' +
    'transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-brand)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ' +
    'active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed';

  const shapeStyles = resolvedShape === 'pill' ? 'rounded-full' : { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl' }[size];

  const sizeStyles = {
    sm: 'min-h-9 px-4 text-[0.8125rem] gap-2',
    md: 'min-h-11 px-5 text-sm gap-2.5',
    lg: 'min-h-13 px-6 text-[0.9375rem] gap-3',
  }[size];

  const variantStyles = {
    primary: 'bg-champagne text-on-accent font-semibold hover:bg-champagne-hi',
    secondary: 'bg-transparent text-text border border-line-2 hover:border-line-3 hover:bg-text/5',
    'track-gimun': 'bg-gimun-fill text-on-gimun font-semibold hover:bg-gimun-fill-hi',
    'track-moot': 'bg-transparent text-champagne font-semibold border border-champagne/60 hover:bg-champagne hover:text-on-accent',
    ghost: 'text-text-2 hover:text-text hover:bg-text/6',
  }[variant];

  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const effectiveIcon = loading ? (
    <Loader2 aria-hidden="true" className={cn(iconSize, 'animate-spin')} />
  ) : (
    icon ||
    (withArrow ? (
      // Two arrows in one slot: on hover the first steps out and the second steps in.
      <span className="btn-arrow">
        <ArrowRight aria-hidden="true" strokeWidth={1.75} className={iconSize} />
        <ArrowRight aria-hidden="true" strokeWidth={1.75} className={iconSize} />
      </span>
    ) : null)
  );

  // The disc only on pill-shaped high-intent buttons; elsewhere the icon sits inline.
  const disc = isHighIntent && resolvedShape === 'pill' && size !== 'sm' && Boolean(effectiveIcon);

  const classes = cn(baseStyles, shapeStyles, sizeStyles, variantStyles, disc && 'pr-1.5', fullWidth && 'w-full', className);

  const content = (
    <>
      <span>{children}</span>
      {effectiveIcon && (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex shrink-0 items-center justify-center transition-transform duration-300 ease-[var(--ease-out-expo)]',
            disc && (size === 'lg' ? 'size-10 rounded-full bg-current/12' : 'size-8 rounded-full bg-current/12'),
            !loading && !(withArrow && !icon) && 'group-hover:translate-x-0.5',
          )}
        >
          {effectiveIcon}
        </span>
      )}
    </>
  );

  return href ? (
    <Link
      {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      href={href}
      className={classes}
      aria-disabled={isDisabled || undefined}
      onClick={
        isDisabled
          ? (event) => event.preventDefault()
          : (props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>)
      }
    >
      {content}
    </Link>
  ) : (
    <button className={classes} disabled={isDisabled} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}

export default Button;
