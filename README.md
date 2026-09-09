# GIMUN & GMC 2027 Website

The public website for GIKI Model United Nations (GIMUN) and GIKI Moot Court (GMC). Content is managed in `content/`; public submissions use Supabase/Postgres durable storage, an email outbox delivered by Resend, and Upstash Redis rate limiting.

## Local development

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Local development defaults to the in-memory submission backend. It is suitable for form tests only; it must never be used for production submissions.

## Verification

```bash
npm run validate
npm run typecheck
npm run lint
npm run build
npm run qa:full
npm run validate:launch
```

`qa:full` is the routine engineering gate and always rebuilds before audits. `validate:launch` is the stricter content gate; it remains blocked until the approved asset manifest, Day 4 schedule, verified team/sponsor/gallery media, and final parseable PDFs replace the current seed content.

## Production submission setup

The public interfaces remain `POST /api/register` and `POST /api/contact`. Before launch:

1. Apply `supabase/migrations/0001_public_launch.sql` and `supabase/migrations/0002_submission_outbox.sql` to the production project.
2. Configure `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as server-only deployment variables.
3. Verify the sending domain in Resend and configure `RESEND_API_KEY`, `EMAIL_FROM`, and `NOTIFICATION_EMAIL`.
4. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for distributed rate limiting.
5. Set `SUBMISSIONS_BACKEND=supabase`, `SITE_URL`, `RATE_LIMIT_HMAC_SECRET`, and `CRON_SECRET`.

Submissions and email outbox rows are created in one database transaction. A successful response includes the stable reference ID and reports durable queue status separately; Vercel Cron retries Resend delivery independently.

## Content operations and deployment

Edit the JSON files in `content/` and follow [CONTENT_UPDATE_GUIDE.md](./CONTENT_UPDATE_GUIDE.md). Apply approved media and documents under `public/images/` and `public/documents/`, then run `npm run validate:launch`. Use [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) for provider backups, monitoring, incident response, and rollback.

GitHub Actions runs schema validation, typechecking, linting, a fresh production build, route/accessibility/SEO audits, form smoke tests, and rendered Playwright/axe checks. Lighthouse is a protected release-candidate gate. Vercel is the intended deployment target; configure the production domain, HTTPS, environment variables, preview protection, backups, and rollback access in the hosting/provider dashboards.
