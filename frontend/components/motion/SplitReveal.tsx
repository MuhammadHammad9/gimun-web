'use client';

import { useRef, type ReactNode } from 'react';
import { isOnScreen, useEnhance } from './useEnhance';

type HeadingTag = 'h1' | 'h2' | 'h3';

/**
 * A heading whose lines rise out of their own masks as it scrolls in.
 *
 * Server-rendered as a normal heading at full opacity. After the visitor's
 * first intent, a heading still below the viewport is split into lines
 * (GSAP SplitText) and set just below its masks; it rises once, then the
 * split is reverted so the DOM is plain text again. Headings already seen
 * are left alone. Headings only: text must stay a plain run of words.
 */
export function SplitReveal({
  as: Tag = 'h2',
  id,
  className,
  children,
}: {
  as?: HeadingTag;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEnhance(ref, async (heading, signal) => {
    if (isOnScreen(heading)) return;
    const { gsap, SplitText } = await import('@frontend/motion/gsap');
    if (signal.aborted || isOnScreen(heading)) return;
    const split = SplitText.create(heading, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' });
    gsap.set(split.lines, { yPercent: 105 });
    const tween = gsap.to(split.lines, {
      yPercent: 0,
      duration: 1,
      ease: 'lift',
      stagger: 0.08,
      scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
      onComplete: () => split.revert(),
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  });

  return (
    <Tag ref={ref} id={id} className={className} data-split="">
      {children}
    </Tag>
  );
}
