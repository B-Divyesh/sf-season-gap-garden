# Season Gap Garden — visual thesis

## Direction: handwritten lab notebook

This is a working instrument for one gardener, not a catalogue of perfect gardens. It should feel like a field notebook opened beside a raised bed: calm graph paper, inked measurements, paper tabs, date stamps, and the occasional earthy smudge. The system makes time visible without pretending to know agronomy. Decorative marks are sparse and functional—rules align dates, brackets show gaps, and a small crop-turnover study illustrates the job.

The treatment is deliberately single-mode. A warm paper canvas is core to the notebook metaphor; a dark theme would turn the material language into a generic dashboard. The app explicitly paints every background and keeps contrast accessible in that light treatment.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F4EEDC` | Page background, derived from unbleached notebook stock |
| Paper raised | `#FFFDF5` | Forms, sheets, and editable surfaces |
| Graph line | `#C9D5C3` | Low-emphasis grid and rules |
| Ink | `#243028` | Primary writing; 12.3:1 on paper |
| Pencil | `#59645B` | Secondary text; 5.5:1 on paper |
| Leaf | `#2F6149` | Primary action and planted spans; 6.7:1 on paper |
| Leaf deep | `#214936` | Active/pressed state |
| Marigold | `#B55E18` | Open windows and prompts; 4.7:1 on paper |
| Brick | `#923C32` | Destructive/error text; 6.7:1 on paper |
| Night soil | `#17231C` | Navigation/footer field |

Color is never the only state signal: every timeline span has a written label/pattern, and status notices include text and an icon.

## Type

- **Notebook hand:** `Caveat` variable, self-hosted WOFF2 (400–700), used for the wordmark, section annotations, and occasional oversized notes. Its informal stroke carries the field-book character but is never used for body copy or critical controls.
- **Working text:** `Atkinson Hyperlegible Next`, self-hosted WOFF2 (400–700), used throughout the interface for readable letterforms and clear date/numeral distinctions. Dates and metrics use tabular numerals.
- Scale: 16px body; 14px meta; 20px section title; fluid 32–52px page title. Body leading is 1.55 and prose measures stay below 68 characters.

## Spacing and layout

The base rhythm is 4px with working increments of 8, 12, 16, 24, 32, 48, and 64px. A centered 1180px sheet sits over a 24px graph grid. Content groups use proximity and ruled headings before bordered cards. On phones, the three-column workspace becomes a single ledger; nonessential illustration detail disappears, but dates, gap actions, and export stay available. Touch targets are at least 44px.

## Interaction grammar

- Add and edit actions open a paper sheet dialog from the control that summoned it; focus moves into it and returns on close.
- Timeline rows read left to right like a ruled season chart. Planted periods are solid ink hatching, open periods are warm dotted brackets, and planned rest is a quiet neutral hatch.
- A saved action receives a brief ink-stamp acknowledgement in the live status region.
- Destructive actions name the bed or planting and require confirmation. Import first validates, then reports exactly what will be replaced.
- Keyboard paths are ordinary and complete: Tab reaches all controls; Enter/Space operate buttons; Escape closes dialogs.

## Motion policy

Sheets enter with a 180ms opacity/translate transition, timeline additions settle over 220ms, and the update notice slides from its lower edge in 180ms. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are instant.

## Asset plan and provenance

### `garden-study.webp`

An original wide hero study that explains succession: a top-down notebook spread with a tiny raised-bed sketch moving from leafy crop to cleared soil to seedlings, surrounded by pencil date marks and measuring ticks. It provides atmosphere and meaning while the adjacent real UI does the planning.

Prompt sheet:

> Use case: illustration-story. Asset type: compact landing/workspace header illustration. Scene/backdrop: top-down open gardener's laboratory notebook on warm unbleached paper, faint sage graph grid. Subject: one continuous crop-turnover study in three hand-drawn vignettes—leafy crop in a narrow raised bed, then the same bed as freshly cleared soil, then neat young seedlings—connected by pencilled arrows and date-tick marks without legible words or numbers. Style/medium: tactile colored-pencil, dry ink, graphite, and a restrained linocut texture; imperfect field-journal observation, not childish. Composition: 3:2 landscape, strong left-to-right rhythm, generous calm negative space at edges. Lighting: soft overcast garden-shed daylight, subtle paper tooth and one faint soil thumbprint. Palette: warm paper, deep leaf green, graphite, muted marigold, brick accent. Constraints: botanically plausible generic plants, no people, no labels, no UI, no logos, no text, no watermark. Avoid: photorealism, glossy 3D, generic corporate vector art, gradients, neon, crowded collage, readable handwriting, brands, seed packets.

- Generated with the factory Azure image deployment (`factory-image`) on 2026-08-27. Original generated work; no third-party source material.
- Source PNG and prompt sidecar live in `assets/src/`. Production WebP is resized and optimized to remain under 300 KB.
- `garden-social-20260905.webp` is a 1200×630 crop derived from that same
  generated study with ImageMagick on 2026-09-05. It is used only for social
  metadata, keeps the original no-text artwork, and is not a separate source.
- Icons and patterns elsewhere are authored in CSS or inline SVG and are original to this repository.

## Why this fits

Succession planting is a temporal bookkeeping problem. The notebook makes personal dates and observations feel authoritative without implying scientific prediction. Graph rules help compare windows, handwriting supplies warmth, and the restrained crop study makes the before/after/follow-on idea understandable at a glance.
