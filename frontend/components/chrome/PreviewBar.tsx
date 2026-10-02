'use client';

import { usePathname } from 'next/navigation';
import { exitPreview } from '@/app/preview-actions';

/**
 * Shown only to an editor in draft preview: the page includes unpublished
 * working copies. Exiting returns to the same page as visitors see it.
 */
export function PreviewBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <aside className="preview-bar" aria-label="Draft preview">
      <span className="preview-bar__dot" aria-hidden="true" />
      <p>
        <strong>Draft preview.</strong> Unpublished changes are visible only to you.
      </p>
      <form action={exitPreview}>
        <input type="hidden" name="path" value={pathname} />
        <button type="submit" className="preview-bar__exit">Exit preview</button>
      </form>
    </aside>
  );
}
