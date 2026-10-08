// Honeypot field name. Deliberately meaningless: a name like "company_fax"
// matches browser autofill heuristics, and an autofilled trap would silently
// discard a real person's application.
export const HONEYPOT_FIELD = 'gm_hp_x7';

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
  // Per account *and* network: someone guessing elsewhere cannot lock the
  // real owner out. The account-wide ceiling still stops guessing spread over
  // many addresses (and two-factor sign-in makes guessing pointless anyway).
  'admin-login-account': { maxRequests: override ?? 5, windowMs: 15 * 60 * 1000 },
  'admin-login-account-global': { maxRequests: override ?? 50, windowMs: 60 * 60 * 1000 },
  'admin-mfa-account': { maxRequests: override ?? 10, windowMs: 15 * 60 * 1000 },
  // Receipts go to the address typed into the form, so without this anyone
  // could make the site email a stranger over and over. Keyed by address, not
  // IP, so rotating addresses does not help. A real applicant needs one or two.
  'receipt-recipient': { maxRequests: override ?? 5, windowMs: 24 * 60 * 60 * 1000 },
  // New registration device cookies per network (src/lib/server/device-limit.ts).
  // A browser keeps its cookie for a year, so this is reached only by a script
  // collecting a fresh allowance per request; a campus NAT stays well inside it.
  'device-mint': { maxRequests: override ?? 60, windowMs: TEN_MINUTES },
  // One shared key: at most one visitor-triggered content purge per ten
  // seconds across every server instance (src/app/live-actions.ts). Not
  // affected by RATE_LIMIT_MAX, which would let tests purge on every call.
  'live-purge': { maxRequests: 1, windowMs: 10 * 1000 },
} as const;
export type RateLimitBucket = keyof typeof RATE_LIMITS;

/** Kept for callers that only need the default window. */
export const RATE_LIMIT = { maxRequests: override ?? 10, windowMs: TEN_MINUTES };
