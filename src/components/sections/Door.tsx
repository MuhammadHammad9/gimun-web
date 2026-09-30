import type { ReactNode } from 'react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface DoorFact {
  term: string;
  value: ReactNode;
}

/**
 * One of a pair of "doors": a tall panel for a track or an entry route,
 * with a large mark, a short case for it, the facts that decide it, and the
 * way in. Pairs sit in `.doors`, which joins them at a seam on wide screens
 * and parts them slightly as they scroll in.
 */
export function Door({
  id,
  accent,
  label,
  status,
  open,
  mark,
  title,
  copy,
  facts,
  action,
  secondary,
  art,
}: {
  id: string;
  accent: 'gimun' | 'gmc';
  label: string;
  /** Short state line in the top corner, e.g. "Applications open". */
  status?: string;
  /** Highlights the status in the accent colour. */
  open?: boolean;
  /** Large decorative mark (hidden from assistive tech). */
  mark?: string;
  title: string;
  copy: ReactNode;
  facts: DoorFact[];
  action: { label: string; href: string };
  secondary?: { label: string; href: string };
  art?: ReactNode;
}) {
  return (
    <article className={cn('door', accent === 'gimun' ? 'door--gimun' : 'door--gmc', !mark && 'door--compact')} aria-labelledby={id} data-glow="">
      <div className="door__top">
        <span>{label}</span>
        {status && (
          <span className="door__status" data-open={open ? '' : undefined}>
            {status}
          </span>
        )}
      </div>
      {mark && (
        <p className="door__mark" aria-hidden="true" data-text={mark}>
          {mark}
        </p>
      )}
      <h3 id={id} className={cn('door__name', !mark && 'mt-10')}>
        {title}
      </h3>
      <div className="door__copy">{copy}</div>
      <dl className="door__facts">
        {facts.map((fact) => (
          <div key={fact.term}>
            <dt>{fact.term}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="door__actions">
        <Button href={action.href} variant={accent === 'gimun' ? 'track-gimun' : 'track-moot'} withArrow>
          {action.label}
        </Button>
        {secondary && (
          <Link href={secondary.href} className="text-link">
            {secondary.label}
          </Link>
        )}
      </div>
      {art && <div className="door__art">{art}</div>}
    </article>
  );
}
