---
name: GIMUN & GMC
description: Two student competitions, one campus, four days in Topi. A printed programme that moves.
colors:
  canvas: "#140302"
  void: "#0d0201"
  raised: "#1c0504"
  elevated: "#260806"
  overlay: "#340802"
  crest: "#450c04"
  wine: "#2b0806"
  paper: "#f3e8d5"
  champagne: "#ecd8b7"
  champagne-hi: "#fff5e6"
  champagne-lo: "#cca876"
  crimson: "#e11d48"
  gimun-fill: "#9f1239"
  accent-gimun: "#fda4af"
  accent-gmc: "#ecd8b7"
  text: "#fffdf9"
  text-2: "rgba(236, 216, 183, 0.88)"
  text-3: "rgba(236, 216, 183, 0.72)"
  line: "rgba(236, 216, 183, 0.18)"
  line-2: "rgba(236, 216, 183, 0.38)"
  on-accent: "#140302"
  on-gimun: "#fffdf9"
  light-canvas: "#fff7ea"
  light-raised: "#fffdf8"
  light-text: "#24140e"
  light-champagne: "#6f3c16"
  light-crimson: "#bd123c"
typography:
  display:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6.4vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.375rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  manifesto:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Satoshi, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.7vw, 1.625rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "General Sans, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "General Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  placard: "0.625rem"
  button: "0.75rem"
  card: "1.5rem"
  panel: "2rem"
  sheet: "2rem"
  pill: "9999px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 3.5rem)"
  section-y: "clamp(5rem, 11vw, 10rem)"
  container: "88rem"
  prose: "42rem"
components:
  button-primary:
    backgroundColor: "{colors.champagne}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.champagne-hi}"
  button-gimun:
    backgroundColor: "{colors.gimun-fill}"
    textColor: "{colors.on-gimun}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-gmc:
    backgroundColor: "transparent"
    textColor: "{colors.champagne}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 20px"
  card:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.card}"
    padding: "28px"
  sheet:
    backgroundColor: "{colors.wine}"
    rounded: "{rounded.sheet}"
---

# Design System: GIMUN & GMC

## Overview

**Creative North Star: "The Printed Programme"**

The site reads like the programme a delegate is handed at the door of a formal event: index numerals, hairline rules, mono labels in small capitals, large confident headings, and a lot of paper around them. It is set in maroon lacquer and champagne ink in the dark theme, and in cream stock with burnt-sienna ink in the light theme. Both themes are first-class; every token is declared for each.

Pages are told as chapters. A hero sits still while the first chapter slides over it like a sheet laid on a desk; later chapters change ground (deep, crest, inverse paper) instead of adding boxes. Motion is the page being handled, never decoration: lines rise out of masks, sheets settle, rules draw themselves, numbers count to real values, and the curtain closes between pages. Everything that moves has a static reading that is complete on its own.

Two tracks share the system and never share a colour. Crimson belongs to GIMUN, champagne to the GIKI Moot Court. A colour on screen always tells you which room you are in.

**Key Characteristics:**
- Chapters with grounds (deep, crest, inverse) rather than stacked cards.
- Hairline rules and index numerals (01, 02) carry structure.
- Mono labels for metadata only; headings are never set in mono.
- One hero moment per page, one pinned or scrubbed sequence at most.
- Nothing invented: every number, date and name comes from content.

## Colors

A warm, near-monochrome maroon ground with two track accents that are never decorative.

### Primary
- **Champagne Ink** (see `champagne`; light theme `light-champagne`): the house accent. Primary buttons, links on hover, accent words in headings, GMC's track colour, the focus ring.

### Secondary
- **Assembly Crimson** (see `crimson` for rules and large type, `gimun-fill` for filled buttons, `accent-gimun` for small text on dark grounds; light theme `light-crimson`): GIMUN only. Its filled buttons carry white text above 7:1 in both themes.

### Neutral
- **Lacquer Maroon** (`canvas`, with `void` below and `raised`, `elevated`, `overlay`, `crest` above): the dark ground ramp, each step a little warmer and lighter.
- **Wine** (`wine`): the deep chapter ground, one step darker than the page, used for the hand-off sheet.
- **Programme Paper** (`paper`): the inverse chapter in the dark theme.
- **Warm White and Champagne Greys** (`text`, `text-2`, `text-3`): text ramp; secondary text is champagne at reduced alpha, never grey.
- **Hairlines** (`line`, `line-2`): champagne at 18% and 38%, the only borders the public site uses.

### Named Rules
**The Two Rooms Rule.** Crimson means GIMUN and champagne means GMC. Never use either as general decoration, and never put both on one control.

**The Tone Contract Rule.** A tone re-declares the ink tokens for its subtree. Inside `.tone-deep`, `.tone-crest` or `.tone-inverse`, use the ordinary text and line utilities; never hand-pick a colour for a tone. `tests/unit/tone-contrast.test.ts` holds every text token above 4.5:1 on every ground.

## Typography

**Display Font:** Satoshi (variable, 300 to 900), falling back to system-ui
**Body Font:** General Sans (variable, 200 to 700), falling back to system-ui
**Label/Mono Font:** JetBrains Mono (variable, 400 to 600)

**Character:** A geometric grotesk with tight tracking for the voice of the event, a softer humanist sans for reading, and a monospace that behaves like the typeset metadata of a printed schedule. All three are subset to Latin and punctuation.

### Hierarchy
- **Display** (500, clamp 2.75 to 6rem, 0.96): page titles in the hero; one per page, the only h1.
- **Headline** (500, clamp 2 to 3.375rem, 1.04): chapter titles, always ending in a full stop.
- **Manifesto** (500, clamp 1.75 to 3rem, 1.14): a single scrubbed statement per page; always at least 28px so the scrub's dimmed words still read as large text.
- **Title** (500, clamp 1.25 to 1.625rem, 1.2): card, door and step titles.
- **Lead** (400, clamp 1.125 to 1.3125rem, 1.5): the paragraph under a hero or chapter title, held to about 38rem.
- **Body** (400, 1.0625rem, 1.62): reading text, held to about 42rem (`prose`).
- **Label** (400, 0.75rem, 0.14em, uppercase): meta lines, eyebrows, table heads, dates.

### Named Rules
**The Full Stop Rule.** Display and chapter titles are sentences and end with a full stop ("The resource library."). One accent phrase per title may take the track or champagne colour.

**The No Em Dash Rule.** Copy never uses the em dash. Use a colon, a comma or a new sentence.

## Layout

A 88rem container with a fluid gutter (1.25rem to 3.5rem) and generous chapter padding (`section-y`, 5rem to 10rem). Chapter heads split into title and lead side by side from 1024px and stack below it. Process content uses a sticky head beside an ordered list (steps-split). Two-up "doors" join at a seam on wide screens. The committees and cases sit in a horizontal corridor that pins and pans on desktop and is a native scroll-snap track on touch.

Utility pages (schedule, resources, announcements, results, about sub-pages) use a hero followed by one hand-off sheet with a tighter top padding (`chapter--flush-top`). Every layout collapses to one column below 640px with no horizontal page scroll at 390px.

## Elevation & Depth

Depth comes from grounds and sheets, not shadows. Cards sit flat on hairlines. The only structural shadow is the hand-off sheet's upward shadow (`0 -2.5rem 5rem -3rem`), which makes the chapter read as paper laid over the hero. A fixed film grain (3.5% dark, 5% light) sits over everything and never takes pointer events.

### Named Rules
**The Flat Paper Rule.** Surfaces are flat at rest. A new level is a new ground (tone) or a sheet, never a heavier drop shadow.

## Shapes

Gently rounded throughout: placards (0.625rem), buttons that are not pills (0.75rem), cards and doors (1.5rem), panels, sheets and utility cards (2rem). High-intent buttons are full pills with their icon in a small disc. Sheets round only their top corners, like a page edge.

## Components

### Buttons
- **Shape:** full pill for primary and track buttons; gently rounded (0.75rem) for secondary.
- **Primary:** champagne fill, maroon ink, 44px tall. The arrow sits in a disc that nudges right on hover.
- **GIMUN:** crimson fill (`gimun-fill`), white text. GIMUN actions only.
- **GMC:** champagne outline that fills on hover. GMC actions only.
- **Secondary:** hairline outline, text ink, a faint wash on hover.
- **Hover / Focus:** 200ms colour transitions on the brand ease, a 2px focus ring in `focus` offset from the canvas, and a 0.98 press.

### Text links
- **Style:** semibold ink with a hairline underline (`line-2`) at 0.3em offset; the underline takes the text colour on hover. The default for tertiary actions and hero action rows.

### Cards / Containers
- **Corner Style:** 1.5rem (cards), 2rem (utility cards).
- **Background:** `raised` on the page ground; `canvas` for placards inside a tone.
- **Border:** one hairline (`line`).
- **Internal Padding:** 1.5rem to 2rem, up to 3.5rem on utility cards.

### Placards
The committee and case cards of the corridor: tall (31rem), a mono type line, the abbreviation large, the full name, seats as a small matrix, and the actions pinned to the bottom.

### Navigation
A floating header with mega panels for GIMUN, Moot Court and About, a split Register button, and a full-screen mobile menu whose panels wipe down and whose links rise from masks. The current section carries a small dot under its label.

### The Curtain
Five maroon panels (three on phones, four on tablets) close from the bottom in a 60ms stagger, 480ms each, on internal link clicks, show the destination's name, then open upward (520ms). Back and Forward are instant; reduced motion skips it.

## Do's and Don'ts

### Do:
- **Do** let the h1 render with the page: load entrances are CSS transform-only, and no JS animation runs before the visitor's first scroll, tap or key.
- **Do** give every scroll effect a complete static reading for reduced motion and for print.
- **Do** use index numerals (01, 02, 03) and hairlines to show order and structure.
- **Do** keep numbers real: counters, seats and dates come from content, never placeholders.
- **Do** check both themes and both 390px and 1440px for every new surface.

### Don't:
- **Don't** use a thick coloured side border on cards.
- **Don't** use bounce or overshoot easing; use the brand, expo, lift or curtain curves.
- **Don't** set headings in mono, or body text in the display face.
- **Don't** use crimson or champagne as decoration outside their track.
- **Don't** add a second pinned or scrubbed sequence to a page that already has one.
