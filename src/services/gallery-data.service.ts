import { StaticManifestGalleryDataService } from './static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from './cloudflare-r2.gallery-data.service'

export type { IGalleryDataService } from './gallery-data.types'
import type { IGalleryDataService } from './gallery-data.types'

export function createGalleryDataService(config: { manifestUrl: string }): IGalleryDataService {
  // CloudflareR2GalleryDataService is a stub — not for production use until implemented
  if (import.meta.env.VITE_GALLERY_SOURCE === 'r2') {
    return new CloudflareR2GalleryDataService()
  }
  return new StaticManifestGalleryDataService(config.manifestUrl)
}
