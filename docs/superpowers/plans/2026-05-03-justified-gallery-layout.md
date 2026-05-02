# Justified Gallery Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the distorted CSS flex-grow gallery layout with a JS-computed justified layout where each row's images display at their natural aspect ratio, all at the same height, filling the full container width.

**Architecture:** A new pure function `computeRows()` in `uniform-gallery.layout.ts` computes row heights and item widths from aspect ratios alone — no DOM required. A new `applyLayout(containerWidth)` method on `UniformGallery` calls this function and injects inline `width`/`height`/`flexBasis`/`flexGrow` styles on each `.gallery-item`. The existing `ResizeObserver` is extended to call `applyLayout` on container width changes, debounced with `requestAnimationFrame`. Mobile (`≤576px`) clears inline styles and defers to CSS.

**Tech Stack:** TypeScript, CSS, Vitest.

---

## File Map

| File | Change |
| --- | --- |
| `src/components/uniform-gallery/uniform-gallery.layout.ts` | **New.** `computeRows()` pure function and `LayoutRow`/`LayoutItem` types |
| `src/components/uniform-gallery/uniform-gallery.ts` | Add `applyLayout()`, 4 constants, `layoutRafPending` flag; update `renderImages()` and `setupResizeObserver()` |
| `src/components/uniform-gallery/uniform-gallery.css` | Remove `--row-height`, `flex-grow`, `flex-basis`, `height` from items; remove tablet breakpoint |
| `tests/uniform-gallery/uniform-gallery-contract.test.ts` | Add `computeRows()` unit tests |
| `tests/uniform-gallery/uniform-gallery-ui.test.ts` | Add `describe('Layout')` block with `clientWidth` mock |

---

## Task 1: Create feature worktree

**Files:** none

- [ ] **Step 1: Create worktree**

```bash
git worktree add .worktrees/017-justified-gallery-layout -b 017-justified-gallery-layout
```

All subsequent work is done inside `.worktrees/017-justified-gallery-layout`.

---

## Task 2: Write failing tests for `computeRows`

**Files:**
- Modify: `tests/uniform-gallery/uniform-gallery-contract.test.ts`

- [ ] **Step 1: Add import at the top of the file**

Open `tests/uniform-gallery/uniform-gallery-contract.test.ts`. After the existing imports (line 6), add:

```typescript
import { computeRows } from '../../src/components/uniform-gallery/uniform-gallery.layout'
```

- [ ] **Step 2: Add `describe('computeRows()')` block**

At the end of the file, inside `describe('UniformGallery Contract Tests', () => { ... })`, add this block (before the closing `}`):

```typescript
describe('computeRows()', () => {
  it('returns [] for containerWidth <= 0', () => {
    expect(computeRows([1, 1], 0, 300, 10, 0.6)).toEqual([])
  })

  it('returns [] for empty aspectRatios', () => {
    expect(computeRows([], 1200, 300, 10, 0.6)).toEqual([])
  })

  it('single group of images becomes one last row at targetHeight', () => {
    const rows = computeRows([1.5, 2.0], 1000, 300, 10, 0.6)
    expect(rows).toHaveLength(1)
    expect(rows[0].isLastRow).toBe(true)
    expect(rows[0].height).toBe(300)
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 300)
    expect(rows[0].items[1].width).toBeCloseTo(2.0 * 300)
  })

  it('breaks into two rows when height would drop below minimum', () => {
    // 6 equal AR=1 images at 600px container, gap=0, target=300, minRatio=0.6 (min=180px)
    // After 3 images: height = 600/3 = 200 > 180 ✓
    // Adding 4th: height = 600/4 = 150 < 180 → row breaks
    const rows = computeRows([1, 1, 1, 1, 1, 1], 600, 300, 0, 0.6)
    expect(rows).toHaveLength(2)
    expect(rows[0].items).toHaveLength(3)
    expect(rows[0].isLastRow).toBe(false)
    expect(rows[1].isLastRow).toBe(true)
  })

  it('last row always uses targetHeight, not computed height', () => {
    const rows = computeRows([1.5, 2.0, 0.5], 1200, 300, 10, 0.6)
    const lastRow = rows[rows.length - 1]
    expect(lastRow.isLastRow).toBe(true)
    expect(lastRow.height).toBe(300)
  })

  it('non-last row height = (containerWidth - gaps) / sumAR', () => {
    // [1.5, 2.0] fills first row; adding 1.0 would drop height below min (153 < 180)
    // so first row is finalised at height = (710-10)/(1.5+2.0) = 700/3.5 = 200
    const rows = computeRows([1.5, 2.0, 1.0], 710, 300, 10, 0.6)
    expect(rows[0].isLastRow).toBe(false)
    expect(rows[0].height).toBeCloseTo(200)
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 200)
    expect(rows[0].items[1].width).toBeCloseTo(2.0 * 200)
  })

  it('each item width = aspectRatio × row height', () => {
    const rows = computeRows([1.5, 0.75, 1.33], 1200, 300, 10, 0.6)
    for (const row of rows) {
      for (const item of row.items) {
        expect(item.width).toBeCloseTo(item.aspectRatio * row.height)
      }
    }
  })
})
```

- [ ] **Step 3: Run the new tests to confirm they fail**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-contract.test.ts
```

Expected: tests fail with `Cannot find module '../../src/components/uniform-gallery/uniform-gallery.layout'`.

- [ ] **Step 4: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-contract.test.ts
git commit -m "test: add failing computeRows unit tests"
```

---

## Task 3: Implement `computeRows` in `uniform-gallery.layout.ts`

**Files:**
- Create: `src/components/uniform-gallery/uniform-gallery.layout.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/components/uniform-gallery/uniform-gallery.layout.ts

export interface LayoutItem {
  aspectRatio: number
  width: number
}

export interface LayoutRow {
  items: LayoutItem[]
  height: number
  isLastRow: boolean
}

export function computeRows(
  aspectRatios: number[],
  containerWidth: number,
  targetHeight: number,
  gap: number,
  minRowRatio: number
): LayoutRow[] {
  if (containerWidth <= 0 || aspectRatios.length === 0) return []

  const minHeight = targetHeight * minRowRatio
  const rows: LayoutRow[] = []
  let currentARs: number[] = []
  let currentSum = 0

  for (const ar of aspectRatios) {
    const candidateSum = currentSum + ar
    const gaps = gap * currentARs.length
    const candidateHeight = (containerWidth - gaps) / candidateSum

    if (currentARs.length > 0 && candidateHeight < minHeight) {
      rows.push(finaliseRow(currentARs, currentSum, containerWidth, gap, false, targetHeight))
      currentARs = [ar]
      currentSum = ar
    } else {
      currentARs.push(ar)
      currentSum = candidateSum
    }
  }

  if (currentARs.length > 0) {
    rows.push(finaliseRow(currentARs, currentSum, containerWidth, gap, true, targetHeight))
  }

  return rows
}

function finaliseRow(
  ars: number[],
  sumAR: number,
  containerWidth: number,
  gap: number,
  isLastRow: boolean,
  targetHeight: number
): LayoutRow {
  const height = isLastRow
    ? targetHeight
    : (containerWidth - gap * (ars.length - 1)) / sumAR
  return {
    items: ars.map(ar => ({ aspectRatio: ar, width: ar * height })),
    height,
    isLastRow
  }
}
```

- [ ] **Step 2: Run the tests to confirm they pass**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-contract.test.ts
```

Expected: all tests in this file pass, including all `computeRows()` tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.layout.ts
git commit -m "feat: add computeRows pure function for justified layout"
```

---

## Task 4: Write failing UI tests for inline layout styles

**Files:**
- Modify: `tests/uniform-gallery/uniform-gallery-ui.test.ts`

- [ ] **Step 1: Add `describe('Layout')` block**

Open `tests/uniform-gallery/uniform-gallery-ui.test.ts`. Add this new describe block at the end of the file, inside the outer `describe('UniformGallery UI Tests', ...)` block (before its closing `}`):

```typescript
describe('Layout', () => {
  let layoutGallery: UniformGallery
  let layoutContainer: HTMLElement

  beforeEach(async () => {
    // Make clientWidth return 1200 so applyLayout computes non-zero widths/heights
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 1200
    })
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ images: TEST_IMAGES })
    } as Response)
    layoutContainer = document.createElement('div')
    document.body.appendChild(layoutContainer)
    layoutGallery = document.createElement('uniform-gallery') as UniformGallery
    layoutGallery.setAttribute('data-manifest-url', '/test.json')
    layoutContainer.appendChild(layoutGallery)
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterEach(() => {
    layoutContainer.parentNode && document.body.removeChild(layoutContainer)
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 0
    })
  })

  it('should apply inline width and height to each gallery item', () => {
    const items = layoutGallery.querySelectorAll<HTMLElement>('.gallery-item')
    expect(items.length).toBeGreaterThan(0)
    items.forEach(item => {
      expect(item.style.width).toBeTruthy()
      expect(item.style.height).toBeTruthy()
    })
  })

  it('should set flex-grow to 0 on each gallery item', () => {
    const items = layoutGallery.querySelectorAll<HTMLElement>('.gallery-item')
    items.forEach(item => {
      expect(item.style.flexGrow).toBe('0')
    })
  })

  it('should set flex-basis equal to item width on each gallery item', () => {
    const items = layoutGallery.querySelectorAll<HTMLElement>('.gallery-item')
    items.forEach(item => {
      expect(item.style.flexBasis).toBe(item.style.width)
    })
  })
})
```

- [ ] **Step 2: Run the new tests to confirm they fail**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-ui.test.ts
```

Expected: the three new `Layout` tests fail with something like `expect(received).toBeTruthy()` (empty strings because `applyLayout` doesn't exist yet).

- [ ] **Step 3: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-ui.test.ts
git commit -m "test: add failing UI tests for inline layout styles"
```

---

## Task 5: Add `applyLayout` to `uniform-gallery.ts`

**Files:**
- Modify: `src/components/uniform-gallery/uniform-gallery.ts`

- [ ] **Step 1: Add import for `computeRows`**

At the top of `src/components/uniform-gallery/uniform-gallery.ts`, after the existing imports (line ~11), add:

```typescript
import { computeRows } from './uniform-gallery.layout'
```

- [ ] **Step 2: Add four constants and `layoutRafPending` to the class**

Inside the `UniformGallery` class, after the existing `private static readonly HIGH_PRIORITY_IMAGE_COUNT = 3` line, add:

```typescript
private static readonly LAYOUT_TARGET_HEIGHT = 300
private static readonly LAYOUT_GAP = 10
private static readonly LAYOUT_MIN_ROW_RATIO = 0.6
private static readonly MOBILE_BREAKPOINT = 576
private static layoutRafPending = false
```

- [ ] **Step 3: Add the `applyLayout` method**

Add this private method to the class, after the `renderImages()` method:

```typescript
private applyLayout(containerWidth: number): void {
  const items = Array.from(this.querySelectorAll<HTMLElement>('.gallery-item'))
  if (!items.length) return

  if (containerWidth <= UniformGallery.MOBILE_BREAKPOINT) {
    items.forEach(item => {
      item.style.removeProperty('width')
      item.style.removeProperty('height')
      item.style.removeProperty('flex-basis')
      item.style.removeProperty('flex-grow')
    })
    return
  }

  const rows = computeRows(
    this.images.map(img => img.aspectRatio),
    containerWidth,
    UniformGallery.LAYOUT_TARGET_HEIGHT,
    UniformGallery.LAYOUT_GAP,
    UniformGallery.LAYOUT_MIN_ROW_RATIO
  )

  let itemIndex = 0
  for (const row of rows) {
    for (const layoutItem of row.items) {
      const el = items[itemIndex++]
      if (!el) continue
      el.style.width = `${layoutItem.width}px`
      el.style.height = `${row.height}px`
      el.style.flexBasis = `${layoutItem.width}px`
      el.style.flexGrow = '0'
    }
  }
}
```

- [ ] **Step 4: Call `applyLayout` at the end of `renderImages()`**

Find the `renderImages()` method (around line 85). At the very end of that method, after `this.appendChild(spacer)`, add:

```typescript
this.applyLayout(this.clientWidth)
```

The full end of `renderImages()` should look like:

```typescript
  private renderImages(): void {
    this.innerHTML = ''

    this.images.forEach((image, index) => {
      const item = this.createItem(image, index)
      this.appendChild(item)
    })

    const spacer = document.createElement('div')
    spacer.className = 'gallery-spacer'
    this.appendChild(spacer)

    this.applyLayout(this.clientWidth)
  }
```

- [ ] **Step 5: Update `setupResizeObserver` to call `applyLayout`**

Find the existing `setupResizeObserver()` method. Replace the entire method with:

```typescript
private setupResizeObserver(): void {
  if (!UniformGallery.sharedResizeObserver) {
    UniformGallery.sharedResizeObserver = new ResizeObserver((entries) => {
      if (!UniformGallery.layoutRafPending) {
        UniformGallery.layoutRafPending = true
        requestAnimationFrame(() => {
          UniformGallery.layoutRafPending = false
          entries.forEach(entry => {
            const gallery = entry.target as UniformGallery
            gallery.applyLayout(entry.contentRect.width)
            if (gallery.viewer) gallery.viewer.setEnabled(!gallery.isMobile())
          })
        })
      }
    })
  }
  UniformGallery.observedGalleries.add(this)
  UniformGallery.sharedResizeObserver.observe(this)
}
```

- [ ] **Step 6: Run all tests to confirm the new layout tests pass**

```bash
npx vitest run tests/uniform-gallery/
```

Expected: all tests in the `uniform-gallery` folder pass, including the three new `Layout` tests.

- [ ] **Step 7: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.ts
git commit -m "feat: add applyLayout method and wire up justified layout computation"
```

---

## Task 6: Remove old CSS-based item sizing

**Files:**
- Modify: `src/components/uniform-gallery/uniform-gallery.css`

The current CSS drives item layout with `flex-grow`, `flex-basis`, and `height`. These are now overridden by inline styles from JS. Removing them prevents confusion and eliminates the distorted layout fallback.

- [ ] **Step 1: Remove `--row-height` from `.uniform-gallery`**

Find the `.uniform-gallery` rule near the top of the file. It currently reads:

```css
.uniform-gallery {
  --row-height: 18.75rem;  /* 300px */
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;               /* 10px */
  width: 100%;
  box-sizing: border-box;
  background: var(--color-pure);
  position: relative;
  z-index: 10;
}
```

Remove the `--row-height` line. Result:

```css
.uniform-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;               /* 10px */
  width: 100%;
  box-sizing: border-box;
  background: var(--color-pure);
  position: relative;
  z-index: 10;
}
```

- [ ] **Step 2: Remove `flex-grow`, `flex-basis`, and `height` from `.gallery-item`**

Find the `.gallery-item` rule. It currently reads:

```css
.gallery-item {
  flex-grow: var(--ar);
  flex-shrink: 1;
  flex-basis: calc(var(--ar) * var(--row-height));
  height: var(--row-height);
  overflow: hidden;
  border-radius: var(--border-radius);
  cursor: pointer;
  position: relative;

  /* Scroll-reveal: start hidden, transition to visible */
  opacity: 0;
  transition: opacity 400ms ease-out;
}
```

Remove the three lines `flex-grow`, `flex-basis`, and `height`. Result:

```css
.gallery-item {
  flex-shrink: 1;
  overflow: hidden;
  border-radius: var(--border-radius);
  cursor: pointer;
  position: relative;

  /* Scroll-reveal: start hidden, transition to visible */
  opacity: 0;
  transition: opacity 400ms ease-out;
}
```

- [ ] **Step 3: Remove the tablet breakpoint**

Find and remove this entire block:

```css
@media (min-width: 36rem) and (max-width: 56rem) {  /* 576–896px tablet */
  .uniform-gallery {
    --row-height: 17.5rem;  /* 280px */
  }
}
```

- [ ] **Step 4: Run the full test suite**

```bash
make test-run
```

Expected: all tests pass. CSS changes have no JS-observable side effects in JSDOM.

- [ ] **Step 5: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.css
git commit -m "feat: remove CSS flex-grow layout in favour of JS-computed justified layout"
```

---

## Task 7: Visual smoke test

**Files:** none — observation only

- [ ] **Step 1: Start dev server**

```bash
make dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify justified layout on desktop**

Gallery should show rows where all images in a row share the same height, and each row fills the full container width. Images should appear at their natural aspect ratios (no stretching/cropping of the container shape).

- [ ] **Step 3: Verify last row**

The last row should show images left-aligned at ~300px tall with empty space on the right — not stretched to fill.

- [ ] **Step 4: Verify resize behaviour**

Drag the browser window narrower and wider. The layout should recalculate smoothly with no visual glitches.

- [ ] **Step 5: Verify mobile layout**

Resize browser to ≤576px wide (or use DevTools device emulation). Images should revert to full-width stacked layout with natural aspect ratios.

- [ ] **Step 6: Verify image viewer consistency**

Click any gallery image to open the viewer. The image in the viewer should look proportionally consistent with how it appeared in the gallery.

- [ ] **Step 7: Stop dev server**

`Ctrl+C`

---

## Task 8: Open pull request

- [ ] **Step 1: Push branch**

```bash
git push -u origin 017-justified-gallery-layout
```

- [ ] **Step 2: Open PR targeting `develop`**

```bash
gh pr create \
  --base develop \
  --title "feat: justified gallery layout — natural aspect ratios, same height per row" \
  --body "$(cat <<'EOF'
## Summary

- Replaces the distorted CSS `flex-grow` layout with a JS-computed justified layout
- Each row: images at natural aspect ratio, all the same height, filling full container width
- Row height varies between rows; last row is left-aligned at 300px (no stretch)
- Pure `computeRows()` function in `uniform-gallery.layout.ts` — zero DOM dependencies, fully unit-tested
- `applyLayout()` injects inline `width`/`height`/`flex-basis`/`flex-grow: 0` per item
- `ResizeObserver` extended to recalculate layout on container width change (rAF-debounced)
- Mobile (≤576px): inline styles cleared, CSS handles full-width stacked layout unchanged

## Test plan

- [ ] Run `make test-run` — all tests pass
- [ ] Visual check: gallery rows show images at natural AR, same height per row, full-width rows
- [ ] Visual check: last row is left-aligned, not stretched
- [ ] Visual check: resize window — layout recalculates smoothly
- [ ] Visual check: mobile — full-width stacked layout unchanged
- [ ] Visual check: open image viewer — proportions consistent with gallery
EOF
)"
```
