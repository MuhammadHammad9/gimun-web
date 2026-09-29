import type { ReactNode } from 'react';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { cn } from '@/lib/utils';

/**
 * A chapter heading: the h2, and optionally a lead set beside it (split) or
 * under it. `reveal` makes the heading's lines rise as it scrolls in; keep
 * that for one or two chapters a page, not every one.
 */
export function ChapterHead({
  id,
  title,
  lead,
  split = true,
  reveal = false,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  split?: boolean;
  reveal?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn('chapter-head', split && lead && 'chapter-head--split', className)}>
      {reveal ? (
        <SplitReveal id={id} className="chapter-title">
          {title}
        </SplitReveal>
      ) : (
        <h2 id={id} className="chapter-title">
          {title}
        </h2>
      )}
      {lead && <div className="chapter-lead">{lead}</div>}
      {children}
    </header>
  );
}
