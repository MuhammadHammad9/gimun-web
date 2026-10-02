import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';

/**
 * The line that hands one chapter to the next: a sentence that says why the
 * next chapter matters, linking to it. Used at the story's key turns only,
 * two or three a page. ChapterIndex makes the jump glide; without it the
 * link is an ordinary anchor.
 */
export function Bridge({ to, children }: { to: string; children: ReactNode }) {
  return (
    <p className="bridge">
      <a href={`#${to}`} className="bridge__link" data-chapter-link="">
        <span>{children}</span>
        <ArrowDown aria-hidden="true" strokeWidth={1.75} className="bridge__arrow" />
      </a>
    </p>
  );
}
