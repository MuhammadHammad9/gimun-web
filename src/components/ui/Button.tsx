'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-[0.5rem] gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-[0.75rem] gap-2',
    lg: 'px-7 py-3.5 text-base rounded-[0.875rem] gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#FF6B35] text-white hover:bg-[#E55A28] focus-visible:ring-[#FF6B35] shadow-[0_2px_12px_-2px_rgba(255,107,53,0.35)] hover:shadow-[0_4px_16px_-2px_rgba(255,107,53,0.45)] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'border-2 border-[#1E2A78] text-[#1E2A78] bg-transparent hover:bg-[#1E2A78]/5 focus-visible:ring-[#1E2A78]',
    'track-gimun':
      'bg-[#FF6B35] text-white hover:bg-[#E55A28] focus-visible:ring-[#FF6B35] shadow-[0_2px_12px_-2px_rgba(255,107,53,0.35)] hover:-translate-y-0.5',
    'track-moot':
      'bg-[#00B4A6] text-white hover:bg-[#009E92] focus-visible:ring-[#00B4A6] shadow-[0_2px_12px_-2px_rgba(0,180,166,0.35)] hover:-translate-y-0.5',
    ghost:
      'text-[#5A5A6E] hover:text-[#1A1A2E] hover:bg-[#1E2A78]/5 focus-visible:ring-[#1E2A78]',
  }[variant];

  const classes = cn(
    baseStyles,
    sizeStyles,
    variantStyles,
    fullWidth ? 'w-full' : '',
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
