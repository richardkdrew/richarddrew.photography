/**
 * Contract: Responsive Image System
 * Defines interfaces for responsive image delivery and management
 */

// Core responsive image interfaces
export interface ResponsiveImage {
  id: string
  alt: string
  aspectRatio: number
  sources: ResponsiveImageSource[]
  lqip?: string
  metadata: ImageMetadata
}

export interface ResponsiveImageSource {
  format: 'webp' | 'jpeg'
  sizes: ResponsiveImageSize[]
}

export interface ResponsiveImageSize {
  width: number
  height: number
  density: 1 | 2 | 3
  url: string
  breakpoint: 'mobile' | 'tablet' | 'large-tablet' | 'desktop' | 'large-desktop'
}

export interface ImageMetadata {
  originalWidth: number
  originalHeight: number
  fileSize: number
  caption?: string
  tags?: string[]
  dateTaken?: string
}

// Gallery manifest structure
export interface ResponsiveImageManifest {
  version: string
  breakpoints: BreakpointConfiguration
  images: ResponsiveImage[]
  performance: PerformanceConfiguration
}

export interface BreakpointConfiguration {
  mobile: { maxWidth: 47.9375; sizes: number[] }     // <48rem (768px)
  tablet: { minWidth: 48; maxWidth: 52.4375; sizes: number[] }   // 48-52.4375rem (768-839px)
  largeTablet: { minWidth: 52.5; maxWidth: 63.9375; sizes: number[] }  // 52.5-63.9375rem (840-1023px)
  desktop: { minWidth: 64; maxWidth: 74.9375; sizes: number[] }   // 64-74.9375rem (1024-1199px)
  largeDesktop: { minWidth: 75; sizes: number[] }    // ≥75rem (1200px)
}

export interface PerformanceConfiguration {
  preloadCount: number
  lazyLoadThreshold: string
  placeholderQuality: number
  enableWebP: boolean
}

// Component interfaces
export interface IResponsiveImageLoader {
  // Core loading operations
  loadImage(image: ResponsiveImage, options?: LoadOptions): Promise<LoadResult>
  preloadImages(images: ResponsiveImage[], count?: number): Promise<void>
  getOptimalSource(image: ResponsiveImage, viewport: ViewportInfo): ResponsiveImageSize

  // Format and browser support
  detectWebPSupport(): boolean
  selectFormat(sources: ResponsiveImageSource[]): ResponsiveImageSource

  // Performance operations
  generatePicture(image: ResponsiveImage): HTMLPictureElement
  calculateSizes(breakpoints: BreakpointConfiguration): string

  // Validation and error handling
  validateImage(image: ResponsiveImage): ValidationResult
  handleLoadError(image: ResponsiveImage, error: Error): Promise<HTMLImageElement>
}

export interface IResponsiveImageRenderer {
  // Rendering operations
  renderPictureElement(image: ResponsiveImage): HTMLPictureElement
  renderPlaceholder(aspectRatio: number, lqip?: string): HTMLElement
  renderProgressiveLoad(image: ResponsiveImage, container: HTMLElement): Promise<void>

  // Layout preservation
  calculateDimensions(image: ResponsiveImage, containerWidth: number): { width: number; height: number }
  preserveAspectRatio(container: HTMLElement, aspectRatio: number): void
  preventLayoutShift(element: HTMLElement): void

  // State management
  updateLoadingState(element: HTMLElement, state: LoadingState): void
  transitionToLoaded(placeholder: HTMLElement, image: HTMLImageElement): Promise<void>
}

// Supporting types
export interface LoadOptions {
  priority?: 'high' | 'low'
  lazy?: boolean
  placeholder?: boolean
  breakpoint?: 'mobile' | 'tablet' | 'large-tablet' | 'desktop' | 'large-desktop'
}

export interface LoadResult {
  success: boolean
  element: HTMLImageElement
  loadTime: number
  format: 'webp' | 'jpeg'
  size: { width: number; height: number }
  fromCache: boolean
}

export interface ViewportInfo {
  width: number
  height: number
  devicePixelRatio: number
  breakpoint: 'mobile' | 'tablet' | 'large-tablet' | 'desktop' | 'large-desktop'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  recommendation: string
}

export enum LoadingState {
  PLACEHOLDER = 'placeholder',
  LQIP = 'lqip',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

// Performance monitoring interfaces
export interface IResponsiveImageMetrics {
  // Performance measurement
  measureLCP(): Promise<number>
  measureCLS(): Promise<number>
  measureImageLoadTime(url: string): Promise<number>
  calculatePayloadReduction(before: number, after: number): number

  // Reporting
  getPerformanceReport(): PerformanceReport
  trackLoadingMetrics(image: ResponsiveImage, result: LoadResult): void
}

export interface PerformanceReport {
  lcp: number
  cls: number
  averageLoadTime: number
  payloadReduction: number
  webpAdoption: number
  cacheHitRate: number
  errorRate: number
}

// Validation functions
export function isValidResponsiveImage(image: any): image is ResponsiveImage {
  return (
    typeof image === 'object' &&
    typeof image.id === 'string' &&
    typeof image.alt === 'string' &&
    typeof image.aspectRatio === 'number' &&
    Array.isArray(image.sources) &&
    image.sources.length > 0 &&
    image.sources.every(isValidImageSource)
  )
}

export function isValidImageSource(source: any): source is ResponsiveImageSource {
  return (
    typeof source === 'object' &&
    (source.format === 'webp' || source.format === 'jpeg') &&
    Array.isArray(source.sizes) &&
    source.sizes.length > 0 &&
    source.sizes.every(isValidImageSize)
  )
}

export function isValidImageSize(size: any): size is ResponsiveImageSize {
  return (
    typeof size === 'object' &&
    typeof size.width === 'number' &&
    typeof size.height === 'number' &&
    (size.density === 1 || size.density === 2 || size.density === 3) &&
    typeof size.url === 'string' &&
    (size.breakpoint === 'mobile' || size.breakpoint === 'tablet' || size.breakpoint === 'large-tablet' || size.breakpoint === 'desktop' || size.breakpoint === 'large-desktop')
  )
}

// Default configurations (breakpoints in rem, image sizes in px)
export const DEFAULT_BREAKPOINTS: BreakpointConfiguration = {
  mobile: { maxWidth: 47.9375, sizes: [320, 480, 640] },       // <48rem (768px)
  tablet: { minWidth: 48, maxWidth: 52.4375, sizes: [400, 600, 800] },     // 48-52.4375rem (768-839px)
  largeTablet: { minWidth: 52.5, maxWidth: 63.9375, sizes: [480, 720, 960] },   // 52.5-63.9375rem (840-1023px)
  desktop: { minWidth: 64, maxWidth: 74.9375, sizes: [600, 900, 1200] },    // 64-74.9375rem (1024-1199px)
  largeDesktop: { minWidth: 75, sizes: [800, 1200, 1600] }     // ≥75rem (1200px)
}

export const DEFAULT_PERFORMANCE: PerformanceConfiguration = {
  preloadCount: 3,
  lazyLoadThreshold: '6.25rem',  // 100px in rem
  placeholderQuality: 10,
  enableWebP: true
}

export const SUPPORTED_FORMATS = ['webp', 'jpeg'] as const
export const SUPPORTED_DENSITIES = [1, 2, 3] as const
export const SUPPORTED_BREAKPOINTS = ['mobile', 'tablet', 'large-tablet', 'desktop', 'large-desktop'] as const