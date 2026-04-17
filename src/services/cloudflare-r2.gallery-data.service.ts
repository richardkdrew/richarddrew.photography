import type { ResponsiveImage } from '../components/gallery/gallery.types'

export class CloudflareR2GalleryDataService {
  async getImages(): Promise<ResponsiveImage[]> {
    throw new Error('CloudflareR2GalleryDataService: not implemented')
  }
}
