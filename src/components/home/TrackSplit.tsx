'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Gavel, Globe2, ArrowRight } from 'lucide-react';
import { ScrollScene } from '@/components/motion/ScrollScene';
import { TrackBadge } from '@/components/ui/TrackBadge';

export interface TrackSplitProps {
  committeeCount: number;
  categoryCount: number;
}

/**
 * The homepage's signature scroll sequence.
 *
 * Two panels begin overlapped in the centre and separate as you scroll, which
 * is the site's own thesis made literal: one event, "Where Diplomacy Meets the
 * Courtroom", resolving into two distinct tracks a visitor has to choose
 * between. The separation is what makes the two-track structure legible before
 * anyone reads a word of nav.
 *
 * Under `prefers-reduced-motion` — enforced inside `ScrollScene` — nothing is
 * pinned and nothing moves: the panels render as an ordinary two-column grid
 * with all content visible. The markup below is authored in that resting state,
 * so the static fallback is the source of truth and the animation is additive.
 */
export function TrackSplit({ committeeCount, categoryCount }: TrackSplitProps) {
  const build = useCallback((root: HTMLDivElement, q: gsap.utils.SelectorFunc) => {
    const panels = q('[data-panel]') as HTMLElement[];
    if (panels.length < 2) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=80%',
        scrub: 0.6,
        pin: q('[data-stage]')[0],
        // `transform` pinning survives a transformed ancestor; `fixed` would
        // silently position against it instead of the viewport.
        pinType: 'transform',
        anticipatePin: 1,
      },
    });

    timeline
      .fromTo(
        q('[data-panel="gimun"]'),
        { xPercent: 50, scale: 0.92, opacity: 0.45 },
        { xPercent: 0, scale: 1, opacity: 1, ease: 'power2.out' },
        0
      )
      .fromTo(
        q('[data-panel="moot"]'),
        { xPercent: -50, scale: 0.92, opacity: 0.45 },
        { xPercent: 0, scale: 1, opacity: 1, ease: 'power2.out' },
        0
      )
      .fromTo(
        q('[data-panel-body]'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out' },
        0.35
      )
      .fromTo(
        q('[data-seam]'),
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, ease: 'power2.inOut' },
        0.2
      );
  }, []);

  return (
    <ScrollScene build={build} className="relative">
      <div
        data-stage
        className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:min-h-[86vh] lg:px-8"
      >
        <div className="mb-10 text-center">
          <span className="font-mono text-meta font-bold uppercase tracking-[0.14em] text-champagne">
            Two Tracks, One Campus
          </span>
          <h2 className="mt-2 text-h2 font-display font-bold text-text">
            Choose the arena you want to be tested in
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* The seam only reads as a divider once the panels have parted. */}
          <div
            aria-hidden="true"
            data-seam
            className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-px origin-center bg-gradient-to-b from-transparent via-champagne/40 to-transparent lg:block"
          />

          <article
            data-panel="gimun"
            className="group relative overflow-hidden rounded-section border border-line bg-raised/80 p-8 shadow-card backdrop-blur-xl transition-colors duration-300 hover:border-crimson/50 sm:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-crimson/20 blur-3xl"
            />
            <div data-panel-body className="relative space-y-5">
              <div className="flex items-center justify-between">
                <TrackBadge track="gimun" />
                <Globe2 aria-hidden="true" className="h-6 w-6 text-crimson" />
              </div>
              <h3 className="text-h3 font-display font-bold text-text">
                Model United Nations
              </h3>
              <p className="leading-relaxed text-text-2">
                Represent a sovereign state across {committeeCount} chambers. Negotiate
                blocs, draft binding resolutions, and defend a national position under
                parliamentary procedure.
              </p>
              <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 font-mono text-xs">
                <div>
                  <dt className="text-text-3">Chambers</dt>
                  <dd className="mt-1 text-lg font-bold text-champagne">{committeeCount}</dd>
                </div>
                <div>
                  <dt className="text-text-3">Format</dt>
                  <dd className="mt-1 text-lg font-bold text-champagne">Delegate</dd>
                </div>
              </dl>
              <Link
                href="/gimun"
                className="group/link inline-flex items-center gap-2 rounded text-sm font-semibold text-crimson-soft transition-colors hover:text-text"
              >
                Explore the GIMUN track
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5"
                />
              </Link>
            </div>
          </article>

          <article
            data-panel="moot"
            className="group relative overflow-hidden rounded-section border border-line bg-raised/80 p-8 shadow-card backdrop-blur-xl transition-colors duration-300 hover:border-champagne/50 sm:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-champagne/15 blur-3xl"
            />
            <div data-panel-body className="relative space-y-5">
              <div className="flex items-center justify-between">
                <TrackBadge track="moot-cup" />
                <Gavel aria-hidden="true" className="h-6 w-6 text-champagne" />
              </div>
              <h3 className="text-h3 font-display font-bold text-text">
                GIKI Moot Court
              </h3>
              <p className="leading-relaxed text-text-2">
                Argue an appellate case across {categoryCount} problem categories. Draft
                memorials for both sides, then face a bench that will interrupt you on
                the law.
              </p>
              <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 font-mono text-xs">
                <div>
                  <dt className="text-text-3">Categories</dt>
                  <dd className="mt-1 text-lg font-bold text-champagne">{categoryCount}</dd>
                </div>
                <div>
                  <dt className="text-text-3">Format</dt>
                  <dd className="mt-1 text-lg font-bold text-champagne">Team</dd>
                </div>
              </dl>
              <Link
                href="/moot-cup"
                className="group/link inline-flex items-center gap-2 rounded text-sm font-semibold text-champagne transition-colors hover:text-text"
              >
                Explore the GMC track
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5"
                />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </ScrollScene>
  );
}

export default TrackSplit;
