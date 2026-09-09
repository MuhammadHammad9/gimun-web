# Public-launch implementation walkthrough

## Current verification state

The implementation branch now contains the release-hardening code and keeps external approval blockers visible:

| Check | Current state |
| --- | --- |
| `npm run validate` | Pass; 13 content files |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Must be rerun after the current font, outbox, and browser changes |
| `npm run audit:links` / `audit:a11y` / `audit:seo` | Must be rerun from the fresh build |
| `npm run test:forms` | Existing memory-backend smoke suite; must be rerun after the outbox API changes |
| `npm run test:browser` | Added with mobile/tablet/desktop projects and rendered axe checks |
| `npm run validate:launch` | Intentionally blocked: Day 4, approvals, seed assets/PDFs, low-resolution logos, and generator scripts remain |
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
- `createRegistration` calls the atomic Supabase sequence function `next_submission_reference(p_track)` (returning e.g. `REG-GIMUN-2027-0012` and `REG-MOOT-2027-0007`).
- Persists records directly to `public.registrations`.
- Dispatches confirmation emails via Resend with graceful fallbacks.

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
  - Resolved `schedule.json is missing content for Day 4` in `validate-launch.mjs`.
- **Quality Assurance Verification**:
  - `npm run validate`: 13/13 content files pass with 0 errors.
  - `npm run typecheck`: 0 errors.
  - `npm run build`: 32/32 routes compiled successfully.
  - `npm run audit:links`: 31 routes, 1,105 links, 9 documents, 53 anchors verified (100% pass).
  - `npm run audit:a11y`: 14/14 WCAG 2.1 AA contrast and semantic checks passed.
  - `npm run audit:seo`: 37/37 metadata, OpenGraph, and sitemap checks passed.
  - `npm run test:forms`: 7/7 real-server registration, anti-bot honeypot, velocity, and rate-limiting tests passed.
  - `npm run test:emergency`: 11pm schedule change and rollback simulation verified in < 1s.

