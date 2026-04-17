/**
 * Gallery Test Utilities
 * Helper types and functions for gallery tests
 */

import { vi } from 'vitest'
import { ResponsiveImage } from '../../src/components/gallery/gallery.types'
import type { MasonryGallery } from '../../src/components/gallery/gallery'
import type { IGalleryDataService } from '../../src/services/gallery-data.service'

// ============================================================================
// Test-Only Types
// ============================================================================

/**
 * Simplified image type for tests
 * Used when full ResponsiveImage structure is not needed
 */
export interface SimpleImage {
  id: string
  url: string
  alt: string
  aspectRatio: number
  caption?: string
  metadata?: {
    width: number
    height: number
    fileSize?: number
    format?: string
    timestamp?: Date
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates that an object is a valid SimpleImage
 * @param image Object to validate
 * @returns True if image is valid
 */
export function isValidSimpleImage(image: any): image is SimpleImage {
  return (
    typeof image === 'object' &&
    typeof image.id === 'string' &&
    image.id.trim().length > 0 &&
    typeof image.url === 'string' &&
    image.url.trim().length > 0 &&
    typeof image.alt === 'string' &&
    typeof image.aspectRatio === 'number' &&
    image.aspectRatio > 0
  )
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Debounce function for testing resize and other events
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

/**
 * Creates a mock ResponsiveImage for testing
 * @param overrides Optional properties to override defaults
 * @returns Mock ResponsiveImage
 */
export function createMockResponsiveImage(overrides: Partial<ResponsiveImage> = {}): ResponsiveImage {
  return {
    id: 'test-image-1',
    alt: 'Test image description',
    aspectRatio: 1.5,
    sources: [
      {
        format: 'webp',
        sizes: [
          { width: 400, height: 267, url: 'test-400.webp' },
          { width: 800, height: 533, url: 'test-800.webp' }
        ]
      },
      {
        format: 'jpeg',
        sizes: [
          { width: 400, height: 267, url: 'test-400.jpg' },
          { width: 800, height: 533, url: 'test-800.jpg' }
        ]
      }
    ],
    metadata: {
      originalWidth: 1600,
      originalHeight: 1067,
      fileSize: 245760
    },
    ...overrides
  }
}

/**
 * Creates a mock SimpleImage for testing
 * @param overrides Optional properties to override defaults
 * @returns Mock SimpleImage
 */
export function createMockSimpleImage(overrides: Partial<SimpleImage> = {}): SimpleImage {
  return {
    id: 'test-simple-1',
    url: 'test-image.jpg',
    alt: 'Test simple image',
    aspectRatio: 1.5,
    metadata: {
      width: 800,
      height: 533,
      fileSize: 123456,
      format: 'jpeg'
    },
    ...overrides
  }
}

/**
 * Waits for a specified amount of time
 * Useful for testing async operations
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Waits for an element to appear in the DOM
 * @param selector CSS selector to wait for
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves with the element or rejects on timeout
 */
export function waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

export function createMockDataService(images = [createMockResponsiveImage()]): IGalleryDataService {
  return {
    getImages: vi.fn().mockResolvedValue(images)
  }
}

export async function setupGalleryWithMockService(
  images = [createMockResponsiveImage()],
  container: HTMLElement = document.body
): Promise<MasonryGallery> {
  const gallery = document.createElement('masonry-gallery') as MasonryGallery
  container.appendChild(gallery)
  ;(gallery as any).dataService = createMockDataService(images)
  await new Promise(resolve => setTimeout(resolve, 50))
  return gallery
}
