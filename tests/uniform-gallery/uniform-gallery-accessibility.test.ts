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
    it('MUST trigger click on Enter key', () => {
      let clicked = false
      const item = gallery.querySelector<HTMLElement>('.gallery-item')
      item?.addEventListener('click', () => { clicked = true })
      item?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(clicked).toBe(true)
    })

    it('MUST trigger click on Space key', () => {
      let clicked = false
      const item = gallery.querySelector<HTMLElement>('.gallery-item')
      item?.addEventListener('click', () => { clicked = true })
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
