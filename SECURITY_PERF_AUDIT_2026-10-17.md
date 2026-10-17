# Security audit and performance pass — 2026-10-17

Branch `claude/security-perf-audit`, started from `main` at c635281, with `main` up to 00d180b merged in
(conflicts resolved as described under Performance). Builds on the 2026-10-08 review
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

### How it was measured

`scripts/measure-perf.mjs` (new) runs Lighthouse with the release gate's mobile profile (150 ms RTT,
1.6 Mbps, 4× CPU) and a slow-3G profile (400 ms RTT, 400 kbps, 4× CPU) on `/`, `/register`,
`/resources` and `/gimun`, and reports the median of 3 runs.

The laptop was busy during this work (OneDrive syncing, other dev servers, about 40% CPU at idle),
and sequential runs drifted badly: the same build scored TBT 176 ms in one run and 1,437 ms in a later
one. So the final numbers come from three production builds served side by side and measured
**interleaved** (every round runs each build once, in shuffled order), so all three see the same
conditions:

- **start**: `c635281`, `main` when this work began;
- **main**: `00d180b`, `main` at the end, which by then had its own GSAP and portrait fixes
  (`1bd6c78`) and the new committee emblems (`00d180b`);
- **branch**: this branch, with `main` merged in.

All three used the same `node_modules`. TBT still swung up to 2× between builds that ship the same JS,
so read TBT as noisy; page weight and JS are exact.

Cells show **start / main / branch**:

| Profile / page | Score | LCP (s) | FCP (s) | TBT (ms) | CLS | Page weight (KB) | JS (KB) |
|---|---|---|---|---|---|---|---|
| gate / | 70 / 74 / 64 | 4.83 / 5.59 / 5.19 | 1.52 / 1.52 / 1.54 | 452 / 242 / 602 | 0.000 / 0.000 / 0.000 | 732 / 1159 / 625 | 251 / 254 / 223 |
| gate /register | 77 / 68 / 76 | 4.63 / 4.45 / 4.36 | 1.67 / 1.67 / 1.52 | 207 / 485 / 367 | 0.000 / 0.000 / 0.000 | 719 / 722 / 502 | 248 / 251 / 221 |
| gate /resources | 73 / 77 / 78 | 5.28 / 4.97 / 4.55 | 1.68 / 1.67 / 1.53 | 286 / 228 / 246 | 0.000 / 0.000 / 0.000 | 709 / 711 / 491 | 248 / 251 / 221 |
| gate /gimun | 78 / 72 / 75 | 4.65 / 5.60 / 4.94 | 1.52 / 1.53 / 1.53 | 236 / 289 / 277 | 0.000 / 0.000 / 0.000 | 749 / 1177 / 644 | 266 / 269 / 239 |
| slow3g / | 53 / 55 / 59 | 15.52 / 18.96 / 15.59 | 4.82 / 4.81 / 4.42 | 344 / 291 / 211 | 0.000 / 0.000 / 0.000 | 732 / 1159 / 625 | 251 / 254 / 223 |
| slow3g /register | 50 / 62 / 58 | 15.24 / 14.71 / 13.80 | 4.82 / 4.82 / 4.82 | 480 / 137 / 229 | 0.000 / 0.000 / 0.000 | 719 / 722 / 502 | 248 / 251 / 221 |
| slow3g /resources | 59 / 60 / 57 | 18.82 / 18.02 / 16.02 | 4.82 / 4.82 / 6.24 | 199 / 198 / 195 | 0.000 / 0.000 / 0.000 | 706 / 711 / 491 | 248 / 251 / 221 |
| slow3g /gimun | 56 / 60 / 62 | 15.35 / 18.85 / 15.18 | 4.82 / 4.82 / 4.42 | 234 / 143 / 123 | 0.000 / 0.000 / 0.000 | 748 / 1177 / 644 | 266 / 269 / 239 |

What the table shows:

- **Against today's `main`**, the branch has the lowest page weight on every page (−30% to −46%),
  27–30 KB less JS, and lower LCP on all four pages in both profiles.
- **Against `start`**, the branch is 15–31% lighter and has lower LCP on `/register` and
  `/resources`. On `/` and `/gimun`, `start` is slightly faster only because it predates the committee
  emblems.
- **CI:** `main` has failed CI since `c635281` on the first-load guard (GSAP in every first load), so
  the Lighthouse release gate has not run since. `1bd6c78` fixed that on `main`, and the guard passes
  on this branch.

An earlier sequential before/after run of the first commit on this branch (gate profile, home: score
58→80, TBT 673→176 ms, CLS 0.149→0) pointed the same way, but was taken while the machine was quieter.
Treat the interleaved table as the reliable comparison.

### What changed

- **GSAP out of every first load.** `c635281` imported GSAP statically in `MobileMenu`, which the
  header renders on every page (+27 KB gzip, first-load guard failing). `main` later fixed this
  independently with a 1.5 s timer. The merge keeps `main`'s approach with three changes:
  - GSAP is fetched after the visitor's first touch, scroll or key press (still only where the menu
    button shows), not on a timer. The timer downloaded it during every page load.
  - If the GSAP download fails, the menu opens or closes without animation. Before, a failed
    download left an invisible dialog holding the page's scroll lock.
  - Focus moves into the menu once the panels are visible.

  Checked in the browser: opens on first tap, focus goes to Close, a real Escape closes it and
  returns focus to the menu button, and scrolling unlocks.
- **Team portraits** (350–900 KB PNGs) go through the image optimizer via `getImageProps` (about
  25 KB WebP each). The merge keeps `main`'s 800×1000 sizing, adds Supabase-uploaded photos, and
  guards protocol-relative `//` paths, on which `getImageProps` throws during render. Without the
  guard, one bad photo URL entered in the admin would crash the team page.
- **Mask images** (`scripts/optimize-mask-images.mjs`, replacing the earlier logo script): every
  logo and emblem is an alpha mask, so the colour is flattened and only alpha kept, as lossless
  WebP:
  - logos 192 px tall: 217 KB → 32 KB. They load on every page at high priority, so they sit on the
    path to the first paint.
  - committee emblems 256 px for the home placards: 428 KB → 107 KB;
  - committee emblems at full size for a committee page's hero: up to 125 KB → 33–92 KB.
- **JetBrains Mono** limited to the `wght 400..600` range `layout.tsx` declares (38 → 28 KB). The
  OFL permits modification and the family has no Reserved Font Name; nothing on screen changes.
  Satoshi and General Sans were left alone: they are already Latin-only (about 33 KB each), and their
  ITF licence was not checked for modification rights.
- **Header glass:** the blur is applied only while the pill shows. At opacity 0 it still cost a full
  blur on the first frame, and it now stays through the 320 ms fade-out, so the transition looks the
  same. This also **fixed a pre-existing visual bug**: the rule listed `backdrop-filter` before
  `-webkit-backdrop-filter`, and Lightning CSS then compiled only the prefixed form, which Chrome does
  not support (`CSS.supports` is false in Chrome 152). The frosted header never blurred in
  Chrome/Edge on `main`. It now does (checked: `blur(18px) saturate(1.4)` when condensed, `none` at
  rest).
- **Static files in `public/`** get a 1-day cache plus 7 days of stale-while-revalidate (they were
  `max-age=0`).

### LCP: still over the 3.0 s gate on this machine (gate not loosened)

No build reaches the 3.0 s LCP budget on this laptop, including `start`. What the investigation
established:

1. **The LCP element is hero text.** It is the home `h1` and the `/register` lead paragraph, and
   85–91% of its LCP is *render delay*; the network is not the bottleneck.
2. **Lighthouse's simulated LCP counts every request that starts before the observed paint.** The
   framework JS (about 200 KB gzip, mostly React and the Next runtime) is requested from `<head>` at
   about 70 ms, so it always lands on the LCP path.
   - Blocking all JS gave a simulated LCP of 2.58 s, against 4.4 s with it: JS accounts for about
     1.8 s.
3. **Visual effects are not the lever.** A Lighthouse A/B through a proxy that injected one CSS
   override per variant on `/register` showed:
   - switching off **every** effect (blurs, backdrop filters, gradients, masks, shadows, blend
     modes) halved the observed first paint (1,093 → 490 ms);
   - but it moved simulated LCP only about 0.5 s (8.3 → 7.8 s through the uncompressed proxy).
   - The film grain alone: about −0.1 s. So the design's effects stay.
4. **What remains is mostly the framework.** About 200 KB of first-load JS is React, the Next router
   and Turbopack runtime (about 135 KB gzip) plus small app chunks. No change that keeps the
   framework closes the remaining 1.3–2 s on this hardware.

Options for the owner, in order:

- **(a) Let CI decide.** The gate runs on GitHub's Ubuntu runners, which have faster CPUs than this
  laptop. The earlier CI reading was 3.0–3.9 s, and this branch is lighter than anything measured
  then. Merging the branch (or `main`, now that its guard passes) lets the release gate run again.
- **(b)** If CI still fails narrowly, decide whether 3.0 s is the right budget for simulated LCP
  with this framework. Loosening the gate is the owner's call; it was not changed here.
- **(c)** Larger structural work: fewer client components in the shared layout, or a lighter
  motion stack.

## Checks run on this branch

On the final tree (`main` merged in): `npx tsc --noEmit` ✓ · `npx vitest run tests/unit` (19 files,
148 tests) ✓ · `npx eslint` ✓ · `node scripts/validate-content.mjs` ✓ · `npm run test:migrations` ✓ ·
`node scripts/scan-secrets.mjs` and `--history` (169 commits) ✓ · `npm audit --omit=dev` 0 ·
production build ✓ · `scripts/report-first-load.js` guard ✓.
