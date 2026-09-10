# GIMUN & GMC Website — Task Tracker

## Current Phase: Phase 7 — Pre-Launch, Launch & Post-Event Operations

> All development phases (0–6) are complete. 29/29 routes build. 0 TypeScript errors. 0 lint warnings. 100% QA pass rate.

---

## Phases 0–6 — COMPLETE ✅

- [x] **Phase 0** — Scaffolding & Environment (100%)
- [x] **Phase 1** — Design System & Global Shell (100%)
- [x] **Phase 2** — Core Content Pages (100%)
- [x] **Phase 3** — Registration & Forms (100%)
- [x] **Phase 4** — Support & Credibility Pages (100%)
- [x] **Phase 5** — Live-Event Features (100%)
- [x] **Phase 6** — QA, Performance & Accessibility (100%)

---

## Phase 7 — Pre-Launch & Launch

### 7.0 — Immediate Technical Fixes (DONE this session)
- [x] Fix Turbopack root warning in `next.config.ts`
- [x] Fix `CONTENT_UPDATE_GUIDE.md` filename inconsistency (`moot_problems.json` → `moot-categories.json`, `documents.json` → `resources.json`)
- [x] Mark Phase 4 & Phase 5 items as `[x]` in `IMPLEMENTATION_PLAN.MD`

### 7.1 — Vercel Deployment & CI/CD (Blocking for launch)
- [ ] Create/verify Vercel account and connect GitHub repository
- [ ] Configure environment variables in Vercel (`NEXT_PUBLIC_GA_ID`, `FORM_ENDPOINT`, `NOTIFICATION_EMAIL`)
- [ ] Verify auto-deploy pipeline on push to `main`
- [ ] Configure custom domain DNS to Vercel
- [ ] Verify HTTPS with no browser certificate warnings

### 7.2 — GitHub Repository Setup (Blocking for backup)
- [ ] Create remote GitHub repository `gimun-mootcup-website`
- [ ] Push all current code to remote `main` branch
- [ ] Add at least 1 backup collaborator with repository access

### 7.3 — Real Content Population (Blocking for launch)
- [ ] Confirm official event name & edition number → update `site.json`
- [ ] Confirm confirmed conference dates → update `site.json`
- [ ] Confirm fee amounts per track → update `site.json` fees object
- [ ] Upload real team photos → `public/images/team/`
- [ ] Upload real sponsor logos → `public/images/sponsors/`
- [ ] Upload real PDF documents → `public/documents/gimun/` and `public/documents/moot-cup/`
- [ ] Update `content/resources.json` fileUrl fields to match real uploaded PDFs
- [ ] Replace gradient placeholder gallery items in `content/gallery.json` with real photos
- [ ] Populate `content/committees.json` with real chairs (names, bios, photos)
- [ ] Populate `content/team.json` with real team members and roles

### 7.4 — Branded Assets (Pre-launch)
- [ ] Create branded `favicon.ico` + `apple-touch-icon.png` (primary blue #1E2A78, GIMUN/GMC initials)
- [ ] Confirm/create `public/images/og/default.jpg` (1200x630, branded, shows both tracks)
- [ ] Generate per-page OG images for `/gimun`, `/moot-cup`, `/register` routes

### 7.5 — Final Copy Review
- [ ] Scan all pages for AI clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- [ ] Verify no placeholder text remains ([TBD], sample data visible to users)
- [ ] Verify all real contact emails are accurate in `site.json`
- [ ] Confirm registration form reference ID year format (REG-GIMUN-2027-XXXX)

### 7.6 — Soft Launch (Internal Review)
- [ ] Share staging Vercel URL with organizing committee
- [ ] Gather feedback and fix any reported issues
- [ ] Run `npm run qa:full` one final time against live staging build
- [ ] Real-device test: mid-range Android Chrome + iPhone Safari (manual)
- [ ] WhatsApp preview test — share link and confirm OG card renders correctly

### 7.7 — Go Live
- [ ] Set registrationStatus.gimunOpen = true and mootCupOpen = true in `site.json`
- [ ] Commit + push → auto-deploy to custom domain
- [ ] Announce launch to organizing committee with live URL
- [ ] 48-hour monitoring window — check Vercel Function logs for errors

### 7.8 — Event Week Operations
- [ ] Daily announcement updates via `content/announcements.json`
- [ ] Real-time schedule changes via `content/schedule.json` + set updatedFlag: true
- [ ] Use `CONTENT_UPDATE_GUIDE.md` as the operational SOP

### 7.9 — Post-Event (After Gala)
- [ ] Publish results in `content/results.json`
- [ ] Set resultsPublished: true in `site.json`
- [ ] Upload gallery photos from the event
- [ ] Set registrationStatus.gimunOpen = false and mootCupOpen = false
- [ ] Archive `data/submissions/` securely


## Status: COMPLETE (100% Verified)

- [x] **Component 1: Cross-Route Link & Document Integrity Audit (`scripts/audit-links.js`)**
  - [x] Test all 29 application routes against Next.js build output
  - [x] Authoritative extraction of DOM `#hash` IDs from prerendered HTML (51 anchors verified)
  - [x] Crawl and verify internal links across rendered HTML and source files (1,044 route links verified)
  - [x] Verify physical document assets in `public/documents/` (9 documents verified)
  - [x] Clean exit code 0 on 0 broken links

- [x] **Component 2: Accessibility & Contrast Audit (WCAG 2.1 AA) (`scripts/audit-accessibility.js`)**
  - [x] Mathematical color contrast audit for all required color pairs
  - [x] Image `alt` attribute verification across source and rendered DOM
  - [x] Button visible text and `aria-label` verification (68 buttons verified)
  - [x] Unique `<h1>` per page across 21 App Router pages
  - [x] Logical heading hierarchy (`<h2>`, `<h3>` sequence without skipped levels) across all 25 prerendered HTML outputs
  - [x] Global `:focus-visible` styling in `globals.css`
  - [x] `prefers-reduced-motion` CSS media queries and `useReducedMotion()` support

- [x] **Component 3: 60fps Mobile Animation & GPU Compositing Hardening**
  - [x] Constrain scroll/hover animations strictly to `transform` and `opacity`
  - [x] Remove `backdrop-blur` from in-flow scrolling cards and strips
  - [x] Set spring damping $\ge 20$ in `src/lib/motion.ts`

- [x] **Component 4: Real Server End-to-End Form & Anti-Bot Security (`scripts/test-forms-e2e.js`)**
  - [x] Spawn real Next.js application server on an ephemeral port
  - [x] GIMUN Individual registration -> 200 OK + `REG-GIMUN-2027-XXXX` reference ID + disk persistence
  - [x] GIMUN Delegation registration -> 200 OK + multi-delegate roster
  - [x] GMC Team registration -> 200 OK + 3-member roster
  - [x] Contact inquiry submission -> 200 OK + saved to `contacts.json`
  - [x] Honeypot anti-bot trap -> 400 Bad Request + disk persistence blocked
  - [x] Velocity trap (< 2000ms) -> 400 Bad Request + disk persistence blocked
  - [x] Rate limiter burst protection -> 429 Too Many Requests
  - [x] Clean rollback of all test records leaving 0 test artifacts on disk

- [x] **Component 5: SEO, Social Previews & Meta Audit (`scripts/audit-seo.js`)**
  - [x] Audit all 29 application routes
  - [x] Verify unique titles and meta descriptions for all public pages
  - [x] Verify Open Graph and Twitter Card tags
  - [x] Validate `sitemap.xml` XML schema, `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`, and completeness
  - [x] Verify default Open Graph social image asset (`public/images/og/default.jpg`)

- [x] **Component 6: Package Integration & Full QA Execution**
  - [x] Registered scripts in `package.json`: `audit:links`, `audit:a11y`, `audit:seo`, `test:forms`, `qa:full`
  - [x] `npx tsc --noEmit` -> 0 type errors
  - [x] `npm run build` -> 29/29 routes prerendered successfully
  - [x] `npm run qa:full` -> 100% pass across all 6 test suites
