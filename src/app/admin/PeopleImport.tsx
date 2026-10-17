'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, UserPlus } from 'lucide-react';
import { parseCsv } from '@/lib/csv';
import { addPerson, importPeople } from './people-actions';
import { useNotice } from './ui/Notice';

type Field = 'name' | 'email' | 'institution' | 'role' | 'committees' | 'country';
const FIELDS: { key: Field; label: string; required?: boolean; guess: RegExp }[] = [
  { key: 'name', label: 'Full name', required: true, guess: /full ?name|^name|participant|delegate name/i },
  { key: 'email', label: 'Email', required: true, guess: /e-?mail/i },
  { key: 'institution', label: 'Institution', guess: /institut|universit|college|school|organi/i },
  { key: 'role', label: 'Role', guess: /^role|category|type of/i },
  { key: 'committees', label: 'Committee preferences', guess: /committee|preference/i },
  { key: 'country', label: 'Country preference', guess: /country/i },
];
const PAYMENTS = [{ value: 'paid', label: 'Paid' }, { value: 'pending_verification', label: 'Waiting for verification' }, { value: 'waived', label: 'Waived' }, { value: 'unpaid', label: 'Not paid yet' }];
const EVENT_LABELS: Record<string, string> = { gimun: 'GIMUN', 'moot-cup': 'GMC' };
const validEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

/**
 * Brings people onto the roster: upload the Google Forms responses (File ›
 * Download › CSV), match its columns, check the preview, import. Or add one
 * person by hand.
 */
export function PeopleImport({ events }: { events: string[] }) {
  const [rows, setRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const [map, setMap] = useState<Partial<Record<Field, number[]>>>({});
  const [event, setEvent] = useState(events[0] ?? 'gimun');
  const [payment, setPayment] = useState('paid');
  const [pending, start] = useTransition();
  const notice = useNotice();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const headers = rows[0] ?? [];
  const body = rows.slice(1);

  function load(file: File) {
    // FileReader rather than file.text(), which some older browsers lack.
    const reader = new FileReader();
    reader.onerror = () => notice({ text: 'That file could not be read. Download it again as CSV and retry.', tone: 'error' });
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const parsed = parseCsv(text);
      if (parsed.length < 2) { notice({ text: 'That file has no responses in it.', tone: 'error' }); return; }
      setRows(parsed); setFileName(file.name);
      const guessed: Partial<Record<Field, number[]>> = {};
      for (const f of FIELDS) {
        const matches = parsed[0].map((h, i) => (f.guess.test(h) ? i : -1)).filter((i) => i >= 0);
        if (matches.length) guessed[f.key] = f.key === 'committees' ? matches.filter((i) => !Object.values(guessed).flat().includes(i)).slice(0, 3) : [matches.find((i) => !Object.values(guessed).flat().includes(i)) ?? matches[0]];
      }
      setMap(guessed);
    };
    reader.readAsText(file);
  }
  // A file picked before the page finished loading raised no change event; read it now.
  useEffect(() => {
    const file = fileInput.current?.files?.[0];
    if (file) load(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);
  const people = useMemo(() => body.map((r) => {
    const pick = (f: Field) => (map[f] ?? []).map((i) => (r[i] ?? '').trim()).filter(Boolean);
    return { name: pick('name')[0] ?? '', email: (pick('email')[0] ?? '').toLowerCase(), institution: pick('institution')[0], role: pick('role')[0]?.toLowerCase().replace(/\s+/g, '-'), committees: pick('committees').flatMap((v) => v.split(/[;,]/)).map((v) => v.trim()).filter(Boolean).slice(0, 3), country: pick('country')[0] };
  }), [body, map]);
  const problems = people.filter((p) => p.name.length < 2 || !validEmail(p.email)).length;
  const seen = new Set<string>(); let duplicates = 0;
  for (const p of people) { if (seen.has(p.email)) duplicates++; seen.add(p.email); }
  const ready = people.filter((p, i) => p.name.length >= 2 && validEmail(p.email) && people.findIndex((q) => q.email === p.email) === i);

  function runImport() {
    start(async () => {
      let created = 0, updated = 0;
      for (let i = 0; i < ready.length; i += 500) {
        const result = await importPeople({ event, payment, rows: ready.slice(i, i + 500) });
        if (result.error) { notice({ text: `${created + updated ? `${created + updated} people saved before this: ` : ''}${result.error}`, tone: 'error' }); router.refresh(); return; }
        created += result.created ?? 0; updated += result.updated ?? 0;
      }
      notice({ text: `${created} added and ${updated} updated on the ${EVENT_LABELS[event]} roster.` });
      setRows([]); setFileName(''); router.refresh();
    });
  }

  return <section className="admin-card" aria-labelledby="import-title">
    <h2 id="import-title">Add people</h2>
    <div className="admin-import-settings">
      <label>Event<select value={event} onChange={(e) => setEvent(e.target.value)} disabled={events.length < 2}>{events.map((e) => <option key={e} value={e}>{EVENT_LABELS[e]}</option>)}</select></label>
      <label>Payment status<select value={payment} onChange={(e) => setPayment(e.target.value)}>{PAYMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
    </div>
    <details open>
      <summary><FileUp size={15} aria-hidden="true" /> Import a Google Forms CSV</summary>
      <p className="admin-muted">In the form&apos;s responses sheet choose File › Download › Comma-separated values, then pick the file here. Nothing is saved until you press Import.</p>
      <label>CSV file<input ref={fileInput} type="file" accept=".csv,text/csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); }} /></label>
      {rows.length > 0 && <>
        <h3>Match the columns in {fileName}</h3>
        <div className="admin-import-map">{FIELDS.map((f) => <label key={f.key}>{f.label}{f.required ? ' (required)' : ''}
          <select multiple={f.key === 'committees'} value={f.key === 'committees' ? (map[f.key] ?? []).map(String) : String(map[f.key]?.[0] ?? -1)} onChange={(e) => setMap({ ...map, [f.key]: [...e.target.selectedOptions].map((o) => Number(o.value)).filter((n) => n >= 0) })}>
            {f.key !== 'committees' && <option value="-1">Not in this file</option>}
            {headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
          </select></label>)}</div>
        <p role="status"><strong>{ready.length}</strong> ready to import{problems ? ` · ${problems} skipped (missing name or a valid email)` : ''}{duplicates ? ` · ${duplicates} repeated emails counted once` : ''}. People already on the roster with the same email are updated, not added twice.</p>
        <div className="admin-table"><table><thead><tr><th>Name</th><th>Email</th><th>Institution</th><th>Committees</th></tr></thead>
          <tbody>{people.slice(0, 5).map((p, i) => <tr key={i}><td>{p.name || '—'}</td><td>{p.email || '—'}</td><td>{p.institution || '—'}</td><td>{p.committees.join(', ') || '—'}</td></tr>)}</tbody></table>
          {people.length > 5 && <p className="admin-muted">and {people.length - 5} more…</p>}</div>
        <div className="editor-bar__actions">
          <button type="button" className="secondary" onClick={() => { setRows([]); setFileName(''); }}>Cancel</button>
          <button type="button" disabled={pending || !ready.length || !map.name?.length || !map.email?.length} onClick={runImport}>{pending ? 'Importing…' : `Import ${ready.length} to ${EVENT_LABELS[event]}`}</button>
        </div>
      </>}
    </details>
    <details>
      <summary><UserPlus size={15} aria-hidden="true" /> Add one person</summary>
      <form onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget; const f = new FormData(form);
        start(async () => {
          const result = await addPerson({ event, payment, person: { name: String(f.get('name') ?? ''), email: String(f.get('email') ?? ''), institution: String(f.get('institution') ?? ''), role: String(f.get('role') ?? '') } });
          notice({ text: result.error ?? result.result ?? 'Added.', tone: result.error ? 'error' : 'success' });
          if (!result.error) { form.reset(); router.refresh(); }
        });
      }}>
        <div className="admin-import-map">
          <label>Full name<input name="name" required minLength={2} /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Institution<input name="institution" /></label>
          <label>Role<input name="role" placeholder={event === 'gimun' ? 'delegate' : 'team-member'} /></label>
        </div>
        <button type="submit" disabled={pending}>Add to {EVENT_LABELS[event]}</button>
      </form>
    </details>
  </section>;
}
