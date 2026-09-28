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
  // A cross-site HTML form can only send form-encoded or text/plain bodies
  // without a CORS preflight. Requiring JSON, and rejecting a foreign Origin
  // when the browser sends one, stops other sites submitting on a visitor's
  // behalf (and spreading the rate limit across their visitors' IPs).
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new JsonBodyError('Requests must be sent as application/json.', 415);
  }
  const origin = request.headers.get('origin');
  if (origin && !isSameOrigin(origin, request)) {
    throw new JsonBodyError('Cross-site requests are not accepted.', 403);
  }

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

function isSameOrigin(origin: string, request: Request) {
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [
    request.headers.get('x-forwarded-host'),
    request.headers.get('host'),
    safeHost(process.env.SITE_URL),
    safeHost(process.env.NEXT_PUBLIC_SITE_URL),
  ].filter(Boolean);
  return hosts.includes(originHost);
}

function safeHost(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}
