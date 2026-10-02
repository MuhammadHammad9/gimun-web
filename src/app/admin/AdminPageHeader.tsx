import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/** The top of every admin screen: where you are, what it is for, what you can do. */
export function AdminPageHeader({ title, description, crumbs = [], actions }: { title: string; description?: ReactNode; crumbs?: { label: string; href: string }[]; actions?: ReactNode }) {
  return (
    <header className="admin-page-head">
      <div>
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="admin-crumbs">
            {crumbs.map((crumb) => (
              <span key={crumb.href}>
                <Link href={crumb.href}>{crumb.label}</Link>
                <ChevronRight size={13} aria-hidden="true" />
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {description && <p className="admin-page-head__lead">{description}</p>}
      </div>
      {actions && <div className="admin-page-head__actions">{actions}</div>}
    </header>
  );
}
