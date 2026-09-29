'use client';

import { useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { scrollTo } from '@/lib/motion/bridge';
import { prefersReducedMotion } from '@/lib/motion/policy';
import { useEnhance } from './useEnhance';

/**
 * A row of panels you travel along sideways.
 *
 * Everywhere, it works as a scroll-snapped track: swipe it, scroll it with
 * the keyboard (the track is a focusable region) or use the arrow buttons.
 * On the full motion tier (fine pointer, wide screen) the heading and track
 * are pinned together and the track moves with the page scroll instead, a
 * corridor you walk down. Tabbing to a panel while pinned scrolls the page
 * to where that panel shows.
 */
export function HorizontalPan({ label, header, children }: { label: string; header?: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEnhance(
    root,
    async (section, signal) => {
      const trackEl = track.current;
      const viewportEl = viewport.current;
      const pinEl = pin.current;
      if (!trackEl || !viewportEl || !pinEl) return;
      const { gsap } = await import('@/lib/motion/gsap');
      if (signal.aborted) return;

      section.dataset.pan = 'pinned';
      const distance = () => Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);
      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: pinEl,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      const onFocus = (event: FocusEvent) => {
        const panel = (event.target as Element | null)?.closest<HTMLElement>('[data-pan-panel]');
        const trigger = tween.scrollTrigger;
        if (!panel || !trigger || distance() === 0) return;
        const progress = Math.min(1, Math.max(0, (panel.offsetLeft - 32) / distance()));
        scrollTo(trigger.start + progress * (trigger.end - trigger.start), { immediate: true });
      };
      section.addEventListener('focusin', onFocus);

      return () => {
        section.removeEventListener('focusin', onFocus);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(trackEl, { clearProps: 'transform' });
        delete section.dataset.pan;
      };
    },
    { tiers: ['full'] },
  );

  const step = (direction: 1 | -1) => {
    const viewportEl = viewport.current;
    if (!viewportEl) return;
    viewportEl.scrollBy({ left: direction * viewportEl.clientWidth * 0.8, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  };

  return (
    <div ref={root} className="pan">
      <div ref={pin} className="pan__pin">
        <div className="wrap pan__head">
          {header}
          <div className="pan__controls">
            <button type="button" className="pan__button" aria-label="Previous panels" onClick={() => step(-1)}>
              <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </button>
            <button type="button" className="pan__button" aria-label="Next panels" onClick={() => step(1)}>
              <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
            </button>
          </div>
        </div>
        <div ref={viewport} className="pan__viewport" role="region" aria-label={label} tabIndex={0} data-lenis-prevent-horizontal="">
          <div ref={track} className="pan__track">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
