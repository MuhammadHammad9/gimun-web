import { ViewTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import { ScalesArt } from '@frontend/components/art/LineArt';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { formatPublishedDate } from '@shared/lib/site-config';
import type { Committee, ProblemCategory } from '@shared/lib/types';
import { cn } from '@frontend/lib/utils';

export const COMMITTEE_TYPE: Record<string, string> = {
  'general-assembly': 'General Assembly',
  'specialized-agency': 'Specialized agency',
  crisis: 'Crisis committee',
  other: 'Council',
};

export function seatsOpen(committee: Committee): number {
  return (committee.countryList ?? []).filter((entry) => entry.status === 'available').length;
}

/**
 * A committee as a name placard: chamber type and open seats on top, the
 * abbreviation set large, the full name, the first agenda item, and one
 * bar per seat (filled while it is still open).
 */
export function CommitteePlacard({
  committee,
  className,
  panel = false,
  applyHref,
}: {
  committee: Committee;
  className?: string;
  panel?: boolean;
  /** Adds a direct way into the registration form with this committee chosen. */
  applyHref?: string;
}) {
  const total = committee.countryList?.length ?? 0;
  const open = seatsOpen(committee);
  const headingId = `placard-${committee.slug}`;
  return (
    <article className={cn('placard', className)} data-pan-panel={panel ? '' : undefined} aria-labelledby={headingId} data-glow="" data-live-key={`committee-${committee.id}${panel ? '-panel' : ''}`}>
      <div className="placard__top">
        <span>{COMMITTEE_TYPE[committee.type] ?? 'Committee'}</span>
        {total > 0 && (
          <span>
            {open} of {total} open
          </span>
        )}
      </div>
      {/* Morphs into the committee page's mark (see TransitionLink morph). */}
      <ViewTransition name={`committee-mark-${committee.slug}`} share="morph" default="none">
        <p className="placard__mark" aria-hidden="true">
          {committee.slug.toUpperCase()}
        </p>
      </ViewTransition>
      <h3 id={headingId} className="placard__name">
        {committee.name}
      </h3>
      {committee.topics?.[0] && <p className="placard__copy">Agenda: {committee.topics[0]}</p>}
      <div className="placard__foot">
        <span className="placard__seats" aria-hidden="true">
          {(committee.countryList ?? []).slice(0, 20).map((entry, index) => (
            <span key={index} data-open={entry.status === 'available' ? '' : undefined} />
          ))}
        </span>
        <span className="flex flex-wrap justify-end gap-x-5 gap-y-2">
          {applyHref && (
            <Link href={applyHref} className="text-link" aria-label={`Apply for ${committee.name}`}>
              Apply
            </Link>
          )}
          <Link href={`/gimun/committees/${committee.slug}`} className="text-link" aria-label={`${committee.name}: committee page`} morph>
            Committee
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </Link>
        </span>
      </div>
    </article>
  );
}

/** A moot court case category, in the same placard form. */
export function CasePlacard({ category, className, panel = false }: { category: ProblemCategory; className?: string; panel?: boolean }) {
  const headingId = `case-${category.id}`;
  return (
    <article className={cn('placard placard--case', className)} data-pan-panel={panel ? '' : undefined} aria-labelledby={headingId} data-glow="" data-live-key={`case-${category.id}${panel ? '-panel' : ''}`}>
      <div className="placard__top">
        <span>Case category</span>
      </div>
      <ScalesArt className="mt-8 size-24 text-accent-gmc" />
      <h3 id={headingId} className="placard__name">
        {category.name}
      </h3>
      <p className="placard__area">{category.areaOfLaw}</p>
      <p className="placard__copy line-clamp-4">{category.description}</p>
      <div className="placard__foot">
        <span className="font-mono text-[0.8125rem] text-text-3">Revised {formatPublishedDate(category.lastUpdated)}</span>
        <Link href="/moot-cup/categories" className="text-link" aria-label={`${category.name}: case categories`}>
          Cases
          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
        </Link>
      </div>
    </article>
  );
}
