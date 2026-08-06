# Design System Visual Refresh (Direction A)

**Date:** 2026-08-07
**Status:** Draft — pending user review
**Branch:** `023-design-refresh` (worktree, based on `022-docs-refresh`)
**Scope:** Apply the "Direction A" design system (delivered as `design-tokens.css`,
`design-reference.dc.html`, `README.md` handoff doc) to the live site's existing
structure, without changing layout, DOM structure, component boundaries, or
interactive behavior.

---

## Problem

The site has a working, tested, production design system (`src/styles/design-system.css`)
but its visual language (Bebas Neue + fluid-clamp type, charcoal/cream palette,
10px gallery gap, percentage-based container widths) is being replaced with a new
one designed externally in Claude Design: Oswald + Lora, a warmer near-black/paper
oklch palette with a single gold accent, an 8px spacing scale, a 1440px/64px grid,
and a tighter, flush masonry gallery (Direction A — the preferred of two documented
directions; Direction B is not in scope).

The two systems must be reconciled deliberately: the new material is a **visual**
spec (color, type, spacing, grid **values**), not a structural one — it was
designed against placeholder image slots in an unrelated component format, not
against this site's actual header/footer/gallery/viewer/about-page components,
their DOM, their tests, or their responsive/interactive behavior (scroll-hide
header, swipe/keyboard lightbox, dark-mode persistence, view transitions, etc.).
This spec defines how to bring the two together: reskin without rebuilding.

## Goals

- Every current page (home/gallery, about, 404) reads as the new Direction A
  visual language: palette, type, spacing, grid, masonry density.
- Zero DOM restructuring, zero component API changes, zero interaction/behavior
  changes. Existing tests (contract/UI/a11y/performance) continue to pass
  unmodified — they assert behavior and structure, not token values, so this is
  achievable without touching test files.
- Design tokens are refreshed **in place**: existing token *names* remain the
  stable contract consumed by ~9 CSS files; only *values* change, plus a small
  number of net-new tokens for concepts the old system didn't have (hairline
  border color, toggle fill).
- All changes land through the existing `.worktrees/` isolation pattern this repo
  already uses, as a feature-tier spec → plan → TDD-appropriate implementation.

## Non-Goals (explicitly deferred — see "Out of Scope" below)

- Moving the theme toggle from footer to header nav.
- Full-bleed edge-to-edge mobile gallery (current mobile gallery is inset inside
  `.page-container`; the reference mock shows it flush, which requires escaping
  the container — a structural change).
- Replacing the SVG logo with a text wordmark.
- Adding a "Work" nav link (current IA has no separate work/home split — gallery
  *is* the homepage).
- Direction B (terracotta/Space Grotesk alternate) — not requested, not built.

---

## Current State (inventory)

| Area | File(s) | Notes |
|---|---|---|
| Tokens | `src/styles/design-system.css` | Semantic names: `--color-primary/secondary/accent/pure/interactive(-hover)`, `--font-header/navigation/body/caption`, `--text-xs…4xl` (fluid `clamp()`), `--space-xs…4xl`, `--transition-*` |
| Fonts | `src/styles/fonts.css` + `index.html`/`about.html` `<link>` | Local Bebas Neue (`.ttf`, self-hosted) for display; Google Fonts Playfair Display + Inter + Lora |
| Header | `src/components/header/` | Fixed, scroll-hide/show, SVG logo (light/dark variants swapped via CSS), nav = **About only**, mobile hamburger overlay, `aria-current` underline already implemented |
| Footer | `src/components/footer/` | Copyright + version + **Dark Room / Light Box** theme toggle (toggle lives here, not in header) |
| Gallery | `src/components/uniform-gallery/` | **Actually used on the homepage.** Row-based justified masonry — already the same algorithm family as the new spec. Mobile switches to natural-aspect single column. |
| Gallery (dead) | `src/components/gallery/` (`masonry-gallery`) | Column-based masonry, imported in `main.ts` but **not used in any `.html`** — pre-existing dead code, unrelated to this refresh |
| Viewer | `src/components/image-viewer/` | Full-screen lightbox: close/prev/next, counter, `object-fit: contain`, **keyboard (←/→/Esc) and swipe already implemented** — ahead of what the reference mock shows |
| About | `src/components/about-page/` | Hero grid (image + text), responsive breakpoints — structurally close to the new About screen already |
| Container width | `.page-container` in `design-system.css` | Percentage-based: 88% mobile/tablet, 92% desktop (≥840px) — **not** the new spec's fixed 1440px/64px model |
| Tests | `tests/**` | No hardcoded color/font-family assertions found — a values-only token refresh does not break the suite |
| Visual regression | — | None exists (one Playwright e2e spec, no screenshot testing) — this refresh needs a manual/Playwright-driven visual QA pass per breakpoint × theme, not automated snapshot diffing |

---

## Decisions (confirmed with user before drafting this spec)

1. **Theme toggle stays in the footer.** Re-skin the existing footer toggle with
   new tokens/copy; do not move it into the header nav.
2. **Masonry gap = 4px desktop / 2px mobile**, per `design-tokens.css`
   (`--masonry-gap` / `--masonry-gap-mobile`, in its shared-scale section),
   treating that file as the authoritative machine-readable source over the
   README's stale "16px" prose.
3. **Keep the fluid `clamp()` type system**; recalibrate each existing token's
   preferred/max endpoints toward the new fixed scale's rungs (13/16/20/28/44/72)
   at the desktop breakpoint. Do not switch to fixed px sizes — that would change
   responsive behavior, not just values.
4. **Adopt the new grid formula**: `max-width: 1440px` with fixed horizontal edge
   padding (24px mobile → 64px desktop), replacing the current 88%/92%
   percentage-based `.page-container` width. This changes computed widths at
   various viewports but is still a pure CSS formula swap on an existing
   container — no new elements, no DOM move. **This does not include** making
   the gallery full-bleed on mobile (see Non-Goals) — that specific mobile
   gallery behavior stays exactly as it is today.

---

## Token Mapping

### Strategy

Keep every existing custom-property **name** (`--color-primary`, `--font-header`,
etc.) as the stable API the 9 component CSS files and tests already depend on.
Change only the **values** to the Direction A palette/type, and add a small
number of **new** tokens for concepts Direction A introduces that the old system
had conflated or omitted (hairline border vs. general tint; toggle fill). This
is the mechanism that keeps "structure" and "design" separable: nothing that
consumes `var(--color-primary)` needs to know its value changed.

### Color

| Token | Current (light / dark) | New value (light / dark) | Source |
|---|---|---|---|
| `--color-primary` | `#2C2C2C` / `#E5E5E5` | `oklch(0.16 0.004 60)` / `oklch(0.95 0.003 60)` | `--a-color-ink` / demo `theme_.fg` |
| `--color-secondary` | `#6B6B6B` / `#B8B8B8` | `oklch(0.45 0.005 60)` / `oklch(0.65 0.005 60)` | `--a-color-stone` / `-dark` |
| `--color-pure` | `#FFFFFF` / `#2A2A2A` | `oklch(0.99 0.002 80)` / `oklch(0.24 0.005 60)` | `--a-color-paper` / `--a-color-ink-dark` |
| `--color-accent` | `#F8F6F3` (both roles: tint + border) | `oklch(0.95 0.003 60)` / `oklch(0.30 0.005 60)` *(derived — see Assumptions)* | fills the "subtle surface tint" role (loading placeholders, hover fills) now that borders move to `--color-line` |
| `--color-interactive` | `#B8860B` / `#D4AF37` | `oklch(0.72 0.15 85)` (same both themes) | `--a-color-gold` |
| `--color-interactive-hover` | `#9A7209` / `#F0C14B` | derived: ~8% darker L in light mode, ~8% lighter L in dark mode *(see Assumptions)* | no direct spec equivalent |
| **`--color-line`** *(new)* | — | `oklch(0.9 0.003 60)` / `oklch(0.28 0.004 60)` | `--a-color-line` / `-dark` — hairline borders (header/footer/about-page rules), split out from `--color-accent` |
| **`--color-toggle-bg`** *(new)* | — | `oklch(0.24 0.005 60)` / `oklch(0.95 0.003 60)` | `--a-color-toggle-bg-light/dark` — footer toggle button fill (softened ink-dark tone, not pure ink, per design intent) |

All dark-mode values continue to live under the existing `[data-theme="dark"]`
selector block — no change to the dark-mode mechanism, FOUC-prevention script,
or `localStorage`/cross-tab sync in `footer.ts`.

### Typography

- `--font-header` and `--font-navigation`: `'Bebas Neue', 'Playfair Display', 'Times New Roman', serif` / `'Bebas Neue', 'Inter', ...` → **`'Oswald', sans-serif`** (both tokens converge on the same family, matching the spec's single display font).
- `--font-body`: stays **`'Lora', 'Georgia', serif'`** — unchanged. This is the one family Direction A and the current system already share.
- `--font-caption`: `'Inter', 'Helvetica Neue', sans-serif` → **`'Lora', serif`**. Direction A specifies exactly two families (Oswald + Lora); mapping caption/meta text (footer copyright, error/loading fallback text) onto Lora rather than keeping a third family (Inter) matches that intent and drops a font-loading dependency. *(Flagged in Assumptions — this is a visible tone change for small UI text, not just a value swap.)*
- **Heading treatment**: Direction A's README defines Oswald's role explicitly as "nav, labels, headings — 600–700, uppercase, tracked +0.02–0.1em." Current `h1`–`h3` use `--font-header` at `--weight-regular` (400), sentence case, no tracking. Since Oswald's Google Fonts load only includes weights 500/600/700 (400 isn't part of the spec), headings need: weight 400 → 600/700, add `text-transform: uppercase`, add `letter-spacing`. **This is a real, visible change to every page's headings** (About hero heading, 404 heading) — calling it out plainly rather than burying it as an incidental value swap.
- **Font loading**: replace the Google Fonts `<link>` in `index.html`/`about.html`
  (currently `Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Lora:wght@300;400;500`)
  with `Oswald:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400` — adds
  the italic axis Lora currently lacks (needed if any pull-quote/bio-style italic
  treatment is used). Remove the local Bebas Neue `@font-face` rules in
  `fonts.css` and the `<link rel="preload">` for `BebasNeue-Regular.ttf` in both
  HTML entry points once Oswald is confirmed in place. The `.ttf` files under
  `public/fonts/` can be deleted as a follow-up cleanup (not required for the
  refresh to function — dead weight, not breakage, if left in place).
- **Type scale recalibration**: keep all `--text-*` tokens as fluid `clamp()`
  values (per Decision 3). At implementation time, nudge each token's
  *preferred/max* endpoint toward the nearest Direction A rung
  (13/16/20/28/44/72px) without changing its *min* endpoint or its vw-scaling
  behavior — e.g. `--text-lg` (currently 18–20px, used for the About summary and
  `h5`) moves its max toward the 20px "md" rung; `--text-4xl` (currently 40–48px)
  moves toward the 44px "xl" rung. Exact per-token values are a plan/implementation
  detail, not a spec-level decision — the rule is "same tokens, same responsive
  mechanism, retargeted endpoints."

### Spacing & Grid

- Existing `--space-*` scale already lines up closely with the new 8px-multiple
  scale (`sm`=8, `md`=16, `lg`=24, `xl`=32, `2xl`=48, `3xl`=64px all already
  match). Add one new token, **`--space-5xl: 8rem`** (128px), for the one rung
  the new scale has that the old one doesn't (large section padding).
- Add **`--grid-max-width: 90rem`** (1440px) and **`--grid-gutter: 1.5rem`**
  (24px) tokens.
- Change `.page-container`, `.header__container`, `.footer__container` from
  `width: var(--page-width-full/constrained)` (88%/92%) to:
  `width: 100%; max-width: var(--grid-max-width); margin-inline: auto; padding-inline: <responsive edge padding>`
  where edge padding steps from `--space-lg` (24px) at mobile to `--space-3xl`
  (64px) at the existing ≥52.5rem (840px) breakpoint already used for the
  current width switch — reusing the breakpoint that's already there rather than
  introducing a new one.
- `--page-width-full`/`--page-width-constrained` tokens become unused once this
  lands; remove them rather than leaving orphaned tokens.

### Masonry Gallery

- Add `--masonry-gap: 4px` / `--masonry-gap-mobile: 2px` tokens (per Decision 2).
  Update `uniform-gallery.css`'s `.uniform-gallery { gap: ... }` to use
  `--masonry-gap-mobile` by default and switch to `--masonry-gap` at the
  existing `>36rem` breakpoint already present in that file. Leave the legacy
  `--gallery-gap` (10px) token in place but understand it becomes consumed only
  by the dead `gallery.css` (see Out of Scope / cleanup below).
- Row target height: `uniform-gallery.ts`'s `getLayoutParams()` currently tiers
  300/360/420px by container width. Direction A specifies a flat 250px target.
  Recommend flattening the desktop/tablet tiers toward 250px (retune the three
  existing breakpoint constants rather than removing the tiering structure) —
  a numeric tuning change to an existing parameterized function, not a
  structural change to the layout algorithm.
- **Gap/layout-math coupling**: `uniform-gallery.ts` has its own
  `LAYOUT_GAP = 10` constant, passed into `computeRows()` for the row
  width/height math — it is **not** read from the CSS `--gallery-gap` custom
  property. The CSS `gap` on `.uniform-gallery` and this JS constant must be
  changed together (`LAYOUT_GAP` → `4`, matching the new desktop
  `--masonry-gap`) or the row math will compute widths against a gap the
  browser isn't actually rendering, causing rows to not quite fill the
  container width. Mobile is unaffected — `applyLayout()` bypasses
  `computeRows()` entirely below `MOBILE_BREAKPOINT` (576px).

---

## Component-by-Component Change List

| File | Change type | Summary |
|---|---|---|
| `src/styles/design-system.css` | Values + new tokens | Color/font/spacing/grid token values per above; add `--space-5xl`, `--grid-max-width`, `--grid-gutter`, `--masonry-gap(-mobile)`, `--color-line(-dark)`, `--color-toggle-bg`; retune `--text-*` clamp endpoints; new `.page-container` width formula; heading rules gain uppercase/tracking/weight |
| `src/styles/fonts.css` | Removal | Delete Bebas Neue `@font-face` declarations |
| `index.html`, `about.html` | Values | Swap Google Fonts `<link>` (Oswald + Lora w/ italic); remove Bebas Neue preload `<link>`; update `<meta name="theme-color">` to the new ink hex equivalent |
| `src/components/header/header.css` | Values only | Border/underline/nav-link colors → new tokens; border-bottom source `--color-accent` → `--color-line`; container width formula follows the shared `.page-container` change |
| `src/components/footer/footer.css` | Values + new token | Border → `--color-line`; toggle button fill → new `--color-toggle-bg` token (replacing the current `--color-primary`/`--color-pure` inversion trick, per the design's explicit "softened, not pure ink" intent); copy casing "Dark Room"/"Light Box" → "Dark room"/"Light box" |
| `src/components/uniform-gallery/uniform-gallery.css` | Values | Gap → new masonry-gap tokens (responsive); loading-state background → `--color-accent` (new value) |
| `src/components/uniform-gallery/uniform-gallery.ts` | Value tuning | Retune `getLayoutParams()` target-height constants toward 250px |
| `src/components/image-viewer/image-viewer.css` | Values only | Nav/close/counter colors → new interactive/ink tokens; no structural change — existing circular translucent buttons, keyboard/swipe behavior untouched |
| `src/components/about-page/about-page.css` | Values only | Heading/summary colors and fonts follow global token changes; hero image `border-radius`/`box-shadow` stay as-is (design system doesn't specify otherwise for photos) |
| `404.html` | Values only | Follows global token refresh; no structural change |
| `src/components/gallery/` (`masonry-gallery`) | **Optional cleanup, out of scope for the visual refresh itself** | Dead code (imported in `main.ts`, used in no `.html`). Flagging for removal as a discovered pre-existing issue; can be a separate, later fix-tier commit so it doesn't get tangled with the design-refresh diff |

---

## Out of Scope / Explicitly Deferred

These came up during the comparison but are **not** part of this refresh because
they require DOM/structural changes beyond a token/value pass, or introduce new
IA — either would risk the "don't destroy the current layout" constraint:

1. **Mobile full-bleed gallery.** The reference mock shows edge-to-edge mobile
   images; today's gallery is inset inside `.page-container`. Achieving full-bleed
   requires the gallery to escape its container (negative-margin trick or a DOM
   move similar to how `image-viewer` already sits outside `.page-container`).
   Worth a follow-up spec of its own.
2. **Theme toggle relocation** into the header nav (Decision 1 — stays in footer).
3. **Text-based logo wordmark** ("Richard Drew.") replacing the current SVG logo
   asset. The SVG's baked-in black/white fills already read fine against the new
   ink/paper tokens (verified: `fill` defaults to SVG-spec black on the light
   variant, no hardcoded value that would clash) — no asset change needed, and
   swapping to a text logotype is a brand-asset decision, not a token refresh.
4. **Adding a "Work" nav link.** Current IA has just "About" (gallery = home).
   Direction A's mock adds an explicit "Work" link; not adopting it preserves
   current navigation exactly.
5. **Direction B** (terracotta/Space Grotesk) — not requested.

---

## Assumptions Log (defaults chosen without a blocking question — flag for review)

These are places the new design material didn't specify a value directly, or
where a literal reading of the spec would visibly change UI tone beyond a pure
palette/type swap. Reasonable defaults were chosen so the plan isn't blocked;
worth a visual gut-check during implementation, not a re-litigation of the whole
spec.

1. **`--color-accent` derived value** (`oklch(0.95 0.003 60)` light /
   `oklch(0.30 0.005 60)` dark) — Direction A has no direct equivalent for "subtle
   surface tint" once hairline borders move to the new `--color-line` token; this
   is an interpolated in-between tone (lighter than `--color-line`, darker than
   `--color-paper`) for loading-state placeholder backgrounds and hover fills.
2. **`--color-interactive-hover` derived value** — Direction A's gold is a single
   constant across both themes (no separate hover shade defined); kept the
   current pattern of darkening in light mode / lightening in dark mode, applied
   to the new gold base.
3. **`--font-caption` → Lora** (dropping Inter) — a visible tone change for small
   UI text (footer meta, error/loading messages), chosen to match Direction A's
   literal two-font system rather than retain a third family.
4. **Heading weight/case change** (h1–h3: 400→600/700, sentence case → uppercase +
   tracked) — directly specified by the README's description of Oswald's role,
   included as intentional, not a silent default, but worth flagging since it's
   the most visually significant single change in this refresh.
5. **Row-masonry target height flattened toward 250px** — Direction A gives one
   flat value where the current site tiers by breakpoint; recommend retuning the
   existing tiers rather than removing the tiering structure.

---

## Testing & QA Strategy

- **Unit/contract/a11y/performance suites**: no changes expected to be required.
  None of the existing tests assert specific token values, hex colors, or font
  family names (confirmed via search) — they test structure and behavior, which
  this refresh does not touch. Baseline run on this branch: 385 passing, 3
  skipped, 10 pre-existing failures (header scroll-simulation flakiness +
  version-injection meta tag, both unrelated to this work and present before any
  changes).
- **Accessibility**: re-verify WCAG AA contrast for the new ink/paper/stone/gold
  combinations in both themes (constitution requires this for any color change)
  — particularly gold-on-paper and gold-on-ink-dark for interactive states, and
  stone-on-paper for muted/secondary text, which is the combination most likely
  to sit near the AA boundary.
- **Visual QA**: no automated visual-regression tooling exists in this repo (one
  Playwright e2e spec, no screenshot diffing). This refresh needs a manual (or
  Playwright-MCP-assisted) pass through: home/gallery, about, 404, lightbox open,
  mobile hamburger menu open — each in both light and dark theme, at mobile/
  tablet/desktop breakpoints. This replaces automated visual regression for this
  change; call out explicitly in the PR description that visual correctness was
  verified manually, not by a snapshot suite.
- **Build**: `make build` must stay clean (font-loading changes, `.ttf` removal)
  since a broken font reference wouldn't fail unit tests but would visibly break
  the site.

---

## Rollout Plan (for the implementation plan to sequence)

Suggested phase order — each phase independently testable/visually checkable:

1. **Token foundation**: `design-system.css` values + new tokens, `fonts.css`
   cleanup, Google Fonts `<link>` swap. Nothing else changes yet — this alone
   will visibly re-skin every page since all components consume these tokens.
2. **Container/grid formula**: `.page-container` + header/footer container width
   change to the 1440px/64px model.
3. **Gallery**: masonry gap tokens + row-height retuning in `uniform-gallery`.
4. **Component detail pass**: header/footer/image-viewer/about-page — border →
   `--color-line`, footer toggle → `--color-toggle-bg`, footer copy casing.
5. **404 page** token follow-through.
6. *(Optional, separate commit)* dead `gallery`/`masonry-gallery` component
   removal — flagged, not required for the refresh itself.

---

## Risks

- **Heading treatment (uppercase + heavier Oswald)** is the single most visible
  change and touches every page — worth an explicit look before merging, not
  just trusting the token cascade.
- **Contrast regressions** are the main correctness risk of a palette swap;
  covered above under QA but worth stating as the top risk of this change.
- **No visual regression tooling** means the safety net here is manual QA plus
  the existing behavioral test suite — the existing suite protects behavior, not
  the visual outcome this whole effort is about, so the manual pass in the QA
  section is load-bearing, not optional.
