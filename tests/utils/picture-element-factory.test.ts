/**
 * Unit Tests: PictureElementFactory
 * Tests for the shared picture element factory utility
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PictureElementFactory } from '../../src/utils/picture-element-factory'
import { ResponsiveImage } from '../../src/components/gallery/gallery.types'
import { IMAGE_WIDTHS } from '../../src/utils/responsive-picture'

describe('PictureElementFactory', () => {
  let mockImage: ResponsiveImage

  beforeEach(() => {
    // Use actual IMAGE_WIDTHS for realistic testing
    mockImage = {
      id: 'test-image-1',
      alt: 'Test image description',
      aspectRatio: 1.5,
      sources: [
        {
          format: 'webp',
          sizes: IMAGE_WIDTHS.map(width => ({
            width,
            height: Math.round(width / 1.5),
            url: `test-${width}.webp`
          }))
        },
        {
          format: 'jpeg',
          sizes: IMAGE_WIDTHS.map(width => ({
            width,
            height: Math.round(width / 1.5),
            url: `test-${width}.jpg`
          }))
        }
      ],
      metadata: {
        originalWidth: 1600,
        originalHeight: 1067,
        fileSize: 245760
      }
    }
  })

  describe('create method', () => {
    it('should create a valid picture element with sources', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery')
      
      // Verify structure
      expect(picture.tagName.toLowerCase()).toBe('picture')
      expect(picture.querySelectorAll('source').length).toBe(2)
      expect(picture.querySelector('img')).toBeTruthy()
      
      const img = picture.querySelector('img')!
      expect(img.alt).toBe('Test image description')
      expect(img.dataset.id).toBe('test-image-1')
    })

    it('should handle lazy loading correctly', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery', { lazyLoad: true })
      
      // Verify lazy loading attributes
      const img = picture.querySelector('img')!
      expect(img.dataset.src).toBeTruthy()
      expect(img.classList.contains('lazy')).toBe(true)
      
      const sources = picture.querySelectorAll('source')
      sources.forEach(source => {
        expect((source as HTMLSourceElement).dataset.srcset).toBeTruthy()
        expect((source as HTMLSourceElement).srcset).toBeFalsy()
      })
    })

    it('should apply different configurations for gallery vs viewer context', () => {
      const galleryPicture = PictureElementFactory.create(mockImage, 'gallery')
      const viewerPicture = PictureElementFactory.create(mockImage, 'viewer')
      
      // Verify context-specific attributes
      const gallerySource = galleryPicture.querySelector('source')!
      const viewerSource = viewerPicture.querySelector('source')!
      
      expect(gallerySource.sizes).not.toBe(viewerSource.sizes)
    })

    it('should set high priority for important images', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery', { 
        highPriority: true 
      })
      
      const img = picture.querySelector('img')!
      expect(img.fetchPriority).toBe('high')
    })

    it('should include original index in data attributes', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery', { 
        originalIndex: 5 
      })
      
      const img = picture.querySelector('img')!
      expect(img.dataset.index).toBe('5')
    })

    it('should handle images with only JPEG sources', () => {
      const jpegOnlyImage: ResponsiveImage = {
        ...mockImage,
        sources: [
          {
            format: 'jpeg',
            sizes: [
              { width: 400, height: 267, url: 'test-400.jpg' }
            ]
          }
        ]
      }

      const picture = PictureElementFactory.create(jpegOnlyImage, 'gallery')
      
      expect(picture.querySelectorAll('source').length).toBe(1)
      expect(picture.querySelector('source')!.type).toBe('image/jpeg')
    })

    it('should set native loading attributes correctly', () => {
      // Test eager loading for high priority images
      const eagerPicture = PictureElementFactory.create(mockImage, 'gallery', { 
        originalIndex: 2,
        highPriority: true 
      })
      
      const eagerImg = eagerPicture.querySelector('img')!
      expect(eagerImg.loading).toBe('eager')

      // Test lazy loading for lower priority images
      const lazyPicture = PictureElementFactory.create(mockImage, 'gallery', { 
        originalIndex: 10 
      })
      
      const lazyImg = lazyPicture.querySelector('img')!
      expect(lazyImg.loading).toBe('lazy')
    })
  })

  describe('createHTML method', () => {
    it('should generate valid HTML string for picture element', () => {
      const html = PictureElementFactory.createHTML(mockImage, 'gallery')
      
      // Verify HTML structure
      expect(html).toContain('<picture>')
      expect(html).toContain('<source')
      expect(html).toContain('<img')
      expect(html).toContain('alt="Test image description"')
      expect(html).toContain('data-id="test-image-1"')
    })

    it('should include lazy loading attributes in HTML', () => {
      const html = PictureElementFactory.createHTML(mockImage, 'gallery', { 
        lazyLoad: true 
      })
      
      expect(html).toContain('data-src=')
      expect(html).toContain('class="lazy"')
      expect(html).toContain('data-srcset=')
    })

    it('should include high priority attributes in HTML', () => {
      const html = PictureElementFactory.createHTML(mockImage, 'gallery', { 
        highPriority: true 
      })
      
      expect(html).toContain('fetchpriority="high"')
    })
  })

  describe('srcset validation', () => {
    it('should include all IMAGE_WIDTHS in srcset attribute', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery')
      const sources = picture.querySelectorAll('source')

      sources.forEach(source => {
        const srcset = source.srcset

        // Verify all widths are present in srcset
        IMAGE_WIDTHS.forEach(width => {
          expect(srcset).toContain(`${width}w`)
        })
      })
    })

    it('should generate srcset with all 6 sizes (400, 600, 800, 1000, 1200, 1600)', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery')
      const webpSource = picture.querySelector('source[type="image/webp"]')

      expect(webpSource).toBeTruthy()
      const srcset = webpSource!.srcset

      // Verify specific sizes
      expect(srcset).toContain('test-400.webp 400w')
      expect(srcset).toContain('test-600.webp 600w')
      expect(srcset).toContain('test-800.webp 800w')
      expect(srcset).toContain('test-1000.webp 1000w')
      expect(srcset).toContain('test-1200.webp 1200w')
      expect(srcset).toContain('test-1600.webp 1600w')
    })

    it('should have srcset entries in ascending width order', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery')
      const source = picture.querySelector('source')!
      const srcset = source.srcset

      // Extract width descriptors (e.g., "400w", "600w")
      const widths = Array.from(srcset.matchAll(/(\d+)w/g))
        .map(match => parseInt(match[1]))

      // Verify ascending order
      for (let i = 1; i < widths.length; i++) {
        expect(widths[i]).toBeGreaterThan(widths[i - 1])
      }
    })

    it('should include correct number of srcset entries', () => {
      const picture = PictureElementFactory.create(mockImage, 'gallery')
      const source = picture.querySelector('source')!
      const srcset = source.srcset

      // Count srcset entries (comma-separated)
      const entries = srcset.split(',').filter(e => e.trim())

      expect(entries.length).toBe(IMAGE_WIDTHS.length)
    })
  })

  describe('error handling', () => {
    it('should handle images with no sources gracefully', () => {
      const emptyImage: ResponsiveImage = {
        ...mockImage,
        sources: []
      }

      const picture = PictureElementFactory.create(emptyImage, 'gallery')
      
      // Should still create a picture element with img
      expect(picture.tagName.toLowerCase()).toBe('picture')
      expect(picture.querySelector('img')).toBeTruthy()
      expect(picture.querySelectorAll('source').length).toBe(0)
    })

    it('should handle missing image properties gracefully', () => {
      const incompleteImage = {
        ...mockImage,
        alt: '',
        sources: [
          {
            format: 'jpeg' as const,
            sizes: [
              { width: 400, height: 267, url: 'test.jpg' }
            ]
          }
        ]
      }

      const picture = PictureElementFactory.create(incompleteImage, 'gallery')
      const img = picture.querySelector('img')!
      
      // Should handle empty alt text
      expect(img.alt).toBe('')
      expect(img.dataset.id).toBe('test-image-1')
    })
  })
})
