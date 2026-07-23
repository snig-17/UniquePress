# Machine specs — click-to-expand — design

**Date:** 2026-07-23
**Requested by:** Sakura (client team), via Snigdha

## Goal

Let a site visitor click a machine card and see fuller specifications /
details for that machine. The Unique Press manager is compiling specs for
each machine, so the site must surface them without any code change per
machine — consistent with the existing "team only edits the Google Sheet"
model (see `INVENTORY.md`, `public/assets/js/inventory.js`).

## Decisions (agreed with user)

- **Display:** inline expand. Clicking a card reveals its specs in place
  below the card content; clicking again (or `Esc`) collapses it. No modal,
  no separate page.
- **Data source:** one new free-text column in the sheet, **`Specs`**. Not
  one-column-per-field — a single multi-line cell the manager writes freely
  (e.g. `Year: 2015` / `Size: 28 inch` / `Max speed: 12,000/hr`, one per
  line). Line breaks preserved.

## Behaviour

- A machine **with** a non-empty Specs cell:
  - card shows a small `View specs ▾` affordance under the grey details line;
  - the whole card is clickable (cursor pointer) and toggles an inline panel
    showing the specs text (HTML-escaped, newlines preserved via
    `white-space: pre-line`);
  - toggle label flips to `Hide specs ▴` when open;
  - the `Enquire →` link still works — its click does not toggle specs
    (`stopPropagation`);
  - `Esc` collapses an open card.
- A machine **without** specs: unchanged from today — no toggle, not
  clickable. Specs can be filled in gradually, like the Image Link column.

## Code touchpoints

- `public/assets/js/inventory.js`
  - add `specs` to `COLUMNS` with forgiving aliases:
    `["specs", "specifications", "full specs", "spec sheet", "more info"]`
    (kept distinct from the short grey line, which comes from `Colours`);
  - read it in `rowsToMachines` → `m.specs`;
  - in `renderCards`, render the toggle + hidden panel only when
    `m.specs` is non-empty, and wire the click/`Esc` handlers.
- `public/index.html`
  - add `align-items:start` to the `#up-machines` grid so an expanded card
    does not stretch its row-mates and leave gaps.
- `INVENTORY.md`
  - document the new `Specs` column for the team.

## Non-goals

- No per-machine URLs / SEO pages.
- No structured spec schema (one field per column) — free text only.
- No image gallery in the expanded view (single hero image only, as today).

## Verification

Static site, no test framework. Verify in the browser: a card with specs
expands/collapses on click and `Esc`; the Enquire link does not toggle;
a card without specs is inert; layout does not leave grid gaps.
