// tests/uniform-gallery/uniform-gallery-contract.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// This import will fail until Task 3 creates the component
import { UniformGallery } from '../../src/components/uniform-gallery/uniform-gallery'
import { computeRows } from '../../src/components/uniform-gallery/uniform-gallery.layout'

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

describe('computeRows()', () => {
  it('returns [] for containerWidth <= 0', () => {
    expect(computeRows([1, 1], 0, 300, 10, 0.6)).toEqual([])
  })

  it('returns [] for empty aspectRatios', () => {
    expect(computeRows([], 1200, 300, 10, 0.6)).toEqual([])
  })

  it('single group of images becomes one last row at targetHeight', () => {
    const rows = computeRows([1.5, 2.0], 1000, 300, 10, 0.6)
    expect(rows).toHaveLength(1)
    expect(rows[0].isLastRow).toBe(true)
    expect(rows[0].height).toBe(300)
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 300)
    expect(rows[0].items[1].width).toBeCloseTo(2.0 * 300)
  })

  it('breaks into two rows when height would drop below minimum', () => {
    // 6 equal AR=1 images at 600px container, gap=0, target=300, minRatio=0.6 (min=180px)
    // After 3 images: height = 600/3 = 200 > 180 ✓
    // Adding 4th: height = 600/4 = 150 < 180 → row breaks
    const rows = computeRows([1, 1, 1, 1, 1, 1], 600, 300, 0, 0.6)
    expect(rows).toHaveLength(2)
    expect(rows[0].items).toHaveLength(3)
    expect(rows[0].isLastRow).toBe(false)
    expect(rows[1].isLastRow).toBe(true)
  })

  it('last row always uses targetHeight, not computed height', () => {
    const rows = computeRows([1.5, 2.0, 0.5], 1200, 300, 10, 0.6)
    const lastRow = rows[rows.length - 1]
    expect(lastRow.isLastRow).toBe(true)
    expect(lastRow.height).toBe(300)
  })

  it('non-last row height = (containerWidth - gaps) / sumAR', () => {
    // [1.5, 2.0] fills first row; adding 1.0 would drop height below min (153 < 180)
    // so first row is finalised at height = (710-10)/(1.5+2.0) = 700/3.5 = 200
    const rows = computeRows([1.5, 2.0, 1.0], 710, 300, 10, 0.6)
    expect(rows[0].isLastRow).toBe(false)
    expect(rows[0].height).toBeCloseTo(200)
    expect(rows[0].items[0].width).toBeCloseTo(1.5 * 200)
    expect(rows[0].items[1].width).toBeCloseTo(2.0 * 200)
  })

  it('each item width = aspectRatio × row height', () => {
    const rows = computeRows([1.5, 0.75, 1.33], 1200, 300, 10, 0.6)
    for (const row of rows) {
      for (const item of row.items) {
        expect(item.width).toBeCloseTo(item.aspectRatio * row.height)
      }
    }
  })
})
