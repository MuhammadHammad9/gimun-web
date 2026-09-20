'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/motion/MagneticButton';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded';
  withArrow?: boolean;
  nestedIcon?: boolean;
  href?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** Leans toward the cursor on hover. Reserve for the one primary CTA. */
  magnetic?: boolean;
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
  nestedIcon = true,
  href,
  icon,
  fullWidth = false,
  magnetic = false,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isHighIntent =
    variant === 'primary' || variant === 'track-gimun' || variant === 'track-moot';
  const resolvedShape = shape || (isHighIntent ? 'pill' : 'rounded');
  const isDisabled = disabled || loading;

  const baseStyles =
    'group relative inline-flex items-center justify-center font-medium select-none cursor-pointer transition-[background-color,background-image,border-color,box-shadow,transform,color] duration-200 ease-[var(--ease-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const shapeStyles =
    resolvedShape === 'pill'
      ? 'rounded-full'
      : { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-[0.875rem]' }[size];

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-white via-champagne to-champagne-lo text-canvas font-bold border border-white/80 shadow-[0_4px_20px_-2px_rgba(236,216,183,0.45)] hover:shadow-[0_8px_30px_-2px_rgba(236,216,183,0.7)] hover:-translate-y-0.5',
    secondary:
      'bg-champagne/10 hover:bg-champagne/20 text-champagne hover:text-text border border-line-2 hover:border-line-3 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 font-semibold',
    'track-gimun':
      'bg-gradient-to-r from-brand via-brand-lit to-brand text-champagne-hi font-extrabold border border-crimson/40 hover:border-crimson/70 shadow-[0_4px_20px_-2px_rgba(94,18,5,0.45)] hover:shadow-[0_8px_30px_-2px_rgba(225,29,72,0.5)] hover:-translate-y-0.5',
    // Outline, not solid gold: this is a track-scoped action, and it has to
    // read one step below `primary` when they sit side by side.
    'track-moot':
      'bg-champagne/5 text-champagne font-extrabold border-2 border-champagne/60 hover:bg-champagne hover:text-canvas hover:border-champagne shadow-[0_4px_18px_-4px_rgba(236,216,183,0.35)] hover:shadow-[0_8px_30px_-2px_rgba(236,216,183,0.55)] hover:-translate-y-0.5',
    ghost: 'text-text-2 hover:text-text hover:bg-champagne/10 font-semibold',
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
            !loading && 'group-hover:translate-x-0.5',
            nestedIcon && isHighIntent
              ? cn(
                  'rounded-full',
                  size === 'sm'
                    ? 'w-4 h-4 -mr-0.5'
                    : size === 'lg'
                      ? 'w-6 h-6 -mr-1'
                      : 'w-5 h-5 -mr-0.5',
                  variant === 'track-gimun'
                    ? 'bg-white/20 text-white'
                    : variant === 'track-moot'
                      ? 'bg-champagne/20 text-current group-hover:bg-canvas/15'
                      : 'bg-black/10 text-current'
                )
              : ''
          )}
        >
          {effectiveIcon}
        </span>
      )}
    </>
  );

  const element = href ? (
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

  if (!magnetic) return element;

  return (
    <MagneticButton strength={8} className={fullWidth ? 'w-full' : undefined}>
      {element}
    </MagneticButton>
  );
}

export default Button;
