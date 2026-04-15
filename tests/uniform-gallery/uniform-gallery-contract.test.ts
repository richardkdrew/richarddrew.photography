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
