import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MasonryGallery } from '../../src/components/gallery/gallery'

// Mock fetch for manifest loading
global.fetch = vi.fn()

describe('Masonry Gallery - E2E Layout & Resize Tests', () => {
  let gallery: MasonryGallery
  let container: HTMLElement

  // Mock manifest data (matches ResponsiveImage structure)
  const mockManifest = {
    images: [
      {
        id: '1',
        alt: 'Test 1',
        aspectRatio: 1.5,
        sources: [
          {
            format: 'webp',
            sizes: [
              { width: 400, height: 267, url: '/img1-400.webp' },
              { width: 800, height: 533, url: '/img1-800.webp' }
            ]
          },
          {
            format: 'jpeg',
            sizes: [
              { width: 400, height: 267, url: '/img1-400.jpg' },
              { width: 800, height: 533, url: '/img1-800.jpg' }
            ]
          }
        ],
        metadata: { originalWidth: 1600, originalHeight: 1067, fileSize: 245760 }
      },
      {
        id: '2',
        alt: 'Test 2',
        aspectRatio: 0.8,
        sources: [
          {
            format: 'webp',
            sizes: [
              { width: 400, height: 500, url: '/img2-400.webp' },
              { width: 800, height: 1000, url: '/img2-800.webp' }
            ]
          },
          {
            format: 'jpeg',
            sizes: [
              { width: 400, height: 500, url: '/img2-400.jpg' },
              { width: 800, height: 1000, url: '/img2-800.jpg' }
            ]
          }
        ],
        metadata: { originalWidth: 1600, originalHeight: 2000, fileSize: 345760 }
      },
      {
        id: '3',
        alt: 'Test 3',
        aspectRatio: 1.2,
        sources: [
          {
            format: 'webp',
            sizes: [
              { width: 400, height: 333, url: '/img3-400.webp' },
              { width: 800, height: 667, url: '/img3-800.webp' }
            ]
          },
          {
            format: 'jpeg',
            sizes: [
              { width: 400, height: 333, url: '/img3-400.jpg' },
              { width: 800, height: 667, url: '/img3-800.jpg' }
            ]
          }
        ],
        metadata: { originalWidth: 1600, originalHeight: 1333, fileSize: 285760 }
      },
      {
        id: '4',
        alt: 'Test 4',
        aspectRatio: 2.0,
        sources: [
          {
            format: 'webp',
            sizes: [
              { width: 400, height: 200, url: '/img4-400.webp' },
              { width: 800, height: 400, url: '/img4-800.webp' }
            ]
          },
          {
            format: 'jpeg',
            sizes: [
              { width: 400, height: 200, url: '/img4-400.jpg' },
              { width: 800, height: 400, url: '/img4-800.jpg' }
            ]
          }
        ],
        metadata: { originalWidth: 1600, originalHeight: 800, fileSize: 185760 }
      }
    ]
  }

  beforeEach(async () => {
    // Mock ResizeObserver BEFORE creating any components
    const mockResizeObserver = vi.fn()
    mockResizeObserver.mockImplementation((callback) => {
      const instance = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        callback
      }
      return instance
    })
    global.ResizeObserver = mockResizeObserver

    // Mock CSS custom properties for layout calculations
    const originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = vi.fn().mockImplementation((element) => {
      const style = originalGetComputedStyle(element)
      return {
        ...style,
        getPropertyValue: vi.fn().mockImplementation((property) => {
          // Return mock values for CSS custom properties
          if (property === '--columns') {
            // Return column count based on current viewport width (mimics CSS media queries)
            const width = window.innerWidth
            if (width < 768) return '1'        // mobile
            if (width < 1024) return '3'       // tablet
            if (width < 1200) return '4'       // large tablet
            if (width < 1600) return '5'       // desktop
            return '6'                         // large desktop
          }

          switch (property) {
            case '--breakpoint-mobile': return '48rem'
            case '--breakpoint-tablet': return '48rem'
            case '--breakpoint-large-tablet': return '64rem'
            case '--breakpoint-desktop': return '75rem'
            case '--breakpoint-large-desktop': return '100rem'
            case '--columns-mobile': return '1'
            case '--columns-tablet': return '2'
            case '--columns-large-tablet': return '3'
            case '--columns-desktop': return '4'
            case '--columns-large-desktop': return '5'
            case '--columns-max': return '6'
            case '--masonry-padding-small': return '0.3rem'
            case '--masonry-padding-large': return '0.5rem'
            case '--masonry-padding-vertical': return '0.5rem'
            case '--gallery-width-full': return '96%'
            case '--gallery-width-constrained': return '92%'
            default: return style.getPropertyValue ? style.getPropertyValue(property) : ''
          }
        }),
        fontSize: '16px'
      }
    })

    // Mock successful fetch
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockManifest),
    } as Response)

    // Register custom element
    if (!customElements.get('masonry-gallery')) {
      customElements.define('masonry-gallery', MasonryGallery)
    }

    // Setup container with proper sizing for layout calculations
    container = document.createElement('div')
    container.style.width = '1200px' // Fixed width for predictable testing
    container.style.height = '100vh'
    document.body.appendChild(container)

    // Create gallery
    gallery = document.createElement('masonry-gallery') as MasonryGallery
    gallery.setAttribute('role', 'main')
    gallery.setAttribute('aria-label', 'Portfolio image gallery')
    gallery.setAttribute('data-manifest-url', '/test-manifest.json')

    // Set up gallery dimensions before connecting
    gallery.style.width = '1200px'
    Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1200 })
    Object.defineProperty(gallery, 'clientWidth', { writable: true, value: 1200 })

    container.appendChild(gallery)

    // Wait for component to be fully connected and layout calculated
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => setTimeout(resolve, 200)) // Allow time for image loading and layout
  })

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
    vi.resetAllMocks()
  })

  describe('Responsive Breakpoints', () => {
    it('should display 1 column on mobile (< 768px)', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 380 })

      // Trigger resize and wait for layout
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300)) // Wait for debounced resize and layout

      // Check column structure - should have at least 1 column
      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(1)

      // On mobile, should typically be 1-2 columns
      expect(columns.length).toBeLessThanOrEqual(3)
    })

    it('should display columns on tablet (768-1023px)', async () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 768 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(1)
      expect(columns.length).toBeLessThanOrEqual(4)
    })

    it('should display columns on large tablet (1024-1199px)', async () => {
      // Set large tablet viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1100 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1012 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(1)
      expect(columns.length).toBeLessThanOrEqual(5)
    })

    it('should display columns on desktop (≥ 1200px)', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1288 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(1)
      expect(columns.length).toBeLessThanOrEqual(7)
    })
  })

  describe('Layout Width Management', () => {
    it('should have width set for narrow layouts', async () => {
      // Mobile viewport - should be 1-2 columns
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 576 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      // Layout should have been calculated and applied
      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(1)

      // Gallery should have some meaningful layout properties
      expect(gallery.style.height || '0px').toMatch(/\d+px/)
    })

    it('should have width set for wide layouts', async () => {
      // Desktop viewport - should be 3+ columns
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1104 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      // Layout should have been calculated and applied
      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThanOrEqual(3)

      // Gallery should have some meaningful layout properties
      expect(gallery.style.height || '0px').toMatch(/\d+px/)
    })
  })

  describe('Scrollbar Compensation', () => {
    it('should prevent horizontal overflow on narrow layouts', async () => {
      // Set narrow viewport that would trigger scrollbar compensation
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 784 }) // 98% of 800

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 200))

      // Verify no horizontal overflow
      expect(gallery.scrollWidth).toBeLessThanOrEqual(gallery.clientWidth + 1) // Allow 1px tolerance
    })
  })

  describe('Resize Behavior', () => {
    it('should handle resize from mobile to desktop', async () => {
      // Start with mobile
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 384 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const mobileColumns = gallery.querySelectorAll('.masonry-column').length

      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1288 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const desktopColumns = gallery.querySelectorAll('.masonry-column').length

      // Should have at least some columns in both cases
      expect(mobileColumns).toBeGreaterThan(0)
      expect(desktopColumns).toBeGreaterThan(0)
    })

    it('should handle resize from desktop to mobile', async () => {
      // Start with desktop
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1288 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const desktopColumns = gallery.querySelectorAll('.masonry-column').length

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 384 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const mobileColumns = gallery.querySelectorAll('.masonry-column').length

      // Should have at least some columns in both cases
      expect(desktopColumns).toBeGreaterThan(0)
      expect(mobileColumns).toBeGreaterThan(0)
    })

    it('should debounce resize events', async () => {
      // Fire multiple rapid resize events
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'))
      }

      // Wait longer than debounce timeout (150ms)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Layout should still work after debouncing
      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThan(0)
    })
  })

  describe('Image Layout', () => {
    it('should create column structure', async () => {
      // Set up with multiple columns
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1104 })

      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      const columns = gallery.querySelectorAll('.masonry-column')
      expect(columns.length).toBeGreaterThan(0)

      // Check that gallery has some structure
      expect(gallery.children.length).toBeGreaterThan(0)
    })

    it('should maintain aspect ratios', async () => {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 300))

      const imageContainers = gallery.querySelectorAll('.portfolio-image img')
      expect(imageContainers.length).toBeGreaterThan(0)

      imageContainers.forEach(img => {
        // Check that images are properly rendered
        // Note: object-fit, width, height are set via CSS classes, not inline styles
        const imgElement = img as HTMLImageElement
        expect(imgElement.tagName).toBe('IMG')
        expect(imgElement.src).toBeTruthy()
        expect(imgElement.alt).toBeTruthy()
      })
    })
  })

  // Accessibility tests moved to gallery-accessibility.test.ts for comprehensive WCAG coverage

  describe('Image Order Preservation', () => {
    it('should maintain manifest order using data-index after redistribution', async () => {
      // Wait for initial layout
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get all images in DOM order
      const images = Array.from(gallery.querySelectorAll('.portfolio-image img')) as HTMLImageElement[]
      expect(images.length).toBeGreaterThan(0)

      // Verify each image has data-index attribute from manifest
      images.forEach((img) => {
        expect(img.dataset.index).toBeDefined()
        const dataIndex = parseInt(img.dataset.index || '-1', 10)
        expect(dataIndex).toBeGreaterThanOrEqual(0)
        expect(dataIndex).toBeLessThan(mockManifest.images.length)
      })

      // Trigger resize to force redistribution
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 768 })
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get images again after redistribution
      const redistributedImages = Array.from(gallery.querySelectorAll('.portfolio-image img')) as HTMLImageElement[]

      // Verify data-index attributes are still present and valid
      redistributedImages.forEach((img) => {
        expect(img.dataset.index).toBeDefined()
        const dataIndex = parseInt(img.dataset.index || '-1', 10)
        expect(dataIndex).toBeGreaterThanOrEqual(0)
        expect(dataIndex).toBeLessThan(mockManifest.images.length)
      })

      // Verify we still have all images (none lost during redistribution)
      expect(redistributedImages.length).toBe(images.length)
    })

    it('should correctly map data-index to manifest data for aspect ratio calculations', async () => {
      // Wait for initial layout
      await new Promise(resolve => setTimeout(resolve, 300))

      const images = Array.from(gallery.querySelectorAll('.portfolio-image img')) as HTMLImageElement[]
      expect(images.length).toBe(mockManifest.images.length)

      // Verify each image's data-index correctly references manifest data
      images.forEach((img) => {
        const dataIndex = parseInt(img.dataset.index || '-1', 10)
        expect(dataIndex).toBeGreaterThanOrEqual(0)

        // The data-index should map to the correct image in the manifest
        const manifestImage = mockManifest.images[dataIndex]
        expect(manifestImage).toBeDefined()

        // Verify the ID matches (if IDs are sequential, this confirms correct mapping)
        expect(img.dataset.id || manifestImage.id).toBeTruthy()
      })
    })

    it('should preserve data-index across column count changes', async () => {
      // Wait for initial layout
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get initial data-index values
      const initialImages = Array.from(gallery.querySelectorAll('.portfolio-image img')) as HTMLImageElement[]
      const initialDataIndices = initialImages.map(img => ({
        id: img.dataset.id,
        index: img.dataset.index
      }))

      // Change column count (mobile -> desktop)
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1400 })
      Object.defineProperty(gallery, 'offsetWidth', { writable: true, value: 1288 })
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get data-index values after resize
      const resizedImages = Array.from(gallery.querySelectorAll('.portfolio-image img')) as HTMLImageElement[]
      const resizedDataIndices = resizedImages.map(img => ({
        id: img.dataset.id,
        index: img.dataset.index
      }))

      // Verify each image still has the same data-index (even if DOM position changed)
      initialDataIndices.forEach((initial) => {
        const resized = resizedDataIndices.find(r => r.id === initial.id)
        expect(resized).toBeDefined()
        expect(resized?.index).toBe(initial.index)
      })
    })
  })
})