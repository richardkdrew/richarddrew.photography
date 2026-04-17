import type { ResponsiveImage } from '../components/gallery/gallery.types'

export interface IGalleryDataService {
  getImages(): Promise<ResponsiveImage[]>
}
