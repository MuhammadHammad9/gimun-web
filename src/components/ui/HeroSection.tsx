import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

export interface HeroSectionProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
    variant?: 'primary' | 'track-gimun' | 'track-moot';
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  sideContent?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  sideContent,
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Content */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-start text-left">
            {eyebrow && <div className="mb-5">{eyebrow}</div>}

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A2E] tracking-tight leading-[1.1] mb-6">
              {title}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#5A5A6E] leading-relaxed max-w-2xl mb-8">
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
                    variant="secondary"
                    size="lg"
                    href={secondaryAction.href}
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
