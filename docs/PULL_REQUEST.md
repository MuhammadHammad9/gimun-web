# Stabilize submissions and add CMS/event operations

The website previously required JSON edits and redeployment for operational content, and registration delivery lacked request idempotency and an emailed QR ticket. This implementation adds a private `/admin` CMS, atomic registration/outbox storage, normalized rosters, payment/status workflows, allocation/check-in, certificate and survey tools, and audited close-out controls.

Public reads use Supabase with bundled seed fallback. Admin writes validate schemas, check active-user section permissions and invalidate public caches. The migration sequence fixes the original invalid function signature and restricts public access to operational tables/views/functions. The frontend integration already present in the workspace is preserved.

Validation and remaining limitations are recorded in [VERIFICATION.md](VERIFICATION.md). Local tests do not demonstrate production provider setup or approve seed content. See [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) for migration, provisioning, outbox and retention procedures. No PR, push or deployment is performed by this document.
