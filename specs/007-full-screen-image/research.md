# Research: Full-Screen Image Viewer

**Feature**: 007-full-screen-image
**Date**: 2025-10-02
**Status**: Complete

## Overview
Research findings for implementing a CSS-first, full-page image viewer integrated into portfolio gallery. Focus on History API patterns, CSS transition best practices, touch gesture handling, and responsive image preloading strategies.

---

## 1. Full-Page Viewer vs Modal Overlay

### Decision: Full-Page Integrated Viewer
Use CSS Grid with `position: fixed` and `inset: 0` to create a full-page viewer that feels like navigating to a dedicated page, not opening a popup.

### Rationale:
- **User Experience**: Feels like page navigation, not an interruption
- **History API Integration**: Natural back button behavior (viewer = page state)
- **CSS Simplicity**: No z-index conflicts, cleaner layout management
- **Accessibility**: Simpler focus management (entire page is viewer context)

### Alternatives Considered:
- **Modal Overlay** (z-index: 9999): Rejected - feels like popup, complex z-index management
- **Separate Route** (/image/:id): Rejected - requires router, breaks gallery context
- **Inline Expansion**: Rejected - jarring layout shifts, poor mobile UX

### Implementation Pattern:
```css
.image-viewer[data-state="active"] {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  z-index: 100; /* Above all page content */
}
```

---

## 2. History API State Management

### Decision: Push State with Image ID
Use `history.pushState()` to add viewer state to browser history, enabling back button to close viewer.

### Rationale:
- **Native Back Button**: Users expect back button to close viewer
- **URL Shareable**: Optional future feature (share specific image view)
- **No Router Needed**: Vanilla approach, no framework dependencies
- **State Restoration**: Popstate event handles state changes

### Implementation Pattern:
```typescript
// Open viewer
history.pushState(
  { viewer: 'active', imageIndex: 3 },
  '',
  `?image=${imageId}`
)

// Listen for back button
window.addEventListener('popstate', (event) => {
  if (!event.state?.viewer) {
    closeViewer()
  }
})
```

### Edge Cases Handled:
- Forward button after closing: State restored correctly
- Direct URL navigation: Check URL params on page load
- Multiple rapid back clicks: Debounce close handler

---

## 3. CSS Transitions for 60fps Performance

### Decision: CSS Transforms with GPU Acceleration
Use `transform: translateX()` for image slides, `opacity` for fades. Avoid layout-triggering properties.

### Rationale:
- **GPU Acceleration**: Transform and opacity run on compositor thread
- **60fps Target**: No layout/paint, only composite operations
- **300ms Timing**: Matches material design, feels responsive
- **Reduced Motion**: Easy to disable with `prefers-reduced-motion`

### Implementation Pattern:
```css
.viewer__image {
  transition: transform 300ms ease-out, opacity 300ms ease-out;
  will-change: transform, opacity;
}

.viewer__image[data-direction="next"] {
  transform: translateX(-100%);
  opacity: 0;
}

.viewer__image[data-direction="prev"] {
  transform: translateX(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .viewer__image {
    transition: opacity 100ms ease-out; /* No transform */
  }
}
```

### Performance Validation:
- Monitor with Chrome DevTools Performance tab
- Target: 60fps during transitions (16.67ms frame budget)
- Avoid: width, height, top, left (trigger layout)

---

## 4. Touch Gesture Handling (50px Threshold)

### Decision: Passive Touch Listeners with Manual Threshold
Track `touchstart`, `touchmove`, `touchend` events to detect horizontal swipes ≥50px.

### Rationale:
- **Prevent Accidental Swipes**: 50px threshold filters out scroll attempts
- **Passive Listeners**: Maintains scroll performance (no preventDefault)
- **Direction Detection**: Compare X deltas to determine next/prev
- **Cancel on Vertical Scroll**: If Y delta > X delta, abort swipe

### Implementation Pattern:
```typescript
let touchStartX = 0
let touchStartY = 0

element.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}, { passive: true })

element.addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY)

  // Horizontal swipe, not vertical scroll
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
    deltaX > 0 ? navigatePrev() : navigateNext()
  }
})
```

### Edge Cases:
- Diagonal swipes: Prioritize vertical (preserve scroll)
- Multi-touch: Ignore (pinch zoom conflicts)
- Fast swipes: Same threshold, velocity doesn't matter

---

## 5. Image Preloading Strategy

### Decision: Eager Load Current, Preload n±1
Load current image immediately (`loading="eager"`), create `<link rel="preload">` for adjacent images.

### Rationale:
- **Instant Current**: Eager loading ensures visible image loads ASAP
- **Fast Navigation**: Preloading n-1 and n+1 enables instant prev/next
- **Bandwidth Efficient**: Only 3 images loaded at once (current + 2 adjacent)
- **Dynamic Updates**: Preload links updated on navigation

### Implementation Pattern:
```typescript
function preloadAdjacentImages(currentIndex: number, images: ImageData[]) {
  // Remove old preload links
  document.querySelectorAll('link[rel="preload"][data-viewer]').forEach(el => el.remove())

  // Preload n-1
  if (currentIndex > 0) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = images[currentIndex - 1].src
    link.dataset.viewer = 'true'
    document.head.appendChild(link)
  }

  // Preload n+1
  if (currentIndex < images.length - 1) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = images[currentIndex + 1].src
    link.dataset.viewer = 'true'
    document.head.appendChild(link)
  }
}
```

### Performance Impact:
- <200ms preload initiation (measured from navigation event)
- Browser cache handles duplicate requests (if already in gallery)
- Responsive srcset: Preload correct size for current viewport

---

## 6. Responsive Image Sizing

### Decision: CSS Custom Properties + object-fit: contain
Use CSS variables for responsive sizing breakpoints, `object-fit: contain` to preserve aspect ratio.

### Rationale:
- **No Cropping**: `contain` ensures entire image visible (vs `cover`)
- **Responsive**: Adapts to viewport (mobile 100vw, tablet 90vw, desktop 80vw)
- **Max Height**: 85vh prevents tall images from extending beyond viewport
- **CSS-First**: No JavaScript dimension calculations needed

### Implementation Pattern:
```css
:root {
  --viewer-width-mobile: 100vw;
  --viewer-width-tablet: 90vw;
  --viewer-width-desktop: 80vw;
  --viewer-max-height: 85vh;
}

.viewer__image img {
  width: var(--viewer-width-mobile);
  max-height: var(--viewer-max-height);
  object-fit: contain;
  object-position: center;
}

@media (min-width: 768px) {
  .viewer__image img {
    width: var(--viewer-width-tablet);
  }
}

@media (min-width: 1200px) {
  .viewer__image img {
    width: var(--viewer-width-desktop);
  }
}
```

### Edge Cases:
- Ultra-wide images: `object-fit: contain` scales to fit width
- Ultra-tall images: `max-height: 85vh` prevents overflow
- Portrait mobile: 100vw width, height auto-adjusts

---

## 7. Gallery Integration & Column Detection

### Decision: ResizeObserver + CSS Grid Column Count Detection
Use ResizeObserver on gallery to detect column count changes, enable/disable viewer based on layout.

### Rationale:
- **Single-Column Mobile**: Viewer disabled (images displayed inline)
- **Multi-Column Tablet/Desktop**: Viewer enabled (full-page experience)
- **Resize Responsive**: Auto-close viewer if desktop→mobile resize occurs
- **CSS-Driven**: Column count determined by CSS Grid, JS detects result

### Implementation Pattern:
```typescript
const resizeObserver = new ResizeObserver((entries) => {
  const gallery = entries[0].target
  const columns = window.getComputedStyle(gallery)
    .getPropertyValue('grid-template-columns')
    .split(' ').length

  if (columns === 1) {
    // Mobile: Disable viewer, close if open
    if (viewerActive) closeViewer()
    gallery.dataset.viewerEnabled = 'false'
  } else {
    // Tablet/Desktop: Enable viewer
    gallery.dataset.viewerEnabled = 'true'
  }
})

resizeObserver.observe(galleryElement)
```

### Edge Cases:
- Viewer open during resize: Auto-close on single-column switch
- Page zoom: ResizeObserver detects layout changes
- Initial load: Check column count before enabling click handlers

---

## 8. Scroll Position Restoration

### Decision: localStorage + scrollTo on Viewer Close
Store gallery scroll position in localStorage before opening viewer, restore on close.

### Rationale:
- **User Context Preservation**: Return to exact browsing position
- **History API Compatibility**: Works with back button (popstate restores scroll)
- **Persistent**: Survives page refresh if viewer state in URL
- **Lightweight**: Single number in localStorage, no memory overhead

### Implementation Pattern:
```typescript
function openViewer(imageIndex: number) {
  // Store scroll position
  localStorage.setItem('gallery-scroll', String(window.scrollY))

  // Prevent page scroll while viewer open
  document.body.style.overflow = 'hidden'

  // Show viewer...
}

function closeViewer() {
  // Restore scroll position
  const scrollY = parseInt(localStorage.getItem('gallery-scroll') || '0', 10)

  // Re-enable page scroll
  document.body.style.overflow = ''

  // Restore position
  window.scrollTo({ top: scrollY, behavior: 'instant' })

  // Clean up
  localStorage.removeItem('gallery-scroll')
}
```

### Edge Cases:
- Rapid open/close: Latest scroll position wins
- Refresh during viewer: Check viewer state, restore if needed
- Page height change: Clamp scroll to new max (prevent over-scroll)

---

## 9. Keyboard Navigation & Focus Trap

### Decision: KeyDown Event Listener + Focus Trap on Viewer Container
Capture arrow keys, ESC for navigation/close. Trap focus within viewer when active.

### Rationale:
- **Standard Shortcuts**: Left/Right arrows, ESC to close (familiar UX)
- **Accessibility**: Focus trap prevents tabbing to hidden page content
- **Prevent Bubbling**: Stop propagation to avoid page-level shortcuts
- **Screen Reader**: ARIA live region announces image changes

### Implementation Pattern:
```typescript
function setupKeyboardNav(viewer: HTMLElement) {
  viewer.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        navigatePrev()
        break
      case 'ArrowRight':
        e.preventDefault()
        navigateNext()
        break
      case 'Escape':
        e.preventDefault()
        closeViewer()
        break
    }
  })
}

// Focus trap
const focusableElements = viewer.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
)
const firstFocusable = focusableElements[0] as HTMLElement
const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

viewer.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault()
      lastFocusable.focus()
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault()
      firstFocusable.focus()
    }
  }
})
```

### Accessibility:
- ARIA: `role="dialog"`, `aria-label="Image viewer"`, `aria-live="polite"` for counter
- Focus: Auto-focus close button on open, restore focus to trigger on close
- Screen reader: Announce "Image 3 of 15" on navigation

---

## 10. Image Load Failure Handling

### Decision: Error Event Listener + Auto-Skip to Next Available
Listen for `error` event on `<img>`, automatically navigate to next image if load fails.

### Rationale:
- **User Experience**: Don't leave user stuck on broken image
- **Graceful Degradation**: Continue browsing despite individual failures
- **No Manual Recovery**: Automatic fallback, no error messages needed
- **Edge Case Coverage**: 404, network errors, corrupt files all trigger same handler

### Implementation Pattern:
```typescript
function setupImageErrorHandling(img: HTMLImageElement, currentIndex: number) {
  img.addEventListener('error', () => {
    console.warn(`Failed to load image at index ${currentIndex}`)

    // Try next image (or previous if at end)
    if (currentIndex < images.length - 1) {
      navigateNext()
    } else if (currentIndex > 0) {
      navigatePrev()
    } else {
      // All images failed, close viewer
      closeViewer()
    }
  })
}
```

### Edge Cases:
- All images fail: Close viewer (nothing to display)
- Rapid navigation past broken images: Skip chain continues
- Preloaded image fails: Error caught silently, navigation skips

---

## Research Summary

### Key Technical Decisions:
1. **Full-page viewer** (not modal): CSS Grid, History API integration
2. **CSS-first animations**: GPU-accelerated transforms, 60fps target
3. **Touch gestures**: 50px threshold, passive listeners
4. **Preloading strategy**: Eager current, preload n±1
5. **Responsive sizing**: CSS custom properties, `object-fit: contain`
6. **Gallery integration**: ResizeObserver for column detection
7. **Scroll restoration**: localStorage persistence
8. **Keyboard nav**: Focus trap, standard shortcuts
9. **Error handling**: Auto-skip broken images

### Constitutional Compliance:
- ✅ **Simplicity**: CSS-first, ~150 lines TS, no frameworks
- ✅ **Performance**: 60fps transitions, <200ms preload
- ✅ **Accessibility**: Focus trap, ARIA, keyboard nav
- ✅ **Testability**: Observable state, event-driven, injectable dependencies

### Next Phase:
Phase 1 will generate data models (ViewerState, ImageData interfaces), API contracts (viewer activation, navigation, close), and manual test scenarios based on these research findings.
