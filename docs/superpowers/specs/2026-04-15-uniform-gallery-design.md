# Design: Uniform Gallery (`<uniform-gallery>`)

**Date**: 2026-04-15
**Branch**: `012-grid-design-refactor`
**Status**: Approved — ready for spec + plan

---

## Overview

A new gallery layout component for the portfolio homepage. The existing `<masonry-gallery>` (equal-width columns, vertical flow) is replaced on `index.html` with `<uniform-gallery>` (flexbox justified rows, horizontal flow). Both components remain in the codebase — `masonry-gallery` is not modified or removed.

**Visual behaviour**: All images in a row share the same height. Each image's width is determined by its aspect ratio. Rows fill the full container width edge-to-edge. The last row is left-aligned (does not stretch). Images fade in as they scroll into view.

**Reference**: [tobistings.com](https://www.tobistings.com) — same uniform-height, variable-width row pattern.

---

## Architecture

### New files

```
src/components/uniform-gallery/
├── uniform-gallery.ts          Web Component class
├── uniform-gallery.css         Layout, animation, responsive styles
└── uniform-gallery.types.ts    IUniformGallery interface

tests/uniform-gallery/
├── uniform-gallery-contract.test.ts
├── uniform-gallery-ui.test.ts
├── uniform-gallery-accessibility.test.ts
└── uniform-gallery-performance.test.ts
```

### Modified files

| File | Change |
|---|---|
| `index.html` | Replace `<masonry-gallery>` with `<uniform-gallery>` |
| `src/pages/main.ts` | Import and register `uniform-gallery` component |

### Unchanged files

`masonry-gallery` and all its tests are left completely untouched.

### Reused without modification

| Dependency | Purpose |
|---|---|
| `GalleryDataService` | Fetches + caches image manifest |
| `PictureElementFactory` | Creates `<picture>` elements (AVIF/WebP/JPEG, lazy load) |
| `ImageErrorHandler` | Handles failed image loads |
| `ResponsiveImage` type | Image data shape from manifest |
| `GalleryImageData` type | Shape passed to image viewer |
| `IImageViewer` interface | Viewer integration contract |

---

## Layout Algorithm

### Approach: CSS Flexbox justified rows

The layout is almost entirely CSS. JS sets one custom property (`--ar`) per image at render time. The browser handles all row packing, row breaks, and resize reflow — no JS recalculation on resize.

**Core CSS:**

```css
.uniform-gallery {
  --row-height: 300px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);       /* 8px — matches existing gallery */
}

.gallery-item {
  flex-grow: var(--ar);
  flex-shrink: 1;
  flex-basis: calc(var(--ar) * var(--row-height));
  height: var(--row-height);
  overflow: hidden;
  border-radius: var(--border-radius);
  cursor: pointer;
  position: relative;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Prevents last row from stretching to fill width */
.gallery-spacer {
  flex-grow: 999;
  flex-basis: 0;
  height: 0;
}
```

**How `flex-grow: var(--ar)` works**: items in the same row grow proportionally to their aspect ratio, so a 16:9 image grows wider than a 1:1 square by exactly the right amount. `flex-basis` is the item's natural width at `--row-height`; when combined widths exceed the container, flexbox wraps to a new row.

### Breakpoints

| Viewport | `--row-height` | Typical images/row |
|---|---|---|
| `≥56rem` (896px+) | 300px | 3–4 |
| `36–56rem` (576–896px) | 220px | 3 |
| `<36rem` (≤576px) | — | single column |

**Single column (mobile portrait — `<36rem`):**

```css
@media (max-width: 36rem) {
  .gallery-item {
    flex-basis: 100%;
    height: auto;
    aspect-ratio: var(--ar);   /* preserves natural proportions, no cropping */
  }
  .gallery-spacer { display: none; }
}
```

**iPhone 16 Pro behaviour:**
- Portrait (393px): single column, full-width images at natural aspect ratios
- Landscape (852px): falls in `36–56rem` range → 220px rows, 3–4 images per row

### JS responsibilities (layout only)

```typescript
// For each image, set --ar and append to container
const item = document.createElement('div')
item.className = 'gallery-item'
item.style.setProperty('--ar', image.aspectRatio.toString())
// ...LQIP, picture element, lazy load, click handler
this.appendChild(item)

// Append spacer once at end
const spacer = document.createElement('div')
spacer.className = 'gallery-spacer'
this.appendChild(spacer)
```

No resize handler needed for layout. `ResizeObserver` is retained only for viewer integration (enabling/disabling viewer at mobile).

---

## Scroll-Reveal Animation

**Behaviour**: images fade in (opacity 0 → 1) when they enter the viewport. Uses a second `IntersectionObserver` instance (separate from the lazy-load observer).

```css
.gallery-item {
  opacity: 0;
  transition: opacity 400ms ease-out;
}

.gallery-item.visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .gallery-item {
    opacity: 1;
    transition: none;
  }
}
```

```typescript
private static sharedRevealObserver?: IntersectionObserver

// In setupRevealObserver():
UniformGallery.sharedRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      UniformGallery.sharedRevealObserver?.unobserve(entry.target)
    }
  })
}, { rootMargin: '50px' })

// After creating each item:
UniformGallery.sharedRevealObserver?.observe(item)
```

Above-fold images (first `HIGH_PRIORITY_IMAGE_COUNT`) are set `visible` immediately, no observer needed.

---

## LQIP (Blur Placeholder)

Carried over unchanged from `MasonryGallery`. The `[data-placeholder]` div is absolutely positioned inside each `.gallery-item`, fades out on `img.onload`, then is removed after the transition. CSS is identical to `gallery.css`.

---

## Viewer Integration

Near-identical to `MasonryGallery`:

- `getImages()` returns `GalleryImageData[]` in manifest order
- `setupViewer()` calls `viewer.setImages()` and `viewer.setEnabled()`
- Viewer disabled at `<36rem` (single column — no viewer on mobile)
- Viewer enabled/disabled via `window.matchMedia('(max-width: 36rem)')` — matches the CSS breakpoint exactly, no hardcoded pixel values
- Click handler dispatches `uniform-gallery:image-click` (mirrors `gallery:image-click`)
- `ResizeObserver` watches for viewport changes; on each change re-evaluates the `matchMedia` query to toggle viewer state

---

## Events

| Event | Fired when |
|---|---|
| `uniform-gallery:initialized` | Component fully loaded and rendered |
| `uniform-gallery:image-loaded` | Individual image finishes loading |
| `uniform-gallery:image-click` | User clicks an image |

---

## Accessibility

Carried over from `MasonryGallery`:
- Each image wrapper: `tabindex="0"`, `role="button"`, `aria-label` from image alt text
- Focus ring: `outline: 0.125rem solid var(--color-interactive)`
- Keyboard: Enter/Space opens viewer
- `prefers-reduced-motion`: opacity animation disabled, images rendered visible immediately
- `prefers-contrast: high`: border added to each item

---

## Error States

- Failed manifest load: full-width error message (same template as `MasonryGallery`)
- Individual image load failure: `ImageErrorHandler` replaces image with error state (same as `MasonryGallery`)

---

## Out of Scope

- `masonry-gallery` is not removed, deprecated, or modified
- No toggle between layouts on the same page
- No filtering, sorting, or category navigation
- No EXIF display (Feature 011 handles that; `<exif-display>` communicates via events and works with any gallery component)
- No hover effects (consistent with existing gallery)
- No changes to `gallery-data.json` or image pipeline

---

## Success Criteria

| Criterion | Target |
|---|---|
| Rows fill container edge-to-edge | All rows except last |
| Last row left-aligned | No stretching |
| Portrait mode (iPhone 16 Pro) | Single column, full-width |
| Landscape mode (iPhone 16 Pro) | 3–4 images per row at 220px |
| Scroll reveal | Images fade in on viewport entry |
| LQIP blur-up | Works identically to existing gallery |
| Viewer opens on click | Same behaviour as existing gallery |
| `masonry-gallery` unaffected | All existing tests continue to pass |
| Test coverage | ≥90% across 4 categories |
| Lighthouse | 95+ Performance, 100 Accessibility |
| Bundle size | No new dependencies; JS delta &lt;5KB gzipped |
