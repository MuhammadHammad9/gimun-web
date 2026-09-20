'use client';
export type Schema = { type?: string | string[]; properties?: Record<string, Schema>; items?: Schema; enum?: string[]; anyOf?: Schema[]; required?: string[]; format?: string; default?: unknown; minimum?: number; maximum?: number };
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
function title(value: string) { return value.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' '); }
export function SchemaForm({ schema, value, onChange, label = 'Content', path = 'entry', optional = false }: { schema: Schema; value: unknown; onChange: (v: unknown) => void; label?: string; path?: string; optional?: boolean }) {
  if (schema.anyOf) return <SchemaForm schema={schema.anyOf.find(s => s.type !== 'null') || schema.anyOf[0]} value={value} onChange={onChange} label={label} path={path} />;
  if (schema.type === 'object') {
    const object = (value || {}) as Record<string, unknown>;
    return <fieldset><legend>{title(label)}</legend>{Object.entries(schema.properties || {}).map(([key, child]) => <SchemaForm key={key} schema={child} value={object[key]} onChange={v => onChange({ ...object, [key]: v })} label={key} optional={!schema.required?.includes(key)} path={`${path}-${key}`} />)}</fieldset>;
  }
  if (schema.type === 'array') {
    const array = (Array.isArray(value) ? value : []) as unknown[];
    return <fieldset><legend>{title(label)}</legend>{array.map((item,index) => <div key={index}><SchemaForm schema={schema.items || { type: 'string' }} value={item} onChange={v => onChange(array.map((old,i) => i === index ? v : old))} label={`${label} ${index+1}`} path={`${path}-${index}`} /><button type="button" className="secondary" onClick={() => onChange(array.filter((_,i) => i !== index))}>Remove {title(label)} {index+1}</button></div>)}<button type="button" onClick={() => onChange([...array,emptyValue(schema.items || { type: 'string' })])}>Add {title(label)}</button></fieldset>;
  }
  if (schema.type === 'boolean') return <label htmlFor={path}><input id={path} type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />{title(label)}</label>;
  if (schema.enum) return <label>{title(label)}<select value={String(value ?? '')} onChange={e => onChange(e.target.value)}><option value="">Choose…</option>{schema.enum.map(v => <option key={v}>{v}</option>)}</select></label>;
  const isNumber = schema.type === 'number' || schema.type === 'integer';
  return <label htmlFor={path}>{title(label)}{['body','answer','question','description','bio','notes','shortDescription','privacyNotice','footerBlurb'].includes(label) ? <textarea id={path} value={String(value ?? '')} onChange={e => onChange(e.target.value)} /> : <input id={path} type={isNumber ? 'number' : schema.format === 'date' ? 'date' : 'text'} value={String(value ?? '')} onChange={e => onChange(isNumber ? e.target.value === '' ? null : Number(e.target.value) : optional && e.target.value === '' ? undefined : e.target.value)} />}</label>;
}
