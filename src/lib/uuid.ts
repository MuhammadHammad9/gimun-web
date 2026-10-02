/**
 * A random RFC 4122 version-4 UUID, as the submission endpoints require.
 *
 * `crypto.randomUUID` is missing from Chrome before 92, Safari before 15.4
 * and many older Android WebViews and in-app browsers. Calling it there threw
 * inside the form's submit handler, so those visitors could never register.
 * `crypto.getRandomValues` is available much further back and is just as
 * random; Math.random is only a last resort for browsers with neither.
 */
export function newSubmissionKey(): string {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (typeof cryptoApi?.randomUUID === 'function') {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // Some embedded browsers expose the function but refuse outside a secure context.
    }
  }
  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') cryptoApi.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Reads a submission endpoint's JSON reply. A gateway timeout or an expired
 * staff session returns HTML instead, and parsing that used to surface as
 * "check your connection" even though the request reached the server. The
 * same submission key is reused on retry, so retrying never duplicates.
 */
export async function readSubmissionResponse<T extends { success?: boolean; message?: string }>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => null)) as T | null;
  if (data && typeof data === 'object') return data;
  const message =
    res.status === 401 || res.status === 403 || res.redirected
      ? 'Your session has expired. Sign in again, then resubmit.'
      : res.status === 429
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : 'The server did not confirm your submission. Please try again; resubmitting will not create a duplicate.';
  return { success: false, message } as T;
}
