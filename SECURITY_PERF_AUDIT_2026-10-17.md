# Security audit and performance pass — 2026-10-17

Branch `claude/security-perf-audit`, built on `main` at c635281. Builds on the 2026-10-08 review
(`SECURITY_REVIEW_2026-10-08.md`) rather than repeating it. Nothing was written to the live database;
the live site was only read (headers, public files, and the Supabase API with the public key).

## Security

| Area | Result | Evidence |
|---|---|---|
| Secrets in client bundles | **Clean** | Every server secret value from `.env.local` searched in the local build (95 client files) and in the 23 JS chunks the live site serves: 0 hits. The only match is the Supabase project URL, which is public by design. |
| Secrets in git | **Clean** | `scan-secrets.mjs` on 760 tracked files passes. New `--history` mode scans every added line in all 161 commits on all refs: passes. No `.env`, key or credential file was ever committed. |
| `NEXT_PUBLIC_*` variables | **Clean, now enforced** | Only the Supabase URL, the publishable key, the Turnstile site key, the site URL and the GA id are public. `check-env.mjs` now fails a build if any `NEXT_PUBLIC_` value equals a server secret, is an `sb_secret_`/Resend key, or is a legacy JWT with `role: service_role` (verified with three crafted values). |
| `.env.example` | **Fixed** | Documented the three missing variables: `REGISTRATION_API_ENABLED`, `REGISTER_DEVICE_MAX_ATTEMPTS`, `REGISTER_DEVICE_LOCK_MINUTES`. |
| Admin authentication | **Sound** | `src/proxy.ts` verifies the session on every `/admin` path and fails closed. Every admin page except sign-in (12), all 4 admin route handlers, and every admin server action except sign-in/sign-out call `requireAdmin`, `requirePermission` or `routePermission` before doing work (mapped one by one). The three public actions are safe: live purge is globally throttled, survey submission needs a valid token and is rate limited, and leaving preview only redirects to same-site paths. The live site redirects `/admin` without a session (307). |
| Role-based access | **Sound** | `can()` in `permissions.ts`: owner-only `users`/`close-out`, viewers never write, per-section overrides. Sensitive actions check twice (for example sending invoices needs both `registrations` and `email` write access). Exports require write access, refuse cross-site requests (`Sec-Fetch-Site`) and are audit-logged before release. |
| Password handling | **Sound** | The app never hashes or stores passwords. Supabase Auth does both. Temporary passwords are at least 12 characters and force a change at first sign-in; a password change re-verifies the current password and signs out other sessions. Sign-in has per-IP, per-account and account-wide limits. |
| XSS | **Clean** | All 4 `dangerouslySetInnerHTML` uses are safe: JSON-LD escapes `<`, the GA id is regex-checked, and the boot script is a constant. Every interpolated value in email HTML (`submissions.ts`, `invoice.ts`, `emailHtml`) goes through `escapeHtml`. CSV exports neutralise formula injection. |
| Rate limiting | **Sound** | Upstash limits on contact, survey, certificate PDF, admin sign-in, MFA, device minting and live purges. The polled `/api/public/revision` is CDN-cached (live: `X-Vercel-Cache: HIT`). |
| API endpoints and CORS | **Sound** | Live: a cross-site POST to `/api/contact` gets 403; the preflight returns no `Access-Control-Allow-Origin`; the cron endpoint answers 401 without or with a wrong bearer token; `/api/health` returns `{ok}` only. |
| Headers and CSP | **Fixed one item** | HSTS, nosniff, frame options, Referrer-Policy and Permissions-Policy are present, the public CSP is set, and admin pages get a nonce + `strict-dynamic` CSP with `frame-ancestors 'none'`. **Fixed:** `X-Powered-By: Next.js` was sent on every response (`poweredByHeader: false`). |
| Debug and build output | **Clean** | No production browser source maps (0 `.map` files), no `console.log` in `src`, and `.env`, `.git/config`, `package.json`, `next.config.ts` and `supabase/` all return 404 on the live site. |
| Database (RLS) | **Clean** | All 21 tables refuse the anon key on the live API (`42501`). The PostgREST schema exposes no tables, views or RPCs to anon, and the media bucket lists nothing. Migrations enable RLS and revoke `anon`/`authenticated` on every table and function. |
| Media uploads | **Sound** | Only JPEG, PNG, WebP and PDF are accepted (no SVG). Size limits apply, object names are random, and type and size are checked server-side before a file becomes available. |
| Dependencies | **0 production vulnerabilities** | `npm audit --omit=dev`: 0. Applied in-range patch/minor updates (`npm update`) and removed the unused `@gsap/react`. The 26 remaining advisories are dev-only (`@lhci/cli`, the `shadcn` CLI, `eslint-config-next` via `braces`/`micromatch`); there is no fixed upstream version yet and they never run in production. |

### Owner actions (dashboard, not code)

1. **Turn off public sign-up in Supabase.** The live project reports `disable_signup: false`, so
   anyone can create an Auth account. It reaches no data: every table refuses `authenticated`, and
   the admin requires an `admin_users` row. It still lets strangers create accounts and trigger
   Supabase emails. Change it in Supabase → Authentication → Sign In / Providers → Email.
2. Unchanged from 10-08: set the Turnstile keys when ready, and consider `ADMIN_REQUIRE_MFA=1`
   (deliberately deferred; left optional).
3. Consider Next 16.4.x / React 19.3.x as a separate change (minor versions, deliberately not mixed
   into this measured pass).

## Performance

**Method.** `scripts/measure-perf.mjs` (new) runs Lighthouse 3 times per page and reports the median.
It uses two profiles: the release gate's mobile profile (150 ms RTT, 1.6 Mbps, 4× CPU) and slow 3G
(400 ms RTT, 400 kbps, 4× CPU). Before and after are both production builds of this branch served on
the same machine (`next start`), so the only difference is the code.

| Profile / page | Score | LCP | FCP | TBT | CLS | Page weight | JS |
|---|---|---|---|---|---|---|---|
| gate / | 58 → 80 | 4.80 s → 4.58 s | 1.61 s → 1.53 s | 673 ms → 176 ms | 0.149 → 0.000 | 730 KB → 543 KB | 251 KB → 223 KB |
| gate /register | 67 → 81 | 4.63 s → 4.26 s | 1.67 s → 1.67 s | 591 ms → 138 ms | 0.000 → 0.000 | 718 KB → 533 KB | 248 KB → 221 KB |
| gate /resources | 73 → 83 | 5.27 s → 4.50 s | 1.67 s → 1.67 s | 257 ms → 105 ms | 0.000 → 0.000 | 707 KB → 522 KB | 248 KB → 221 KB |
| gate /gimun | 75 → 80 | 4.80 s → 4.62 s | 1.52 s → 1.52 s | 295 ms → 193 ms | 0.000 → 0.000 | 749 KB → 561 KB | 266 KB → 238 KB |
| slow3g / | 59 → 60 | 15.28 s → 14.56 s | 4.82 s → 4.82 s | 159 ms → 148 ms | 0.000 → 0.000 | 730 KB → 543 KB | 251 KB → 223 KB |
| slow3g /register | 50 → 61 | 14.82 s → 14.11 s | 4.82 s → 4.82 s | 465 ms → 134 ms | 0.000 → 0.000 | 718 KB → 533 KB | 248 KB → 221 KB |
| slow3g /resources | 57 → 62 | 18.82 s → 15.14 s | 4.82 s → 4.82 s | 225 ms → 97 ms | 0.000 → 0.000 | 707 KB → 522 KB | 248 KB → 221 KB |
| slow3g /gimun | 61 → 59 | 15.22 s → 14.50 s | 4.81 s → 4.82 s | 138 ms → 184 ms | 0.000 → 0.000 | 749 KB → 561 KB | 266 KB → 238 KB |

The project's own first-load guard (`scripts/report-first-load.js`) failed on `main` and passes on this
branch: about 26 KB gzip less JS on every page.

### What changed

- **GSAP no longer loads with every page.** c635281 added a static `import gsap` to `MobileMenu`,
  which the header renders everywhere, so GSAP (27 KB gzip) landed in every page's first load and the
  guard failed. GSAP now loads on the visitor's first touch, scroll or key press, and on demand when
  the menu opens. Focus moves into the menu once it is visible. Checked in the browser: opens,
  focuses Close, Escape closes and returns focus, scroll unlocks. This drove most of the TBT and
  score gains.
- **Team portraits:** the source PNGs are 350–900 KB each (about 8 MB on /about/team). They now go
  through the Next image optimizer via `getImageProps`, keeping the plain `<img>` the tilt parallax
  needs: WebP at the card size, about 25 KB each, still lazy. Admin-uploaded Supabase media is
  optimized the same way; any other URL is used as is.
- **Logo masks:** the header, footer and seal used the full 98 KB + 119 KB PNGs. They now use 288 px
  alpha-only WebP copies (29 KB + 26 KB, −75%) made by `scripts/optimize-brand-logos.mjs`. The
  originals stay as the source files. Rerun the script after replacing a logo.
- **Static file caching:** files in `public/` were served with `max-age=0`, so every visit
  revalidated them. They now get a 1-day cache plus 7 days of stale-while-revalidate.
- **CLS:** home measured 0.149 before and 0.000 after (3 of 3 runs). It was not reproducible in a
  traced run, so the exact element was not isolated; the GSAP and logo changes are the likely cause.

### Not fixed: LCP is still over the 3.0 s gate

LCP is still 4.3–4.6 s under the gate profile; the gate was not loosened. The cause, measured:

- The LCP element is hero text (the home `h1`, the register lead paragraph), and 85–91% of its LCP
  is *render delay*. Network is not the problem: locally every resource has arrived by about
  120 ms.
- First paint itself is late. Live production shows it too: the first paint at 1,969 ms comes
  after the load event at 1,812 ms. With all JavaScript blocked it is still about 650 ms locally,
  so JS is not the whole story.
- The trace shows about 560 ms of GPU-process work before the first frame, against 67 ms for a
  trivial page. Headless Chrome renders in software (SwiftShader), so the page's visual effects
  (blurs, backdrop filters, gradients, masks, the 186 KB stylesheet) are expensive in the lab, and in
  the CI gate, which also runs headless.
- An A/B test that switched off one effect class at a time was too noisy to name a single culprit:
  every variant landed at 750–1,000 ms, with a clear warm-up order effect.

The next step is a focused session that profiles the first frame in DevTools with GPU raster on and
off, or that tries `content-visibility` and moving the 186 KB stylesheet off the critical path. That
work touches the design's visual effects and needs the owner's call.

## Checks run on this branch

`npx tsc --noEmit` ✓ · `npx vitest run tests/unit` (19 files, 148 tests) ✓ · `npx eslint` ✓ ·
`node scripts/validate-content.mjs` ✓ · `node scripts/scan-secrets.mjs` and `--history` ✓ ·
`npm audit --omit=dev` 0 · production build ✓ · `scripts/report-first-load.js` guard ✓.
