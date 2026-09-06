// Honeypot field name (obscured to not tip off automated bots)
export const HONEYPOT_FIELD = 'company_fax';

// Minimum form fill time in milliseconds (1.2 seconds to allow fast autofill while stopping instant bots)
export const MIN_FILL_TIME_MS = 1200;

// Rate limit: max submissions per IP per window (30 to accommodate campus labs & university dorms)
export const RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 10 * 60 * 1000, // 30 requests per 10 minutes
};
