# Implementation walkthrough

Public content flows through `src/lib/content.ts` and the cached database repository. Zod schemas in `src/lib/content/registry.ts` define editable collections and settings. The admin renders schema-driven forms with publication state and revision controls; operational actions are validated server-side and use transaction-backed SQL functions.

Registration produces one reference, stable ticket token, normalized participants and durable email rows in one transaction. Duplicate request keys replay the original receipt; altered payloads conflict. Email payloads include a CID PNG and use the outbox ID for provider idempotency. Attendance, allocations, certificates and surveys use normalized participant IDs.

The public frontend has continued to evolve in the shared workspace. Existing integration commits are preserved. The current test infrastructure includes unit tests, real SQL execution in PGlite, public browser checks and an isolated admin workflow test. Details and observed outcomes belong in [VERIFICATION.md](VERIFICATION.md), not unsupported blanket claims in this walkthrough.

Operational documentation: [content guide](CONTENT_UPDATE_GUIDE.md), [runbook](OPERATIONS_RUNBOOK.md), [README](README.md). Provider deployment, real email delivery, institutional fact approval and retention decisions require staging/owner acceptance.
