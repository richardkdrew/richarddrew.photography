/**
 * Gallery Component Types
 * Types for the masonry gallery component and responsive images
 */

// ============================================================================
// Component Interface
// ============================================================================

export interface IMasonryGallery extends HTMLElement {
  // Public methods
  getColumnCount(): number
  getImages(): GalleryImageData[]
}

// ============================================================================
// Core Responsive Image Types
// ============================================================================

export interface ResponsiveImage {
  id: string
  alt: string
  aspectRatio: number
  sources: ResponsiveImageSource[]
  lqip?: LQIPOptions
  metadata: ImageMetadata
}

export interface LQIPOptions {
  type: 'blur' | 'pixelated' | 'solid-color' | 'svg-trace'
  data: string
  dominantColor?: string
}

export interface ResponsiveImageSource {
  format: 'webp' | 'jpeg' | 'avif'  // Added AVIF for future support
  sizes: ImageSize[]
}

// Simplified ImageSize interface (removed unnecessary nesting)
export interface ImageSize {
  width: number
  height: number
  url: string
  density?: 1 | 2 | 3
}

export interface ImageMetadata {
  originalWidth: number
  originalHeight: number
  fileSize: number
  caption?: string
  tags?: string[]
  dateTaken?: string
  format?: string
  timestamp?: Date
}

// ============================================================================
// Gallery State and Configuration
// ============================================================================

export interface GalleryState {
  isInitialized: boolean
  columnCount: number
  images: ResponsiveImage[]
  columnHeights: number[]
  viewerEnabled: boolean
}

export interface GalleryConfig {
  columnCounts: ColumnCounts
  padding: PaddingConfig
  performance: PerformanceConfig
}

export interface ColumnCounts {
  mobile: number
  tablet: number
  largeTablet: number
  desktop: number
  largeDesktop: number
  max: number
}

export interface PaddingConfig {
  small: number  // rem
  large: number  // rem
  vertical: number // rem
}

export interface PerformanceConfig {
  maxInitializationTime: number // ms
  maxResizeTime: number // ms
  maxImageLoadTime: number // ms
  preloadCount: number
  lazyLoadThreshold: string
  memoryManagement: boolean
}

// ============================================================================
// Gallery Events
// ============================================================================

export interface GalleryEventMap {
  'gallery:initialized': CustomEvent<void>
  'gallery:image-loaded': CustomEvent<{ image: ResponsiveImage }>
  'gallery:error': CustomEvent<{ message: string }>
  'gallery:column-count-changed': CustomEvent<{ count: number }>
}

// ============================================================================
// Constants
// ============================================================================

export const SUPPORTED_FORMATS = ['avif', 'webp', 'jpeg'] as const
export const SUPPORTED_DENSITIES = [1, 2, 3] as const

export type SupportedFormat = typeof SUPPORTED_FORMATS[number]
export type SupportedDensity = typeof SUPPORTED_DENSITIES[number]

export const DEFAULT_COLUMN_COUNTS: ColumnCounts = {
  mobile: 1,
  tablet: 3,
  largeTablet: 4,
  desktop: 4,
  largeDesktop: 5,
  max: 6
}

export const DEFAULT_PADDING: PaddingConfig = {
  small: 0.5,    // 8px
  large: 1.0,    // 16px
  vertical: 0.75 // 12px
}

export const DEFAULT_COLUMN_WIDTH = {
  minimum: 6.25, // 100px
  calculation: 'equal' as const
}

export const DEFAULT_PERFORMANCE: PerformanceConfig = {
  maxInitializationTime: 100,
  maxResizeTime: 100,
  maxImageLoadTime: 200,
  preloadCount: 5,
  lazyLoadThreshold: '100px',
  memoryManagement: true
}

// ============================================================================
// Utility Functions
// ============================================================================

// ============================================================================
// Gallery Image Data (Independent of Viewer)
// ============================================================================

/**
 * Gallery-specific image data interface
 * Used for gallery operations and event communication
 */
export interface GalleryImageData {
  /** Unique identifier for the image */
  id: string
  /** Primary image source URL */
  src: string
  /** Responsive srcset for different viewport sizes */
  srcset: string
  /** WebP srcset for different viewport sizes */
  webpSrcset?: string
  /** Alt text for accessibility */
  alt: string
  /** Image width in pixels (for aspect ratio) */
  width: number
  /** Image height in pixels (for aspect ratio) */
  height: number
  /** Position in gallery (0-based index) */
  index: number
  /** Reference to the original picture element from gallery */
  pictureElement?: HTMLPictureElement
}

// ============================================================================
// Image Viewer Integration
// ============================================================================

/**
 * Interface for image viewer component (if present)
 * Allows gallery to integrate with viewer without tight coupling
 */
export interface IImageViewer extends HTMLElement {
  setImages(images: GalleryImageData[]): void
  setEnabled(enabled: boolean): void
  open(index: number): void
  getState(): { enabled: boolean }
}

// ============================================================================
// Gallery Events
// ============================================================================

/**
 * Event fired when an image is clicked
 * @event gallery:image-click
 * @type {CustomEvent}
 * @property {Object} detail - Event details
 * @property {number} detail.index - Index of clicked image
 * @property {GalleryImageData[]} detail.images - Array of all gallery images
 */

/**
 * Event fired when column count changes
 * @event gallery:columns-changed
 * @type {CustomEvent}
 * @property {Object} detail - Event details
 * @property {number} detail.columns - New column count
 */

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateAspectRatio(width: number, height: number): number {
  if (height === 0) {
    throw new Error('Height cannot be zero when calculating aspect ratio')
  }
  return width / height
}
