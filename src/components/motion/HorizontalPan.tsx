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
 *
 * Pinned, the corridor also answers the hand: drag it (with momentum; the
 * drag moves the page scroll, so the pin and the track never disagree), it
 * leans with the speed of travel (clamped to a few degrees), a rail shows how
 * far along you are, the panel under the pointer tilts toward it, and a small
 * "Drag" chip follows a fine pointer across the track.
 */
const MAX_SKEW = 4;
const TILT = 6;
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
      const motion = await import('@/lib/motion/gsap');
      const Draggable = await motion.draggable();
      if (signal.aborted) return;
      const { gsap } = motion;

      section.dataset.pan = 'pinned';
      const distance = () => Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);

      // Lean with the speed of travel, settling back to upright.
      const skewTo = gsap.quickTo(trackEl, 'skewX', { duration: 0.5, ease: 'brand' });
      const settle = () => skewTo(0);
      const progress = section.querySelector<HTMLElement>('.pan__progress');
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
          onScrubComplete: settle,
          // Panels slide under the fixed chapter rail; step it aside meanwhile.
          onToggle: (self) => {
            if (self.isActive) document.documentElement.dataset.corridor = '';
            else delete document.documentElement.dataset.corridor;
          },
          onUpdate: (self) => {
            progress?.style.setProperty('--pan-progress', self.progress.toFixed(4));
            skewTo(Math.max(-MAX_SKEW, Math.min(MAX_SKEW, self.getVelocity() / -300)));
          },
        },
      });


      // Dragging moves the page scroll; the scrubbed tween follows it.
      const proxy = document.createElement('div');
      let from = 0;
      const follow = function (this: { x: number }) {
        scrollTo(from - this.x, { immediate: true });
      };
      const [drag] = Draggable.create(proxy, {
        type: 'x',
        trigger: viewportEl,
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress() {
          gsap.set(proxy, { x: 0 });
          from = window.scrollY;
        },
        onDrag: follow,
        onThrowUpdate: follow,
        onThrowComplete: settle,
        onRelease: settle,
      });

      // The panel under a fine pointer tilts toward it; the chip follows it.
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const chip = section.querySelector<HTMLElement>('.pan__chip');
      const chipX = chip ? gsap.quickTo(chip, 'x', { duration: 0.35, ease: 'brand' }) : null;
      const chipY = chip ? gsap.quickTo(chip, 'y', { duration: 0.35, ease: 'brand' }) : null;
      let tilted: HTMLElement | null = null;
      const untilt = () => {
        if (tilted) gsap.to(tilted, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'brand' });
        tilted = null;
      };
      const onMove = (event: PointerEvent) => {
        if (!fine) return;
        const box = viewportEl.getBoundingClientRect();
        chipX?.(event.clientX - box.left);
        chipY?.(event.clientY - box.top);
        const panel = (event.target as Element | null)?.closest<HTMLElement>('[data-pan-panel]') ?? null;
        if (panel !== tilted) untilt();
        if (!panel || drag.isPressed) return;
        tilted = panel;
        const rect = panel.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / rect.width - 0.5;
        const dy = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(panel, { rotationY: dx * TILT * 2, rotationX: -dy * TILT * 2, transformPerspective: 1000, duration: 0.5, ease: 'brand', overwrite: 'auto' });
      };
      const onEnter = () => {
        if (fine) section.dataset.panHover = '';
      };
      const onLeave = () => {
        delete section.dataset.panHover;
        untilt();
      };
      viewportEl.addEventListener('pointermove', onMove, { passive: true });
      viewportEl.addEventListener('pointerenter', onEnter);
      viewportEl.addEventListener('pointerleave', onLeave);

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
        viewportEl.removeEventListener('pointermove', onMove);
        viewportEl.removeEventListener('pointerenter', onEnter);
        viewportEl.removeEventListener('pointerleave', onLeave);
        drag.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(trackEl, { clearProps: 'transform' });
        gsap.set(trackEl.querySelectorAll('[data-pan-panel]'), { clearProps: 'transform' });
        delete section.dataset.pan;
        delete section.dataset.panHover;
        delete document.documentElement.dataset.corridor;
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
          <span className="pan__chip" aria-hidden="true">
            Drag
          </span>
        </div>
        <div className="wrap" aria-hidden="true">
          <span className="pan__progress" />
        </div>
      </div>
    </div>
  );
}
