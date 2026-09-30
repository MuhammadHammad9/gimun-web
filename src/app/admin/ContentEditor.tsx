'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, ChevronDown, CircleDashed, Eye, EyeOff, History, PencilLine, Send, Undo2 } from 'lucide-react';
import { SchemaForm, emptyValue, type Schema } from './SchemaForm';
import { saveContent, saveSettings, restoreRevision, cancelSchedule } from './content-actions';
import type { ContentEntry } from '@/lib/content/registry';
import type { UploadedMedia } from './media-actions';
import { MediaContext } from './MediaField';
import { useDirtyGuard } from './useDirtyGuard';

const groups: Record<string, string[]> = {
  'Event details': ['eventNames', 'hostInstitution', 'venue', 'eventDates', 'galaDate', 'phaseOverride'],
  'Registration & fees': ['registrationDeadlines', 'registrationStatus', 'fees', 'feeAmounts', 'paymentInstructions', 'memorialDeadline'],
  'Contact & arrival': ['contactEmails', 'contactPhone', 'checkinDesk', 'entryRequirement', 'replyTime'],
  'Scoring & results': ['mootScoring', 'gimunRubric', 'resultsPublished'],
  'Website text & links': ['socialLinks', 'footerBlurb', 'privacyNotice', 'stats'],
};
const pkt = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short' });
function localTime(value: string | null) { return value ? new Date(new Date(value).getTime() + 5 * 3600000).toISOString().slice(0, 16) : ''; }
function utc(value: string) { return value ? new Date(`${value}:00+05:00`).toISOString() : null; }
type Saved = { fieldErrors?: Record<string, string>; error?: string; version?: number; entry?: ContentEntry; data?: Record<string, unknown> };
type Mode = 'draft' | 'publish' | 'schedule' | 'archive';

/** Linked-document pickers: these fields hold a document's id, not a link. */
const RESOURCE_FIELDS: Record<string, { key: string; label: string }> = {
  committees: { key: 'backgroundGuideDocId', label: 'Background guide' },
  'moot-categories': { key: 'propositionDocId', label: 'Case problem document' },
};

export function ContentEditor({ initial, schema, settings = false, readOnly = false, revisions = [], media = [], resources = [], upload = false, liveVersion = null, scheduledAt = null, resultsReleased = true, singular = 'entry', publicPath }: { initial: ContentEntry; schema: Schema; settings?: boolean; readOnly?: boolean; revisions?: { id: number; created_at: string }[]; media?: UploadedMedia[]; resources?: { id: string; title: string }[]; upload?: boolean; liveVersion?: number | null; scheduledAt?: string | null; resultsReleased?: boolean; singular?: string; publicPath?: string }) {
  const initialize = () => ({ ...initial, id: settings ? 'site' : String(initial.data.id || initial.id), data: { ...(emptyValue(schema) as Record<string, unknown>), ...initial.data } });
  const [entry, setEntry] = useState(initialize), [dirty, setDirty] = useState(false), [seen, setSeen] = useState(initial.version), [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}), [message, setMessage] = useState(''), [failed, setFailed] = useState(false);
  const [library, setLibrary] = useState(media);
  const [more, setMore] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  useDirtyGuard(dirty);
  if (seen !== initial.version) { setSeen(initial.version); if (!dirty) setEntry(initialize()); }
  const conflict = dirty && entry.version !== initial.version;
  const resourceField = RESOURCE_FIELDS[initial.collection];

  function execute(operation: () => Promise<Saved>, success = 'Saved.') {
    start(async () => {
      try {
        const result = await operation();
        setMessage(result.error || success);
        setFailed(Boolean(result.error));
        setFieldErrors(result.fieldErrors || {});
        if (result.error) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid=true]')?.focus()); return; }
        if (result.version) setEntry(old => ({ ...old, ...result.entry, data: result.entry?.data || result.data || old.data, version: result.version! }));
        setDirty(false);
        if (!settings && initial.version === 0 && entry.id) router.replace(`/admin/content/${entry.collection}/${entry.id}`);
        router.refresh();
      } catch {
        setFailed(true);
        setMessage('Could not save. Your changes are still here; check your connection and try again.');
      }
    });
  }

  // A document picked from the library fills in its size, format and date.
  const change = (v: unknown) => {
    const data = v as Record<string, unknown>;
    const previous = entry.data;
    if (initial.collection === 'resources' && data.fileUrl !== previous.fileUrl) {
      const asset = library.find(a => a.url === data.fileUrl);
      if (asset) Object.assign(data, { fileSize: asset.size >= 1048576 ? `${(asset.size / 1048576).toFixed(1)} MB` : `${Math.round(asset.size / 1024)} KB`, fileFormat: asset.mime === 'application/pdf' ? 'PDF' : asset.mime.split('/')[1].toUpperCase(), versionDate: new Date().toISOString().slice(0, 10) });
    }
    setDirty(true);
    setEntry({ ...entry, data, id: settings ? 'site' : String(data.id || entry.id) });
  };

  function save(mode: Mode) {
    if (settings) { execute(() => saveSettings(entry.data, entry.version), 'Settings saved. The website uses them now.'); return; }
    if (mode === 'schedule' && (!entry.publish_at || new Date(entry.publish_at).getTime() <= Date.now())) { setFailed(true); setMessage('Choose a date and time in the future (Pakistan time) to publish.'); return; }
    if (scheduledAt && mode !== 'draft' && !window.confirm('This replaces the publication that is already scheduled. Continue?')) return;
    if (mode === 'archive' && !window.confirm(`Take this ${singular} off the website? You can publish it again later.`)) return;
    if (mode !== 'draft' && entry.collection === 'announcements' && entry.data.pinnedFlag && !window.confirm('This will become the pinned announcement shown at the top of every page. Continue?')) return;
    execute(
      () => saveContent({ ...entry, status: mode === 'draft' ? 'draft' : mode === 'archive' ? 'archived' : 'published', publish_at: mode === 'schedule' ? entry.publish_at : null, expire_at: mode === 'draft' || mode === 'archive' ? null : entry.expire_at }),
      mode === 'draft' ? 'Draft saved. Only people in the admin can see it; the website is unchanged.' : mode === 'schedule' ? `Scheduled. It will appear on the website on ${entry.publish_at ? pkt(entry.publish_at) : 'the chosen date'} (Pakistan time).` : mode === 'archive' ? 'Taken off the website.' : 'Published. It is on the website now; open pages update within seconds.',
    );
  }

  const properties = Object.fromEntries(Object.entries(schema.properties || {}).filter(([key]) => key !== 'dayLabel' && key !== resourceField?.key));
  const editableSchema = { ...schema, properties };

  // Where this entry stands relative to the public website.
  const status = settings ? null
    : initial.version === 0 ? { tone: 'neutral', icon: CircleDashed, title: `New ${singular}`, text: 'Not on the website yet. Fill it in, then publish it.' }
    : scheduledAt ? { tone: 'info', icon: CalendarClock, title: `Scheduled for ${pkt(scheduledAt)}`, text: 'It will appear on the website at that time (Pakistan time).' }
    : entry.status === 'archived' && !liveVersion ? { tone: 'neutral', icon: EyeOff, title: 'Not on the website', text: 'This was taken off the website. Publish it to bring it back.' }
    : !liveVersion ? { tone: 'warn', icon: PencilLine, title: 'Draft: not on the website', text: 'Only people in the admin can see it. Publish it to show it to visitors.' }
    : liveVersion < entry.version ? { tone: 'warn', icon: PencilLine, title: 'Unpublished changes', text: 'The website still shows the previous version. Publish to update it.' }
    : { tone: 'live', icon: CheckCircle2, title: 'Live on the website', text: 'Visitors see this version.' };

  const busy = pending || readOnly || conflict;

  return <MediaContext.Provider value={{ media: library, canUpload: upload && !readOnly, add: asset => setLibrary(list => [asset, ...list.filter(a => a.url !== asset.url)]) }}>
    <div className="editor" data-admin-dirty={dirty ? 'true' : undefined}>
      {status && <section className={`editor-status editor-status--${status.tone}`} aria-label="Publication status">
        <status.icon size={20} aria-hidden="true" />
        <div><strong>{status.title}</strong><p>{status.text}</p>
          {(scheduledAt || entry.collection === 'results' && !resultsReleased) && <div className="editor-status__extra">
            {scheduledAt && <button type="button" className="secondary" disabled={busy} onClick={() => execute(() => cancelSchedule(entry.collection, entry.id, entry.version), 'Schedule cancelled. The website is unchanged.')}>Cancel the scheduled publication</button>}
            {entry.collection === 'results' && !resultsReleased && <p role="alert">Results are hidden on the website until you release them in Site settings, even when published here.</p>}
          </div>}
        </div>
        <div className="editor-status__links">
          {liveVersion && publicPath && <a href={publicPath} target="_blank" rel="noopener"><Eye size={15} aria-hidden="true" /> View on website</a>}
          {/* A plain link: prefetching would switch preview on by itself. */}
          {initial.version > 0 && <a href={`/admin/preview?collection=${entry.collection}&id=${encodeURIComponent(initial.id)}`} target="_blank" rel="noopener">Preview on site</a>}
        </div>
      </section>}

      {conflict && <p role="alert">Someone else changed this {singular} while you were editing. Copy your changes somewhere safe, then discard them to load the latest version.</p>}

      <form className="editor-form" onSubmit={e => { e.preventDefault(); save('publish'); }}>
        <fieldset disabled={readOnly || pending}>
          <legend className="sr-only">{settings ? 'Site settings' : `${singular} details`}</legend>
          {!settings && resourceField && <div className="schema-field"><label htmlFor="entry-resource">{resourceField.label}</label><small className="admin-field-hint" id="entry-resource-hint">Pick a published document. Add new documents under Documents first.</small><select id="entry-resource" aria-describedby="entry-resource-hint" value={String(entry.data[resourceField.key] || '')} onChange={e => change({ ...entry.data, [resourceField.key]: e.target.value })}><option value="">None yet</option>{resources.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></div>}
          {settings
            ? Object.entries(groups).map(([label, keys]) => <details key={label} className="editor-group" open={label === 'Event details'}><summary>{label}</summary><SchemaForm schema={{ ...schema, properties: Object.fromEntries(Object.entries(schema.properties || {}).filter(([k]) => keys.includes(k))) }} value={entry.data} onChange={change} label={label} errors={fieldErrors} /></details>)
            : <SchemaForm errors={fieldErrors} schema={editableSchema} value={entry.data} onChange={change} />}
          {!settings && <div className="schema-field"><label htmlFor="entry-order">Position in the list</label><small className="admin-field-hint" id="entry-order-hint">Lower numbers come first on the website.</small><input id="entry-order" aria-describedby="entry-order-hint" type="number" value={entry.sort_order} onChange={e => { setDirty(true); setEntry({ ...entry, sort_order: Number(e.target.value) }); }} /></div>}
          {!settings && initial.version > 0 && <p className="admin-muted editor-ref">Reference: {entry.id}</p>}
        </fieldset>

        <div className="editor-bar" role="group" aria-label="Save">
          <div className="editor-bar__state">
            {dirty ? <span className="editor-dirty"><i aria-hidden="true" /> Unsaved changes</span> : <span className="admin-muted">All changes saved</span>}
            {dirty && <button type="button" className="secondary admin-link-button" onClick={() => { setEntry(initialize()); setDirty(false); setMessage('Changes discarded.'); setFailed(false); }}><Undo2 size={14} aria-hidden="true" /> Discard</button>}
          </div>
          <div className="editor-bar__actions">
            {settings
              ? <button type="submit" disabled={busy}>{pending ? 'Saving…' : 'Save settings'}</button>
              : <>
                <button type="button" className="secondary" disabled={busy} onClick={() => save('draft')}>{pending ? 'Saving…' : 'Save as draft'}</button>
                <button type="submit" disabled={busy}><Send size={15} aria-hidden="true" /> {pending ? 'Publishing…' : liveVersion ? 'Publish changes' : 'Publish to website'}</button>
                <button type="button" className="secondary editor-bar__more" aria-expanded={more} aria-controls="editor-more" onClick={() => setMore(!more)}>More <ChevronDown size={14} aria-hidden="true" /></button>
              </>}
          </div>
          {message && <p role="status" aria-label="Save status" className={failed ? 'editor-message is-error' : 'editor-message'}>{message}</p>}
        </div>

        {!settings && more && <section id="editor-more" className="editor-more">
          <div>
            <h3>Publish later</h3>
            <p className="admin-muted">Keep the current website as it is and publish this version at a set time.</p>
            <label htmlFor="entry-publish-at">Publish on (Pakistan time)<input id="entry-publish-at" type="datetime-local" value={localTime(entry.publish_at)} onChange={e => { setDirty(true); setEntry({ ...entry, publish_at: utc(e.target.value) }); }} /></label>
            <button type="button" className="secondary" disabled={busy} onClick={() => save('schedule')}><CalendarClock size={15} aria-hidden="true" /> Schedule publication</button>
          </div>
          <div>
            <h3>Take down automatically</h3>
            <p className="admin-muted">Optional. After this time the {singular} disappears from the website. Applies when you publish.</p>
            <label htmlFor="entry-expire-at">Remove on (Pakistan time)<input id="entry-expire-at" type="datetime-local" value={localTime(entry.expire_at)} onChange={e => { setDirty(true); setEntry({ ...entry, expire_at: utc(e.target.value) }); }} /></label>
          </div>
          {initial.version > 0 && <div>
            <h3>Remove from the website</h3>
            <p className="admin-muted">Visitors stop seeing it. It stays here, and you can publish it again.</p>
            <button type="button" className="secondary is-danger" disabled={busy} onClick={() => save('archive')}><EyeOff size={15} aria-hidden="true" /> Remove from website</button>
          </div>}
        </section>}
      </form>

      <details className="editor-history">
        <summary><History size={16} aria-hidden="true" /> Revision history</summary>
        <p className="admin-muted">{settings ? 'Restoring settings applies them to the website at once.' : 'Restoring an earlier version makes it a draft; publish it to put it back on the website.'}</p>
        {revisions.length ? <ul>{revisions.map(r => <li key={r.id}><span>{pkt(r.created_at)}</span><button className="secondary" disabled={busy} onClick={() => execute(() => restoreRevision(r.id, entry.version), settings ? 'Settings restored.' : 'Earlier version restored as a draft.')}>Restore revision {r.id}</button></li>)}</ul> : <p>No earlier versions yet.</p>}
      </details>
      {!settings && initial.version > 0 && <p className="editor-foot"><Link href={`/admin/content/${entry.collection}/${initial.id}/preview`} target="_blank">See every saved field</Link></p>}
    </div>
  </MediaContext.Provider>;
}
