'use client';

import { Plus, Trash2 } from 'lucide-react';
import { FIELD_LABELS } from './collection-info';
import { MediaField } from './MediaField';

export type Schema = { type?: string | string[]; properties?: Record<string, Schema>; items?: Schema; enum?: string[]; optionLabels?: Record<string,string>; anyOf?: Schema[]; required?: string[]; format?: string; default?: unknown; minimum?: number; maximum?: number; minLength?:number; maxLength?:number; description?:string; readOnly?:boolean; media?: 'image' | 'file' };

export function emptyValue(schema: Schema): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schema.anyOf) return emptyValue(schema.anyOf[0]);
  if (schema.enum) return schema.enum[0];
  if (schema.type === 'object') return Object.fromEntries(Object.entries(schema.properties || {}).filter(([k]) => schema.required?.includes(k)).map(([k,v]) => [k,emptyValue(v)]));
  if (schema.type === 'array') return [];
  if (schema.type === 'boolean') return false;
  if (schema.type === 'number' || schema.type === 'integer') return schema.minimum || 0;
  return '';
}

/** "phaseOverride" -> "Phase override"; known keys get their plain-English name. */
export function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : key;
}

/** One item of a list, for "Add chair" and "Chair 2". */
const ITEM_LABELS: Record<string, string> = {
  topics: 'Topic', topicDescriptions: 'Topic description', chairs: 'Chair', countryList: 'Country', items: 'Item', actions: 'Button',
  stats: 'Figure', gimunRubric: 'Criterion',
};
const itemLabel = (key: string) => ITEM_LABELS[key] ?? fieldLabel(key).replace(/s$/, '');

/** Fields long enough to deserve a text area. */
const LONG = new Set(['body','lead','bridge','note','meta','answer','question','description','bio','notes','shortDescription','privacyNotice','footerBlurb','paymentInstructions','caption']);

export function SchemaForm({ schema, value, onChange, label = 'Content', path = 'entry', optional = false, errors = {}, field = '', display }: { schema: Schema; value: unknown; onChange: (v: unknown) => void; label?: string; path?: string; optional?: boolean;errors?:Record<string,string>;field?:string;display?:string }) {
  const name = display ?? fieldLabel(label);
  if (schema.anyOf) return <SchemaForm schema={schema.anyOf.find(s => s.type !== 'null') || schema.anyOf[0]} value={value} onChange={onChange} label={label} path={path} optional={optional} errors={errors} field={field} display={display} />;

  if (schema.type === 'object') {
    const object = (value || {}) as Record<string, unknown>;
    const entries = Object.entries(schema.properties || {})
      // Country rows edit the name only; availability comes from allocations.
      .filter(([key]) => !(key === 'status' && 'country' in object))
      // The reference is generated; it is shown under the form, not edited.
      .filter(([key]) => !(key === 'id' && path === 'entry'));
    return <fieldset className={path === 'entry' ? 'schema-root' : 'schema-group'}>
      {path !== 'entry' && <legend>{name}</legend>}
      {optional && value !== undefined && path !== 'entry' && <button type="button" className="secondary admin-link-button" onClick={() => onChange(undefined)}>Clear {name.toLowerCase()}</button>}
      {entries.map(([key, child]) => <SchemaForm key={key} schema={child} value={object[key]} onChange={v => onChange({ ...object, [key]: v })} label={key} optional={!schema.required?.includes(key)} path={`${path}-${key}`} errors={errors} field={field ? `${field}.${key}` : key} />)}
    </fieldset>;
  }

  if (schema.type === 'array') {
    const array = (Array.isArray(value) ? value : []) as unknown[];
    const one = itemLabel(label);
    const item = schema.items || { type: 'string' };
    const simple = item.type !== 'object' && !item.anyOf;
    return <fieldset className="schema-list">
      <legend>{name}</legend>
      {schema.description && <small className="admin-field-hint">{schema.description}</small>}
      {array.length === 0 && <p className="admin-muted schema-list__empty">None yet.</p>}
      <ol>
        {array.map((entry, index) => <li key={index} className={simple ? 'schema-list__row' : 'schema-list__card'}>
          <SchemaForm schema={item} value={entry} onChange={v => onChange(array.map((old, i) => i === index ? v : old))} label={label} display={`${one} ${index + 1}`} path={`${path}-${index}`} errors={errors} field={`${field}.${index}`} />
          <button type="button" className="secondary schema-list__remove" onClick={() => onChange(array.filter((_, i) => i !== index))} aria-label={`Remove ${one.toLowerCase()} ${index + 1}`}><Trash2 size={15} aria-hidden="true" /><span>Remove</span></button>
        </li>)}
      </ol>
      <button type="button" className="secondary schema-list__add" onClick={() => onChange([...array, emptyValue(item)])}><Plus size={15} aria-hidden="true" /> Add {one.toLowerCase()}</button>
    </fieldset>;
  }

  const error = errors[field];
  const hint = schema.description;
  const hintId = hint ? `${path}-hint` : undefined;
  const describedBy = [hintId, error ? `${path}-error` : undefined].filter(Boolean).join(' ') || undefined;

  if (schema.media) {
    return <MediaField id={path} label={name} value={String(value ?? '')} onChange={v => onChange(optional && v === '' ? undefined : v)} kind={schema.media} required={!optional} error={error} hint={hint} />;
  }

  if (schema.type === 'boolean') return <label htmlFor={path} className="schema-check"><input id={path} type="checkbox" checked={Boolean(value)} aria-describedby={describedBy} onChange={e => onChange(e.target.checked)} /><span>{name}{hint && <small className="admin-field-hint" id={hintId}>{hint}</small>}</span></label>;

  if (schema.enum) return <div className="schema-field"><label htmlFor={path}>{name}</label>{hint && <small className="admin-field-hint" id={hintId}>{hint}</small>}<select id={path} aria-describedby={describedBy} aria-invalid={Boolean(error)} value={String(value ?? '')} onChange={e => onChange(optional && e.target.value === '' ? undefined : e.target.value)}>{optional && <option value="">Not set</option>}{schema.enum.map(v => <option key={v} value={v}>{schema.optionLabels?.[v] || (v.charAt(0).toUpperCase() + v.slice(1)).replaceAll('_', ' ').replaceAll('-', ' ')}</option>)}</select>{error && <span id={`${path}-error`} className="admin-field-error">{error}</span>}</div>;

  const isNumber = schema.type === 'number' || schema.type === 'integer';
  const long = LONG.has(label);
  // The label holds only the name, so the field is announced (and found) by it.
  return <div className="schema-field">
    <label htmlFor={path}>{name}</label>{!optional && !schema.readOnly && <span className="schema-required" aria-hidden="true"> *</span>}
    {hint && <small className="admin-field-hint" id={hintId}>{hint}</small>}
    {long
      ? <textarea aria-invalid={Boolean(error)} aria-describedby={describedBy} id={path} value={String(value ?? '')} onChange={e => onChange(optional && e.target.value === '' ? undefined : e.target.value)} />
      : <input aria-invalid={Boolean(error)} aria-describedby={describedBy} id={path} readOnly={schema.readOnly} className={schema.readOnly ? 'admin-disabled-field' : undefined} min={schema.minimum} max={schema.maximum} minLength={schema.minLength} maxLength={schema.maxLength} step={schema.type === 'integer' ? 1 : 'any'} type={isNumber ? 'number' : schema.format === 'date' ? 'date' : schema.format === 'email' ? 'email' : 'text'} value={String(value ?? '')} onChange={e => onChange(isNumber ? e.target.value === '' ? null : Number(e.target.value) : optional && e.target.value === '' ? undefined : e.target.value)} />}
    {error && <span id={`${path}-error`} className="admin-field-error">{error}</span>}
  </div>;
}
