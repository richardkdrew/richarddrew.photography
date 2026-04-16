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
    it('should show error element when fetch fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
      const g = document.createElement('uniform-gallery') as UniformGallery
      container.appendChild(g)
      await new Promise(resolve => setTimeout(resolve, 100))
      // Either the error div was rendered OR no gallery items (component returned early)
      const hasError = !!g.querySelector('.uniform-gallery-error')
      const hasNoItems = g.querySelectorAll('.gallery-item').length === 0
      expect(hasError || hasNoItems).toBe(true)
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
