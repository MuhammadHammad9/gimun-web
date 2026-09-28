# Product

<!-- impeccable:product-schema 1 -->

Sources: the repository (`content/`, `CONTENT_SIGNOFF.md`, `GO_LIVE.md`, `README.md`) and decisions the organizer made while planning the September 2026 redesign. Items marked *(inferred)* come from repository evidence and have not been separately confirmed.

## Platform

web

## Users

- **Prospective delegates.** University and school students deciding whether to apply to GIMUN, alone or as a delegation. They compare committees, fees and dates, then apply. Many are under 18 *(inferred: a B-Form is accepted as photo ID)*.
- **Law students forming moot teams.** Teams entering the GIKI Moot Court (GMC). They need the categories, the Compromis, the rules, deadlines and published clarifications, and they ask questions of their own.
- **Accepted participants.** People preparing to travel: schedule, venue and route, documents, check-in requirements, notices.
- **Partners.** Organizations considering sponsorship, who contact the partnerships address.
- **Organizers.** Secretariat, registrars, check-in staff and editors who run everything through the private `/admin` panel. The public redesign does not change their surface.

## Product Purpose

The official website of GIMUN & GMC 2027: a Model United Nations conference and a moot court competition held together at GIKI, Topi, Khyber Pakhtunkhwa, Pakistan, from 18 to 21 March 2027. It explains both tracks, takes applications for both (no online payment), publishes notices, schedules, documents, clarifications and results, and backs the event operations in the admin (review, invoices, QR check-in, certificates, surveys).

Success: complete applications on both tracks before the deadlines (GIMUN 15 February 2027, GMC 5 March 2027), and participants who arrive knowing where to be and what to bring.

## Positioning

Two rooms, one event: committee diplomacy and courtroom advocacy run side by side on one campus over the same four days, hosted by a named engineering institute. Records are checkable: certificates carry verification links, and results are published only after the awards gala.

## Operating Context

- **Applying:** pick a track, fill in the form, receive a reference number and a QR ticket by email. Fees are paid by bank transfer after acceptance, against an invoice from the organizers. No online payment is collected at any stage.
- **Preparing:** background guides and rulebooks as PDFs; GIMUN position papers due at least 7 days before Day 1; GMC memorials due 28 February 2027; GMC clarification questions answered publicly.
- **Event days:** check-in from 09:00 on Day 1 in the AHA Auditorium foyer with photo ID and the QR ticket; a four-day schedule with emergency updates; the gala and Grand Final on 20 March 2027.
- **Afterwards:** results, certificates checkable at `/verify`, a participant survey.
- **Editing:** organizers change content in the CMS; public pages refresh within about 60 seconds.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase CMS with bundled JSON as seed and outage fallback.
- Registration can be closed per track; pages must show the closed state honestly.
- Release gates: Lighthouse on mobile (performance at least 0.85, accessibility and SEO at least 0.95, LCP at most 3 s, TBT at most 200 ms, CLS at most 0.1, plus no non-composited animations, console errors or back/forward-cache blockers), axe at five widths, link and SEO audits, Playwright contracts on labels and ids, a first-load bundle guard.
- The schedule, application confirmation and certificate pages must print cleanly.
- Many event facts are defaults awaiting organizer confirmation (`CONTENT_SIGNOFF.md`). The design must hold up when a fact changes, disappears or grows longer.

## Brand Commitments

- Names: "GIKI Model United Nations" (GIMUN), "GIKI Moot Court (GMC)", combined "GIMUN & GMC 2027". Every page title contains GIMUN or GMC.
- The shield logo and the existing identity are evolved, not replaced (organizer decision, September 2026): maroon canvas, champagne accent, crimson for GIMUN, champagne for GMC; Satoshi, General Sans and JetBrains Mono.
- Voice: plain and specific. No em dashes, no exclamation marks, no claims the organizers have not made.

## Evidence on Hand

- Real content: dates, venue, fees, deadlines, contact addresses, four committees with their country lists (UNSC 15, DISEC 10, UNHRC 8, PNA 8), three moot categories, FAQ, schedule and rules text, all in `content/`. Several are provisional (see `CONTENT_SIGNOFF.md`).
- Absent, and not to be invented: past-edition statistics, testimonials, team members, committee chairs, sponsors, gallery photos, an emergency phone number, final PDFs and the institution's privacy terms. Pages hide these sections or say "to be announced" until the CMS has them.

## Product Principles

1. Truth over polish: show no number, person, partner or photo the organizers have not supplied.
2. Applying stays fast and calm on a phone, whatever the rest of the site does.
3. Both tracks have equal standing; visitors choose their room early and can always switch.
4. Organizers change facts without code, so every layout survives empty, short and long content.
5. Speed, accessibility and search budgets are release gates, not goals.

## Accessibility & Inclusion

WCAG 2.2 AA. Axe-clean at 375, 390, 768, 1024 and 1440 px. Reduced-motion users get static layouts with no page curtain and no smooth scrolling. Keyboard users get a skip link, visible focus and focus moved to the main content after each page change.
