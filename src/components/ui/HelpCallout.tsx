import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HelpCalloutProps {
  /** What this page cannot answer, in one plain sentence. */
  question: string;
  /** Where to send them instead. Two at most — a third is a menu, not an out. */
  actions?: { label: string; href: string }[];
  className?: string;
}

/**
 * The end-of-page "didn't find it?" block.
 *
 * Replaces five hand-written variants that all did the same job in different
 * words and different layouts — "Unanswered Inquiries?", "Have questions
 * regarding country matrix policies?", "Have inquiries regarding memorial
 * citation standards?", "Looking for a Specialized Document or Country
 * Dossier?" and "Merit Adjudication & Score Verifications". A reader hitting
 * the bottom of several pages met a different-looking box each time and had to
 * re-read it to work out it was the same offer.
 *
 * Contact is always the final action, so the way out is in the same place on
 * every page.
 */
export function HelpCallout({ question, actions = [], className }: HelpCalloutProps) {
  const links = [...actions.slice(0, 2), { label: 'Contact the team', href: '/contact' }];

  return (
    <div
      className={cn(
        'surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7',
        className
      )}
    >
      <p className="max-w-xl text-body text-text-3">
        <span className="font-semibold text-text">{question}</span> We answer within two
        working days.
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {links.map((link, i) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={cn(
              'group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              i === links.length - 1
                ? 'bg-champagne text-canvas hover:bg-champagne-hi'
                : 'border border-line-2 text-champagne hover:border-line-3 hover:bg-champagne/5'
            )}
          >
            {link.label}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HelpCallout;
