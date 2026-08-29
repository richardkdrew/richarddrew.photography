import type { IGalleryDataService } from './gallery-data.types'
import type { ResponsiveImage, ResponsiveImageSource, ImageSize, ImageMetadata } from '../components/gallery/gallery.types'

interface R2ManifestDimensions {
  width: number
  height: number
}

interface R2ManifestImage {
  id: string
  filename: string
  path: string
  gallery: string
  alt: string
  date_taken?: string
  uploaded: string
  dimensions: R2ManifestDimensions
}

interface R2Manifest {
  version: string
  generated: string
  base_url: string
  galleries: Record<string, { title: string; description: string; created: string }>
  images: Record<string, R2ManifestImage>
}

const BREAKPOINTS: { width: number; quality: number }[] = [
  { width: 400, quality: 85 },
  { width: 600, quality: 85 },
  { width: 800, quality: 85 },
  { width: 1000, quality: 85 },
  { width: 1200, quality: 85 },
  { width: 1600, quality: 90 },
]

export class CloudflareR2GalleryDataService implements IGalleryDataService {
  constructor(private readonly manifestUrl: string) {}

  async getImages(): Promise<ResponsiveImage[]> {
    const response = await fetch(this.manifestUrl)
    if (!response.ok) {
      throw new Error(`Failed to load R2 manifest: ${response.status} ${response.statusText}`)
    }
    const manifest = await response.json() as R2Manifest
    if (!manifest.images || typeof manifest.images !== 'object') {
      throw new Error('Invalid R2 manifest: missing images field')
    }
    return Object.values(manifest.images).map(image =>
      this._toResponsiveImage(image, manifest.base_url)
    )
  }

  private _toResponsiveImage(image: R2ManifestImage, baseUrl: string): ResponsiveImage {
    const aspectRatio = image.dimensions.width / image.dimensions.height

    const sizes: ImageSize[] = BREAKPOINTS.map(bp => ({
      width: bp.width,
      height: Math.round(bp.width / aspectRatio),
      url: `${baseUrl}/cdn-cgi/image/width=${bp.width},format=webp,quality=${bp.quality}/${image.path}`,
    }))

    const source: ResponsiveImageSource = { format: 'webp', sizes }

    const metadata: ImageMetadata = {
      originalWidth: image.dimensions.width,
      originalHeight: image.dimensions.height,
      fileSize: 0, // originals are stored without size info; not required by the UI
      ...(image.date_taken !== undefined && { dateTaken: image.date_taken }),
    }

    return {
      id: image.id,
      alt: image.alt,
      aspectRatio,
      sources: [source],
      metadata,
    }
  }
}
