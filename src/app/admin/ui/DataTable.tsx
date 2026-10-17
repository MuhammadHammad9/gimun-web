import type { ReactNode } from 'react';

export type Column<Row> = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  /** Hidden on phones, where each row becomes a card. */
  secondary?: boolean;
};

const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });

/** One cell in plain words: Yes/No, lists, Pakistan-time dates, status pills. */
export function formatCell(key: string, value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return <span className="admin-muted">—</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : <span className="admin-muted">—</span>;
  if (key.endsWith('_at')) return pkt(String(value));
  if (key.includes('status') || key === 'state') return <span className="admin-status">{String(value).replaceAll('_', ' ').replaceAll('-', ' ')}</span>;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * The records table every operations page shares. On phones each row becomes
 * a card with its labels, instead of a table that scrolls sideways.
 */
export function DataTable<Row extends Record<string, unknown>>({ rows, columns, rowKey, caption, empty, actions }: {
  rows: Row[];
  columns: Column<Row>[];
  rowKey: (row: Row) => string;
  caption: ReactNode;
  empty: ReactNode;
  actions?: (row: Row) => ReactNode;
}) {
  return <div className="admin-card admin-table admin-datatable" role="region" aria-label="Records" tabIndex={0}>
    <h2>{caption}</h2>
    {rows.length ? <table>
      <thead><tr>{columns.map((c) => <th key={c.key} scope="col" className={c.secondary ? 'is-secondary' : undefined}>{c.label}</th>)}{actions && <th scope="col"><span className="sr-only">Actions</span></th>}</tr></thead>
      <tbody>{rows.map((row) => <tr key={rowKey(row)}>
        {columns.map((c) => <td key={c.key} data-label={c.label} className={c.secondary ? 'is-secondary' : undefined}>{c.render ? c.render(row) : formatCell(c.key, row[c.key])}</td>)}
        {actions && <td className="admin-datatable__actions">{actions(row)}</td>}
      </tr>)}</tbody>
    </table> : <div className="admin-empty">{empty}</div>}
  </div>;
}
