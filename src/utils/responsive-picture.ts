/**
 * Responsive Picture Utility
 * Centralized configuration for responsive image sizes across all components
 * Ensures consistent breakpoints and sizing strategy
 */

/**
 * Context types for different image use cases
 */
export type ImageContext = 'gallery' | 'viewer' | 'about'

/**
 * Fallback sizes presets (SSR, edge cases)
 * Used when CSS custom properties are not available
 *
 * 5-Breakpoint System: 32rem, 48rem, 56rem, 80rem
 * Accounts for page container width: 88% mobile/tablet, 92% desktop
 * - < 32rem (< 512px): Small mobile (1 column)
 * - 32-48rem (512-768px): Large mobile/landscape (2 columns)
 * - 48-56rem (768-896px): Tablet (3 columns)
 * - 56-80rem (896-1280px): Large tablet/desktop (4 columns)
 * - ≥ 80rem (≥ 1280px): Large desktop (5 columns)
 */
const FALLBACK_SIZES: Record<ImageContext, string> = {
  gallery: '(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, (max-width: 56rem) 29.3vw, (max-width: 80rem) 23vw, 18.4vw',
  viewer: '(max-width: 32rem) 100vw, (max-width: 48rem) 100vw, (max-width: 56rem) 100vw, (max-width: 80rem) 100vw, 100vw',
  about: '(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, (max-width: 56rem) 35.2vw, (max-width: 80rem) 32.2vw, 27.6vw'
}

/**
 * Get responsive sizes attribute from CSS custom properties
 * Reads from design-system.css --sizes-{context} variables
 * Falls back to hardcoded values if CSS is unavailable
 *
 * @param context - The image context (gallery, viewer, or about)
 * @returns The sizes attribute string for the picture element
 *
 * @example
 * ```typescript
 * const sizes = getResponsiveSizes('gallery')
 * sourceEl.sizes = sizes
 * ```
 */
export function getResponsiveSizes(context: ImageContext): string {
  // Try to read from CSS custom properties
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const cssValue = getComputedStyle(document.documentElement)
        .getPropertyValue(`--sizes-${context}`)
        .trim()
        .replace(/^["']|["']$/g, '') // Remove quotes if present

      if (cssValue) {
        return cssValue
      }
    } catch (error) {
      console.warn(`Failed to read --sizes-${context} from CSS, using fallback`, error)
    }
  }

  // Fallback to hardcoded values (SSR, edge cases)
  return FALLBACK_SIZES[context]
}

/**
 * Available image widths for srcset
 * Used across all components for consistency
 * Covers all breakpoints and pixel densities (1x, 2x, 3x)
 *
 * Size selection rationale:
 * - 400w: 1x DPR multi-column layouts
 * - 600w: 2x DPR multi-column, 1x DPR single column
 * - 800w: 3x DPR multi-column (3-5 columns)
 * - 1000w: 2-3x DPR landscape tablets/mobile (2 columns)
 * - 1200w: 3x DPR portrait phones (1 column)
 * - 1600w: Large desktop 2x+ DPR, high-res displays
 */
export const IMAGE_WIDTHS = [400, 600, 800, 1000, 1200, 1600] as const

/**
 * Image formats supported
 */
export const IMAGE_FORMATS = ['webp', 'jpeg'] as const

export type ImageWidth = typeof IMAGE_WIDTHS[number]
export type ImageFormat = typeof IMAGE_FORMATS[number]
