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
