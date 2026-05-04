# Gallery Image Reveal Animation — Design Spec

**Date**: 2026-05-02  
**Status**: Approved  
**Component**: `uniform-gallery`

---

## Overview

When a gallery image finishes loading, the real image grows from slightly smaller than its container to full size, with a fast-start/slow-finish easing. This gives each image a sense of physically arriving into the space rather than just appearing.

The animation is deliberately decoupled from scroll reveal — the existing viewport-entry fade (opacity on `.gallery-item`) is unchanged.

---

## Behaviour

### Trigger

The animation fires when the real image finishes loading (`img.onload`). The existing JS already adds `loaded` to the wrapper div at that moment — no TS changes are required.

### Sequence

1. **t=0** — Image loads. `loaded` class added to wrapper. LQIP placeholder begins fading out (existing 300ms `opacity` transition).  
2. **t=0–300ms** — LQIP fades. Real image is in its initial state (`scale(0.82)`, `opacity(0)`), hidden behind the fading LQIP.  
3. **t=300ms** — LQIP is gone. Scale + fade animation begins on the real image.  
4. **t=300–1900ms** — Image grows from `scale(0.82)` → `scale(1)` and `opacity(0)` → `opacity(1)`.  

### Animation parameters

| Property    | Value                                  |
|-------------|----------------------------------------|
| Transform   | `scale(0.82)` → `scale(1)`             |
| Opacity     | `0` → `1`                              |
| Origin      | `center center` (default)              |
| Duration    | `transform`: 1600ms / `opacity`: 600ms |
| Delay       | 300ms (waits for LQIP to clear)        |
| Easing      | `cubic-bezier(0.33, 1, 0.68, 1)` on transform, `ease-out` on opacity |

The transform easing is a gentler ease-out cubic — fast at the start, decelerating smoothly into full size. Opacity resolves well before the scale does so the image is fully visible while still settling.

---

## CSS Implementation

### Initial state (added to existing img rule)

```css
.gallery-item picture img {
  /* existing: width, height, object-fit, display */
  transform: scale(0.82);
  opacity: 0;
  transform-origin: center center;
  transition:
    transform 1600ms cubic-bezier(0.33, 1, 0.68, 1) 300ms,
    opacity   600ms ease-out 300ms;
}
```

### Triggered state (new rule)

```css
.gallery-item > div.loaded picture img {
  transform: scale(1);
  opacity: 1;
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .gallery-item picture img {
    transform: none;
    opacity: 1;
    transition: none;
  }
}
```

---

## Scope

- **Applies to**: `uniform-gallery` only.  
- **Scroll reveal**: The existing `opacity` transition on `.gallery-item` (viewport entry) is unchanged.  
- **Above-fold images**: First 3 images get `visible` immediately on page load. Their scale animation fires as soon as their `img.onload` fires — no scroll interaction needed.  
- **Below-fold images**: Items scroll into view (existing opacity reveal), then the scale animation fires whenever their image load completes.  

---

## What is not changing

- The scroll-reveal mechanism (IntersectionObserver + `visible` class)  
- The LQIP fade-out timing (300ms)  
- The loading spinner  
- Any JS in `uniform-gallery.ts`  
- The `gallery` (masonry) component — out of scope  
