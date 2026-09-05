import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

export interface HeroSectionProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  variant?: 'light' | 'dark' | 'gimun' | 'moot';
  primaryAction?: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot';
  };
  secondaryAction?: {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'track-gimun' | 'track-moot' | 'ghost';
  };
  sideContent?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  variant = 'light',
  primaryAction,
  secondaryAction,
  sideContent,
  className,
}: HeroSectionProps) {
  const isDark = variant === 'dark' || variant === 'gimun' || variant === 'moot';

  return (
    <section
      className={cn(
        'relative overflow-hidden pt-14 pb-16 md:pt-22 md:pb-26 px-4 sm:px-6 lg:px-8',
        variant === 'dark' && 'bg-[#070B19] text-white bg-radial-glow-dual',
        variant === 'gimun' && 'bg-[#070B19] text-white bg-radial-glow-orange',
        variant === 'moot' && 'bg-[#070B19] text-white bg-radial-glow-teal',
        variant === 'light' && 'bg-transparent text-[#1A1A2E]',
        className
      )}
    >
      {/* Ambient Tech Grid Overlay for dark themes */}
      {isDark && (
        <div className="absolute inset-0 bg-tech-grid pointer-events-none opacity-80" />
      )}

      {/* Ambient Radial Mesh Glow Orbs */}
      {variant === 'dark' && (
        <>
          <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-[#FF6B35]/15 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-[#00B4A6]/15 blur-3xl pointer-events-none" />
        </>
      )}
      {variant === 'gimun' && (
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-[#FF6B35]/20 blur-3xl pointer-events-none" />
      )}
      {variant === 'moot' && (
        <div className="absolute top-0 right-1/3 translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-[#00B4A6]/20 blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Content */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-start text-left">
            {eyebrow && <div className="mb-5">{eyebrow}</div>}

            <h1
              className={cn(
                'font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6',
                isDark ? 'text-white' : 'text-[#1A1A2E]'
              )}
            >
              {title}
            </h1>

            <p
              className={cn(
                'text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-8',
                isDark ? 'text-slate-300' : 'text-[#5A5A6E]'
              )}
            >
              {description}
            </p>

            {(primaryAction || secondaryAction) && (
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {primaryAction && (
                  <Button
                    variant={primaryAction.variant || 'primary'}
                    size="lg"
                    href={primaryAction.href}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant || (isDark ? 'secondary' : 'secondary')}
                    size="lg"
                    href={secondaryAction.href}
                    className={isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/20' : ''}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Visual / Dual Cards / Highlight */}
          {sideContent && (
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              {sideContent}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
