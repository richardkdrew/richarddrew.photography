import type { ResponsiveImage } from '../components/gallery/gallery.types'
import type { IGalleryDataService } from './gallery-data.service'

export class CloudflareR2GalleryDataService implements IGalleryDataService {
  async getImages(): Promise<ResponsiveImage[]> {
    throw new Error('CloudflareR2GalleryDataService: not implemented')
  }
}
