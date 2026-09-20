import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TrackBadge } from './TrackBadge';
import type { Track } from '@/lib/types';
import { ArrowUpRight } from 'lucide-react';

export interface ContentCardProps {
  title: string;
  description: string;
  track?: Track | 'all';
  eyebrow?: string;
  meta?: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  updatedFlag?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ContentCard({
  title,
  description,
  track,
  eyebrow,
  meta,
  icon,
  actionHref,
  actionLabel,
  updatedFlag,
  className,
  children,
}: ContentCardProps) {
  const cardContent = (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-6 sm:p-7 rounded-[1.625rem] h-full transition-all duration-300',
        actionHref ? 'cursor-pointer hover:bg-champagne/5' : ''
      )}
    >
      <div>
        {/* Header: Track Badge, Eyebrow, and Updated Tag */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {track && <TrackBadge track={track} size="sm" />}
            {eyebrow && (
              <span className="text-xs font-mono uppercase tracking-wider text-champagne/70">
                {eyebrow}
              </span>
            )}
          </div>
          {updatedFlag && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-champagne/20 text-champagne border border-champagne/40">
              Updated
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-2.5">
          {icon && (
            <div className="p-2.5 rounded-xl bg-champagne/10 text-champagne border border-champagne/20 shrink-0 transition-colors group-hover:bg-champagne/20">
              {icon}
            </div>
          )}
          <h3 className="font-heading text-lg sm:text-xl font-bold text-cream leading-snug group-hover:text-champagne transition-colors">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-champagne/80 leading-relaxed mb-4">
          {description}
        </p>

        {/* Optional Custom Slot Content */}
        {children}
      </div>

      {/* Footer / Action */}
      {(meta || actionHref) && (
        <div className="pt-4 mt-auto border-t border-champagne/20 flex items-center justify-between gap-4 text-xs font-medium">
          {meta && <span className="text-champagne/60 font-mono">{meta}</span>}
          {actionHref && (
            <span className="inline-flex items-center gap-1 text-champagne font-semibold group-hover:text-cream transition-colors ml-auto">
              {actionLabel || 'Learn more'}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('double-bezel h-full', className)}>
      <div className="double-bezel-inner h-full">
        {actionHref ? (
          <Link href={actionHref} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne rounded-[1.625rem]">
            {cardContent}
          </Link>
        ) : (
          cardContent
        )}
      </div>
    </div>
  );
}
