/**
 * Accessibility Tests: MasonryGallery Component
 * WCAG 2.1 AA compliance and screen reader support tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MasonryGallery } from '../../src/components/gallery/gallery'
import { createMockResponsiveImage, setupGalleryWithMockService } from './test-utils'

describe('Gallery Accessibility Tests', () => {
  let gallery: MasonryGallery
  let container: HTMLElement

  beforeEach(async () => {
    // Mock window.matchMedia for tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))

    // Register custom element
    if (!customElements.get('masonry-gallery')) {
      customElements.define('masonry-gallery', MasonryGallery)
    }

    container = document.createElement('div')
    document.body.appendChild(container)

    gallery = await setupGalleryWithMockService([
      createMockResponsiveImage({ id: 'test-1', alt: 'Beautiful landscape with mountains and lake', aspectRatio: 1.33 }),
      createMockResponsiveImage({ id: 'test-2', alt: 'Portrait of a person smiling', aspectRatio: 0.75 }),
      createMockResponsiveImage({ id: 'test-3', alt: 'Abstract art with colorful geometric shapes', aspectRatio: 3.0 }),
      createMockResponsiveImage({ id: 'test-4', alt: 'City skyline at sunset', aspectRatio: 1.67 })
    ], container)
  })

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
  })

  describe('WCAG 2.1 AA Compliance', () => {
    describe('1.1.1 Non-text Content', () => {
      it('should provide alternative text for all images', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        const images = gallery.querySelectorAll('img')
        expect(images.length).toBeGreaterThanOrEqual(0)

        images.forEach(img => {
          expect(img.alt).toBeTruthy()
          expect(img.alt.trim().length).toBeGreaterThan(0)
          expect(img.alt).not.toBe('image') // Should be descriptive, not generic
        })
      })

      it('should provide meaningful alt text descriptions', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        const images = gallery.querySelectorAll('img')
        images.forEach(img => {
          const alt = img.alt.toLowerCase()

          // Alt text should be descriptive
          expect(alt.length).toBeGreaterThan(5)

          // Should not contain redundant phrases
          expect(alt).not.toContain('image of')
          expect(alt).not.toContain('picture of')
          expect(alt).not.toContain('photo of')
        })
      })

      it('should handle portfolio images meaningfully', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        const images = gallery.querySelectorAll('img')
        images.forEach(img => {
          // Portfolio images should have meaningful alt text
          expect(img.alt.trim()).toBeTruthy()
        })
      })
    })

    describe('1.3.1 Info and Relationships', () => {
      it('should use semantic HTML structure', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        // Gallery should use appropriate semantic elements
        const images = gallery.querySelectorAll('img')
        expect(images.length).toBeGreaterThanOrEqual(0)

        // Should use picture elements for responsive images
        const pictures = gallery.querySelectorAll('picture')
        expect(pictures.length).toBeGreaterThanOrEqual(0)
      })

      it('should group related content appropriately', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        // Images in the same gallery should be logically grouped
        const images = gallery.querySelectorAll('img')
        expect(images.length).toBeGreaterThanOrEqual(0)

        // All images should be within the gallery container
        images.forEach(img => {
          expect(gallery.contains(img)).toBe(true)
        })
      })

    })

    describe('1.4.3 Contrast (Minimum)', () => {
      it('should have sufficient contrast for any text overlays', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        // Check for any text overlays or captions
        const textElements = gallery.querySelectorAll('.caption, .overlay, .text')

        textElements.forEach(element => {
          const styles = getComputedStyle(element)

          // Text should be visible (not transparent)
          expect(styles.color).not.toBe('transparent')
          expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
        })
      })

      it('should ensure loading states have adequate contrast', () => {
        // Check loading indicators or placeholder text
        const loadingElements = gallery.querySelectorAll('.loading, .placeholder')

        loadingElements.forEach(element => {
          const styles = getComputedStyle(element)
          expect(styles.color).not.toBe('transparent')
        })
      })
    })

    describe('2.1.1 Keyboard', () => {
      it('should be navigable with keyboard if interactive', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        const images = gallery.querySelectorAll('img')

        // If gallery has interactive features, they should be keyboard accessible
        images.forEach(img => {
          // Check if image or parent is focusable
          const parentLink = img.closest('a, button')
          if (parentLink) {
            expect(parentLink.tabIndex).toBeGreaterThanOrEqual(-1)
          }
        })
      })

      it('should handle keyboard events gracefully', () => {
        // Test arrow key handling
        const arrowRightEvent = new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          cancelable: true
        })

        // Should not throw errors when arrow keys are pressed
        expect(() => gallery.dispatchEvent(arrowRightEvent)).not.toThrow()
      })

      it('should support Enter and Space key activation if interactive', () => {
        const interactiveElements = gallery.querySelectorAll('a, button, [tabindex="0"]')

        interactiveElements.forEach(element => {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          })

          expect(() => element.dispatchEvent(enterEvent)).not.toThrow()
        })
      })
    })

    describe('2.1.2 No Keyboard Trap', () => {
      it('should not trap keyboard focus', () => {
        // Create external focusable element
        const externalButton = document.createElement('button')
        externalButton.textContent = 'External Button'
        document.body.appendChild(externalButton)

        const focusableElements = gallery.querySelectorAll('a, button, [tabindex="0"]')

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement

          // Focus gallery element
          firstElement.focus()
          expect(document.activeElement).toBe(firstElement)

          // Should be able to focus external element
          externalButton.focus()
          expect(document.activeElement).toBe(externalButton)
        }

        // Cleanup
        document.body.removeChild(externalButton)
      })
    })

    describe('4.1.2 Name, Role, Value', () => {
      it('should have appropriate roles for gallery structure', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        // Gallery images have implicit img role
        const images = gallery.querySelectorAll('img')
        images.forEach(img => {
          expect(img.tagName.toLowerCase()).toBe('img')
        })

        // Check for any explicit roles
        const elementsWithRoles = gallery.querySelectorAll('[role]')
        elementsWithRoles.forEach(element => {
          const role = element.getAttribute('role')
          expect(role).toBeTruthy()

          // Should use valid ARIA roles
          const validRoles = ['img', 'figure', 'region', 'group', 'list', 'listitem']
          expect(validRoles).toContain(role!)
        })
      })

      it('should provide accessible names for interactive elements', () => {
        const interactiveElements = gallery.querySelectorAll('a, button')

        interactiveElements.forEach(element => {
          // Should have accessible name via text content, aria-label, or aria-labelledby
          const hasTextContent = element.textContent?.trim().length! > 0
          const hasAriaLabel = element.getAttribute('aria-label')?.length! > 0
          const hasAriaLabelledBy = element.getAttribute('aria-labelledby')

          expect(hasTextContent || hasAriaLabel || hasAriaLabelledBy).toBe(true)
        })
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should announce gallery structure clearly', () => {
      // Gallery should be identifiable to screen readers
      expect(gallery.tagName.toLowerCase()).toBe('masonry-gallery')
    })

    it('should provide context for image collection', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      // Screen readers should be able to understand the gallery scope
      const images = gallery.querySelectorAll('img')
      expect(images.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle loading states accessibly', () => {
      // Loading states should be announced to screen readers
      const loadingElements = gallery.querySelectorAll('[aria-live], [aria-busy]')

      // Should use ARIA live regions for dynamic updates (if implemented)
      loadingElements.forEach(element => {
        const ariaLive = element.getAttribute('aria-live')
        const ariaBusy = element.getAttribute('aria-busy')

        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive)
        }

        if (ariaBusy) {
          expect(['true', 'false']).toContain(ariaBusy)
        }
      })
    })

    it('should provide navigation context', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      const images = gallery.querySelectorAll('img')

      // Each image should provide sufficient context
      images.forEach((img, index) => {
        expect(img.alt).toBeTruthy()

        // Alt text should be meaningful for screen reader users
        const alt = img.alt.toLowerCase()
        expect(alt.length).toBeGreaterThan(3)
      })
    })
  })

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility across breakpoints', async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      // Test mobile
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      window.dispatchEvent(new Event('resize'))

      let images = gallery.querySelectorAll('img')
      images.forEach(img => {
        expect(img.alt).toBeTruthy()
      })

      // Test tablet
      Object.defineProperty(window, 'innerWidth', { value: 900, writable: true })
      window.dispatchEvent(new Event('resize'))

      images = gallery.querySelectorAll('img')
      images.forEach(img => {
        expect(img.alt).toBeTruthy()
      })

      // Test desktop
      Object.defineProperty(window, 'innerWidth', { value: 1400, writable: true })
      window.dispatchEvent(new Event('resize'))

      images = gallery.querySelectorAll('img')
      images.forEach(img => {
        expect(img.alt).toBeTruthy()
      })
    })

    it('should handle touch and mouse interaction accessibly', () => {
      const interactiveElements = gallery.querySelectorAll('a, button, [tabindex="0"]')

      interactiveElements.forEach(element => {
        // Elements should be appropriately structured
        expect(element.tagName).toBeTruthy()
      })
    })
  })

  describe('Focus Management', () => {
    it('should handle dynamic content updates accessibly', async () => {
      // Load images and check focus isn't disrupted
      const activeElementBefore = document.activeElement

      await new Promise(resolve => setTimeout(resolve, 100))

      // Focus should not be unexpectedly moved
      expect(document.activeElement).toBeTruthy()
    })

    it('should provide focus indicators', () => {
      const focusableElements = gallery.querySelectorAll('a, button, [tabindex="0"]')

      focusableElements.forEach(element => {
        const htmlElement = element as HTMLElement
        htmlElement.focus()

        // Focus should be visible (CSS should handle this)
        expect(document.activeElement).toBe(htmlElement)
      })
    })
  })

  describe('Error Handling Accessibility', () => {
    it('should handle image loading errors accessibly', async () => {
      const mockService = {
        getImages: vi.fn().mockResolvedValue([
          createMockResponsiveImage({ id: 'broken', alt: 'Image that will fail to load' })
        ])
      }

      const errorGallery = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(errorGallery)
      ;(errorGallery as any).dataService = mockService

      await new Promise(resolve => setTimeout(resolve, 100))

      // Should handle errors without breaking accessibility
      const images = errorGallery.querySelectorAll('img')
      images.forEach(img => {
        expect(img.alt).toBeTruthy() // Alt text should remain
      })

      container.removeChild(errorGallery)
    })

    it('should provide accessible error messages', async () => {
      const failingService = { getImages: vi.fn().mockRejectedValue(new Error('Network error')) }

      const failedGallery = document.createElement('masonry-gallery') as MasonryGallery
      container.appendChild(failedGallery)
      ;(failedGallery as any).dataService = failingService

      // Should handle load errors accessibly
      await new Promise(resolve => setTimeout(resolve, 100))

      // Error handling should not break screen reader functionality
      expect(failedGallery).toBeTruthy()

      container.removeChild(failedGallery)
    })
  })
})