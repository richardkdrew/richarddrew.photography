import type { ResponsiveImage } from '../components/gallery/gallery.types'
import { StaticManifestGalleryDataService } from './static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from './cloudflare-r2.gallery-data.service'

export interface IGalleryDataService {
  getImages(): Promise<ResponsiveImage[]>
}

export function createGalleryDataService(config: { manifestUrl: string }): IGalleryDataService {
  const env = (import.meta as unknown as { env: Record<string, string> }).env
  if (env.VITE_GALLERY_SOURCE === 'r2') {
    return new CloudflareR2GalleryDataService()
  }
  return new StaticManifestGalleryDataService(config.manifestUrl)
}
