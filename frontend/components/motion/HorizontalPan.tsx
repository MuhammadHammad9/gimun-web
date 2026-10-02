'use client';

import { useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { prefersReducedMotion } from '@frontend/motion/policy';
import { useEnhance } from './useEnhance';

/**
 * A row of panels you travel along sideways.
 *
 * Everywhere, it is a native horizontal track: swipe it, scroll it sideways
 * with a trackpad or the keyboard (the track is a focusable region) or use
 * the arrow buttons. The page's own vertical scroll always passes straight
 * through it; the corridor never takes the page over.
 *
 * On the full motion tier (fine pointer, wide screen) it also answers the
 * hand: drag it with momentum (the drag moves only the track) and a throw
 * comes to rest with a panel's edge at the start of the view; it leans with
 * the speed of travel (clamped to a couple of degrees), a rail shows how far
 * along you are, the panel under the pointer tilts toward it, a small "Drag"
 * chip rides beside a fine pointer, and the chapter rail steps aside while
 * the corridor holds the middle of the screen.
 */
const MAX_SKEW = 2;
const TILT = 3;
export function HorizontalPan({ label, header, children }: { label: string; header?: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEnhance(
    root,
    async (section, signal) => {
      const trackEl = track.current;
      const viewportEl = viewport.current;
      if (!trackEl || !viewportEl) return;
      const motion = await import('@frontend/motion/gsap');
      const Draggable = await motion.draggable();
      if (signal.aborted) return;
      const { gsap } = motion;

      section.dataset.pan = 'drag';
      const max = () => Math.max(0, viewportEl.scrollWidth - viewportEl.clientWidth);

      // Progress along the track, and a lean with the speed of travel that
      // settles back to upright.
      const progress = section.querySelector<HTMLElement>('.pan__progress');
      const skewTo = gsap.quickTo(trackEl, 'skewX', { duration: 0.5, ease: 'brand' });
      let lastLeft = viewportEl.scrollLeft;
      let lastTime = performance.now();
      let settleTimer = 0;
      const onScroll = () => {
        const now = performance.now();
        const left = viewportEl.scrollLeft;
        const velocity = ((left - lastLeft) / Math.max(1, now - lastTime)) * 1000;
        lastLeft = left;
        lastTime = now;
        progress?.style.setProperty('--pan-progress', (max() ? left / max() : 0).toFixed(4));
        skewTo(Math.max(-MAX_SKEW, Math.min(MAX_SKEW, velocity / -600)));
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => skewTo(0), 120);
      };
      viewportEl.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

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

      // Dragging moves the track's own scroll, never the page's. A proxy
      // carries the drag and its throw; its x maps to scrollLeft = from - x,
      // bounded to the track, and a throw settles on a panel's left edge.
      const proxy = document.createElement('div');
      let from = 0;
      const follow = function (this: { x: number }) {
        viewportEl.scrollLeft = Math.min(max(), Math.max(0, from - this.x));
      };
      const stops = () => {
        const panels = [...trackEl.querySelectorAll<HTMLElement>('[data-pan-panel]')];
        const first = panels[0]?.offsetLeft ?? 0;
        return panels.map((panel) => Math.min(max(), panel.offsetLeft - first)).concat(max());
      };
      const [drag] = Draggable.create(proxy, {
        type: 'x',
        trigger: viewportEl,
        inertia: true,
        edgeResistance: 0.85,
        throwResistance: 3600,
        maxDuration: 1.2,
        minDuration: 0.3,
        allowNativeTouchScrolling: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress() {
          from = viewportEl.scrollLeft;
          gsap.set(proxy, { x: 0 });
          this.applyBounds({ minX: from - max(), maxX: from });
          // Native snapping would fight the drag; the throw snaps instead.
          section.dataset.panDragging = '';
          untilt();
          delete section.dataset.panHover;
        },
        snap: {
          x: (endX: number) => {
            const target = from - endX;
            const nearest = stops().reduce((best, stop) => (Math.abs(stop - target) < Math.abs(best - target) ? stop : best), target);
            return from - nearest;
          },
        },
        onDrag: follow,
        onThrowUpdate: follow,
        onThrowComplete() {
          delete section.dataset.panDragging;
        },
        onRelease() {
          if (!this.isThrowing) delete section.dataset.panDragging;
          if (fine) section.dataset.panHover = '';
        },
      });

      const onMove = (event: PointerEvent) => {
        if (!fine) return;
        const box = viewportEl.getBoundingClientRect();
        // The chip rides beside the pointer, never on the words under it,
        // and steps away over links and buttons, which click rather than drag.
        chipX?.(event.clientX - box.left + 18);
        chipY?.(event.clientY - box.top + 22);
        const target = event.target as Element | null;
        section.toggleAttribute('data-pan-clickable', Boolean(target?.closest('a, button')));
        const panel = target?.closest<HTMLElement>('[data-pan-panel]') ?? null;
        if (panel !== tilted) untilt();
        if (!panel || drag.isPressed || drag.isThrowing) return;
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

      // Panels slide under the fixed chapter rail; step it aside while the
      // corridor holds the middle of the screen.
      const centred = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) document.documentElement.dataset.corridor = '';
          else delete document.documentElement.dataset.corridor;
        },
        { rootMargin: '-45% 0px -45% 0px' },
      );
      centred.observe(viewportEl);

      return () => {
        window.clearTimeout(settleTimer);
        centred.disconnect();
        delete document.documentElement.dataset.corridor;
        viewportEl.removeEventListener('scroll', onScroll);
        viewportEl.removeEventListener('pointermove', onMove);
        viewportEl.removeEventListener('pointerenter', onEnter);
        viewportEl.removeEventListener('pointerleave', onLeave);
        drag.kill();
        gsap.set(trackEl, { clearProps: 'transform' });
        gsap.set(trackEl.querySelectorAll('[data-pan-panel]'), { clearProps: 'transform' });
        delete section.dataset.pan;
        delete section.dataset.panHover;
        delete section.dataset.panDragging;
        section.removeAttribute('data-pan-clickable');
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
      <div className="pan__pin">
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
