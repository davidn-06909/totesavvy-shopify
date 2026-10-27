---
project: header-hero
status: active
created: 2026-07-25
branch: dev
scale: desktop 1.00 (1845px box, ±4px) | mobile 1.00 (426px, ±3px)
decisions:
  - Design is authoritative on the hero serif heading.
  - "When I have the header" = ON HOVER.
  - Mobile "lower image is clipped" = the logo; D01/D02 fixes both viewports.
  - Nav labels, "D" avatar, cart badge, social platform set = admin/session data, out of scope.
  - rgb(182,166,151) is a HOVER colour, not resting.
---

> Written from images Codex cannot see, without reading code. Verify each **Locate** before editing. If code doesn't match, stop and report.

## 1. Objective

Match the transparent header, transparent hero, and mobile drawer to the design. Add 9 hover/scroll/menu behaviours. Make hero button 2's background a theme setting.

## 2. Scale

Desktop: build 1862px (incl. 17px scrollbar) = 1845px box = design. Ratio 1.00, tol ±4px.
Mobile: build 426px, design 427px. Ratio 1.00, tol ±3px.
All values below are design-space px — apply directly. Sub-tolerance noise already removed. *Probable* = read off a screenshot; prefer an existing theme token if one is within tolerance.

## 3. Differences (23)

| ID | Area | Property | Design | Built | Delta | Sev | Conf | Src |
|---|---|---|---|---|---|---|---|---|
| D01 | header-logo | width | 128px | 197px | −69px | Blocker | Certain | Both |
| D02 | header-logo | overflow | whole, ~27px tall | clipped mid-glyph | remove clip | Blocker | Certain | Both |
| D06 | hero-title | font-family | high-contrast serif | grotesque sans | sans→serif | Blocker | Certain | Mine |
| M01 | drawer-close | colour | black, ~x360 y23, 14px | white on white = invisible | white→black | Blocker | Probable | Both |
| M02 | drawer-nav | child items | 5 under SHOP ALL, sentence case, 40px pitch, **no indent** (17px, same as parent) | none, flat list | add level | Blocker | Certain | Mine |
| M03 | drawer-nav | chevron | down collapsed / up open, right-aligned x365, 12px | none | add | Blocker | Certain | Mine |
| D04 | header-icons | right inset | 45px | 212px | −167px | Major | Probable | Mine |
| D05 | header-cart | glyph | open cart outline | closed tote shape | replace | Major | Certain | Both |
| D07 | hero-title | letter-spacing | ORGANIZATION=545px | 484px | +61px width | Major | Probable | Mine |
| D08 | hero-btn-2 | background | blush = same as btn 1 | translucent grey | match btn 1 | Major | Certain | Both |
| D09 | hero-btn-2 | text colour | dark = same as btn 1 | white | match btn 1 | Major | Certain | Mine |
| D10 | hero-block | y position | subtext 438, btns 472 | 450 / 493 | ~−20px | Major | Probable | Mine |
| M04 | drawer-social | container | rounded square | circle | reshape | Major | Probable | Mine |
| D03 | header | logo→nav gap | 54px | 46px | +8px | Minor | Probable | Mine |
| D11 | hero-block | left offset | 60px | 44px | +16px | Minor | Probable | Mine |
| D12 | hero-btn | size | 147×42 | 132×39 | +15w +3h | Minor | Probable | Mine |
| D13 | hero-subtext | font-size | string 226px | 240px | −6% | Minor | Probable | Mine |
| M06 | drawer-nav | top-level size | 15px | 13px | +2px | Minor | Probable | Mine |
| M07 | drawer-nav | left padding | 17px | 22px | −5px | Minor | Probable | Mine |
| M08 | drawer-rule | inset | 14px both | 8L / 10R | +6/+4px | Minor | Probable | Mine |
| M09 | drawer-panel | width | 386px | 380px | +6px | Minor | Probable | Mine |
| M10 | drawer-header | zone height | 45px | 38px | +7px | Minor | Probable | Mine |
| M11 | drawer-footer | LOG IN left | 17px | 22px | −5px | Minor | Probable | Mine |

**D08/D09: no literal hex.** Read btn 1's current background + text colour, apply to btn 2.
**D06: serif already exists** — the "Featured *collections*" heading elsewhere on the page uses it. Reuse; don't add a webfont.

## 4. Behaviours (user-reported, not visible in statics)

| ID | Trigger | Result |
|---|---|---|
| B01 | desktop header hover | background → `#FFFFFF` |
| B02 | desktop header hover | nav links → black |
| B03 | desktop header hover | logo → black |
| B04 | desktop header hover | all icons → black (**gift included**) |
| B05 | scroll down | **logo** shrinks; header height stays constant (currently the whole header shrinks — wrong) |
| B06 | mega-menu open | panel anchors to the item that opened it (currently position:fixed, always same spot) |
| B07 | theme editor | hero btn 2 background is a merchant setting |
| B08 | mobile header hover | hamburger + gift icons → black |
| B09 | drawer link hover | → `rgb(182,166,151)`; resting colour unchanged |

All hover states revert on leave.

## 5. Verified matching — do NOT touch

Nav row y (96) · hero cap height (47px) and line-height (80px) — **family+tracking only, never font-size** · hero button gap (8px) · hero subtext copy/colour · background photo, crop, focal point · drawer row pitch (68/69, in tol) · social icon spacing (35px) · drawer scrim · drawer sizes to content, not viewport height · footer order (LOG IN then socials).

**Out of scope — admin/session data, not defects:**
- Nav labels (AIR JORDAN/ASICS/… vs SHOP ALL/BAG ORGANIZERS/…) — Shopify menu set in admin. Never hard-code labels.
- Account icon "D" avatar vs person outline — logged-in vs logged-out.
- Cart "8" badge vs none — cart contents.
- Social platforms (X/FB/IG vs IG/Pinterest/YT/TikTok) — theme settings. Only the **container shape** (M04) is code.

## 6. Files (all *expected* — verify first)

`sections/header.liquid` · `snippets/transparent-header.liquid` · `snippets/mega-menu.liquid` · `snippets/menu-drawer.liquid` · `snippets/nav-tree.liquid` · `assets/header.js` · `sections/hero-transparent.liquid` · `src/tailwind/components/transparent-header-hero.css` · `src/tailwind/index.css` (only if a new layer is needed)

## 7. Rules

- B07 is the only new setting. Default = btn 1's value (D08). No invented hex.
- Setting-driven colours = **inline style**, not Tailwind arbitrary values (runtime classes get purged).
- M02: render children from `link.links` on the same linklist. Do **not** duplicate content into the DOM.
- M01: the close button **exists**. Recolour it; don't add a second.
- B05: keep the existing listener/easing; retarget header-height → logo-size.
- Run `pnpm.cmd run tw:build` after any `src/tailwind/` change.

## 8. Steps

### `sections/header.liquid`

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 1 | D01, D02 | logo img/`image_tag` + any wrapper `max-height`/`height`/`overflow` | cap at 128px wide unscrolled; remove the vertical clip (likely a fixed-height wrapper w/ hidden overflow) | 128px wide, no glyph cut at any edge |
| 2 | D04 | container wrapping search/account/gift/cart | header goes near-full-bleed so rightmost icon edge lands 45px from viewport right. Don't move centred logo or nav | rightmost icon 45px from right; logo+nav stay centred |
| 3 | D03 | vertical space between logo row and nav row | 46 → 54px | 54px centre-to-centre; nav stays y96 |
| 4 | D05 | cart icon SVG | swap closed tote for open cart outline (body, handle, 2 wheels), stroked not filled, same stroke weight + box as search/gift | reads as a cart, optically same size as neighbours |

### `snippets/transparent-header.liquid`

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 5 | B01 | transparent-header wrapper + existing state class / Alpine binding | hover → `#FFFFFF`, leave → transparent. **Drive steps 6–8 off this same state** so all four flip together | hover anywhere in header turns it white |
| 6 | B02 | nav link colour in transparent state | white → black under step 5 | black + readable through the transition |
| 7 | B03 | logo colour treatment (filter / 2nd image / currentColor SVG) | → black under step 5 | black on white, no flash of wrong asset |
| 8 | B04 | search/account/**gift**/cart colour rules | → black under step 5 | all four black |

### `assets/header.js`

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 9 | B05 | scroll handler changing header height | hold header height constant; retarget to logo size. Keep existing easing/duration | logo shrinks, header height fixed; back to top restores 128px |

### `snippets/mega-menu.liquid`

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 10 | B06 | dropdown panel position rule (currently fixed) | anchor to the triggering item; give the trigger a positioning context. Clamp inside viewport at 1845px rather than overflowing right | different items open the panel in different places, none overflow |

### `sections/hero-transparent.liquid`

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 11 | D06 | hero heading font-family; then the serif used by "Featured collections" | apply that existing serif. **Do not change font-size** | serif renders, cap height unchanged (~47px) |
| 12 | D07 | hero heading letter-spacing | widen until ORGANIZATION = 545px. Apply **after** step 11 — the serif supplies part of that width; measure, then add only the shortfall | ORGANIZATION 545px ±4 |
| 13 | D10 | hero text block vertical position | up ~20px → subtext y438, btns y472. Move as a unit, don't re-space internals | subtext 438 ±4, btns 472 ±4 |
| 14 | D11 | hero block left offset/padding | 44 → 60px. Heading, subtext, buttons share one left edge | all three at 60px |
| 15 | D12 | hero button padding + label size | 132×39 → 147×42 via padding/font. **No fixed width** — labels stay fluid. Keep the 8px gap | 147×42 ±4, gap 8px |
| 16 | D08, D09 | `SHOP THIS` bg + text rules, and `SHOP ALL`'s values | copy btn 1's bg and text colour onto btn 2; drop translucent grey + white text | the two buttons differ only by label |
| 17 | B07 | `{% schema %}` in this section | add colour setting for btn 2 bg, default = step 16's value. Bind as inline style. Must not affect btn 1 | editor live-updates btn 2 only |
| 18 | D13 | hero subtext font-size | −6% so the string measures 226px | 226px ±4 |

### `snippets/menu-drawer.liquid` (+ `nav-tree.liquid` if it delegates)

| # | Fixes | Locate | Change | Acceptance |
|---|---|---|---|---|
| 19 | M01 | close/X control top-right (white on white) | colour black; ~x360 y23 in a 386px drawer, 14px glyph | visible on the white panel, closes drawer |
| 20 | M02 | drawer menu loop — does it descend into `link.links`? | render level 2 under items with children: sentence case, 40px pitch, **17px left edge, no indent**. No rules between children; one rule below the group | expandable item reveals children at 40px pitch, 17px aligned |
| 21 | M03 | row markup from step 20 | right-aligned chevron x365, 12px, on rows **with** children only — down collapsed, up open. Wire `aria-expanded`. No chevron on Bundles & Gifts, ACCESSORIES, TOTES & BAGS | chevrons only on expandable rows, flip on toggle |
| 22 | M04 | social icon containers in drawer footer | circle → rounded square. Keep 35px spacing + size. **Don't change which platforms are linked** | rounded squares, spacing unchanged |
| 23 | M06 | top-level drawer link font-size | 13 → 15px; children keep step 20's size | 15px, row pitch still 69 ±3 |
| 24 | M07, M08, M11 | link left padding, rule insets, LOG IN offset | text 22→17px, LOG IN 22→17px, rules 8L/10R → 14px both | all text shares a 17px left edge; rules 14px |
| 25 | M09 | drawer panel width | 380 → 386px at 426px viewport. Use the existing basis — don't hard-code if currently a % | 386px ±3 |
| 26 | M10 | space above the first rule | 38 → 45px so the close button clears it | first rule y45 ±3 |
| 27 | B08 | mobile header icon colours | hamburger + gift → black on header hover (mirrors step 8) | both black on hover |
| 28 | B09 | drawer link colour rules | hover → `rgb(182,166,151)`. **Resting unchanged** | hover taupe, unhovered dark |

**Traceability:** D01–D13 + M01–M04, M06–M11 (23) and B01–B09 (9) each appear in exactly one step. None unassigned, none doubled.

## 9. Regression

- **Viewports** — step 1 is the only cross-viewport change (intentional: fixes the mobile clipped logo). Re-check mobile header with drawer closed. Check step 2 at ~768px so icons don't run off.
- **States** — steps 5–8 add black-on-white; any nav/icon colour also used in `:focus-visible`, `:active`, or open-mega-menu needs the same treatment or it clashes. Step 28 must not override step 19's black close button.
- **Shared styles** — if the cart glyph (4) or social shape (22) is a shared snippet, other templates change too: confirm or scope. Same if steps 23/24 hit a shared link utility instead of a drawer-scoped rule.
- **Settings** — step 17 is new, so existing stores take the default. If btn 1's bg is already a setting, point step 17 at the same source; don't hard-code over it.
- **Overflow** — step 15 keeps buttons fluid. Step 20 children must wrap, not truncate, at 386px. Step 12's wider tracking: confirm a longer heading still wraps to 2 lines without hitting the header.
- **Empty** — no logo → step 1 leaves no 128px empty box. No children → step 21 renders no chevron, not an empty one. No socials → footer collapses. Empty subtext → step 18 reserves no space.
- **Multiple instances** — two heroes on one page must not collide on step 17's setting id.
- **Contrast** — step 16 puts dark text on blush: check AA. Step 14 moves white hero text over a light region of the bag photo: re-check.
- **Editor** — step 17 live-updates without reload; steps 20–21 survive reordered blocks / swapped linklist.

## 10. Verification

1. `pnpm.cmd run tw:build`
2. `shopify theme check` (interactive)
3. Recapture at **1845px** vs desktop mock — confirm D01–D13 by ID
4. Recapture at **426px**, drawer open, vs mobile mock — confirm M01–M11 by ID
5. Walk all 9 behaviours by hand: header hover in/out, scroll down + back to top, mega menu from ≥3 different items, mobile header hover, drawer link hover
6. Confirm section 5 unchanged — especially nav labels, account icon, cart badge
7. Load a page using the header but **not** the transparent hero; confirm step 2 didn't break it

## 11. Assumptions — ask, never guess

- D04 is caused by a constrained header container. If it's explicit padding instead, fix that — not both.
- The drawer delegates to `nav-tree.liquid`. If it renders inline, steps 20–21 stay in `menu-drawer.liquid`.
- A serif exists in the theme. If none is configured, **stop and ask** — don't add a webfont.
- Btn 1's colours are readable from code. If btn 1 is itself setting-driven with no static default, ask what seeds step 17.
- The mobile close button exists in markup. If step 19 finds no control at all, it must be **added**, not recoloured — report, it changes scope.
- `rgb(182,166,151)` covers drawer links only. Ask if desktop nav hover should match — the user specified it under mobile.