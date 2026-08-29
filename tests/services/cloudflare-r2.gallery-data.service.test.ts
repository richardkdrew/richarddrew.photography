import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

const BASE_URL = 'https://photos.test.com'
const MANIFEST_URL = `${BASE_URL}/manifest.json`

const makeManifest = (overrides = {}) => ({
  version: '1.0',
  generated: '2026-04-18T10:00:00Z',
  base_url: BASE_URL,
  galleries: {
    landscapes: { title: 'Landscapes', description: '', created: '2026-04-18T10:00:00Z' }
  },
  images: {
    'mountain-sunset': {
      id: 'mountain-sunset',
      filename: 'mountain-sunset.jpg',
      path: 'landscapes/mountain-sunset.jpg',
      gallery: 'landscapes',
      alt: 'Mountain at golden hour',
      date_taken: '2025-08-15',
      uploaded: '2026-04-18T10:00:00Z',
      dimensions: { width: 6000, height: 4000 }
    }
  },
  ...overrides
})

const makeOkResponse = (body: object) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response

const makeErrorResponse = (status = 500) =>
  ({ ok: false, status, statusText: 'Server Error' }) as Response

describe('CloudflareR2GalleryDataService', () => {
  let service: CloudflareR2GalleryDataService

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    service = new CloudflareR2GalleryDataService(MANIFEST_URL)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- Contract ---

  it('implements IGalleryDataService — getImages returns ResponsiveImage[]', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    expect(Array.isArray(images)).toBe(true)
    expect(images[0]).toHaveProperty('id')
    expect(images[0]).toHaveProperty('alt')
    expect(images[0]).toHaveProperty('aspectRatio')
    expect(images[0]).toHaveProperty('sources')
    expect(images[0]).toHaveProperty('metadata')
  })

  it('fetches from the manifest URL', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    await service.getImages()
    expect(fetch).toHaveBeenCalledWith(MANIFEST_URL)
  })

  // --- Unit: URL construction ---

  it('generates 6 breakpoint sizes per image', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')
    expect(webpSource?.sizes).toHaveLength(6)
  })

  it('constructs cdn-cgi/image/ URLs with correct width and quality', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const mobile = webpSource.sizes.find(s => s.width === 400)!
    expect(mobile.url).toBe(
      `${BASE_URL}/cdn-cgi/image/width=400,format=webp,quality=85/landscapes/mountain-sunset.jpg`
    )
  })

  it('uses quality=90 for large-desktop breakpoint (1600px)', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const largeDesktop = webpSource.sizes.find(s => s.width === 1600)!
    expect(largeDesktop.url).toContain('quality=90')
  })

  it('calculates correct aspectRatio from dimensions', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    // 6000 / 4000 = 1.5
    expect(images[0].aspectRatio).toBeCloseTo(1.5)
  })

  it('calculates correct height for each breakpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const mobile = webpSource.sizes.find(s => s.width === 400)!
    // 400 / (6000/4000) = 400 / 1.5 = 267
    expect(mobile.height).toBe(267)
  })

  it('maps metadata fields from manifest', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    expect(images[0].metadata.originalWidth).toBe(6000)
    expect(images[0].metadata.originalHeight).toBe(4000)
    expect(images[0].metadata.dateTaken).toBe('2025-08-15')
  })

  it('returns multiple images when manifest has multiple', async () => {
    const manifest = makeManifest({
      images: {
        'img-1': { id: 'img-1', filename: 'img-1.jpg', path: 'landscapes/img-1.jpg', gallery: 'landscapes', alt: 'One', uploaded: '2026-04-18T10:00:00Z', dimensions: { width: 3000, height: 2000 } },
        'img-2': { id: 'img-2', filename: 'img-2.jpg', path: 'landscapes/img-2.jpg', gallery: 'landscapes', alt: 'Two', uploaded: '2026-04-18T10:00:00Z', dimensions: { width: 3000, height: 2000 } },
      }
    })
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(manifest))
    const images = await service.getImages()
    expect(images).toHaveLength(2)
  })

  it('omits dateTaken from metadata when date_taken is absent', async () => {
    const manifest = makeManifest({
      images: {
        'no-date': { id: 'no-date', filename: 'no-date.jpg', path: 'landscapes/no-date.jpg', gallery: 'landscapes', alt: 'No date', uploaded: '2026-04-18T10:00:00Z', dimensions: { width: 3000, height: 2000 } }
      }
    })
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(manifest))
    const images = await service.getImages()
    expect('dateTaken' in images[0].metadata).toBe(false)
  })

  // --- Error ---

  it('throws when manifest fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue(makeErrorResponse(500))
    await expect(service.getImages()).rejects.toThrow('Failed to load R2 manifest: 500 Server Error')
  })

  it('throws when manifest has no images field', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ version: '1.0', base_url: BASE_URL }))
    await expect(service.getImages()).rejects.toThrow()
  })
})
