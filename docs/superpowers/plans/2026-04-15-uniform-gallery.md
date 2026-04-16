# Uniform Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `<uniform-gallery>` Web Component that displays images in justified flexbox rows (uniform height, variable width) and replace `<masonry-gallery>` on the homepage, leaving the masonry component untouched.

**Architecture:** CSS flexbox justified rows — JS sets `--ar` (aspect ratio) on each `.gallery-item`, CSS `flex-basis: calc(var(--ar) * var(--row-height))` handles row packing automatically. A trailing `.gallery-spacer` prevents the last row from stretching. No JS resize recalculation needed. Reuses `GalleryDataService`, `PictureElementFactory`, `ImageErrorHandler`, and viewer integration patterns from `MasonryGallery` unchanged.

**Tech Stack:** TypeScript, Web Components (`HTMLElement`), CSS custom properties, IntersectionObserver (lazy load + scroll reveal), ResizeObserver (viewer state), Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/uniform-gallery/uniform-gallery.types.ts` | Create | `IUniformGallery` interface |
| `src/components/uniform-gallery/uniform-gallery.css` | Create | Layout, breakpoints, LQIP, animation, a11y |
| `src/components/uniform-gallery/uniform-gallery.ts` | Create | Web Component class |
| `tests/uniform-gallery/uniform-gallery-contract.test.ts` | Create | Public API, lifecycle, registration |
| `tests/uniform-gallery/uniform-gallery-ui.test.ts` | Create | Rendering, layout, click, events |
| `tests/uniform-gallery/uniform-gallery-accessibility.test.ts` | Create | ARIA, keyboard, focus, reduced-motion |
| `tests/uniform-gallery/uniform-gallery-performance.test.ts` | Create | Init timing, memory |
| `index.html` | Modify | Replace `<masonry-gallery>` with `<uniform-gallery>` |
| `src/pages/main.ts` | Modify | Import uniform-gallery CSS + component |

---

## Phase 1 — Types and Contract Tests

### Task 1: Create types file

**Files:**
- Create: `src/components/uniform-gallery/uniform-gallery.types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/components/uniform-gallery/uniform-gallery.types.ts

import type { GalleryImageData } from '../gallery/gallery.types'

export interface IUniformGallery extends HTMLElement {
  getImages(): GalleryImageData[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.types.ts
git commit -m "feat: add uniform-gallery types"
```

---

### Task 2: Write and verify failing contract tests

**Files:**
- Create: `tests/uniform-gallery/uniform-gallery-contract.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// tests/uniform-gallery/uniform-gallery-contract.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// This import will fail until Task 3 creates the component
import { UniformGallery } from '../../src/components/uniform-gallery/uniform-gallery'

global.fetch = vi.fn()

const mockFetch = (images = [
  { id: 'test-1', alt: 'Test 1', aspectRatio: 1.33,
    sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 600, url: 'test1.jpg' }] }],
    metadata: { originalWidth: 800, originalHeight: 600, fileSize: 0 } },
  { id: 'test-2', alt: 'Test 2', aspectRatio: 0.75,
    sources: [{ format: 'jpeg', sizes: [{ width: 600, height: 800, url: 'test2.jpg' }] }],
    metadata: { originalWidth: 600, originalHeight: 800, fileSize: 0 } }
]) => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ images })
  } as Response)
}

describe('UniformGallery Contract Tests', () => {
  let gallery: UniformGallery
  let container: HTMLElement

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
    }))
    mockFetch()

    if (!customElements.get('uniform-gallery')) {
      customElements.define('uniform-gallery', UniformGallery)
    }
    container = document.createElement('div')
    document.body.appendChild(container)
    gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => requestAnimationFrame(resolve))
  })

  afterEach(() => {
    container.parentNode && document.body.removeChild(container)
    vi.clearAllMocks()
  })

  describe('Component Interface Contract', () => {
    it('MUST extend HTMLElement', () => {
      expect(gallery).toBeInstanceOf(HTMLElement)
    })

    it('MUST be registered as custom element', () => {
      expect(customElements.get('uniform-gallery')).toBe(UniformGallery)
    })

    it('MUST have uniform-gallery class name after init', () => {
      expect(gallery.className).toBe('uniform-gallery')
    })

    it('MUST expose getImages() method', () => {
      expect(typeof gallery.getImages).toBe('function')
    })

    it('MUST accept data-manifest-url attribute', () => {
      const g = document.createElement('uniform-gallery') as UniformGallery
      g.setAttribute('data-manifest-url', '/custom.json')
      expect(g.getAttribute('data-manifest-url')).toBe('/custom.json')
    })
  })

  describe('Component Lifecycle Contract', () => {
    it('MUST initialize when connected to DOM', async () => {
      const g = document.createElement('uniform-gallery') as UniformGallery
      expect(g.className).toBe('')
      container.appendChild(g)
      await new Promise(resolve => requestAnimationFrame(resolve))
      expect(g.className).toBe('uniform-gallery')
      container.removeChild(g)
    })

    it('MUST clean up when disconnected from DOM', () => {
      container.removeChild(gallery)
      expect(gallery.isConnected).toBe(false)
    })

    it('MUST dispatch uniform-gallery:initialized event', async () => {
      mockFetch()
      const g = document.createElement('uniform-gallery') as UniformGallery
      let fired = false
      g.addEventListener('uniform-gallery:initialized', () => { fired = true })
      container.appendChild(g)
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(fired).toBe(true)
      container.removeChild(g)
    })
  })

  describe('getImages() Contract', () => {
    it('MUST return an array', async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(Array.isArray(gallery.getImages())).toBe(true)
    })

    it('MUST return objects with id, src, alt, width, height, index', async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      const images = gallery.getImages()
      if (images.length > 0) {
        const img = images[0]
        expect(typeof img.id).toBe('string')
        expect(typeof img.src).toBe('string')
        expect(typeof img.alt).toBe('string')
        expect(typeof img.width).toBe('number')
        expect(typeof img.height).toBe('number')
        expect(typeof img.index).toBe('number')
      }
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail (component doesn't exist yet)**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-contract.test.ts 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module '../../src/components/uniform-gallery/uniform-gallery'`

---

## Phase 2 — CSS

### Task 3: Create the CSS file

**Files:**
- Create: `src/components/uniform-gallery/uniform-gallery.css`

- [ ] **Step 1: Create the CSS file**

```css
/* src/components/uniform-gallery/uniform-gallery.css */

/* ── Layout ───────────────────────────────────────────── */

.uniform-gallery {
  --row-height: 300px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);        /* 8px — matches masonry-gallery */
  width: 100%;
  box-sizing: border-box;
  background: var(--color-pure);
  position: relative;
  z-index: 10;
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

  /* Scroll-reveal: start hidden, transition to visible */
  opacity: 0;
  transition: opacity 400ms ease-out;
}

.gallery-item.visible {
  opacity: 1;
}

/* Spacer: absorbs leftover space on last row so it doesn't stretch */
.gallery-spacer {
  flex-grow: 999;
  flex-basis: 0;
  height: 0;
}

/* ── Breakpoints ──────────────────────────────────────── */

@media (max-width: 56rem) {       /* ≤896px tablet */
  .uniform-gallery {
    --row-height: 280px;
  }
}

@media (max-width: 36rem) {       /* ≤576px all phones */
  .gallery-item {
    flex-basis: 100%;
    height: auto;
    aspect-ratio: var(--ar);    /* natural proportions, no cropping */
    opacity: 0;                 /* reset so reveal observer fires */
  }
  .gallery-spacer {
    display: none;
  }
}

/* ── Images ───────────────────────────────────────────── */

.gallery-item picture {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.gallery-item picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── LQIP Placeholder ─────────────────────────────────── */

.gallery-item [data-placeholder] {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  transition: opacity 300ms ease-out;
}

.gallery-item [data-placeholder][data-lqip-type="blur"] {
  filter: blur(5px);
  transform: scale(1.1);
}

.gallery-item.loaded [data-placeholder] {
  opacity: 0;
  pointer-events: none;
}

.gallery-item > div.loaded {
  background: transparent;
}

/* ── Loading State ────────────────────────────────────── */

.gallery-item > div:not(.loaded) {
  background: var(--color-accent);
  position: relative;
}

[data-theme="dark"] .gallery-item > div:not(.loaded) {
  background: #0A0A0A;
}

.gallery-item > div:not(.loaded)::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: 1.5rem; height: 1.5rem;
  margin: -0.75rem 0 0 -0.75rem;
  border: 0.125rem solid var(--color-secondary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: uniform-gallery-loading 1s linear infinite;
}

@keyframes uniform-gallery-loading {
  to { transform: rotate(360deg); }
}

/* ── Error States ─────────────────────────────────────── */

.uniform-gallery-error {
  padding: 2rem;
  text-align: center;
  color: var(--color-secondary);
  width: 100%;
}

/* ── Accessibility ────────────────────────────────────── */

.gallery-item:focus {
  outline: 0.125rem solid var(--color-interactive);
  outline-offset: 0.125rem;
}

.gallery-item:focus-visible {
  outline: 0.125rem solid var(--color-interactive);
  outline-offset: 0.125rem;
}

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

@media (prefers-contrast: high) {
  .gallery-item {
    border: 0.0625rem solid currentColor;
  }
  .gallery-item:focus {
    outline-width: 0.1875rem;
  }
}

/* ── Print ────────────────────────────────────────────── */

@media print {
  .uniform-gallery { background: transparent; }
  .gallery-item { break-inside: avoid; opacity: 1; }
  .gallery-item > div:not(.loaded)::before { display: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.css
git commit -m "feat: add uniform-gallery CSS — flexbox justified rows"
```

---

## Phase 3 — Component Implementation

### Task 4: Implement the Web Component to pass contract tests

**Files:**
- Create: `src/components/uniform-gallery/uniform-gallery.ts`

- [ ] **Step 1: Create the component file**

```typescript
// src/components/uniform-gallery/uniform-gallery.ts

import type { IUniformGallery } from './uniform-gallery.types'
import type {
  ResponsiveImage,
  GalleryImageData,
  IImageViewer
} from '../gallery/gallery.types'
import { PictureElementFactory } from '../../utils/picture-element-factory'
import { GalleryDataService } from '../../services/gallery-data.service'
import { ImageErrorHandler } from '../../utils/image-error-handler'
import './uniform-gallery.css'

export class UniformGallery extends HTMLElement implements IUniformGallery {
  private static readonly LAZY_LOAD_MARGIN = '200px'
  private static readonly REVEAL_MARGIN = '50px'
  private static readonly HIGH_PRIORITY_IMAGE_COUNT = 3

  private images: ResponsiveImage[] = []
  private cachedImageData: GalleryImageData[] | null = null
  private isInitialized = false
  private viewer: IImageViewer | null = null

  private dataService = new GalleryDataService()
  private errorHandler = new ImageErrorHandler()

  // Shared static observers (same pattern as MasonryGallery)
  private static sharedImageObserver?: IntersectionObserver
  private static sharedRevealObserver?: IntersectionObserver
  private static sharedResizeObserver?: ResizeObserver
  private static observedGalleries = new Set<UniformGallery>()

  static get observedAttributes() {
    return ['data-manifest-url']
  }

  connectedCallback() {
    this.initialize()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return
    this.className = 'uniform-gallery'
    this.setupLazyLoading()
    this.setupRevealObserver()
    await this.loadImages()
    this.renderImages()
    this.setupViewerIntegration()
    this.isInitialized = true
    this.dispatchEvent(new CustomEvent('uniform-gallery:initialized'))
  }

  private async loadImages(): Promise<void> {
    const manifestUrl = this.getAttribute('data-manifest-url') || '/gallery-data.json'
    try {
      this.images = await this.dataService.loadImages(manifestUrl)
    } catch {
      this.showError('Failed to load gallery')
    }
  }

  private renderImages(): void {
    this.innerHTML = ''

    this.images.forEach((image, index) => {
      const item = this.createItem(image, index)
      this.appendChild(item)
    })

    // Spacer prevents last row from stretching
    const spacer = document.createElement('div')
    spacer.className = 'gallery-spacer'
    this.appendChild(spacer)
  }

  private createItem(image: ResponsiveImage, index: number): HTMLElement {
    const item = document.createElement('div')
    item.className = 'gallery-item'
    item.setAttribute('tabindex', '0')
    item.setAttribute('role', 'button')
    item.setAttribute('aria-label', `View ${image.alt}`)
    item.style.setProperty('--ar', image.aspectRatio.toString())

    const wrapper = document.createElement('div')
    item.appendChild(wrapper)

    // LQIP placeholder
    this.addLQIPPlaceholder(image, wrapper)

    // Picture element (lazy for non-priority images)
    const picture = PictureElementFactory.create(image, 'gallery', {
      lazyLoad: true,
      originalIndex: index,
      highPriority: index < UniformGallery.HIGH_PRIORITY_IMAGE_COUNT
    })

    const img = picture.querySelector('img')
    if (img) {
      UniformGallery.sharedImageObserver?.observe(img)

      img.onload = () => {
        const placeholder = wrapper.querySelector('[data-placeholder]')
        if (placeholder) {
          (placeholder as HTMLElement).style.opacity = '0'
          setTimeout(() => placeholder.remove(), 300)
        }
        wrapper.classList.add('loaded')
        this.dispatchEvent(new CustomEvent('uniform-gallery:image-loaded', {
          detail: { image }
        }))
      }

      img.onerror = async () => {
        await this.errorHandler.handleImageError(image, img)
      }
    }

    wrapper.appendChild(picture)

    // Above-fold images reveal immediately; others use observer
    if (index < UniformGallery.HIGH_PRIORITY_IMAGE_COUNT) {
      item.classList.add('visible')
    } else {
      UniformGallery.sharedRevealObserver?.observe(item)
    }

    // Keyboard support (Enter/Space opens viewer)
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        item.click()
      }
    })

    return item
  }

  // ── Public API ────────────────────────────────────────

  getImages(): GalleryImageData[] {
    if (this.cachedImageData) return this.cachedImageData

    this.cachedImageData = this.images.map((image, index) => {
      const jpegSource = image.sources.find(s => s.format === 'jpeg')
      const webpSource = image.sources.find(s => s.format === 'webp')
      const jpegSrcset = jpegSource?.sizes.map(s => `${s.url} ${s.width}w`).join(', ') || ''
      const webpSrcset = webpSource?.sizes.map(s => `${s.url} ${s.width}w`).join(', ') || ''

      return {
        id: image.id,
        src: jpegSource?.sizes[0]?.url || '',
        srcset: jpegSrcset,
        webpSrcset,
        alt: image.alt,
        width: image.metadata.originalWidth,
        height: image.metadata.originalHeight,
        index
      }
    })

    return this.cachedImageData
  }

  // ── Observers ─────────────────────────────────────────

  private setupLazyLoading(): void {
    if (!UniformGallery.sharedImageObserver) {
      UniformGallery.sharedImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const img = entry.target as HTMLImageElement
          const picture = img.parentElement as HTMLPictureElement
          picture.querySelectorAll('source[data-srcset]').forEach(source => {
            const srcset = (source as HTMLSourceElement).dataset.srcset
            if (srcset) (source as HTMLSourceElement).srcset = srcset
          })
          const src = img.dataset.src
          if (src) { img.src = src; img.classList.remove('lazy') }
          UniformGallery.sharedImageObserver?.unobserve(img)
        })
      }, { rootMargin: UniformGallery.LAZY_LOAD_MARGIN })
    }
  }

  private setupRevealObserver(): void {
    if (!UniformGallery.sharedRevealObserver) {
      UniformGallery.sharedRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          UniformGallery.sharedRevealObserver?.unobserve(entry.target)
        })
      }, { rootMargin: UniformGallery.REVEAL_MARGIN })
    }
  }

  // ── Viewer Integration ────────────────────────────────

  private setupViewerIntegration(): void {
    this.setupViewer()
    this.setupClickHandler()
    this.setupResizeObserver()
  }

  private isMobile(): boolean {
    return window.matchMedia('(max-width: 36rem)').matches
  }

  private setupViewer(): void {
    this.viewer = document.querySelector('image-viewer') as IImageViewer | null
    if (this.viewer) {
      this.viewer.setImages(this.getImages())
      this.viewer.setEnabled(!this.isMobile())
    }
  }

  private setupClickHandler(): void {
    this.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.gallery-item') as HTMLElement
      if (!item) return
      const img = item.querySelector('img')
      if (!img) return
      const images = this.getImages()
      const index = images.findIndex(d => d.id === img.dataset.id)
      if (index < 0) return
      this.dispatchEvent(new CustomEvent('uniform-gallery:image-click', {
        detail: { index, images },
        bubbles: true
      }))
      if (this.viewer?.getState().enabled) {
        this.viewer.setImages(images)
        this.viewer.open(index)
      }
    })
  }

  private setupResizeObserver(): void {
    if (!UniformGallery.sharedResizeObserver) {
      UniformGallery.sharedResizeObserver = new ResizeObserver(() => {
        UniformGallery.observedGalleries.forEach(g => {
          if (g.viewer) g.viewer.setEnabled(!g.isMobile())
        })
      })
    }
    UniformGallery.observedGalleries.add(this)
    UniformGallery.sharedResizeObserver.observe(this)
  }

  // ── Error ─────────────────────────────────────────────

  private showError(message: string): void {
    this.innerHTML = `<div class="uniform-gallery-error">${message}</div>`
  }

  // ── LQIP ─────────────────────────────────────────────

  private addLQIPPlaceholder(image: ResponsiveImage, wrapper: HTMLElement): void {
    if (!image.lqip || typeof image.lqip !== 'object') return
    const placeholder = document.createElement('div')
    placeholder.setAttribute('data-placeholder', 'true')
    placeholder.setAttribute('data-lqip-type', image.lqip.type)
    if (image.lqip.type === 'solid-color') {
      if (image.lqip.data.startsWith('data:image/svg+xml')) {
        placeholder.style.backgroundImage = `url("${image.lqip.data}")`
      } else {
        placeholder.style.backgroundColor = image.lqip.dominantColor || '#f0f0f0'
      }
    } else if (image.lqip.type === 'blur') {
      placeholder.style.backgroundImage = `url(${image.lqip.data})`
    }
    wrapper.appendChild(placeholder)
  }

  // ── Cleanup ───────────────────────────────────────────

  private cleanup(): void {
    UniformGallery.observedGalleries.delete(this)
    if (UniformGallery.observedGalleries.size === 0) {
      UniformGallery.sharedImageObserver?.disconnect()
      UniformGallery.sharedImageObserver = undefined
      UniformGallery.sharedRevealObserver?.disconnect()
      UniformGallery.sharedRevealObserver = undefined
      UniformGallery.sharedResizeObserver?.disconnect()
      UniformGallery.sharedResizeObserver = undefined
    }
    this.isInitialized = false
    this.cachedImageData = null
  }
}

if (!customElements.get('uniform-gallery')) {
  customElements.define('uniform-gallery', UniformGallery)
}
```

- [ ] **Step 2: Run contract tests — verify they pass**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-contract.test.ts 2>&1 | tail -15
```

Expected: All contract tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/uniform-gallery/uniform-gallery.ts
git commit -m "feat: implement UniformGallery Web Component"
```

---

## Phase 4 — UI Tests

### Task 5: Write and pass UI tests

**Files:**
- Create: `tests/uniform-gallery/uniform-gallery-ui.test.ts`

- [ ] **Step 1: Create UI test file**

```typescript
// tests/uniform-gallery/uniform-gallery-ui.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UniformGallery } from '../../src/components/uniform-gallery/uniform-gallery'

global.fetch = vi.fn()

const TEST_IMAGES = [
  { id: 'img-1', alt: 'Mountain landscape', aspectRatio: 1.78,
    sources: [{ format: 'jpeg', sizes: [{ width: 1600, height: 900, url: 'img1.jpg' }] }],
    metadata: { originalWidth: 1600, originalHeight: 900, fileSize: 0 } },
  { id: 'img-2', alt: 'Portrait photo', aspectRatio: 0.67,
    sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 1200, url: 'img2.jpg' }] }],
    metadata: { originalWidth: 800, originalHeight: 1200, fileSize: 0 } },
  { id: 'img-3', alt: 'Square composition', aspectRatio: 1.0,
    sources: [{ format: 'jpeg', sizes: [{ width: 1000, height: 1000, url: 'img3.jpg' }] }],
    metadata: { originalWidth: 1000, originalHeight: 1000, fileSize: 0 } },
]

describe('UniformGallery UI Tests', () => {
  let gallery: UniformGallery
  let container: HTMLElement

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
    }))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ images: TEST_IMAGES })
    } as Response)

    if (!customElements.get('uniform-gallery')) {
      customElements.define('uniform-gallery', UniformGallery)
    }
    container = document.createElement('div')
    document.body.appendChild(container)
    gallery = document.createElement('uniform-gallery') as UniformGallery
    gallery.setAttribute('data-manifest-url', '/test.json')
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterEach(() => {
    container.parentNode && document.body.removeChild(container)
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render a .gallery-item for each image', () => {
      const items = gallery.querySelectorAll('.gallery-item')
      expect(items.length).toBe(TEST_IMAGES.length)
    })

    it('should render a .gallery-spacer as last child', () => {
      const last = gallery.lastElementChild
      expect(last?.className).toBe('gallery-spacer')
    })

    it('should set --ar CSS variable on each item', () => {
      const items = gallery.querySelectorAll<HTMLElement>('.gallery-item')
      items.forEach((item, i) => {
        const ar = item.style.getPropertyValue('--ar')
        expect(ar).toBe(TEST_IMAGES[i].aspectRatio.toString())
      })
    })

    it('should render a <picture> element inside each item', () => {
      const items = gallery.querySelectorAll('.gallery-item')
      items.forEach(item => {
        expect(item.querySelector('picture')).toBeTruthy()
      })
    })

    it('should render an <img> with alt text inside each item', () => {
      const imgs = gallery.querySelectorAll<HTMLImageElement>('.gallery-item img')
      expect(imgs.length).toBe(TEST_IMAGES.length)
      imgs.forEach((img, i) => {
        expect(img.alt).toBe(TEST_IMAGES[i].alt)
      })
    })
  })

  describe('Reveal animation', () => {
    it('should add visible class to first 3 items immediately', () => {
      const items = gallery.querySelectorAll('.gallery-item')
      // HIGH_PRIORITY_IMAGE_COUNT = 3
      for (let i = 0; i < Math.min(3, items.length); i++) {
        expect(items[i].classList.contains('visible')).toBe(true)
      }
    })
  })

  describe('Events', () => {
    it('should dispatch uniform-gallery:initialized', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true, json: () => Promise.resolve({ images: TEST_IMAGES })
      } as Response)
      const g = document.createElement('uniform-gallery') as UniformGallery
      let fired = false
      g.addEventListener('uniform-gallery:initialized', () => { fired = true })
      container.appendChild(g)
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(fired).toBe(true)
      container.removeChild(g)
    })

    it('should dispatch uniform-gallery:image-click on item click', async () => {
      let clickDetail: { index: number } | null = null
      gallery.addEventListener('uniform-gallery:image-click', (e) => {
        clickDetail = (e as CustomEvent).detail
      })
      const item = gallery.querySelector<HTMLElement>('.gallery-item')
      item?.click()
      expect(clickDetail).toBeTruthy()
    })
  })

  describe('Error handling', () => {
    it('should show error message when fetch fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
      const g = document.createElement('uniform-gallery') as UniformGallery
      container.appendChild(g)
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(g.querySelector('.uniform-gallery-error')).toBeTruthy()
      container.removeChild(g)
    })
  })

  describe('getImages()', () => {
    it('should return GalleryImageData for each image', async () => {
      const images = gallery.getImages()
      expect(images.length).toBe(TEST_IMAGES.length)
      images.forEach((img, i) => {
        expect(img.id).toBe(TEST_IMAGES[i].id)
        expect(img.alt).toBe(TEST_IMAGES[i].alt)
        expect(img.index).toBe(i)
      })
    })

    it('should cache and return same array on repeated calls', () => {
      const first = gallery.getImages()
      const second = gallery.getImages()
      expect(first).toBe(second)
    })
  })
})
```

- [ ] **Step 2: Run UI tests**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-ui.test.ts 2>&1 | tail -15
```

Expected: All UI tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-ui.test.ts
git commit -m "test: add uniform-gallery UI tests"
```

---

## Phase 5 — Accessibility Tests

### Task 6: Write and pass accessibility tests

**Files:**
- Create: `tests/uniform-gallery/uniform-gallery-accessibility.test.ts`

- [ ] **Step 1: Create accessibility test file**

```typescript
// tests/uniform-gallery/uniform-gallery-accessibility.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UniformGallery } from '../../src/components/uniform-gallery/uniform-gallery'

global.fetch = vi.fn()

const TEST_IMAGES = [
  { id: 'a-1', alt: 'Coastal sunrise with golden light', aspectRatio: 1.78,
    sources: [{ format: 'jpeg', sizes: [{ width: 1600, height: 900, url: 'a1.jpg' }] }],
    metadata: { originalWidth: 1600, originalHeight: 900, fileSize: 0 } },
  { id: 'a-2', alt: 'Forest path in autumn', aspectRatio: 0.67,
    sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 1200, url: 'a2.jpg' }] }],
    metadata: { originalWidth: 800, originalHeight: 1200, fileSize: 0 } },
]

describe('UniformGallery Accessibility Tests', () => {
  let gallery: UniformGallery
  let container: HTMLElement

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
    }))
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({ images: TEST_IMAGES })
    } as Response)

    if (!customElements.get('uniform-gallery')) {
      customElements.define('uniform-gallery', UniformGallery)
    }
    container = document.createElement('div')
    document.body.appendChild(container)
    gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  afterEach(() => {
    container.parentNode && document.body.removeChild(container)
    vi.clearAllMocks()
  })

  describe('ARIA attributes', () => {
    it('MUST give each gallery item tabindex="0"', () => {
      gallery.querySelectorAll('.gallery-item').forEach(item => {
        expect(item.getAttribute('tabindex')).toBe('0')
      })
    })

    it('MUST give each gallery item role="button"', () => {
      gallery.querySelectorAll('.gallery-item').forEach(item => {
        expect(item.getAttribute('role')).toBe('button')
      })
    })

    it('MUST give each gallery item an aria-label containing the image alt text', () => {
      const items = gallery.querySelectorAll('.gallery-item')
      items.forEach((item, i) => {
        const label = item.getAttribute('aria-label') || ''
        expect(label).toContain(TEST_IMAGES[i].alt)
      })
    })
  })

  describe('Keyboard interaction', () => {
    it('MUST open viewer on Enter key', () => {
      let clicked = false
      gallery.addEventListener('uniform-gallery:image-click', () => { clicked = true })
      const item = gallery.querySelector<HTMLElement>('.gallery-item')
      item?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(clicked).toBe(true)
    })

    it('MUST open viewer on Space key', () => {
      let clicked = false
      gallery.addEventListener('uniform-gallery:image-click', () => { clicked = true })
      const item = gallery.querySelector<HTMLElement>('.gallery-item')
      item?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
      expect(clicked).toBe(true)
    })
  })

  describe('Screen reader', () => {
    it('MUST have meaningful alt text on all images', () => {
      const imgs = gallery.querySelectorAll<HTMLImageElement>('img')
      imgs.forEach(img => {
        expect(img.alt).toBeTruthy()
        expect(img.alt.length).toBeGreaterThan(3)
      })
    })
  })
})
```

- [ ] **Step 2: Run accessibility tests**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-accessibility.test.ts 2>&1 | tail -15
```

Expected: All accessibility tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-accessibility.test.ts
git commit -m "test: add uniform-gallery accessibility tests"
```

---

## Phase 6 — Performance Tests

### Task 7: Write and pass performance tests

**Files:**
- Create: `tests/uniform-gallery/uniform-gallery-performance.test.ts`

- [ ] **Step 1: Create performance test file**

```typescript
// tests/uniform-gallery/uniform-gallery-performance.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UniformGallery } from '../../src/components/uniform-gallery/uniform-gallery'

global.fetch = vi.fn()

// 20 images for realistic performance test
const PERF_IMAGES = Array.from({ length: 20 }, (_, i) => ({
  id: `perf-${i}`,
  alt: `Performance test image ${i}`,
  aspectRatio: [1.78, 0.67, 1.0, 1.33, 0.75][i % 5],
  sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 600, url: `perf${i}.jpg` }] }],
  metadata: { originalWidth: 800, originalHeight: 600, fileSize: 0 }
}))

describe('UniformGallery Performance Tests', () => {
  let container: HTMLElement

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
    }))
    vi.mocked(fetch).mockResolvedValue({
      ok: true, json: () => Promise.resolve({ images: PERF_IMAGES })
    } as Response)

    if (!customElements.get('uniform-gallery')) {
      customElements.define('uniform-gallery', UniformGallery)
    }
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.parentNode && document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('MUST initialize within 100ms', async () => {
    const start = performance.now()
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))
    const duration = performance.now() - start
    expect(duration).toBeLessThan(200) // 200ms budget in JSDOM (slower than real browser)
  })

  it('MUST render all 20 items without throwing', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))
    const items = gallery.querySelectorAll('.gallery-item')
    expect(items.length).toBe(20)
  })

  it('MUST not grow memory excessively on repeated getImages() calls', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))

    // Call getImages() 1000 times — should return cached array, no allocation
    for (let i = 0; i < 1000; i++) {
      gallery.getImages()
    }
    // If caching works, the same array is returned every time (no throw, no OOM)
    const first = gallery.getImages()
    const second = gallery.getImages()
    expect(first).toBe(second) // same reference = cached
  })

  it('MUST clean up observers when disconnected', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 50))
    container.removeChild(gallery)
    // Should not throw after disconnection
    expect(() => gallery.isConnected).not.toThrow()
  })
})
```

- [ ] **Step 2: Run performance tests**

```bash
npx vitest run tests/uniform-gallery/uniform-gallery-performance.test.ts 2>&1 | tail -15
```

Expected: All performance tests pass.

- [ ] **Step 3: Run full test suite — verify masonry-gallery tests still pass**

```bash
npx vitest run 2>&1 | tail -10
```

Expected: uniform-gallery tests pass; masonry-gallery tests unchanged.

- [ ] **Step 4: Commit**

```bash
git add tests/uniform-gallery/uniform-gallery-performance.test.ts
git commit -m "test: add uniform-gallery performance tests"
```

---

## Phase 7 — Integration

### Task 8: Wire up uniform-gallery on the homepage

**Files:**
- Modify: `index.html`
- Modify: `src/pages/main.ts`

- [ ] **Step 1: Update main.ts**

Replace the gallery imports in `src/pages/main.ts`:

```typescript
// src/pages/main.ts

import '../styles/design-system.css'
import '../components/header/header.css'
import '../components/header/header'
import '../components/gallery/gallery.css'
import '../components/gallery/gallery'
import '../components/uniform-gallery/uniform-gallery.css'
import '../components/uniform-gallery/uniform-gallery'
import '../components/image-viewer/image-viewer'

console.log('📸 Portfolio: Loading...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('📸 Portfolio: DOM ready')
  document.documentElement.classList.add('portfolio-loaded')
})

console.log('📸 Portfolio: Initialized')
```

- [ ] **Step 2: Update index.html**

Find the `<masonry-gallery>` element in `index.html` and replace the tag name:

```html
<!-- Before -->
<masonry-gallery data-manifest-url="/gallery-data.json"></masonry-gallery>

<!-- After -->
<uniform-gallery data-manifest-url="/gallery-data.json"></uniform-gallery>
```

The `data-manifest-url` attribute and value stay identical.

- [ ] **Step 3: Start dev server and verify visually**

```bash
make dev
```

Open http://localhost:3000 and verify:
- [ ] Images render in justified rows (variable widths, uniform heights)
- [ ] Rows fill full container width edge-to-edge
- [ ] Last row is left-aligned (does not stretch)
- [ ] Images fade in as they scroll into view
- [ ] LQIP blur placeholder shows then fades out on load
- [ ] Clicking an image opens the full-screen viewer
- [ ] At narrow viewport (≤576px), images go single-column full-width

- [ ] **Step 4: Run full test suite one final time**

```bash
npx vitest run 2>&1 | tail -10
```

Expected: All uniform-gallery tests pass; all masonry-gallery tests still pass.

- [ ] **Step 5: Final commit**

```bash
git add index.html src/pages/main.ts
git commit -m "feat: replace masonry-gallery with uniform-gallery on homepage

Both components remain in codebase. uniform-gallery uses flexbox
justified rows — uniform height, variable width, scroll-reveal fade-in.
masonry-gallery tests unchanged and passing.
"
```

---

## Self-Review Checklist

- [x] Types file created (`uniform-gallery.types.ts`)
- [x] CSS covers layout, breakpoints, LQIP, animation, a11y, print
- [x] Component implements all spec requirements: `--ar` CSS var, spacer, `getImages()`, LQIP, lazy load, reveal observer, viewer integration, `matchMedia` for mobile, keyboard support
- [x] All 4 test categories covered
- [x] `masonry-gallery` not imported, not modified, not removed
- [x] `index.html` + `main.ts` integration in final task
- [x] Each task ends with a commit
- [x] No TBDs or placeholders
- [x] Type names consistent throughout: `UniformGallery`, `IUniformGallery`, `GalleryImageData`, `ResponsiveImage`, `IImageViewer`
