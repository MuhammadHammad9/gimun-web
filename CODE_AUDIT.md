# Code audit and hardening record

Audit date: 2026-09-30

This audit covered the current worktree's application, server, database, scripts, tests, content, and public asset surfaces. The inventory contained 383 files under `src`, `scripts`, `tests`, `supabase`, `content`, and `public`, including 285 TypeScript/JavaScript files. Existing uncommitted work was preserved.

## Critical paths reviewed

- CMS selection and public reads: `src/lib/content/repository.ts`, `src/lib/content.ts`, `src/lib/server/config.ts`, Supabase migrations 0012–0013.
- Admin authentication, MFA, permissions, and server actions: `src/lib/server/admin/*` and `src/app/admin/*-actions.ts`.
- Media lifecycle: signed upload creation, browser upload, metadata insertion, verification, retry, cleanup, selection, and deletion.
- Publication and cache behavior: `content_publications`, `effective_content`, `save_content`, `updateTag`, `revalidatePath`, live revisions, preview mode, and public revision polling.
- Anonymous submissions and email delivery: registration/contact handlers, request limits, idempotency, outbox leasing, cron authorization, and exports.
- Public route integrity, metadata, assets, accessibility, and content validation.

## Findings fixed in this pass

1. Local connected configuration now uses Supabase CMS mode; the example configuration no longer teaches the disconnected bundled mode as the default.
2. Failed multi-file uploads now expose a per-file Retry action.
3. The upload batch no longer depends on React state being committed before reading the selected files or description, preventing valid uploads from being rejected by a stale closure.
4. Media retry/finalize/abandon actions reject unsafe object paths before storage operations.
5. Upload metadata and storage cleanup paths are covered for metadata failure, verification mismatch, and abandoned uploads.
6. Admin/public connection status and fallback warnings remain visible when the public site is not reading the connected CMS.

## Verified invariants

- Draft content does not replace the live publication.
- Scheduled publication and expiry behavior are covered by migration tests.
- Public content and admin edits use the same Supabase publication source in connected mode.
- Content saves invalidate the relevant content tag and the public layout path.
- Referenced media cannot be deleted through the admin UI.
- Authenticated admin operations are permission-checked in both the server action and guarded database functions.
- Public JSON request bodies are bounded, same-origin checked when an Origin header is present, validated, rate-limited, and idempotent where supported.
- Export endpoints require write permission and an audit-log entry before returning data.
- Secrets are not tracked in source control; the `.env.example` file contains placeholders only.

## Verification evidence

- `npm run validate`: passed.
- `npm run test:migrations`: passed.
- `npm run test:unit`: 82/82 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run audit:links`: passed with 0 broken routes, documents, or anchors.
- `npm run audit:a11y`: 11/11 static checks passed.
- `npm run audit:seo`: 62/62 checks passed.
- Connected CMS health and Supabase media bucket/table probes returned healthy responses during the audit.

## Operational items still requiring deployment access

- Run a real signed upload and public publish in the intended staging project before production; the audit did not mutate production media.
- Confirm all production migrations are applied through 0013, the media bucket policies match the deployment, and browser/server Supabase URLs refer to the same project.
- Keep the fixture backend isolated to automated tests; do not use bundled mode to validate public publishing.
- The full admin browser suite has one known OneDrive-specific Playwright artifact-copy failure; its publishing/live-sync scenarios passed, but the artifact filesystem issue should be removed by running the suite from a non-synchronized checkout.
