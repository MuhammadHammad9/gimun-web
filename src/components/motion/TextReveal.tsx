'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { maskUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface TextRevealProps {
  /** Plain text to reveal word by word. */
  text: string;
  /** Rendered element. Headlines should pass the real heading level. */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  /** Seconds between each word. */
  stagger?: number;
  /** Seconds before the first word moves. */
  delay?: number;
  /**
   * Words that should carry the accent colour, matched case-insensitively and
   * ignoring punctuation. Lets a headline keep a single `<h1>` and still
   * highlight a phrase.
   */
  accentWords?: string[];
  accentClassName?: string;
  /**
   * Reveal on load rather than on scroll. Use for above-the-fold headlines.
   *
   * This path is deliberately CSS-only — see the note on the component below.
   */
  immediate?: boolean;
}

const strip = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

/**
 * Per-word masked reveal — words slide up from behind a clipping line.
 *
 * Two implementations, chosen by `immediate`:
 *
 *  - **`immediate` (above the fold): pure CSS.** Framer Motion writes its
 *    `initial` variant into the server-rendered HTML, so using it here would
 *    ship the hero headline as `opacity: 0` and leave it invisible until React
 *    hydrated. On a throttled mobile profile that measured as a multi-second
 *    LCP render delay. A CSS animation runs at first paint instead, needs no
 *    JavaScript, and the global `prefers-reduced-motion` rule collapses it to
 *    the finished state.
 *
 *  - **scroll-triggered: Framer Motion.** Below the fold there is no LCP cost,
 *    and `whileInView` gives proper viewport triggering.
 *
 * In both cases the complete string is present as real text inside the
 * heading, so assistive tech and crawlers see one uninterrupted phrase.
 */
export function TextReveal({
  text,
  as = 'h2',
  className,
  stagger = 0.045,
  delay = 0,
  accentWords,
  accentClassName = 'text-gradient-champagne',
  immediate = false,
}: TextRevealProps) {
  const reduced = useReducedMotion();
  const Tag = as as React.ElementType;

  const accentSet = useMemo(
    () => new Set((accentWords ?? []).map(strip)),
    [accentWords]
  );

  const words = text.split(' ');

  // Stagger has to be declared inside the parent's own `visible` variant.
  // Passing it through the `transition` prop does not orchestrate children.
  const container: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: { staggerChildren: stagger, delayChildren: delay },
      },
    }),
    [stagger, delay]
  );

  if (immediate) {
    return (
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="reveal-line inline-block align-bottom">
            <span
              className={cn('word-rise', accentSet.has(strip(word)) && accentClassName)}
              style={{ animationDelay: `${delay + i * stagger}s` }}
            >
              {word}
            </span>
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </Tag>
    );
  }

  if (reduced) {
    return (
      <Tag className={className}>
        {accentSet.size === 0
          ? text
          : words.map((word, i) => (
              <React.Fragment key={`${word}-${i}`}>
                {i > 0 ? ' ' : ''}
                <span className={accentSet.has(strip(word)) ? accentClassName : undefined}>
                  {word}
                </span>
              </React.Fragment>
            ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {/* The full string, available to assistive tech as one continuous label. */}
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="reveal-line inline-block align-bottom">
            <motion.span
              variants={maskUp}
              className={cn(
                'inline-block will-change-transform',
                accentSet.has(strip(word)) && accentClassName
              )}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export default TextReveal;
