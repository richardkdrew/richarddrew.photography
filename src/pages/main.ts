/**
 * Main Page - Photography Portfolio
 * Sophisticated masonry gallery with design system
 */

import '../styles/fonts.css'
import '../styles/design-system.css'
import '../components/header/header.css'
import '../components/header/header'
import '../components/gallery/gallery.css'
import '../components/gallery/gallery'
import '../components/image-viewer/image-viewer'
import '../components/uniform-gallery/uniform-gallery.css'
import '../components/uniform-gallery/uniform-gallery'
import { createGalleryDataService } from '../services/gallery-data.service'
import type { MasonryGallery } from '../components/gallery/gallery'

console.log('📸 Portfolio: Loading...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('📸 Portfolio: DOM ready')
  document.documentElement.classList.add('portfolio-loaded')
})

// Inject gallery data service before setTimeout(0) fallback fires in connectedCallback
const gallery = document.querySelector('masonry-gallery') as MasonryGallery | null
if (gallery) {
  const manifestUrl = gallery.getAttribute('data-manifest-url') || '/gallery-data.json'
  gallery.dataService = createGalleryDataService({ manifestUrl })
}

console.log('📸 Portfolio: Initialized')