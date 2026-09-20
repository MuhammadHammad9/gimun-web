import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  /** Omit on the final crumb — the current page is not a link. */
  href?: string;
}

/**
 * Breadcrumb trail for nested routes.
 *
 * The site goes three levels deep (`/gimun/committees/unsc`) and previously
 * offered no way to tell where you were or step back up — you could only use
 * the browser's back button or return to a top-level nav item.
 *
 * Renders a real `<nav>` + ordered list with `aria-current="page"` on the leaf,
 * which is what assistive tech uses to announce position.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('print:hidden', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-meta uppercase tracking-[0.14em] text-text-3">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded transition-colors hover:text-champagne"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-champagne">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight aria-hidden="true" className="h-3 w-3 text-text-4" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
