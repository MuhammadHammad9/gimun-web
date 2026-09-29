# Content and event-operations guide

Use `/admin` after provider setup and owner provisioning. Your role and section grants determine the links and actions you can use. A new account must change its temporary password. Keep personal participant details out of public content fields.

## Publish content

Open a content section, choose an entry or create a draft, edit its fields, choose **published**, and save. Public caches are invalidated after a successful save. Optional publication/expiry times are UTC and can take up to the cache refresh interval to appear. Empty published collections stay empty; they do not resurrect seed entries. An unavailable/unseeded CMS uses the bundled fallback and the dashboard reports the fallback condition.

IDs identify records; keep existing IDs stable. Committee slugs determine public URLs. If another editor saved first, reload before retrying. Revision restore creates a new change rather than deleting history. Only one published announcement can be pinned; unpin the previous one before publishing another, or use the emergency schedule flow.

Resources can be picked by name from committee/category forms. Media users can upload JPEG, PNG, WebP or PDF files and pick library assets. Resource uploads fill size, format and upload date; review titles and version dates before publication. Images are limited to 5 MB and PDFs to 25 MB. Uploading is not editorial approval. The media page shows references in content sections you can access.

## Settings and facts

Manage dates, fees, per-track registration switches, results visibility, venue, contacts, memorial/gala dates, response time, check-in guidance, statistics, footer text, privacy copy and scoring weights in Settings. Do not guess missing facts. GIMUN and GMC scoring weights must each total 100 when supplied. The shared navigation collection feeds header, mobile and footer renderers; `parentId` groups child links.

The phase is derived from dates and flags, with an optional override. Check it on the dashboard. Registration APIs still enforce each track's switch and deadline. After editing dates or phase, verify the public homepage and registration page.

## During the event

Use Schedule's emergency form to update a session, flag it Updated and publish the pinned announcement together. Use Registrations to filter/review applications, verify payment and optionally queue a status email. Bulk application status changes preserve payments and do not send email. Duplicate flags are review aids, not automatic rejection.

Allocate accepted GIMUN participants using the board; country uniqueness, reservations and capacity are checked in PostgreSQL. Check-in requires acceptance and paid/waived fees. Check-in staff can scan a QR or enter a reference; registrar-authorized staff can override eligibility with a recorded reason. Camera access needs HTTPS and browser permission. Manual lookup remains available.

## Messages and post-event work

The Email section supports templates, variable previews, test messages to your signed-in address, recipient audiences, retry/cancel and **Process due messages**. Review and confirm the audience before queueing. A queued message is not proof of delivery. Process the remaining queue after large broadcasts and monitor retries within the provider's idempotency window.

Review clarification text and remove personal information before promoting it publicly. Inquiry replies are queued, not sent synchronously.

Enter results individually or in the bulk form, then enable **results Published** in Settings. Gallery supports bulk upload and entry. Certificate/survey mail batches accept up to 25 checked-in participants. Participation certificates are reused by participant/kind; deliberately sending a batch again queues another email. Award/chair issuance is available in the individual certificate form. Verification URLs reveal certificate name and award type to anyone with the URL. PDF generation preserves spelling; unsupported font characters fail visibly rather than silently changing a name.

Feedback permits one response per participant token. The admin summary shows response rate, averages and comments. Keep tokens private.

## Close-out

Close both registration tracks, export registrations (including payments), participant rosters and inquiries, and make a content snapshot. Archive freezes content/settings and closes registration. Retention cleanup requires an institutional policy, legal basis, privacy contact, a past cutoff, an archive, dry-run counts and typed confirmation. It anonymizes selected operations data and revokes certificate/survey links; it does not invent a retention period. Back up and review approved public content separately before cleanup.

JSON editing and redeployment are fallback/developer workflows. The old `test-11pm-update.mjs` script is retained for history but is not the active emergency drill; `npm run test:emergency` now runs the isolated admin integration test.
