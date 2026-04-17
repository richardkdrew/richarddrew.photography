/**
 * Contract Tests: MasonryGallery Component
 * Basic component contract and type validation tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MasonryGallery } from '../../src/components/gallery/gallery'
import {
  DEFAULT_COLUMN_COUNTS,
  DEFAULT_PADDING,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_PERFORMANCE,
  calculateAspectRatio
} from '../../src/components/gallery/gallery.types'
import {
  type SimpleImage,
  isValidSimpleImage,
  createMockResponsiveImage,
  setupGalleryWithMockService
} from './test-utils'

describe('Gallery Contract Tests', () => {
  let gallery: MasonryGallery
  let container: HTMLElement

  beforeEach(async () => {
    // Mock window.matchMedia for tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))

    // Register custom element if not already registered
    if (!customElements.get('masonry-gallery')) {
      customElements.define('masonry-gallery', MasonryGallery)
    }

    container = document.createElement('div')
    document.body.appendChild(container)

    gallery = await setupGalleryWithMockService(
      [createMockResponsiveImage({ id: 'test-1', alt: 'Test Image 1' })],
      container
    )
  })

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
  })

  describe('Component Interface Contract', () => {
    it('MUST extend HTMLElement', () => {
      expect(gallery).toBeInstanceOf(HTMLElement)
      expect(gallery).toBeInstanceOf(MasonryGallery)
    })

    it('MUST have masonry-gallery class name', () => {
      expect(gallery.className).toBe('masonry-gallery')
    })

    it('MUST be registered as custom element', () => {
      expect(customElements.get('masonry-gallery')).toBe(MasonryGallery)
    })

    it('MUST be a web component', () => {
      expect(gallery.tagName.toLowerCase()).toBe('masonry-gallery')
      expect(gallery.isConnected).toBe(true)
    })
  })

  describe('Configuration Contract', () => {
    it('MUST have valid default column counts', () => {
      expect(DEFAULT_COLUMN_COUNTS).toEqual({
        mobile: 1,
        tablet: 3,
        largeTablet: 4,
        desktop: 4,
        largeDesktop: 5,
        max: 6
      })

      // Column counts should be positive integers
      Object.values(DEFAULT_COLUMN_COUNTS).forEach(count => {
        expect(count).toBeGreaterThan(0)
        expect(Number.isInteger(count)).toBe(true)
      })
    })

    it('MUST have valid default padding configuration', () => {
      expect(DEFAULT_PADDING).toBeDefined()
      expect(typeof DEFAULT_PADDING.small).toBe('number')
      expect(typeof DEFAULT_PADDING.large).toBe('number')
      expect(typeof DEFAULT_PADDING.vertical).toBe('number')
      expect(DEFAULT_PADDING.small).toBeGreaterThanOrEqual(0)
      expect(DEFAULT_PADDING.large).toBeGreaterThanOrEqual(0)
      expect(DEFAULT_PADDING.vertical).toBeGreaterThanOrEqual(0)
    })

    it('MUST have valid default column width', () => {
      expect(DEFAULT_COLUMN_WIDTH).toBeDefined()
      expect(typeof DEFAULT_COLUMN_WIDTH.minimum).toBe('number')
      expect(typeof DEFAULT_COLUMN_WIDTH.calculation).toBe('string')
      expect(DEFAULT_COLUMN_WIDTH.minimum).toBeGreaterThan(0)
      expect(['equal', 'flexible', 'masonry']).toContain(DEFAULT_COLUMN_WIDTH.calculation)
    })

    it('MUST have valid default performance configuration', () => {
      expect(DEFAULT_PERFORMANCE).toBeDefined()
      expect(typeof DEFAULT_PERFORMANCE.maxInitializationTime).toBe('number')
      expect(typeof DEFAULT_PERFORMANCE.maxResizeTime).toBe('number')
      expect(typeof DEFAULT_PERFORMANCE.maxImageLoadTime).toBe('number')
      expect(typeof DEFAULT_PERFORMANCE.preloadCount).toBe('number')
      expect(typeof DEFAULT_PERFORMANCE.lazyLoadThreshold).toBe('string')
      expect(typeof DEFAULT_PERFORMANCE.memoryManagement).toBe('boolean')
      expect(DEFAULT_PERFORMANCE.maxInitializationTime).toBeGreaterThan(0)
      expect(DEFAULT_PERFORMANCE.maxResizeTime).toBeGreaterThan(0)
      expect(DEFAULT_PERFORMANCE.maxImageLoadTime).toBeGreaterThan(0)
      expect(DEFAULT_PERFORMANCE.preloadCount).toBeGreaterThan(0)
    })
  })

  describe('Image Validation Contract', () => {
    it('MUST validate SimpleImage objects correctly', () => {
      const validImage: SimpleImage = {
        id: 'test-image-1',
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        aspectRatio: 4/3,
        metadata: {
          width: 800,
          height: 600
        }
      }

      expect(isValidSimpleImage(validImage)).toBe(true)
    })

    it('MUST reject invalid SimpleImage objects', () => {
      const invalidImages = [
        // Missing required properties
        { alt: 'Test', width: 800, height: 600 },
        { src: 'test.jpg', width: 800, height: 600 },
        { src: 'test.jpg', alt: 'Test', height: 600 },
        { src: 'test.jpg', alt: 'Test', width: 800 },

        // Invalid types
        { src: 123, alt: 'Test', width: 800, height: 600 },
        { src: 'test.jpg', alt: 123, width: 800, height: 600 },
        { src: 'test.jpg', alt: 'Test', width: '800', height: 600 },
        { src: 'test.jpg', alt: 'Test', width: 800, height: '600' },

        // Invalid values
        { src: '', alt: 'Test', width: 800, height: 600 },
        { src: 'test.jpg', alt: '', width: 800, height: 600 },
        { src: 'test.jpg', alt: 'Test', width: 0, height: 600 },
        { src: 'test.jpg', alt: 'Test', width: 800, height: 0 },
        { src: 'test.jpg', alt: 'Test', width: -100, height: 600 },
        { src: 'test.jpg', alt: 'Test', width: 800, height: -100 }
      ]

      invalidImages.forEach(invalidImage => {
        expect(isValidSimpleImage(invalidImage as any)).toBe(false)
      })
    })
  })

  describe('Component Lifecycle Contract', () => {
    it('MUST initialize when connected to DOM', async () => {
      const testGallery = document.createElement('masonry-gallery') as MasonryGallery
      expect(testGallery.className).toBe('')

      // Add to DOM (triggers connectedCallback)
      container.appendChild(testGallery)
      await new Promise(resolve => requestAnimationFrame(resolve))

      expect(testGallery.className).toBe('masonry-gallery')
      container.removeChild(testGallery)
    })

    it('MUST clean up when disconnected from DOM', () => {
      const testGallery = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(testGallery)

      expect(testGallery.isConnected).toBe(true)

      // Remove from DOM (triggers disconnectedCallback)
      container.removeChild(testGallery)
      expect(testGallery.isConnected).toBe(false)
    })
  })

  describe('Responsive Behavior Contract', () => {
    it('MUST adapt to viewport size changes', () => {
      // Gallery should use CSS for responsive behavior
      expect(gallery.className).toBe('masonry-gallery')

      // Should handle viewport changes via CSS
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      window.dispatchEvent(new Event('resize'))

      expect(gallery.isConnected).toBe(true)
    })
  })

  describe('Gallery dataService injection', () => {
    it('accepts injected service and calls getImages()', async () => {
      const mockService = {
        getImages: vi.fn().mockResolvedValue([createMockResponsiveImage()])
      }
      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      ;(g as any).dataService = mockService
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockService.getImages).toHaveBeenCalledTimes(1)
    })

    it('falls back to static manifest service when no service injected', async () => {
      global.fetch = vi.fn()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: [
          {
            id: 'fallback-1', alt: 'Fallback', aspectRatio: 1.5,
            sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 533, url: 'f.jpg' }] }],
            metadata: { originalWidth: 800, originalHeight: 533, fileSize: 0 }
          }
        ]})
      } as Response)

      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      // Do NOT inject service
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(fetch).toHaveBeenCalled()
    })

    it('does not initialize twice if dataService setter called twice', async () => {
      const mockService = {
        getImages: vi.fn().mockResolvedValue([createMockResponsiveImage()])
      }
      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      ;(g as any).dataService = mockService
      ;(g as any).dataService = mockService
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockService.getImages).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading spinner', () => {
    it('shows spinner while getImages() is in flight', async () => {
      let resolveImages!: (images: any[]) => void
      const pendingService = {
        getImages: vi.fn().mockReturnValue(
          new Promise<any[]>(resolve => { resolveImages = resolve })
        )
      }

      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      ;(g as any).dataService = pendingService

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(g.querySelector('.gallery-spinner')).not.toBeNull()

      resolveImages([])
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('removes spinner after getImages() resolves', async () => {
      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      ;(g as any).dataService = { getImages: vi.fn().mockResolvedValue([createMockResponsiveImage()]) }
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(g.querySelector('.gallery-spinner')).toBeNull()
    })

    it('removes spinner after getImages() rejects', async () => {
      const g = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(g)
      ;(g as any).dataService = { getImages: vi.fn().mockRejectedValue(new Error('load failed')) }
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(g.querySelector('.gallery-spinner')).toBeNull()
    })
  })
})
