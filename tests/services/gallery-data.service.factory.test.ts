import { describe, it, expect } from 'vitest'
import { createGalleryDataService } from '../../src/services/gallery-data.service'
import { StaticManifestGalleryDataService } from '../../src/services/static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

describe('createGalleryDataService factory', () => {
  it('returns StaticManifestGalleryDataService by default', () => {
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(StaticManifestGalleryDataService)
  })

  it('returns CloudflareR2GalleryDataService when VITE_GALLERY_SOURCE is r2', () => {
    import.meta.env.VITE_GALLERY_SOURCE = 'r2'
    import.meta.env.VITE_R2_MANIFEST_URL = 'https://photos.test.com/manifest.json'
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(CloudflareR2GalleryDataService)
    import.meta.env.VITE_GALLERY_SOURCE = undefined
    import.meta.env.VITE_R2_MANIFEST_URL = undefined
  })
})
