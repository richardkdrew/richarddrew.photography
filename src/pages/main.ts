/**
 * Main Page - Photography Portfolio
 * Sophisticated masonry gallery with design system
 */

// Import design system, components, and simplified gallery
import '../styles/design-system.css'
import '../components/header/header.css'
import '../components/header/header'
import '../components/gallery/gallery.css'
import '../components/gallery/gallery'
import '../components/image-viewer/image-viewer'

console.log('📸 Portfolio: Loading...')

document.addEventListener('DOMContentLoaded', () => {
  console.log('📸 Portfolio: DOM ready')

  // Add loaded class for progressive enhancement
  document.documentElement.classList.add('portfolio-loaded')
})

console.log('📸 Portfolio: Initialized')