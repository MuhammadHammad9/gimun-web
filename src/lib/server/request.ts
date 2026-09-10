export const MAX_JSON_BODY_BYTES = 256 * 1024;

export class JsonBodyError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = 'JsonBodyError';
  }
}

/**
 * Read a bounded JSON request body once. App Router handlers otherwise rely on
 * the runtime parser without an application-level size limit, which allows an
 * unnecessarily large anonymous body to consume work before validation.
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
    throw new JsonBodyError('Request body is too large.', 413);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_JSON_BODY_BYTES) {
    throw new JsonBodyError('Request body is too large.', 413);
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new JsonBodyError('Request body must be valid JSON.');
  }
}
