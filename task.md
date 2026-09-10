# GIMUN & GMC 2027 launch tracker

## Verified engineering baseline

- [x] Offline-safe Next.js production build; no Google Fonts network dependency.
- [x] Content schema validation, TypeScript, lint, route/link, accessibility, SEO, and form smoke-test scripts.
- [x] Fresh-build gate prevents audits from reading stale `.next` artifacts.
- [x] Canonical 2027 event dates and deadlines are used by content, metadata, sitemap, and registration status checks.
- [x] Privacy page, `robots.txt`, sitemap, favicon assets, Apple icon, and environment-driven metadata URLs.
- [x] Supabase migration and server-only service layer for durable registrations/contact messages.
- [x] Atomic `REG-GIMUN-2027-XXXX` and `REG-MOOT-2027-XXXX` references.
- [x] Resend receipt/Secretariat notification hooks with delayed-email status flags.
- [x] Upstash REST rate-limit integration with local in-memory mode explicitly limited to tests.
- [x] GitHub Actions routine QA workflow.

## Launch blockers

- [ ] Replace all 9 seed/sample PDFs with approved, parseable production documents.
- [ ] Supply 11 verified team photos, 6 sponsor logos, and 9 real gallery images, or remove unconfirmed entries.
- [ ] Replace placeholder external profile URLs and complete content-owner copy/date/person/sponsor review.
- [ ] Create Supabase project, apply `supabase/migrations/0001_public_launch.sql`, and verify dashboard/export access.
- [ ] Configure Resend domain/API key, sender, and Secretariat notification recipients.
- [ ] Configure Upstash Redis credentials and verify rate-limit behavior in staging.
- [ ] Configure Vercel preview/production environments, domain, HTTPS, deployment protection, and rollback access.
- [ ] Obtain the production analytics measurement ID before enabling analytics.
- [ ] Complete soft launch with the organizing committee and approve registration flags.

## Verification commands

```bash
npm run qa:full
npm run validate:launch
```

`qa:full` is expected to pass from a fresh build. `validate:launch` is the release gate and should remain failing until every launch blocker above is resolved.

## Event operations

- [ ] Use `CONTENT_UPDATE_GUIDE.md` for announcements and schedule changes.
- [ ] Monitor database submissions, email delivery, uptime, and errors daily during registration/event week.
- [ ] Publish verified results and gallery/press assets after the awards gala.
- [ ] Close registration, export/archive managed-provider records under the approved retention policy, and preserve the final content snapshot.
