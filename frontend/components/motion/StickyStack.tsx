'use client';

import { useRef, type ReactNode } from 'react';
import { useEnhance } from './useEnhance';

/**
 * Cards that stick one after another. Without JavaScript this is already a
 * working stack (CSS sticky, each card peeking below the last). The
 * enhancement makes each earlier card recede (scale and shade) as the next
 * arrives, scrubbed to the scroll position so it can never get stuck.
 */
export function StickyStack({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEnhance(ref, async (stack, signal) => {
    const cards = [...stack.querySelectorAll<HTMLElement>(':scope > .stack__card')];
    if (cards.length < 2) return;
    const { gsap } = await import('@frontend/motion/gsap');
    if (signal.aborted) return;
    const timelines = cards.slice(0, -1).map((card, index) => {
      const next = cards[index + 1];
      const shade = card.querySelector('.stack__shade');
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: () => `top top+=${parseFloat(getComputedStyle(next).top) || 0}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      timeline.to(card, { scale: 0.94, ease: 'none' }, 0);
      if (shade) timeline.to(shade, { opacity: 0.5, ease: 'none' }, 0);
      return timeline;
    });
    return () => {
      for (const timeline of timelines) {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      }
      gsap.set(cards, { clearProps: 'transform' });
      gsap.set(stack.querySelectorAll('.stack__shade'), { clearProps: 'opacity' });
    };
  });

  return (
    <div ref={ref} className={className ? `stack ${className}` : 'stack'}>
      {children}
    </div>
  );
}
