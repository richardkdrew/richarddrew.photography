/**
 * Unit Tests: Responsive Picture Utility
 * Tests for responsive image configuration and sizes calculation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getResponsiveSizes,
  IMAGE_WIDTHS,
  IMAGE_FORMATS,
  type ImageContext
} from '../../src/utils/responsive-picture'

describe('Responsive Picture Utility', () => {
  describe('IMAGE_WIDTHS constant', () => {
    it('MUST include all 6 required sizes in ascending order', () => {
      expect(IMAGE_WIDTHS).toEqual([400, 600, 800, 1000, 1200, 1600])
    })

    it('MUST have sizes in ascending order', () => {
      for (let i = 1; i < IMAGE_WIDTHS.length; i++) {
        expect(IMAGE_WIDTHS[i]).toBeGreaterThan(IMAGE_WIDTHS[i - 1])
      }
    })

    it('MUST have all sizes as positive integers', () => {
      IMAGE_WIDTHS.forEach(width => {
        expect(Number.isInteger(width)).toBe(true)
        expect(width).toBeGreaterThan(0)
      })
    })

    it('MUST cover critical breakpoints for responsive images', () => {
      // Mobile single column (1x DPR): ~400px → 400w
      expect(IMAGE_WIDTHS).toContain(400)

      // Mobile/tablet multi-column (1x DPR): ~600px → 600w
      expect(IMAGE_WIDTHS).toContain(600)

      // Multi-column layouts (3x DPR): ~800px → 800w
      expect(IMAGE_WIDTHS).toContain(800)

      // Landscape tablets (2-3x DPR): ~1000px → 1000w
      expect(IMAGE_WIDTHS).toContain(1000)

      // Portrait phones (3x DPR): ~1200px → 1200w
      expect(IMAGE_WIDTHS).toContain(1200)

      // Large desktop + high DPR: ~1600px → 1600w
      expect(IMAGE_WIDTHS).toContain(1600)
    })

    it('MUST provide efficient coverage without redundancy', () => {
      // Check that sizes are spaced efficiently (no wasteful overlap)
      for (let i = 1; i < IMAGE_WIDTHS.length; i++) {
        const ratio = IMAGE_WIDTHS[i] / IMAGE_WIDTHS[i - 1]

        // Ratios should be between 1.2 and 2.0 (efficient coverage)
        expect(ratio).toBeGreaterThanOrEqual(1.2)
        expect(ratio).toBeLessThanOrEqual(2.0)
      }
    })
  })

  describe('IMAGE_FORMATS constant', () => {
    it('MUST include webp and jpeg formats', () => {
      expect(IMAGE_FORMATS).toContain('webp')
      expect(IMAGE_FORMATS).toContain('jpeg')
    })

    it('MUST have exactly 2 formats', () => {
      expect(IMAGE_FORMATS.length).toBe(2)
    })
  })

  describe('getResponsiveSizes() - CSS custom properties', () => {
    let originalComputedStyle: typeof window.getComputedStyle

    beforeEach(() => {
      originalComputedStyle = window.getComputedStyle
    })

    afterEach(() => {
      window.getComputedStyle = originalComputedStyle
    })

    it('MUST return CSS custom property value when available', () => {
      // Mock CSS custom property
      window.getComputedStyle = (() => ({
        getPropertyValue: (prop: string) => {
          if (prop === '--sizes-gallery') {
            return '(max-width: 32rem) 88vw, (max-width: 48rem) 44vw'
          }
          return ''
        }
      })) as any

      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toBe('(max-width: 32rem) 88vw, (max-width: 48rem) 44vw')
    })

    it('MUST remove quotes from CSS custom property values', () => {
      window.getComputedStyle = (() => ({
        getPropertyValue: (prop: string) => {
          if (prop === '--sizes-gallery') {
            return '"(max-width: 32rem) 88vw"'
          }
          return ''
        }
      })) as any

      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toBe('(max-width: 32rem) 88vw')
    })

    it('MUST fall back to hardcoded values when CSS unavailable', () => {
      window.getComputedStyle = (() => ({
        getPropertyValue: () => ''
      })) as any

      const sizes = getResponsiveSizes('gallery')

      // Should return fallback value
      expect(sizes).toContain('88vw')
      expect(sizes).toContain('44vw')
    })
  })

  describe('getResponsiveSizes() - Fallback values', () => {
    it('MUST provide correct gallery sizes fallback', () => {
      const sizes = getResponsiveSizes('gallery')

      // Should match design system breakpoints
      expect(sizes).toContain('(max-width: 32rem) 88vw')  // 1 column, 88% container
      expect(sizes).toContain('(max-width: 48rem) 44vw')  // 2 columns, ~44% each
      expect(sizes).toContain('(max-width: 56rem) 29.3vw') // 3 columns
      expect(sizes).toContain('(max-width: 80rem) 23vw')   // 4 columns
      expect(sizes).toContain('18.4vw')                     // 5 columns (default)
    })

    it('MUST provide correct viewer sizes fallback', () => {
      const sizes = getResponsiveSizes('viewer')

      // Viewer should always use 100vw (full viewport)
      expect(sizes).toContain('100vw')
      expect(sizes).not.toContain('88vw')
      expect(sizes).not.toContain('44vw')
    })

    it('MUST provide correct about page sizes fallback', () => {
      const sizes = getResponsiveSizes('about')

      // About page has different proportions
      expect(sizes).toContain('(max-width: 32rem) 88vw')
      expect(sizes).toContain('(max-width: 48rem) 44vw')
      expect(sizes).toContain('(max-width: 56rem) 35.2vw')
      expect(sizes).toContain('27.6vw')
    })
  })

  describe('Sizes attribute calculations', () => {
    it('MUST account for container width in gallery sizes', () => {
      const sizes = getResponsiveSizes('gallery')

      // Extract vw values
      const vwValues = sizes.match(/(\d+\.?\d*)vw/g)?.map(v => parseFloat(v)) || []

      // 1 column: 88vw (88% container)
      expect(vwValues[0]).toBe(88)

      // 2 columns: ~44vw (88% / 2 columns)
      expect(vwValues[1]).toBeCloseTo(44, 1)

      // 3 columns: ~29.3vw (88% / 3 columns, accounting for gaps)
      expect(vwValues[2]).toBeCloseTo(29.3, 1)

      // All values should be <= 100vw
      vwValues.forEach(vw => {
        expect(vw).toBeLessThanOrEqual(100)
        expect(vw).toBeGreaterThan(0)
      })
    })

    it('MUST use correct breakpoints matching gallery CSS', () => {
      const sizes = getResponsiveSizes('gallery')

      // Should match gallery.css breakpoints exactly
      expect(sizes).toContain('max-width: 32rem')  // Mobile cutoff
      expect(sizes).toContain('max-width: 48rem')  // Tablet cutoff
      expect(sizes).toContain('max-width: 56rem')  // Large tablet cutoff
      expect(sizes).toContain('max-width: 80rem')  // Desktop cutoff
    })
  })

  describe('Type safety', () => {
    it('MUST accept valid image contexts', () => {
      const validContexts: ImageContext[] = ['gallery', 'viewer', 'about']

      validContexts.forEach(context => {
        expect(() => getResponsiveSizes(context)).not.toThrow()
      })
    })

    it('MUST return string for all contexts', () => {
      expect(typeof getResponsiveSizes('gallery')).toBe('string')
      expect(typeof getResponsiveSizes('viewer')).toBe('string')
      expect(typeof getResponsiveSizes('about')).toBe('string')
    })
  })

  describe('Device coverage validation', () => {
    it('MUST handle iPhone 16 Pro portrait (402px, 3x DPR)', () => {
      // Portrait: 1 column, 88vw
      // 402px × 0.88 = 354px CSS pixels
      // 354px × 3 DPR = 1062px physical pixels needed

      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toContain('88vw') // Will select 1200w from srcset

      // Verify 1200w exists in IMAGE_WIDTHS
      expect(IMAGE_WIDTHS).toContain(1200)
    })

    it('MUST handle iPhone 16 Pro landscape (874px, 3x DPR)', () => {
      // Landscape: 3 columns, 29.3vw
      // 874px × 0.293 = 256px CSS pixels
      // 256px × 3 DPR = 768px physical pixels needed

      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toContain('29.3vw') // Will select 800w from srcset

      // Verify 800w and 1000w both exist
      expect(IMAGE_WIDTHS).toContain(800)
      expect(IMAGE_WIDTHS).toContain(1000)
    })

    it('MUST handle large desktop 2x DPR (1920px viewport)', () => {
      // 5 columns, 18.4vw
      // 1920px × 0.184 = 353px CSS pixels
      // 353px × 2 DPR = 706px physical pixels needed

      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toContain('18.4vw') // Will select 800w from srcset

      // Verify adequate coverage exists
      expect(IMAGE_WIDTHS).toContain(800)
    })
  })

  describe('SSR compatibility', () => {
    it('MUST work in server-side rendering (no window object)', () => {
      // Simulate SSR environment
      const originalWindow = global.window
      const originalDocument = global.document

      // @ts-ignore - Simulating SSR
      delete global.window
      // @ts-ignore
      delete global.document

      // Should fall back to hardcoded values
      const sizes = getResponsiveSizes('gallery')
      expect(sizes).toBeTruthy()
      expect(sizes).toContain('88vw')

      // Restore
      global.window = originalWindow
      global.document = originalDocument
    })
  })
})
