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

  it('MUST initialize within 500ms (JSDOM budget)', async () => {
    const start = performance.now()
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))
    const duration = performance.now() - start
    expect(duration).toBeLessThan(500)
  })

  it('MUST render all 20 items without throwing', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))
    const items = gallery.querySelectorAll('.gallery-item')
    expect(items.length).toBe(20)
  })

  it('MUST cache getImages() — same reference on repeated calls', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 100))

    for (let i = 0; i < 1000; i++) {
      gallery.getImages()
    }
    const first = gallery.getImages()
    const second = gallery.getImages()
    expect(first).toBe(second)
  })

  it('MUST clean up without throwing when disconnected', async () => {
    const gallery = document.createElement('uniform-gallery') as UniformGallery
    container.appendChild(gallery)
    await new Promise(resolve => setTimeout(resolve, 50))
    container.removeChild(gallery)
    expect(() => gallery.isConnected).not.toThrow()
  })
})
