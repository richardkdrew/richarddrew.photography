/**
 * Image Viewer Test Utilities
 * Shared setup and utilities for image viewer tests
 */

import type { ImageData } from '../../src/components/image-viewer/image-viewer.types'

/**
 * Mock images for testing
 */
export const mockImages: ImageData[] = [
  { id: 'img-1', src: '/images/1.jpg', srcset: '', alt: 'Image 1', width: 800, height: 600, index: 0 },
  { id: 'img-2', src: '/images/2.jpg', srcset: '', alt: 'Image 2', width: 600, height: 800, index: 1 },
  { id: 'img-3', src: '/images/3.jpg', srcset: '', alt: 'Image 3', width: 800, height: 600, index: 2 }
]

/**
 * Setup image viewer for testing
 * Creates viewer element, waits for initialization, sets images and enables
 */
export async function setupViewer(): Promise<any> {
  const viewer = document.createElement('image-viewer')
  document.body.appendChild(viewer)

  // Wait for connectedCallback to complete
  let attempts = 0
  while (!viewer.querySelector('[data-image]') && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 10))
    attempts++
  }

  // Set images data
  viewer.setImages(mockImages)
  viewer.setEnabled(true)

  return viewer
}

/**
 * Cleanup viewer from DOM
 */
export function cleanupViewer(viewer: any): void {
  if (viewer && viewer.parentNode) {
    viewer.parentNode.removeChild(viewer)
  }
}
