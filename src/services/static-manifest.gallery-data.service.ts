import type { ResponsiveImage } from '../components/gallery/gallery.types'
import type { IGalleryDataService } from './gallery-data.service'

interface GalleryManifest {
  images: ResponsiveImage[]
}

export class StaticManifestGalleryDataService implements IGalleryDataService {
  private cache: ResponsiveImage[] | null = null
  private loadingPromise: Promise<ResponsiveImage[]> | null = null

  constructor(private readonly manifestUrl: string) {}

  async getImages(): Promise<ResponsiveImage[]> {
    if (this.cache) return this.cache
    if (this.loadingPromise) return this.loadingPromise

    this.loadingPromise = this.fetchImages()

    try {
      this.cache = await this.loadingPromise
      return this.cache
    } finally {
      this.loadingPromise = null
    }
  }

  private async fetchImages(): Promise<ResponsiveImage[]> {
    const response = await fetch(this.manifestUrl)

    if (!response.ok) {
      throw new Error(`Failed to load gallery data: ${response.status} ${response.statusText}`)
    }

    const data: GalleryManifest = await response.json()

    if (!data.images || !Array.isArray(data.images)) {
      throw new Error('Invalid gallery manifest: missing or invalid images array')
    }

    const valid = data.images.filter(img => this.isValidImage(img))

    if (valid.length === 0) {
      throw new Error('No valid images found in gallery manifest')
    }

    return valid
  }

  private isValidImage(image: any): image is ResponsiveImage {
    if (!image || typeof image !== 'object') return false
    if (!image.id || typeof image.id !== 'string' || !image.id.trim()) return false
    if (!image.alt || typeof image.alt !== 'string' || !image.alt.trim()) return false
    if (typeof image.aspectRatio !== 'number' || image.aspectRatio <= 0) return false
    if (!Array.isArray(image.sources) || image.sources.length === 0) return false

    if (image.metadata !== undefined) {
      if (typeof image.metadata !== 'object') return false
      if (typeof image.metadata.originalWidth !== 'number') return false
      if (typeof image.metadata.originalHeight !== 'number') return false
      if (typeof image.metadata.fileSize !== 'number') return false
    }

    return image.sources.some((source: any) => {
      if (!source || typeof source !== 'object') return false
      if (source.format && !['webp', 'jpeg', 'avif'].includes(source.format)) return false
      if (!Array.isArray(source.sizes) || source.sizes.length === 0) return false
      return source.sizes.some((size: any) =>
        size &&
        typeof size.width === 'number' && size.width > 0 &&
        typeof size.height === 'number' && size.height > 0 &&
        typeof size.url === 'string' && size.url.trim()
      )
    })
  }
}
