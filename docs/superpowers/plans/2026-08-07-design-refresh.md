# Direction A Design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the live site (colors, type, spacing, grid, masonry density) to the
Direction A design system, changing only token values and a small number of
net-new tokens — no DOM, component-boundary, or interaction changes.

**Architecture:** Every component already consumes design tokens
(`--color-*`, `--font-*`, `--text-*`, `--space-*`) by name from
`src/styles/design-system.css`. This plan changes the token *values* (and adds
~7 new tokens for concepts the old system lacked) so the visual cascade updates
every component automatically; only a handful of components need direct edits
(places that hardcode a token choice the design changes, e.g. footer's toggle
background, or that have their own copy of a value, e.g. the gallery's row-gap
constant).

**Tech Stack:** Vanilla TypeScript Web Components, CSS custom properties, Vite,
Vitest, Playwright (e2e only). No new dependencies.

## Global Constraints

- No DOM restructuring, no component API changes, no new/removed custom elements.
- Existing token *names* are the stable contract — do not rename any existing
  `--color-*`/`--font-*`/`--text-*`/`--space-*` token.
- New dark-mode values follow the codebase's existing convention: **one token
  name**, redefined inside the `[data-theme="dark"]` block in
  `design-system.css` — do NOT introduce `-dark`-suffixed token name variants
  (that's the source design file's convention, not this codebase's).
- Masonry gap = 4px desktop / 2px mobile (not the README's stale 16px).
- Keep fluid `clamp()` typography; retune endpoints, don't switch to fixed px.
- Grid container: `max-width: 90rem` (1440px), edge padding steps from
  `--space-lg` (24px) to `--space-3xl` (64px) at the existing 52.5rem (840px)
  breakpoint. Mobile gallery stays inset (not full-bleed) — out of scope.
- Theme toggle stays in the footer.
- No new npm dependencies (constitution: "Question Dependencies" — a small
  self-contained OKLCH→luminance helper is written directly, not pulled from a
  color library).
- Full spec: `docs/superpowers/specs/2026-08-07-design-refresh-design.md`.

---

### Task 1: Color-contrast verification utility

**Files:**
- Create: `src/utils/color-contrast.ts`
- Test: `tests/utils/color-contrast.test.ts`

**Interfaces:**
- Produces: `oklchToLinearSrgb(l: number, c: number, h: number): [number, number, number]`,
  `relativeLuminance(rgbLinear: [number, number, number]): number`,
  `contrastRatio(a: [number, number, number], b: [number, number, number]): number`
  — all consumed later by this task's own test only. Not consumed by other
  tasks or app code; this is a one-off verification tool for the new palette,
  kept in `src/utils` because it's a genuinely reusable a11y check, not because
  anything else calls it yet.

This task exists to answer, with real math instead of eyeballing, whether the
new Direction A palette (and the two values this refresh has to invent —
`--color-accent` and `--color-interactive-hover`, which the source design has
no direct equivalent for) meets WCAG AA. Text pairs need ≥4.5:1; the gold
accent is treated as a large-scale/UI-adjacent color (always paired with an
underline or button fill, same precedent as the current site's gold
`#B8860B` ~3.9:1) so it needs ≥3.0:1.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/utils/color-contrast.test.ts
import { describe, it, expect } from 'vitest'
import { oklchToLinearSrgb, contrastRatio } from '../../src/utils/color-contrast'

// Direction A token values (see design-system.css after Task 2)
const paper = oklchToLinearSrgb(0.99, 0.002, 80)       // --color-pure, light
const inkDark = oklchToLinearSrgb(0.24, 0.005, 60)     // --color-pure, dark
const ink = oklchToLinearSrgb(0.16, 0.004, 60)         // --color-primary, light
const fgDark = oklchToLinearSrgb(0.95, 0.003, 60)      // --color-primary, dark
const stone = oklchToLinearSrgb(0.45, 0.005, 60)       // --color-secondary, light
const stoneDark = oklchToLinearSrgb(0.65, 0.005, 60)   // --color-secondary, dark
const gold = oklchToLinearSrgb(0.72, 0.15, 85)         // --color-interactive, both themes
const goldHoverLight = oklchToLinearSrgb(0.64, 0.15, 85) // --color-interactive-hover, light
const goldHoverDark = oklchToLinearSrgb(0.80, 0.15, 85)  // --color-interactive-hover, dark

describe('color-contrast: Direction A palette', () => {
  it('primary text on background meets WCAG AA (4.5:1) — light mode', () => {
    expect(contrastRatio(ink, paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('primary text on background meets WCAG AA (4.5:1) — dark mode', () => {
    expect(contrastRatio(fgDark, inkDark)).toBeGreaterThanOrEqual(4.5)
  })

  it('secondary/muted text meets WCAG AA (4.5:1) — light mode', () => {
    expect(contrastRatio(stone, paper)).toBeGreaterThanOrEqual(4.5)
  })

  it('secondary/muted text meets WCAG AA (4.5:1) — dark mode', () => {
    expect(contrastRatio(stoneDark, inkDark)).toBeGreaterThanOrEqual(4.5)
  })

  it('gold accent meets the large-text/UI-component threshold (3:1) — light mode', () => {
    expect(contrastRatio(gold, paper)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold accent meets the large-text/UI-component threshold (3:1) — dark mode', () => {
    expect(contrastRatio(gold, inkDark)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold hover state meets the large-text/UI-component threshold (3:1) — light mode', () => {
    expect(contrastRatio(goldHoverLight, paper)).toBeGreaterThanOrEqual(3.0)
  })

  it('gold hover state meets the large-text/UI-component threshold (3:1) — dark mode', () => {
    expect(contrastRatio(goldHoverDark, inkDark)).toBeGreaterThanOrEqual(3.0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/utils/color-contrast.test.ts`
Expected: FAIL — `Cannot find module '../../src/utils/color-contrast'`

- [ ] **Step 3: Write the implementation**

```typescript
// src/utils/color-contrast.ts
/**
 * Minimal OKLCH → linear-sRGB → WCAG relative-luminance/contrast pipeline.
 * Implements the OKLab conversion matrices from the CSS Color 4 spec.
 * No external dependency — this project is vanilla-first.
 */

type Rgb = [number, number, number]

export function oklchToLinearSrgb(l: number, c: number, hDeg: number): Rgb {
  const hRad = (hDeg * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const lCubed = l_ ** 3
  const mCubed = m_ ** 3
  const sCubed = s_ ** 3

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed
  const bl = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.7076147010 * sCubed

  // Clamp to [0, 1] — token colors are expected to be in-gamut; this guards
  // against float drift at the edges rather than silently producing garbage.
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  return [clamp(r), clamp(g), clamp(bl)]
}

export function relativeLuminance([r, g, b]: Rgb): number {
  // r, g, b are already linear-light (pre-gamma) values from the OKLab
  // conversion, which is exactly what the WCAG luminance formula needs.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/utils/color-contrast.test.ts`
Expected: PASS (8/8). **If any assertion fails**, adjust the failing token's
`L` (lightness) value in the test — darker for text-on-light pairs, lighter
for text-on-dark pairs — re-run, and once it passes, carry that exact adjusted
`L` value forward into Task 2's token values below (the test is the source of
truth for the final numbers, not the table in Task 2 — if you change a value
here, change it there too).

- [ ] **Step 5: Commit**

```bash
git add src/utils/color-contrast.ts tests/utils/color-contrast.test.ts
git commit -m "test: add WCAG contrast verification for Direction A palette"
```

---

### Task 2: Color tokens

**Files:**
- Modify: `src/styles/design-system.css:9-14` (light `:root` color tokens)
- Modify: `src/styles/design-system.css:82-94` (`[data-theme="dark"]` overrides)

**Interfaces:**
- Consumes: the per-theme gold values Task 1's fix round already established
  in `tests/utils/color-contrast.test.ts` (`goldLight`/`goldHoverLight`/
  `goldDark`/`goldHoverDark`) — that file is already in its final state, no
  further edit needed here.
- Produces: `--color-primary`, `--color-secondary`, `--color-pure`,
  `--color-accent`, `--color-interactive`, `--color-interactive-hover`
  (existing names, new values), plus two **new** tokens `--color-line` and
  `--color-toggle-bg`, both light-mode values here and dark-mode values in the
  `[data-theme="dark"]` block — consumed by Task 7 (header) and Task 8 (footer).

**Note:** Task 1's review found the source design's gold
(`oklch(0.72 0.15 85)`, meant to be shared across both themes) fails 3:1
contrast against `--color-pure` in light mode (measured 2.44:1), and its fix
round resolved this by diverging gold per theme — matching the shape the
color it's replacing already had (`#B8860B` light / `#D4AF37` dark, i.e. the
current site already uses a brighter gold in dark mode). The values below are
already verified by the (already-committed) contrast test; just transcribe
them into the CSS tokens:

| Token | Light | Dark |
|---|---|---|
| `--color-interactive` | `oklch(0.64 0.15 85)` | `oklch(0.72 0.15 85)` |
| `--color-interactive-hover` | `oklch(0.56 0.15 85)` | `oklch(0.80 0.15 85)` |

- [ ] **Step 1: Replace the light-mode color tokens**

Before (`design-system.css:9-14`):

```css
  --color-primary: #2C2C2C;           /* Deep charcoal */
  --color-secondary: #6B6B6B;         /* Warm gray */
  --color-accent: #F8F6F3;            /* Soft cream */
  --color-pure: #FFFFFF;              /* Clean white */
  --color-interactive: #B8860B;       /* Muted gold */
  --color-interactive-hover: #9A7209; /* Darker gold for hover */
```

After:

```css
  --color-primary: oklch(0.16 0.004 60);          /* ink — Direction A */
  --color-secondary: oklch(0.45 0.005 60);        /* stone — muted text */
  --color-accent: oklch(0.95 0.003 60);           /* subtle surface tint (loading states, hover fills) */
  --color-pure: oklch(0.99 0.002 80);             /* paper — page background */
  --color-interactive: oklch(0.64 0.15 85);       /* gold, light mode — darkened from source 0.72 to clear 3:1 on paper (see Task 1) */
  --color-interactive-hover: oklch(0.56 0.15 85); /* darker gold for hover, light mode */
  --color-line: oklch(0.9 0.003 60);              /* hairline borders */
  --color-toggle-bg: oklch(0.24 0.005 60);        /* footer theme-toggle fill — softened ink-dark tone, not pure ink */
```

- [ ] **Step 2: Replace the dark-mode color overrides**

Before (`design-system.css:82-94`):

```css
[data-theme="dark"] {
  /* Color Palette - Dark Mode */
  --color-primary: #E5E5E5;           /* Light gray text */
  --color-secondary: #B8B8B8;         /* Medium gray */
  --color-accent: #2A2A2A;            /* Dark gray background - lighter than pure black */
  --color-pure: #2A2A2A;              /* Dark gray background */
  --color-interactive: #D4AF37;       /* Brighter gold */
  --color-interactive-hover: #F0C14B; /* Even brighter for hover */

  /* Shadows - Lighter for dark mode */
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

After:

```css
[data-theme="dark"] {
  /* Color Palette - Dark Mode (Direction A) */
  --color-primary: oklch(0.95 0.003 60);          /* near-white text */
  --color-secondary: oklch(0.65 0.005 60);        /* muted text, dark mode */
  --color-accent: oklch(0.30 0.005 60);           /* subtle surface tint, dark mode */
  --color-pure: oklch(0.24 0.005 60);             /* ink-dark — lifted off pure black */
  --color-interactive: oklch(0.72 0.15 85);       /* gold, dark mode — source value, brighter than light mode's 0.64 */
  --color-interactive-hover: oklch(0.80 0.15 85); /* brighter gold for hover, dark mode */
  --color-line: oklch(0.28 0.004 60);             /* hairline borders, dark mode */
  --color-toggle-bg: oklch(0.95 0.003 60);        /* footer theme-toggle fill, dark mode */

  /* Shadows - Lighter for dark mode */
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 3: Verify build and existing suite stay green**

Run: `npm run build && npm run test:run`
Expected: build succeeds; test totals unchanged from the pre-existing baseline
plus Task 1's 8 color-contrast tests still passing (385 passing, 3 skipped, 10
pre-existing failures in `header-contract`, `header-ui`, `version-injection`
— unrelated to color tokens, see spec's QA section). No *new* failures.

- [ ] **Step 4: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat: apply Direction A color palette to design tokens"
```

---

### Task 3: Typography tokens and heading treatment

**Files:**
- Modify: `src/styles/design-system.css:17-20` (font-family tokens)
- Modify: `src/styles/design-system.css:30-38` (type scale)
- Modify: `src/styles/design-system.css:159-184` (heading rules)

**Interfaces:**
- Produces: `--font-header`/`--font-navigation` = Oswald, `--font-body` unchanged
  (Lora), `--font-caption` = Lora; retuned `--text-xs`/`--text-xl`/`--text-4xl`;
  `h1, .h1` / `h2, .h2` / `h3, .h3` gain uppercase + tracked + heavier weight.
  Consumed automatically by every component via cascade — no component CSS
  files reference these tokens' internals directly.

- [ ] **Step 1: Replace font-family tokens**

Before (`design-system.css:17-20`):

```css
  --font-header: 'Bebas Neue', 'Playfair Display', 'Times New Roman', serif;
  --font-navigation: 'Bebas Neue', 'Inter', 'Helvetica Neue', sans-serif;
  --font-body: 'Lora', 'Georgia', serif;
  --font-caption: 'Inter', 'Helvetica Neue', sans-serif;
```

After:

```css
  --font-header: 'Oswald', sans-serif;
  --font-navigation: 'Oswald', sans-serif;
  --font-body: 'Lora', 'Georgia', serif;
  --font-caption: 'Lora', 'Georgia', serif;
```

- [ ] **Step 2: Retune the type scale**

Before (`design-system.css:30-38`):

```css
  --text-xs: clamp(0.75rem, 2vw, 0.875rem);
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --text-nav: clamp(1rem, 2.5vw, 1.25rem);
  --text-base: clamp(1rem, 3vw, 1.125rem);
  --text-lg: clamp(1.125rem, 3.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 4vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 5vw, 2rem);
  --text-3xl: clamp(2rem, 6vw, 2.5rem);
  --text-4xl: clamp(2.5rem, 7vw, 3rem);
```

After (only `--text-xs`, `--text-xl`, `--text-4xl` change — the rest already
land on or near a Direction A rung: `--text-sm`/`--text-nav`/`--text-lg`
already max out at 16/20/20px):

```css
  --text-xs: clamp(0.75rem, 2vw, 0.8125rem);   /* max 13px — Direction A "xs" */
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --text-nav: clamp(1rem, 2.5vw, 1.25rem);
  --text-base: clamp(1rem, 3vw, 1.125rem);
  --text-lg: clamp(1.125rem, 3.5vw, 1.25rem);
  --text-xl: clamp(1.25rem, 4vw, 1.75rem);     /* max 28px — Direction A "lg" */
  --text-2xl: clamp(1.5rem, 5vw, 2rem);
  --text-3xl: clamp(2rem, 6vw, 2.5rem);
  --text-4xl: clamp(2.5rem, 7vw, 2.75rem);     /* max 44px — Direction A "xl" */
```

- [ ] **Step 3: Update heading rules**

Before (`design-system.css:159-184`):

```css
h1, .h1 {
  font-size: var(--text-4xl);
  font-family: var(--font-header);
  font-weight: var(--weight-regular);
  color: var(--color-primary);
  line-height: 1.1;
  margin-bottom: var(--space-lg);
}

h2, .h2 {
  font-size: var(--text-3xl);
  font-family: var(--font-header);
  font-weight: var(--weight-regular);
  color: var(--color-primary);
  line-height: 1.2;
  margin-bottom: var(--space-md);
}

h3, .h3 {
  font-size: var(--text-2xl);
  font-family: var(--font-header);
  font-weight: var(--weight-regular);
  color: var(--color-primary);
  line-height: 1.3;
  margin-bottom: var(--space-md);
}
```

After:

```css
h1, .h1 {
  font-size: var(--text-4xl);
  font-family: var(--font-header);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  line-height: 1.1;
  margin-bottom: var(--space-lg);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

h2, .h2 {
  font-size: var(--text-3xl);
  font-family: var(--font-header);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  line-height: 1.2;
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

h3, .h3 {
  font-size: var(--text-2xl);
  font-family: var(--font-header);
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  line-height: 1.3;
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

(`h4`–`h6` are intentionally left unchanged — they already use
`--font-navigation`/`--weight-semibold` and no Direction A material specifies
sub-heading treatment differently.)

- [ ] **Step 4: Verify build and existing suite stay green**

Run: `npm run build && npm run test:run`
Expected: same baseline as Task 2, no new failures.

- [ ] **Step 5: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat: apply Direction A typography — Oswald headings, retuned type scale"
```

---

### Task 4: Font loading — remove Bebas Neue, load Oswald + Lora italic

**Files:**
- Modify: `src/styles/fonts.css` (remove Bebas Neue `@font-face` rules)
- Modify: `index.html`, `about.html`, `404.html` (Google Fonts `<link>`,
  Bebas Neue preload `<link>`, `theme-color` meta)
- Modify: `index.html:56`, `src/components/about-page/about-page.css:29`
  (loading-label weight, see below)

**Interfaces:**
- Consumes: `--font-header`/`--font-caption` families from Task 3.
- Produces: none — leaf task, purely asset loading.

- [ ] **Step 1: Empty out `fonts.css`**

Before (`src/styles/fonts.css`, full file):

```css
/* Google Fonts loaded asynchronously via <link> in HTML — no @import here */

/**
 * Local Font Definitions
 * Optimized web font loading with fallbacks
 */

/* Bebas Neue - Display Font for Headers */
@font-face {
  font-family: 'Bebas Neue';
  src: url('/fonts/BebasNeue-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Bebas Neue';
  src: url('/fonts/BebasNeue-Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}
```

After:

```css
/* Google Fonts loaded asynchronously via <link> in index.html/about.html/404.html.
   Direction A uses Oswald (display/nav/labels) and Lora (body/caption) — both
   Google-hosted, no local @font-face declarations needed. */
```

- [ ] **Step 2: Update `index.html`'s font `<link>`s and preload**

Before (`index.html:11-18`):

```html
  <!-- Preload critical local fonts -->
  <link rel="preload" href="/fonts/BebasNeue-Regular.ttf" as="font" type="font/ttf" crossorigin />

  <!-- Google Fonts: async load to avoid render-blocking -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Lora:wght@300;400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Lora:wght@300;400;500&display=swap" /></noscript>
```

After:

```html
  <!-- Google Fonts: async load to avoid render-blocking -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" /></noscript>
```

Apply the identical change to `about.html` and `404.html` — both currently
have the same Google Fonts block (at `about.html:11-15` / `404.html:12-16`)
and a separate Bebas Neue preload a few lines below (`about.html:32-33` /
`404.html:33-34`):

Before (`about.html:11-15`, and identically `404.html:12-16`):

```html
  <!-- Google Fonts: async load to avoid render-blocking -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Lora:wght@300;400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Lora:wght@300;400;500&display=swap" /></noscript>
```

After (same replacement in both files):

```html
  <!-- Google Fonts: async load to avoid render-blocking -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" /></noscript>
```

Before (`about.html:32-33`, and identically `404.html:33-34`):

```html
  <!-- Preload critical fonts for performance -->
  <link rel="preload" href="/fonts/BebasNeue-Regular.ttf" as="font" type="font/ttf" crossorigin />
```

After: delete both lines entirely (no replacement — Oswald/Lora are Google-hosted and already preloaded via the `<link>` above).

`index.html` has no separate "Preload critical fonts for performance" comment
block — its Bebas Neue preload is the one already shown in Step 2 above,
directly above its Google Fonts block.

- [ ] **Step 3: Update `theme-color` meta in all three HTML files**

Before (`index.html:8`, `about.html:8`, `404.html:8`):

```html
  <meta name="theme-color" content="#2C2C2C" />
```

After:

```html
  <meta name="theme-color" content="#232220" />
```

(`#232220` is the documented sRGB approximation of `oklch(0.16 0.004 60)` —
the new `--color-primary` light-mode ink — matching the existing pattern of a
single static value, not a per-theme dynamic one.)

- [ ] **Step 4: Fix the loading-label font-weight (Lora has no 300 weight loaded)**

`--weight-light` (300) was used for two loading-state labels under the old
`--font-caption: Inter` (which had a 300 weight loaded). The new
`--font-caption: Lora` link only loads 400/500 — leaving `--weight-light`
would force the browser to fake-bold/synthesize. Bump both to
`--weight-regular`.

Before (`index.html:56`, inside the `<style>` block):

```css
    .gallery-loading-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      color: var(--color-secondary);
      font-family: var(--font-caption);
      font-size: var(--text-lg);
      font-weight: var(--weight-light);
    }
```

After: change `font-weight: var(--weight-light);` → `font-weight: var(--weight-regular);`

Before (`src/components/about-page/about-page.css:20-30`):

```css
/* Loading state */
about-page .about-loading-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-secondary);
  font-family: var(--font-caption);
  font-size: var(--text-lg);
  font-weight: var(--weight-light);
}
```

After: change `font-weight: var(--weight-light);` → `font-weight: var(--weight-regular);`

- [ ] **Step 5: Delete the now-unused local font files**

```bash
rm -f public/fonts/BebasNeue-Regular.ttf public/fonts/BebasNeue-Thin.ttf
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds with no missing-asset warnings for `BebasNeue-*.ttf`.

- [ ] **Step 7: Commit**

```bash
git add src/styles/fonts.css index.html about.html 404.html src/components/about-page/about-page.css public/fonts
git commit -m "feat: load Oswald/Lora via Google Fonts, remove Bebas Neue"
```

---

### Task 5: Spacing and grid tokens

**Files:**
- Modify: `src/styles/design-system.css:40-71` (spacing scale, layout tokens)
- Modify: `src/styles/design-system.css:285-300` (`.page-container`)
- Modify: `src/components/header/header.css:43-60` (`.header__container`)
- Modify: `src/components/footer/footer.css:12-27` (`.footer__container`)

**Interfaces:**
- Produces: `--grid-max-width` (new, consumed by Steps 2-4 below); removes
  `--page-width-full`/`--page-width-constrained` (no longer referenced anywhere
  after this task).
- Consumes: nothing new.

Note: the spec's token-mapping table also lists `--space-5xl` (128px) and
`--grid-gutter` (24px) as net-new tokens. Neither has a consumer anywhere in
this plan — the current site has no section using 128px padding, and no
component lays out on literal grid columns/gutters (the "12-column grid" in
the source material describes the gallery's implicit row-masonry, not a CSS
Grid the site implements). Per this project's own precedent
(`docs/superpowers/specs/2026-05-08-design-system-tokens-cleanup.md`: "adding
a token for one use case would be YAGNI"), skip both — do not add them in
Step 1 below. If a future task needs 128px spacing or an explicit gutter
value, add the token there, next to its first real consumer.

- [ ] **Step 1: Add spacing/grid tokens, remove the percentage-width tokens**

Before (`design-system.css:40-71`):

```css
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;

  /* Component Tokens */
  --gallery-gap: 0.625rem;  /* 10px — gap between gallery items */
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* Layout */
  --max-width-prose: 65ch;
  --border-radius: 0;

  /* Breakpoints (used in components) */
  --breakpoint-mobile: 48rem;     /* 768px */
  --breakpoint-desktop: 75rem;    /* 1200px */

  /* Page container width - unified responsive system */
  --page-width-full: 88%;  /* Mobile/Tablet - account for scrollbar */
  --page-width-constrained: 92%;  /* Desktop */
```

After:

```css
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;

  /* Component Tokens */
  --gallery-gap: 0.625rem;  /* 10px — legacy, only consumed by the unused masonry-gallery component */
  --masonry-gap: 0.25rem;         /* 4px — desktop row-masonry gap, Direction A */
  --masonry-gap-mobile: 0.125rem; /* 2px — mobile column gap, Direction A */
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* Layout */
  --max-width-prose: 65ch;
  --border-radius: 0;

  /* Breakpoints (used in components) */
  --breakpoint-mobile: 48rem;     /* 768px */
  --breakpoint-desktop: 75rem;    /* 1200px */

  /* Grid - Direction A */
  --grid-max-width: 90rem;   /* 1440px */
```

- [ ] **Step 2: Change `.page-container`'s width formula**

Before (`design-system.css:285-300`):

```css
/* Page Container - Unified Width Management */
.page-container {
  width: var(--page-width-full);
  /* max-width: var(--max-width-content); */
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: var(--header-height, 7.5rem);
  flex: 1;
}

/* Responsive page width - matches gallery breakpoint */
@media (min-width: 52.5rem) { /* 840px */
  .page-container {
    width: var(--page-width-constrained); /* 92% for desktop */
  }
}
```

After:

```css
/* Page Container - Unified Width Management (Direction A grid) */
.page-container {
  width: 100%;
  max-width: var(--grid-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  padding-inline: var(--space-lg); /* 24px mobile/tablet edge padding */
  padding-top: var(--header-height, 7.5rem);
  flex: 1;
}

/* Responsive edge padding - matches gallery breakpoint */
@media (min-width: 52.5rem) { /* 840px */
  .page-container {
    padding-inline: var(--space-3xl); /* 64px desktop edge padding */
  }
}
```

- [ ] **Step 3: Apply the same formula to the header container**

Before (`header.css:43-60`):

```css
.header__container {
  width: var(--page-width-full);
  margin: 0 auto;
  padding: var(--space-lg) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  box-sizing: border-box;
  position: relative;
  z-index: 1001;
}

@media (min-width: 52.5rem) {
  .header__container {
    width: var(--page-width-constrained);
  }
}
```

After:

```css
.header__container {
  width: 100%;
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  box-sizing: border-box;
  position: relative;
  z-index: 1001;
}

@media (min-width: 52.5rem) {
  .header__container {
    padding: var(--space-lg) var(--space-3xl);
  }
}
```

- [ ] **Step 4: Apply the same formula to the footer container**

Before (`footer.css:12-27`):

```css
.footer__container {
  width: var(--page-width-full);
  margin: 0 auto;
  padding: var(--space-md) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  box-sizing: border-box;
}

@media (min-width: 52.5rem) {
  .footer__container {
    width: var(--page-width-constrained);
  }
}
```

After:

```css
.footer__container {
  width: 100%;
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  box-sizing: border-box;
}

@media (min-width: 52.5rem) {
  .footer__container {
    padding: var(--space-md) var(--space-3xl);
  }
}
```

- [ ] **Step 5: Verify build and existing suite stay green**

Run: `npm run build && npm run test:run`
Expected: same baseline, no new failures. `header`/`footer`/`about-page`
contract and UI tests don't assert pixel widths, only structure — confirmed
during spec research.

- [ ] **Step 6: Manually verify container widths**

Run: `npm run dev`, open `http://localhost:3000`, resize the viewport through
~375px / ~840px / ~1440px / ~1920px. Confirm: content never exceeds 1440px
centered, edge padding is visibly 24px below 840px and 64px at/above it, no
horizontal scrollbar appears at any width.

- [ ] **Step 7: Commit**

```bash
git add src/styles/design-system.css src/components/header/header.css src/components/footer/footer.css
git commit -m "feat: adopt Direction A 1440px grid, replace percentage container widths"
```

---

### Task 6: Masonry gap and row-height retuning

**Files:**
- Modify: `src/components/uniform-gallery/uniform-gallery.css:5-9` (`.uniform-gallery` gap)
- Modify: `src/components/uniform-gallery/uniform-gallery.ts:17-20,101-105`
  (`LAYOUT_GAP` constant, `getLayoutParams()`)

**Interfaces:**
- Consumes: `--masonry-gap`/`--masonry-gap-mobile` from Task 5.
- Produces: no interface change — `computeRows()`'s signature and
  `uniform-gallery.layout.ts` are untouched; only the values fed into it change.

**Why both files must change together:** `uniform-gallery.ts`'s
`LAYOUT_GAP = 10` constant is passed directly into `computeRows()` for the row
width/height math — it is a separate number from the CSS `gap` property, not
read from a custom property. If only the CSS gap changes, the row math will
compute widths against a gap the browser isn't actually rendering, and rows
won't quite fill the container width.

- [ ] **Step 1: Update the CSS gap to be responsive**

Before (`uniform-gallery.css:5-9`):

```css
.uniform-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gallery-gap);
  width: 100%;
```

After:

```css
.uniform-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: var(--masonry-gap-mobile);
  width: 100%;
```

Then, in the existing `@media (max-width: 36rem)` block further down in the
same file (`uniform-gallery.css:40-49`), add a matching desktop override
directly above it — the file's existing breakpoint is a max-width mobile
query, so add a new min-width block for the desktop gap:

```css
/* ── Breakpoints ──────────────────────────────────────── */

@media (min-width: 36.0625rem) {   /* >576px — desktop/tablet row-masonry gap */
  .uniform-gallery {
    gap: var(--masonry-gap);
  }
}

@media (max-width: 36rem) {       /* ≤576px all phones */
  .gallery-item {
    flex-basis: 100%;
    height: auto;
    aspect-ratio: var(--ar);    /* natural proportions, no cropping */
  }
  .gallery-spacer {
    display: none;
  }
}
```

- [ ] **Step 2: Update `LAYOUT_GAP` and retune row-height tiers**

Before (`uniform-gallery.ts:17-20`):

```typescript
  private static readonly REVEAL_MARGIN = '50px'
  private static readonly HIGH_PRIORITY_IMAGE_COUNT = 6
  private static readonly LAYOUT_GAP = 10
  private static readonly MOBILE_BREAKPOINT = 576
```

After:

```typescript
  private static readonly REVEAL_MARGIN = '50px'
  private static readonly HIGH_PRIORITY_IMAGE_COUNT = 6
  private static readonly LAYOUT_GAP = 4
  private static readonly MOBILE_BREAKPOINT = 576
```

Before (`uniform-gallery.ts:101-105`):

```typescript
  private getLayoutParams(containerWidth: number): { targetHeight: number; minRowRatio: number } {
    if (containerWidth >= 1200) return { targetHeight: 420, minRowRatio: 0.65 }
    if (containerWidth >= 900) return { targetHeight: 360, minRowRatio: 0.65 }
    return { targetHeight: 300, minRowRatio: 0.65 }
  }
```

After:

```typescript
  private getLayoutParams(containerWidth: number): { targetHeight: number; minRowRatio: number } {
    if (containerWidth >= 1200) return { targetHeight: 280, minRowRatio: 0.65 }
    if (containerWidth >= 900) return { targetHeight: 250, minRowRatio: 0.65 }
    return { targetHeight: 220, minRowRatio: 0.65 }
  }
```

(Direction A specifies one flat 250px target; the existing tiering by
container width is preserved — per the spec's decision to retune values, not
remove structure — centered on 250px rather than the old 300–420px range.)

- [ ] **Step 3: Run the existing uniform-gallery suite**

Run: `npm run test:run -- tests/uniform-gallery`
Expected: PASS — `computeRows()` tests pass their own `targetHeight`/`gap`
arguments directly and don't read `LAYOUT_GAP`/`getLayoutParams()`, so this
change doesn't affect them (confirmed during spec research).

- [ ] **Step 4: Manually verify gallery density**

Run: `npm run dev`, open the homepage. Confirm rows are visibly tighter
(smaller gap between images, shorter target row height) than before, and rows
still fill the full container width (no ragged right edge except the last row).

- [ ] **Step 5: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.css src/components/uniform-gallery/uniform-gallery.ts
git commit -m "feat: retune masonry gap and row height toward Direction A density"
```

---

### Task 7: Header — hairline border token

**Files:**
- Modify: `src/components/header/header.css:36-41`

**Interfaces:**
- Consumes: `--color-line` from Task 2.

- [ ] **Step 1: Swap the border source token**

Before (`header.css:36-41`):

```css
.header {
  background: var(--color-pure);
  border-bottom: 0.0625rem solid var(--color-accent); /* 1px -> rem */
  position: relative;
}
```

After:

```css
.header {
  background: var(--color-pure);
  border-bottom: 0.0625rem solid var(--color-line); /* 1px -> rem */
  position: relative;
}
```

- [ ] **Step 2: Verify existing header tests stay green**

Run: `npm run test:run -- tests/header`
Expected: same pre-existing 4+5 failures as baseline (scroll-behavior
flakiness, unrelated), no new failures.

- [ ] **Step 3: Commit**

```bash
git add src/components/header/header.css
git commit -m "feat: use dedicated hairline-border token in header"
```

---

### Task 8: Footer — hairline border, toggle fill, copy casing

**Files:**
- Modify: `src/components/footer/footer.css:3-10,66-96`
- Modify: `src/components/footer/footer.ts:44-51`

**Interfaces:**
- Consumes: `--color-line`, `--color-toggle-bg` from Task 2.

- [ ] **Step 1: Swap the border source token**

Before (`footer.css:3-10`):

```css
portfolio-footer {
  display: block;
  background: var(--color-pure);
  border-top: 0.0625rem solid var(--color-accent);
  transition:
    background-color var(--transition-medium),
    border-color var(--transition-medium);
}
```

After:

```css
portfolio-footer {
  display: block;
  background: var(--color-pure);
  border-top: 0.0625rem solid var(--color-line);
  transition:
    background-color var(--transition-medium),
    border-color var(--transition-medium);
}
```

- [ ] **Step 2: Swap the toggle button's fill token**

Before (`footer.css:66-90`, comment + rule):

```css
/*
 * Both buttons use --color-primary / --color-pure.
 * Each button is only visible in its own theme context, and the
 * variables invert between themes, so both buttons look correct
 * without any hardcoded colours.
 *
 * Light mode: --color-primary = #2C2C2C, --color-pure = #FFFFFF
 *   → Dark Room: dark button, light text ✓
 * Dark mode:  --color-primary = #E5E5E5, --color-pure = #2A2A2A
 *   → Light Box: light button, dark text ✓
 */

.footer__toggle {
  font-family: var(--font-navigation);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  border-radius: 0.1875rem;
  cursor: pointer;
  padding: var(--space-sm) var(--space-lg);
  min-width: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-pure);
  transition:
    background-color var(--transition-medium),
    color var(--transition-medium);
}
```

After:

```css
/*
 * Fill uses --color-toggle-bg (a softened ink-dark tone in light mode, near-
 * white in dark mode — deliberately not pure --color-primary/--color-pure,
 * per Direction A's "avoid a harsh pure-black button" intent). Text uses the
 * page background color so it always reads against the fill.
 */

.footer__toggle {
  font-family: var(--font-navigation);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  border-radius: 0.1875rem;
  cursor: pointer;
  padding: var(--space-sm) var(--space-lg);
  min-width: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-toggle-bg);
  color: var(--color-pure);
  transition:
    background-color var(--transition-medium),
    color var(--transition-medium);
}
```

- [ ] **Step 3: Update button copy casing**

Before (`footer.ts:44-51`):

```typescript
        <div class="footer__toggle-group">
          <button
            class="footer__toggle footer__toggle--dark-room"
            aria-label="Switch to dark mode"
          >Dark Room</button>
          <button
            class="footer__toggle footer__toggle--light-box"
            aria-label="Switch to light mode"
          >Light Box</button>
        </div>
```

After:

```typescript
        <div class="footer__toggle-group">
          <button
            class="footer__toggle footer__toggle--dark-room"
            aria-label="Switch to dark mode"
          >Dark room</button>
          <button
            class="footer__toggle footer__toggle--light-box"
            aria-label="Switch to light mode"
          >Light box</button>
        </div>
```

- [ ] **Step 4: Check footer tests for hardcoded copy assertions**

Run: `grep -n "Dark Room\|Light Box" tests/footer/*.test.ts`
If any test asserts the old casing (`'Dark Room'`/`'Light Box'`), update that
assertion's string literal to match (`'Dark room'`/`'Light box'`) — this is a
copy-only change, not a behavior change, so the test's intent doesn't change.

- [ ] **Step 5: Run the footer suite**

Run: `npm run test:run -- tests/footer`
Expected: PASS, including any casing assertion updated in Step 4.

- [ ] **Step 6: Commit**

```bash
git add src/components/footer/footer.css src/components/footer/footer.ts tests/footer
git commit -m "feat: apply Direction A tokens and copy casing to footer toggle"
```

---

### Task 9: About page and 404 heading cleanup

**Files:**
- Modify: `404.html:67-74`

**Interfaces:** none — pure CSS cleanup so the global `h1` rule from Task 3 can
apply without being overridden.

`about-page.css`'s `.about-hero__heading { letter-spacing: 0.08em; }` only
overrides `letter-spacing` (confirmed it does not redeclare `font-weight` or
`text-transform`), so it already inherits the new global `h1` treatment
(uppercase, bold, `--font-header`) — **no change needed there.**

`404.html`'s `.error-heading` currently redeclares `font-weight` and
`letter-spacing` on the same `<h1>`, which — being a class selector — wins
over the global element-selector `h1` rule and would silently suppress the new
uppercase/bold treatment. Remove the conflicting declarations so it inherits
from the global rule instead.

- [ ] **Step 1: Remove the overriding declarations**

Before (`404.html:67-74`):

```css
    .error-heading {
      font-family: var(--font-header);
      font-size: var(--text-3xl);
      font-weight: var(--weight-regular);
      color: var(--color-primary);
      letter-spacing: 0.08em;
      margin: calc(var(--space-md) * -1) 0 0;
    }
```

After:

```css
    .error-heading {
      font-family: var(--font-header);
      font-size: var(--text-3xl);
      color: var(--color-primary);
      margin: calc(var(--space-md) * -1) 0 0;
    }
```

(`font-weight` and `letter-spacing` are removed so the global `h1, .h1` rule's
`--weight-bold` and `0.02em` tracking apply instead; `font-family`/`font-size`/
`color`/`margin` stay explicit here since they're genuinely specific to this
page's oversized ghost-numeral layout, not redundant with the global rule.)

- [ ] **Step 2: Manually verify the 404 page**

Run: `npm run dev`, visit `http://localhost:3000/404.html` (or trigger an
unknown route if the dev server proxies 404s). Confirm "Not in Focus" now
renders uppercase and bold, consistent with headings elsewhere on the site.

- [ ] **Step 3: Commit**

```bash
git add 404.html
git commit -m "fix: let 404 heading inherit Direction A heading treatment"
```

---

### Task 10: Full-suite regression check and manual visual QA

**Files:** none modified — verification only.

- [ ] **Step 1: Full automated suite**

Run: `npm run test:run`
Expected: 385 passing, 3 skipped, and the same 10 pre-existing failures as the
Task 0 baseline (`header-contract` scroll events ×4, `header-ui` scroll
behavior ×5, `version-injection` ×1) — confirm no new failures were introduced
by any task in this plan.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds, no missing-font or broken-asset warnings.

- [ ] **Step 3: Manual visual QA pass**

No automated visual-regression tooling exists in this repo — this step is the
safety net for the actual visual outcome of the refresh. Using `npm run dev`
(or `npm run preview` against the build), check each of the following in
**both** light and dark theme, at **mobile (~375px)**, **tablet (~840px)**,
and **desktop (~1440px+)** widths:

- Homepage gallery: palette, Oswald headings/nav, tighter masonry gap, 1440px
  max-width with correct edge padding.
- Lightbox: open an image, check nav/close/counter colors, confirm keyboard
  (←/→/Esc) and swipe still work (behavior, not just look).
- About page: hero layout, heading treatment, hero image untouched.
- 404 page: heading now uppercase/bold, links still function.
- Footer: toggle button fill/label casing, both theme states.
- Mobile hamburger menu: open/close, nav link styling, underline.
- Header scroll-hide/show still functions (behavior check, since two of the
  pre-existing test failures are in this exact area — worth confirming by eye
  that the *actual* behavior in a real browser is unaffected, even though the
  jsdom simulation was already flaky before this work).

- [ ] **Step 4: Record the QA pass in the PR description**

When opening the PR (not part of this plan — a separate step the user drives),
explicitly note that visual correctness was verified manually per the above
checklist, since no automated visual regression suite exists to point to
instead.
