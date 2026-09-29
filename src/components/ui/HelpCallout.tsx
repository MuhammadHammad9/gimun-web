'use client';

import { ArrowRight } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { cn } from '@/lib/utils';

export interface HelpCalloutProps {
  /** What this page cannot answer, in one plain sentence. */
  question: string;
  /** Where to send them instead. Two at most; a third is a menu, not an out. */
  actions?: { label: string; href: string }[];
  className?: string;
}

/**
 * The end-of-page "didn't find it?" row, the same on every page: the
 * question, the organizers' stated reply time (from settings, so it never
 * disagrees with the contact page), up to two places to look, and contact
 * always last.
 */
export function HelpCallout({ question, actions = [], className }: HelpCalloutProps) {
  const site = useSiteConfig();
  const links = [...actions.slice(0, 2), { label: 'Contact the team', href: '/contact' }];

  return (
    <div className={cn('help-callout', className)}>
      <p className="help-callout__text">
        <span className="font-medium text-text">{question}</span> {site.replyTime ?? 'We reply to every message.'}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {links.map((link) => (
          <Link key={link.href + link.label} href={link.href} className="text-link">
            {link.label}
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HelpCallout;
