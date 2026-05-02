# Gallery Image Reveal Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a gallery image finishes loading, it grows from `scale(0.82)` to `scale(1)` with a fast-start/slow-finish easing, triggered 300ms after the LQIP placeholder finishes fading out.

**Architecture:** Pure CSS change to `uniform-gallery.css`. The JS trigger (`wrapper.classList.add('loaded')` on `img.onload`) already exists and is unchanged. The animation is driven entirely by the `.loaded` class toggling the CSS state of the `img` element inside it. No TS changes required.

**Tech Stack:** CSS transitions, `cubic-bezier`, Vitest for unit tests.

---

## File Map

| File | Change |
|------|--------|
| `src/components/uniform-gallery/uniform-gallery.css` | Add `transform`/`opacity`/`transition` to `.gallery-item picture img`; add `.gallery-item > div.loaded picture img` rule; extend `prefers-reduced-motion` block |
| `tests/uniform-gallery/uniform-gallery-ui.test.ts` | Add test documenting that `loaded` class is added to wrapper on `img` load event (confirms the CSS trigger mechanism) |

---

## Task 1: Create feature worktree

**Files:** none

- [ ] **Step 1: Create worktree**

```bash
git worktree add .worktrees/016-gallery-image-reveal-animation -b 016-gallery-image-reveal-animation
cd .worktrees/016-gallery-image-reveal-animation
```

---

## Task 2: Write test for the `loaded` class trigger

This test documents and protects the mechanism our CSS animation depends on. It tests JS behaviour (not CSS), so it runs cleanly in JSDOM. Note: because `loaded` is already added in the existing `img.onload` handler, this test will pass immediately — it is regression prevention, not a red-green cycle.

**Files:**
- Modify: `tests/uniform-gallery/uniform-gallery-ui.test.ts`

- [ ] **Step 1: Add test inside the existing `'Reveal animation'` describe block**

Open `tests/uniform-gallery/uniform-gallery-ui.test.ts`. Locate the `describe('Reveal animation', ...)` block (around line 93) and add after the existing test:

```typescript
it('should add loaded class to wrapper div when img fires onload', () => {
  const item = gallery.querySelector<HTMLElement>('.gallery-item')
  const wrapper = item?.querySelector<HTMLElement>(':scope > div')
  const img = wrapper?.querySelector<HTMLImageElement>('img')

  expect(wrapper?.classList.contains('loaded')).toBe(false)
  img?.dispatchEvent(new Event('load'))
  expect(wrapper?.classList.contains('loaded')).toBe(true)
})

it('should nest img as .gallery-item > div picture img so animation CSS selector matches', () => {
  const img = gallery.querySelector<HTMLImageElement>('.gallery-item > div picture img')
  expect(img).not.toBeNull()
})
```

- [ ] **Step 2: Run the new tests to confirm they pass**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-ui.test.ts
```

Expected: all tests in this file pass, including the two new ones.

- [ ] **Step 3: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-ui.test.ts
git commit -m "test: document loaded class trigger and img selector for reveal animation"
```

---

## Task 3: Implement the CSS animation

**Files:**
- Modify: `src/components/uniform-gallery/uniform-gallery.css`

- [ ] **Step 1: Add initial animation state to the img rule**

Find the existing rule (around line 72):

```css
.gallery-item picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

Replace it with:

```css
.gallery-item picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(0.82);
  opacity: 0;
  transform-origin: center center;
  transition:
    transform 1600ms cubic-bezier(0.33, 1, 0.68, 1) 300ms,
    opacity   600ms ease-out 300ms;
}
```

The 300ms delay on both properties means the animation waits for the LQIP's 300ms fade-out to complete before the image starts growing in.

- [ ] **Step 2: Add the triggered state rule**

Directly after the rule you just edited, add:

```css
.gallery-item > div.loaded picture img {
  transform: scale(1);
  opacity: 1;
}
```

- [ ] **Step 3: Extend the `prefers-reduced-motion` block**

Find the existing `prefers-reduced-motion` block (near the bottom of the file):

```css
@media (prefers-reduced-motion: reduce) {
  .gallery-item {
    opacity: 1;           /* skip reveal animation */
    transition: none;
  }
  .gallery-item > div:not(.loaded)::before {
    animation: none;
  }
  .gallery-item [data-placeholder] {
    transition: none;
  }
}
```

Replace it with:

```css
@media (prefers-reduced-motion: reduce) {
  .gallery-item {
    opacity: 1;
    transition: none;
  }
  .gallery-item > div:not(.loaded)::before {
    animation: none;
  }
  .gallery-item [data-placeholder] {
    transition: none;
  }
  .gallery-item picture img {
    transform: none;
    opacity: 1;
    transition: none;
  }
}
```

- [ ] **Step 4: Run the full test suite**

```bash
make test-run
```

Expected: all tests pass. The CSS change adds no JS-observable side effects, so no existing tests should fail.

- [ ] **Step 5: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.css
git commit -m "feat: add center-out scale reveal animation on image load in uniform-gallery"
```

---

## Task 4: Visual smoke test

**Files:** none — observation only

- [ ] **Step 1: Start the dev server**

```bash
make dev
```

Open `http://localhost:3000` in the browser.

- [ ] **Step 2: Verify the animation sequence**

On page load, above-fold images (first 3) should:
1. Show the blurry LQIP placeholder while loading
2. LQIP fades out (300ms)
3. Real image grows from slightly smaller → full size with a fast-start/slow-finish feel over ~1600ms

To test below-fold images, throttle the network (DevTools → Network → Slow 3G), scroll down, and observe the same sequence.

- [ ] **Step 3: Verify reduced-motion**

In DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Reload. Images should appear instantly at full size with no animation.

- [ ] **Step 4: Stop the dev server**

`Ctrl+C`

---

## Task 5: Open pull request

- [ ] **Step 1: Push branch**

```bash
git push -u origin 016-gallery-image-reveal-animation
```

- [ ] **Step 2: Open PR targeting `develop`**

```bash
gh pr create \
  --base develop \
  --title "feat: gallery image reveal — scale from center on load" \
  --body "$(cat <<'EOF'
## Summary

- Images in `uniform-gallery` now grow from `scale(0.82)` → `scale(1)` after the LQIP placeholder fades out
- Animation is pure CSS; JS trigger (`loaded` class on `img.onload`) was already in place
- Fast-start/slow-finish easing (`cubic-bezier(0.33, 1, 0.68, 1)`), 1600ms, 300ms delay after LQIP clears
- `prefers-reduced-motion: reduce` skips the animation entirely

## Test plan

- [ ] Run `make test-run` — all tests pass
- [ ] Visual check: above-fold images animate on page load
- [ ] Visual check: below-fold images animate when loaded (throttle network to observe)
- [ ] Visual check: `prefers-reduced-motion` emulation shows instant appearance, no animation
EOF
)"
```
