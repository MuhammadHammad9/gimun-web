# Security review & hardening — 2026-10-08

Adversarial security audit + penetration testing of gimun-web, run with the Cloudflare
`security-audit` skill (installed into `.agents/skills/security-audit`, symlinked at
`.claude/skills/security-audit`). This document is the human-readable summary and fix plan; the
full machine-checked artifacts (coverage ledger, findings.json validated against the skill's
schema, detailed traces) were produced under the skill's workflow and are summarised here.

## How it was tested

- **Static review** of every server entry point: `src/proxy.ts`, all `src/app/api/**` and
  `src/app/admin/**` route handlers, every `*-actions.ts` server action, `src/lib/server/**`
  (auth, permissions, submissions, outbox, rate limiting, live revisions, certificates, CSV),
  the content repository/preview, and all 14 Supabase migrations (RLS, grants, SECURITY
  DEFINER/INVOKER functions, dynamic SQL).
- **Dynamic attack battery** against a production build on `127.0.0.1` with the isolated in-memory
  backend (no real credentials, no external calls). Techniques exercised, all handled safely:
  oversized body (413), non-JSON (415), cross-site `Origin` (403), 8000-deep nested JSON
  (400, no crash), honeypot (silent decoy), velocity trap (422), XSS payload in fields (stored as
  JSON data, never reflected as HTML), negative/oversized counts (422), admin pages without a
  session (redirect / fail-closed), CSV export without a session (fail-closed 503, no data),
  cron/health without the bearer secret (401), malformed-escape URL (400), survey/verify with
  non-UUID and unknown-UUID tokens (no record exposed), public health (`{ok}` only).
- **Result:** no unauthenticated injection, auth bypass, data-deletion, crash, or amplification was
  reproducible. The app is already strongly hardened (parameterised SQL, RLS, double permission
  checks, escaped email HTML, body/size/origin gates, Turnstile, layered rate limits, constant-time
  secret comparison, idempotent submissions, audited exports).

## Findings and fixes

### Confirmed (low) — FIXED

**`source-map-js` 1.2.1 high advisory failed the CI production-audit gate.**
`npm audit --omit=dev --audit-level=high` (a required CI step) went red on every push because
`source-map-js@1.2.1` (GHSA-68fv-2mgg-jv7q) sat in the production tree via postcss/Tailwind. It is a
build-time dependency, **not reachable by untrusted input at runtime**, so the real impact is a
blocked release pipeline (low severity).
**Fix (applied):** bumped the resolution to `source-map-js@1.2.2` in `package-lock.json`
(`npm audit fix`; only that resolution changed). `npm audit --omit=dev --audit-level=high` now
reports 0 vulnerabilities.

### Hardening — FIXED this run

**Admin proxy now fails closed.** `src/proxy.ts` previously let `/admin/*` render if the Supabase
public env vars were unset (production always sets them via `scripts/check-env.mjs`, so it was not
reachable in prod — pages also still gate via `requireAdmin`). It now redirects every `/admin/*`
path except `/admin/login` to sign-in whenever the session cannot be verified. Strictly safer, no
downside.

### Needs validation (deployment facts — please confirm)

1. **Forwarded-IP trust off Vercel.** All per-network rate limits (and the cookieless fallback of
   the new device limit) key on `clientIp()`. Off Vercel, that reads `X-Forwarded-For`; a client who
   controls that header with no overwriting proxy can rotate the key. **On Vercel this is closed**
   (the platform header is unspoofable). *If self-hosting:* ensure the ingress proxy overwrites
   client `X-Forwarded-For` and set `TRUSTED_PROXY_HOPS` to the real proxy count, and keep Turnstile
   enabled. A real browser is bound by the signed device cookie regardless of IP.
2. **Keep MFA + Turnstile on in production** (`ADMIN_REQUIRE_MFA=1`, Turnstile keys set) — these are
   the real backstops behind the rate limits.

### Rejected claims (checked, not real)

Public-form flooding crashing the server; survey/verify leaking records; CSV export as an
unauthenticated exfiltration path. All disproved — see the test battery above.

### Still recommended (from the prior manual audit, owner/dashboard actions)

Rotate `CRON_SECRET` if it was ever committed; disable Supabase public sign-ups, enable
leaked-password protection, set a 12-char minimum and admin session time-box in the Supabase
dashboard; alert on `/api/health` `rateLimit: degraded`. The soft-404 on `/survey` and `/verify`
(HTTP 200 instead of 404 for bad tokens; no data leak) is a minor SEO wart left as-is.

## New feature — per-device registration limit (DoS/DDoS hygiene)

Each browser may submit **2** registration applications, then is locked for **30 minutes** with a
live countdown, exactly as requested ("the user limit is set and cannot proceed").

**How it works**
- `GET /api/register/status` mints a signed, HttpOnly, SameSite=Lax (Secure in production) device
  cookie (`gimun_device`) and reports how many attempts remain. The response is `private, no-store`
  so a CDN never shares a cookie between visitors.
- The registration handler counts only **distinct** applications per device. A genuine retry of the
  same submission (same key + identical details, e.g. after a dropped connection) is a *replay* —
  allowed and never counted, even while locked — so no one is double-charged for a network hiccup.
- Over the limit → HTTP 429 `{ deviceLimited, retryAfterSeconds }`. The form shows a lockout notice
  with an `mm:ss` countdown and disables submit; a submit that races the limit flips into the same
  state.
- Clients without the cookie (scripts, cookie-blocked browsers) fall back to a per-/64-network key;
  cookie minting is itself rate-limited, and the existing per-network cap + Turnstile remain the
  ceiling. This layer is **purely additive** — it runs after the existing validation, Turnstile,
  network and per-recipient limits and never relaxes them.

**Configuration (optional env; sensible defaults)**
- `REGISTER_DEVICE_MAX_ATTEMPTS` — attempts per device before lockout (default **2**).
- `REGISTER_DEVICE_LOCK_MINUTES` — cooling-off minutes (default **30**).

**Files:** `src/lib/server/device-limit.ts`, `src/app/api/register/status/route.ts`,
`src/components/forms/useDeviceLimit.ts`, `src/components/forms/DeviceLimitNotice.tsx`, wired into
`GimunRegisterForm`/`MootRegisterForm`; limit enforced in `src/lib/server/registration-handler.ts`.
Tests: `tests/unit/device-limit.test.ts` (11 cases) plus the real-server form E2E.

## Verification run this session

typecheck ✓ · eslint ✓ · unit tests 140/140 ✓ (incl. 11 new device-limit tests) ·
migration tests ✓ · content validate ✓ · secret scan ✓ · production build ✓ ·
real-server form & anti-bot E2E 8/8 ✓ · forms browser spec (Chromium) 4/4 ✓ ·
manual attack battery ✓. The full Playwright matrix (admin/motion/story suites) was not run here —
this environment has only Chromium build 1194 while the suite pins 1243; CI runs the full matrix.
