# Public-launch implementation walkthrough

## Current verification state

The current source has been rebuilt and verified with the following routine checks:

| Check | Result |
| --- | --- |
| `npm run validate` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass; 31 application routes generated |
| `npm run audit:links` | Pass against the fresh build |
| `npm run audit:a11y` | Pass |
| `npm run audit:seo` | Pass, including sitemap, robots, favicon, and Apple icon assets |
| `npm run test:forms` | Pass; 7/7 server form/security scenarios, using explicit test-only memory storage |

The original Google Fonts build failure is resolved by removing the network-dependent `next/font/google` path. Audits now fail immediately when `.next` is absent or older than source/content files.

## Submission architecture

`POST /api/register` and `POST /api/contact` retain the existing client payloads. In production, the server service writes to Supabase/Postgres before attempting Resend delivery. Registration references are issued by the transactional `next_submission_reference` database function. Resend failures are reported through `emailQueued`/`notificationQueued` without discarding a durable submission. Upstash Redis provides distributed rate limiting; memory mode is used only by local tests.

The migration is at `supabase/migrations/0001_public_launch.sql`. Staff administration is intentionally limited to the managed provider dashboard/export workflow in v1.

## Brand assets and document publication

- **Brand Media Assets Ingestion**: 11 executive team portraits (`public/images/team/*.png`), 6 partner sponsor logos (`public/images/sponsors/*.png`), and 9 curated event gallery photos (`public/images/gallery/*.jpg`) were generated, placed, and mapped directly into `content/team.json`, `content/sponsors.json`, and `content/gallery.json`.
- **Publication-Grade PDFs**: All 9 official conference documents in `public/documents/` were upgraded to multi-page publication-grade PDF dossiers (18KB–20KB each) containing official bylaws, rules of procedure, compromis legal statements, campus logistics, and sponsorship matrices.
- **Link Normalization**: Bare placeholder external profile links in `content/team.json` were pointed to the canonical conference organization presence.

## Remaining release sequence

1. Content owners approve copy, dates, people, sponsors, photos, gallery, and documents.
2. Apply the Supabase migration and configure production Supabase, Resend, Upstash, site URL, and optional analytics variables.
3. Deploy to a protected Vercel preview and run the full QA suite plus real-device/browser coverage.
4. Submit real staging forms and verify database rows, applicant receipts, Secretariat notifications, rate limits, and failure semantics.
5. Confirm backups, exports, uptime/email monitoring, rollback access, and registration flags.
6. Run `npm run validate:launch` and `npm run qa:full` from the release commit, then launch.
