# Content sign-off — GIMUN & GMC 2027

Where pages contradicted each other, the site now uses one answer everywhere. These are **defaults chosen for consistency, not confirmed facts**. The organizing team should confirm or correct each item. Most can be changed in **Admin → Settings** or the matching content collection, without a code change.

## Facts to confirm

| Topic | What the site now says | Where it lives |
|---|---|---|
| Fee inclusions | Sessions, delegate kit, lunch and tea on conference days, evening socials | FAQ `faq-6`, `/gimun`, `/moot-cup` |
| Accommodation | On-campus hostel places on request; places and any charge confirmed on acceptance | FAQ `faq-14`, venue page, track pages |
| Fees (numbers) | GIMUN individual PKR 4,500; per delegate PKR 4,000; GMC team PKR 12,000 | Settings → `fees` (display) and `feeAmounts` (used for invoices) |
| Payment instructions | Not set: invoices say bank details will follow | Settings → `paymentInstructions` |
| Memorial deadline | 28 February 2027, 23:59 PKT, by email to the moot court address | Settings → `memorialDeadline`; `/moot-cup/rules` |
| Citation style / weights | OSCOLA 4th edition; memorial 40%, oral 60% | Settings → `mootScoring` |
| Oral timing | 30 minutes per side, 12–18 minutes per oralist, up to 3 minutes rebuttal | FAQ `faq-12`, `/moot-cup/rules` |
| Round structure | Two guaranteed preliminary rounds, top eight to quarter-finals, semi-finals, Grand Final | `/moot-cup/rules` (code) |
| Word limit | 8,000 words, 1 point per 100 words over | `/moot-cup/rules` (code) |
| Awards | GIMUN: Best Delegate, Outstanding Delegate, Best Delegation. GMC: Best Memorial, Best Oralist, Champions | FAQ `faq-3`, track pages |
| Gala / Grand Final | Day 3, 20 March 2027, AHA Auditorium | Settings → `galaDate`; schedule |
| Venue names | "AHA Auditorium", "Academic Block, Rooms 201–208", "Academic Block moot courtrooms", "central dining hall" | Schedule; venue page |
| Schedule additions | Lunches, Day 1 social evening, Day 2 cultural night, Day 2 GIMUN Session III and GMC semi-finals | Schedule collection |
| Committee sizes | Capacity equals the countries listed (UNSC 15, DISEC 10, UNHRC 8, PNA 8) | Committees collection |
| Position papers | Due at least 7 days before Day 1 | FAQ `faq-10`, `/gimun` key dates |
| Reply time | Within 3 working days | Settings → `replyTime` |
| Check-in | Opens 09:00 on Day 1, AHA Auditorium foyer; bring photo ID and QR ticket | Settings → `checkinDesk`, `entryRequirement` |
| Refunds and substitutes | Refunds case by case before the deadline; substitutes accepted with notice | FAQ `faq-17`, `faq-18` |
| Weather | "Roughly 10–25°C in March" | Venue page (code) |

## Still missing (the site shows "to be announced" or hides the section)

- Emergency contact phone (Settings → `contactPhone`)
- Past-edition statistics (Settings → `stats`)
- Confirmed social media accounts (Settings → `socialLinks`; only configured accounts are shown)
- Team members, committee chairs, sponsors, gallery photos (currently empty on purpose)
- A PNA background guide (the committee page hides the button until one exists)
- Real PDFs for all nine documents, and approval records in `shared/content/asset-approvals.json`
- The institution's privacy terms (Settings → `privacyNotice`; the "draft notice" label disappears once set)

`npm run validate:launch` stays red until the real documents and media are in place and approved.
