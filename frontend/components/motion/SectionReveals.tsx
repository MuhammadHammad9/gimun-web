'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { firstIntent, unlessAborted } from '@frontend/motion/gates';
import { motionTier } from '@frontend/motion/policy';

/**
 * Section hand-offs for the whole public site: each paper or crest sheet
 * (`.sheet`) unfolds from an inset, rounded card to full bleed as it scrolls
 * in, so a change of ground reads as a new chapter arriving rather than a
 * hard cut. Scrubbed with the scroll; full tier only (clip-path repaints, so
 * phones keep the plain edge) and never before the first intent. Re-runs for
 * each page.
 */
export function SectionReveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (motionTier() !== 'full') return;
    const controller = new AbortController();
    let cleanup: (() => void) | undefined;
    (async () => {
      await unlessAborted(firstIntent(), controller.signal);
      const { gsap } = await import('@frontend/motion/gsap');
      if (controller.signal.aborted) return;
      const sheets = [...document.querySelectorAll<HTMLElement>('#main-content .sheet')];
      const tweens = sheets.map((sheet) =>
        gsap.fromTo(
          sheet,
          { clipPath: 'inset(3% 3.5% round 2rem)' },
          {
            clipPath: 'inset(0% 0% round 0rem)',
            ease: 'none',
            scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 35%', scrub: 0.5 },
          },
        ),
      );
      cleanup = () => {
        for (const tween of tweens) {
          tween.scrollTrigger?.kill();
          tween.kill();
        }
        gsap.set(sheets, { clearProps: 'clipPath' });
      };
    })().catch(() => undefined); // Optional motion: a failed chunk load leaves the page static.
    return () => {
      controller.abort();
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
