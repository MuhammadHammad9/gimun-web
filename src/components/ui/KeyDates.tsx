import { formatEventDate, isRegistrationDeadlinePassed } from '@/lib/site-config';

export type KeyDate = { label: string; date?: string; note?: string };

/**
 * A track's deadlines in one row, with past dates marked. Dates without a
 * value are listed as "To be announced" rather than hidden, so the gap is
 * visible to applicants and to the organizing team.
 */
export function KeyDates({ title = 'Key dates', dates }: { title?: string; dates: KeyDate[] }) {
  return (
    <section aria-labelledby="key-dates-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 id="key-dates-heading" className="text-h2 font-display font-medium text-text">
        {title}
      </h2>
      <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {dates.map((item) => {
          const past = item.date ? isRegistrationDeadlinePassed(item.date) : false;
          return (
            <li key={item.label} className="bg-canvas p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-4">{item.label}</p>
              <p className={`mt-2 text-xl font-display font-medium ${past ? 'text-text-4 line-through decoration-1' : 'text-text'}`}>
                {item.date ? formatEventDate(item.date) : 'To be announced'}
              </p>
              {(item.note || past) && (
                <p className="mt-1 text-sm text-text-3">{past ? 'Passed' : item.note}</p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
