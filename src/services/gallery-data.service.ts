import { StaticManifestGalleryDataService } from './static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from './cloudflare-r2.gallery-data.service'

export type { IGalleryDataService } from './gallery-data.types'
import type { IGalleryDataService } from './gallery-data.types'

export function createGalleryDataService(config: { manifestUrl: string }): IGalleryDataService {
  if (import.meta.env.VITE_GALLERY_SOURCE === 'r2') {
    const r2ManifestUrl = import.meta.env.VITE_R2_MANIFEST_URL
      ?? 'https://photos.richarddrew.photography/manifest.json'
    return new CloudflareR2GalleryDataService(r2ManifestUrl)
  }
  return new StaticManifestGalleryDataService(config.manifestUrl)
}
