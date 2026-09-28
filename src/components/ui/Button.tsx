'use client';

import React from 'react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 * Variant meanings are load-bearing for the CTA hierarchy — exactly one
 * `primary` per viewport, and track colour is never decorative:
 *
 *  - `primary`      solid champagne. The single highest-intent action.
 *  - `track-gimun`  solid brand red. GIMUN-scoped actions only.
 *  - `track-moot`   champagne outline. GMC-scoped actions only. Previously
 *                   rendered the identical gold gradient as `primary`, which
 *                   made the two indistinguishable and collapsed the hierarchy
 *                   wherever they appeared together — as they do on the
 *                   homepage and in every closing CTA.
 *  - `secondary`    glass. Supporting actions.
 *  - `ghost`        text only. Tertiary.
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
  const isHighIntent =
    variant === 'primary' || variant === 'track-gimun' || variant === 'track-moot';
  const resolvedShape = shape || (isHighIntent ? 'pill' : 'rounded');
  const isDisabled = disabled || loading;

  const baseStyles =
    'group relative inline-flex items-center justify-center font-medium select-none cursor-pointer ' +
    'transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-brand)] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ' +
    'active:translate-y-px disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed';

  const shapeStyles =
    resolvedShape === 'pill'
      ? 'rounded-full'
      : { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-xl' }[size];

  const sizeStyles = {
    sm: 'h-8 px-3.5 text-xs gap-1.5',
    md: 'h-10 px-5 text-sm gap-2',
    lg: 'h-12 px-6 text-[0.9375rem] gap-2',
  }[size];

  // Flat fills and hairline outlines only. The previous gradient-plus-glow
  // treatment on three of these five variants was the single loudest
  // generated-UI signal in the build, and it made `primary` and `track-moot`
  // visually identical, which collapsed the CTA hierarchy wherever they met.
  const variantStyles = {
    primary: 'bg-champagne text-canvas font-semibold hover:bg-champagne-hi',
    secondary:
      'bg-transparent text-text border border-line-2 hover:border-line-3 hover:bg-champagne/5 font-medium',
    'track-gimun':
      'bg-brand text-champagne-hi font-semibold border border-crimson/30 hover:bg-brand-lit hover:border-crimson/60',
    'track-moot':
      'bg-transparent text-champagne font-semibold border border-champagne/55 hover:bg-champagne hover:text-canvas',
    ghost: 'text-text-3 hover:text-text hover:bg-champagne/8 font-medium',
  }[variant];

  const classes = cn(
    baseStyles,
    shapeStyles,
    sizeStyles,
    variantStyles,
    fullWidth && 'w-full',
    className
  );

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  const effectiveIcon = loading ? (
    <Loader2 className={cn(iconSize, 'animate-spin')} />
  ) : (
    icon || (withArrow ? <ArrowRight className={iconSize} /> : null)
  );

  const content = (
    <>
      <span>{children}</span>
      {effectiveIcon && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center transition-transform duration-200',
            !loading && 'group-hover:translate-x-0.5'
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
    <button
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );

}

export default Button;
