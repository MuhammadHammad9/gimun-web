# Admin publishing and synchronization rollout

## Connected environment

Apply migrations through `0012_publications_and_live_admin.sql` before running this application version against a connected database. Run `npm run check:env` against the deployment environment. Connected operation requires `CMS_BACKEND=supabase` and `SUBMISSIONS_BACKEND=supabase`, matching public/server Supabase URLs, Auth keys, and private server credentials. Local bundled/memory configuration is a demonstration: changes there do not prove production synchronization.

Use `.env.production.example` as the deployment-variable checklist. Populate those values in the hosting provider's encrypted settings, not in the repository.

Do not expose the service key to browser code. Public revision responses contain only opaque revision and connection health. Private changes are represented only in authenticated admin revisions filtered by current permissions.

## Publication behavior

- Working documents retain their IDs and optimistic versions. Save draft leaves the live snapshot alone.
- Publish now creates an immutable release. Schedule captures the current working version; later draft edits do not alter that release.
- One pending replacement is supported. Canceling it preserves the effective publication.
- Expiry hides the latest effective publication and never resurrects an older release.
- Pinned releases replace the active pin. Restoring a revision creates a working draft.
- Schedule controls display Asia/Karachi and store UTC. Visibility is evaluated using database time without a scheduler worker.
- Settings apply immediately. Fee changes affect new applications; an existing amount due requires a separate audited correction. Results also require the global release switch.

## Content consumers

| Editable content | Public consumers |
| --- | --- |
| Event names, dates, phase, registration switches/deadlines | Shared site configuration, event pages, registration availability and server submission validation |
| Fees, payment instructions | Registration display and new receipt/invoice workflows; existing balances remain unchanged |
| Contact, arrival details, website copy | Contact, venue, shared footer and configured page placements |
| Announcements | Announcements page and active banner; dismissal is scoped to publication version |
| Schedule | Schedule page, summaries and emergency updates |
| Committees and country assignments | Committee pages, availability matrix and registration choices |
| Resources, moot categories | Resource library, linked guides and moot pages |
| FAQ, team, sponsors, gallery | Their corresponding public pages |
| Navigation | Header, mobile and footer. Footer columns follow each entry's `footerGroup` (GIMUN, Moot Court, Event, About). If nothing is published the site falls back to its built-in menu, and the admin list warns about it |
| Results | Results page after entry publication and site-wide release |
| Page copy (`copy`, one entry per page section) | Headings, leads, lists, links, images and show/hide for each public page section. `{tokens}` are filled from live data. Hiding a section renumbers the chapters after it. Needs migration `0013_page_copy.sql`, then `npm run content:seed` to add the defaults |
| Registrations, attendance, inbox, mail, certificates, feedback | Authorized admin views and existing private recipient/verification routes |

Operational country availability and schedule day labels are derived values, not independent content overrides.

## Local verification

`npm run test:unit` covers validation, privacy boundaries, outages and media authorization/reference protection. `npm run test:migrations` applies the complete schema to isolated PGlite and exercises publishing, scheduled expiry, permissions, allocations, walk-ins and retention confirmation. `npm run test:admin` starts an isolated fixture, builds the application and runs browser tests; it forces connected fixture mode regardless of local environment files.

Browser synchronization tests keep separate admin and public pages open, assert publication visibility within ten seconds, preserve an unsaved draft, and test scheduled publication/expiry without another write. Polling runs every five seconds while visible, pauses for hidden tabs, retries after failures, and resumes on visibility/network events. The guarantee applies to normal connected operation; offline/fallback states do not claim synchronization.

Fixture tests do not establish real Supabase Auth/Storage behavior, provider delivery, camera hardware operation, production load or staging latency.

## Deployment and recovery procedure

1. Back up the target database and test restoring that backup in a separate database. Inventory duplicate committee slugs before migration; the new unique index intentionally rejects duplicates.
2. Apply the additive migration to staging. Compare effective public entry IDs, scheduled timestamps and expiry before and after backfill. The migration preserves working documents and revision history and backfills publication snapshots.
3. Validate owner, admin, editor, registrar, check-in, viewer, custom-section and inactive accounts with real Auth/MFA. Exercise unavailable Auth and expired sessions. Test signed Storage uploads, abandoned-upload cleanup and deletion protection with real files.
4. Keep two real admin sessions and a public browser open. Measure commit-to-visible latency for content, settings, submissions, attendance, allocations and worker updates. Verify slow/offline/reconnect behavior and hidden tabs. Review mobile/tablet/desktop layouts and keyboard operation.
5. Test actual provider acceptance/retry/failure with approved test recipients. Queueing does not mean inbox delivery. Verify certificate PDF and survey links with test records.
6. Deploy application and migration together. Monitor `/api/health`, failed saves, delayed synchronization, publication failures, database query load and email backlog. Five-second polling initially favors correctness over query volume; measure before adding shared caches.
7. Do not drop publication tables during rollback. An old application reading working rows does not understand the new publication model and must not be used as a reader rollback. Roll back to a release that retains snapshot readers or forward-fix; restore the database only through the tested recovery procedure after preserving newer submissions/content.

No production database migration, deployment, provider email or real-record mutation is performed by the local test commands.
