import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StaticManifestGalleryDataService } from '../../src/services/static-manifest.gallery-data.service'

global.fetch = vi.fn()

const makeManifest = (overrides = {}) => ({
  images: [
    {
      id: 'img-1',
      alt: 'Image One',
      aspectRatio: 1.5,
      sources: [{ format: 'jpeg', sizes: [{ width: 800, height: 533, url: '/img1.jpg' }] }],
      metadata: { originalWidth: 800, originalHeight: 533, fileSize: 12000 }
    }
  ],
  ...overrides
})

const makeOkResponse = (body: object) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response

const makeErrorResponse = (status = 404) =>
  ({ ok: false, status, statusText: 'Not Found' }) as Response

describe('StaticManifestGalleryDataService', () => {
  let service: StaticManifestGalleryDataService

  beforeEach(() => {
    service = new StaticManifestGalleryDataService('/gallery-data.json')
    vi.mocked(fetch).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and returns images from the manifest URL', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))

    const images = await service.getImages()

    expect(fetch).toHaveBeenCalledWith('/gallery-data.json')
    expect(images).toHaveLength(1)
    expect(images[0].id).toBe('img-1')
  })

  it('returns cached result on repeated calls without fetching again', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))

    await service.getImages()
    await service.getImages()

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent getImages() calls to a single fetch', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))

    const [a, b, c] = await Promise.all([
      service.getImages(),
      service.getImages(),
      service.getImages()
    ])

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
    expect(b).toBe(c)
  })

  it('throws when the fetch response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(makeErrorResponse(503))

    await expect(service.getImages()).rejects.toThrow('503')
  })

  it('throws when the manifest has no images array', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ version: '1' }))

    await expect(service.getImages()).rejects.toThrow(/invalid|missing/i)
  })

  it('throws when the images array is empty after validation', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ images: [] }))

    await expect(service.getImages()).rejects.toThrow(/no valid images/i)
  })

  it('filters out images that fail validation, keeping valid ones', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({
      images: [
        makeManifest().images[0],
        { id: '', alt: 'bad' }
      ]
    }))

    const images = await service.getImages()

    expect(images).toHaveLength(1)
    expect(images[0].id).toBe('img-1')
  })
})
