// Honeypot field name (obscured to not tip off automated bots)
export const HONEYPOT_FIELD = 'company_fax';

// Minimum form fill time in milliseconds (2000ms velocity trap per QA security requirements)
export const MIN_FILL_TIME_MS = 2000;

// RATE_LIMIT_MAX, when set, overrides every bucket (used by the form tests).
const configuredRateLimit = Number.parseInt(process.env.RATE_LIMIT_MAX || '', 10);
const override = Number.isInteger(configuredRateLimit) && configuredRateLimit > 0 ? configuredRateLimit : null;

const TEN_MINUTES = 10 * 60 * 1000;

/**
 * Limits per purpose. Registration is generous because a whole delegation may
 * register from one campus network (one shared IP) and only valid submissions
 * count; sign-in is strict and also limited per account.
 */
export const RATE_LIMITS = {
  registration: { maxRequests: override ?? 30, windowMs: TEN_MINUTES },
  contact: { maxRequests: override ?? 10, windowMs: TEN_MINUTES },
  survey: { maxRequests: override ?? 20, windowMs: TEN_MINUTES },
  'certificate-pdf': { maxRequests: override ?? 30, windowMs: TEN_MINUTES },
  'admin-login': { maxRequests: override ?? 20, windowMs: 15 * 60 * 1000 },
  'admin-login-account': { maxRequests: override ?? 5, windowMs: 15 * 60 * 1000 },
} as const;
export type RateLimitBucket = keyof typeof RATE_LIMITS;

/** Kept for callers that only need the default window. */
export const RATE_LIMIT = { maxRequests: override ?? 10, windowMs: TEN_MINUTES };
