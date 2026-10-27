---
project: transparent-header-hero
status: active
created: 2026-07-25
branch: dev
source_prompt: |
  Hey. This image is design. You have to make the plan about this image. First of all, there is a title and subtide two and two buttons. When I click the button, the page should be redirected to the collection all page. the url should be setted in the theme settings. When I click the mega menu the dropdonw will open. but the dropdown type is like the tree mega-menu dropdown. you can see the dropdown layout in the second image. and the text content part should located center and left part. as u can see, the header background state is transparent. when I hover the header, the header should have white background with smooth aniamtion I think the animation type should be fade-in or fade-out. when I scroll down, the header has got white background with smooth animation and the logo image should be curtailed with smooth animation. third image is mobile design and first image is desktop design. the text content part should locate bottom and left. make the plan
  [follow-up] This is mobile mega-menu image
decisions:
  menu_source: Shopify linklist (3 levels)
  header_file: Modify the existing header section
  mobile_scope: Full drawer, accordion pattern per mock 4
  button_urls: Section settings on the hero, NOT config/settings_schema.json
reference_widths: {desktop_mock: ~1900px, mobile_mock: ~425px}
---

This plan was written without reading the code. Verify each **Locate** before editing. If the code doesn't match, stop and report — don't improvise.

All px values are measured off the mocks at the reference widths above: close, not authoritative. Build to them; don't substitute your own judgement for a written number.

## 1. Objective

Make the site header a transparent overlay on the hero that fades to white on hover and on scroll (logo shrinking on scroll only), with a 3-level tree mega menu from the Shopify linklist — two-column flyout on desktop, left slide-in accordion drawer on mobile. Add a new hero section: background image, two-line title, subtitle, two buttons with merchant-editable labels and URLs. Centre-left on desktop, bottom-left on mobile. Every visual value is a schema setting defaulting to the measured value; the merchant has no developer.

## 2. Scope

**In:** transparent→white header fade (hover + scroll), logo shrink, desktop mega panel, mobile drawer (slide, accordion, close, LOG IN, socials), new hero section, adding it to `templates/index.json`, a11y + reduced motion + theme-editor behaviour.

**Out:** cart/search/account drawers (icons move position only, behaviour untouched), footer, product/collection templates, images or promo cards inside the mega panel, restructuring the merchant's admin menu content.

## 3. Layout spec

### 3A. Desktop box tree

```
header-root                    (<header>, fixed; NOT inside hero-root)
├── header-bg                  (white layer that fades in)
├── header-inner
│   ├── header-row-top → header-logo
│   └── header-row-nav → nav-list → nav-item (×n)
│                                   ├── nav-link
│                                   └── mega-panel
│                                       ├── mega-col-1 → mega-row-1 (×n)
│                                       └── mega-col-2 → mega-row-2 (×n)
└── header-icons               (search / account / gift / cart)

hero-root
├── hero-media → hero-image
├── hero-scrim
└── hero-content
    ├── hero-title
    ├── hero-subtitle
    └── hero-actions → hero-btn-1, hero-btn-2
```

### 3B. Desktop per-box table

| Box | Position | Anchors | Size | Inner layout | Padding/margin | z | Overflow |
|---|---|---|---|---|---|---|---|
| `header-root` | fixed; context for bg/icons/nav | `top:0; left:0; right:0` | w 100%; h auto (≈140px top, ≈96px scrolled) | flow | 0 | 100 | visible (panel must escape) |
| `header-bg` | absolute → `header-root` | `inset:0` | fills parent | — | 0 | 0 | hidden |
| `header-inner` | relative; context for `header-icons` | in flow | w 100%; max-w 1600px; margin-inline auto | flex col, gap 14px, align center | `30px 60px 22px` | 1 | visible |
| `header-row-top` | static | in flow | w 100%; h auto | flex row, justify center, align center | 0 | 1 | visible |
| `header-logo` | static | in flow | h 34px→24px scrolled; w auto | inline-flex, align center | 0 | 1 | hidden |
| `header-row-nav` | static | in flow | w 100%; h auto | flex row, justify center | 0 | 1 | visible |
| `nav-list` | static | in flow | w auto (≈705px at 1900px — content-driven, don't fix) | flex row, gap 28px, align center | 0 | 1 | visible |
| `nav-item` | **relative — context for `mega-panel`** | in flow | auto | flow | padding-block 6px | 1 | visible |
| `nav-link` | static | in flow | auto | inline-flex | 0 | 1 | visible |
| `mega-panel` | absolute → `nav-item` | `top: calc(100% + 22px); left: 0` (see note) | w auto; min-w 250px; h auto | flex row, gap 0, align stretch | 0 | 90 | visible |
| `mega-col-1` | static | in flow | w 250px | flex col, gap 0 | `10px 0 12px` | 91 | visible |
| `mega-row-1` | relative | in flow | w 100%; h 30px | flex row, align center, justify space-between | `0 30px` | 91 | visible |
| `mega-col-2` | static | in flow | w 250px | flex col, gap 0 | `10px 0 12px` | 91 | visible |
| `mega-row-2` | static | in flow | w 100%; h 30px | flex row, align center | `0 30px 0 27px` | 91 | visible |
| `header-icons` | absolute → `header-inner` | `top:30px; right:60px` | w auto; h 24px | flex row, gap 24px, align center | 0 | 2 | visible |
| `hero-root` | **relative — context for all hero children** | in flow, first section | w 100%; h `100svh` (setting); min-h 600px | flow | 0 | 0 | hidden |
| `hero-media` | absolute → `hero-root` | `inset:0` | fills parent | flow | 0 | 1 | hidden |
| `hero-image` | static | fills `hero-media` | 100%/100%; `object-fit:cover`; `object-position:center` (setting) | — | 0 | 1 | hidden |
| `hero-scrim` | absolute → `hero-root` | `inset:0` | fills parent | — | 0 | 2 | hidden |
| `hero-content` | absolute → `hero-root` | `left:42px; top:50%; translateY(-50%)` | w auto; max-w 660px | flex col, align flex-start | 0 | 3 | visible |
| `hero-title` | static | in flow | max-w 620px | — | `0 0 30px` | 3 | visible |
| `hero-subtitle` | static | in flow | max-w 520px | — | `0 0 26px` | 3 | visible |
| `hero-actions` | static | in flow | w auto | flex row, gap 8px, wrap, align center | 0 | 3 | visible |
| `hero-btn-1/2` | static | in flow | w auto (content-driven; mock 144/155px); h 44px | inline-flex centred | `0 30px` | 3 | visible |

**Panel anchoring note.** In mock 2 the panel's left edge is x≈600 while the hovered item sits further right — i.e. aligned to `nav-list`'s left edge, not the item. Expose `mega_panel_align` (`item` | `nav-start`, default `nav-start`); with `nav-start` the rendered left edge must land on the nav list's left edge. **Top offset:** header bottom y≈140, first row centre y≈164; `calc(100% + 22px)` lands ≈140. Adjust the 22px only if the built header height differs — the panel must sit flush with the header's bottom edge, with **no gap** (a gap breaks hover intent).

### 3C. Stacking order (bottom → top)

`hero-media`(1) → `hero-scrim`(2) → `hero-content`(3) → `header-root`(100, own stacking context: `header-bg` 0 → inner/nav 1 → `header-icons` 2 → `mega-panel` 90–91) → `drawer-scrim`(190) → `drawer-panel`(200).

**Codex lookup:** find the highest z-index used by existing cart/search overlays; the header at 100 must sit below them. If 190/200 collides, shift the drawer pair above and record the new numbers.

### 3D. Mobile / tablet — deltas only

Breakpoints: **1024px** (desktop nav + mega above; hamburger + drawer below) and **768px** (hero centred above; bottom-anchored below). Tablet 768–1023px = mobile header + desktop hero at reduced type.

| Box | Desktop | Below 1024px |
|---|---|---|
| `header-inner` | flex col, 2 rows, `30px 60px 22px` | flex **row**, h 64px, `justify-content: space-between`, align center, padding `0 14px` |
| `header-row-nav` + all descendants | visible | `display:none` (not rendered to AT) |
| `header-logo` | centred in its row | `absolute; left:50%; translateX(-50%)` → `header-inner`; h 18px→15px scrolled |
| `header-icons` | absolute, 4 icons, gap 24 | static right cluster: **search + cart only**, gap 26px, 20px icons |
| `header-mobile-left` *(new)* | — | static left cluster: hamburger + gift, flex row, gap 26px, 20px icons |
| `hero-content` | `top:50%; translateY(-50%); left:42px` | <768px: `top:auto; bottom:48px; left:22px; right:22px; transform:none`; max-w none |

**Added below 1024px:**

```
drawer-scrim
drawer-panel
├── drawer-close
├── drawer-list → drawer-row (×n)
│                 ├── drawer-row-label
│                 ├── drawer-row-toggle        (only when children exist)
│                 └── drawer-sublist → drawer-subrow → drawer-subsublist
└── drawer-footer → drawer-login, drawer-socials
```

| Box | Position | Anchors | Size | Inner layout | Padding/margin | z | Overflow |
|---|---|---|---|---|---|---|---|
| `drawer-scrim` | fixed | `inset:0` | viewport | — | 0 | 190 | hidden |
| `drawer-panel` | fixed; context for `drawer-close` | `top:0; left:0` | w `88.7vw`, max 400px; h **auto** (≈515px in mock); `max-height:100dvh` | flex col, gap 0 | 0 | 200 | `auto` on Y past max-height |
| `drawer-close` | absolute → `drawer-panel` | `top:12px; right:10px` | 44×44 hit area; 16px glyph | inline-flex centred | 0 | 201 | visible |
| `drawer-list` | static | in flow | w 100% | flex col, gap 0 | `47px 0 0` (clears ✕) | 200 | visible |
| `drawer-row` | static | in flow | w 100%; min-h 68px | flex row, align center, space-between; wraps so sublist gets its own line | `0 12px` + border-top | 200 | visible |
| `drawer-row-toggle` | static | right end of row | 44×44 hit area; 14px glyph | inline-flex centred | 0 | 200 | visible |
| `drawer-sublist` | static | full row width, below label | w 100%; h 0→auto | grid, `grid-template-rows: 0fr→1fr` | padding-inline-start 24px | 200 | **hidden** (enables the animation) |
| `drawer-subrow` | static | in flow | w 100%; min-h 44px | flex row, align center, space-between | `0 12px 0 0` | 200 | visible |
| `drawer-footer` | static | last child of panel | w 100%; h 57px | flex row, align center, space-between | `0 12px` + border-top | 200 | visible |
| `drawer-socials` | static | in flow | w auto | flex row, gap 14px, align center | 0 | 200 | visible |

**Markup vs CSS.** Two fixed-width side-by-side columns vs nested in-place accordions is not one tree restyled — both must exist in the HTML because the breakpoint is CSS-only. Avoid duplicated *maintenance* by putting the recursion in **one** snippet, `snippets/nav-tree.liquid`, taking `link` + `variant` (`mega` | `drawer`); both callers pass the same linklist. A11y: the drawer copy is `aria-hidden` + `inert` while closed, and the desktop nav is `display:none` below 1024px (removed from the a11y tree). Never both exposed at once.

## 4. Element measurements

Hex unless alpha given. Tablet = desktop where omitted.

### Header

| Element | Property | Desktop ≥1024 | Mobile <1024 |
|---|---|---|---|
| `header-bg` | background, top state | `rgba(255,255,255,0)` | same |
| `header-bg` | background, hover/scrolled | `#FFFFFF` + `box-shadow: 0 1px 0 rgba(0,0,0,0.06)` | same |
| `header-root` | height top / scrolled | 140px / ≈96px | 64px / 64px |
| `header-inner` | padding top / scrolled | `30px 60px 22px` / `18px 60px 14px` | `0 14px` |
| `header-logo` | height top / scrolled | 34px / 24px (≈160px wide at 34px) | 18px / 15px (≈100px wide) |
| `nav-link` | type | 14px / 400 / lh 1.2 / ls `0.06em` / uppercase | — |
| `nav-link` | colour top → hover/scrolled | `#FFFFFF` → `#1A1A1A` | — |
| `nav-link` | hover | underline, offset 4px, thickness 1px | — |
| `nav-list` | gap | 28px | — |
| icons | size / gap | 20px (24px box) / 24px | 20px / 26px |
| icons | colour top → solid | `#FFFFFF` → `#1A1A1A` | same |

### Desktop mega panel

`mega-panel`: bg `#FFFFFF`, `box-shadow 0 12px 28px rgba(0,0,0,0.10)`, radius 0. Columns 250px each, `mega-col-2` `border-left: 1px solid #EDE9E5`, padding-block 10px top / 12px bottom. Rows 30px; `mega-row-1` padding-inline 30px, `mega-row-2` `0 30px 0 27px`. Labels 13px / 400 / ls `0.05em` / uppercase / `#1A1A1A`; hover+active adds underline at offset 3px. `mega-row-1` chevron: right-pointing, 10px wide, 1.4px stroke, `#55504B`, flush to the 30px padding (x≈822 in mock). Open: opacity 0→1 + `translateY(-6px→0)`, 220ms `cubic-bezier(0.22,0.61,0.36,1)`. Close: opacity 1→0, 160ms `ease-out`, then `visibility:hidden`.

### Mobile drawer

| Element | Property | Value |
|---|---|---|
| `drawer-scrim` | background | `rgba(0,0,0,0.35)` |
| `drawer-panel` | bg / width / shadow | `#FFFFFF` / `88.7vw` max 400px / `0 0 40px rgba(0,0,0,0.12)` |
| `drawer-close` | glyph / colour | 16px, 1.5px stroke / `#1A1A1A` |
| `drawer-row` | min-h / border-top | 68px / `1px solid #E5E1DD`, inset 10px each side (pseudo-element or `margin-inline`; row bg stays full-bleed) |
| `drawer-row-label` | type | 15px / 400 / ls `0.04em` / uppercase / padding-inline-start 12px |
| `drawer-row-label` | colour closed / open | `#1A1A1A` / `#A8A19A` |
| `drawer-row-toggle` | chevron | down, 14px, 1.5px stroke, `#1A1A1A`; open = `rotate(180deg)` 220ms ease |
| `drawer-subrow` | min-h / type | 44px / 13px, ls `0.04em`, uppercase, `#55504B` |
| `drawer-sublist` | indent | 24px |
| `drawer-footer` | h / border-top | 57px / `1px solid #E5E1DD` |
| `drawer-login` | type | 13px, uppercase, ls `0.05em`, `#1A1A1A` |
| `drawer-socials` | icons / gap | 22px circular 1px outline, `#1A1A1A` / 14px |
| panel | slide in / out | `translateX(-100%→0)` 320ms `cubic-bezier(0.22,0.61,0.36,1)` / reverse 260ms `cubic-bezier(0.55,0,0.55,0.2)` |
| scrim | fade | opacity 0→1 240ms `ease-out` / out 200ms `ease-in` |
| accordion | expand | `grid-template-rows: 0fr→1fr` 260ms `cubic-bezier(0.22,0.61,0.36,1)` |

### Hero

| Element | Property | Desktop ≥768 | Mobile <768 |
|---|---|---|---|
| `hero-root` | height | `100svh`, min 600px | `100svh`, min 520px |
| `hero-scrim` | background | `linear-gradient(to right, rgba(0,0,0,0.28) 0%, transparent 55%)` | `linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 60%)` |
| `hero-content` | offset | `left:42px`, v-centred | `left:22px; right:22px; bottom:48px` |
| `hero-title` | family | theme heading serif — **Codex lookup** for the token | same |
| `hero-title` | size | 72px (tablet 768–1023: 54px) | 34px |
| `hero-title` | 400 / lh / ls / transform | lh 1.15 / ls `0.02em` / uppercase | lh 1.18 / same |
| `hero-title` | colour / align / shadow | `#FFFFFF` / left / `0 1px 24px rgba(0,0,0,0.28)` | same |
| `hero-title` | margin-bottom | 30px | 18px |
| `hero-subtitle` | size / weight / lh / ls | 17px (tablet 16px) / 400 / 1.5 / 0 | 13px / 400 / 1.5 / 0 |
| `hero-subtitle` | colour / margin-bottom | `#FFFFFF` / 26px | `#FFFFFF` / 16px |
| `hero-actions` | gap | 8px | 8px |
| buttons | h / padding-inline / size | 44px / 30px / 13px | 38px / 24px / 12px |
| buttons | weight / ls / transform / radius | 400 / `0.12em` / uppercase / 0 | same |
| `hero-btn-1` | bg / colour / border / hover | `#F9E4E4` / `#1A1A1A` / none / `#F2D6D6` | same (no hover on touch) |
| `hero-btn-2` | bg / colour / border / hover | `rgba(255,255,255,0.10)` / `#FFFFFF` / `1px solid rgba(255,255,255,0.75)` / bg `rgba(255,255,255,0.22)` | same |
| buttons | transition / focus-visible | `background-color 200ms ease, border-color 200ms ease` / `2px solid #FFFFFF`, offset 2px | same |

## 5. Settings map

### 5A. Header section settings (`sections/header.liquid` schema)

| id | type | default | drives |
|---|---|---|---|
| `menu` | link_list | `main-menu` | source for nav-list, mega-panel, drawer-list |
| `enable_transparent` | checkbox | true | whether `header-bg` starts transparent |
| `transparent_templates` | text | `index` | comma-separated templates using the transparent state; elsewhere solid from load |
| `bg_color_solid` | color | `#FFFFFF` | `header-bg` solid |
| `text_color_transparent` | color | `#FFFFFF` | nav/icons/logo, top state |
| `text_color_solid` | color | `#1A1A1A` | nav/icons/logo, solid state |
| `bg_fade_duration` | range 100–800/20 ms | 300 | `header-bg` opacity, both directions |
| `scroll_threshold` | range 0–300/10 px | 40 | where `atTop` flips |
| `logo_height_top` / `_scrolled` | range 16–80 / 12–60 px | 34 / 24 | logo height, desktop |
| `logo_height_mobile_top` / `_scrolled` | range 10–40 px | 18 / 15 | logo height, mobile |
| `logo_shrink_duration` | range 100–800/20 ms | 300 | logo height transition |
| `header_padding_top` / `_scrolled` | range 0–80 / 0–60 px | 30 / 18 | `header-inner` padding-top desktop |
| `header_padding_bottom` | range 0–60/2 px | 22 | `header-inner` padding-bottom |
| `header_padding_inline` | range 0–120/4 px | 60 | `header-inner` gutters desktop |
| `header_height_mobile` | range 48–96/2 px | 64 | `header-inner` <1024 |
| `nav_font_size` | range 10–20 px | 14 | `nav-link` |
| `nav_letter_spacing` | range 0–0.2/0.01 | 0.06 | `nav-link` em |
| `nav_gap` | range 8–64/2 px | 28 | `nav-list` |
| `icon_size` / `icon_gap` | range 14–32 / 8–48 px | 20 / 24 | header icons |
| `show_gift_icon` / `show_account_icon` | checkbox | true / true | icon visibility |
| `transparent_topbar_scrim` | range 0–60 % | 22 | permanent top gradient behind the fading white layer (see §9 Contrast) |

### 5B. Mega menu

| id | type | default | drives |
|---|---|---|---|
| `mega_enable` | checkbox | true | render `mega-panel` at all |
| `mega_panel_align` | select `item`/`nav-start` | `nav-start` | panel left anchoring (§3B note) |
| `mega_col_width` | range 180–360/10 px | 250 | both columns |
| `mega_row_height` | range 22–48 px | 30 | rows |
| `mega_row_font_size` | range 10–18 px | 13 | row labels |
| `mega_row_letter_spacing` | range 0–0.2/0.01 | 0.05 | row labels em |
| `mega_padding_inline` | range 8–60/2 px | 30 | `mega-row-1` |
| `mega_padding_block` | range 0–40/2 px | 10 | column padding-top (bottom = +2) |
| `mega_bg_color` / `mega_text_color` / `mega_divider_color` | color | `#FFFFFF` / `#1A1A1A` / `#EDE9E5` | panel / labels / col-2 border |
| `mega_shadow_opacity` | range 0–30 % | 10 | panel shadow alpha |
| `mega_open_duration` / `mega_close_duration` | range 80–600/20 ms | 220 / 160 | panel appear / disappear |
| `mega_hover_close_delay` | range 0–500/20 ms | 180 | hover-intent grace |

### 5C. Mobile drawer

| id | type | default | drives |
|---|---|---|---|
| `drawer_width` / `drawer_max_width` | range 60–100 % / 280–520 px | 89 / 400 | panel size |
| `drawer_full_height` | checkbox | false | false = auto height (mock); true = `100dvh` |
| `drawer_bg_color` | color | `#FFFFFF` | panel |
| `drawer_scrim_opacity` | range 0–80/5 % | 35 | scrim alpha |
| `drawer_row_height` | range 44–96/2 px | 68 | `drawer-row` |
| `drawer_row_font_size` | range 12–22 px | 15 | row label |
| `drawer_row_letter_spacing` | range 0–0.2/0.01 | 0.04 | row label em |
| `drawer_text_color` / `drawer_text_color_open` | color | `#1A1A1A` / `#A8A19A` | label closed / open |
| `drawer_divider_color` / `drawer_divider_inset` | color / range 0–40/2 px | `#E5E1DD` / 10 | row + footer borders |
| `drawer_padding_inline` | range 0–40/2 px | 12 | row + footer |
| `drawer_subrow_height` / `drawer_subrow_indent` | range 32–72 / 0–48 px | 44 / 24 | level 2–3 |
| `drawer_open_duration` / `drawer_close_duration` | range 120–800/20 ms | 320 / 260 | slide |
| `drawer_accordion_duration` | range 80–600/20 ms | 260 | expand/collapse |
| `drawer_show_login` / `drawer_login_label` / `drawer_login_url` | checkbox / text / url | true / `Log in` / `/account/login` | footer left |
| `drawer_show_socials` | checkbox | true | footer right |

Social URLs come from the theme's existing social settings. **Codex lookup:** confirm the ids in `config/settings_schema.json`. If TikTok is missing, add `social_tiktok_link` (url, blank) to the **existing** social group — no new group. Each icon renders only when its URL is non-blank.

### 5D. Hero section settings (`sections/hero-transparent.liquid`)

| id | type | default | drives |
|---|---|---|---|
| `image` / `image_position` | image_picker / select top·center·bottom·left·right | none / center | `hero-image` |
| `height_desktop` / `height_mobile` | select `svh100`·`svh85`·`svh70`·`fixed` | svh100 / svh100 | `hero-root` |
| `height_desktop_fixed` / `height_mobile_fixed` | range 400–1000 / 320–900 px | 700 / 560 | used only when `fixed` |
| `title` | text (see §12.7) | `Luxurious Organization` | `hero-title` |
| `title_size_desktop` / `_tablet` / `_mobile` | range 28–120 / 24–90 / 18–60 px | 72 / 54 / 34 | title per breakpoint |
| `title_line_height` / `title_letter_spacing` | range 0.9–1.6 / -0.05–0.2 (0.01) | 1.15 / 0.02 | title |
| `title_uppercase` / `title_color` / `title_max_width` | checkbox / color / range 300–1000/10 px | true / `#FFFFFF` / 620 | title |
| `subtitle` | text | `If it has straps, we'll organize it.` | `hero-subtitle` |
| `subtitle_size_desktop` / `_mobile` / `subtitle_color` | range 12–32 / 10–24 px / color | 17 / 13 / `#FFFFFF` | subtitle |
| `gap_title_subtitle` / `gap_subtitle_actions` | range 0–80/2 px | 30 / 26 | desktop margins (×0.6 on mobile) |
| `button_1_label` / `button_1_url` | text / url | `Shop All` / `/collections/all` | btn 1 |
| `button_1_bg` / `button_1_text_color` | color | `#F9E4E4` / `#1A1A1A` | btn 1 |
| `button_2_label` / `button_2_url` | text / url | `Shop This` / `/collections/all` | btn 2 |
| `button_2_bg_opacity` / `button_2_text_color` | range 0–100/5 % / color | 10 / `#FFFFFF` | btn 2 bg alpha; text + border at 75% alpha |
| `button_height` / `button_height_mobile` | range 32–72 / 28–60 px | 44 / 38 | both buttons |
| `button_padding_inline` / `button_font_size` / `button_letter_spacing` / `button_radius` / `button_gap` | range | 30px / 13px / 0.12 / 0px / 8px | both buttons + `hero-actions` |
| `content_align_desktop` / `content_valign_desktop` | select left·center·right / top·middle·bottom | left / middle | `hero-content` ≥768 |
| `content_align_mobile` / `content_valign_mobile` | same | left / bottom | `hero-content` <768 |
| `content_offset_inline` / `_mobile` / `content_offset_block_mobile` | range 0–160 / 0–80 / 0–160 px | 42 / 22 / 48 | `hero-content` offsets |
| `content_max_width` | range 300–1200/20 px | 660 | `hero-content` |
| `scrim_direction` / `scrim_opacity` | select `to right`·`to top`·`none` / range 0–80/2 % | `to right` / 28 | scrim desktop |
| `scrim_direction_mobile` / `scrim_opacity_mobile` | same | `to top` / 38 | scrim mobile |

### 5E. Deliberately hard-coded

Easing curves (merchants can't reason about beziers; durations are the real control) · breakpoints 1024/768 (structural — they change what's exposed to AT) · z-index values (collision-critical) · `object-fit: cover` (anything else letterboxes a full-bleed hero; `object-position` is exposed instead) · focus-visible outline + 44px minimum hit areas (accessibility floor, must not be removable).

## 6. Files to change

| Path | Action | Why | Verified |
|---|---|---|---|
| `sections/header.liquid` | modify | all header states, bar layout, mega + drawer wiring, settings | **expected** — may be a header group or snippet |
| `snippets/nav-tree.liquid` | new | single source of the 3-level markup, `variant: mega\|drawer` | new |
| `snippets/mega-menu.liquid` | new | desktop panel wrapper | new |
| `snippets/menu-drawer.liquid` | new | drawer shell (scrim, panel, close, footer) | new |
| `sections/hero-transparent.liquid` | new | the hero section | new |
| header JS / Alpine entry | modify | `atTop`, `hovered`, `menuOpen`, `openMega`, `openAccordion` | **Codex lookup** — no second bundle |
| Tailwind CSS source | modify | component classes | **Codex lookup** — the file `tw:build` compiles |
| `assets/theme.css` | rebuilt artefact | output only, never hand-edited | verified (dirty in tree) |
| `templates/index.json` | modify | add hero first | verified (dirty in tree) |
| `locales/en.default.schema.json` | modify | setting labels if the theme localises them | **expected** |
| `config/settings_schema.json` | minimal | only if `social_tiktok_link` is missing | **expected** |

## 7. Task-specific rules

1. Setting-driven values are **inline styles / CSS custom properties, never Tailwind arbitrary values** — `top-[{{ setting }}px]` is purged at build and produces nothing. Emit a scoped `<style>` setting `--hero-title-size`, `--header-logo-h`, … and reference them from static classes.
2. One `<style>` block per instance, scoped by `#shopify-section-{{ section.id }}`. Two heroes must not fight over the same properties.
3. State lives in **one Alpine store**, not per-element `x-data`. Codex lookup: find the existing store registration, add a `header` store with `atTop`, `hovered`, `menuOpen`, `openMega` (index|null), `openAccordion` (array). Header root binds classes off it; panel and drawer read it. This is what makes hover-intent and Escape work without duplicated listeners.
4. Scroll listener is `{ passive: true }` + rAF-throttled, setting `atTop = scrollY <= threshold`. Never read layout in the raw callback.
5. **Don't animate `height` on `header-root`.** Animate `height` on `header-logo` and `padding` on `header-inner`; the header height follows. No `max-height` tricks.
6. `header-bg` is a **separate element animating `opacity`**, not a `background-color` transition — that's what makes it fade cleanly instead of crossing through a muddy midpoint, and it fades the shadow with it.
7. The transparent state is **template-conditional and computed in Liquid** (`request.page_type`), not JS — otherwise white nav text flashes on a white page.
8. Levels come from `linklists[…].links`, `link.links`, `link.links[n].links`. Shopify supports exactly three — don't attempt a fourth. Chevron renders only when `link.links.size > 0`.
9. `templates/index.json` is admin-managed and already dirty: read it, insert the section into `sections`, put its id first in `order`. Don't rewrite wholesale, don't reformat, preserve existing ids exactly.
10. `assets/theme.css` is generated — edit the Tailwind source and build. If the output diffs in unrelated ways, stop and report rather than committing noise.
11. `{{ block.shopify_attributes }}` on any block introduced; namespace all drawer/mega ids with `{{ section.id }}`.

## 8. Steps

Ordered so the theme is never broken between steps.

**1 — Audit the existing header and JS entry point.** *File:* none (read-only). *Locate:* the real header section (grep `"type": "header"` in `config/settings_data.json` / section JSON); `Alpine.store(` and `x-data` in `assets/`; the Tailwind config `content` globs; `social_` in `config/settings_schema.json`. *Change:* report header file path and current structure (rows, logo, icons, nav), Alpine entry + existing store names, Tailwind source path, social setting ids, current linklist setting id, highest z-index in use. **Edit nothing.** *Acceptance:* the report exists; if the header is split across a group or snippets, state exactly which file holds which part before continuing.

**2 — Add the header schema settings.** *File:* `sections/header.liquid`. *Locate:* `{% schema %}` → `settings`. *Change:* add every setting from §5A–5C under `header` separators "Appearance", "Transparent & scroll", "Mega menu", "Mobile drawer". Keep existing settings intact. Ids exactly as written — later steps reference them. *Acceptance:* theme check passes, new groups appear in the editor and persist; no visual change.

**3 — Emit header CSS custom properties.** *File:* `sections/header.liquid`. *Locate:* top of the file, before markup. *Change:* scoped `<style>` mapping each §5A–5C setting to a custom property on the header root (`--hd-logo-h-top`, `--hd-fade-ms`, `--mega-col-w`, `--drawer-w`, …). Colours emit hex, ranges emit number+unit, `%` alphas emit a 0–1 decimal for `rgb(… / var(--x))`. Rule 7.1 applies. *Acceptance:* devtools shows every property at its §5 default; nothing renders differently.

**4 — Build the header state store.** *File:* the Alpine entry from Step 1. *Locate:* existing `Alpine.store(` calls. *Change:* register the `header` store per rule 7.3 with its actions; wire the passive rAF scroll listener (rule 7.4) reading the threshold from a `data-` attribute; add an Escape handler clearing `openMega` and `menuOpen`; make registration idempotent under editor re-renders. *Acceptance:* `Alpine.store('header')` reports correct `atTop` at top and after scrolling; Escape clears both flags.

**5 — Restructure the header markup.** *File:* `sections/header.liquid`. *Locate:* the current header root, logo, nav and icon markup. *Change:* rebuild to the §3A tree — `header-root` (fixed, store bindings, `@mouseenter`/`@mouseleave` → `hovered`), `header-bg`, `header-inner`, `header-row-top`+logo, `header-row-nav`+`nav-list`, `header-icons`. **Move existing icons, don't rewrite them** — preserve cart count, search trigger, account href. Apply §3B geometry via Step 3 properties; compute the transparent/solid initial state in Liquid (rule 7.7). The header is now fixed, so add whatever body/main offset the theme needs on non-transparent templates. *Acceptance:* homepage header is transparent with white text and centred logo; a product page is solid from first paint with no content hidden beneath. No mega menu yet.

**6 — Background fade and logo shrink.** *File:* `sections/header.liquid` + Tailwind source. *Locate:* `header-bg`, `header-logo`. *Change:* `header-bg` `opacity: 0` at top, `1` when `hovered || !atTop`, over `--hd-fade-ms` `ease-out`; text/icon colours cross-fade over the same duration; `header-logo` height goes top→scrolled over `--hd-logo-ms` on `!atTop` only (**hover must not shrink the logo**); `header-inner` padding likewise; shadow appears in the solid state. *Acceptance:* hover at top fades white in and back out with the logo unchanged; scrolling past 40px keeps it white and shrinks the logo; returning to top restores both. Smooth in both directions, no jump.

**7 — Build the shared nav-tree snippet.** *File:* `snippets/nav-tree.liquid` (new). *Change:* accept `linklist`, `variant`, `section_id`. `mega`: emit `mega-col-1` rows (label + chevron when children) plus the `mega-col-2` row list for each, structured so the panel can show column 2 for the hovered column-1 row. `drawer`: emit the §3D nested structure. Toggle/chevron only when `link.links.size > 0`. Namespace every id with `section_id` + index; set `aria-current="page"` from `link.active`/`link.child_active`. *Acceptance:* both variants produce correct nesting against the merchant's real menu, with no chevrons on childless items. Unstyled is fine here.

**8 — Render and style the desktop mega panel.** *File:* `snippets/mega-menu.liquid` (new) + `sections/header.liquid` + Tailwind source. *Locate:* the `nav-item` loop from Step 5. *Change:* inside each `nav-item` with children, render `mega-panel` calling `nav-tree` with `variant: mega`; style to §4 via Step 3 properties (two 250px columns, 30px rows, 13px uppercase labels, chevrons, divider, shadow, `mega_panel_align`). Column 2 shows the hovered/focused column-1 row's children, defaulting to the **first** column-1 row that has children — that's why the mock shows BAG ORGANIZERS underlined with children already visible. Active row gets the underline. *Acceptance:* hovering a top-level item opens a panel flush under the header with both columns populated; hovering another column-1 row swaps column 2; matches mock 2 at 1900px.

**9 — Wire mega menu interaction.** *File:* `sections/header.liquid` / Alpine entry. *Locate:* `openMega` and the `nav-item` elements. *Change:* `mouseenter` sets `openMega` to the index; `mouseleave` on the nav area clears it after `mega_hover_close_delay`, cancelled on re-entry. Keyboard: `Enter`/`Space` toggles, `aria-expanded` reflects state, Escape closes and returns focus to the trigger, Tab past the last panel link closes. Closed panels are `visibility: hidden` + `pointer-events: none`, never merely transparent. Click-outside closes. Opening one closes any other. *Acceptance:* mouse, keyboard and touch all work; a closed panel is neither tabbable nor announced; no dead gap between item and panel that closes it mid-travel.

**10 — Mobile bar layout.** *File:* `sections/header.liquid` + Tailwind source. *Locate:* `header-inner`, `header-icons`, logo. *Change:* apply the §3D deltas below 1024px — 64px single row, `space-between`, new `header-mobile-left` (hamburger + gift), search + cart right, absolutely centred logo at mobile heights, `header-row-nav` hidden entirely. Hamburger toggles `menuOpen` with `aria-expanded`, `aria-controls` → drawer panel id, and an accessible label. *Acceptance:* at 425px matches mock 3 — hamburger + gift left, centred wordmark, search + cart right, white over the hero, 64px tall.

**11 — Drawer shell.** *File:* `snippets/menu-drawer.liquid` (new) + Tailwind source, rendered once from the header. *Change:* build `drawer-scrim` + `drawer-panel` per §3D/§4 — 88.7vw max 400px, auto height ending after the footer, white, left-anchored, ✕ at top 12 / right 10 with a 44px hit area, `drawer-list` 47px top padding. Animate slide + scrim per §4. On open: lock body scroll without jumping, trap focus, focus the ✕; on close: return focus to the hamburger. `inert` + `aria-hidden` when closed. *Acceptance:* tapping the hamburger slides the panel in over a dimmed page; ✕, scrim tap and Escape all close and restore focus; the page behind doesn't scroll; nothing inside a closed panel is tabbable.

**12 — Drawer accordion rows.** *File:* `snippets/menu-drawer.liquid` + `snippets/nav-tree.liquid` + Tailwind source. *Locate:* the `drawer` variant output. *Change:* style `drawer-row` to §4 — 68px min-height, inset hairlines, 15px uppercase labels at 12px inset, chevron toggles right with 44px hit areas. Expand/collapse via `grid-template-rows: 0fr→1fr` over `drawer_accordion_duration`; rotate chevron; switch label to `drawer_text_color_open`. Level 3 nests identically. **The label stays a real link and the chevron is a separate hit target** — tapping the label navigates, tapping the chevron expands. `aria-expanded` + `aria-controls` on each toggle. *Acceptance:* at 425px matches mock 4 — six rows, chevrons on exactly SHOP ALL / BAG ORGANIZERS / CLEAR POUCHES / TRAVEL, hairlines inset 10px. Expanding animates, greys the label, rotates the chevron and pushes the footer down; collapsing reverses. Multiple rows may be open.

**13 — Drawer footer.** *File:* `snippets/menu-drawer.liquid`. *Locate:* end of `drawer-panel`. *Change:* `drawer-footer` — 57px, top hairline, `drawer_login_label` → `drawer_login_url` left, up to four 22px circular social icons right at 14px gap, each rendered only when its URL is non-blank (§5C), each with an accessible name and `target="_blank" rel="noopener"`. *Acceptance:* matches the mock; removing a social URL removes exactly that icon and the row stays right-aligned; disabling socials leaves LOG IN alone.

**14 — Create the hero section and schema.** *File:* `sections/hero-transparent.liquid` (new), matching the conventions of an existing section found in Step 1. *Change:* build the §3A hero tree with the full §5D settings plus a `presets` entry "Hero — transparent". Emit settings as scoped custom properties (rules 7.1–7.2). Use `image_url` + `image_tag` with responsive `srcset`, `loading="eager"`, `fetchpriority="high"` (it is the LCP element) and explicit width/height to avoid CLS. Buttons are `<a>`; a blank label renders no button. *Acceptance:* addable from the editor, every setting present at its §5D default and live-updating the preview.

**15 — Lay out the hero content column.** *File:* `sections/hero-transparent.liquid` + Tailwind source. *Locate:* `hero-content`. *Change:* apply §3B — absolute inside `hero-root`, driven by `content_align_desktop`/`content_valign_desktop` (left/middle → `left:42px; top:50%; translateY(-50%)`) and the mobile pair below 768px (left/bottom → `left:22px; right:22px; bottom:48px`). Apply `hero-scrim` with both direction/opacity pairs. Set `content_max_width` and `title_max_width` so the title wraps to two lines at the default size. *Acceptance:* at 1900px the block is vertically centred, left edge 42px in, title on two lines; at 425px it sits bottom-left, 22px in, 48px up.

**16 — Hero typography and buttons.** *File:* `sections/hero-transparent.liquid` + Tailwind source. *Locate:* `hero-title`, `hero-subtitle`, `hero-actions`. *Change:* apply every §4 hero row via custom properties — three title sizes, lh, ls, uppercase, colour, text-shadow, both gaps, both button variants including hover, focus-visible and the mobile size drop. URLs default to `/collections/all`. *Acceptance:* matches mock 1 at 1900px and mock 3 at 425px; both buttons reach `/collections/all` out of the box and follow their settings when changed; focus is clearly visible.

**17 — Add the hero to the homepage.** *File:* `templates/index.json`. *Change:* per rule 7.9, add one `hero-transparent` entry with the mock's defaults and place its id **first** in `order`; leave everything else byte-identical. Read the current (dirty) contents before writing. *Acceptance:* the hero renders first with the header overlaying it; every pre-existing section keeps its original order.

**18 — Reduced motion, contrast, a11y pass.** *File:* Tailwind source + all new markup. *Locate:* every transition from Steps 6, 8, 11, 12, 16. *Change:* add `@media (prefers-reduced-motion: reduce)` dropping every duration in this feature to 1ms and removing slide/translate transforms (state changes become instant but keep their end state). Verify white text over the hero meets 4.5:1 with the default scrim; if not, raise `scrim_opacity`'s default rather than changing the text colour. Confirm tab order: skip-link → hamburger/nav → logo → icons → hero buttons. *Acceptance:* reduced motion opens/closes instantly and correctly; both hero text elements and the transparent-state nav measure ≥4.5:1; tab order is logical with no traps outside the drawer.

**19 — Build and verify.** *Locate:* the `tw:build` script in `package.json`. *Change:* run `pnpm.cmd run tw:build`, then `shopify theme check`; work through §11 and report each result. *Acceptance:* build succeeds, no new theme-check offences, every §11 check passes or is reported failing with detail.

## 9. Every state and edge case

### Interactive states

| Element | Default | Hover | Focus-visible | Active | Open | Closed |
|---|---|---|---|---|---|---|
| `header-root` | transparent, white text | white bg + dark text over `bg_fade_duration` | — | — | stays white while any menu is open | returns to transparent only if `atTop` |
| `nav-link` | per state colour | underline offset 4px | 2px outline in current text colour, offset 3px | as hover | `aria-expanded=true`, underline persists | `aria-expanded=false` |
| `mega-row-1` | `#1A1A1A` | underline offset 3px + col-2 swaps | outline + col-2 swaps | as hover | active row keeps underline | — |
| `mega-panel` | hidden | — | — | — | opacity 1, visible, `pointer-events:auto` | opacity 0, `visibility:hidden`, `pointer-events:none` |
| hamburger | white/dark icon | 70% opacity | 2px outline offset 2px | 50% opacity | `aria-expanded=true` | `aria-expanded=false` |
| `drawer-row-label` | `#1A1A1A` | underline | outline offset 2px | 60% opacity | `#A8A19A` | `#1A1A1A` |
| `drawer-row-toggle` | chevron down | 70% opacity | outline | — | rotated 180° | rotation 0 |
| `hero-btn-1` | `#F9E4E4`/`#1A1A1A` | `#F2D6D6` | 2px white outline offset 2px | darken `#EBCACA` (no scale) | — | — |
| `hero-btn-2` | `rgba(255,255,255,.10)`, white 75% border | bg `.22` | 2px white outline offset 2px | bg `.30` | — | — |

Disabled states: none of these controls has one. A button with a blank **label** doesn't render; a blank **URL** falls back to `/collections/all`.

### Motion

Every transition, its duration setting and easing is listed in §4 (header fade 300ms `ease-out`/`ease-in`; text colour 300ms; logo height + header padding 300ms `ease-out`; mega open 220ms / close 160ms; drawer slide 320/260ms; scrim 240/200ms; accordion 260ms; chevron 220ms; buttons 200ms). Under `prefers-reduced-motion: reduce` **all** become 1ms with translate/slide transforms removed — state still changes, instantly, landing in the same end state.

### Empty content

| Case | Behaviour |
|---|---|
| No hero image | theme placeholder SVG at the same `object-fit: cover`; scrim and text still render legibly. Never an empty coloured box |
| Blank `title` | not rendered; subtitle becomes first, top offset unaffected (the gap lives on the title's margin-bottom) |
| Blank `subtitle` | not rendered; title's margin-bottom collapses to `gap_subtitle_actions` so buttons don't drift |
| Blank button label | that button doesn't render; both blank → `hero-actions` doesn't render, no stray gap |
| Blank button URL | falls back to `/collections/all` — never `href=""` |
| `menu` empty / linklist missing | nav-list and drawer-list render nothing, the hamburger isn't rendered at all, header still shows logo + icons. No empty white panel |
| Top-level link with no children | no chevron, no panel, no toggle — a plain link |
| Column-1 row with no children | no chevron; hovering it **clears** col-2 rather than leaving stale content; the panel narrows to one column |
| All socials blank | `drawer-socials` not rendered; LOG IN alone, left-aligned |
| Login off + socials blank | `drawer-footer` not rendered; the panel ends after the last row with no orphaned border |

### Overflow content

| Case | Behaviour |
|---|---|
| Title 3× longer | wraps within `title_max_width`, capped by `content_max_width`; no truncation, no horizontal overflow; `overflow-wrap: anywhere` so one long word can't overflow. On mobile it wraps within the 22px insets and grows upward from the bottom anchor — acceptable |
| Long subtitle | wraps within 520px desktop / full column mobile. No clamp |
| Long button label | button grows; `hero-actions` wraps so button 2 drops to its own line rather than overflowing |
| Many nav items | at 1024–1279px reduce `nav_gap` to 18px and `nav_font_size` to 13px rather than wrapping to two lines; below 1024 the drawer takes over |
| Mega column with 15+ children | `max-height: calc(100vh - header height - 40px)` + `overflow-y: auto` per column so the panel never runs off-screen |
| Drawer taller than viewport | `max-height: 100dvh` + `overflow-y: auto`; verify the ✕ stays reachable on a very long menu — if it scrolls away, make `drawer-close` sticky to the panel top |
| Long drawer label | wraps to two lines, row grows past 68px, chevron stays vertically centred |

### Breakpoints

| Width | Header | Hero |
|---|---|---|
| ≥1280 | full desktop: two rows, centred nav, mega panel, 60px gutters | title 72px, centred-left at 42px |
| 1024–1279 | desktop header, `nav_gap` 18px, `nav_font_size` 13px, gutters 40px | title 72px — verify at 1024px it doesn't wrap to three lines; if it does, use 54px |
| 768–1023 | mobile bar + drawer, logo at mobile heights | desktop layout, v-centred, title 54px, subtitle 16px |
| 480–767 | mobile bar | mobile layout, bottom-left, title 34px |
| <480 | mobile bar, drawer still 88.7vw | verify "ORGANIZATION" fits one line at 320px; if not, `clamp()` bounded by `title_size_mobile` |

### Multiple instances

Header is a singleton but **is** re-rendered by the editor: namespace ids with `{{ section.id }}`, keep store registration idempotent, and attach the scroll listener once at document level (or remove and re-add) so editor re-renders don't stack listeners. Two heroes on one page: all custom properties scoped to `#shopify-section-{{ section.id }}`, all ids namespaced — verify by adding a second hero with different settings. Two open mega panels are impossible by construction (`openMega` holds one index).

### Keyboard and screen reader

Tab order: skip-link → hamburger (mobile) / first nav link (desktop) → remaining nav links → logo → header icons → hero button 1 → button 2 → page content. Mega triggers carry `aria-expanded` + `aria-controls`; `Enter`/`Space` opens, Escape closes and returns focus, Tab past the last link closes; closed panels are `visibility: hidden` so they leave the a11y tree. Drawer: focus moves to ✕ on open, is trapped in the panel, Escape closes and returns focus to the hamburger, `inert` + `aria-hidden` when closed. Accordion toggles are `<button>`s with `aria-expanded`/`aria-controls`; collapsed sublists are `hidden`/`inert`, never zero-height with tabbable links inside. Every icon-only control gets a visually-hidden label (Search, Account, Rewards, Cart, Open menu, Close menu); the cart count is `aria-live="polite"`. The header keeps `role="banner"`; the desktop nav and drawer nav get distinct `aria-label`s ("Main" / "Mobile main"). `aria-current="page"` on the matching link in whichever nav is exposed.

### Contrast

Hero text is white over photography, so `hero-scrim` is mandatory with a light text colour: defaults `to right rgba(0,0,0,0.28)→transparent 55%` (desktop) and `to top rgba(0,0,0,0.38)` (mobile), plus the title's `text-shadow` as a second layer. Verify ≥4.5:1 against the real image at both breakpoints in Step 18; if it fails, raise `scrim_opacity`'s default rather than changing the text colour. The transparent-state nav has the same risk over a light image top band — mitigate with a permanent `linear-gradient(to bottom, rgba(0,0,0,0.22), transparent)` **behind** the fading white layer, exposed as `transparent_topbar_scrim` (default 22%). Solid state is `#1A1A1A` on `#FFFFFF` = 16.9:1, passes.

### Theme editor

Hero is addable via `presets` and renders correctly with no image chosen. Every setting drives a custom property in a section-scoped `<style>` that re-renders with the section, so colour/size/spacing/alignment/duration changes apply without reload. Reordering: the hero has no positional dependency — moving it means the header overlays whatever is now first, which is expected and controlled by `transparent_templates`. The store registration and scroll listener must survive `shopify:section:load` — re-init header bindings on that event rather than assuming a full page load. `shopify:section:select`/`deselect` should open/close the mega panel and drawer **for preview only**, never leaving them stuck open on the storefront. `shopify_attributes` on any block introduced (this plan uses section settings only).

## 10. Do NOT touch

`sections/footer.liquid` + footer snippets (out of scope; social settings are read, not modified) · all templates other than `index.json` (they inherit the header, which must stay visually identical there apart from being fixed) · `config/settings_data.json` (merchant data; the editor writes it) · `config/settings_schema.json` except the single `social_tiktok_link` addition if genuinely missing · cart/search/account drawer code (their triggers move position; markup, behaviour and JS stay byte-identical) · `assets/theme.css` by hand (generated) · existing Alpine stores (add one, don't rename/merge/refactor) · `AGENTS.md` (untracked, user-owned).

## 11. Verification

**Build.** (1) `pnpm.cmd run tw:build` succeeds; the `assets/theme.css` diff contains only new header/mega/drawer/hero rules. (2) `shopify theme check` run interactively — no new offences versus baseline.

**Desktop at 1900px.** (3) Homepage top: transparent header, white centred wordmark, white nav, four icons 60px from the edge; compare with mock 1 — title left edge 42px, two lines, subtitle, two buttons. (4) Hover: white fades in ~300ms, text darkens, **logo size unchanged**; leaving fades back. (5) Hover BAG ORGANIZERS: panel flush under the header, two 250px columns, 30px rows, col-2 pre-filled, active row underlined — compare with mock 2. (6) Hover across col-1 rows: col-2 swaps with no flicker and no panel jump. (7) Scroll past 40px: permanently white, logo 34→24px, padding tightens, shadow appears, all smooth; scrolling back fully reverses. (8) Both buttons land on `/collections/all`; changing `button_2_url` in the editor is followed.

**Mobile at 425px.** (9) Compare mock 3: 64px transparent bar, hamburger + gift left, centred wordmark, search + cart right; hero text bottom-left 22px in / 48px up; 34px title on two lines. (10) Tap hamburger, compare mock 4: ≈377px panel, ✕ top-right, six 68px rows, chevrons on exactly four rows, hairlines inset 10px, LOG IN + four socials. (11) Expand/collapse a row: smooth height animation, chevron rotates, label greys, footer moves; a second row can open alongside. (12) Close via ✕, scrim tap and Escape — all three work and return focus to the hamburger.

**Accessibility.** (13) Desktop keyboard-only: open the mega menu, tab through, Escape out, reach both hero buttons — focus visible at every stop. (14) Mobile keyboard-only: open drawer, confirm focus trap, expand a row with Enter, Escape out. (15) Screen-reader spot check: closed panel and closed drawer are not announced; `aria-expanded` reads correctly. (16) With `prefers-reduced-motion`: every open/close is instant and lands correctly.

**Regression.** (17) Product and collection pages: header solid from first paint, no white-on-white, no content hidden under the fixed header, cart/search/account triggers work and the cart count is correct. (18) A second hero section renders independently with different settings and no id collisions. (19) Slow connection reload: no flash of the wrong header state.

## 12. Assumptions & open questions

1. **The header is a single `sections/header.liquid`.** If Step 1 finds a header group or split snippets, adjust every file reference and report before continuing.
2. **Alpine.js is the JS layer with an existing store file.** If the theme is vanilla JS or Web Components, implement the same state model in that idiom — do **not** introduce Alpine. Report the choice.
3. **Tailwind compiles via `pnpm run tw:build` into `assets/theme.css`.** If the pipeline differs, use the real one and report it; still never hand-edit generated CSS.
4. **The merchant's menu already has three populated levels.** If only two, one column renders — correct behaviour, not a bug. Report so they can populate level 3.
5. **The panel aligns to the nav list's left edge, not the hovered item** (mock 2: panel x≈600, hovered item further right). `mega_panel_align` exposes both — a preference change needs no code.
6. **Mock 3's buttons look dark while mock 1 shows button 1 pale pink** — assumed the same two variants over a darker photo region, not a separate mobile treatment. If a distinct mobile style is wanted, add `button_1_bg_mobile` / `button_1_text_color_mobile` — **ask first**.
7. **`title` is a `text` setting** (plain uppercase wrapping naturally across two lines). If a forced break or mixed styling is needed, switch to `richtext` and strip the wrapping `<p>` — ask before changing the type post-launch, since it changes saved data.
8. **The grey BAG ORGANIZERS row in mock 4 is the open/expanded state**, not disabled. If it's meant to be a current-section indicator, the same colour setting binds to `link.child_active` instead — ask.
9. **Mock 4 shows little or no page dimming; `drawer_scrim_opacity` still defaults to 35%** because an undimmed scrim reads as a rendering bug on a light page. Set 0–10% for the mock's look — no code change.
10. **Drawer level-2/3 styling is in no mock.** The §4 values (44px rows, 13px labels, 24px indent, `#55504B`) are derived for consistency with level 1. Re-measure and update the defaults if a mock arrives.
11. **The scrolled header keeps two rows with tighter padding** — no mock shows it. A single-row scrolled header is a layout change, not a setting: ask before building it.
12. **Hero button URLs live on the section**, per the approved decision. Do not move them to `config/settings_schema.json`.
13. **The gift icon is an existing rewards feature with a working link.** If no such link exists, default `show_gift_icon` to `false` and omit it — report rather than inventing a destination.

## 13. Progress checklist

- [ ] 1 Audit header + JS entry point
- [ ] 2 Header schema settings
- [ ] 3 Header CSS custom properties
- [ ] 4 Header state store
- [ ] 5 Header markup restructure
- [ ] 6 Background fade + logo shrink
- [ ] 7 Shared nav-tree snippet
- [ ] 8 Desktop mega panel
- [ ] 9 Mega menu interaction
- [ ] 10 Mobile bar layout
- [ ] 11 Drawer shell
- [ ] 12 Drawer accordion rows
- [ ] 13 Drawer footer
- [ ] 14 Hero section + schema
- [ ] 15 Hero content column layout
- [ ] 16 Hero typography + buttons
- [ ] 17 Add hero to templates/index.json
- [ ] 18 Reduced motion, contrast, a11y
- [ ] 19 Build + verify
