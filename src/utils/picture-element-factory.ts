/**
 * Picture Element Factory
 * Shared utility for creating consistent picture elements across gallery and viewer components
 */

import { ResponsiveImage, ResponsiveImageSource, ImageSize } from '../components/gallery/gallery.types'
import { getResponsiveSizes } from './responsive-picture'

export type PictureContext = 'gallery' | 'viewer'

export interface PictureOptions {
  lazyLoad?: boolean
  originalIndex?: number
  highPriority?: boolean
}

export class PictureElementFactory {
  /**
   * Creates a picture element with appropriate sources for the given image
   * @param image The responsive image data
   * @param context The context where the picture will be used ('gallery' or 'viewer')
   * @param options Additional options for customizing the picture element
   */
  static create(
    image: ResponsiveImage, 
    context: PictureContext,
    options: PictureOptions = {}
  ): HTMLPictureElement {
    const picture = document.createElement('picture')
    
    // Add sources in optimal order: AVIF → WebP → JPEG
    const avifSource = image.sources.find(s => s.format === 'avif')
    const webpSource = image.sources.find(s => s.format === 'webp')
    const jpegSource = image.sources.find(s => s.format === 'jpeg')

    if (avifSource) this.addSourceElement(picture, avifSource, 'avif', context, options.lazyLoad)
    if (webpSource) this.addSourceElement(picture, webpSource, 'webp', context, options.lazyLoad)
    if (jpegSource) this.addSourceElement(picture, jpegSource, 'jpeg', context, options.lazyLoad)
    
    // Add img element
    const img = this.createImageElement(image, context, options)
    picture.appendChild(img)
    
    return picture
  }
  
  /**
   * Creates HTML string representation of a picture element
   * For use with template-based rendering
   */
  static createHTML(
    image: ResponsiveImage, 
    context: PictureContext,
    options: PictureOptions = {}
  ): string {
    const avifSource = image.sources.find(s => s.format === 'avif')
    const webpSource = image.sources.find(s => s.format === 'webp')
    const jpegSource = image.sources.find(s => s.format === 'jpeg')
    
    const srcsetAttr = (source: ResponsiveImageSource, lazyLoad: boolean) => {
      const srcset = source.sizes.map((size: ImageSize) => `${size.url} ${size.width}w`).join(', ')
      return lazyLoad ? `data-srcset="${srcset}"` : `srcset="${srcset}"`
    }
    
    const sizes = getResponsiveSizes(context)
    const fallbackSource = jpegSource || webpSource || avifSource
    const imgSrc = fallbackSource?.sizes[0]?.url || ''
    const imgAttr = options.lazyLoad 
      ? `data-src="${imgSrc}" class="lazy"`
      : `src="${imgSrc}"`
    
    const sources = [
      avifSource && `<source type="image/avif" ${srcsetAttr(avifSource, !!options.lazyLoad)} sizes="${sizes}">`,
      webpSource && `<source type="image/webp" ${srcsetAttr(webpSource, !!options.lazyLoad)} sizes="${sizes}">`,
      jpegSource && `<source type="image/jpeg" ${srcsetAttr(jpegSource, !!options.lazyLoad)} sizes="${sizes}">`
    ].filter(Boolean).join('\n        ')
    
    return `
      <picture>
        ${sources}
        <img 
          ${imgAttr}
          alt="${image.alt}"
          data-id="${image.id}"
          ${options.originalIndex !== undefined ? `data-index="${options.originalIndex}"` : ''}
          data-full-src="${this.getLargestImageUrl(image)}"
          decoding="async"
          ${options.highPriority ? 'fetchpriority="high"' : ''}
          ${context === 'gallery' ? `loading="${options.originalIndex && options.originalIndex < 6 ? 'eager' : 'lazy'}"` : 'loading="eager"'}
        >
      </picture>
    `.trim()
  }
  
  private static addSourceElement(
    picture: HTMLPictureElement, 
    source: ResponsiveImageSource, 
    format: 'avif' | 'webp' | 'jpeg',
    context: PictureContext,
    lazyLoad?: boolean
  ): void {
    const sourceEl = document.createElement('source')
    sourceEl.type = `image/${format}`
    
    const srcset = source.sizes.map((size: ImageSize) => `${size.url} ${size.width}w`).join(', ')
    
    if (lazyLoad) {
      sourceEl.dataset.srcset = srcset
    } else {
      sourceEl.srcset = srcset
    }
    
    sourceEl.sizes = getResponsiveSizes(context)
    picture.appendChild(sourceEl)
  }
  
  private static createImageElement(
    image: ResponsiveImage, 
    context: PictureContext,
    options: PictureOptions
  ): HTMLImageElement {
    const fallbackSource = image.sources.find(s => s.format === 'jpeg') || 
                          image.sources.find(s => s.format === 'webp') || 
                          image.sources.find(s => s.format === 'avif')
    
    const smallestSize = fallbackSource?.sizes[0]
    const largestSize = this.getLargestImageUrl(image)
    
    const img = document.createElement('img')
    
    // Set data attributes for lazy loading or direct src
    if (options.lazyLoad) {
      img.dataset.src = smallestSize?.url || ''
      img.classList.add('lazy')
    } else {
      img.src = smallestSize?.url || ''
    }
    
    // Store metadata for viewer integration
    img.dataset.fullSrc = largestSize
    img.dataset.id = image.id
    
    if (options.originalIndex !== undefined) {
      img.dataset.index = String(options.originalIndex)
    }
    
    img.alt = image.alt
    
    // Add modern loading optimizations
    img.decoding = 'async'
    
    if (options.highPriority) {
      img.fetchPriority = 'high'
    }
    
    if (context === 'gallery') {
      img.loading = options.highPriority ? 'eager' : 'lazy'
    } else {
      img.loading = 'eager'
    }
    
    // Set dimensions if available to prevent layout shift
    if (smallestSize) {
      img.width = smallestSize.width
      img.height = smallestSize.height
    }
    
    return img
  }
  
  private static getLargestImageUrl(image: ResponsiveImage): string {
    // Find the largest image across all sources
    let largestUrl = ''
    let largestWidth = 0
    
    image.sources.forEach(source => {
      source.sizes.forEach(size => {
        if (size.width > largestWidth) {
          largestWidth = size.width
          largestUrl = size.url
        }
      })
    })
    
    return largestUrl || image.sources[0]?.sizes[0]?.url || ''
  }
  
  /**
   * Gets the format priority for sorting sources
   * Lower numbers = higher priority
   */
  private static getFormatPriority(format: string): number {
    const priorities = { avif: 1, webp: 2, jpeg: 3 }
    return priorities[format as keyof typeof priorities] || 999
  }
}
