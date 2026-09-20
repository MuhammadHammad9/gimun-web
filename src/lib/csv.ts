export function csv(rows: Record<string,unknown>[]) {
  const keys=[...new Set(rows.flatMap(row=>Object.keys(row)))];
  const cell=(value:unknown)=>{let s=value==null?'':typeof value==='object'?JSON.stringify(value):String(value);if(/^[\s]*[=+@-]/.test(s))s="'"+s;return `"${s.replace(/"/g,'""')}"`;};
  return '\uFEFF'+[keys.map(cell).join(','),...rows.map(row=>keys.map(k=>cell(row[k])).join(','))].join('\r\n');
}
