/**
 * Normalize values crossing a Server Component -> Client Component boundary.
 * Supabase rows are normally JSON, but generated schemas and database adapters
 * can contain class instances, Dates, or other values Next.js cannot encode.
 */
export function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, current) =>
    typeof current === 'bigint' ? Number(current) : current,
  )) as T;
}
