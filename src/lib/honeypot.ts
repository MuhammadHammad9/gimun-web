// Honeypot field name (obscured to not tip off automated bots)
export const HONEYPOT_FIELD = 'company_fax';

// Minimum form fill time in milliseconds (2000ms velocity trap per QA security requirements)
export const MIN_FILL_TIME_MS = 2000;

// Rate limit: max submissions per IP per window (defaults to 10 for security burst testing, configurable via RATE_LIMIT_MAX)
export const RATE_LIMIT = {
  maxRequests: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 10,
  windowMs: 10 * 60 * 1000, // 10 requests per 10 minutes
};
