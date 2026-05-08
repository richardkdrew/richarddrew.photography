# Typography System Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 2 new design tokens and update 5 component CSS files so every font-size references a named token — no hardcoded values or custom clamp() calls remain.

**Architecture:** Pure CSS changes only. Add `--text-xs` and `--text-nav` to the `:root` block in `design-system.css`, then do targeted find-and-replace substitutions in each component CSS file. No TypeScript, no HTML, no test logic changes required.

**Tech Stack:** CSS custom properties (design tokens), Vite dev server for visual verification.

---

### Task 1: Add `--text-xs` and `--text-nav` tokens to design-system.css

**Files:**
- Modify: `src/styles/design-system.css:30-36`

- [ ] **Step 1: Verify current token block**

Run:
```bash
grep -n "text-sm\|text-xs\|text-nav" src/styles/design-system.css
```
Expected output — `--text-sm` exists at line ~30, `--text-xs` and `--text-nav` do NOT appear.

- [ ] **Step 2: Add the two new tokens immediately after `--text-sm`**

In `src/styles/design-system.css`, find:
```css
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
```
Replace with:
```css
  --text-xs: clamp(0.75rem, 2vw, 0.875rem);
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --text-nav: clamp(1rem, 2.5vw, 1.25rem);
```

- [ ] **Step 3: Verify tokens are present**

Run:
```bash
grep -n "text-xs\|text-sm\|text-nav\|text-base" src/styles/design-system.css
```
Expected — all four tokens appear in order, no duplicates.

- [ ] **Step 4: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat(design-system): add --text-xs and --text-nav tokens"
```

---

### Task 2: Update header.css — desktop nav and mobile overlay nav

**Files:**
- Modify: `src/components/header/header.css`

- [ ] **Step 1: Verify current values**

Run:
```bash
grep -n "clamp\|font-size" src/components/header/header.css
```
Expected — `clamp(1.375rem, 4vw, 1.625rem)` on the desktop nav link, `clamp(2rem, 6vw, 3rem)` on the mobile nav link.

- [ ] **Step 2: Replace desktop nav font-size**

In `src/components/header/header.css`, find:
```css
  font-size: clamp(1.375rem, 4vw, 1.625rem); /* Increased from --text-lg (22-26px) */
```
Replace with:
```css
  font-size: var(--text-nav);
```

- [ ] **Step 3: Replace mobile overlay nav font-size**

In `src/components/header/header.css`, find:
```css
  font-size: clamp(2rem, 6vw, 3rem); /* Custom 4xl equivalent */
```
Replace with:
```css
  font-size: var(--text-3xl);
```

- [ ] **Step 4: Verify no custom font-size clamps remain**

Run:
```bash
grep -n "font-size.*clamp" src/components/header/header.css
```
Expected — zero results.

- [ ] **Step 5: Run header tests**

Run:
```bash
npx vitest run tests/header/ --reporter=verbose
```
Expected — all header tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/header/header.css
git commit -m "fix(header): use --text-nav and --text-3xl tokens for nav font sizes"
```

---

### Task 3: Update footer.css — toggle button font-size

**Files:**
- Modify: `src/components/footer/footer.css`

- [ ] **Step 1: Verify current value**

Run:
```bash
grep -n "font-size" src/components/footer/footer.css
```
Expected — `clamp(0.875rem, 2vw, 1rem)` on `.footer__toggle`.

- [ ] **Step 2: Replace toggle font-size**

In `src/components/footer/footer.css`, find:
```css
  font-size: clamp(0.875rem, 2vw, 1rem);
```
Replace with:
```css
  font-size: var(--text-sm);
```

- [ ] **Step 3: Verify no custom clamps remain**

Run:
```bash
grep -n "clamp" src/components/footer/footer.css
```
Expected — zero results.

- [ ] **Step 4: Run footer tests**

Run:
```bash
npx vitest run tests/footer/ --reporter=verbose
```
Expected — all footer tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/footer/footer.css
git commit -m "fix(footer): use --text-sm token for toggle button font-size"
```

---

### Task 4: Update image-viewer.css — counter desktop and mobile

**Files:**
- Modify: `src/components/image-viewer/image-viewer.css:99,299`

- [ ] **Step 1: Verify current values**

Run:
```bash
grep -n "font-size" src/components/image-viewer/image-viewer.css
```
Expected — `0.875rem` at line ~99 (desktop counter), `0.75rem` at line ~299 (mobile counter inside media query).

- [ ] **Step 2: Replace desktop counter font-size**

In `src/components/image-viewer/image-viewer.css`, find:
```css
  font-size: 0.875rem;
  font-weight: 400;
  user-select: none;
```
Replace with:
```css
  font-size: var(--text-sm);
  font-weight: 400;
  user-select: none;
```

- [ ] **Step 3: Replace mobile counter font-size**

In `src/components/image-viewer/image-viewer.css`, find:
```css
  .viewer__counter {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
```
Replace with:
```css
  .viewer__counter {
    font-size: var(--text-xs);
    padding: 0.375rem 0.75rem;
```

- [ ] **Step 4: Verify no hardcoded font-sizes remain in image-viewer**

Run:
```bash
grep -n "font-size" src/components/image-viewer/image-viewer.css
```
Expected — only `var(--text-sm)` and `var(--text-xs)` appear, no bare rem values.

- [ ] **Step 5: Run image-viewer tests**

Run:
```bash
npx vitest run tests/image-viewer/ --reporter=verbose
```
Expected — all image-viewer tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/image-viewer/image-viewer.css
git commit -m "fix(image-viewer): use --text-sm and --text-xs tokens for counter font sizes"
```

---

### Task 5: Update gallery.css — error icon and fallback icon

**Files:**
- Modify: `src/components/gallery/gallery.css:146,216`

- [ ] **Step 1: Verify current values**

Run:
```bash
grep -n "font-size" src/components/gallery/gallery.css
```
Expected — `2rem` on `.gallery-error-icon` (line ~146), `1.5rem` on `.portfolio-image .error-fallback .icon` (line ~216).

- [ ] **Step 2: Replace `.gallery-error-icon` font-size**

In `src/components/gallery/gallery.css`, find:
```css
.gallery-error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}
```
Replace with:
```css
.gallery-error-icon {
  font-size: var(--text-3xl);
  margin-bottom: 1rem;
}
```

- [ ] **Step 3: Replace `.portfolio-image .error-fallback .icon` font-size**

In `src/components/gallery/gallery.css`, find:
```css
.portfolio-image .error-fallback .icon {
  margin-bottom: var(--space-xs);
  font-size: 1.5rem; /* 24px -> rem */
}
```
Replace with:
```css
.portfolio-image .error-fallback .icon {
  margin-bottom: var(--space-xs);
  font-size: var(--text-2xl);
}
```

- [ ] **Step 4: Verify no hardcoded font-sizes remain in gallery**

Run:
```bash
grep -n "font-size" src/components/gallery/gallery.css
```
Expected — all `font-size` declarations reference `var(--text-*)` tokens, no bare rem values.

- [ ] **Step 5: Run gallery tests**

Run:
```bash
npx vitest run tests/gallery/ --reporter=verbose
```
Expected — all gallery tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/gallery/gallery.css
git commit -m "fix(gallery): use --text-3xl and --text-2xl tokens for icon font sizes"
```

---

### Task 6: Final verification

**Files:** None modified — verification only.

- [ ] **Step 1: Run full test suite**

Run:
```bash
make test-run
```
Expected — all tests pass, coverage ≥ 90%.

- [ ] **Step 2: Verify zero remaining custom font-size values across all 5 files**

Run:
```bash
grep -rn "font-size: [0-9]" \
  src/components/header/header.css \
  src/components/footer/footer.css \
  src/components/image-viewer/image-viewer.css \
  src/components/gallery/gallery.css
```
Expected — zero results.

- [ ] **Step 3: Verify zero remaining custom clamp() font-size values**

Run:
```bash
grep -rn "font-size: clamp" \
  src/components/header/header.css \
  src/components/footer/footer.css \
  src/components/image-viewer/image-viewer.css \
  src/components/gallery/gallery.css
```
Expected — zero results.

- [ ] **Step 4: Visual check in browser**

With `make dev` running, open http://localhost:3001 and verify:
- Desktop nav "About" is smaller than before (16–20px vs 22–26px) — proportionate but still bold
- Footer toggle button text unchanged in appearance
- Image viewer counter unchanged in appearance
- Gallery error states unchanged in appearance (error icons same visual weight)

- [ ] **Step 5: Push**

```bash
git push
```
