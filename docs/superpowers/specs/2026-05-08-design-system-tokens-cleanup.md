# Design System Token Cleanup — Transitions & Spacing

**Date:** 2026-05-08
**Status:** Approved
**Scope:** Replace hardcoded transition durations, spacing values, and print colours with design tokens

---

## Problem

Following the typography audit, a secondary pass identified hardcoded transition durations and spacing values in component CSS that have direct equivalents in the design system. These bypass the token system in the same way the font-size issues did.

---

## Existing Tokens (reference)

**Transitions:**

| Token | Value |
| --- | --- |
| `--transition-fast` | `150ms ease` |
| `--transition-medium` | `250ms ease` |
| `--transition-slow` | `350ms ease` (verify exists) |

**Spacing:**

| Token | Approx value |
| --- | --- |
| `--space-xs` | 0.25rem |
| `--space-sm` | 0.5rem |
| `--space-md` | 1rem |
| `--space-lg` | 1.5rem |
| `--space-xl` | 2rem |
| `--space-2xl` | 2.5rem |
| `--space-4xl` | 4rem |

---

## Changes

### `src/components/header/header.css`

- Show transition: `250ms ease-out` → `var(--transition-medium)`
- Hide transition: `180ms ease-out` → `var(--transition-fast)` (closest token; 150ms vs 180ms — acceptable)

### `src/components/gallery/gallery.css`

- Image load transition: `300ms ease-out` → `var(--transition-medium)`
- `gap: 1rem` → `var(--space-md)`
- Error message `padding: 2rem` → `var(--space-xl)`
- `.gallery-error-icon` `margin-bottom: 1rem` → `var(--space-md)`
- `.gallery-image-error-icon` `margin-bottom: 0.5rem` → `var(--space-sm)`
- Error fallback `padding: 1rem` → `var(--space-md)`
- Print `border: ... #000` → `var(--color-primary)`

### `src/components/image-viewer/image-viewer.css`

- Viewer open/close transition: `300ms ease-out` → `var(--transition-medium)`
- Counter `padding: 0.5rem 1rem` → `var(--space-sm) var(--space-md)`
- Counter `bottom: 1.5rem` → `var(--space-lg)`
- Nav button `left: 1rem` / `right: 1rem` → `var(--space-md)`
- Close button `top: 1rem` / `right: 1rem` → `var(--space-md)`
- Close button `padding: 0.5rem` → `var(--space-sm)`

### `src/components/footer/footer.css`

- Print `border-top: ... #ccc` → `var(--color-accent)`

### `src/components/uniform-gallery/uniform-gallery.css`

- LQIP fade transition: `300ms ease-out` → `var(--transition-medium)`
- Error message `padding: 2rem` → `var(--space-xl)`

---

## Not Changing

- Custom bezier curves (`cubic-bezier(...)`) — intentional animation tuning, no token equivalent
- `200ms` transitions — between fast (150ms) and medium (250ms); adding a token for one use case would be YAGNI
- `rgba()` overlay colours — glass morphism effects, no token equivalent appropriate
- `1.5rem` pill border-radius on image viewer counter — single use case, YAGNI
- Gallery `min-height` breakpoint values — layout constraints, not design system concerns
- `0.375rem` paddings in image viewer mobile — sub-`--space-sm` values, no token exists

---

## Affected Files

1. `src/components/header/header.css` — 2 changes
2. `src/components/gallery/gallery.css` — 7 changes
3. `src/components/image-viewer/image-viewer.css` — 6 changes
4. `src/components/footer/footer.css` — 1 change
5. `src/components/uniform-gallery/uniform-gallery.css` — 2 changes

Total: 18 changes across 5 files. No new tokens required.

---

## Out of Scope

- Typography token changes (covered in separate plan)
- Breakpoint consolidation
- Adding new tokens for edge-case values
