import { describe, it, expect } from 'vitest'
import { createGalleryDataService } from '../../src/services/gallery-data.service'
import { StaticManifestGalleryDataService } from '../../src/services/static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

describe('createGalleryDataService factory', () => {
  it('returns StaticManifestGalleryDataService by default', () => {
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(StaticManifestGalleryDataService)
  })

  it('CloudflareR2GalleryDataService getImages() throws not-implemented', async () => {
    const service = new CloudflareR2GalleryDataService()
    await expect(service.getImages()).rejects.toThrow('not implemented')
  })
})
