---
project: image-text-tiles
status: active
created: 2026-07-25
branch: dev
source_prompt: "This section has got two parts. As you can see, there is a type two and button in itchy part. When I have the button, the button has got animation like the second section button. Also, it has got overlay. So it looks like darker. first image is desktop design, and second image is mobile design. on the mobile, the direction should be column. So I mean that counts of column is one. make the plan."
decisions:
  - New section; sections/collection-list.liquid stays byte-identical.
  - Scrim always on, constant; does NOT change on hover.
  - Content from section blocks (image + heading + button label + link), not collection objects.
  - Button only *similar* to existing text-content block button; copy feel, not component. No shared snippet, no edit to that block.
  - NO new CSS file. Tailwind utility classes only.
---
This plan was written without reading the code. Verify each **Locate** before editing. If the code doesn't match, stop and report — don't improvise.
Reference widths: desktop mock ≈1684px, mobile mock ≈385px. Numbers are read off mocks — close, not authoritative. They are the defaults; merchant can change them.

## 1. Objective
New full-bleed section of merchant-defined image tiles. Each tile = photo + constant dark scrim + centred uppercase serif heading + CTA button; whole tile is one link. Desktop: 2 tiles edge-to-edge. Mobile: 1 column. Hovering a tile animates its button with a left→right fill sweep.

## 2. Scope
**In:** new `sections/image-text-tiles.liquid` (markup + schema + repeatable `tile` block); full layout/scrim/type/button styling in Tailwind utilities; hover/focus-visible/active/reduced-motion; mobile single column; one instance + 2 blocks in `templates/index.json`.
**Out:** any change to `sections/collection-list.liquid` or the existing text-content section; any new `.css` file or change to `src/tailwind/index.css`; any JS; collections/products/metafields.

## 3. Layout spec
### 3.1 Box tree (desktop) — this IS the DOM nesting
```
tiles-root                        <section>, full bleed
└── tiles-grid                    grid container
    ├── tile                      one per block; the <a>
    │   ├── tile-media            <img>
    │   ├── tile-scrim            constant dark overlay
    │   └── tile-content          centred text stack
    │       ├── tile-heading      <h2>
    │       └── tile-button       <span> styled as button
    │           ├── tile-button-fill    ::before, the sweep
    │           └── tile-button-label   <span>
    └── tile (repeat)
```
`tile` is the `<a>`. No nested `<a>`, no `<button>` — one interactive element per tile, one tab stop.

### 3.2 Per-box table (desktop, ≥768px)
| Box | Position | Anchors | Size | Inner layout | Padding / margin | z | Overflow |
|---|---|---|---|---|---|---|---|
| tiles-root | static | n/a | w 100% fluid full-bleed, max-w none, h auto | flow | pad 0/0/0/0 (settings, default 0); margin 0 | 0 | visible |
| tiles-grid | static | n/a | w 100% of tiles-root, h auto | grid; `repeat(2,minmax(0,1fr))`; col-gap 0; row-gap 0; align-items stretch; justify-content stretch | pad 0 all; margin 0 | 0 | visible |
| tile | **relative — positioning context for tile-media, tile-scrim, tile-content** | n/a (grid flow) | w 100% of its column (=**842px** @1684); h from `aspect-ratio:1/1`; both fluid | flex; column; justify-content center; align-items center; gap 0 | pad 0 all; margin 0 | 0 | hidden (clips image; nothing else) |
| tile-media | absolute — ctx `tile` | inset 0 (t/r/b/l 0); no transform | w 100% h 100% of tile, fluid; object-fit cover; object-position center | n/a | pad 0; margin 0 | 0 | n/a (clipped by tile) |
| tile-scrim | absolute — ctx `tile` | inset 0; no transform | w 100% h 100% of tile | n/a (empty) | pad 0; margin 0 | 1 | hidden |
| tile-content | static (centred by tile's flex) | n/a | w 100% of tile; max-w **78%** of tile (=657px @842); h auto | flex; column; align-items center; justify-content center; gap **24px** | pad 0/24px/0/24px; margin 0 | 2 | visible |
| tile-heading | static | n/a | w 100% of tile-content; h auto | flow (text) | pad 0; margin 0 all (reset UA `<h2>` margin) | 2 | visible |
| tile-button | **relative — ctx for tile-button-fill** | n/a (flex flow) | min-w **140px** fixed floor; w auto (grows with label); h **34px** fixed | inline-flex; align-items center; justify-content center | pad 0/20px/0/20px; margin 0 | 2 | **hidden — this clips the sweep** |
| tile-button-fill | absolute — ctx `tile-button`; is `::before` on tile-button | inset 0; `transform:scaleX(0)`; `transform-origin:left center` | w 100% h 100% of tile-button | n/a | pad 0; margin 0 | 0 | visible (clipped by button) |
| tile-button-label | relative (paints above fill) | n/a | w auto; h auto | flow (text) | pad 0; margin 0 | 1 | visible |

Check @1684: 1684÷2 = 842px/tile, gap 0, height 842. Mock reads ≈842×835 → square → `1/1` default.

### 3.3 Stacking order
Inside `tile`, bottom→top: tile-media (0) → tile-scrim (1) → tile-content (2). Inside `tile-button`: tile-button-fill (0) → tile-button-label (1); those are local to the button's own stacking context.
`tile-scrim` and `tile-media` get `pointer-events:none` so they never eat the link's hover/click. Each `tile` makes its own stacking context (`relative` + `z-index:0`) so tiles never interleave.

### 3.4 Mobile as deltas
**Breakpoint 768px.** Mobile-first: unprefixed = mobile, `md:` (≥768px) = desktop. All deltas are **CSS-only** — nothing re-parents, nothing changes its `position`, nothing is hidden or added, no text duplicated. Markup identical at both widths.
**Re-parent / reorder:** none. **Position changes:** none (media, scrim, fill stay absolute; content stays in flex flow). **Hidden/added:** none.
Resizes:
| Box | Desktop ≥768 | Mobile <768 |
|---|---|---|
| tiles-grid | `repeat(2,minmax(0,1fr))`; row-gap 0 | `repeat(1,minmax(0,1fr))`; row-gap **10px** |
| tile | 50% of grid (842px @1684); ratio 1/1 | 100% of grid (**385px** @385); ratio 1/1 |
| tile-content | max-w 78%; gap 24px; pad-inline 24px | max-w **86%**; gap **14px**; pad-inline **20px** |
| tile-heading | 34px / 1.2 / .02em | **17px** / **1.35** / **.06em** |
| tile-button | min-w 140px, h 34px | unchanged 140×34 (mock shows same pill) |
| tile-button-label | 11px | **10.5px** |
Column count is the only structural change — a single `grid-template-columns` swap. Do not render a second markup branch.

## 4. Element measurements
| Element | Property | Desktop ≥768 | Mobile <768 |
|---|---|---|---|
| tile-heading | font-family | theme display serif — **lookup, rule 12** | same |
| | size / weight / line-height | 34px / 400 / 1.2 (40.8px) | 17px / 400 / 1.35 (23px) |
| | letter-spacing | 0.02em (≈0.7px) | 0.06em (≈1.0px) |
| | colour / align / transform | #FFFFFF / center / uppercase | same |
| | shadow / border / radius | none / none / 0 (contrast from scrim, §9.8) | same |
| tile-scrim | colour / opacity | #000000 / 20% → flat `rgba(0,0,0,.20)` | same |
| | gradient variant (`scrim_style=bottom_gradient`) | `linear-gradient(to top, rgba(0,0,0,.35) 0%, rgba(0,0,0,.10) 55%, rgba(0,0,0,.10) 100%)` | same |
| | shadow / border / radius | none / none / 0 | same |
| tile-button rest | bg / min-w × h / pad-inline | #D6C3B2 / 140×34px / 20px | same |
| | radius / border / shadow | 0 / none / none | same |
| tile-button-label | family | theme body sans — **lookup, rule 12** | same |
| | size / weight / line-height | 11px / 500 / 1 | 10.5px / 500 / 1 |
| | letter-spacing / colour / transform / align | 0.14em (≈1.5px) / #3F3630 / uppercase / center | same |
| tile-button hover | fill colour / transform | #FFFFFF / `scaleX(0)→scaleX(1)`, origin left center | same |
| | label colour | #3F3630 (unchanged; dark on white stays legible) | same |
| | duration / easing | 320ms / `cubic-bezier(.4,0,.2,1)` | same |
| tile-button focus-visible | outline | `2px solid #FFFFFF`, offset 2px | same |
| tile-button active | transform | `scale(.98)` over 120ms | same |
| tile-content | gap heading→button | 24px | 14px |

Vertical placement @reference: desktop group (heading top ≈365, button bottom ≈458) centres ≈411 of 835 = 49%; mobile ≈45%. Build **centred**, expose `content_vertical_align`.

## 5. Settings map
Default = the measured value.
### 5.1 Section settings
| id | type | default | drives |
|---|---|---|---|
| desktop_columns | range 1–4 step 1 | 2 | tiles-grid `grid-template-columns` at `md:` |
| column_gap | range 0–48 step 2 px | 0 | tiles-grid col-gap (desktop) |
| mobile_row_gap | range 0–48 step 2 px | 10 | tiles-grid row-gap (mobile) |
| tile_aspect_ratio | select 1/1, 4/5, 3/4, 16/9, auto | 1/1 | tile `aspect-ratio` |
| content_vertical_align | select top/center/bottom | center | tile `justify-content` |
| scrim_color | color | #000000 | tile-scrim |
| scrim_opacity | range 0–80 step 5 % | 20 | tile-scrim alpha |
| scrim_style | select flat / bottom_gradient | flat | tile-scrim fill mode |
| heading_size_desktop | range 16–72 step 1 px | 34 | tile-heading |
| heading_size_mobile | range 12–40 step 1 px | 17 | tile-heading |
| heading_line_height_desktop | range 0.9–2.0 step .05 | 1.2 | tile-heading |
| heading_line_height_mobile | range 0.9–2.0 step .05 | 1.35 | tile-heading |
| heading_tracking_desktop | range 0–20 step 1 (÷100 = em) | 2 → .02em | tile-heading |
| heading_tracking_mobile | range 0–20 step 1 (÷100 = em) | 6 → .06em | tile-heading |
| heading_color | color | #FFFFFF | tile-heading |
| heading_uppercase | checkbox | true | tile-heading `text-transform` |
| content_max_width_desktop | range 40–100 step 2 % | 78 | tile-content max-w |
| content_max_width_mobile | range 40–100 step 2 % | 86 | tile-content max-w |
| content_gap_desktop | range 0–64 step 2 px | 24 | tile-content gap |
| content_gap_mobile | range 0–64 step 2 px | 14 | tile-content gap |
| content_padding_inline_desktop | range 0–80 step 2 px | 24 | tile-content pad-inline |
| content_padding_inline_mobile | range 0–80 step 2 px | 20 | tile-content pad-inline |
| button_bg | color | #D6C3B2 | tile-button rest bg |
| button_text_color | color | #3F3630 | tile-button-label rest |
| button_hover_bg | color | #FFFFFF | tile-button-fill |
| button_hover_text_color | color | #3F3630 | tile-button-label hover |
| button_min_width | range 100–320 step 4 px | 140 | tile-button |
| button_height | range 28–64 step 1 px | 34 | tile-button |
| button_padding_inline | range 8–48 step 2 px | 20 | tile-button |
| button_radius | range 0–32 step 1 px | 0 | tile-button |
| button_font_size_desktop | range 8–20 step .5 px | 11 | tile-button-label |
| button_font_size_mobile | range 8–20 step .5 px | 10.5 | tile-button-label |
| button_font_weight | select 400/500/600/700 | 500 | tile-button-label |
| button_tracking | range 0–30 step 1 (÷100 = em) | 14 → .14em | tile-button-label |
| anim_duration | range 0–800 step 20 ms | 320 | fill sweep + label colour transition |
| section_padding_top | range 0–120 step 4 px | 0 | tiles-root |
| section_padding_bottom | range 0–120 step 4 px | 0 | tiles-root |

### 5.2 Block settings — type `tile`, `max_blocks: 6`
| id | type | default | drives |
|---|---|---|---|
| image | image_picker | none | tile-media src/srcset |
| image_position | select top/center/bottom/left/right | center | tile-media `object-position` |
| heading | text | EVERYDAY ORGANIZATION | tile-heading |
| button_label | text | SHOP NOW | tile-button-label |
| link | url | empty | tile `href` |
| use_custom_scrim | checkbox | false | whether the two below apply |
| block_scrim_color | color | #000000 | tile-scrim, this tile only |
| block_scrim_opacity | range 0–80 step 5 % | 20 | tile-scrim, this tile only |

`use_custom_scrim` exists because the mock's two tiles read at different darkness — the left marble photo needs more scrim than the right.

### 5.3 Deliberately hard-coded
| value | reason |
|---|---|
| `object-fit:cover` on tile-media | any other value breaks the fixed-ratio tile |
| `transform-origin:left center` on the fill | sweep direction is brand motion language, consistent with the existing button |
| easing `cubic-bezier(.4,0,.2,1)` | merchant controls duration only; easing constant keeps all theme buttons identical |
| `pointer-events:none` on scrim + media | purely functional; exposing it only lets the merchant break the link |
| `overflow:hidden` on tile + tile-button | structural clipping; exposing it lets the sweep paint outside the button |
| focus-visible outline 2px #FFFFFF offset 2px | accessibility floor, must not be removable |

§5.1 + §5.2 must let the merchant rebuild the whole mock — spacing, type scale, colours, scrim, button, animation speed, column count — without touching code.

## 6. Files to change
| path | action | why |
|---|---|---|
| `sections/image-text-tiles.liquid` | create | markup + `{% schema %}` |
| `templates/index.json` | modify (*expected path — verify it is the homepage template*) | add one instance + 2 blocks |
| `locales/en.default.schema.json` | modify **only if** this theme uses `t:` keys for schema labels — **lookup:** open an existing section's `{% schema %}` and check whether `"label"` values are literal strings or `t:` keys; match it. Literal strings → don't touch this file. |
| `assets/theme.css` | regenerate only via `pnpm.cmd run tw:build`; never hand-edit |

Unchanged: `src/tailwind/index.css`, `sections/collection-list.liquid`, the existing text-content section.

## 7. Task-specific rules
1. **No new CSS file.** All styling = Tailwind utilities in `sections/image-text-tiles.liquid`. No `src/tailwind/components/*.css`, no `@import` in `src/tailwind/index.css`, no `<style>` block for anything a utility can express.
2. **Never build a Tailwind arbitrary value at runtime.** `text-[{{ settings.x }}px]` only exists in rendered HTML, the scanner never sees it, it is purged, the style silently vanishes. Instead: emit each setting as a **CSS custom property in an inline `style` attribute** on the owning box, and consume it with a **static** arbitrary utility referencing the variable — the literal string is then in the source, so Tailwind emits the rule. Exact forms to use: `text-[length:var(--tile-heading-size)]`, `leading-[var(--tile-heading-lh)]`, `tracking-[var(--tile-heading-ls)]`, `text-[color:var(--tile-heading-color)]`, `bg-[color:var(--tile-btn-bg)]`, `gap-[var(--tile-content-gap)]`, `min-w-[var(--tile-btn-minw)]`, `h-[var(--tile-btn-h)]`, `rounded-[var(--tile-btn-radius)]`, `aspect-[var(--tile-ratio)]`, `px-[var(--tile-content-px)]`, `max-w-[var(--tile-content-maxw)]`, `duration-[var(--tile-anim)]`, `grid-cols-[var(--tiles-cols)]`.
3. **Responsive settings = two variables, not two class strings.** Define `--x` (mobile) and `--x-md` (desktop) inline; write the unprefixed utility reading `var(--x)` and the `md:` utility reading `var(--x-md)`, e.g. `text-[length:var(--tile-heading-size)] md:text-[length:var(--tile-heading-size-md)]`. Both literals are static → both survive the purge.
4. **Variable ownership.** Section variables in the `style` attr on `tiles-root`; per-block overrides (`use_custom_scrim`) in the `style` attr on that block's `tile`, shadowing the inherited value. Don't re-declare unchanged values per block.
5. **The fill pseudo-element uses the `before:` variant, not a stylesheet:** `before:content-[''] before:absolute before:inset-0 before:origin-left before:scale-x-0 before:bg-[color:var(--tile-btn-hover-bg)] before:transition-transform before:duration-[var(--tile-anim)] before:ease-[cubic-bezier(0.4,0,0.2,1)]`. If the project's Tailwind version can't express a needed `before:` utility, **stop and report** — do not add a stylesheet.
6. **Hover is driven from the tile, not the button.** `group` on `tile`; `group-hover:before:scale-x-100` and `group-focus-visible:before:scale-x-100` on `tile-button`. The requirement is that hovering the *tile* animates the button.
7. Every `id` attribute suffixed with `{{ section.id }}` — the section may appear twice on a page.
8. `{{ block.shopify_attributes }}` on every `tile`, or the editor can't highlight/scroll to a block.
9. **No JS, no Alpine store.** Nothing here is stateful.
10. `templates/index.json` is admin-managed: add the new entry + its `order` position only; don't reformat or reorder existing entries.
11. **Button = reference lookup, not a copy.** Grep `sections/` for the existing text-content button (search `before:scale-x`, or `transition` near `group-hover`) and read its real duration + easing. If they differ from §4, **use the theme's values** as `anim_duration`'s default so both buttons feel identical, and say so in your report. Do not import, share, or modify that section.
12. **Fonts are a lookup, never a guess.** Mock heading = high-contrast display serif; button label = sans. Grep how existing headings set their family (likely a custom property from `settings_schema.json` `type_header_font` → `--font-heading-family`, or a class already used in `sections/hero-transparent.liquid`). Use what the theme already uses. No hard-coded font stack, no new webfont.

## 8. Steps
**Step 1 — Create the section file with its schema.** *File:* `sections/image-text-tiles.liquid` (new). *Locate:* read `sections/collection-list.liquid`'s `{% schema %}` for this theme's conventions (literal vs `t:` labels, `presets`, `tag`/`class` keys, `header` grouping). *Change:* create the file containing only `{% schema %}`. Declare `name`, `tag: section`, a `class` per convention, every §5.1 setting in order grouped under `header` dividers (Layout, Scrim, Heading, Button, Motion, Padding), the `tile` block type with `max_blocks: 6` and every §5.2 setting, and a `presets` entry containing two `tile` blocks. Every `default` = the §5 default exactly. *Acceptance:* `shopify theme check` passes; section appears in Add-section with two empty tiles and all §5 settings at their documented defaults.

**Step 2 — Build the box tree markup.** *File:* same. *Locate:* above the `{% schema %}` block. *Change:* render §3.1 exactly — `tiles-root` → `tiles-grid` → one `tile` per block of type `tile` → `tile-media`/`tile-scrim`/`tile-content` → `tile-heading`/`tile-button` → `tile-button-label`. `tile` is the `<a>` with `{{ block.shopify_attributes }}` and `group`. `tile-heading` is always `<h2>` with its UA margin reset. Structural classes only; no visual styling yet. *Acceptance:* with two blocks, the page renders two anchors each containing image, empty scrim div, heading, button label; nesting matches §3.1.

**Step 3 — Emit all setting-driven values as inline CSS custom properties.** *File:* same. *Locate:* opening tags of `tiles-root` and each `tile`. *Change:* build a `style` attr on `tiles-root` with one custom property per §5.1 setting, using rule 3's two-variable pattern for every responsive pair. Convert units in Liquid where the setting stores a bare number: scrim `%` → an `rgba()` alpha, tracking ÷100 + `em`, sizes + `px`, duration + `ms`. On each `tile`, emit the scrim override properties only when `block.settings.use_custom_scrim` is true. Nothing else goes in a `style` attribute. *Acceptance:* in view-source `tiles-root` carries every variable at §5 defaults; a block with `use_custom_scrim` on carries exactly two extra variables.

**Step 4 — Apply grid and tile geometry with Tailwind utilities.** *File:* same. *Locate:* `tiles-root`, `tiles-grid`, `tile`. *Change:* apply the Position/Anchors/Size/Inner-layout/Padding/z/Overflow columns of §3.2 to these three boxes using static arbitrary utilities reading Step 3's variables; add §3.4 deltas as `md:` variants. `tiles-grid` is single-column at base and `var(--tiles-cols)`-column at `md:`; row-gap at base, col-gap at `md:`. *Acceptance:* ≥768px two half-width square tiles, edge to edge, no seam; <768px one column with a 10px white gap; no horizontal scrollbar at either width.

**Step 5 — Apply media and scrim.** *File:* same. *Locate:* `tile-media`, `tile-scrim`. *Change:* render `tile-media` via `image_url` with a `srcset` covering what this layout actually requests (full-width mobile tile to ≈430px at 3×; half-viewport desktop tile to ≈1200px) and `sizes` = 100vw below 768px, 50vw above. Set `width`/`height` from the image (no layout shift), `loading="lazy"` on all but the first block — that one gets `eager` + `fetchpriority="high"` as it's above the fold — and `alt` from the image's own alt, falling back to the block heading. Apply §3.2 geometry and `object-position` from `image_position`. Give `tile-scrim` full inset, its z-index, `pointer-events:none`, and a background that is a flat fill when `scrim_style=flat` and the §4 gradient when `bottom_gradient`. *Acceptance:* both photos fill their tiles undistorted at both breakpoints; scrim visibly darkens at 20% and is clearly stronger at 60%; clicking anywhere on a tile follows the link; no CLS from this section.

**Step 6 — Style the content stack and heading.** *File:* same. *Locate:* `tile-content`, `tile-heading`. *Change:* apply both §3.2 rows and the §3.4 deltas (max-width, gap, pad-inline all switch at `md:`), and every §4 `tile-heading` row — family per rule 12, size, weight, line-height, tracking, colour, centre align, uppercase gated on `heading_uppercase`. Zero the `<h2>` UA margin explicitly. Wire `tile` `justify-content` to `content_vertical_align`. *Acceptance:* @1684 heading = 34px uppercase white centred, optically centred in the tile, matching the mock; @385 = 17px with visibly wider tracking, wrapping to two lines without touching the tile edges; `top`/`bottom` alignment moves the whole stack.

**Step 7 — Style the button at rest.** *File:* same. *Locate:* `tile-button`, `tile-button-label`. *Change:* apply the §3.2 rows and §4's rest + label rows — inline-flex centring, min-width, height, pad-inline, radius, background, `overflow:hidden`, and the label's family/size/weight/line-height/tracking/colour/uppercase, with `md:` variants for the two differing font sizes. Render the button only when `button_label` is non-blank. *Acceptance:* matches the mock at both widths — a hard-edged beige rectangle ≈140×34 with small, wide-tracked dark uppercase text.

**Step 8 — Add the hover fill-sweep animation.** *File:* same. *Locate:* `tile-button`; for reference only, the existing text-content button (rule 11). *Change:* add `tile-button-fill` per rule 5 — inset, `origin-left`, `scale-x-0` at rest, bg `button_hover_bg`, transitioning `transform` over `var(--tile-anim)` with the fixed easing. Make `tile-button-label` `relative` z-index 1 so it paints above the fill, transitioning its colour to `button_hover_text_color` over the same duration. Trigger both from the tile per rule 6. Use the existing button's duration/easing if they differ from §4. *Acceptance:* hovering anywhere on a tile sweeps a white fill left→right across that tile's button over ~320ms and reverses on leave; only the hovered tile animates; **the scrim does not change** (specified constant).

**Step 9 — Add focus-visible, active and reduced-motion states.** *File:* same. *Locate:* `tile`, `tile-button`. *Change:* apply §4's focus-visible outline to `tile` (the focusable element), sized to read against both photos; apply the active transform to `tile-button`; add a `motion-reduce:` variant that drops the sweep transition and applies the hover background instantly. Confirm `outline` is never set to `none` in this section. *Acceptance:* tabbing moves tile→tile with a visible white ring and the focused tile's button shows its fill state; Enter follows the link; with OS reduce-motion on, hover swaps the background with no sweep.

**Step 10 — Handle empty and overflow content.** *File:* same. *Locate:* the block loop, `tile-media`, `tile-heading`, `tile-button`, `tile`. *Change:* implement every case in §9.3 and §9.4. Nothing may render an empty shell or a dead anchor. *Acceptance:* each §9.3/§9.4 case behaves as documented when reproduced in the editor.

**Step 11 — Add the section instance to the homepage.** *File:* `templates/index.json`. *Locate:* grep `"order"` and the existing `collection-list` entry. *Change:* add one `image-text-tiles` entry with two `tile` blocks whose headings are `EVERYDAY ORGANIZATION` and `NOT YOUR AVERAGE BABY BAG`, plus the block order array; insert its id into `order` **after** the collection-list entry, not replacing it. Leave every existing entry byte-identical. *Acceptance:* `git diff templates/index.json` shows only additions plus one new id in `order`; homepage renders both sections.

**Step 12 — Rebuild Tailwind and verify the purge kept everything.** *File:* `assets/theme.css` (generated). *Locate:* the `tw:build` script in `package.json`. *Change:* run `pnpm.cmd run tw:build`, then grep the built `assets/theme.css` for a sample of rule 2's utilities — at minimum `var(--tile-heading-size)`, `var(--tile-btn-minw)`, `var(--tiles-cols)` and the `before:` sweep rule. If any is missing, that class was built at runtime — fix it; do not add a stylesheet. *Acceptance:* every sampled utility is present in the built CSS and the rendered section matches §4 with no missing styles.

## 9. Every state and edge case
### 9.1 Interactive states
| state | visual |
|---|---|
| default | photo at full opacity under a constant `rgba(0,0,0,.20)` scrim; button #D6C3B2 with #3F3630 uppercase label; fill at `scaleX(0)`, invisible |
| hover (anywhere on tile) | white fill sweeps the button left→right over 320ms; label colour transitions to `button_hover_text_color` over the same 320ms; **scrim, photo and heading do not change** (merchant chose a constant overlay); cursor `pointer` across the whole tile |
| focus-visible | `2px solid #FFFFFF` outline at 2px offset on the `tile` anchor **plus** the same button fill state as hover, so keyboard users get an identical affordance; the outline paints above the scrim so it reads over any photo |
| active / pressed | tile-button scales to .98 over 120ms; fill stays at `scaleX(1)`; releases on pointer-up |
| open / closed | n/a — nothing here is expandable |
| disabled | n/a — a tile with no `link` renders as a `<div>` (§9.3), so there is never a dead clickable box |
| visited | not styled — leave `:visited` at default so tiles never diverge in colour after a click |

### 9.2 Motion
Animated properties: `transform` (`scaleX`) on tile-button-fill and `color` on tile-button-label. Nothing else. Never animate `width`/`left` — they force layout every frame.
Open (hover on): 320ms, `cubic-bezier(.4,0,.2,1)`, `scaleX(0)→scaleX(1)`. Close (hover off): same duration, same easing, reversed — the mock's button reads symmetric, so don't shorten the close. Active: 120ms on `transform:scale()`.
`prefers-reduced-motion:reduce`: transitions on fill and label drop to 0ms; the hover state still applies (fill appears instantly at `scaleX(1)`). Reduced motion must not mean no feedback. `anim_duration = 0` must be valid and produce that same instant swap.

### 9.3 Empty content
| case | behaviour |
|---|---|
| no blocks | render nothing — no `<section>`, no empty grid, no padding. Guard the whole output on `section.blocks.size > 0`. In the editor the section stays selectable but visually absent, which is correct. |
| block with no image | render the tile with the scrim colour as a solid full-opacity background in place of the photo, keeping heading and button legible. No `<img>` with an empty `src`; **no** Shopify placeholder SVG — a grey placeholder at hero scale looks broken on a live store. |
| blank heading | omit `tile-heading` entirely, so `tile-content`'s gap collapses and the button stays centred with no phantom 24px offset |
| blank button label | omit `tile-button` entirely; heading stays centred alone |
| no link | render `tile` as a `<div>` — no `href`, no `group` hover trigger, no focus ring, `cursor:default`. Never emit `href=""` or `href="#"`; both are keyboard traps. |
| image only, heading and label both blank | photo + scrim renders alone — a legitimate decorative config; don't force placeholder text |

### 9.4 Overflow content
| case | behaviour |
|---|---|
| heading 3× the mock's length | wraps to as many lines as needed; `tile-content` is capped at 78%/86% so text never reaches the edge. No clamp, no truncation — a long heading should be fully visible. If it exceeds the tile height it overflows visibly, which is self-correcting; a silent clamp is not. |
| very long button label | `min-width:140px` + `width:auto` so the button grows; label stays one line (`white-space:nowrap`) and the button widens to `tile-content`'s max-width, then wraps. Never truncate a CTA. |
| single long unbroken word in the heading | `overflow-wrap:anywhere` on tile-heading so a long product name can't push a horizontal scrollbar onto the page |
| very tall image at `aspect_ratio:auto` | no fixed ratio, so tiles in a desktop row differ in height; `align-items:stretch` makes the shorter one's photo cover the row height. Note this in the setting's `info`. |

### 9.5 Breakpoints
| width | behaviour |
|---|---|
| ≥1024px | two square tiles side by side, each 50% of viewport, zero gap, full bleed; heading 34px, content max-w 78%, gap 24px; matches the desktop mock @1684 |
| 768–1023px | identical structure to desktop (still 2 columns — `md:` is 768px); tiles shrink to ~384–512px each and stay square; heading stays 34px, which is intentional — at 768px a 34px heading in a 384px square is proportionally close to the desktop reading. Verify no wrap clipping at exactly 768px. |
| <768px | one column, full-width square tiles, 10px white gap; heading 17px / 1.35 / .06em; content max-w 86%, gap 14px, pad-inline 20px; matches the mobile mock @385 |
| 320px | 320px square tile; 140px button + 20px padding fits; confirm the longest default heading wraps rather than overflows |
| exactly 767 / 768px | check both — the column flip happens here; there must be no intermediate state rendering two columns at mobile type sizes |

### 9.6 Multiple instances
The section may appear twice on one page. Every `id` is suffixed with `{{ section.id }}`, so ids never collide. All state is CSS-only (`:hover`, `:focus-visible`, `group-hover`) and DOM-scoped, so instances can't share or leak state. All custom properties are declared on each instance's own `tiles-root`, so instance B's settings never inherit into instance A. **Verify:** add the section twice with different `scrim_opacity` and `button_bg` and confirm each renders its own.

### 9.7 Keyboard and screen reader
Tab order: one stop per tile, DOM order = visual order at both breakpoints; scrim and media are not focusable and are `pointer-events:none`.
Focus ring: always visible, never `outline:none`. `2px #FFFFFF` at 2px offset reads against every mock photo; a merchant could upload a white image, so also apply a subtle dark `box-shadow` under the outline as a guaranteed-contrast backstop.
Focus return / `aria-expanded` / Escape: n/a — nothing opens or closes.
Hidden-when-closed: n/a — absent content is *not rendered* (§9.3) rather than hidden with `opacity:0`, so screen readers never announce an invisible heading.
Heading semantics: `tile-heading` is `<h2>`. Confirm the page doesn't already nest these under a lower level such that a level is skipped; if the section later gains its own title, that becomes the `<h2>` and tiles drop to `<h3>` — not in scope now, just don't hard-code assumptions that block it.
Link text: the anchor's accessible name is heading + button label, e.g. "Everyday organization shop now" — acceptable. **Do not** add `aria-label="Shop now"`; it would replace the informative heading with a generic phrase and produce a page of identical "shop now" links.
Image: `tile-media` is meaningful (it *is* the tile), so give real `alt` from the image's own alt falling back to the heading. Not `alt=""`.

### 9.8 Contrast
White 34px text sits over photography that can't be guaranteed dark. The treatment is the **scrim** — a constant `rgba(0,0,0,.20)`, exactly as specified. No text-shadow.
20% black over the mock's mid-tone marble puts white text around 7:1, clearing AA for large text with margin. Over a genuinely light image (white product on white) 20% is **not** enough — that is precisely what per-block `use_custom_scrim` is for, and why it exists rather than one section-wide value. Add an `info` note on `scrim_opacity` telling the merchant to raise it when the heading is hard to read on a light photo; that is the honest fix, whereas a hidden text-shadow would silently drift from the mock.
Button contrast is fixed and safe both states: #3F3630 on #D6C3B2 ≈ 7.4:1; #3F3630 on #FFFFFF ≈ 10.5:1 — both clear AAA for the 11px label. Re-verify after any colour setting change.

### 9.9 Theme editor
Adding a block: appears with §5.2 defaults, no image, rendering per §9.3's no-image rule — visible, legible, obviously ready for a photo; never a broken shell.
Removing a block: grid reflows. Down to one block leaves a single tile in one of the two desktop columns, not stretched, because `grid-template-columns` is fixed at 2 — add an `info` note on `desktop_columns` telling the merchant to set 1 for a full-width single tile. Removing all blocks renders nothing (§9.3).
Reordering: driven by `section.blocks` order; grid source order = visual order at both breakpoints, so drag-to-reorder matches the storefront.
Live updates: every §5 value is a custom property on `tiles-root`/`tile` or a Liquid-rendered attribute, so all re-render on section reload with no JS re-init. Verify live: `desktop_columns`, `scrim_opacity`, `heading_size_desktop`, `button_bg`, `anim_duration`, per-block `use_custom_scrim`.
`shopify_attributes` on every `tile` so block selection highlights and scrolls to the right tile. Section reordering/duplication covered by §9.6.

## 10. Do NOT touch
| path | why |
|---|---|
| `sections/collection-list.liquid` | explicitly out of scope; stays byte-identical and keeps rendering where it's used. This task adds a section, it doesn't replace one. |
| the existing text-content section | read for its button transition values only (rule 11); no shared snippet, no refactor, no restyle — the buttons are *similar*, not the same component |
| `src/tailwind/index.css` | no new component stylesheet exists to import; editing it means rule 1 was violated |
| `src/tailwind/components/**` | same — create nothing here |
| `assets/theme.css` (by hand) | generated; only `pnpm.cmd run tw:build` may change it |
| existing entries in `templates/index.json` | admin-managed JSON — add the new section + its `order` position, change nothing else, don't reformat |
| `config/settings_data.json`, `config/settings_schema.json` | this section carries its own settings; it must not depend on new global theme settings |
| every other modified/untracked file on this branch | unrelated in-flight work (header, mega-menu, hero-transparent, promotion-block…) — don't touch, don't "fix", don't commit alongside |

## 11. Verification
**Build.** (1) `pnpm.cmd run tw:build` — required, new utilities; must exit clean. (2) Grep built `assets/theme.css` for Step 12's sample list and confirm each utility survived the purge — this is the single most likely failure mode of this plan. (3) `shopify theme check` run **interactively**, not backgrounded: zero new errors/warnings from `sections/image-text-tiles.liquid`.
**Desktop.** (4) At the **1684px** reference vs the desktop mock: two square tiles ≈842px wide, zero gap, full bleed to both viewport edges; heading 34px uppercase white centred; button ≈140×34 beige with dark 11px wide-tracked label; scrim visibly darkening both photos. (5) Hover each tile: only that tile's button sweeps white left→right over ~320ms, scrim unchanged, reverses on leave. (6) Tab through: one stop per tile, visible white ring, button shows fill state, Enter follows the link. (7) Press and hold the button area: scales to .98.
**Mobile.** (8) At the **385px** reference vs the mobile mock: one column, two full-width square tiles, ~10px white gap, heading 17px with visibly wider tracking, button unchanged at ≈140×34. (9) Check 767px and 768px back to back — clean flip, no frame with two columns at mobile type sizes. (10) At 320px: no horizontal scrollbar, heading wraps, button fits.
**Edge cases.** (11) Work through §9.3 in the editor — remove the image, blank the heading, blank the button label, clear the link; each degrades as documented and the no-link case renders a `<div>`, not an anchor. (12) Paste a heading 3× the mock's length and a 30-character button label; confirm §9.4. (13) Enable OS reduce-motion and re-check hover: instant background swap, no sweep, feedback still present.
**Regression.** (14) The existing collection-list section still renders on the homepage, unchanged, above the new one — the one section this task must not disturb. (15) `git diff --stat` limited to §6; `sections/collection-list.liquid` and `src/tailwind/index.css` show **zero** changes. (16) Add the section twice with different scrim and button colours; confirm §9.6 — no shared state, no id collisions, no setting bleed.

## 12. Assumptions & open questions
Codex asks; Codex never guesses.
| # | assumption | if false |
|---|---|---|
| 1 | Tailwind build supports `before:`, `group-hover:`, `motion-reduce:` and arbitrary values containing `var()` (v3+) | **Stop and report.** Do not fall back to a `.css` file or `<style>` block — "Tailwind utilities only" was explicit. |
| 2 | Tailwind's content/purge globs already include `sections/**/*.liquid`, so a new section file is scanned without config changes | check `tailwind.config.*`'s `content` array; if new sections aren't covered, report — adding a glob is a config change outside this plan's scope |
| 3 | `templates/index.json` is the homepage template and the right place for the instance | if the homepage uses a different template or a JSON group, add it there and note the substitution |
| 4 | schema labels here are literal strings, not `t:` keys | if `t:`, add matching entries to `locales/en.default.schema.json` and use keys throughout (§6) |
| 5 | the theme exposes a display serif for headings and a sans for body (rule 12) | if only one family exists, use it for both and report that the mock's serif/sans contrast couldn't be reproduced — do not add a webfont unprompted |
| 6 | the existing text-content button's hover is a fill/colour transition compatible with a `scaleX` sweep | if it's structurally different (underline wipe, translate, icon slide), **match that instead** of §4's sweep — the user asked for "similar to that button", so the existing button is the authority. Report what you found and built. |
| 7 | 1:1 is the intended tile ratio — mock reads 842×835 desktop, ≈385×360 mobile: close to square but not exact, so this is a judgement call | merchant can change `tile_aspect_ratio` without code; if the built result reads visibly wrong against the mock, report rather than hard-coding another ratio |
| 8 | the mock's two tiles differ in darkness because of the photos, not different overlay values | `use_custom_scrim` (§5.2) covers it either way — raise the left tile's override if the build doesn't match |
| 9 | colours sampled from a compressed mock, so #D6C3B2, #3F3630 and the scrim alpha are approximate | all are merchant settings; if canonical brand hexes exist in `config/settings_schema.json` or an existing button, prefer those and note the substitution |

## 13. Progress checklist
- [ ] 1 Create the section file with its schema
- [ ] 2 Build the box tree markup
- [ ] 3 Emit setting-driven values as inline CSS custom properties
- [ ] 4 Apply grid and tile geometry with Tailwind utilities
- [ ] 5 Apply media and scrim
- [ ] 6 Style the content stack and heading
- [ ] 7 Style the button at rest
- [ ] 8 Add the hover fill-sweep animation
- [ ] 9 Add focus-visible, active and reduced-motion states
- [ ] 10 Handle empty and overflow content
- [ ] 11 Add the section instance to the homepage
- [ ] 12 Rebuild Tailwind and verify the purge kept everything
- [ ] §11 verification pass complete, including the 1684px and 385px reference comparisons
