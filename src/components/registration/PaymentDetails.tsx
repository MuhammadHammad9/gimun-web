import { cn } from '@/lib/utils';

/**
 * Bank transfer details from the settings, one "Label: value" per line. Lines
 * without a label (such as the refund note) are shown as a footnote.
 */
export function PaymentDetails({ instructions, className }: { instructions?: string; className?: string }) {
  if (!instructions?.trim()) return null;
  const lines = instructions.split('\n').map((line) => line.trim()).filter(Boolean);
  const fields = lines.flatMap((line) => {
    const match = line.match(/^([^:]{2,40}):\s*(.+)$/);
    return match ? [{ term: match[1], value: match[2] }] : [];
  });
  const notes = lines.filter((line) => !/^([^:]{2,40}):\s*(.+)$/.test(line));
  return (
    <div className={cn('rounded-2xl border border-line-2 p-5 sm:p-6', className)}>
      <dl className="grid gap-x-6 gap-y-3 text-small sm:grid-cols-[minmax(9rem,auto)_1fr]">
        {fields.map(({ term, value }) => (
          <div key={term} className="contents">
            <dt className="text-text-3">{term}</dt>
            <dd className="font-mono text-text [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      {notes.map((note) => (
        <p key={note} className="mt-4 text-[0.8125rem] font-medium text-text-2">{note}</p>
      ))}
    </div>
  );
}
