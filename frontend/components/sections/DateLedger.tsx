import { formatEventDate } from '@shared/lib/site-config';

export interface LedgerDate {
  /** ISO date. Rows without one ("7 days before Day 1") sort by `after`. */
  iso?: string;
  what: string;
  note?: string;
}

/**
 * Deadlines in date order, each marked passed, next or later against the
 * page's render time. A row with no fixed date shows its note in the date
 * column and is never marked.
 */
export function DateLedger({ dates, now, className }: { dates: LedgerDate[]; now: number; className?: string }) {
  const today = new Date(now).toISOString().slice(0, 10);
  const dated = dates.filter((d) => d.iso).sort((a, b) => a.iso!.localeCompare(b.iso!));
  const nextIso = dated.find((d) => d.iso! >= today)?.iso;
  const rows = [...dated, ...dates.filter((d) => !d.iso)];

  return (
    <ol className={className ? `dates ${className}` : 'dates'}>
      {rows.map((entry) => {
        const state = !entry.iso ? 'later' : entry.iso < today ? 'past' : entry.iso === nextIso ? 'next' : 'later';
        return (
          <li key={`${entry.iso ?? 'tbc'}-${entry.what}`} className="date-row" data-state={state}>
            {entry.iso ? <time dateTime={entry.iso}>{formatEventDate(entry.iso, { month: 'short' })}</time> : <span className="date-row__note">To be fixed</span>}
            <span>
              <span className="date-row__what">{entry.what}</span>
              {entry.note && <span className="date-row__note block">{entry.note}</span>}
            </span>
            <span className="date-row__state">{state === 'past' ? 'Passed' : state === 'next' ? 'Next' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
