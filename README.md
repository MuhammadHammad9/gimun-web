# GIMUN & GMC website and event operations

Next.js 16 / React 19 public website with a Supabase-backed CMS and private `/admin` operations panel. JSON in `content/` is seed data and an outage fallback. Admin publication invalidates tagged public caches; timed publication is evaluated on the next cache refresh (normally within 60 seconds).

## Run locally

Use Node 24, run `npm ci`, copy `.env.example` to `.env.local`, configure a staging Supabase project, then run `npm run dev`. Without a configured database, the public site can display bundled content; admin and durable submissions need provider setup. Never put service credentials in a `NEXT_PUBLIC_` variable.

Apply migrations in numeric order, seed with `npm run content:seed`, then provision the first owner with `npm run admin:owner`. Follow [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) before using those commands against a real project. They write to the configured database. Seeding inserts missing entries without replacing existing admin edits.

## Operations

- CMS: announcements, emergency schedule updates, committees, resources, categories, FAQs, clarifications, people, sponsors, gallery, results, navigation and settings; drafts, timed visibility, revision restore and conflict checks.
- Registrations: durable references, request idempotency, normalized participants, payments, review status, duplicate flags, history, CSV exports and bulk status updates.
- Event day: country allocation/reservation, attendance by QR token or manual reference, eligibility checks and recorded registrar overrides.
- Email: durable outbox, immutable payloads, CID QR attachment, provider idempotency, status messages, templates, test/broadcast composition and manual queue processing.
- Post-event: certificate verification/PDFs, private survey links and summaries, archive snapshots and owner-only retention dry run/anonymization.

See [CONTENT_UPDATE_GUIDE.md](CONTENT_UPDATE_GUIDE.md) for the no-code workflow. Interactive rulebook layouts remain code; organizer-approved headline scoring weights are settings.

## Verify

`npm run qa:full` runs seed validation, unit tests, PostgreSQL migration tests, typecheck, lint, build, link/accessibility/SEO/architecture audits, form tests, public Playwright tests and the admin integration test. `npm run test:admin` builds separately in `.next-admin-test`, uses local fixture credentials and disables real mail delivery. It requires free local ports 54329 and 3101. Do not run two builds into the same output directory.

`npm run validate:launch` is a separate content-approval gate. Passing engineering tests does not approve event facts, media, PDFs, privacy terms or production services. [VERIFICATION.md](VERIFICATION.md) records actual checks and remaining limits.

No payment gateway, automatic waitlist promotion, multi-event tenancy or production deployment is included. The local PostgreSQL/Auth fixture does not replace a staging Supabase Auth, Storage and email smoke test.
