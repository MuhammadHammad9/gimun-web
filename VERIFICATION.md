# Verification record: 29 September 2026 (storyline, art and interaction pass)

Run against the final source of this pass, local fixtures only:

- `tsc`, ESLint and `next build`: pass. Content schema 13/13. Unit tests 62/62.
- Link audit (0 broken routes, documents or anchors), static accessibility audit, SEO audit (62/62), submission contract audit (15/15), HTTP form scenarios (7/7): pass.
- Browser suite: all six viewport shards pass (331 tests), including new tests for the chapter rail (jump, focus, `aria-current`), the quick jump (Ctrl+K, filter, Enter, Escape with focus restored) and the copy-address confirmation. A rerun on 390 and 1440 px after the stylesheet split: 122 passed.
- Admin end-to-end workflow: 1/1 (with the worktree `.env.local` moved aside for the run, as noted below).
- Rendered axe: 0 violations on all 22 public routes at 390 and 1,440 px in light and dark (88 checks).
- Bundle guard: no motion library in any first load; first-load JS within 6.5 KB of the baseline on every audited page; page-specific CSS now loads only on its own route (global CSS 27.2 KB gzip).
- Lighthouse (mobile, simulated throttling, median of 5): `/` perf 87, `/register` 88, `/resources` 89; accessibility, SEO and best practices 100; TBT 60 ms; CLS 0; console errors, bf-cache, heading order and colour contrast pass. LCP remains 3.6 to 3.9 s against the 3 s assertion, as in every earlier record: the hero h1 paints at first contentful paint and the simulation adds the React and Next runtime requested before it. Home measured 90 before this pass; the chapter rail, pointer spotlight and quick jump cost about 3 KB of first-load script.

---

# Verification record: 29 September 2026 (motion redesign, worktree branch feat/motion-redesign-ui)

Run against the final source of the redesign, local fixtures only:

- `tsc`, ESLint and `next build`: pass. Content schema: 13/13 files valid. Unit tests: 62/62 (adds motion tokens, tone contrast in both themes, transition routes and the curtain state machine).
- Migrations 0001 to 0011 in PGlite: pass.
- Link audit (1,009 route links, 9 documents, 88 hash anchors), static accessibility audit, SEO audit (62/62), submission contract audit (15/15): pass. The link audit now resolves a bare `#id` in a source file against that file's own route instead of `/`.
- HTTP form scenarios: 7/7. Admin end-to-end workflow: 1/1. In the redesign worktree, `.env.local` sets `CMS_BACKEND=bundled`; it must be moved aside for `test:admin`, or public pages read bundled content instead of the fixture database and the publish step fails falsely.
- Browser suite: all six viewport shards pass (375, 390, 768, 1,024, 1,440 and 1,440 dark), including the new transition tests (curtain on link clicks, instant Back and Forward, same-page anchors, document links, reduced motion).
- Rendered axe: 0 violations on every public route at 390 px and 1,440 px in both the light and dark themes.
- Bundle guard: no GSAP, anime.js or Lenis code in any first load; JS within 3.2 KB of the pre-redesign baseline on every audited page. First-load CSS 26.2 KB gzip (was 27.8 KB); fonts 67.8 KB (was 78.8 KB) after subsetting.
- Lighthouse (mobile, simulated throttling, median of 3): `/` perf 90, `/register` 88, `/resources` 91; accessibility, SEO and best practices 100 on all three; TBT 60 to 90 ms; CLS 0; console errors, bf-cache, heading order and colour contrast pass.
- Production dependency audit: 0 vulnerabilities.

Not met: the LCP assertion (3 s). Simulated LCP is 3.5 to 3.8 s on the three pages, the same range as before the redesign. Observed LCP equals first contentful paint (about 1.4 s simulated FCP); the simulation adds the React and Next runtime that is requested before it. Dropping the display-font preload was tried and made things worse (CLS 0.15), so it was reverted. `lhci autorun` itself fails on Windows when chrome-launcher cannot delete its temp profile; the numbers above come from the Lighthouse Node API with the same settings as `lighthouserc.json`.

---

# Verification record — 28 September 2026 (improvement pass)

Run against the final source of this pass, local fixtures only:

- `tsc`, ESLint and `next build`: pass. Content schema: 13/13 files valid.
- Unit tests: 35/35 (adds fees, per-track registration state, date ranges, stored-field picking, IPv6 rate-limit grouping).
- Migrations 0001–0011 in PGlite: pass, including database-enforced permissions (viewer write refused, door staff override refused), participant and contact corrections, ticket resend, invoice queueing and idempotent contact submissions.
- Link audit, static accessibility audit (11/11), SEO audit (62/62), submission contract audit (15/15): pass.
- HTTP form scenarios: 7/7. Admin end-to-end workflow: 1/1 (registration, payment with stale-edit guard, check-in, allocation, certificates, survey, duplicate prevention).
- Browser suite across 375/390/768/1024/1440 px: 265 passed, 20 skipped (viewport-specific checks, and the gallery lightbox test while the gallery is intentionally empty).
- Production dependency audit: 0 vulnerabilities.

Not demonstrated locally: real Supabase Auth (including TOTP enrolment), Storage, Resend delivery, pg_cron scheduling, Vercel deployment and hardware QR scanning. `GO_LIVE.md` section 8 is the staging test that covers them. `npm run validate:launch` remains red until real documents and media are supplied and approved.

---

# Verification record — 21 September 2026

This record separates local engineering verification from production readiness. Existing frontend integration commits were preserved. The continuation restored omitted test/CI/build configuration and repaired the issues found while checking the integrated branch.

## Verified locally

- Seed schema validation: all 13 files pass.
- Unit tests: 27 pass, including permissions, dates, CSV injection handling, registration idempotency and Resend retry classification.
- PostgreSQL: migrations 0001–0010 apply in PGlite. Tests cover private grants, idempotency conflicts, configurable years/large counters, participant normalization, optimistic revisions, check-in eligibility, certificate issuance, country reservation/capacity conflicts, guarded counter reset and retention dry-run/anonymization.
- Production compilation, TypeScript and ESLint pass against the final source.
- Link, static accessibility, SEO and submission architecture audits passed independently. Static accessibility checks use actual theme tokens and do not certify WCAG conformance.
- Seven HTTP form/security scenarios pass against the isolated memory backend.
- The isolated admin workflow passes publication/restore, emergency update, QR attachment, payment/check-in, certificate PDF, survey invitation, duplicate-response prevention, feedback averages, actual results visibility, dynamic committee publishing and rendered admin accessibility checks.

## Final integrated run

- `npm run typecheck`, `npm run lint` and `npm run build`: pass.
- `npm run test:unit`: 27/27 pass.
- `npm run test:migrations`: all migrations and database invariants pass.
- Link audit: 1,030 internal route links, 9 documents and 82 hash anchors verified with no failures.
- Static accessibility audit: 11/11 checks pass. Rendered axe checks also pass across the public route matrix and admin workflow.
- SEO audit: 62/62 checks pass, including canonical URLs and all 25 sitemap entries.
- Submission architecture audit: 15/15 checks pass.
- Browser suite: 270 pass and 15 intentional viewport-specific checks skip across 375 px, 390 px, 768 px, 1,024 px and 1,440 px viewports.
- Admin workflow: 1/1 end-to-end scenario passes.
- Production dependency audit: 0 known vulnerabilities.

The browser runner restarts the production server for each viewport and does not override `SITE_URL`. This prevents long-run server loss from cascading into unrelated failures and prevents ISR test traffic from rewriting canonical metadata with the test server origin.

## Launch gate and external acceptance

`npm run validate:launch` currently fails with **60 content-approval issues**. The nine inaccurate document-size labels were corrected from actual file sizes. Remaining issues concern seed/sample PDFs, asset approvals, low-resolution media and retained generator files. The gate was not disabled. No user files were deleted to force it green.

The following have not been demonstrated by local fixtures: real Supabase Auth/Storage behavior, production grants as deployed, real inbox delivery, hardware QR-camera scanning, Vercel deployment, backups or multi-connection database concurrency under event load. No live migration, seed/provision command, message send, commit, push or deployment was performed in this continuation.

The owner must approve event facts, media/PDFs, gala date, scoring, contact details and institutional privacy/retention terms. Some long rulebook/campus copy remains code-owned and needs editorial review. PDF font support is checked; names containing unsupported glyphs produce a visible error rather than altered spelling. Retention cleanup does not remove published award/gallery entries, media assets or provider backups.

Provider configuration is documented in OPERATIONS_RUNBOOK.md. Daily Hobby cron is a safety net, not a frequent-retry scheduler; large queues and delayed retries require operator monitoring/manual draining or separately configured scheduling. Local PGlite/Auth fixtures are not a production Supabase emulator.

The sitemap omits optional modification dates instead of inventing dates at every build, consistent with the [Sitemaps protocol](https://www.sitemaps.org/protocol.html). Email retry classification follows [Resend's idempotency contract](https://resend.com/changelog/idempotency-keys).
