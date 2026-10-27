---
project: footer-redesign
status: active
created: 2026-07-25
branch: dev
source_prompt: |
  First image is the design for the footer. The footer has 3 columns. I think the each column widths are same.
  I think you can use the footer.liquid. Second image shows dropdown style when I click the currency selector.
  The currency selector and currency dropdown has got border. And I think the payment icon looks big.
  Third image is mobile design. The text align should be centered in the mobile.
  The shop name should be located bottom the payments. make the plan
decisions:
  payment_icon: "55 x 40 px (user-specified). See Assumptions #1."
  dropdown: "Restyle the EXISTING Shopify localization form (details/summary + disclosure list). Do NOT build a custom Alpine dropdown."
  columns: "Equal tracks, count = number of blocks. 3 blocks reproduces the mock."
  reference: "desktop mock 1874px img @ 1920px viewport (scale ~1.025, treat as 1:1); mobile mock 426px"
---

> This plan was written without reading the code. Verify each **Locate** before editing. If the code doesn't match, stop and report — don't improvise.

## 1. Objective

Footer = three equal-width columns (Resources / Support / Social) on flat beige. Currency selector is a bordered pill whose dropdown opens **upward** as a bordered scrollable panel. Payment icons at 55×40, right-aligned. On mobile everything centres into one column and the shop-name copyright moves to the very bottom, below the payment icons, on two lines. Every measured value ships as a schema setting with the measured value as its default.

## 2. Scope

**In:** `sections/footer.liquid` markup + schema; `src/tailwind/components/footer.css`; CSS-only restyle of the footer's localization form; payment icon sizing; copyright row.
**Out:** header / any other localization form; which menus or blocks the footer renders; newsletter block if present (leave byte-identical); `config/settings_data.json`; hand-editing `assets/theme.css`.

## 3. Layout spec

Values read from a mock — close, not authoritative. All are defaults, not laws.

### 3.1 Box tree (desktop)

```
footer-root                  <footer>
  footer-inner               side padding lives here
    footer-columns           grid, N equal tracks (N = block count)
      footer-column          one per block
        column-heading       RESOURCES / SUPPORT / SOCIAL
        column-links         <ul> text links   (link-list block)
        social-row           <ul> icon links   (social block only)
    footer-bottom            row: selector left, payments right
      currency-block         positioning context for the panel
        currency-trigger     <summary>/button, bordered
        currency-panel       <ul>, opens UPWARD, bordered, scrolls
      payment-row            <ul> of payment SVGs, right-aligned
    copyright-row            own row below footer-bottom
      copyright-text · copyright-sep · copyright-powered
```

`column-links` and `social-row` are mutually exclusive per block.

### 3.2 Per-box table (desktop ≥750px)

| Box | Position | Anchors | Size | Inner layout | Padding / margin | z | Overflow |
|---|---|---|---|---|---|---|---|
| footer-root | static | — | w 100%, h auto | flow | pad `64px 0 40px` | auto | visible |
| footer-inner | static | — | w 100%, no max-width | flow | pad `0 64px` | auto | visible |
| footer-columns | static | — | w 100% of inner (1792 @1920) | grid `repeat(N, minmax(0,1fr))`, col-gap `0`, row-gap `48px`, align-items start | 0 | auto | visible |
| footer-column | static | — | 1 track (≈597px, N=3); `min-width:0` | flow | 0 | auto | visible |
| column-heading | static | — | w 100%, h auto | flow | margin `0 0 16px` | auto | visible |
| column-links | static | — | w 100% | flex column, row-gap `5px`, align-items flex-start | 0, list-style none | auto | visible |
| social-row | static | — | w 100% | flex row, gap `28px`, align center, justify flex-start, wrap | margin-top `16px` | auto | visible |
| footer-bottom | static | — | w 100%, min-h 41px | flex row, gap `24px`, align center, justify space-between | margin-top `88px` | auto | **visible** — must not clip the panel |
| currency-block | **relative** (context for panel) | — | w fit-content, min-w `152px`, max-w `260px`, h `41px` | flow | 0 | 1 | visible |
| currency-trigger | static | — | w 100%, h `41px` | flex row, gap `8px`, align center, justify space-between | pad `0 12px` | auto | hidden (label truncates) |
| currency-panel | **absolute** (context = currency-block) | `bottom: calc(100% + 6px); left: 0` | w 100% of block, min-w `152px`, max-h `245px` | flex column, gap 0 | pad `4px 0` | **20** | `overflow-y:auto; overflow-x:hidden` |
| payment-row | static | — | w auto, max-w 60% of inner | flex row wrap, gap `6px`, row-gap `8px`, justify flex-end, align center | 0, list-style none | auto | visible |
| copyright-row | static | — | w 100% | flex row wrap, align baseline, justify flex-start | margin-top `16px` | auto | visible |
| copyright-sep | static | — | auto | inline | margin `0 8px` | auto | visible |

**Track check @1920, N=3:** 1920 − 128 = 1792 ÷ 3 = 597.3. Column starts x = 64 / 661 / 1258. Mock reads 60 / 645 / 1231 at 1874px — same layout at 1.025 scale. ✅

### 3.3 Stacking (bottom → top)

1. footer-root background · 2. footer-columns / payment-row / copyright-row (auto) · 3. currency-block `z:1` · 4. currency-panel `z:20`.

`currency-panel` is the only overlapping box. No ancestor up to `footer-root` may set `overflow:hidden|clip`, `transform`, `filter` or `contain` — any of those clips or re-roots it. If one exists, remove it and report.

### 3.4 Mobile deltas — `@media (max-width: 749px)`

DOM order already gives the mobile order, so **CSS only** — no re-parenting, no `order`, no duplicated text.

| Box | Change |
|---|---|
| footer-root | pad `48px 0 32px` |
| footer-inner | pad `0 24px` |
| footer-columns | `grid-template-columns: 1fr`; row-gap `48px` |
| footer-column | `text-align: center` (inherits down) |
| column-links | `align-items: center` |
| social-row | `justify-content: center`; margin-top `24px` |
| footer-bottom | `flex-direction: column`; align+justify center; gap `32px`; margin-top `48px` |
| currency-block | stays relative; fixed w `152px`; panel re-anchored `left:50%; transform:translateX(-50%)`, still opens upward |
| payment-row | `justify-content: center`; max-w 100% → wraps 6 + 3 (6×55 + 5×6 = 360 ≤ 378 content box) |
| copyright-row | `flex-direction: column`; align center; gap `2px`; margin-top `24px` |
| copyright-sep | `display: none` |

**Tablet 750–1023px:** desktop tree kept; `footer-inner` pad `0 40px`; `footer-columns` → `repeat(2, minmax(0,1fr))`; bottom bar stays a row.

## 4. Element measurements

| Element | Desktop | Mobile |
|---|---|---|
| footer-root bg | `#F0EAE4` | same |
| column-heading | heading/serif stack · 15px · 400 · lh 1.2 · ls 0.10em · uppercase · `#B08B5A` · left | center |
| column-links link | body/sans · 15px · 400 · lh 1.4 (21px) · ls 0 · `#2E2A26` · left · **26px between link tops** (21 + 5 gap) | center |
| link hover/focus | underline, `text-underline-offset: 3px` | same |
| social icon | 20×20 · stroke 1.5 · `currentColor` `#2E2A26` · gap 28px · 44px tap target via padding | same |
| currency-trigger | h 41 · min-w 152 · border `1px solid #2E2A26` · radius 4 · bg transparent · 15px `#2E2A26` · pad `0 12px` · chevron 14×14, rotates 180° when open | same, w fixed 152 |
| currency-panel | border `1px solid #2E2A26` · radius 4 · bg `#F0EAE4` **opaque** · shadow `0 4px 16px rgba(46,42,38,.10)` · max-h 245 · 6px above trigger | same |
| panel item | 15px · lh 1.35 · `#2E2A26` · pad `6px 12px` · **left-aligned even on mobile** · ≈32px tall, ≈52px when wrapped ("Åland Islands (EUR €)") | same |
| payment icon | 55×40 box · gap 6 · row-gap 8 · keep `preserveAspectRatio` so artwork letterboxes (visible logo ≈55×34.7), never stretches | same |
| copyright | 13px · lh 1.4 · `#5A554F` · left | lh 1.5 · center |
| copyright-sep | `\|` · `#5A554F` @40% · margin `0 8px` | hidden |

**Rhythm — desktop:** heading top → first link top 34px · last link → footer-bottom 88px · trigger bottom → copyright top 16px.
**Rhythm — mobile:** column → column 48px · social → selector 48px · selector → payments 32px · payments → copyright 24px.

## 5. Settings map

All emitted as `--footer-*` custom properties on the section root (Step 3). Ids below are exact.

**Colours:** `footer_background` `#F0EAE4` · `footer_heading_color` `#B08B5A` · `footer_text_color` `#2E2A26` · `footer_muted_text_color` `#5A554F` · `footer_border_color` `#2E2A26` · `dropdown_background` `#F0EAE4`

**Layout & spacing** (`range`, px): `padding_top` 64 · `padding_bottom` 40 · `padding_top_mobile` 48 · `padding_bottom_mobile` 32 · `side_padding_desktop` 64 · `side_padding_tablet` 40 · `side_padding_mobile` 24 · `column_gap_desktop` 0 · `column_row_gap` 48 · `heading_margin_bottom` 16 · `link_row_gap` 5 · `bottom_bar_gap` 88 · `bottom_bar_gap_mobile` 48 · `bottom_stack_gap_mobile` 32 · `copyright_gap` 16 · `copyright_gap_mobile` 24 · plus `mobile_text_align` (`select` left/center, default **center**)

**Typography:** `heading_font_size` 15 · `heading_letter_spacing` 0.10 (step .01, em) · `heading_uppercase` ✔ · `link_font_size` 15 · `link_line_height` 1.4 (step .05, unitless) · `copyright_font_size` 13 · `social_icon_size` 20 · `social_icon_gap` 28 · `social_row_margin_top` 16

**Currency:** `currency_min_width` 152 · `currency_height` 41 · `currency_border_width` 1 · `currency_border_radius` 4 · `currency_font_size` 15 · `currency_padding_x` 12 · `dropdown_max_height` 245 · `dropdown_offset` 6 · `dropdown_item_padding_y` 6

**Payments:** `show_payment_icons` ✔ · `payment_icon_width` 55 · `payment_icon_height` 40 · `payment_icon_gap` 6 · `payment_icon_row_gap` 8

**Blocks:** *Codex lookup* — link-list and social blocks already exist. If a block already exposes heading + menu settings, add nothing; this redesign is presentational. Report whether the social column is a block or theme-settings output.

**Deliberately hard-coded:** grid `repeat(N, minmax(0,1fr))` (structural — block count already controls N) · breakpoints 749/1023 (theme-wide tokens) · `preserveAspectRatio` (removing it distorts card logos) · `:focus-visible` outline and `prefers-reduced-motion` overrides (accessibility floor) · `overflow-x:hidden` on the panel (bug fix, not style).

## 6. Files to change

| Path | Action | Why |
|---|---|---|
| `sections/footer.liquid` | modify | Grid wrapper, bottom-bar split, copyright row, schema settings, inline custom properties |
| `src/tailwind/components/footer.css` | modify | All footer styling incl. mobile |
| `src/tailwind/index.css` | modify — *expected* | Only if `components/footer.css` isn't imported; else leave byte-identical |
| footer localization snippet | modify — *path unverified, Codex lookup* | Only to add class hooks. Grep `localization`, `disclosure`, `country` under `snippets/` |
| `assets/theme.css` | regenerate | Output of `pnpm.cmd run tw:build`. Never hand-edit |

## 7. Task-specific rules

1. Setting-driven values go in **inline CSS custom properties** on the section root, consumed by `footer.css`. Tailwind arbitrary values built at runtime (`w-[{{ … }}]`) get purged and vanish.
2. Scope custom properties to the section instance, never `:root`.
3. **The localization form is Shopify-owned — restyle only.** Preserve `<form action="{{ routes.root_url }}localization" method="post">`, the hidden `country_code`/`locale_code` inputs, `name` attributes and submit-on-select. Breaking these breaks checkout currency.
4. No Alpine store for the dropdown — the existing `<details>`/`<summary>` (or existing web component) handles open/close.
5. `config/settings_data.json` is admin-managed: ship defaults in the schema, don't pre-fill JSON.
6. Payment icons come from `shop.enabled_payment_types` + the `payment_icon` filter — size via CSS, don't swap artwork.
7. Colours applied as `var(--x, #fallback)` with the default as fallback, so an unset setting never renders transparent text.
8. Keep `{{ block.shopify_attributes }}` on every block.

## 8. Steps

**1 — Recon (no edit).**
*File:* `sections/footer.liquid`, `snippets/` — read only.
*Locate:* `{% schema %}`, `blocks`, `link_list`, `shopify_attributes`, `payment_icon`, `localization`, `powered_by_link`, `{% for block in section.blocks %}`; in snippets grep `localization`, `disclosure`, `country`; check `src/tailwind/index.css` for the footer import.
*Change:* none. Record real class names, block types and setting ids for later steps; note whether social icons come from a block or theme settings, and whether a container class already supplies side padding.
*Acceptance:* a written list of actual names the next steps reference. **If the footer renders no localization form, stop and report** — adding one is a scope change.

**2 — Add all schema settings.**
*File:* `sections/footer.liquid` · *Locate:* the `"settings"` array in `{% schema %}`.
*Change:* append five `header` groups — Colours, Layout & spacing, Typography, Currency selector, Payment icons — with every id, type, range/step/unit and default from §5, in that order. Reuse (don't duplicate) any id that already exists, and note the collision. Add an `info` note on `footer_heading_color` saying the gold default is low-contrast and `#8A6A3C` reaches AA.
*Acceptance:* all groups appear in the theme editor with the §5 defaults; storefront unchanged (nothing consumes them yet).

**3 — Emit the settings as custom properties.**
*File:* `sections/footer.liquid` · *Locate:* the section root `<footer>` from Step 1.
*Change:* declare one `--footer-*` property per §5 setting on `footer-root` (inline `style`, or a `{% style %}` block keyed to `#shopify-section-{{ section.id }}`). Append `px` where needed; `link_line_height` unitless, `heading_letter_spacing` in `em`. Also set `--footer-column-count` from `section.blocks.size`. No styling yet.
*Acceptance:* devtools shows every property on the section root, and editing a setting updates it live.

**4 — Equal-track column grid.**
*File:* `sections/footer.liquid`, `src/tailwind/components/footer.css` · *Locate:* the block loop and its current wrapper.
*Change:* wrap the loop in `footer-columns`; each iteration renders a `footer-column` carrying `{{ block.shopify_attributes }}`. Apply the two rows from §3.2, using `repeat(var(--footer-column-count), minmax(0,1fr))`. Delete legacy width/float/percentage rules.
*Acceptance:* @1920 with 3 blocks, headings start at x ≈ 64 / 661 / 1258, tracks ≈597px. 2 blocks → two equal halves, no gap; 4 → four equal quarters.

**5 — Split the bottom bar.**
*File:* `sections/footer.liquid` · *Locate:* the markup currently holding the localization form, payment icons and copyright.
*Change:* produce two siblings after `footer-columns`: `footer-bottom` (containing `currency-block` then `payment-row`) and `copyright-row` (containing `copyright-text`, `copyright-sep`, `copyright-powered` as three separate elements so mobile can hide the separator). Keep the existing links; duplicate no text node.
*Acceptance:* DOM order under `footer-inner` is exactly `footer-columns` → `footer-bottom` → `copyright-row`, still rendering `© {{ 'now' | date: '%Y' }}, {{ shop.name }}` and `powered_by_link`.

**6 — Style headings, links, social row.**
*File:* `src/tailwind/components/footer.css` · *Locate:* the Step 4 rules.
*Change:* apply the `column-heading`, `column-links` and `social-row` rows from §3.2 with the §4 measurements, all read from `--footer-*` with static fallbacks. Include hover/focus underline. Reset `ul`/`li` defaults. Size social `svg` from `--footer-social-icon-size` with `currentColor`; pad the anchor to a 44px tap target without changing the 20px visual or the 28px visual gap.
*Acceptance:* sizes, colours, tracking and the 26px link rhythm match §4; four social icons 20×20 at 28px apart under the SOCIAL heading.

**7 — Style the currency trigger.**
*File:* `footer.css` (+ localization snippet only if class hooks are missing) · *Locate:* the trigger element from Step 1.
*Change:* apply the `currency-block` / `currency-trigger` rows from §3.2 and the §4 measurements. Add chevron rotation on open. Truncate an over-long label with `text-overflow: ellipsis` at `max-width: 260px` rather than letting the pill grow. Strip any background, shadow or underline the theme applied.
*Acceptance:* closed selector is a 41px bordered pill, min 152px, radius 4, transparent, chevron right — matches image 1; currency switching still works.

**8 — Dropdown opens upward.**
*File:* `footer.css` · *Locate:* the disclosure list inside the form.
*Change:* apply the `currency-panel` row from §3.2 + §4 measurements: absolute, `bottom: calc(100% + var(--footer-dropdown-offset))`, `left:0`, width matched to the trigger, bordered, opaque bg, shadow, `max-height` with `overflow-y:auto; overflow-x:hidden`. Items left-aligned, wrapping to two lines. Hover/focus bg `rgba(46,42,38,.06)`; current currency `font-weight:600` + `aria-current="true"`. Then remove any `overflow:hidden` / `transform` / `filter` / `contain` on `footer-bottom`, `footer-inner`, `footer-root` per §3.3.
*Acceptance:* panel opens **above** the trigger with a 6px gap (image 2), scrolls at ~245px, no horizontal scrollbar, paints above the payment icons, "Åland Islands (EUR €)" wraps to two lines.

**9 — Payment row.**
*File:* `sections/footer.liquid`, `footer.css` · *Locate:* the `payment_icon` loop over `shop.enabled_payment_types`.
*Change:* wrap it in `payment-row`; apply §3.2 + §4 — `li` and `svg` sized from `--footer-payment-icon-width/height`, gap 6, row-gap 8, right-aligned, wrapping, `preserveAspectRatio` intact. Wrap the loop in `{% if section.settings.show_payment_icons %}`.
*Acceptance:* nine icons at 55×40 on one right-aligned row @1920. Unchecking the setting removes the row with no layout jump.

**10 — Copyright row.**
*File:* `footer.css` · *Locate:* `copyright-row` from Step 5.
*Change:* apply §3.2 + §4; separator gets 8px side margins at 40% opacity; links reuse the hover underline at the muted colour.
*Acceptance:* `© 2026, ToteSavvy | Powered by Shopify` at 13px `#5A554F`, left-aligned, 16px below the selector.

**11 — Mobile layout.**
*File:* `footer.css` · *Locate:* end of the component file.
*Change:* one `@media (max-width: 749px)` block implementing every §3.4 row plus the mobile column of §4; alignment reads from `--footer-mobile-text-align`; centre `currency-block` and re-anchor the panel `left:50%; transform:translateX(-50%)`; hide `copyright-sep`. Add the separate tablet block from §3.4. CSS only.
*Acceptance:* @426 matches image 3 — single centred column, 26px link rhythm, centred icons and selector, payments wrapping 6 + 3, shop name on two centred lines **below** the payments. No horizontal scroll at 426 or 320.

**12 — Empty / overflow / instance guards.**
*File:* `sections/footer.liquid`, `footer.css` · *Locate:* the block loop, heading and menu output, payment loop, disclosure ids.
*Change:* implement every case in §9. Suffix every generated id with `{{ section.id }}`.
*Acceptance:* zero blocks → only the bottom bar, no stray gaps; heading-without-menu renders no empty `<ul>`; a 3× longer heading wraps without widening its track.

**13 — Keyboard, focus, motion.**
*File:* `footer.css` (+ snippet if attributes are missing) · *Locate:* trigger and panel.
*Change:* `aria-expanded` reflects state; `aria-controls` points at the instance-suffixed panel id; panel is `display:none` when closed (not transparent); Escape closes and returns focus to the trigger; `:focus-visible` = 2px outline in `--footer-border-color`, 2px offset, on links, icons, trigger and each option. Animate only `opacity` + `transform: translateY(4px)` — 160ms `ease-out` open, 120ms `ease-in` close — and null both to 0ms under `prefers-reduced-motion: reduce`.
*Acceptance:* Tab reaches every link, icon, the trigger and each option in DOM order; Escape closes and restores focus; nothing inside a closed panel is tabbable or exposed to AT.

**14 — Build and verify.**
*Change:* run `pnpm.cmd run tw:build`, then `shopify theme check` interactively, then work through §11.
*Acceptance:* build clean, no new theme-check offences, all §11 checks pass.

## 9. States and edge cases

**Interactive** — links: default `#2E2A26` no underline → hover underline (offset 3px) → focus-visible 2px outline offset 2px → active opacity .7. Social icons: hover opacity .65, active .5, focus ring radius 4. Trigger: hover bg `rgba(46,42,38,.04)`, active `.08`, open = chevron 180° + `aria-expanded="true"`, closed = 0° + `false`; never disabled. Panel items: hover `.06`, active `.10`, focus same bg + inset outline; current currency bold + `aria-current`. Payment icons are decorative — `aria-hidden`, not focusable, no hover.

**Motion** — only the panel and chevron animate; durations and reduced-motion fallback per Step 13. `display:none` is applied after the close transition so options leave the tab order. Nothing else in the footer moves.

**Empty** — no blocks → `footer-columns` not rendered (`{% if section.blocks.size > 0 %}`), `footer-bottom` keeps its top margin. Heading without menu → heading only, no empty `<ul>`. Menu without heading → list only, no reserved space. Blank heading string counts as none (test `blank`, not `nil`). No social links → `social-row` omitted. No payment types → `payment-row` omitted, selector stays left-aligned. Localization disabled / single currency → Shopify renders no form, so `footer-bottom` uses `justify-content: flex-end` with payments only. Both absent → `footer-bottom` renders nothing, copyright sits under the columns.

**Overflow** — headings and links wrap inside the track; `min-width:0` on `footer-column` plus `overflow-wrap: anywhere` on links stops a long unbroken string blowing out a track. Trigger label truncates with an ellipsis; panel item names **never** truncate, they wrap. Extra payment types wrap on `row-gap: 8px`. 5+ blocks shrink safely because tracks are `minmax(0,1fr)`; ≤1023px caps at two columns.

**Breakpoints** — ≥1024 full tree · 750–1023 two columns, 40px side padding, bottom bar still a row · ≤749 §3.4 · ≤374 needs no extra rule (payments wrap 5 + 4; verify no horizontal scroll at 320).

**Multiple instances** — every generated id (disclosure, `aria-controls`, any `for`) suffixed with `{{ section.id }}`; custom properties scoped to the section root; no JS singleton keyed to a fixed id.

**Keyboard / SR** — tab order = column links (top-to-bottom, left-to-right) → social icons → trigger → copyright links; payment icons skipped, with a visually-hidden "Payment methods" label on the list. Trigger is a real `<summary>`/`<button>` (Enter + Space). Closed panel is `display:none`. Escape closes and restores focus. Don't add arrow-key handling that conflicts with the theme's existing disclosure. Social links carry the network name as accessible name. Column headings are real `<h2>`s, each list tied to its heading via `aria-labelledby` + instance-suffixed id.

**Contrast** — flat `#F0EAE4` background, no text over photography, so no scrim needed. `#2E2A26` ≈ 12.6:1 (AAA), `#5A554F` ≈ 6.7:1 (AA). `#B08B5A` at 15px ≈ 2.6:1 — **below AA**; it is the design's colour, so keep it as the default and surface the `#8A6A3C` alternative in the setting's `info` (Step 2). Do not silently change it.

**Theme editor** — add/remove a block re-flows tracks live via `--footer-column-count`; reorder works because no CSS `order` is used on desktop; every §5 setting live-updates through the inline properties; `shopify_attributes` keeps each column selectable; confirm Step 8's overflow cleanup didn't break scroll-into-view on block select.

## 10. Do NOT touch

`sections/header.liquid`, `snippets/transparent-header.liquid`, `snippets/mega-menu.liquid`, `snippets/menu-drawer.liquid`, `snippets/nav-tree.liquid`, `assets/header.js` — unrelated header work in flight on this branch. `config/settings_data.json` — admin-managed. `sections/footer-group.json`, `templates/*.json` — group/template config, unaffected. `assets/theme.css` — generated. Any `src/tailwind/components/*.css` other than `footer.css`. Any other section or snippet.

## 11. Verification

**Build** — `pnpm.cmd run tw:build` succeeds and the new rules appear in `assets/theme.css`; `shopify theme check` (interactive) shows no new offences.

**Desktop @1920** — headings start x ≈ 64 / 661 / 1258, tracks ≈597px · heading 15px gold uppercase 0.10em · links 15px `#2E2A26`, 26px rhythm · social 4 × 20px, 28px apart · selector bordered 41×≥152, radius 4, left edge aligned with RESOURCES · payments 55×40, 6px gap, flush right · copyright 16px below the selector with the `|`.

**Dropdown** — opens upward, bordered, 6px above the trigger (image 2) · scrolls at ~245px, no horizontal scrollbar · "Åland Islands (EUR €)" wraps to two lines · paints above the payment icons · selecting a country changes a real product price and updates the label · Escape closes and returns focus; options untabbable when closed.

**Mobile @426** — everything centred · one column, 48px between groups, 26px link rhythm · payments wrap 6 + 3 centred · shop name on two centred lines **below** the payments, no `|` · no horizontal scroll at 426 or 320.

**A11y** — every link shows a focus ring and a hover underline · with `prefers-reduced-motion: reduce`, the dropdown opens/closes instantly.

**Theme editor** — `payment_icon_width` → 38 shrinks icons live · `mobile_text_align` → `left` left-aligns mobile · removing a block leaves two equal columns, re-adding restores three · unchecking `show_payment_icons` drops the row, selector stays left.

**Regression** — header, announcement bar and homepage sections visually unchanged @1920 and @426 (no leakage through shared classes) · one add-to-cart through to checkout confirms the localization restyle didn't break the cart currency.

## 12. Assumptions & open questions

1. **Payment icon size.** User specified 55×40. Measured at the 1920px reference the mock's tiles already read ≈52×41, so this is roughly the size shown rather than a reduction — raised and confirmed. Ship 55×40. If the built footer renders them much larger than the mock, report the built size; the fix is the setting, not a different default.
2. The footer already renders Shopify's localization form. If not — **stop and report**, don't add one.
3. The social column is assumed to be a block. If it comes from theme settings, style in place and report which.
4. Desktop column gap is 0 — the mock's headings land on exact thirds, which only works at zero. If desktop looks cramped at narrower widths that's what `column_gap_desktop` is for; don't change the default.
5. `#B08B5A` is read from a compressed mock. If the brand has an exact gold token, use it as the default and say so.
6. Breakpoints 749/750 assumed to match the theme. If the theme differs, use the theme's value and note the substitution.
7. `src/tailwind/components/footer.css` already exists untracked. If it has footer rules, extend rather than replace, and report anything removed.
8. `padding_top: 64` is inferred — the desktop mock is cropped at the footer's top edge. If the section already has a padding setting, keep its current value as the default.

Codex asks rather than guesses on any of the above.

## 13. Progress checklist

- [ ] 1 Recon · [ ] 2 Schema settings · [ ] 3 Custom properties · [ ] 4 Column grid · [ ] 5 Bottom-bar split · [ ] 6 Headings/links/social · [ ] 7 Currency trigger · [ ] 8 Dropdown upward · [ ] 9 Payment row · [ ] 10 Copyright row · [ ] 11 Mobile · [ ] 12 Guards · [ ] 13 A11y/motion · [ ] 14 Build & verify
