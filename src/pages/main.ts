/**
 * Main Page - Photography Portfolio
 * Sophisticated masonry gallery with design system
 */

import '../styles/fonts.css'
import '../styles/design-system.css'
import '../components/header/header.css'
import '../components/header/header'
import '../components/image-viewer/image-viewer'
import '../components/uniform-gallery/uniform-gallery.css'
import '../components/uniform-gallery/uniform-gallery'
import '../components/footer/footer'

console.log('📸 Portfolio: Loading...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('📸 Portfolio: DOM ready')
  document.documentElement.classList.add('portfolio-loaded')
})

console.log('📸 Portfolio: Initialized')