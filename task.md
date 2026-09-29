# GIMUN & GMC 2027 launch tracker

## Implemented engineering baseline

- [x] Day 4 schedule entries for March 21, 2027 completed with debriefs, certificate distribution, excursions, and press release.
- [x] Offline-safe local WOFF2 font loading through `next/font/local`.
- [x] Canonical site URL and event-date helpers; schedule labels derive from `content/site.json`.
- [x] Content schema, asset existence, foreign-key, fresh-build, route/link, static accessibility, and SEO audits.
- [x] Server-only Supabase submission service with stable atomic reference formats.
- [x] Additive Supabase email outbox migration and protected Vercel Cron dispatcher with retry-safe Resend idempotency.
- [x] HMAC-derived distributed rate-limit keys and no form-data logging.
- [x] Playwright route/browser coverage, rendered axe checks, multi-viewport projects, and Lighthouse release configuration.
- [x] Robots, sitemap, favicon, Apple icon, privacy route, and deployment configuration.

## September 2026 improvement pass (done)

- [x] Public bug fixes: clarification routing, registration state per track, live schedule, titles, FAQ, forms and accessibility (commits c11e713, b30835d).
- [x] Admin and API: numeric fees, invoices, record corrections, resend ticket, DB-enforced permissions, audited exports, MFA, hardened submissions (e1df80e, migration 0011).
- [x] Content made consistent; fabricated sponsors, people and photos removed pending real ones (b9d237f). Defaults to confirm: `CONTENT_SIGNOFF.md`.
- [x] Design and performance: track ledger home, honest venue guide, key dates, consent-gated analytics, brand icons, manifest, dead code and unused dependencies removed.
- [x] Provisioning steps written up in `GO_LIVE.md`; CI has least-privilege permissions, concurrency, a dependency audit and Dependabot.

## Current release blockers

- [ ] Replace all seed/generated portraits, sponsor logos, gallery images, and nine PDFs with approved production assets (pending media handover).
- [ ] Complete `content/asset-approvals.json` with non-sensitive approval metadata for every referenced production asset.
- [ ] Remove seed asset-generator scripts after approved replacements are committed.
- [ ] Institutional owner supplies approved retention duration, legal basis, controller identity, privacy contact, and deletion/export procedure.
- [ ] Organizer configures Supabase migrations, Resend domain/API key, Upstash, Vercel, domain, HTTPS, `CRON_SECRET`, and production environment variables.
- [ ] Apply the second migration and verify transaction, outbox, retry, backup, export, and rollback workflows in staging.
- [ ] Run a protected organizing-committee soft launch and approve registration flags.
- [ ] Run the fresh-build release gate and Lighthouse release gate on the final approved content commit.

## Verification commands

```bash
npm run validate
npm run typecheck
npm run lint
npm run build
npm run audit:links
npm run audit:a11y
npm run audit:seo
npm run test:forms
npm run test:browser
npm run validate:launch
npm run audit:lighthouse
```

`qa:full` is the routine engineering gate. `validate:launch` remains intentionally red until content owners approve and replace the seed media/documents. Lighthouse is enforced for release candidates.

## Event operations

- [ ] Use `CONTENT_UPDATE_GUIDE.md` for announcements and schedule changes.
- [ ] Review Supabase submissions, email outbox/Resend delivery, Vercel errors, Upstash rate limits, and uptime daily during registration/event week.
- [ ] Publish verified results and gallery/press assets after the awards gala.
- [ ] Close registration, export/archive managed-provider records under the approved retention policy, and preserve the final content/deployment snapshot.
