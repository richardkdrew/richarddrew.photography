// src/components/uniform-gallery/uniform-gallery.types.ts

import type { GalleryImageData } from '../gallery/gallery.types'

export interface IUniformGallery extends HTMLElement {
  getImages(): GalleryImageData[]
}
