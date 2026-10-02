'use client';

import { useRef, useState } from 'react';
import { useFlip } from '@frontend/components/motion/useFlip';
import { COMMITTEE_TYPE, CommitteePlacard } from '@frontend/components/sections/Placards';
import { FilterBar } from '@frontend/components/ui/FilterBar';
import { HelpCallout } from '@frontend/components/ui/HelpCallout';
import type { Committee } from '@shared/lib/types';

const FILTER_LABEL: Record<string, string> = {
  'general-assembly': 'General Assembly',
  'specialized-agency': 'Specialized agencies',
  crisis: 'Crisis',
  other: 'Councils',
};

/**
 * The committee list with a type filter. Only types that actually exist are
 * offered (the Security Council is stored as "other" and shows as Councils).
 * Placards glide to their new places when the filter changes.
 */
export function CommitteesClient({ committees, registrationOpen }: { committees: Committee[]; registrationOpen: boolean }) {
  const [type, setType] = useState('all');
  const grid = useRef<HTMLDivElement>(null);
  const { prime, capture } = useFlip(grid, '.placard');

  const types = [...new Set(committees.map((c) => c.type))];
  const options = [
    { label: 'All', value: 'all', count: committees.length },
    ...types.map((value) => ({
      label: FILTER_LABEL[value] ?? COMMITTEE_TYPE[value] ?? value,
      value,
      count: committees.filter((c) => c.type === value).length,
    })),
  ];
  const shown = type === 'all' ? committees : committees.filter((c) => c.type === type);

  return (
    <section className="chapter chapter--flush-top" aria-labelledby="list-title">
      <div className="wrap">
        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="list-title" className="sr-only">
            Committees
          </h2>
          <div onPointerEnter={prime} onFocusCapture={prime}>
            <FilterBar
              label="Filter committees by type"
              options={options}
              activeValue={type}
              onChange={(value) => {
                capture();
                setType(value);
              }}
            />
          </div>
          <p className="font-mono text-[0.8125rem] text-text-3" aria-live="polite">
            Showing {shown.length} of {committees.length}
          </p>
        </div>

        <div ref={grid} className="placard-grid">
          {shown.map((committee) => (
            <CommitteePlacard
              key={committee.id}
              committee={committee}
              applyHref={registrationOpen ? `/register?track=gimun&committee=${committee.slug}` : undefined}
            />
          ))}
        </div>

        <HelpCallout
          className="mt-16"
          question="Unsure how country allocation works?"
          actions={[
            { label: 'Rules of procedure', href: '/gimun/rules' },
            { label: 'Background guides', href: '/resources' },
          ]}
        />
      </div>
    </section>
  );
}
