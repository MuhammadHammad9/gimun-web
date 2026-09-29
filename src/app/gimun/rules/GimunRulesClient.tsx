'use client';

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useFlip } from '@/components/motion/useFlip';
import { FilterBar } from '@/components/ui/FilterBar';

export interface MotionItem {
  name: string;
  category: "point" | "debate" | "resolution" | "closure";
  purpose: string;
  interrupt: string;
  second: string;
  vote: string;
  precedence: number;
  proTip: string;
}

const MOTIONS_DATA: MotionItem[] = [
  {
    name: "Point of Personal Privilege",
    category: "point",
    purpose: "Audibility, room temperature, physical discomfort, or technical hindrance.",
    interrupt: "Yes (only for audibility)",
    second: "No",
    vote: "Dais Discretion",
    precedence: 1,
    proTip: "Raise your placard immediately if you cannot hear the speaker. Never wait until the speech concludes.",
  },
  {
    name: "Point of Order",
    category: "point",
    purpose: "Procedural error or violation of parliamentary rules by delegate or Dais.",
    interrupt: "Yes",
    second: "No",
    vote: "Dais Ruling",
    precedence: 2,
    proTip: "Use strictly for procedural breaches, never to debate or challenge the factual accuracy of a speech.",
  },
  {
    name: "Point of Parliamentary Inquiry",
    category: "point",
    purpose: "Question addressed to the Dais regarding RoP, agenda order, or next procedure.",
    interrupt: "No",
    second: "No",
    vote: "Dais Clarification",
    precedence: 3,
    proTip: "Entertained only when the floor is open between speeches. Great for clarifying voting majorities.",
  },
  {
    name: "Motion for Moderated Caucus",
    category: "debate",
    purpose: "Structured debate on a specific sub-topic with designated total time & individual speaker limit.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 4,
    proTip: "Specify Topic, Total Time (e.g., 9 mins), and Individual Time (e.g., 45 secs). Must divide evenly.",
  },
  {
    name: "Motion for Unmoderated Caucus",
    category: "debate",
    purpose: "Informal suspension of formal rules for bilateral negotiations, alliance building, and drafting.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 5,
    proTip: "Max recommended time is 15–20 minutes. Use to consolidate multiple working papers into single blocs.",
  },
  {
    name: "Motion to Introduce Working Paper",
    category: "resolution",
    purpose: "Distribute and project Dais-approved policy proposals without formal debate restrictions.",
    interrupt: "No",
    second: "Yes",
    vote: "Dais Discretion / Simple",
    precedence: 6,
    proTip: "Requires Dais approval number before introducing. Working papers do not require formal signatories.",
  },
  {
    name: "Motion to Introduce Draft Resolution",
    category: "resolution",
    purpose: "Formally introduce comprehensive resolution document approved by Dais with Sponsors & Signatories.",
    interrupt: "No",
    second: "Yes",
    vote: "Simple Majority (50% + 1)",
    precedence: 7,
    proTip: "Requires 2+ primary Sponsors and minimum 20% of committee present as Signatories.",
  },
  {
    name: "Motion to Enter Voting Procedure",
    category: "closure",
    purpose: "Close substantive debate immediately and move directly into voting on tabled draft resolutions.",
    interrupt: "No",
    second: "Yes",
    vote: "2/3 Majority Required",
    precedence: 8,
    proTip: "Once passed, committee doors lock, all note passing ceases, and no one may enter or leave the chamber.",
  },
];


const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'point', label: 'Points' },
  { value: 'debate', label: 'Debate and caucus' },
  { value: 'resolution', label: 'Resolutions' },
  { value: 'closure', label: 'Closure' },
] as const;

/**
 * The floor motions in order of precedence, searchable and filterable.
 * Rows glide into place when the filter changes.
 */
export function GimunRulesClient() {
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const list = useRef<HTMLOListElement>(null);
  const { prime, capture } = useFlip(list, '.motion-row');

  const q = query.trim().toLowerCase();
  const shown = MOTIONS_DATA.filter(
    (m) =>
      (category === 'all' || m.category === category) &&
      (m.name.toLowerCase().includes(q) || m.purpose.toLowerCase().includes(q) || m.proTip.toLowerCase().includes(q)),
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" onPointerEnter={prime} onFocusCapture={prime}>
        <FilterBar
          label="Filter motions by kind"
          options={CATEGORIES.map((c) => ({
            ...c,
            count: c.value === 'all' ? MOTIONS_DATA.length : MOTIONS_DATA.filter((m) => m.category === c.value).length,
          }))}
          activeValue={category}
          onChange={(value) => {
            capture();
            setCategory(value);
          }}
        />
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search motions</span>
          <Search aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-3" />
          <input
            type="search"
            value={query}
            placeholder="Search: caucus, order, yield"
            onChange={(event) => {
              capture();
              setQuery(event.target.value);
            }}
            className="w-full rounded-full border border-line-2 bg-raised py-2.5 pl-10 pr-4 text-small text-text placeholder:text-text-4 focus:border-line-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </label>
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} motions shown
      </p>

      <ol ref={list} className="motions">
        {shown.map((m) => (
          <li key={m.name} className="motion-row">
            <span className="motion-row__rank" aria-label={`Precedence ${m.precedence}`}>
              {String(m.precedence).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="motion-row__name">{m.name}</h3>
              <p className="motion-row__purpose">{m.purpose}</p>
              <p className="motion-row__tip">{m.proTip}</p>
            </div>
            <dl className="motion-row__facts">
              <div>
                <dt>Interrupts</dt>
                <dd>{m.interrupt}</dd>
              </div>
              <div>
                <dt>Second</dt>
                <dd>{m.second}</dd>
              </div>
              <div>
                <dt>Vote</dt>
                <dd>{m.vote}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {shown.length === 0 && <p className="rounded-2xl border border-dashed border-line-2 p-8 text-center text-small text-text-3">No motion matches that search.</p>}
    </div>
  );
}
