# Design System Token Cleanup — Transitions & Spacing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every hardcoded transition duration, spacing value, and print colour in five component CSS files with the corresponding design-system token.

**Architecture:** Pure CSS token substitution — no behaviour changes, no new tokens, no TypeScript edits. Tests are run before and after each task as a regression gate: since tests do not assert CSS property values, all existing tests should continue to pass unchanged.

**Tech Stack:** CSS custom properties, Vite (dev server on port 3001), Vitest (test runner), TypeScript web components.

---

## Existing tokens (reference)

All tokens already live in `src/styles/design-system.css`.

| Token | Value |
|---|---|
| `--transition-fast` | `150ms ease-out` |
| `--transition-medium` | `250ms ease-out` |
| `--transition-slow` | `350ms ease-out` |
| `--space-xs` | `0.25rem` |
| `--space-sm` | `0.5rem` |
| `--space-md` | `1rem` |
| `--space-lg` | `1.5rem` |
| `--space-xl` | `2rem` |

---

## File map

| File | Changes |
|---|---|
| `src/components/header/header.css` | 2 — show/hide transitions |
| `src/components/gallery/gallery.css` | 7 — LQIP transition, gap, error-state padding/margin, print colour |
| `src/components/image-viewer/image-viewer.css` | 6 — open/close transition, counter + button positioning |
| `src/components/footer/footer.css` | 1 — print border colour |
| `src/components/uniform-gallery/uniform-gallery.css` | 2 — LQIP transition, error padding |

---

### Task 1: header.css — show/hide transitions

**Files:**
- Modify: `src/components/header/header.css:21,27`
- Test: `tests/header/`

- [ ] **Step 1: Baseline — run header tests**

```bash
npx vitest run tests/header/ --reporter=verbose
```

Expected: all header tests pass (note — 9 scroll-threshold tests currently fail pre-existing from `SCROLL_THRESHOLD=100`; that is the known baseline).

- [ ] **Step 2: Apply the two transition changes**

In `src/components/header/header.css`, make these two edits:

**Line ~21** (`.portfolio-header` show transition):
```css
/* before */
transition: transform 250ms ease-out;
/* after */
transition: transform var(--transition-medium);
```

**Line ~27** (`.portfolio-header.header--hidden` hide transition):
```css
/* before */
transition: transform 180ms ease-out;
/* after */
transition: transform var(--transition-fast);
```

The surrounding context for the show transition (keep everything else unchanged):
```css
.portfolio-header {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  background: var(--color-pure);
  transition: transform var(--transition-medium);
  will-change: transform;
}

.portfolio-header.header--hidden {
  transform: translateY(-100%);
  transition: transform var(--transition-fast);
}
```

- [ ] **Step 3: Verify no remaining hardcoded transition durations in header.css**

```bash
grep -n "[0-9]ms ease-out\|[0-9]ms ease[^-]" src/components/header/header.css
```

Expected: the only remaining match is the hamburger `0.15s cubic-bezier(...)` line (intentional, not in scope). No plain `ms ease-out` values other than cubic-bezier lines.

- [ ] **Step 4: Run header tests — regression check**

```bash
npx vitest run tests/header/ --reporter=verbose
```

Expected: same result as Step 1 (same 9 pre-existing failures, no new failures).

- [ ] **Step 5: Commit**

```bash
git add src/components/header/header.css
git commit -m "fix(header): use transition tokens for show/hide animation"
```

---

### Task 2: gallery.css — LQIP transition, gap, error states, print colour

**Files:**
- Modify: `src/components/gallery/gallery.css:28,106,132,136,140,147,343`
- Test: `tests/gallery/`

- [ ] **Step 1: Baseline — run gallery tests**

```bash
npx vitest run tests/gallery/ --reporter=verbose
```

Expected: 86 tests pass, 3 skipped (known baseline).

- [ ] **Step 2: Apply all 7 changes**

**Line ~28** (single-column gap):
```css
/* before */
gap: 1rem !important;
/* after */
gap: var(--space-md) !important;
```

**Line ~106** (LQIP fade-out transition):
```css
/* before */
transition: opacity 300ms ease-out;
/* after */
transition: opacity var(--transition-medium);
```

**Line ~132** (`.gallery-image-error` padding):
```css
/* before */
padding: 1rem;
/* after */
padding: var(--space-md);
```

**Line ~136** (`.gallery-image-error-icon` margin):
```css
/* before */
margin-bottom: 0.5rem;
/* after */
margin-bottom: var(--space-sm);
```

**Line ~140** (`.gallery-error-message` padding):
```css
/* before */
padding: 2rem;
/* after */
padding: var(--space-xl);
```

**Line ~147** (`.gallery-error-icon` margin):
```css
/* before */
margin-bottom: 1rem;
/* after */
margin-bottom: var(--space-md);
```

**Line ~343** (print border colour):
```css
/* before */
border: 0.0625rem solid #000; /* 1px -> rem */
/* after */
border: 0.0625rem solid var(--color-primary);
```

- [ ] **Step 3: Verify no remaining targets in gallery.css**

```bash
grep -n "300ms\|gap: 1rem\|padding: 2rem\|padding: 1rem\|margin-bottom: 1rem\|margin-bottom: 0\.5rem\|solid #000" src/components/gallery/gallery.css
```

Expected: zero matches.

- [ ] **Step 4: Run gallery tests — regression check**

```bash
npx vitest run tests/gallery/ --reporter=verbose
```

Expected: 86 pass, 3 skipped — identical to Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/gallery/gallery.css
git commit -m "fix(gallery): use design tokens for transitions, spacing, and print colour"
```

---

### Task 3: image-viewer.css — open/close transition, counter + button positioning

**Files:**
- Modify: `src/components/image-viewer/image-viewer.css:19,38,39,47,87,96,225,229`
- Test: `tests/image-viewer/`

- [ ] **Step 1: Baseline — run image-viewer tests**

```bash
npx vitest run tests/image-viewer/ --reporter=verbose
```

Expected: 52 tests pass (known baseline).

- [ ] **Step 2: Apply all 6 changes (8 lines)**

**Line ~19** (viewer overlay open/close transition):
```css
/* before */
transition: opacity 300ms ease-out;
/* after */
transition: opacity var(--transition-medium);
```

**Lines ~38–39** (close button position):
```css
/* before */
top: 1rem;
right: 1rem;
/* after */
top: var(--space-md);
right: var(--space-md);
```

**Line ~47** (close button padding):
```css
/* before */
padding: 0.5rem;
/* after */
padding: var(--space-sm);
```

**Line ~87** (counter bottom offset):
```css
/* before */
bottom: 1.5rem;
/* after */
bottom: var(--space-lg);
```

**Line ~96** (counter padding):
```css
/* before */
padding: 0.5rem 1rem;
/* after */
padding: var(--space-sm) var(--space-md);
```

**Lines ~225, ~229** (nav button left/right):
```css
/* before */
left: 1rem;
/* after */
left: var(--space-md);
```
```css
/* before */
right: 1rem;
/* after */
right: var(--space-md);
```

- [ ] **Step 3: Verify no remaining targets in image-viewer.css**

```bash
grep -n "300ms ease-out\|top: 1rem\|right: 1rem\|left: 1rem\|bottom: 1\.5rem\|padding: 0\.5rem 1rem\|padding: 0\.5rem;" src/components/image-viewer/image-viewer.css
```

Expected: zero matches (the `0.375rem` mobile paddings and `padding: 0.5rem;` on nav buttons are intentionally left — nav button circular-button padding is rgba glass context, not this scope).

Note: `padding: 0.5rem;` appears on **two** elements: `.viewer__close` (line ~47, changed above) and `.viewer__nav button` (line ~204). The nav button circular padding is intentional glass-morphism context and is **not in scope** per the spec. Only change the close button instance.

- [ ] **Step 4: Run image-viewer tests — regression check**

```bash
npx vitest run tests/image-viewer/ --reporter=verbose
```

Expected: 52 pass — identical to Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/image-viewer/image-viewer.css
git commit -m "fix(image-viewer): use design tokens for transition, counter, and button positioning"
```

---

### Task 4: footer.css — print border colour

**Files:**
- Modify: `src/components/footer/footer.css:125`
- Test: `tests/footer/`

- [ ] **Step 1: Baseline — run footer tests**

```bash
npx vitest run tests/footer/ --reporter=verbose
```

Expected: 30 tests pass (known baseline).

- [ ] **Step 2: Apply the 1 change**

**Line ~125** (print `border-top` colour):
```css
/* before */
border-top: 0.0625rem solid #ccc;
/* after */
border-top: 0.0625rem solid var(--color-accent);
```

The full surrounding print block for context:
```css
@media print {
  portfolio-footer {
    border-top: 0.0625rem solid var(--color-accent);
  }

  .footer__toggle-group {
    display: none;
  }
}
```

- [ ] **Step 3: Verify**

```bash
grep -n "#ccc" src/components/footer/footer.css
```

Expected: zero matches.

- [ ] **Step 4: Run footer tests — regression check**

```bash
npx vitest run tests/footer/ --reporter=verbose
```

Expected: 30 pass — identical to Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/footer.css
git commit -m "fix(footer): use --color-accent token for print border"
```

---

### Task 5: uniform-gallery.css — LQIP transition, error padding

**Files:**
- Modify: `src/components/uniform-gallery/uniform-gallery.css:90,144`
- Test: `tests/uniform-gallery/`

- [ ] **Step 1: Baseline — run uniform-gallery tests**

```bash
npx vitest run tests/uniform-gallery/ --reporter=verbose
```

Note the exact test count and pass/fail state — this is the baseline for Step 4.

- [ ] **Step 2: Apply both changes**

**Line ~90** (LQIP placeholder fade transition):
```css
/* before */
transition: opacity 300ms ease-out;
/* after */
transition: opacity var(--transition-medium);
```

**Line ~144** (`.uniform-gallery-error` padding):
```css
/* before */
padding: 2rem;
/* after */
padding: var(--space-xl);
```

Note: lines ~70–71 contain `transform 900ms cubic-bezier(...)` and `opacity 500ms ease-out 300ms` — these are intentional animation tuning values with no token equivalent and are **not in scope**.

- [ ] **Step 3: Verify no remaining targets**

```bash
grep -n "300ms ease-out\|padding: 2rem" src/components/uniform-gallery/uniform-gallery.css
```

Expected: zero matches.

- [ ] **Step 4: Run uniform-gallery tests — regression check**

```bash
npx vitest run tests/uniform-gallery/ --reporter=verbose
```

Expected: identical to Step 1 baseline.

- [ ] **Step 5: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.css
git commit -m "fix(uniform-gallery): use design tokens for LQIP transition and error padding"
```

---

### Task 6: Final verification and push

**Files:** none modified

- [ ] **Step 1: Full grep — confirm no remaining in-scope hardcodes across all 5 files**

```bash
grep -n "300ms ease-out\|250ms ease-out\|180ms ease-out\|gap: 1rem\|padding: 2rem\|padding: 1rem[^-]\|margin-bottom: 1rem\|margin-bottom: 0\.5rem\|bottom: 1\.5rem\|top: 1rem\|right: 1rem\|left: 1rem\|padding: 0\.5rem 1rem\|solid #000\|solid #ccc" \
  src/components/header/header.css \
  src/components/gallery/gallery.css \
  src/components/image-viewer/image-viewer.css \
  src/components/footer/footer.css \
  src/components/uniform-gallery/uniform-gallery.css
```

Expected: zero matches.

- [ ] **Step 2: Full test suite**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -10
```

Expected: `385 passed | 3 skipped` with the same 10 pre-existing failures (9 header scroll-threshold tests + 1 version-injection test). No new failures.

- [ ] **Step 3: Push**

```bash
git push origin develop
```

Expected: push succeeds.
