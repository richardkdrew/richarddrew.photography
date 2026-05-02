# Justified Gallery Layout — Design Spec

**Date**: 2026-05-02
**Status**: Approved
**Component**: `uniform-gallery`

---

## Overview

Replace the current CSS flex-grow layout (which distorts image aspect ratios) with a JS-computed justified layout. Each row contains images at their natural aspect ratio, all at the same height, and the row fills the full container width. Row height varies between rows. The last row is left-aligned at the target height rather than stretched to fill.

---

## Problem with Current Layout

The current approach sets a fixed `--row-height` CSS variable and uses `flex-grow: var(--ar)` to distribute space. This causes items to grow beyond their natural aspect ratio to fill the row. `object-fit: cover` then crops the image to hide the distortion. The result: the container shape does not match the image's natural AR, producing a visible mismatch when the same image is shown at natural AR in the full-screen viewer.

---

## Behaviour

### Layout algorithm

Given `images`, `containerWidth`, `targetHeight`, and `gap`:

1. Iterate images greedily, accumulating a row.
2. After each candidate addition, compute: `rowHeight = (containerWidth - gap × (n - 1)) / sumAR`
3. If `rowHeight < targetHeight × MIN_ROW_RATIO` and the row is not empty, finalise the current row and start a new one with the current image.
4. The last row is **not** stretched to fill. Items are left-aligned at `targetHeight`.

### Constants (tunable after visual QA)

| Constant | Value | Notes |
| --- | --- | --- |
| `TARGET_HEIGHT` | `300` px | Starting row height for row-break decisions |
| `GAP` | `10` px | Must match `gap: 0.625rem` in CSS |
| `MIN_ROW_RATIO` | `0.6` | Rows won't go below `TARGET_HEIGHT × 0.6` = 180px |

### Last row

Left-aligned at `TARGET_HEIGHT`. Items do not expand to fill the container. Gap on the right. This is the behaviour used by Flickr Justified Layout and Google Photos.

### Mobile (`containerWidth ≤ 576px`)

JS layout is skipped. The CSS mobile breakpoint (`flex-basis: 100%; height: auto; aspect-ratio: var(--ar)`) handles layout. If inline styles were previously applied (e.g., after a resize from desktop), they are cleared.

### Resize

The existing `ResizeObserver` is extended to call `applyLayout(contentRect.width)` on each width change. Debounced with `requestAnimationFrame` to avoid layout thrash during live resize.

---

## File Map

| File | Change |
| --- | --- |
| `src/components/uniform-gallery/uniform-gallery.layout.ts` | **New.** Pure `computeRows()` function and associated types |
| `src/components/uniform-gallery/uniform-gallery.ts` | Add `applyLayout()`, update ResizeObserver callback |
| `src/components/uniform-gallery/uniform-gallery.css` | Remove CSS-based item sizing; keep flex container and mobile breakpoint |
| `tests/uniform-gallery/uniform-gallery-contract.test.ts` | Add unit tests for `computeRows()` |
| `tests/uniform-gallery/uniform-gallery-ui.test.ts` | Add tests that items have correct inline styles after render |

---

## New File: `uniform-gallery.layout.ts`

### Types

```typescript
export interface LayoutItem {
  aspectRatio: number
  width: number   // computed px width for this row
}

export interface LayoutRow {
  items: LayoutItem[]
  height: number  // computed px height
  isLastRow: boolean
}
```

### Function signature

```typescript
export function computeRows(
  aspectRatios: number[],
  containerWidth: number,
  targetHeight: number,
  gap: number,
  minRowRatio: number
): LayoutRow[]
```

- Takes plain `number[]` (not `ResponsiveImage[]`) so it has zero component dependencies.
- Returns `LayoutRow[]`. The caller maps indices back to DOM items.
- Returns `[]` if `containerWidth <= 0` or `aspectRatios` is empty.

### Algorithm (pseudo-code)

```text
rows = []
currentARs = []
currentSum = 0

for each ar in aspectRatios:
  candidateSum = currentSum + ar
  gaps = gap × currentARs.length          // gaps between items already in row + new one
  candidateHeight = (containerWidth - gaps) / candidateSum

  if candidateHeight < targetHeight × minRowRatio AND currentARs.length > 0:
    rows.push(finalise(currentARs, currentSum, containerWidth, gap, false, targetHeight))
    currentARs = [ar]
    currentSum = ar
  else:
    currentARs.push(ar)
    currentSum = candidateSum

if currentARs.length > 0:
  rows.push(finalise(currentARs, currentSum, containerWidth, gap, true, targetHeight))

return rows

---

finalise(ars, sumAR, containerWidth, gap, isLastRow, targetHeight):
  height = isLastRow
    ? targetHeight
    : (containerWidth - gap × (ars.length - 1)) / sumAR
  items = ars.map(ar => ({ aspectRatio: ar, width: ar × height }))
  return { items, height, isLastRow }
```

---

## Changes to `uniform-gallery.ts`

### New constants (top of class)

```typescript
private static readonly LAYOUT_TARGET_HEIGHT = 300
private static readonly LAYOUT_GAP = 10
private static readonly LAYOUT_MIN_ROW_RATIO = 0.6
private static readonly MOBILE_BREAKPOINT = 576
```

### New method: `applyLayout(containerWidth: number)`

```typescript
private applyLayout(containerWidth: number): void {
  const items = Array.from(this.querySelectorAll<HTMLElement>('.gallery-item'))
  if (!items.length) return

  if (containerWidth <= UniformGallery.MOBILE_BREAKPOINT) {
    // Clear any previously-applied inline styles
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

### Call site

Call `this.applyLayout(this.clientWidth)` at the end of `renderImages()`. Use `clientWidth` rather than `offsetWidth` — both work once the element is in the DOM, but `clientWidth` excludes borders, which is the correct measure for content layout. If `clientWidth` is `0` (element not yet laid out), `applyLayout` returns early because `computeRows` returns `[]` for `containerWidth <= 0`.

### ResizeObserver update

In `setupResizeObserver`, the existing callback iterates `observedGalleries` to update viewer enabled state. Extend it to also call `applyLayout`. The `rafPending` flag must be declared **outside** the callback so it persists between invocations:

```typescript
let rafPending = false
UniformGallery.sharedResizeObserver = new ResizeObserver((entries) => {
  if (!rafPending) {
    rafPending = true
    requestAnimationFrame(() => {
      rafPending = false
      entries.forEach(entry => {
        const gallery = entry.target as UniformGallery
        gallery.applyLayout(entry.contentRect.width)
        if (gallery.viewer) gallery.viewer.setEnabled(!gallery.isMobile())
      })
    })
  }
})
```

---

## Changes to `uniform-gallery.css`

### Remove from `.gallery-item`

```css
/* REMOVE these three lines: */
flex-grow: var(--ar);
flex-basis: calc(var(--ar) * var(--row-height));
height: var(--row-height);
```

### Remove from `.uniform-gallery`

```css
/* REMOVE: */
--row-height: 18.75rem;
```

### Remove tablet breakpoint

```css
/* REMOVE entirely: */
@media (min-width: 36rem) and (max-width: 56rem) {
  .uniform-gallery {
    --row-height: 17.5rem;
  }
}
```

### Keep unchanged

- `gap: 0.625rem` on `.uniform-gallery`
- Mobile breakpoint (`flex-basis: 100%; height: auto; aspect-ratio: var(--ar)`)
- All other `.gallery-item` rules (overflow, border-radius, cursor, opacity transition, etc.)
- The `.gallery-spacer` (still absorbs leftover space on last row)

---

## Testing

### `uniform-gallery-contract.test.ts` — `computeRows()` unit tests

```typescript
describe('computeRows()', () => {
  it('fills a single row of two landscape images', () => {
    const rows = computeRows([1.5, 2.0], 1000, 300, 10, 0.6)
    expect(rows).toHaveLength(1)
    expect(rows[0].isLastRow).toBe(true)
    expect(rows[0].height).toBe(300)  // last row = targetHeight
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 300)
  })

  it('breaks into two rows when height would drop below minimum', () => {
    // 6 equal AR=1 images at 600px container, gap=0, target=300, min=0.6 → min=180px
    // 1 image: height=600 ✓, 2: 300 ✓, 3: 200 ✓, 4: 150 < 180 → break at 3
    const rows = computeRows([1,1,1,1,1,1], 600, 300, 0, 0.6)
    expect(rows).toHaveLength(2)
    expect(rows[0].items).toHaveLength(3)
    expect(rows[1].isLastRow).toBe(true)
  })

  it('last row uses targetHeight regardless of aspect ratios', () => {
    const rows = computeRows([1.5, 2.0, 0.5], 1200, 300, 10, 0.6)
    const lastRow = rows[rows.length - 1]
    expect(lastRow.isLastRow).toBe(true)
    expect(lastRow.height).toBe(300)
  })

  it('returns [] for containerWidth <= 0', () => {
    expect(computeRows([1, 1], 0, 300, 10, 0.6)).toEqual([])
  })

  it('returns [] for empty aspectRatios', () => {
    expect(computeRows([], 1200, 300, 10, 0.6)).toEqual([])
  })

  it('item widths equal aspectRatio × rowHeight', () => {
    const rows = computeRows([1.5, 2.0], 710, 300, 10, 0.6)
    // single row (not last): height = (710-10) / (1.5+2.0) = 700/3.5 = 200
    expect(rows[0].height).toBeCloseTo(200)
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 200)
    expect(rows[0].items[1].width).toBeCloseTo(2.0 * 200)
  })
})
```

### `uniform-gallery-ui.test.ts` — inline style tests

Add inside the `describe('Rendering')` block:

```typescript
it('should apply inline width and height to each gallery item', () => {
  const items = gallery.querySelectorAll<HTMLElement>('.gallery-item')
  items.forEach(item => {
    expect(item.style.width).toBeTruthy()
    expect(item.style.height).toBeTruthy()
  })
})

it('should set flex-grow to 0 on each gallery item', () => {
  const items = gallery.querySelectorAll<HTMLElement>('.gallery-item')
  items.forEach(item => {
    expect(item.style.flexGrow).toBe('0')
  })
})
```

---

## What Is Not Changing

- The scroll-reveal mechanism (IntersectionObserver + `visible` class)
- The LQIP fade-out and image reveal animation (Feature 016)
- The loading spinner
- The image viewer component
- The gallery-to-viewer click integration
- Mobile layout (CSS handles it; JS skips it)
- The `gallery` (masonry) component — out of scope
- The `--ar` CSS custom property on items (still needed for mobile `aspect-ratio`)
