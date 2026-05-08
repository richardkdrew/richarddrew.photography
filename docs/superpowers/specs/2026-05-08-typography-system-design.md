# Typography System Consolidation

**Date:** 2026-05-08
**Status:** Approved
**Scope:** Design token additions + component cleanup

---

## Problem

40% of font sizes in the codebase bypass the design token system — using custom `clamp()` values or hardcoded `rem` values directly in component CSS. This makes the type scale inconsistent and difficult to adjust globally.

Key issues identified:

- Desktop nav: custom `clamp(1.375rem, 4vw, 1.625rem)` (22–26px) — oversized and off-token
- Mobile overlay nav: custom `clamp(2rem, 6vw, 3rem)` — off-token
- Footer toggle button: custom `clamp(0.875rem, 2vw, 1rem)` — functionally matches `--text-sm` but doesn't use it
- Image viewer counter: hardcoded `0.875rem` / `0.75rem` mobile
- Gallery icons: hardcoded `2rem` and `1.5rem`

---

## Design

### Token Changes — `src/styles/design-system.css`

**Keep all 7 existing tokens unchanged:**

| Token | Value | Range |
| --- | --- | --- |
| `--text-sm` | `clamp(0.875rem, 2.5vw, 1rem)` | 14–16px |
| `--text-base` | `clamp(1rem, 3vw, 1.125rem)` | 16–18px |
| `--text-lg` | `clamp(1.125rem, 3.5vw, 1.25rem)` | 18–20px |
| `--text-xl` | `clamp(1.25rem, 4vw, 1.5rem)` | 20–24px |
| `--text-2xl` | `clamp(1.5rem, 5vw, 2rem)` | 24–32px |
| `--text-3xl` | `clamp(2rem, 6vw, 2.5rem)` | 32–40px |
| `--text-4xl` | `clamp(2.5rem, 7vw, 3rem)` | 40–48px |

**Add 2 new tokens to fill gaps:**

| Token | Value | Range | Rationale |
| --- | --- | --- | --- |
| `--text-xs` | `clamp(0.75rem, 2vw, 0.875rem)` | 12–14px | Image viewer counter — no token existed below `--text-sm` |
| `--text-nav` | `clamp(1rem, 2.5vw, 1.25rem)` | 16–20px | Desktop nav — prominent with Bebas Neue but proportionate |

### Component Changes

**`src/components/header/header.css`**

- Desktop nav link font-size: `clamp(1.375rem, 4vw, 1.625rem)` → `var(--text-nav)`
- Mobile overlay nav font-size: `clamp(2rem, 6vw, 3rem)` → `var(--text-3xl)`

**`src/components/footer/footer.css`**

- Toggle button font-size: `clamp(0.875rem, 2vw, 1rem)` → `var(--text-sm)`

**`src/components/image-viewer/image-viewer.css`**

- Counter (desktop): `0.875rem` → `var(--text-sm)`
- Counter (mobile, inside media query): `0.75rem` → `var(--text-xs)`

**`src/components/gallery/gallery.css`**

- Error icon (`.gallery-error-icon`) font-size: `2rem` → `var(--text-3xl)`
- Gallery icon (`.portfolio-image .error-fallback .icon`) font-size: `1.5rem` → `var(--text-2xl)`

### No Changes

- Heading hierarchy (h1–h6) — already using tokens correctly
- Body text (`--text-base`) — already correct
- About page summary — already correct
- All font families, weights, line-heights — unchanged

---

## Affected Files

1. `src/styles/design-system.css` — add 2 tokens
2. `src/components/header/header.css` — 2 changes
3. `src/components/footer/footer.css` — 1 change
4. `src/components/image-viewer/image-viewer.css` — 2 changes
5. `src/components/gallery/gallery.css` — 2 changes

Total: 9 changes across 5 files.

---

## Out of Scope

- Breakpoint consolidation (8+ breakpoints vs 2 in tokens) — separate task
- Font family or weight changes
- Line-height adjustments
- Adding new typographic roles
