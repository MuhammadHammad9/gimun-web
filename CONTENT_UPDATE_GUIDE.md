# Single-Maintainer Content Management & Standard Operating Procedures (SOP)
## GIMUN & GMC 2027 Portal

> Production note: public copy remains JSON-managed, but registration and contact submissions are stored by the managed provider configured in the deployment environment. Local in-memory storage is for development and smoke tests only; it is not an operational submission archive. Email receipts and Secretariat notifications are durable outbox records delivered by the protected Vercel Cron worker.
>
> Before launch, run `npm run validate:launch`. The strict gate must pass after approved team photos, sponsor logos, gallery media, final parseable PDFs, and `content/asset-approvals.json` replace the seed content.

This document is the official operational guide for the webmaster and organizing directorate of **GIMUN & GMC 2027**. The website is engineered with a **Zero-Code Content Architecture**: every piece of textual data, schedule, announcement, committee list, and result lives in simple JSON files in the `content/` folder.

You **never** need to modify React, HTML, or TypeScript code to update the website.

---

## 1. Directory Structure of Content Files

All editable content is located in the `content/` folder at the root of the project:

```
content/
├── site.json           # Global dates, registration toggles, fees, contact info, results flag
├── announcements.json  # Live dispatch bulletins and top pinned banner directive
├── schedule.json       # 4-day conference agenda, rooms, timing, updated badges
├── committees.json     # GIMUN UN committees, topics, Dais chairs, country lists
├── moot-categories.json # GMC problem categories, propositions, areas of law
├── resources.json      # Resource hub documents, downloadable guides, handbooks
├── results.json        # Official award winners, gavels, bench champions
├── faq.json            # Frequently asked questions by delegates and advisors
├── team.json           # Secretariat and organizing committee profiles
├── sponsors.json       # Institutional partners and corporate sponsors
└── asset-approvals.json # Non-sensitive approval metadata for every production asset
```

---

## 2. Standard Maintenance Tasks

### Task A: Updating Registration Deadlines or Toggles (`site.json`)

To open or close registrations, or update payment fee text, edit `content/site.json`:

```json
{
  "eventDates": {
    "start": "2027-03-18",
    "end": "2027-03-21"
  },
  "registrationDeadlines": {
    "gimun": "2027-02-15",
    "mootCup": "2027-03-05"
  },
  "registrationStatus": {
    "gimunOpen": true,    // Change to false to close GIMUN registrations
    "mootCupOpen": true   // Change to false to close GMC registrations
  },
  "resultsPublished": false // Keep false before Gala; set to true on Gala night
}
```

*Effect*: Setting `gimunOpen: false` immediately disables the GIMUN registration buttons across the site and displays an official closed notice with late inquiry contacts.

---

### Task B: Publishing Announcements & Directives (`announcements.json`)

The announcements engine drives both the `/announcements` page and the top dismissible alert banner across all pages.

To post a new announcement:
1. Open `content/announcements.json`.
2. Add a new object at the **top** of the list (most recent first).
3. If you want it featured in the top banner across every page, set `"pinnedFlag": true` (ensure other items have `"pinnedFlag": false` if only one should be pinned).

```json
[
  {
    "id": "ann-04",
    "title": "Room Change: DISEC Moved to Lecture Hall B",
    "body": "Due to AV maintenance, all Day 2 morning sessions for DISEC will take place in Lecture Hall B (Faculty of Electrical Engineering).",
    "track": "gimun",                  // "gimun", "moot-cup", or "all"
    "timestamp": "2027-03-19T07:30:00Z", // ISO 8601 UTC timestamp
    "pinnedFlag": true,                 // Displays on the persistent top banner
    "badgeLabel": "Urgent Directive",   // Optional label
    "actionUrl": "/schedule"           // Optional link
  }
]
```

*Anchor Linking*: Every announcement card has a unique ID (e.g. `#ann-04`). You can share direct URLs like `https://yoursite.org/announcements#ann-04` on WhatsApp or social media, and the browser will jump directly to the highlighted card.

---

### Task C: Modifying Conference Schedule (`schedule.json`)

To update room locations, times, or session titles:
1. Open `content/schedule.json`.
2. Locate the specific session item by its `id` (e.g. `sch-04`) or `day`.
3. Update `startTime`, `endTime`, `location`, or `notes`.
4. Set `"updatedFlag": true` to render an eye-catching amber "Updated" badge on that session in the interactive schedule tab.

```json
{
  "id": "sch-04",
  "day": 2,
    "dayLabel": "Derived from site.json eventDates; do not edit manually",
  "startTime": "09:30 AM",
  "endTime": "12:30 PM",
  "title": "Committee Session II",
  "track": "gimun",
  "location": "Lecture Hall B (Previously Seminar Hall 1)",
  "notes": "Working paper submissions commence at 11:30 AM.",
  "updatedFlag": true
}
```

---

### Task D: Publishing Results on Gala Night (`results.json` & `site.json`)

Before the Gala, `/results` operates in **Pre-Event State**, showcasing the Supreme Flagship Trophies, evaluation rubrics, and promulgation protocols.

On Sunday night (March 21, 2027), when the Grand Awards Gala concludes:
1. Open `content/results.json`.
2. Populate the actual winning delegates and teams:
```json
[
  {
    "id": "res-01",
    "track": "gimun",
    "categoryOrCommittee": "United Nations Security Council",
    "awardName": "Best Delegate Gavel",
    "winnerName": "Hamza Tariq",
    "institution": "LUMS",
    "photo": "/images/gallery/award-placeholder.jpg"
  },
  {
    "id": "res-02",
    "track": "moot-cup",
    "categoryOrCommittee": "GIKI Moot Court 2027",
    "awardName": "Champion Bench Trophy",
    "winnerName": "Team Apex Advocates (Sarah Khan & Bilal Ahmed)",
    "institution": "Pakistan College of Law (PCL)",
    "photo": "/images/gallery/award-placeholder.jpg"
  }
]
```
3. Open `content/site.json` and flip the publication switch:
```json
"resultsPublished": true
```
4. Run validation: `npm run validate`.
5. Deploy or commit. The results page will immediately transition to the verified Public Hall of Fame.

---

## 3. The "11pm Emergency Schedule Change" SOP

During the live conference, changes often happen late at night (e.g., inclement weather or dais adjustments). Follow this 5-minute emergency workflow:

```
[1. Edit schedule.json] ──> [2. Add Pinned Announcement] ──> [3. Validate] ──> [4. Deploy]
```

### Execution Checklist (Under 5 Minutes):
1. **Edit `content/schedule.json`**:
   - Find the target session.
   - Adjust `startTime` / `endTime` / `location`.
   - Set `"updatedFlag": true`.
2. **Edit `content/announcements.json`**:
   - Add a new announcement entry at index 0.
   - Set `"pinnedFlag": true`.
   - Set `"title": "EMERGENCY SCHEDULE ADJUSTMENT: Day X Morning Sessions"`.
   - Clearly state the updated time and room.
3. **Run Validation**:
   ```bash
   npm run validate
   ```
   *Expected output*: all 13 content files pass with zero schema, asset, or foreign-key errors.
4. **Deploy**:
   - Commit the two JSON files to your repository branch. The hosting platform (Vercel/Netlify/Server) will rebuild and deploy in under 90 seconds.

---

## 4. Automated Content Validation

To safeguard against syntax mistakes (such as missing commas, unclosed brackets, or invalid track values), a pre-configured validation tool is provided:

```bash
npm run validate
```

### What It Verifies:
- **JSON Syntax**: Confirms valid JSON syntax across all 13 content files.
- **Required Fields**: Asserts that every committee, schedule item, announcement, and result has an ID, title/name, and track.
- **Track Enum**: Verifies tracks are strictly `'gimun'`, `'moot-cup'`, or `'shared'` / `'all'`.
- **Foreign Key Integrity**: Confirms background guide and proposition doc IDs exist in `content/resources.json`.
- **Asset approval metadata**: `asset-approvals.json` must cover every referenced image/document/icon and include only non-sensitive permission reference, approver role, approval date, and source/credit metadata.

The launch validator additionally checks referenced asset existence and dimensions, approval metadata, parseable PDF structure/page count, displayed PDF file-size accuracy, seed markers/generator scripts, gallery media, placeholder URLs, four-day event coverage, event-year/deadline consistency, and content foreign keys. Run it with `npm run validate:launch`.

## 5. Production submission operations

The public form endpoints are `POST /api/register` and `POST /api/contact`. Apply both Supabase migrations, then configure Supabase, Resend, Upstash, and Vercel Cron variables from `.env.example` in Vercel. The persistence transaction creates the submission and private email outbox rows before a success response. The response reports durable `emailQueued` and `notificationQueued` state; a delayed email does not invalidate a durable submission.

Staff should use the managed provider dashboard and scheduled exports for administration. Monitor the `email_outbox` table for failed messages and use Resend’s provider dashboard for controlled retries. Do not create a public admin panel or store production submissions in `data/submissions/`.

---

## 6. Emergency Rollback Procedure

If you made a formatting mistake in a JSON file and need to revert immediately:

- **Using Git**:
  ```bash
  git checkout -- content/
  ```
  This restores all content files to the last known working commit.

- **To test the entire 11pm update & rollback pipeline automatically**:
  ```bash
  node scripts/test-11pm-update.js
  ```
  This runs a complete simulated emergency update, validates the build, and restores original files automatically.
