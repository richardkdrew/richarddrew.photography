/**
 * Vitest Test Setup
 * Global mocks and polyfills for JSDOM environment
 */

// Import components to register custom elements
import '../src/components/image-viewer/image-viewer'

/**
 * Mock fetch for loading HTML templates in tests
 */
const imageViewerHTML = `<article class="image-viewer" data-state="inactive" role="dialog" aria-label="Image viewer" aria-modal="true">
  <header class="viewer__header">
    <span class="viewer__counter" data-counter aria-live="polite" aria-atomic="true">Image 1 of 1</span>
    <button class="viewer__close" data-close aria-label="Close image viewer" type="button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </header>
  <figure class="viewer__content">
    <div class="viewer__image-container">
      <picture>
        <source type="image/webp" srcset="" data-webp-srcset>
        <img class="viewer__image" src="" srcset="" alt="" loading="eager" fetchpriority="high" data-image>
      </picture>
    </div>
    <button class="viewer__nav viewer__nav--prev" data-prev aria-label="Previous image" type="button" disabled>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <button class="viewer__nav viewer__nav--next" data-next aria-label="Next image" type="button">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </figure>
</article>`

global.fetch = ((url: any) => {
  const urlString = typeof url === 'string' ? url : url.toString()
  if (urlString.includes('image-viewer.html')) {
    return Promise.resolve({
      text: () => Promise.resolve(imageViewerHTML)
    } as Response)
  }
  return Promise.reject(new Error(`Unmocked fetch: ${urlString}`))
}) as typeof fetch

/**
 * Mock window.scrollY and window.scrollTo for JSDOM
 */
let mockScrollY = 0
Object.defineProperty(window, 'scrollY', {
  get: () => mockScrollY,
  configurable: true
})

Object.defineProperty(window, 'scrollTo', {
  value: (x: number, y: number) => {
    mockScrollY = y
  },
  configurable: true
})

/**
 * Mock IntersectionObserver for JSDOM
 * Used by gallery component for lazy loading
 */
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(public callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {}

  observe(): void {
    // Mock implementation - do nothing
  }

  unobserve(): void {
    // Mock implementation - do nothing
  }

  disconnect(): void {
    // Mock implementation - do nothing
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// Install mock globally
global.IntersectionObserver = IntersectionObserverMock as any

/**
 * Mock ResizeObserver with functional callback support
 * Allows tests to manually trigger resize events via triggerResizeObserver(element)
 */
class ResizeObserverMock implements ResizeObserver {
  private callback: ResizeObserverCallback
  private observedElements = new Set<Element>()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    ResizeObserverMock.instances.push(this)
  }

  observe(target: Element): void {
    this.observedElements.add(target)
  }

  unobserve(target: Element): void {
    this.observedElements.delete(target)
  }

  disconnect(): void {
    this.observedElements.clear()
  }

  // Internal: Trigger callback for testing
  _trigger(element: Element): void {
    if (this.observedElements.has(element)) {
      const entry: ResizeObserverEntry = {
        target: element,
        contentRect: element.getBoundingClientRect(),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: []
      }
      this.callback([entry], this)
    }
  }

  // Static registry for testing
  static instances: ResizeObserverMock[] = []
  static reset(): void {
    ResizeObserverMock.instances = []
  }
}

// Install mock globally
global.ResizeObserver = ResizeObserverMock as any

// Global test helper to trigger ResizeObserver callbacks
;(global as any).triggerResizeObserver = (element: Element) => {
  ResizeObserverMock.instances.forEach(observer => {
    observer._trigger(element)
  })
}
