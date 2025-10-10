/**
 * Image Error Handler
 * Provides robust error handling with retry mechanisms and fallback strategies
 */

import { ResponsiveImage } from '../components/gallery/gallery.types'

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  enableReporting?: boolean
  maxErrorHistory?: number
}

export interface ErrorReport {
  imageId: string
  url: string
  reason: string
  timestamp: number
  userAgent: string
  retryCount: number
}

export class ImageErrorHandler {
  private retryAttempts = new Map<string, number>()
  private readonly options: Required<ErrorHandlerOptions>
  private errorReports: ErrorReport[] = []
  
  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 2,
      retryDelay: options.retryDelay ?? 1000,
      exponentialBackoff: options.exponentialBackoff ?? true,
      enableReporting: options.enableReporting ?? true,
      maxErrorHistory: options.maxErrorHistory ?? 20
    }
  }
  
  /**
   * Handles image loading errors with retry and fallback strategies
   * @param image The responsive image that failed to load
   * @param imgElement The image element that triggered the error
   * @returns Promise that resolves when recovery is attempted
   */
  async handleImageError(
    image: ResponsiveImage, 
    imgElement: HTMLImageElement
  ): Promise<void> {
    const imageId = image.id
    const currentUrl = imgElement.src || imgElement.dataset.src || ''
    const attempts = this.retryAttempts.get(imageId) || 0
    
    // Report the error
    if (this.options.enableReporting) {
      this.reportError(imageId, currentUrl, 'load-failed', attempts)
    }
    
    if (attempts < this.options.maxRetries) {
      // Try alternative source with backoff
      await this.retryWithBackoff(image, imgElement, attempts)
      this.retryAttempts.set(imageId, attempts + 1)
    } else {
      // Show error placeholder and report final failure
      this.showErrorPlaceholder(imgElement)
      
      if (this.options.enableReporting) {
        this.reportError(imageId, currentUrl, 'max-retries-exceeded', attempts)
      }
    }
  }
  
  /**
   * Retries loading an image with exponential backoff
   * @param image The responsive image to retry
   * @param imgElement The image element to update
   * @param attempt Current attempt number
   */
  private async retryWithBackoff(
    image: ResponsiveImage, 
    imgElement: HTMLImageElement, 
    attempt: number
  ): Promise<void> {
    // Calculate delay with optional exponential backoff
    const delay = this.options.exponentialBackoff 
      ? this.options.retryDelay * Math.pow(2, attempt)
      : this.options.retryDelay
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Try alternative source
    const alternativeSource = this.getAlternativeSource(image, attempt)
    if (alternativeSource) {
      // Update the image source
      if (imgElement.dataset.src) {
        // For lazy-loaded images
        imgElement.dataset.src = alternativeSource
      } else {
        // For directly loaded images
        imgElement.src = alternativeSource
      }
      
      console.log(`Retrying image load for ${image.id} with alternative source (attempt ${attempt + 1})`)
    }
  }
  
  /**
   * Gets an alternative source URL for retry attempts
   * @param image The responsive image
   * @param attempt Current attempt number
   * @returns Alternative URL or empty string if none available
   */
  private getAlternativeSource(image: ResponsiveImage, attempt: number): string {
    // Collect all available URLs from all sources and sizes
    const allUrls: string[] = []
    
    image.sources.forEach(source => {
      source.sizes.forEach(size => {
        allUrls.push(size.url)
      })
    })
    
    // Try different URLs based on attempt number
    // Skip the first URL (which presumably failed)
    const alternativeIndex = Math.min(attempt + 1, allUrls.length - 1)
    
    if (alternativeIndex < allUrls.length && alternativeIndex > 0) {
      return allUrls[alternativeIndex]
    }
    
    // If no alternatives, try a different format
    const currentFormat = this.detectFormatFromUrl(allUrls[0] || '')
    const alternativeFormat = this.getAlternativeFormat(currentFormat)
    
    if (alternativeFormat) {
      const alternativeSource = image.sources.find(s => s.format === alternativeFormat)
      if (alternativeSource && alternativeSource.sizes.length > 0) {
        return alternativeSource.sizes[0].url
      }
    }
    
    return ''
  }
  
  /**
   * Detects image format from URL
   * @param url Image URL
   * @returns Detected format or 'unknown'
   */
  private detectFormatFromUrl(url: string): string {
    if (url.includes('.avif')) return 'avif'
    if (url.includes('.webp')) return 'webp'
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg'
    return 'unknown'
  }
  
  /**
   * Gets an alternative format for fallback
   * @param currentFormat Current image format
   * @returns Alternative format or null
   */
  private getAlternativeFormat(currentFormat: string): string | null {
    const formatFallbacks: Record<string, string> = {
      'avif': 'webp',
      'webp': 'jpeg',
      'jpeg': 'webp' // Try WebP as fallback for JPEG
    }
    
    return formatFallbacks[currentFormat] || null
  }
  
  /**
   * Shows an error placeholder in place of the failed image
   * @param imgElement The image element that failed
   */
  private showErrorPlaceholder(imgElement: HTMLImageElement): void {
    const container = imgElement.closest('.image-wrapper') || 
                    imgElement.closest('.portfolio-image') || 
                    imgElement.parentElement
    
    if (container) {
      // Create error placeholder
      const errorPlaceholder = document.createElement('div')
      errorPlaceholder.className = 'gallery-image-error'
      errorPlaceholder.innerHTML = `
        <div class="gallery-image-error-icon" aria-hidden="true">📷</div>
        <div class="gallery-image-error-message">Image unavailable</div>
      `
      
      // Add ARIA attributes for accessibility
      errorPlaceholder.setAttribute('role', 'img')
      errorPlaceholder.setAttribute('aria-label', 'Image failed to load')
      
      // Replace the image with the error placeholder
      if (imgElement.parentElement) {
        imgElement.parentElement.replaceChild(errorPlaceholder, imgElement)
      }
    }
  }
  
  /**
   * Reports an error for monitoring and debugging
   * @param imageId ID of the image that failed
   * @param url URL that failed to load
   * @param reason Reason for the error
   * @param retryCount Number of retries attempted
   */
  private reportError(imageId: string, url: string, reason: string, retryCount: number): void {
    const errorReport: ErrorReport = {
      imageId,
      url,
      reason,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      retryCount
    }
    
    this.errorReports.push(errorReport)
    
    // Log to console for debugging
    console.error(`Image loading error: ${imageId}`, {
      url,
      reason,
      retryCount,
      timestamp: new Date(errorReport.timestamp).toISOString()
    })
    
    // Keep only the configured number of error reports to prevent memory leaks
    if (this.errorReports.length > this.options.maxErrorHistory) {
      this.errorReports = this.errorReports.slice(-this.options.maxErrorHistory)
    }
    
    // Could send to analytics or error tracking service here
    this.sendToAnalytics(errorReport)
  }
  
  /**
   * Sends error report to analytics service (placeholder implementation)
   * @param errorReport The error report to send
   */
  private sendToAnalytics(errorReport: ErrorReport): void {
    // Placeholder for analytics integration
    // In a real implementation, this would send to your analytics service
    
    // Example: Send to Google Analytics, Sentry, or custom endpoint
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_load_error', {
        custom_parameter_image_id: errorReport.imageId,
        custom_parameter_reason: errorReport.reason,
        custom_parameter_retry_count: errorReport.retryCount
      })
    }
  }
  
  /**
   * Gets error statistics for debugging
   * @returns Object with error statistics
   */
  getErrorStats(): {
    totalErrors: number
    errorsByReason: Record<string, number>
    errorsByImage: Record<string, number>
    recentErrors: ErrorReport[]
  } {
    const errorsByReason: Record<string, number> = {}
    const errorsByImage: Record<string, number> = {}
    
    this.errorReports.forEach(report => {
      errorsByReason[report.reason] = (errorsByReason[report.reason] || 0) + 1
      errorsByImage[report.imageId] = (errorsByImage[report.imageId] || 0) + 1
    })
    
    // Get recent errors (last 10)
    const recentErrors = this.errorReports.slice(-10)
    
    return {
      totalErrors: this.errorReports.length,
      errorsByReason,
      errorsByImage,
      recentErrors
    }
  }
  
  /**
   * Clears error history and retry counts
   */
  clearErrorHistory(): void {
    this.errorReports = []
    this.retryAttempts.clear()
  }
  
  /**
   * Gets retry count for a specific image
   * @param imageId ID of the image
   * @returns Number of retry attempts
   */
  getRetryCount(imageId: string): number {
    return this.retryAttempts.get(imageId) || 0
  }
}

// Export a default instance for convenience
export const imageErrorHandler = new ImageErrorHandler()
