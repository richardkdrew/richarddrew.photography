import { describe, it, expect, afterEach, vi } from 'vitest'
import { createGalleryDataService } from '../../src/services/gallery-data.service'
import { StaticManifestGalleryDataService } from '../../src/services/static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

describe('createGalleryDataService factory', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns StaticManifestGalleryDataService by default', () => {
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(StaticManifestGalleryDataService)
  })

  it('returns CloudflareR2GalleryDataService when VITE_GALLERY_SOURCE is r2', () => {
    vi.stubEnv('VITE_GALLERY_SOURCE', 'r2')
    vi.stubEnv('VITE_R2_MANIFEST_URL', 'https://photos.test.com/manifest.json')
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(CloudflareR2GalleryDataService)
  })

  it('uses hardcoded fallback URL when VITE_R2_MANIFEST_URL is not set', () => {
    vi.stubEnv('VITE_GALLERY_SOURCE', 'r2')
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(CloudflareR2GalleryDataService)
  })
})
