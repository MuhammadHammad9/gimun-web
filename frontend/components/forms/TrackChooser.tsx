'use client';

import React from 'react';
import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import { ArrowRight, Lock } from 'lucide-react';
import { Bezel } from '@frontend/components/ui/Editorial';
import { formatEventDate } from '@shared/lib/site-config';

interface TrackChooserProps {
  onSelectTrack: (track: 'gimun' | 'moot-cup') => void;
  gimunDeadline: string;
  mootCupDeadline: string;
  gimunOpen: boolean;
  mootCupOpen: boolean;
  fees?: {
    gimunIndividual: string;
    gimunDelegationPerDelegate: string;
    mootCupTeam: string;
  };
}

type TrackOption = {
  key: 'gimun' | 'moot-cup';
  label: string;
  title: string;
  body: string;
  price: string;
  priceNote: string;
  facts: string[];
  deadline: string;
  open: boolean;
  links: { label: string; href: string }[];
};

export function TrackChooser({ onSelectTrack, gimunDeadline, mootCupDeadline, gimunOpen, mootCupOpen, fees }: TrackChooserProps) {
  const options: TrackOption[] = [
    {
      key: 'gimun',
      label: 'Track 01 · GIMUN',
      title: 'Model United Nations',
      body: 'Represent a country in committee. Apply on your own, or register your institution’s delegation in one form.',
      price: fees?.gimunIndividual ?? '',
      priceNote: `individual · ${fees?.gimunDelegationPerDelegate ?? ''} per delegate in a delegation`,
      facts: ['Individual or delegation of 2–20', 'Three committee preferences', 'Kit, lunches and socials included'],
      deadline: gimunDeadline,
      open: gimunOpen,
      links: [
        { label: 'Track overview', href: '/gimun' },
        { label: 'Committees', href: '/gimun/committees' },
      ],
    },
    {
      key: 'moot-cup',
      label: 'Track 02 · GMC',
      title: 'GIKI Moot Court',
      body: 'Enter a team of law students: memorials for both sides, then oral rounds before a bench.',
      price: fees?.mootCupTeam ?? '',
      priceNote: 'per team',
      facts: ['Teams of 2–4', 'Choose a problem category', 'Memorial feedback included'],
      deadline: mootCupDeadline,
      open: mootCupOpen,
      links: [
        { label: 'Track overview', href: '/moot-cup' },
        { label: 'Rules & memorials', href: '/moot-cup/rules' },
      ],
    },
  ];

  return (
    <div className="rise-stagger mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
      {options.map((option, i) => {
        const gimun = option.key === 'gimun';
        return (
          <div key={option.key} style={{ '--i': i } as React.CSSProperties}>
            <Bezel accent={gimun ? 'gimun' : undefined} className="h-full">
              <div className="flex h-full flex-col p-8 sm:p-10">
                <div className="flex items-center justify-between gap-3">
                  <p className={`font-mono text-[11px] uppercase tracking-[0.18em] ${gimun ? 'text-accent-gimun' : 'text-champagne'}`}>
                    {option.label}
                  </p>
                  {option.open ? (
                    <p className="text-xs text-text-4">
                      Closes <span className="text-text-2">{formatEventDate(option.deadline, { month: 'short' })}</span>
                    </p>
                  ) : (
                    <p className="inline-flex items-center gap-1.5 text-xs text-text-3">
                      <Lock aria-hidden="true" className="h-3.5 w-3.5" /> Not open
                    </p>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-display font-medium text-text sm:text-3xl">{option.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-3">{option.body}</p>

                <p className="mt-7 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-3xl font-display font-medium tracking-tight text-text tabular-nums">{option.price}</span>
                  <span className="text-xs text-text-4">{option.priceNote}</span>
                </p>

                <ul className="mt-6 space-y-2.5">
                  {option.facts.map((fact) => (
                    <li key={fact} className="flex gap-3 text-sm text-text-2">
                      <span aria-hidden="true" className={`mt-2 h-1 w-3 shrink-0 rounded-full ${gimun ? 'bg-crimson-soft' : 'bg-champagne'}`} />
                      {fact}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-5 pt-9">
                  <button
                    type="button"
                    disabled={!option.open}
                    onClick={() => onSelectTrack(option.key)}
                    className={`group flex h-12 w-full items-center justify-between rounded-full pl-6 pr-1.5 text-sm font-semibold transition-all duration-300 ease-[var(--ease-brand)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-45 ${
                      gimun
                        ? 'border border-accent-gimun/40 bg-gimun-fill text-on-gimun hover:bg-gimun-fill-hi'
                        : 'bg-champagne text-on-accent hover:bg-champagne-hi'
                    }`}
                  >
                    <span>{option.open ? `Apply for ${gimun ? 'GIMUN' : 'GMC'}` : 'Registration is not open'}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-0.5 group-hover:-translate-y-px ${
                        gimun ? 'bg-champagne/15' : 'bg-canvas/10'
                      }`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    {option.links.map((link) => (
                      <Link key={link.href} href={link.href} className="text-text-3 underline-offset-4 transition-colors hover:text-text hover:underline">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Bezel>
          </div>
        );
      })}
    </div>
  );
}
