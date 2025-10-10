# Contract: Image Viewer API

**Feature**: 007-full-screen-image
**Type**: Component Public API
**Version**: 1.0.0

## Overview
Contract definition for the ImageViewer Web Component public API. Defines all methods, properties, events, and attributes exposed to consumers (primarily the gallery component).

---

## Web Component Interface

### Element Registration
```typescript
interface ImageViewerElement extends HTMLElement {
  // Public API (see ViewerAPI interface below)
  open(index: number): void
  close(): void
  next(): void
  prev(): void
  getState(): Readonly<ViewerState>
  configure(config: Partial<ViewerConfig>): void
  setEnabled(enabled: boolean): void
}

customElements.define('image-viewer', ImageViewer)
```

---

## Public Methods

### 1. open(index: number): void

**Purpose**: Open viewer at specific image index

**Preconditions**:
- `index >= 0 && index < totalImages`
- `enabled === true` (multi-column layout)
- Viewer is currently inactive

**Contract**:
```typescript
GIVEN viewer is enabled and inactive
WHEN open(3) is called
THEN:
  - Viewer state.active becomes true
  - state.currentIndex becomes 3
  - Gallery scroll position saved to localStorage
  - History state pushed with image ID
  - 'viewer:open' event dispatched
  - Close button receives focus
  - Page scroll disabled (overflow: hidden)
```

**Error Cases**:
- `index < 0`: Throw RangeError("Index cannot be negative")
- `index >= totalImages`: Throw RangeError("Index out of bounds")
- `enabled === false`: Throw Error("Viewer disabled in single-column layout")
- Already active: No-op (ignore duplicate open)

**Performance**:
- MUST complete within 16ms (60fps)
- Image MUST start loading within 200ms

---

### 2. close(): void

**Purpose**: Close viewer and return to gallery

**Preconditions**:
- Viewer is currently active

**Contract**:
```typescript
GIVEN viewer is active
WHEN close() is called
THEN:
  - Viewer state.active becomes false
  - Gallery scroll position restored from localStorage
  - History state replaced (remove viewer state)
  - 'viewer:close' event dispatched
  - Focus restored to original trigger element
  - Page scroll re-enabled (overflow: auto)
  - Preload links removed from <head>
```

**Error Cases**:
- Already inactive: No-op (ignore duplicate close)

**Performance**:
- MUST complete within 16ms (60fps)
- Scroll restoration MUST be instant (no smooth scroll)

---

### 3. next(): void

**Purpose**: Navigate to next image

**Preconditions**:
- Viewer is active
- `currentIndex < totalImages - 1`

**Contract**:
```typescript
GIVEN viewer is showing image N of M (where N < M-1)
WHEN next() is called
THEN:
  - state.currentIndex becomes N+1
  - Image transition triggered (300ms duration)
  - 'viewer:navigate' event dispatched with direction='next'
  - Counter updated to "N+1 of M"
  - ARIA live region announces "Image N+1 of M"
  - Adjacent images preloaded (N and N+2)
  - Previous button enabled (if was at index 0)
  - Next button disabled if now at last image
```

**Error Cases**:
- At last image (`currentIndex === totalImages - 1`): No-op (button disabled)
- Viewer inactive: Throw Error("Viewer not active")

**Performance**:
- Transition MUST complete in 300ms
- Preload MUST initiate within 200ms

---

### 4. prev(): void

**Purpose**: Navigate to previous image

**Preconditions**:
- Viewer is active
- `currentIndex > 0`

**Contract**:
```typescript
GIVEN viewer is showing image N of M (where N > 0)
WHEN prev() is called
THEN:
  - state.currentIndex becomes N-1
  - Image transition triggered (300ms duration)
  - 'viewer:navigate' event dispatched with direction='prev'
  - Counter updated to "N-1 of M"
  - ARIA live region announces "Image N-1 of M"
  - Adjacent images preloaded (N-2 and N)
  - Next button enabled (if was at last index)
  - Previous button disabled if now at first image
```

**Error Cases**:
- At first image (`currentIndex === 0`): No-op (button disabled)
- Viewer inactive: Throw Error("Viewer not active")

**Performance**:
- Transition MUST complete in 300ms
- Preload MUST initiate within 200ms

---

### 5. getState(): Readonly<ViewerState>

**Purpose**: Get current viewer state (read-only)

**Preconditions**: None

**Contract**:
```typescript
GIVEN viewer exists
WHEN getState() is called
THEN:
  - Returns immutable ViewerState object
  - Contains: active, currentIndex, totalImages, savedScrollY, enabled
  - Returned object cannot be mutated (readonly)
```

**Error Cases**: None

**Performance**: O(1) - instant

---

### 6. configure(config: Partial<ViewerConfig>): void

**Purpose**: Update viewer configuration

**Preconditions**:
- Viewer is inactive (cannot reconfigure while open)

**Contract**:
```typescript
GIVEN viewer is inactive
WHEN configure({ transitionDuration: 500 }) is called
THEN:
  - Configuration merged with defaults
  - CSS custom properties updated (--viewer-transition-duration)
  - New config applied on next open
```

**Error Cases**:
- Viewer active: Throw Error("Cannot configure while viewer is active")
- Invalid config value: Throw TypeError("Invalid configuration")

**Validation**:
- `transitionDuration`: Must be > 0 and <= 1000ms
- `swipeThreshold`: Must be > 0 and <= 200px
- `responsive.*`: Must be valid CSS length values

---

### 7. setEnabled(enabled: boolean): void

**Purpose**: Enable/disable viewer based on gallery column count

**Preconditions**: None

**Contract**:
```typescript
GIVEN viewer may be active or inactive
WHEN setEnabled(false) is called
THEN:
  - state.enabled becomes false
  - If viewer is active, close() is called automatically
  - 'viewer:enabled' event dispatched with enabled=false
  - Gallery image click handlers disabled

WHEN setEnabled(true) is called
THEN:
  - state.enabled becomes true
  - 'viewer:enabled' event dispatched with enabled=true
  - Gallery image click handlers enabled
```

**Error Cases**: None (boolean coerced if necessary)

**Usage**:
Called by ResizeObserver when gallery column count changes

---

## Custom Events

### viewer:open
```typescript
{
  type: 'viewer:open'
  detail: {
    index: number // Image index that was opened
  }
  bubbles: true
  cancelable: false
}
```

### viewer:close
```typescript
{
  type: 'viewer:close'
  detail: {
    fromIndex: number // Image index before closing
  }
  bubbles: true
  cancelable: false
}
```

### viewer:navigate
```typescript
{
  type: 'viewer:navigate'
  detail: {
    direction: 'next' | 'prev'
    fromIndex: number
    toIndex: number
    trigger: 'keyboard' | 'button' | 'swipe'
  }
  bubbles: true
  cancelable: false
}
```

### viewer:enabled
```typescript
{
  type: 'viewer:enabled'
  detail: {
    enabled: boolean // New enabled state
  }
  bubbles: true
  cancelable: false
}
```

### viewer:error
```typescript
{
  type: 'viewer:error'
  detail: {
    index: number // Image index that failed
    error: Error // Error object
  }
  bubbles: true
  cancelable: false
}
```

---

## HTML Attributes

### data-state
**Type**: Attribute (reflected property)
**Values**: `"active"` | `"inactive"`

```html
<image-viewer data-state="active">
```

**Contract**:
- Set to `"active"` when viewer opens
- Set to `"inactive"` when viewer closes
- Used by CSS for styling (display, transitions)

### data-enabled
**Type**: Attribute (reflected property)
**Values**: `"true"` | `"false"`

```html
<image-viewer data-enabled="true">
```

**Contract**:
- Set to `"true"` when gallery has 2+ columns
- Set to `"false"` when gallery has 1 column
- Used to conditionally enable click handlers

---

## CSS Custom Properties

```css
image-viewer {
  /* Transition timing */
  --viewer-transition-duration: 300ms;

  /* Responsive sizing */
  --viewer-width-mobile: 100vw;
  --viewer-width-tablet: 90vw;
  --viewer-width-desktop: 80vw;
  --viewer-max-height: 85vh;

  /* Theme integration */
  --viewer-bg: var(--background-color);
  --viewer-text: var(--text-color);
}
```

**Contract**:
- Properties MUST respect theme system values
- Responsive properties MUST adapt to breakpoints
- Duration MUST match config.transitionDuration

---

## Accessibility Contract

### ARIA Attributes
```html
<image-viewer
  role="dialog"
  aria-label="Image viewer"
  aria-modal="true"
  data-state="active"
>
  <div aria-live="polite" aria-atomic="true">
    Image 3 of 15
  </div>
</image-viewer>
```

**Contract**:
- MUST trap focus within viewer when active
- MUST announce image changes to screen readers
- MUST provide keyboard navigation (arrows, ESC)
- MUST have visible focus indicators on all controls

### Keyboard Shortcuts
| Key | Action | Condition |
|-----|--------|-----------|
| ArrowLeft | prev() | currentIndex > 0 |
| ArrowRight | next() | currentIndex < totalImages - 1 |
| Escape | close() | Always |
| Tab | Focus next | Cycles within viewer (trapped) |
| Shift+Tab | Focus prev | Cycles within viewer (trapped) |

---

## Performance Contract

### Timing Constraints
- `open()`: < 16ms (60fps)
- `close()`: < 16ms (60fps)
- `next()`/`prev()`: Transition completes in 300ms ± 10ms
- Preload initiation: < 200ms from navigation event
- Scroll restoration: < 16ms (instant)

### Memory Management
- Preload links MUST be removed on close
- Event listeners MUST be cleaned up on disconnect
- Image references MUST be released when not in use

### Rendering Performance
- Transitions MUST use GPU-accelerated properties only (transform, opacity)
- MUST maintain 60fps during transitions (< 16.67ms frame time)
- NO layout thrashing (batch DOM reads/writes)

---

## Integration Contract (Gallery → Viewer)

### Initialization
```typescript
// Gallery provides images to viewer
const viewer = document.createElement('image-viewer')
viewer.setAttribute('data-images', JSON.stringify(galleryImages))
document.body.appendChild(viewer)

// Gallery registers click handler
gallery.onImageClick((index) => {
  if (viewer.getState().enabled) {
    viewer.open(index)
  }
})
```

### Resize Handling
```typescript
const resizeObserver = new ResizeObserver(() => {
  const columns = getColumnCount()
  viewer.setEnabled(columns > 1)
})
resizeObserver.observe(gallery)
```

### Event Listening
```typescript
viewer.addEventListener('viewer:close', (e) => {
  console.log(`Viewer closed from index ${e.detail.fromIndex}`)
})

viewer.addEventListener('viewer:error', (e) => {
  console.error(`Image ${e.detail.index} failed:`, e.detail.error)
})
```

---

## Error Handling Contract

### Error Types
1. **RangeError**: Invalid index (< 0 or >= totalImages)
2. **TypeError**: Invalid configuration values
3. **Error**: State violations (e.g., configure while active)

### Error Recovery
- Invalid index: Clamp to valid range, log warning
- Image load failure: Auto-skip to next image
- Configuration error: Use last valid config, log error
- State violation: No-op operation, log warning

### Logging
- All errors MUST be logged to console
- User-facing errors MUST be handled gracefully (no error UI, auto-recover)

---

## Testing Contract

### Contract Tests (MUST fail before implementation)
1. `viewer.open(3)` sets `state.active = true` and `currentIndex = 3`
2. `viewer.close()` sets `state.active = false` and restores scroll
3. `viewer.next()` increments `currentIndex` by 1
4. `viewer.prev()` decrements `currentIndex` by 1
5. `viewer.setEnabled(false)` auto-closes if active
6. `viewer.open(-1)` throws RangeError
7. `viewer.open(999)` throws RangeError
8. `viewer.configure()` while active throws Error
9. Navigation at boundaries disables buttons
10. All events dispatch with correct detail objects

### Integration Tests
- Open viewer → close with ESC → scroll position restored
- Navigate next → navigate prev → counter updates correctly
- Resize to mobile → viewer auto-closes
- Image error → auto-skip to next image
- Rapid navigation → no animation queue buildup

---

## Version History

**v1.0.0** (2025-10-02): Initial API contract
- 7 public methods defined
- 5 custom events specified
- Performance constraints established
- Error handling contract defined
