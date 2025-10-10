# Data Model: Full-Screen Image Viewer

**Feature**: 007-full-screen-image
**Date**: 2025-10-02
**Status**: Complete

## Overview
TypeScript interfaces and entity definitions for the image viewer component. Defines state management, image data structures, and event contracts for gallery integration.

---

## Core Entities

### 1. ViewerState
Represents the current state of the image viewer session.

```typescript
/**
 * Image Viewer State
 * Tracks viewer activation, current image, and navigation context
 */
interface ViewerState {
  /** Whether viewer is currently active (visible) */
  active: boolean

  /** Index of currently displayed image (0-based) */
  currentIndex: number

  /** Total number of images in gallery */
  totalImages: number

  /** Original gallery scroll position (for restoration on close) */
  savedScrollY: number

  /** Whether viewer is enabled (based on gallery column count) */
  enabled: boolean
}
```

**Validation Rules**:
- `currentIndex` must be >= 0 and < `totalImages`
- `totalImages` must be > 0 when `active` is true
- `savedScrollY` must be >= 0
- `enabled` must be false when gallery has 1 column (mobile)

**State Transitions**:
```
inactive → active: User clicks gallery image (when enabled=true)
active → inactive: User closes viewer (ESC, close button, back button)
enabled → disabled: Gallery resizes to 1 column
disabled → enabled: Gallery resizes to 2+ columns
active + (enabled → disabled): Auto-close viewer
```

---

### 2. ImageData
Represents a single image in the gallery with metadata and responsive sources.

```typescript
/**
 * Image Data
 * Contains all information needed to display an image in viewer
 */
interface ImageData {
  /** Unique identifier for the image */
  id: string

  /** Primary image source URL */
  src: string

  /** Responsive srcset for different viewport sizes */
  srcset: string

  /** WebP alternative source (if available) */
  webpSrc?: string

  /** WebP srcset for different viewport sizes */
  webpSrcset?: string

  /** Alt text for accessibility */
  alt: string

  /** Image width in pixels (for aspect ratio) */
  width: number

  /** Image height in pixels (for aspect ratio) */
  height: number

  /** Optional caption/description */
  caption?: string

  /** Position in gallery (0-based index) */
  index: number
}
```

**Validation Rules**:
- `id` must be unique across all gallery images
- `src` must be a valid URL or path
- `alt` must not be empty (accessibility requirement)
- `width` and `height` must be > 0
- `index` must match position in gallery array

**Relationships**:
- Many ImageData entities belong to one Gallery
- One ImageData entity can be current in ViewerState

---

### 3. NavigationEvent
Custom event for viewer navigation actions.

```typescript
/**
 * Navigation Event Detail
 * Payload for viewer navigation events
 */
interface NavigationEventDetail {
  /** Direction of navigation */
  direction: 'next' | 'prev'

  /** Index before navigation */
  fromIndex: number

  /** Index after navigation */
  toIndex: number

  /** Trigger source (keyboard, button, swipe) */
  trigger: 'keyboard' | 'button' | 'swipe'
}

/**
 * Custom navigation event
 */
type NavigationEvent = CustomEvent<NavigationEventDetail>
```

**Usage**:
```typescript
// Dispatch navigation event
const event = new CustomEvent('viewer:navigate', {
  detail: {
    direction: 'next',
    fromIndex: 2,
    toIndex: 3,
    trigger: 'keyboard'
  }
})
element.dispatchEvent(event)
```

---

### 4. ViewerConfig
Configuration options for the image viewer component.

```typescript
/**
 * Viewer Configuration
 * Customizable settings for viewer behavior
 */
interface ViewerConfig {
  /** CSS transition duration in milliseconds */
  transitionDuration: number

  /** Touch swipe threshold in pixels */
  swipeThreshold: number

  /** Whether to update browser history */
  useHistoryAPI: boolean

  /** Whether to preload adjacent images */
  preloadAdjacent: boolean

  /** Image sizing breakpoints */
  responsive: {
    mobile: {
      width: string
      maxHeight: string
    }
    tablet: {
      width: string
      maxHeight: string
    }
    desktop: {
      width: string
      maxHeight: string
    }
  }
}
```

**Default Values**:
```typescript
const DEFAULT_CONFIG: ViewerConfig = {
  transitionDuration: 300,
  swipeThreshold: 50,
  useHistoryAPI: true,
  preloadAdjacent: true,
  responsive: {
    mobile: { width: '100vw', maxHeight: '85vh' },
    tablet: { width: '90vw', maxHeight: '85vh' },
    desktop: { width: '80vw', maxHeight: '85vh' }
  }
}
```

---

### 5. ViewerElements
DOM element references for the viewer component.

```typescript
/**
 * Viewer DOM Elements
 * References to key elements in viewer template
 */
interface ViewerElements {
  /** Root viewer container */
  container: HTMLElement

  /** Header section (counter, close button) */
  header: HTMLElement

  /** Image container (holds current image) */
  imageContainer: HTMLElement

  /** Current image element */
  image: HTMLImageElement

  /** Previous navigation button */
  prevButton: HTMLButtonElement

  /** Next navigation button */
  nextButton: HTMLButtonElement

  /** Close button */
  closeButton: HTMLButtonElement

  /** Image counter display */
  counter: HTMLElement

  /** ARIA live region for screen reader announcements */
  liveRegion: HTMLElement
}
```

**Initialization**:
All elements must be present in DOM before viewer can activate. Missing elements should throw initialization error.

---

## Integration Interfaces

### 6. GalleryIntegration
Interface for gallery component to integrate with viewer.

```typescript
/**
 * Gallery Integration Interface
 * Methods gallery must implement to support viewer
 */
interface GalleryIntegration {
  /** Get all images from gallery */
  getImages(): ImageData[]

  /** Get current column count (for viewer enable/disable) */
  getColumnCount(): number

  /** Register click handler for image activation */
  onImageClick(handler: (index: number) => void): void

  /** Check if viewer should be enabled (2+ columns) */
  isViewerEnabled(): boolean
}
```

**Contract**:
- `getImages()` must return array in display order (left-to-right, top-to-bottom)
- `getColumnCount()` must reflect current CSS Grid columns
- `onImageClick()` handler only called when `isViewerEnabled()` returns true

---

### 7. ViewerAPI
Public API exposed by image viewer component.

```typescript
/**
 * Image Viewer Public API
 * Methods exposed by viewer component
 */
interface ViewerAPI {
  /** Open viewer at specific image index */
  open(index: number): void

  /** Close viewer and return to gallery */
  close(): void

  /** Navigate to next image */
  next(): void

  /** Navigate to previous image */
  prev(): void

  /** Get current viewer state */
  getState(): Readonly<ViewerState>

  /** Update configuration */
  configure(config: Partial<ViewerConfig>): void

  /** Enable/disable viewer (based on column count) */
  setEnabled(enabled: boolean): void
}
```

**Usage Example**:
```typescript
const viewer = document.querySelector('image-viewer') as ImageViewerElement
viewer.open(3) // Open at image index 3
viewer.next()  // Navigate to image 4
viewer.close() // Close viewer
```

---

## Event System

### Custom Events

```typescript
/**
 * Viewer lifecycle events
 */
interface ViewerEvents {
  'viewer:open': CustomEvent<{ index: number }>
  'viewer:close': CustomEvent<{ fromIndex: number }>
  'viewer:navigate': CustomEvent<NavigationEventDetail>
  'viewer:enabled': CustomEvent<{ enabled: boolean }>
  'viewer:error': CustomEvent<{ index: number; error: Error }>
}
```

**Event Flow**:
1. Gallery click → `viewer:open` → State: active=true
2. User navigation → `viewer:navigate` → State: currentIndex updated
3. Image error → `viewer:error` → Auto-skip to next image
4. Resize to 1 column → `viewer:enabled` (enabled=false) → Auto-close if active
5. User closes → `viewer:close` → State: active=false

---

## Storage Schema

### localStorage Keys

```typescript
/**
 * localStorage storage schema
 */
interface ViewerStorage {
  /** Gallery scroll position before opening viewer */
  'gallery-scroll': string // Serialized number (scrollY)
}
```

**Lifecycle**:
- Set on `viewer:open`: Store current scrollY
- Read on `viewer:close`: Restore scrollY
- Cleared after restoration: Prevent stale data

---

## Accessibility Data

### ARIA Attributes

```typescript
/**
 * ARIA attributes for viewer accessibility
 */
interface ViewerARIA {
  /** Container role */
  'role': 'dialog'

  /** Dialog label */
  'aria-label': 'Image viewer'

  /** Modal state */
  'aria-modal': 'true'

  /** Live region for counter updates */
  'aria-live': 'polite'

  /** Current image description */
  'aria-describedby': string // ID of caption/alt element

  /** Button labels */
  buttons: {
    close: 'Close image viewer'
    next: 'Next image'
    prev: 'Previous image'
  }
}
```

**Dynamic Updates**:
- Counter live region announces: "Image 3 of 15" on navigation
- Button aria-disabled="true" when at first/last image
- Focus management: Close button focused on open

---

## Validation & Constraints

### Business Rules

1. **Viewer Activation**:
   - MUST only activate when `getColumnCount() > 1` (tablet/desktop)
   - MUST NOT activate in single-column mobile layout
   - MUST auto-close if resize changes column count to 1

2. **Navigation Boundaries**:
   - Previous button MUST be disabled at index 0
   - Next button MUST be disabled at index (totalImages - 1)
   - Keyboard navigation MUST respect same boundaries

3. **Image Loading**:
   - Current image MUST load with `loading="eager"`
   - Adjacent images (n-1, n+1) MUST preload
   - Failed images MUST auto-skip to next available

4. **State Persistence**:
   - Scroll position MUST be saved before viewer opens
   - Scroll position MUST be restored when viewer closes
   - History state MUST be pushed when viewer opens

5. **Performance**:
   - Transitions MUST complete within 300ms
   - Preload MUST initiate within 200ms of navigation
   - Swipe threshold MUST be 50px minimum

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Gallery   │
└──────┬──────┘
       │ has many
       ↓
┌─────────────┐      ┌──────────────┐
│  ImageData  │◄─────│ ViewerState  │
└─────────────┘      └──────┬───────┘
                            │ manages
                            ↓
                     ┌──────────────┐
                     │ ImageViewer  │
                     │  Component   │
                     └──────┬───────┘
                            │ emits
                            ↓
                     ┌──────────────┐
                     │ ViewerEvents │
                     └──────────────┘
```

---

## TypeScript Type Guards

```typescript
/**
 * Type guard for ViewerState validation
 */
function isValidViewerState(state: unknown): state is ViewerState {
  const s = state as ViewerState
  return (
    typeof s.active === 'boolean' &&
    typeof s.currentIndex === 'number' &&
    typeof s.totalImages === 'number' &&
    typeof s.savedScrollY === 'number' &&
    typeof s.enabled === 'boolean' &&
    s.currentIndex >= 0 &&
    s.currentIndex < s.totalImages &&
    s.savedScrollY >= 0
  )
}

/**
 * Type guard for ImageData validation
 */
function isValidImageData(data: unknown): data is ImageData {
  const d = data as ImageData
  return (
    typeof d.id === 'string' &&
    typeof d.src === 'string' &&
    typeof d.alt === 'string' &&
    typeof d.width === 'number' &&
    typeof d.height === 'number' &&
    typeof d.index === 'number' &&
    d.id.length > 0 &&
    d.alt.length > 0 &&
    d.width > 0 &&
    d.height > 0 &&
    d.index >= 0
  )
}
```

---

## Summary

**Total Entities**: 7 core interfaces + 2 type guards

**Key Relationships**:
- Gallery → ImageData (1:many)
- ViewerState → ImageData (current image)
- ImageViewer → ViewerElements (composition)

**Validation Points**:
- State transitions (inactive/active, enabled/disabled)
- Navigation boundaries (first/last image)
- Image data completeness (src, alt, dimensions)
- Configuration constraints (durations, thresholds)

**Next Phase**: Generate API contracts from these entities, create contract tests, and define manual test scenarios in quickstart.md.
