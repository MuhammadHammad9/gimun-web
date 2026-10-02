'use client';

import { useRef, type ReactNode } from 'react';
import { useEnhance } from './useEnhance';

/**
 * Large statement text that brightens word by word as it scrolls through the
 * viewport. Words never drop below 45 % opacity, and this is only for text of
 * 28 px or more, so every word keeps at least 3:1 contrast even mid-scroll.
 * Server-rendered fully opaque; reduced motion keeps it that way.
 */
export function ScrubText({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEnhance(ref, async (paragraph, signal) => {
    const { gsap, SplitText } = await import('@frontend/motion/gsap');
    if (signal.aborted) return;
    const split = SplitText.create(paragraph, { type: 'words', aria: 'none' });
    const tween = gsap.fromTo(
      split.words,
      { opacity: 0.45 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: paragraph, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, { near: '100% 0px' });

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
}
