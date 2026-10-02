# Security and bug audit: findings and fix plan

Audit date: 2026-10-01 · Branch: `feat/live-editable` @ `383e13f` (plus one uncommitted change)

## Implementation status

Implemented 2026-10-01 in four phases. Each phase was verified with typecheck, lint, unit tests, a production build and the relevant real-server suites.

| Item | Status | What changed |
|---|---|---|
| C1 | ✅ Code · ⚠️ **you must rotate the secret** | `email_scheduler.sql` restored to placeholders. New `npm run scan:secrets` (in CI and `qa:full`) and an opt-in pre-commit hook (`npm run hooks:install`). |
| C2 | ✅ | Next.js and eslint-config-next upgraded to 16.3.8; `npm audit` is clean. |
| H1 | ✅ · ⚠️ needs Cloudflare keys | Per-recipient receipt cap (5 per address per day) is enforced now. Cloudflare Turnstile is on all four public forms and switches on when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are set. |
| H2 | ⚠️ Partly: enforcement deferred (2026-10-02) | Two-factor sign-in stays optional for now by the organizers' decision; builds warn while `ADMIN_REQUIRE_MFA` is not `1`. Turn it on once admins have enrolled. A password-only session can't enrol a second authenticator. Code checks use only verified factors and are limited per account. |
| H3 | ✅ | A page stamped "unavailable" is purged. The client stops chasing a revision it can't reach. |
| H4 | ✅ | Only the honeypot returns the silent decoy, and it's logged. Timing checks now answer with a visible "submit again". The client never shows success for a `…-0000` reference. |
| M1 | ✅ | Content purges go through one global throttle (Upstash); visitor-reported values must look like revisions. |
| M2 | ✅ | `/admin` gets a per-request nonce CSP with `strict-dynamic` and no `unsafe-inline` scripts. The head boot script is now a constant, allowed by hash. An injected `onerror` payload was confirmed blocked on admin. |
| M3 | ✅ | The sign-in limit is per account and network, plus a 50/hour account-wide ceiling. |
| M4 | ✅ | `x-real-ip` is trusted only on Vercel. Elsewhere `X-Forwarded-For` is read with `TRUSTED_PROXY_HOPS`. |
| M5 | ✅ | `/api/health` probes Upstash and reports `rateLimit`. |
| M6 | ✅ | Local paths reject backslashes and whitespace anywhere; HTTPS links are parsed. |
| M7 | ✅ · ⚠️ GA setting | Page views are sent manually and never for `/admin`, `/survey`, `/verify`. Turn off GA4's "history events" page views (runbook). |
| M8 | ⚠️ Dashboard | Supabase Auth checklist added to OPERATIONS_RUNBOOK.md. |
| M9 | ⚠️ You | Move the repository out of OneDrive, or exclude it from sync. |
| M10 | ✅ | `tests/unit/permission-drift.test.ts` compares `can()` with the SQL `admin_can()` for every role and section. |
| M11 | ✅ No change needed | Already covered: the published revision includes the PKT date, so every cached page refreshes at the deadline's midnight, and the API refuses late submissions with a clear message. |
| L1 | ✅ | Live-update polling works without `AbortSignal.any`. |
| L2 | ✅ | Exports refuse `Sec-Fetch-Site: cross-site`/`same-site`. |
| L3 | ✅ | The contact form is validated before the rate limit counts. |
| L4 | ✅ | The walk-in guard uses the resolved backend. |
| L5 | ✅ | `/api/health` answers `{ok}` publicly; details need `Authorization: Bearer $CRON_SECRET`. |
| L6 | ✅ | Covered by the global purge throttle (M1). |
| L7 | ✅ · ⚠️ **apply migration 0014** | `0014_definer_search_path.sql` pins `search_path = public, pg_temp` on every SECURITY DEFINER function; the migration test asserts it. |
| L8 | ✅ Fixed | `.lhserver.log`, the dead `data/submission-counter.json`, the PRD documents and the `Claude Skills/` zips are untracked and ignored (still in git history). |
| L9 | ✅ | Actions are pinned to commit SHAs; Dependabot already updates them. |
| L10 | Open | Dev-only; waits on an `@lhci/cli` release. |
| L11 | ✅ | `vitest.config.mts`. |

## What was checked

- **Backend:** `src/proxy.ts`, `next.config.ts`, every route handler (`src/app/api/**`, `src/app/admin/**/route.ts`, `verify/[code]/pdf`), every server action (`*-actions.ts`, `survey/[token]/actions.ts`), `src/lib/server/**` (auth, permissions, submissions, outbox, rate limiting, live revisions, certificates, CSV), the content repository and draft preview, and all 13 Supabase migrations plus `email_scheduler.sql` and `harden_legacy_access.sql`. That covers RLS, grants, SECURITY DEFINER functions and dynamic SQL.
- **Frontend:** every `dangerouslySetInnerHTML` and inline script, links built from CMS content, `target="_blank"` usage, localStorage and sessionStorage, analytics consent, the public form submit paths, the live-update poller, the analytics exclusions and admin route guards.
- **Tooling run:** `tsc --noEmit` passed, `eslint` passed, `vitest` passed (98/98), `validate` passed, `test:migrations` passed. `npm audit` **failed** with 1 critical advisory.
- **Not run:** `next build`, Playwright (`test:browser`, `test:admin`, `test:forms`) and Lighthouse. Supabase dashboard settings and `.env.local` values were not inspected. Run `npm run qa:full` after the fixes below.

**What is already solid, so leave it alone:** every table has RLS enabled and `anon`/`authenticated` revoked. Only `service_role` can execute the privileged functions. Permissions are checked twice, in `can()` and again in `admin_can()`. Dynamic SQL uses `%I`/`USING`. Email HTML is escaped. JSON bodies are size-bounded and same-origin checked. Registration and contact are idempotent. Exports are audit-logged, draft preview re-checks the admin session, CSV output is guarded against formula injection, and the cron endpoint compares its secret in constant time.

---

## 🔴 Critical: fix before anything else

### C1. The real cron secret and production URL are written into a tracked file (uncommitted)
- **Where:** `supabase/email_scheduler.sql:18-19`. The working-tree diff replaces the `<SITE_URL>`/`<CRON_SECRET>` placeholders with real values.
- **Risk:** one `git add .` would publish `CRON_SECRET` into git history. The folder also lives in OneDrive, so the value is already synced to the cloud.
- **Fix:**
  1. Run `git checkout -- supabase/email_scheduler.sql` to restore the placeholders. The real values belong only in Supabase Vault, typed into the SQL editor.
  2. Rotate `CRON_SECRET`: generate a new value, update Vercel env and the Vault secret `outbox_cron_secret` with `vault.update_secret`, and redeploy.
  3. Add secret scanning, for example a `gitleaks` pre-commit hook plus a `gitleaks/gitleaks-action` step in `.github/workflows/ci.yml`.

### C2. Next.js 16.3.4 has a critical advisory, and CI is red because of it
- **Where:** `package.json` (`next`, `eslint-config-next` at `16.3.4`). The advisory is GHSA-vcvr-r3jv-pc5j, an RCE in `next/og` `ImageResponse`. The project doesn't import `next/og`, so direct exploitability is low. However, the CI step `npm audit --omit=dev --audit-level=high` now fails every push and PR.
- **Fix:** bump both `next` and `eslint-config-next` to `16.3.8` or later, run `npm install`, then `npm run qa:full`. Read the release notes in `node_modules/next/dist/docs/` for anything that changed (see AGENTS.md).

---

## 🟠 High

### H1. Public forms can make the site email anyone (spam relay / sender-reputation risk)
- **Where:** `src/lib/server/registration-handler.ts`, `src/lib/server/submissions.ts:522` (receipt goes to the submitted address) and `src/app/api/contact/route.ts`.
- **Risk:** anyone can submit a valid form with a victim's address. Each submission queues a branded receipt that includes attacker-chosen text ("Welcome, <name>"). The only limit is 30 per 10 minutes per IP, and there's no CAPTCHA. A small botnet can burn the Resend quota, get the sending domain flagged, and fill the registrations table with junk.
- **Fix:**
  1. Add Cloudflare Turnstile (or hCaptcha) to the GIMUN, Moot, contact and clarification forms. Verify the token server-side in `handleRegistration` (skip this for walk-ins) and in the contact route. Allow `challenges.cloudflare.com` in the CSP `script-src`/`frame-src`/`connect-src`.
  2. Add a per-recipient bucket to `RATE_LIMITS`, for example `'receipt-recipient': 3 per 24h` keyed on the HMAC of the lower-cased email. When it's exceeded, still store the registration but skip queuing the receipt.
  3. Add a global daily cap on applicant receipts and alert when it's hit.

### H2. Two-factor sign-in is optional for accounts that can see all participant data
- **Where:** `src/lib/server/admin/auth.ts:24-33`. MFA is only enforced when `ADMIN_REQUIRE_MFA=1`, and `.env.example` leaves it blank.
- **Fix:**
  1. Set `ADMIN_REQUIRE_MFA=1` in production, and make `scripts/check-env.mjs` fail a production build without it.
  2. Defense in depth: in `startEnrolment` (`src/app/admin/mfa-actions.ts:13`), refuse when `mfaState().needsCode` is true. Today, stopping a password-only session from enrolling a second authenticator relies entirely on Supabase's server-side AAL2 rule.

### H3. The live-update poller can loop forever and multiply load during a database blip
- **Where:** `src/lib/server/live.ts:51-67`, `src/app/live-actions.ts`, `src/components/LiveUpdates.tsx:135-190`.
- **Scenario:** a render happens while `freshRevision` is in its 15-second outage backoff. `appliedRevision()` returns `'unavailable'`, and that value is baked into the cached page HTML for up to an hour. Once the database recovers, every visitor's poll sees `live ≠ 'unavailable'` and calls `syncLiveContent`. That call doesn't purge anything, because `pagesStale` is false when `applied==='unavailable'` and `visitorStale` ignores `'unavailable'`. `router.refresh()` then returns the same cached page, the three retries run out, and the cycle repeats every 4–15 seconds for every open tab.
- **Fix:**
  1. In `syncLiveContent`, treat a cached page stamped `'unavailable'` as stale and purge it. Also pass the page's stamp and purge when `have === 'unavailable' && live.connected`, throttled as in M1.
  2. In `LiveUpdates`, stop after N consecutive refreshes where `initial` didn't change, then back off to the slow interval.
  3. Add a unit test for the sequence "applied unavailable → live connected".

### H4. Anti-bot checks silently discard real applications
- **Where:** `src/lib/server/request.ts:83-96` and `registration-handler.ts:59-61`.
- **Risk:** a submission judged "automated" gets a fake success response (`REG-GIMUN-YYYY-0000`) and nothing is stored. The triggers are a filled honeypot (possible with aggressive autofill or password managers), `_elapsed < 2000ms`, or a production request with no `_elapsed`/`_ts` (for example an old cached bundle). A real applicant would think they're registered.
- **Fix:**
  1. Keep the decoy only for a filled honeypot.
  2. For the timing checks, return a 422 saying "Please review the form and submit again", or accept the submission and flag it `suspected_bot` for review.
  3. Log every decoy (hashed IP, path, reason) so false positives are visible.
  4. On the client, never show a success screen for reference `…-0000`.

---

## 🟡 Medium

| # | Issue | Where | Fix |
|---|---|---|---|
| M1 | Anyone can trigger a content-cache purge. `syncLiveContent` is a public server action calling `updateTag('content')`. The 10s throttle is per server instance, so on serverless an attacker can keep purging and push traffic to the database. | `src/app/live-actions.ts` | Use a global throttle in Upstash (`SET gimun:purge NX EX 10`). Only purge when the server's own `applied ≠ live`; drop or strictly limit the visitor-reported path. |
| M2 | CSP allows `'unsafe-inline'` scripts, so any future HTML injection becomes script execution in an admin session that handles personal data. | `next.config.ts:18-33` | Move to a nonce-based CSP generated in `src/proxy.ts`, with `'strict-dynamic'` (see the CSP guide in `node_modules/next/dist/docs/`). At minimum do it for `/admin`. Add `upgrade-insecure-requests`. |
| M3 | Account lockout DoS: 5 failed sign-ins per 15 minutes per email address blocks the real owner too, and anyone who knows the address can do it indefinitely. | `src/app/admin/auth-actions.ts:16`, `src/lib/honeypot.ts:25-26` | Key the account limit on email + IP /24 or /64, keep a higher global per-account ceiling (for example 30/h) that sends an alert, and rely on MFA (H2) as the real guard. |
| M4 | The client IP trusts `x-real-ip` before the proxy chain. That's safe on Vercel only; self-hosted, a spoofed header bypasses every rate limit. | `src/lib/server/submissions.ts:262-274` | Use `x-vercel-forwarded-for` only when `process.env.VERCEL` is set. Otherwise use a configured `TRUSTED_PROXY_HOPS` against `x-forwarded-for`. |
| M5 | The rate limiter silently falls back to per-instance memory when Upstash is missing or down, which on serverless is close to no limit. | `submissions.ts:197-260` | Report `rateLimit: 'degraded'` from `/api/health` and alert on it. |
| M6 | CMS link validation accepts `/\evil.com`, which browsers resolve to an external host. Sponsor, resource, team, social and image fields are not checked against known routes. | `src/lib/content/registry.ts:7,25` | Change `/^\/(?!\/)/` to `/^\/(?![\/\\])/`, matching `preview-actions.ts`, in both `link` and `image`. Add a unit test. |
| M7 | Analytics can receive secret URLs. Once gtag has loaded on a public page (consent granted), GA4 "history change" page views can report client-side navigations to `/survey/<token>`, `/verify/<code>` or `/admin/...`. | `src/components/analytics/GoogleAnalytics.tsx` | Configure with `send_page_view: false` and send page views manually, skipping `/admin`, `/survey`, `/verify`. Or turn off "page changes based on browser history" in GA4. Use full-page navigation into those areas. |
| M8 | Supabase Auth settings can't be verified from code. | Supabase dashboard | Disable public sign-ups, enable leaked-password protection, set minimum password length to 12, and set a session time-box and inactivity timeout for admin sessions. |
| M9 | Secrets live inside a synced OneDrive folder (`.env.local` holds the service-role key, Resend key and Upstash token). | Repository location | Move the repo outside OneDrive, or exclude the folder from sync. If the folder has ever been shared, rotate those keys. |
| M10 | The permission rules exist twice, in `permissions.ts` and in the SQL `admin_can` with a hard-coded editor list. Adding a collection without a migration makes the UI allow edits the database rejects. | `src/lib/server/admin/permissions.ts`, `0013_page_copy.sql:21` | Add a migration test asserting that `admin_can`'s editor list equals `collections` + `media` from `registry.ts`. |
| M11 | Registration pages are statically cached, so "Register" buttons stay visible after a deadline passes until the midnight PKT rollover. The applicant fills in the whole form, then gets a 409. | `src/lib/phase.ts`, register pages | Re-run `canRegister` on the client at mount and before submit, and show the closed banner right away. |

---

## 🟢 Low / bugs and hygiene

| # | Issue | Where | Fix |
|---|---|---|---|
| L1 | `AbortSignal.any` is missing before Chrome 116 and Safari 17.4, so live updates never work there (every poll throws). | `src/components/LiveUpdates.tsx:128` | Add a small helper that falls back to a single `AbortController` + `setTimeout`. |
| L2 | Export is a GET with side effects. A cross-site top-level navigation (`SameSite=Lax`) can force an admin's browser to download a CSV and write an audit entry. Nothing leaks, but it's noisy. | `src/app/admin/export/route.ts` | Reject when `Sec-Fetch-Site` is `cross-site`, or switch to POST with an Origin check. |
| L3 | The contact form counts toward the rate limit before validation, so typos use up the 10 allowed messages. | `src/app/api/contact/route.ts:39` | Move `enforceRateLimit` after `validateContactForm`, as registration already does. |
| L4 | The walk-in guard reads `process.env.SUBMISSIONS_BACKEND === 'memory'` instead of the resolved backend. Unset means memory in dev, so the guard is skipped. | `registration-handler.ts:40` | Use `getServerConfig().backend === 'memory'`, or `!hasDatabase()`. |
| L5 | The public `/api/health` shows config, schema and outbox state to anyone. | `src/app/api/health/route.ts` | Return only `ok`/503 publicly, and show details only with `Authorization: Bearer $CRON_SECRET`. |
| L6 | Every open tab refreshes and purges at 00:00 PKT together, because the date is part of `public_revision`. | `0012_...sql:82`, `LiveUpdates.tsx` | Add a random 0–60s delay before acting on a revision change. |
| L7 | SECURITY DEFINER functions pin `search_path=public`. The current guidance is `''` or `public, pg_temp`. They're callable only by `service_role`, so the risk is low. | `0012_...sql:162-163` | In a new migration, run `alter function … set search_path = public, pg_temp`. |
| L8 | Files are tracked that shouldn't be. `.lhserver.log` exposes an internal LAN IP. There's also `GIMUN_MootCup_Website_PRD.docx` (tracked despite `*.docx` being ignored), `GIMUN_PRD_extracted.txt`, `data/submission-counter.json` and 18 zips under `Claude Skills/`. | repository root | Untrack them with `git rm --cached …` and keep them ignored. |
| L9 | GitHub Actions are pinned by tag, not SHA. | `.github/workflows/ci.yml` | Pin to commit SHAs; Dependabot will keep them updated. |
| L10 | There are dev-only advisories in `extract-zip`, `tmp` and `uuid`, pulled in by `@lhci/cli`. | `package-lock.json` | Upgrade `@lhci/cli` when a fixed version is out. It isn't shipped to production. |
| L11 | `vitest.config.ts` warns about ESM loaded as CommonJS. | `vitest.config.ts` | Rename it to `vitest.config.mts`. |

---

## Suggested order of work

1. **Today:** C1 (revert and rotate), C2 (upgrade Next), then confirm CI is green again.
2. **Before registrations open:** H1 (Turnstile + per-recipient cap), H2 (enforce MFA), H4 (stop silent drops), M8 (Supabase Auth settings), M9 (move out of OneDrive).
3. **Before event day, when traffic peaks:** H3 and M1 (poller loop and cache-purge throttle), M5 (health alert on the rate limiter), L1, L6.
4. **Hardening sprint:** M2 (nonce CSP), M3, M4, M6, M7, M10, M11, then the rest of the low table.
5. **After each step:** run `npm run qa:full`, which includes the Playwright browser and admin suites that this audit didn't run.
