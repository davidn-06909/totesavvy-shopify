---
project: best-sellers-collection-list
status: active
created: 2026-07-25
branch: dev
source_prompt: |
  Hey. First image is for desktop, and second image is for mobile. As you can see, there is a text content part and collection list parts. The text should be located in the collection image.
  I think you have to use the collection list dot liquid file. the collection lists that liquidate far is almost like the design. So you have to add the text content part like design and the collection list.
  and bobard trick point. I think the collection list part direction should be column, then the style will be like the design.
  When I have the button, the animation works. The animation is about. white background gradient should go left from left to right infinitaly.
  What direction should it be edited in the theme settings
decisions:
  - "Change collection-list.liquid by adding a text content block (title + subtitle + button). Do not rewrite the section and do not create a new section file."
  - "Outer wrapper is a column on mobile only. Desktop keeps text and cards side by side, cards 3-across; mobile stacks to one column, cards 1-across."
  - "DELUXE / POUCHES / BAGS are the collection titles rendered by collection-list.liquid. The section already supports placing the title over the image, so do NOT build a new overlay. Only select that existing option and tune its offset and typography defaults."
  - "The button shine is merchant-controlled: enable/disable plus a speed setting."
---

This plan was written without reading the code. Verify each **Locate** before editing. If the code doesn't match, stop and report — don't improvise.

## 1. Objective

`sections/collection-list.liquid` already renders the three-card collection row and already supports rendering the collection title over the image. This task adds a **`text_content` block** to that section — heading, subtitle and a button — and lays it out **beside** the card row on desktop, **above** it on mobile. The button gets an infinite white gradient sweep that travels left → right. Every visual value in this plan becomes a schema setting with the measured value as its default, so the merchant can rebuild the design from the theme editor without touching code.

## 2. Scope

**In**
- New `text_content` block type in `sections/collection-list.liquid` (heading, subtitle, button, all typography and colour settings).
- New section settings controlling the outer row/column layout, the stack breakpoint, column gap and text-column width.
- Setting the section's **existing** collection-title placement option to the over-image value, and adjusting its offset / typography defaults to the measured numbers.
- A new Tailwind component stylesheet holding the layout rules and the shine keyframes.
- Adding the block and its settings to the homepage instance in `templates/index.json`.

**Out**
- Any new overlay markup for the collection title. The section already supports it — reuse it.
- Changing how collections, images or links are sourced. The card internals stay as they are.
- Any other section, the header, or the hero.
- Editing `assets/theme.css` by hand. It is build output.

## 3. Layout spec

Measured from the attached mocks. **Desktop mock ≈ 1873px content width** (browser at ~1920px), **mobile mock ≈ 423px wide**. Values are read off a mock, so they are close but not authoritative — build to these numbers, then compare at the reference widths.

### Desktop (≥ 1024px)

#### Part 1 — Box tree

```
section-root                     (the existing <section> wrapper of collection-list.liquid)
└── list-root                    (NEW flex container: text beside cards)
    ├── text-column              (NEW — renders the text_content block)
    │   ├── text-heading         "BEST SELLERS"
    │   ├── text-subtitle        "Discover our best-selling organizers, …"
    │   └── text-button          <a> "SHOP"
    │       └── button-shine     ::after pseudo-element, the sweeping gradient
    └── cards-row                (the EXISTING collection grid/list wrapper)
        └── card  × N            (the EXISTING card — do not restructure)
            ├── card-media       existing image frame
            └── card-title       existing collection title, already placed over card-media
```

`cards-row`, `card`, `card-media` and `card-title` **already exist**. Only `list-root`, `text-column` and its three children are new. If the existing grid wrapper can be used directly as `cards-row`, do not add another element around it — wrap only if the existing wrapper cannot become a flex child cleanly.

#### Part 2 — Per-box table

| Box | Position | Anchors | Size | Inner layout | Padding / margin | z-index | Overflow |
|---|---|---|---|---|---|---|---|
| `section-root` | `static` | none | width `100%`; height auto | flow | padding `60px 136px 60px 166px`; margin `0` | `auto` (0) | `visible` |
| `list-root` | `static` | none | width `100%` (= 1571px at the reference width); height auto | `flex`, `row`, `column-gap: 31px`, `row-gap: 0`, `align-items: center`, `justify-content: flex-start` | padding `0`; margin `0` | `auto` (0) | `visible` |
| `text-column` | `static` | none | `flex: 0 0 340px`; height auto (content) | `flex`, `column`, `gap: 0`, `align-items: flex-start`, `justify-content: center` | padding `0`; margin `0` | `auto` (0) | `visible` |
| `text-heading` | `static` | none | width `100%`; height auto | flow | margin `0 0 20px 0`; padding `0` | `auto` (0) | `visible` |
| `text-subtitle` | `static` | none | `max-width: 340px`; height auto | flow | margin `0 0 25px 0`; padding `0` | `auto` (0) | `visible` |
| `text-button` | `relative` | none | width auto (`112px` at the default label), `min-height: 37px` | `inline-flex`, `row`, `align-items: center`, `justify-content: center` | padding `11px 28px`; margin `0` | `auto` (0) | **`hidden`** — clips `button-shine` |
| `button-shine` | `absolute`, context = `text-button` | `top: 0; bottom: 0; left: 0`; animated via `transform: translateX(...)` | width `40%` of `text-button`; height `100%` | n/a | `0` | `1` | clipped by `text-button` |
| `cards-row` | `static` | none | `flex: 1 1 auto` (= 1200px at the reference width); height auto | `flex`, `row`, `gap: 6px`, `align-items: stretch`, `justify-content: flex-start` | padding `0`; margin `0` | `auto` (0) | `visible` |
| `card` | `static` (already `relative` if it hosts the title overlay — keep whatever it is) | none | `flex: 1 1 0`; `aspect-ratio: 3 / 4` (measured 396 × 535 = 0.740) | existing | existing | `auto` (0) | `hidden` |
| `card-media` | existing | existing | fills `card`; `object-fit: cover` | n/a | `0` | `auto` (0) | `hidden` |
| `card-title` | existing (over-image option) | pinned to the bottom of `card`, `bottom: 34px`, horizontally centred | width `100%` | flow, `text-align: center` | padding-inline `12px` | above `card-media` | `visible` |

`text-button` sits inside `text-column`'s flow and must not stretch to the column width — `align-self: flex-start`.

#### Part 3 — Stacking order (bottom → top)

1. `section-root` background
2. `card-media` (the collection photo)
3. `card-title` scrim, if the existing over-image option renders one
4. `card-title` text
5. `text-button` background
6. `button-shine` (`z-index: 1`, inside `text-button` only)
7. `text-button` label — must sit **above** `button-shine`, so give the label span `position: relative; z-index: 2`

Nothing in `text-column` overlaps anything in `cards-row`. The only overlap in the section is the title over the image and the shine over the button.

#### Part 4 — Mobile as deltas

Breakpoint: the outer wrapper stacks **below 1024px** (`stack_breakpoint`, section setting). Cards go 1-across **below 768px**.

- **`list-root` position changes**: `flex-direction: row` → `column`. `column-gap: 31px` → `row-gap: 30px`.
- **`text-column` resizes**: `flex: 0 0 340px` → `flex: 1 1 auto; width: 100%`. Gains `padding-inline: 31px` (mock: text inset 43px, `section-root` inset 12px, 12 + 31 = 43 ✓).
- **`section-root` resizes**: padding `60px 136px 60px 166px` → `40px 12px 40px 12px`.
- **`cards-row` resizes**: below 768px `flex-direction: row` → `column`, `gap: 6px` unchanged, each `card` becomes `flex: 1 1 auto; width: 100%`.
- **`text-subtitle` resizes**: `max-width: 340px` → `max-width: 335px` (effectively full width inside the padded column).
- **Nothing re-parents, nothing is hidden, nothing is added.** All of the above is **achievable with CSS alone** — one DOM, one set of markup. Do not render the text block twice.
- Tablet band **768–1023px**: `list-root` is already a column, `cards-row` is still a row of 3, so the cards get narrower but keep their `aspect-ratio`. This is intentional — state it, don't "fix" it.

## 4. Element measurements

| Element | Property | Desktop | Mobile |
|---|---|---|---|
| `text-heading` | font-family | theme heading serif (Codex lookup: the heading font token used by other sections) | same |
| | font-size | `26px` | `19px` |
| | font-weight | `400` | `400` |
| | line-height | `1.2` | `1.2` |
| | letter-spacing | `0.06em` | `0.06em` |
| | colour | `#2B2724` | `#2B2724` |
| | text-transform | `uppercase` | `uppercase` |
| | text-align | `left` | `left` |
| `text-subtitle` | font-family | theme body sans | same |
| | font-size | `15px` | `14px` |
| | font-weight | `400` | `400` |
| | line-height | `1.55` (≈23px) | `1.55` (≈22px) |
| | letter-spacing | `0` | `0` |
| | colour | `#3A3A3A` | `#3A3A3A` |
| | text-transform | `none` | `none` |
| | text-align | `left` | `left` |
| `text-button` | background | `#A2968A` | `#A2968A` |
| | background (hover) | `#8E8175` | n/a (no hover on touch) |
| | colour | `#FFFFFF` | `#FFFFFF` |
| | font-size | `13px` | `13px` |
| | font-weight | `400` | `400` |
| | letter-spacing | `0.12em` | `0.12em` |
| | line-height | `1` | `1` |
| | text-transform | `uppercase` | `uppercase` |
| | text-align | `center` | `center` |
| | border | none | none |
| | border-radius | `0` | `0` |
| | box-shadow | none | none |
| | padding | `11px 28px` | `11px 28px` |
| | measured box | `112 × 37px` | `114 × 38px` |
| `button-shine` | background | `linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)` | same |
| | width | `40%` of the button | same |
| | animation | `translateX(-160%) → translateX(320%)`, `3s`, `linear`, `infinite` | same |
| `card` | aspect-ratio | `3 / 4` (measured 396 × 535) | `3 / 4` (measured 396 × 530) |
| | gap between cards | `6px` | `6px` |
| | border-radius | `0` | `0` |
| `card-title` | font-family | theme heading serif | same |
| | font-size | `22px` | `19px` |
| | font-weight | `400` | `400` |
| | line-height | `1.2` | `1.2` |
| | letter-spacing | `0.10em` | `0.10em` |
| | colour | `#6F5B45` | `#6F5B45` |
| | text-transform | `uppercase` | `uppercase` |
| | text-align | `center` | `center` |
| | offset from card bottom | `34px` | `30px` |

`card-title` values go into the section's **existing** title settings — do not add duplicates. If the existing option exposes fewer knobs than the rows above (e.g. no bottom-offset setting), add only the missing ones, and say in your report which ones you added.

## 5. Settings map

Every value in sections 3 and 4 must be reachable from the theme editor. Ranges below are suggestions; keep the **default** exactly as measured.

### Section settings (new)

| id | type | default | drives |
|---|---|---|---|
| `layout_direction` | `select` — `text_left` / `text_right` | `text_left` | `list-root` `flex-direction` (`row` vs `row-reverse`) |
| `stack_breakpoint` | `select` — `768` / `1024` / `1280` | `1024` | px width below which `list-root` becomes a column |
| `column_gap` | `range` 0–120, step 1, px | `31` | `list-root` `column-gap` (desktop) |
| `stack_gap` | `range` 0–80, step 1, px | `30` | `list-root` `row-gap` (stacked) |
| `text_column_width` | `range` 240–560, step 4, px | `340` | `text-column` `flex-basis` |
| `card_gap` | `range` 0–48, step 1, px | `6` | `cards-row` `gap` |
| `card_aspect_ratio` | `select` — `3 / 4` / `4 / 5` / `1 / 1` / `4 / 3` | `3 / 4` | `card` `aspect-ratio` |
| `cards_per_row_mobile` | `range` 1–2, step 1 | `1` | `cards-row` below 768px |
| `padding_top_desktop` | `range` 0–160, step 4, px | `60` | `section-root` |
| `padding_bottom_desktop` | `range` 0–160, step 4, px | `60` | `section-root` |
| `padding_inline_start_desktop` | `range` 0–240, step 2, px | `166` | `section-root` |
| `padding_inline_end_desktop` | `range` 0–240, step 2, px | `136` | `section-root` |
| `padding_block_mobile` | `range` 0–100, step 2, px | `40` | `section-root` |
| `padding_inline_mobile` | `range` 0–48, step 1, px | `12` | `section-root` |
| `text_padding_inline_mobile` | `range` 0–60, step 1, px | `31` | `text-column` when stacked |

### `text_content` block settings (new)

| id | type | default | drives |
|---|---|---|---|
| `heading` | `text` | `BEST SELLERS` | `text-heading` content |
| `heading_size_desktop` | `range` 14–72, step 1, px | `26` | `text-heading` |
| `heading_size_mobile` | `range` 12–48, step 1, px | `19` | `text-heading` |
| `heading_weight` | `select` 300/400/500/600/700 | `400` | `text-heading` |
| `heading_letter_spacing` | `range` 0–0.2, step 0.01, em | `0.06` | `text-heading` |
| `heading_color` | `color` | `#2B2724` | `text-heading` |
| `heading_uppercase` | `checkbox` | `true` | `text-heading` `text-transform` |
| `heading_margin_bottom` | `range` 0–60, step 1, px | `20` | `text-heading` |
| `subtitle` | `richtext` | `Discover our best-selling organizers, sure to whip your tote into shape.` | `text-subtitle` content |
| `subtitle_size_desktop` | `range` 12–28, step 1, px | `15` | `text-subtitle` |
| `subtitle_size_mobile` | `range` 11–24, step 1, px | `14` | `text-subtitle` |
| `subtitle_line_height` | `range` 1.1–2, step 0.05 | `1.55` | `text-subtitle` |
| `subtitle_color` | `color` | `#3A3A3A` | `text-subtitle` |
| `subtitle_max_width` | `range` 200–560, step 4, px | `340` | `text-subtitle` |
| `subtitle_margin_bottom` | `range` 0–60, step 1, px | `25` | `text-subtitle` |
| `text_align` | `select` `left` / `center` / `right` | `left` | `text-column` `align-items` + children `text-align` |
| `button_label` | `text` | `SHOP` | `text-button` content — empty hides the button |
| `button_link` | `url` | blank | `text-button` `href` |
| `button_bg` | `color` | `#A2968A` | `text-button` |
| `button_bg_hover` | `color` | `#8E8175` | `text-button` hover |
| `button_text_color` | `color` | `#FFFFFF` | `text-button` |
| `button_font_size` | `range` 10–20, step 1, px | `13` | `text-button` |
| `button_letter_spacing` | `range` 0–0.3, step 0.01, em | `0.12` | `text-button` |
| `button_padding_block` | `range` 4–28, step 1, px | `11` | `text-button` |
| `button_padding_inline` | `range` 8–64, step 1, px | `28` | `text-button` |
| `button_radius` | `range` 0–40, step 1, px | `0` | `text-button` |
| `button_uppercase` | `checkbox` | `true` | `text-button` |
| `enable_button_shine` | `checkbox` | `true` | renders / suppresses `button-shine` |
| `shine_duration_s` | `range` 0.5–8, step 0.1, s | `3` | `button-shine` animation-duration |
| `shine_color` | `color` | `#FFFFFF` | `button-shine` gradient mid-stop colour |
| `shine_opacity` | `range` 0–1, step 0.05 | `0.55` | `button-shine` gradient mid-stop alpha |
| `shine_width` | `range` 10–100, step 5, `%` | `40` | `button-shine` width |
| `shine_angle` | `range` 60–120, step 5, deg | `105` | `button-shine` gradient angle |

### Existing settings to configure, not recreate

**Codex lookup:** grep the `{% schema %}` of `sections/collection-list.liquid` for the collection-title placement option (likely keyed on something like `title_position`, `show_title_over_image`, or an `overlay` select). Set it to the over-image value and align its defaults to the `card-title` rows in section 4. Only add a setting where the existing option genuinely has no equivalent — for example a bottom-offset value (`34px` desktop / `30px` mobile). Report exactly which existing keys you reused.

### Intentionally hard-coded

- `button-shine` easing is `linear` — a sweep with an eased curve reads as a stutter, and no merchant asks for that.
- `text-button` `overflow: hidden` and `position: relative` — structural requirements of the shine, not style choices.
- The label span's `z-index: 2` — structural.

## 6. Files to change

| Path | Action | Why |
|---|---|---|
| `sections/collection-list.liquid` (*expected*) | edit | Add the `text_content` block type, the new section settings, the `list-root` / `text-column` wrapper, and select the existing over-image title option. |
| `src/tailwind/components/collection-list-text.css` | create | Layout, responsive deltas, shine keyframes. Named to match the existing `src/tailwind/components/` convention. |
| `src/tailwind/index.css` (*expected*) | edit | Import the new component file. |
| `assets/theme.css` | regenerate | Build output of `pnpm.cmd run tw:build`. Never hand-edit. |
| `templates/index.json` (*expected*) | edit | Add the `text_content` block and the section settings for the homepage instance. Additive only. |

## 7. Task-specific rules

- **Setting-driven values must be CSS custom properties set in an inline `style` attribute** on `list-root` / `text-column` / `text-button`, consumed by the stylesheet. Tailwind arbitrary-value classes built at runtime (`w-[{{ setting }}px]`) get purged from the build and will silently do nothing.
- Name the custom properties with a section-scoped prefix so **two instances of the section on one page do not collide** — e.g. set them on `list-root` (per-instance element), never on `:root` or `body`.
- The shine is a `::after` on `text-button`, driven by `--tsv-shine-duration`, `--tsv-shine-width`, `--tsv-shine-angle` and a colour composed from `shine_color` + `shine_opacity`. When `enable_button_shine` is off, do not emit the pseudo-element at all — add a modifier class rather than setting `animation: none`, so no compositor layer is created.
- `subtitle` is `richtext`, so it renders wrapped in `<p>`. Reset that `<p>`'s margin to `0` and let `subtitle_margin_bottom` own the spacing.
- The `text_content` block must carry `{{ block.shopify_attributes }}` so the theme editor can select and highlight it.
- Do not touch the card markup, the image rendering, or the collection loop. If the text block cannot be placed without restructuring the grid wrapper, stop and report rather than rewriting the grid.
- Follow `AGENTS.md` for everything else — do not restate it here.

## 8. Steps

### Step 1 — Add the `text_content` block type to the section schema

- **File**: `sections/collection-list.liquid`
- **Locate**: the `"blocks"` array inside `{% schema %}`.
- **Change**: Add a new block type `text_content` with a human name like `Text content`, and set `"limit": 1` so a merchant cannot stack two text columns. Leave the existing collection block type untouched and first in the array. If the section currently has no `blocks` array, add one — and note in your report that collections come from a setting rather than blocks, because that changes step 7.
- **Acceptance**: `Text content` appears in the section's *Add block* menu in the theme editor and can be added once.

### Step 2 — Add heading and subtitle settings to the `text_content` block

- **File**: `sections/collection-list.liquid`
- **Locate**: the `text_content` block's `"settings"` array from step 1.
- **Change**: Add every `heading_*`, `subtitle_*` and `text_align` row from the block table in section 5, with the listed types, ranges and defaults. Order them heading group, subtitle group, alignment, each behind a `header` label.
- **Acceptance**: The block's editor panel shows the heading and subtitle groups, and the defaults match section 4.

### Step 3 — Add button settings to the `text_content` block

- **File**: `sections/collection-list.liquid`
- **Locate**: the same `"settings"` array, after the subtitle group.
- **Change**: Add the `button_*` rows from section 5 behind a `Button` header. `button_label` defaults to `SHOP`; `button_link` has no default.
- **Acceptance**: The editor shows a Button group; clearing `button_label` is possible (its behaviour is wired in step 13).

### Step 4 — Add the shine settings to the `text_content` block

- **File**: `sections/collection-list.liquid`
- **Locate**: the same `"settings"` array, after the button group.
- **Change**: Add `enable_button_shine`, `shine_duration_s`, `shine_color`, `shine_opacity`, `shine_width` and `shine_angle` behind a `Button animation` header, with the defaults from section 5.
- **Acceptance**: The editor shows a Button animation group with the sweep on by default at 3s.

### Step 5 — Add the layout and spacing settings to the section schema

- **File**: `sections/collection-list.liquid`
- **Locate**: the top-level `"settings"` array inside `{% schema %}`.
- **Change**: Add every row from the *Section settings* table in section 5. Group them under `Layout` (direction, breakpoint, gaps, text column width, card gap, aspect ratio, mobile cards per row) and `Spacing` (all padding settings). Do not remove or rename any existing section setting.
- **Acceptance**: The section panel shows Layout and Spacing groups; existing settings still render and still work.

### Step 6 — Point the collection title at the section's existing over-image option

- **File**: `sections/collection-list.liquid`
- **Locate**: the existing collection-title placement setting in `{% schema %}` (grep for `title`, `overlay`, `position` within the section's settings) and the Liquid that renders `card-title`.
- **Change**: Set that setting's default to the over-image value, and align its typography and offset defaults to the `card-title` rows in section 4. Add a bottom-offset setting only if none exists — desktop default `34`, mobile default `30`. Do not build new overlay markup; the section already supports this.
- **Acceptance**: With default settings, each card renders its collection title centred inside the image, roughly 34px above the card's bottom edge.

### Step 7 — Build the `list-root` / `text-column` wrapper around the existing grid

- **File**: `sections/collection-list.liquid`
- **Locate**: the outermost element of the section's rendered markup and the wrapper that contains the collection loop.
- **Change**: Introduce `list-root` as a flex container that holds `text-column` and the existing grid wrapper (`cards-row`) as its two children, per the Part 2 table. Emit the layout custom properties from step 5 as an inline `style` on `list-root`. If the existing grid wrapper can serve as `cards-row` directly, reuse it rather than nesting another div. Do not alter anything inside `card`.
- **Acceptance**: With no `text_content` block added, the section renders visually identical to today. With one added, the cards shift right and share the row.

### Step 8 — Render the `text_content` block into `text-column`

- **File**: `sections/collection-list.liquid`
- **Locate**: the block loop (`{% for block in section.blocks %}`) and the `case block.type` branch added in step 1.
- **Change**: Render the `text_content` block into `text-column` as `text-heading`, `text-subtitle` and `text-button`, in that order, with `{{ block.shopify_attributes }}` on the column. Emit the block's typography, colour and button custom properties as an inline `style` on `text-column`. `text-button` renders as an `<a>` when `button_link` is set and as a `<span>` with the same styling when it is not — never an `<a>` without an `href`. When `enable_button_shine` is on, add the shine modifier class to `text-button`.
- **Acceptance**: The heading, subtitle and button render in the left column with the measured typography; the cards remain in the right column.

### Step 9 — Create the component stylesheet with the layout rules

- **File**: `src/tailwind/components/collection-list-text.css` (new)
- **Locate**: `src/tailwind/components/transparent-header-hero.css` — match its layer directive, naming convention and custom-property prefix.
- **Change**: Write the desktop rules for `list-root`, `text-column`, `text-heading`, `text-subtitle`, `text-button` and `cards-row` exactly as specified in the Part 2 table, reading every merchant-controlled value from the custom properties emitted in steps 7 and 8, with the section 4 values as CSS fallbacks.
- **Acceptance**: The stylesheet contains no hard-coded value that appears in the section 5 settings map, except the three intentional items listed there.

### Step 10 — Add the shine keyframes and the reduced-motion fallback

- **File**: `src/tailwind/components/collection-list-text.css`
- **Locate**: the `text-button` rules from step 9.
- **Change**: Add `position: relative; overflow: hidden` to `text-button`, `position: relative; z-index: 2` to its label, and an `::after` matching the `button-shine` row in Part 2 — gradient built from `--tsv-shine-angle`, `--tsv-shine-color` and `--tsv-shine-opacity`, width from `--tsv-shine-width`, animating `transform` from `translateX(-160%)` to `translateX(320%)` over `--tsv-shine-duration`, `linear`, `infinite`. Add a `@media (prefers-reduced-motion: reduce)` block that sets `animation: none` and hides the pseudo-element.
- **Acceptance**: The button shows a white band sweeping left → right on a continuous 3s loop; with reduced motion enabled at OS level the band never appears and the button is otherwise unchanged.

### Step 11 — Register the stylesheet and rebuild the CSS

- **File**: `src/tailwind/index.css`, then `assets/theme.css`
- **Locate**: the existing `@import` (or equivalent) for `components/transparent-header-hero.css` in `src/tailwind/index.css`.
- **Change**: Add the matching import for `components/collection-list-text.css` alongside it, then run `pnpm.cmd run tw:build`.
- **Acceptance**: `assets/theme.css` contains the new rules and the `shine` keyframes; the build exits 0.

### Step 12 — Apply the mobile and tablet deltas

- **File**: `src/tailwind/components/collection-list-text.css`
- **Locate**: the desktop rules from step 9.
- **Change**: Add the media queries implementing Part 4 — below `stack_breakpoint` (default 1024px) `list-root` becomes a column with `stack_gap`, `text-column` becomes full width with `text_padding_inline_mobile`, and `section-root` switches to its mobile padding; below 768px `cards-row` becomes a column of full-width cards. Drive the breakpoint from the setting — if the CSS cannot read a Liquid value in a media query, emit the three allowed breakpoints as body-level modifier classes on `list-root` and select on those. CSS only; no duplicated markup.
- **Acceptance**: At 1873px the layout matches the desktop mock; at 423px it matches the mobile mock; at 900px the text sits above a row of three narrower cards.

### Step 13 — Handle empty content, overflow and focus states

- **File**: `sections/collection-list.liquid` and `src/tailwind/components/collection-list-text.css`
- **Locate**: the `text_content` render branch from step 8 and the `text-button` rules from step 10.
- **Change**: Wrap each of heading, subtitle and button in a `blank?` guard so an empty field renders nothing rather than an empty box; skip `text-column` entirely when no `text_content` block exists, so `cards-row` takes the full width. Add `:focus-visible` and `:hover` styling to `text-button` per section 4, and allow the heading, subtitle and button label to wrap rather than truncate.
- **Acceptance**: Removing the block restores the full-width card row; clearing `button_label` removes the button and its spacing; a 3× longer heading wraps without overlapping the cards; tabbing to the button shows a visible focus ring.

### Step 14 — Add the section instance to `templates/index.json`

- **File**: `templates/index.json`
- **Locate**: the existing `collection-list` section entry in the `sections` object.
- **Change**: Add a `text_content` block with the measured defaults to that instance's `blocks` and `block_order`, and set the new section-level settings to the section 5 defaults. Additive only — do not remove, reorder or rewrite existing blocks or settings. If more than one `collection-list` instance exists, update only the one on the Best Sellers row and say which.
- **Acceptance**: The homepage renders the design without the merchant having to add anything in the editor; every other section on the page is unchanged.

## 9. Every state and edge case

**Interactive states**
- `text-button` default: `#A2968A` background, `#FFFFFF` label, no border, no radius.
- Hover: background → `#8E8175`, `transition: background-color 200ms ease`. The shine keeps running independently of hover.
- `:focus-visible`: 2px outline in `#2B2724` offset 2px. Never remove the outline without a replacement.
- Active/pressed: `transform: translateY(1px)`.
- Disabled: not applicable — the button is a link. When `button_link` is blank it renders as a `<span>`, is not focusable, and shows no hover or pointer cursor.
- Open/closed: not applicable — nothing in this section toggles.
- `card` hover: leave whatever the section does today. Do not add a new hover.

**Motion**
- Shine: `transform` only (never `left`/`background-position` — those force layout/paint), `translateX(-160%) → translateX(320%)`, duration `--tsv-shine-duration` (3s), `linear`, `infinite`, no delay. There is no "close" state; the loop is continuous.
- Button hover: `background-color` 200ms ease, both directions.
- `prefers-reduced-motion: reduce`: the shine pseudo-element is hidden and its animation removed; the hover transition drops to 0ms. The button stays fully usable and legible.

**Empty content**
- No blocks at all → `text-column` is not rendered and `cards-row` spans the full `list-root` width. No empty flex child, no phantom gap.
- No `text_content` block but collections present → same as above.
- `text_content` block present but every field blank → render nothing inside `text-column` and collapse it (do not reserve 340px of whitespace).
- Empty `heading` / `subtitle` / `button_label` → that element and its bottom margin are both omitted.
- No collections selected → `cards-row` renders nothing and `text-column` sits alone, left-aligned at its measured width. Do not render empty card placeholders.
- No image on a collection → the existing card fallback stays as-is; do not add a new one.

**Overflow content**
- Heading 3× longer → wraps onto multiple lines inside `text_column_width`; `text-column` grows vertically; `list-root` is `align-items: center`, so the cards stay vertically centred against it. No clamp, no truncation.
- Long subtitle → wraps, no clamp.
- Long button label → the button grows with its content up to the column width, then the label wraps to two lines with the padding preserved. `overflow: hidden` on the button clips only the shine, never the text, because the label is in normal flow.
- Long collection title → handled by the section's existing over-image title rules; do not change them.

**Breakpoints**
- ≥1024px: `list-root` row, `text-column` 340px, `cards-row` 3 cards at `3 / 4`.
- 768–1023px: `list-root` column, text full width with 31px inline padding, `cards-row` still 3 across so the cards narrow while keeping `aspect-ratio`.
- <768px: `list-root` column, `cards-row` column, one full-width card per row at `3 / 4`, 6px gaps, `section-root` padding `40px 12px`.

**Multiple instances**
- All custom properties are set on the per-instance `list-root` element via inline `style`, never globally.
- Any `id` or `aria-*` reference must be suffixed with `{{ section.id }}`.
- The shine animation name is global but stateless, so two instances animating simultaneously is correct and harmless.

**Keyboard and screen reader**
- Tab order follows the DOM: heading (not focusable) → subtitle (not focusable) → `text-button` → each card link, left to right.
- `text-button` is a real `<a href>` when linked, so Enter activates it natively. No `tabindex`, no click handler on a div.
- `button-shine` is a pseudo-element and is therefore invisible to assistive tech by construction. Nothing needs `aria-hidden`.
- No `aria-expanded`, no Escape handling, no focus return — nothing here opens or closes.
- `text-heading` uses the heading level the section already uses for its title. Do not introduce a second `<h2>` that competes with the existing section heading; if the section already renders a heading, the block's heading takes the next level down.

**Contrast**
- `#FFFFFF` on `#A2968A` is ≈2.6:1 — below AA for body text but this is a 13px uppercase link on a solid brand colour and matches the mock. Keep it, and note it: because `button_text_color` and `button_bg` are both settings, a merchant can raise it. Do not silently darken the mock's colour.
- The shine at 0.55 alpha briefly raises the background lightness under the label. Cap `shine_opacity` at 1 but keep the default at `0.55`, where the label stays readable through the sweep.
- `card-title` sits over photography. The section's existing over-image title treatment owns this — verify it applies a scrim or shadow. If it does not, and the title is unreadable over a light image, report it rather than adding one unprompted.

**Theme editor**
- Adding the `text_content` block → the text column appears and the cards reflow, without a reload.
- Removing it → the cards return to full width.
- Reordering blocks → `text_content` is `limit: 1` and always renders into `text-column`, so its position in `block_order` has no visual effect. That is intended.
- Every setting in section 5 updates live because all of them are emitted as inline custom properties.
- `{{ block.shopify_attributes }}` is on `text-column` so selecting the block in the editor highlights it.

## 10. Do NOT touch

- `assets/theme.css` by hand — it is generated by `pnpm.cmd run tw:build` and any manual edit is lost on the next build.
- `sections/header.liquid`, `sections/header-group.json`, `assets/header.js`, `snippets/mega-menu.liquid`, `snippets/menu-drawer.liquid`, `snippets/nav-tree.liquid`, `snippets/transparent-header.liquid`, `sections/hero-transparent.liquid`, `src/tailwind/components/transparent-header-hero.css` — separate in-flight work on this branch, must stay byte-identical.
- `config/settings_data.json` — admin-managed. All new values live in section/block settings and `templates/index.json`.
- The card markup, image rendering and collection loop inside `collection-list.liquid`.
- Any other template in `templates/`.

## 11. Verification

1. `pnpm.cmd run tw:build` — exits 0, and `assets/theme.css` contains the `shine` keyframes and the `list-root` rules.
2. `shopify theme check` — run it interactively; no new errors or warnings attributable to `collection-list.liquid`.
3. Storefront at **1873px**: compare against the desktop mock — text column starting at 166px, subtitle wrapping at ~340px, button 112 × 37, three cards spanning 1200px with 6px gaps and 3:4 ratio, each title centred ~34px above its card's bottom edge.
4. Storefront at **423px**: compare against the mobile mock — text inset 43px, heading 19px, button 114 × 38, cards stacked full width with 12px page padding, title ~30px above the card bottom.
5. Storefront at **900px**: text above a row of three narrowed cards, nothing overlapping, no horizontal scroll.
6. Watch the button for 10 seconds: the white band sweeps left → right on a continuous loop with no jump at the wrap point.
7. Enable *Reduce motion* at OS level and reload: no sweep, button otherwise identical.
8. Tab through the section: focus ring visible on the button, then focus moves into the cards.
9. In the theme editor: add the block, remove it, change `layout_direction` to `text_right`, change `shine_duration_s` to 8, clear `button_label`. Each updates live and degrades cleanly.
10. **Regression**: load any other page that renders `collection-list` and confirm it looks unchanged from before this task.

## 12. Assumptions & open questions

1. **`sections/collection-list.liquid` exists at that path and renders the three-card row from blocks.** If collections come from a `collection_list` section setting instead of blocks, step 1 still adds the `text_content` block but step 7 must place `text-column` beside the loop's wrapper — build it that way and note the difference in your report.
2. **The section already supports rendering the collection title over the image.** This is the user's explicit statement. If no such option exists in the schema, **stop and ask** — do not build a new overlay, because the user removed that from scope.
3. **`src/tailwind/index.css` imports component files from `src/tailwind/components/`.** If the build wires components differently, follow the existing pattern for `transparent-header-hero.css` rather than the instruction in step 11.
4. **Colours are sampled from a compressed mock.** `#A2968A`, `#6F5B45` and `#2B2724` may be a shade off the brand tokens. If the theme already defines close equivalents in `config/settings_schema.json` or the Tailwind config, prefer the existing token and say which you substituted.
5. **`stack_breakpoint` as a select of three values** exists because CSS media queries cannot read a Liquid variable. If the theme already has a container-query or breakpoint-class utility for this, use it and drop the select.
6. **Only one `collection-list` instance is on the homepage.** If there are several, step 14 needs to know which is the Best Sellers row — ask before editing `templates/index.json`.
7. **The heading level for `text-heading`.** If the section already renders its own `<h2>`, the block heading becomes `<h3>`. If it renders no heading, the block heading is the `<h2>`. Determine this from the code; do not guess.

## 13. Progress checklist

- [ ] Step 1 — Add the `text_content` block type to the section schema
- [ ] Step 2 — Add heading and subtitle settings to the `text_content` block
- [ ] Step 3 — Add button settings to the `text_content` block
- [ ] Step 4 — Add the shine settings to the `text_content` block
- [ ] Step 5 — Add the layout and spacing settings to the section schema
- [ ] Step 6 — Point the collection title at the section's existing over-image option
- [ ] Step 7 — Build the `list-root` / `text-column` wrapper around the existing grid
- [ ] Step 8 — Render the `text_content` block into `text-column`
- [ ] Step 9 — Create the component stylesheet with the layout rules
- [ ] Step 10 — Add the shine keyframes and the reduced-motion fallback
- [ ] Step 11 — Register the stylesheet and rebuild the CSS
- [ ] Step 12 — Apply the mobile and tablet deltas
- [ ] Step 13 — Handle empty content, overflow and focus states
- [ ] Step 14 — Add the section instance to `templates/index.json`
