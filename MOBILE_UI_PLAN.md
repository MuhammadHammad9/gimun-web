# Mobile UI upgrade plan

## Outcome

Make the public site mobile-first at 390px to 430px, keep the existing routes,
copy, analytics hooks, and registration flows intact, and bring the desktop
story language to touch devices with a lighter implementation where pointer
input is not available.

## Responsive contract

- **390px:** no horizontal document overflow, no clipped headings, one-column
  content, 44px minimum touch targets, safe-area padding, and readable form
  controls without pinch zoom.
- **430px:** same layout contract with slightly more breathing room and two-up
  fact groups only when the values remain readable.
- **768px:** tablet layout keeps touch navigation and swipe corridors, while
  progressively restoring split chapter heads and utility grids.
- **1024px+:** existing desktop navigation, hover affordances, smooth scroll,
  pointer tilt, and full-width art remain intact.

## Shared shell

- Stabilize the viewport with `100dvh`, safe-area insets, and a single mobile
  gutter token.
- Keep the header reachable while reading, enlarge the menu and register
  controls, and prevent the announcement bar from truncating important actions.
- Preserve focus rings, keyboard order, route transitions, and current-page
  states.

## Page surfaces

- Home hero: keep the seal visible as a compact visual anchor, stack actions,
  and retain the hand-off, chapter reveals, marquee, countdown, and stack story.
- Corridors: keep native horizontal swipe, scroll snapping, arrow controls, and
  a visible progress cue without relying on hover or drag.
- Utility pages: standardize hero spacing, section rhythm, schedules, document
  rows, cards, tables, and footer wrapping.
- Forms: improve label/input spacing, 16px input type, full-width actions, and
  inline error readability on narrow screens.

## Motion parity

- **Lite tier:** enable the same meaningful narrative motion as desktop:
  seal split, section reveals, text reveals, marquee speed response, and art
  backdrops. Keep pointer tilt, inertia, and smooth scrolling desktop-only.
- **Performance:** keep shaders lazy, half-resolution, visibility-gated, and
  low-power; cap mobile backdrop opacity so content remains primary.
- **Accessibility:** reduced motion and Save-Data remain static everywhere.

## Verification

- Run lint and production build.
- Run the public browser suite and mobile viewport checks at 390px, 414px,
  768px, and desktop.
- Confirm route transitions, menu focus trap, registration form behavior,
  horizontal corridors, reduced motion, light theme, and no horizontal scroll.
