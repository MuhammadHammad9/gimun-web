import type { ReactNode } from 'react';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { cn } from '@/lib/utils';

/**
 * The numbered line above a chapter title: "02 · The choice". It is also the
 * marker ChapterIndex reads to build a page's chapter rail, so the rail
 * always matches what the page actually shows.
 */
export function ChapterKicker({ chapter, act, target }: { chapter: number; act: string; target: string }) {
  const number = String(chapter).padStart(2, '0');
  return (
    <p className="chapter-kicker" data-chapter={act} data-chapter-number={number} data-chapter-target={target}>
      <span className="chapter-kicker__num">{number}</span>
      <span aria-hidden="true" className="chapter-kicker__rule" />
      <span>{act}</span>
    </p>
  );
}

/**
 * A chapter heading: the numbered kicker, the h2, and optionally a lead set
 * beside it (split) or under it. `reveal` makes the heading's lines rise as
 * it scrolls in; keep that for one or two chapters a page, not every one.
 */
export function ChapterHead({
  id,
  title,
  lead,
  chapter,
  act,
  split = true,
  reveal = false,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Chapter number in the page's story; shown with `act` above the title. */
  chapter?: number;
  act?: string;
  split?: boolean;
  reveal?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn('chapter-head', split && lead && 'chapter-head--split', className)}>
      <div className="chapter-head__main">
        {chapter !== undefined && act && <ChapterKicker chapter={chapter} act={act} target={id} />}
        {reveal ? (
          <SplitReveal id={id} className="chapter-title">
            {title}
          </SplitReveal>
        ) : (
          <h2 id={id} className="chapter-title">
            {title}
          </h2>
        )}
      </div>
      {lead && <div className="chapter-lead">{lead}</div>}
      {children}
    </header>
  );
}
