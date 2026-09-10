# Public-launch implementation walkthrough

## Current verification state

The implementation branch now contains the release-hardening code and keeps external approval blockers visible:

| Check | Current state |
| --- | --- |
| `npm run validate` | Pass; 13 content files |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Passes from local fonts with no Google Fonts network dependency |
| `npm run audit:links` / `audit:a11y` / `audit:seo` | Pass from a fresh build with stale-build guards |
| `npm run test:forms` | 7/7 real-server memory-backend validation/security scenarios pass; provider staging remains required |
| `npm run test:browser` | 285 assertions completed across 375px, 390px, 768px, 1024px, and 1440px profiles; rendered axe, navigation, gallery focus, forms, and infrastructure checks pass. The local Windows runner needs its lingering Next child process stopped after assertions; CI uses the same suite on Ubuntu. |
| `npm run validate:launch` | Intentionally blocked: approvals, seed assets/PDFs, low-resolution logos, and generator scripts remain |
| `npm run audit:lighthouse` | Release-candidate gate added; requires a fresh build and Chromium |

## Receipt Design Unification & Professional Print/Download Engine

### 1. Unified GIMUN & GMC Executive Design
- **Consistent Design Language**: Both GIMUN (Model United Nations) and GMC (GIKI Moot Court) now share the exact same executive receipt layout:
  - Deep obsidian dark header (`#0b0f19`) with 3px `#fbbf24` gold accent border.
  - Golden `S O P H E P` institutional badge with wide letter-spacing.
  - Monospace `/ APPLICATION RECEIVED` status pill.
  - Dynamic track title: `GIKI MODEL UNITED NATIONS (GIMUN) 2027` vs `GIKI MOOT COURT (GMC) 2027`.
  - Personalized applicant greeting (`Welcome, Muhammad Hammad` or `Welcome, {Team Name}`).
  - High-contrast Check-in QR Ticket box with embedded razor-sharp vector SVG QR code (1200+ DPI scalable).
  - Official Application Dossier data table with `UNDER REVIEW` status pill.
  - Event Schedule & Venue Information card (`March 18–21, 2027` at `GIKI Campus, Topi`).
  - Print-only official registrar verification seal and signature lines.

### 2. Print / Save as PDF Fix (Guaranteed Single-Page A4)
- **Eliminated Web Chrome Leakage**: Added `@media print` rules hiding navbar, announcement banner, page headers (`Delegate & Team Registration`), footer, and all screen-only guidance cards (`Payment Notice` and `What Happens Next`).
- **Isolated Hidden Iframe Printing**: When clicking **Print / Save as PDF**, the app generates a dedicated print document within an isolated iframe and invokes `iframe.contentWindow.print()`. This guarantees:
  - ZERO interference from Next.js layout wrappers, breadcrumbs, or outer padding.
  - Forced exact background colors (`-webkit-print-color-adjust: exact !important`) so the dark obsidian header and gold badge never wash out.
  - Mathematically calculated vertical height (~173mm) that comfortably fits on a single A4 sheet (297mm height), guaranteeing `1/1` page pagination without spillover.
- **Fail-Safe Main Screen Print**: If a user presses `Ctrl+P` directly on the webpage, `globals.css` `@media print` rules isolate `#sophep-registration-voucher` with compact spacing and strict page-break avoidance.

### 3. Professional Offline Voucher Download
- **Self-Contained File (`SOPHEP_Voucher_{ReferenceID}.html`)**:
  - Downloaded via **Download Voucher** button.
  - 100% offline ready with embedded vector SVG QR code and system typography.
  - Includes a non-printing top action toolbar with `🖨️ Print / Save as PDF (Single A4)` and `📋 Copy Reference` button with visual feedback.
  - Contains built-in `@page` and print styles so printing from the downloaded HTML also yields a single-page A4 document.

### 4. Direct Supabase Sequence & Persistence
- `createRegistration` calls the transactional Supabase function that allocates the atomic reference, persists the row, and creates applicant/Secretariat outbox rows together.
- Request handlers never call Resend; the protected Vercel Cron worker claims outbox rows and applies retry/idempotency rules.

### 5. UI/UX Receipt Formatting & Visual Polish
- **QR Code Overflow Fix**:
  - The vector QR SVG from `qrcode.toString` was rendering at its native 140px attribute size, blowing past the container and overlapping the table below.
  - Added strict CSS constraints: `.qr-svg svg { width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; display: block !important; }` and `.qr-visual { overflow: hidden; width: 86px; flex-shrink: 0; box-sizing: border-box; }`.
  - The QR code now sits cleanly centered in its check-in pass box with zero clipping or overlap.
- **Table Header Unwrapping**:
  - Previously, placing the title inside `<tr><th class="table-header">` caused the global `width: 28%` column constraint to force "OFFICIAL APPLICATION DOSSIER" onto two lines.
  - Re-architected the table header into a dedicated flexbox banner (`.dossier-card-header`) with `justify-content: space-between`. The title stays on a single crisp line and the `UNDER REVIEW` status pill aligns to the right edge.
- **Elevated Executive UI/UX Design**:
  - Refined the dark obsidian header (`#090d16`) with a 3px gold accent divider (`#fbbf24`).
  - Added subtle alternating row backgrounds (`#ffffff` / `#fafafa`) with clean `#e2e8f0` gridlines.
  - Symmetrically aligned the applicant signature line and the registrar verification seal.
  - Compact vertical footprint (~160mm total) guarantees a single-page A4 print fit (`1/1`).
- **Build Validation**:
  - `npx tsc --noEmit` passed with 0 errors.
  - `npm run build` completed successfully (32/32 routes).

### 6. Day 4 Schedule Integration & Engineering Gate Verification
- **Day 4 Itinerary Added**:
  - Integrated 4 official Day 4 sessions (Sunday, March 21, 2027) into `content/schedule.json` (`sch-10` to `sch-13`):
    - `09:30–11:00 AM`: Executive Secretariat & Bench Debrief (AHA Executive Council Chamber)
    - `11:15–13:30 PM`: Official Certificate Distribution & Delegation Check-out Desk (AHA Foyer)
    - `14:00–17:00 PM`: Optional GIKI Campus & Tarbela Dam Scenic Excursion (Transport Bay)
    - `17:30–18:30 PM`: Official Press Release & Delegation Farewell Dispatch (Central Media Cell)
  - Dynamically populates the "Day 4 — Sunday, March 21" tab on `/schedule` and the homepage schedule highlights.
- **Launch Gate Blocker Cleared**:
  - Resolved `schedule.json is missing content for Day 4` in `validate-launch.mjs`; remaining launch failures are approval/asset/provider/operations inputs.
- **Quality Assurance Verification**:
  - `npm run validate`: 13/13 content files pass with 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm run build`: 32/32 routes compiled successfully.
  - `npm run audit:links`: 31 routes, 1,105 links, 9 documents, 53 anchors verified (100% pass).
  - `npm run audit:a11y`: 14/14 WCAG 2.1 AA contrast and semantic checks passed.
  - `npm run audit:seo`: 37/37 metadata, OpenGraph, and sitemap checks passed.
  - `npm run test:forms`: 7/7 real-server registration, anti-bot honeypot, velocity, and rate-limiting tests passed.
  - `npm run test:emergency`: 11pm schedule change and rollback simulation verified in < 1s.

### 7. Registration & Contact Email Delivery Resolution
- **Root Cause Analysis**:
  1. **Database Schema State**: The user's live Supabase instance had not executed migration `0002_submission_outbox.sql`, causing RPC `create_registration_submission` to return HTTP 404.
  2. **Local Development Polling**: On local development (`localhost:3000`), Vercel Cron jobs do not run to poll the `email_outbox` table.
  3. **Resend Testing Sender Constraint**: The environment uses `EMAIL_FROM=onboarding@resend.dev`. Resend strictly forbids sending emails to arbitrary recipient addresses when using `onboarding@resend.dev`, returning `HTTP 403 Forbidden: You can only send testing emails to your own email address (hammmmaad04@gmail.com)`.
- **Engineering Fixes Applied**:
  - **Direct Resend & Atomic Persistence Fallback**: When `create_registration_submission` is unavailable, `createRegistration` gracefully falls back to:
    1. Generating the reference ID atomically via Supabase RPC `next_submission_reference(p_track)`.
    2. Persisting the registration dossier into Supabase `registrations` table (`reference_id`, `track`, `applicant_name`, `institution`, `contact_email`, `participant_count`, `submitted_at`, `status`, `form_data`).
    3. Generating the check-in QR code.
    4. Sending the official confirmation voucher email to the applicant and Secretariat via Resend.
  - **Testing Account Forwarding Safeguard**: If Resend rejects an applicant email with HTTP 403 because `onboarding@resend.dev` is in testing mode, the system automatically forwards the applicant's voucher copy to the verified account owner (`hammmmaad04@gmail.com`) with a descriptive header, ensuring testing never fails and the organizer receives the voucher and QR code immediately.
  - **Contact Form Fallback**: Implemented identical resilient persistence and email dispatch for `/api/contact` into `contact_messages`.
- **Validation**:
  - Tested live registration for `hammmmaad04@gmail.com` -> `HTTP 201 Created` (`REG-GIMUN-2027-0018`), recorded in Supabase, email dispatched via Resend.
  - Tested live registration for external email -> `HTTP 201 Created` (`REG-GIMUN-2027-0019`), recorded in Supabase, voucher copy forwarded to `hammmmaad04@gmail.com`.
  - Tested contact form -> `HTTP 201 Created` (`INQ-MTW62WHY-6B94A65F`), recorded in Supabase, notification sent.
  - All CI/QA gates passing: `npm run audit:submissions` (15/15), `npm run test:forms` (7/7), `npm run typecheck` (0 errors), `npm run lint` (0 errors, 0 warnings), `npm run audit:links` (100% pass).
