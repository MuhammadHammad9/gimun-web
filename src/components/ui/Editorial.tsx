import React from 'react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/*
 * The editorial kit shared by the track, about and registration pages.
 * Hairline rules and typography carry the structure; a raised "bezel" panel
 * is reserved for the one or two things on a page that deserve weight.
 */

export function Eyebrow({ children, tone = 'champagne' }: { children: React.ReactNode; tone?: 'champagne' | 'crimson' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em]',
        tone === 'crimson' ? 'border-crimson/35 bg-crimson/10 text-crimson-soft' : 'border-line-2 bg-champagne/5 text-champagne'
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  action,
  tone,
  stacked = false,
  className,
}: {
  /** Keep the action link under the text, for narrow (sidebar) columns. */
  stacked?: boolean;
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  action?: { label: string; href: string };
  tone?: 'champagne' | 'crimson';
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6', !stacked && 'md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl space-y-4">
        {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-h2 font-display font-medium text-balance text-text">
          {title}
        </h2>
        {lead && <p className="text-lead text-pretty text-text-3">{lead}</p>}
      </div>
      {action && <TextLink href={action.href}>{action.label}</TextLink>}
    </div>
  );
}

export function TextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-champagne transition-colors duration-300 ease-[var(--ease-brand)] hover:text-text',
        className
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Double-bezel panel: a thin outer tray holding a raised inner plate, with
 * concentric radii. Use sparingly — one or two per page.
 */
export function Bezel({
  children,
  className,
  innerClassName,
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  accent?: 'gimun' | 'moot';
}) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border p-1.5',
        accent === 'gimun' ? 'border-crimson/25 bg-crimson/[0.04]' : 'border-line bg-champagne/[0.025]',
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-[calc(1.75rem-0.375rem)] bg-raised shadow-[inset_0_1px_0_rgba(255,236,210,0.07)]',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** A numbered process on one hairline, instead of a row of identical cards. */
export function Steps({ steps, tone = 'champagne' }: { steps: { title: string; body: string }[]; tone?: 'champagne' | 'crimson' }) {
  return (
    <ol className={cn('rise-stagger grid gap-10 md:gap-8', steps.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3')}>
      {steps.map((step, i) => (
        <li key={step.title} style={{ '--i': i } as React.CSSProperties} className="relative border-t border-line pt-6">
          <span
            aria-hidden="true"
            className={cn('absolute -top-px left-0 h-px w-10', tone === 'crimson' ? 'bg-crimson-soft' : 'bg-champagne')}
          />
          <span className={cn('font-mono text-xs tabular-nums', tone === 'crimson' ? 'text-crimson-soft' : 'text-champagne')}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-3 text-lg font-display font-medium text-text">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-text-3">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

export type LedgerRow = { key: string; href: string; title: string; description: string; meta: string[] };

/** Full-width numbered rows: any count reads cleanly, unlike a card grid. */
export function Ledger({ rows, tone = 'champagne' }: { rows: LedgerRow[]; tone?: 'champagne' | 'crimson' }) {
  const accent = tone === 'crimson' ? 'text-crimson-soft' : 'text-champagne';
  return (
    <ol className="rise-stagger border-b border-line">
      {rows.map((row, i) => (
        <li key={row.key} style={{ '--i': i } as React.CSSProperties}>
          <Link
            href={row.href}
            className="group -mx-3 grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 rounded-xl border-t border-line px-3 py-6 transition-colors duration-300 ease-[var(--ease-brand)] hover:bg-raised/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
          >
            <span className={cn('pt-1 font-mono text-xs tabular-nums', accent)}>{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0 space-y-2">
              <span className="block text-lg font-display font-medium leading-snug text-text transition-colors group-hover:text-champagne">
                {row.title}
              </span>
              <span className="line-clamp-2 block text-sm leading-relaxed text-text-3">{row.description}</span>
              <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] capitalize text-text-4">
                {row.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 h-4 w-4 text-text-4 transition-all duration-300 ease-[var(--ease-brand)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Label/value rows on hairlines. */
export function FactList({ items, className }: { items: { term: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn('border-b border-line', className)}>
      {items.map((item) => (
        <div key={item.term} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
          <dt className="text-sm text-text-4">{item.term}</dt>
          <dd className="text-sm leading-relaxed text-text-2">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Standard page section spacing and width. */
export function PageSection({
  children,
  className,
  labelledBy,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('mx-auto max-w-7xl scroll-mt-32 px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  );
}
