'use client';

import { useRef } from 'react';
import { useEnhance } from '@frontend/components/motion/useEnhance';

const TILT_DEG = 10;

/**
 * The hero seal's signature, after the visitor's first intent:
 *
 * - it leans toward the pointer (a 3D tilt on the wrapper, compositor-only,
 *   fine pointers on the full tier);
 * - as chapter 01 slides over the hero, the two rooms open: the globe and the
 *   scales part toward their doors, the centre line withdraws from the middle
 *   and the inner rules unwind ring by ring. Scrubbed, so scrolling back
 *   closes the seal again.
 *
 * Until then (and under reduced motion) the seal is its server-rendered SVG.
 */
export function SealMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useEnhance(
    marker,
    async (node, signal, tier) => {
      const seal = node.closest<HTMLElement>('.seal');
      if (!seal) return;
      const motion = await import('@frontend/motion/gsap');
      await motion.drawSVG();
      if (signal.aborted) return;
      const { gsap } = motion;
      const cleanups: (() => void)[] = [];

      const scene = seal.closest<HTMLElement>('.handoff__scene') ?? seal;
      if (tier === 'full' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gsap.set(seal, { transformPerspective: 900 });
        const rotateX = gsap.quickTo(seal, 'rotationX', { duration: 0.7, ease: 'brand' });
        const rotateY = gsap.quickTo(seal, 'rotationY', { duration: 0.7, ease: 'brand' });
        const move = (event: PointerEvent) => {
          const box = seal.getBoundingClientRect();
          const dx = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
          const dy = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
          rotateY(Math.max(-1, Math.min(1, dx * 2)) * TILT_DEG);
          rotateX(Math.max(-1, Math.min(1, dy * 2)) * -TILT_DEG);
        };
        const rest = () => {
          rotateX(0);
          rotateY(0);
        };
        scene.addEventListener('pointermove', move, { passive: true });
        scene.addEventListener('pointerleave', rest);
        cleanups.push(() => {
          scene.removeEventListener('pointermove', move);
          scene.removeEventListener('pointerleave', rest);
          gsap.set(seal, { clearProps: 'transform' });
        });
      }

      const sheet = seal.closest('.handoff')?.querySelector('.handoff__sheet');
      const gimun = seal.querySelector('[data-half="gimun"]');
      const gmc = seal.querySelector('[data-half="gmc"]');
      const divide = seal.querySelector('.seal__divide');
      const inner = seal.querySelectorAll('.seal__inner');
      const ring = seal.querySelector('.seal__ring > svg');
      if (sheet && gimun && gmc && divide && ring) {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 25%', scrub: 0.6 },
          defaults: { ease: 'none' },
        });
        timeline
          .to(gimun, { x: -34, rotation: -5, svgOrigin: '200 200' }, 0)
          .to(gmc, { x: 34, rotation: 5, svgOrigin: '200 200' }, 0)
          .fromTo(divide, { drawSVG: '0% 100%' }, { drawSVG: '50% 50%' }, 0)
          .fromTo(inner, { drawSVG: '0% 100%' }, { drawSVG: '0% 0%', stagger: 0.12 }, 0.1)
          .to(ring, { scale: 1.08, opacity: 0.35, transformOrigin: '50% 50%' }, 0);
        cleanups.push(() => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set([gimun, gmc, divide, ...inner, ring], { clearProps: 'all' });
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { near: '0px', tiers: ['lite', 'full'] },
  );

  // Not `hidden`: the visibility gate observes this marker, and an element
  // with display:none never intersects. It is empty and ignores the pointer.
  return <span ref={marker} aria-hidden="true" style={{ pointerEvents: 'none' }} />;
}
