/**
 * Masonry Gallery Component
 * Minimal masonry layout with CSS-driven responsive behavior
 * Refactored with improved architecture and separation of concerns
 */

import { ResponsiveImage, GalleryImageData, IImageViewer, IMasonryGallery } from './gallery.types'
import { PictureElementFactory } from '../../utils/picture-element-factory'
import type { IGalleryDataService } from '../../services/gallery-data.service'
import { StaticManifestGalleryDataService } from '../../services/static-manifest.gallery-data.service'
import { ImageErrorHandler } from '../../utils/image-error-handler'

export class MasonryGallery extends HTMLElement implements IMasonryGallery {
  // Performance constants (implementation details, not design tokens)
  private static readonly LAZY_LOAD_MARGIN = '200px'      // IntersectionObserver rootMargin
  private static readonly FALLBACK_COLUMN_WIDTH = 300     // Emergency fallback when getBoundingClientRect fails
  private static readonly HIGH_PRIORITY_IMAGE_COUNT = 3   // Number of above-fold images to prioritize

  private images: ResponsiveImage[] = []
  private columns: HTMLElement[] = []
  private columnHeights: number[] = []
  private isInitialized = false
  private viewer: IImageViewer | null = null
  private lastColumnCount: number = 0
  private cachedImageData: GalleryImageData[] | null = null

  // Service instances
  private _dataService: IGalleryDataService | null = null
  private errorHandler = new ImageErrorHandler()

  set dataService(service: IGalleryDataService) {
    this._dataService = service
    if (this.isConnected && !this.isInitialized) {
      this.isInitialized = true
      this.runInitialize()
    }
  }

  // Static shared observers
  private static sharedImageObserver?: IntersectionObserver | undefined
  private static sharedResizeObserver?: ResizeObserver | undefined
  private static observedGalleries = new Set<MasonryGallery>()

  // Helper to read design system values from CSS custom properties
  private getTransitionDuration(): number {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--transition-medium')
      .trim()
    // Parse "250ms ease-out" -> 250
    const ms = parseInt(value)
    return isNaN(ms) ? 300 : ms
  }

  private getColumnGap(): number {
    // Read the actual gap from CSS (already using --space-sm / 0.5rem)
    const gap = getComputedStyle(this).gap || '0.5rem'
    // Convert rem to pixels (assuming 16px base)
    const remMatch = gap.match(/^([\d.]+)rem$/)
    if (remMatch) {
      return parseFloat(remMatch[1]) * 16
    }
    return parseFloat(gap) || 8
  }

  // Static templates (parsed once, cloned many times)
  private static templates: {
    column: HTMLTemplateElement;
    imageContainer: HTMLTemplateElement;
    error: HTMLTemplateElement;
  } | null = null

  private static initializeTemplates(): void {
    if (MasonryGallery.templates) return

    const createTemplate = (html: string): HTMLTemplateElement => {
      const t = document.createElement('template')
      t.innerHTML = html
      return t
    }

    MasonryGallery.templates = {
      column: createTemplate('<div class="masonry-column"></div>'),
      imageContainer: createTemplate(`
        <div class="portfolio-image">
          <div data-image-wrapper></div>
        </div>
      `),
      error: createTemplate(`
        <div class="gallery-error-message">
          <div class="gallery-error-icon">📷</div>
          <div class="gallery-error-text"></div>
        </div>
      `)
    }
  }

  static get observedAttributes() {
    return ['data-manifest-url']
  }

  connectedCallback() {
    MasonryGallery.initializeTemplates()
    // setTimeout(0) fires after deferred module scripts — gives main.ts
    // a chance to inject a service before the fallback fires
    setTimeout(() => {
      if (!this.isInitialized) {
        const url = this.getAttribute('data-manifest-url') || '/gallery-data.json'
        this._dataService = new StaticManifestGalleryDataService(url)
        this.isInitialized = true
        this.runInitialize()
      }
    }, 0)
  }

  disconnectedCallback() {
    this.cleanup()
  }

  private async runInitialize(): Promise<void> {
    this.className = 'masonry-gallery'
    this.setupLazyLoading()
    await this.loadImages()
    this.createColumns()
    this.distributeImages()
    this.setupViewerIntegration()

    this.dispatchEvent(new CustomEvent('gallery:initialized'))
  }

  private async loadImages(): Promise<void> {
    try {
      this.images = await this._dataService!.getImages()
    } catch (error) {
      console.error('Failed to load gallery images:', error)
      this.showError('Failed to load gallery')
    }
  }


  private createColumns(): void {
    // CSS handles the column count - we just need the column elements for masonry distribution
    const columnCount = this.getColumnCount()

    // Clear existing columns
    this.innerHTML = ''
    this.columns = []
    this.columnHeights = []

    for (let i = 0; i < columnCount; i++) {
      const fragment = MasonryGallery.templates!.column.content.cloneNode(true) as DocumentFragment
      const column = fragment.firstElementChild as HTMLElement
      this.appendChild(column)
      this.columns.push(column)
      this.columnHeights.push(0)
    }
  }

  getColumnCount(): number {
    // Read the current column count from CSS custom property
    const computedStyle = getComputedStyle(this)
    const columns = computedStyle.getPropertyValue('--columns').trim()
    return parseInt(columns) || 5
  }

  private distributeImages(): void {
    if (!this.images.length || !this.columns.length) return

    // Distribute in visual order (left-to-right, top-to-bottom)
    // This preserves reading order when rotating screen
    this.images.forEach((image, index) => {
      const colIndex = index % this.columns.length
      const targetColumn = this.columns[colIndex]
      this.addImageToColumn(image, targetColumn, index)
    })
  }


  private addImageToColumn(image: ResponsiveImage, column: HTMLElement, originalIndex: number): void {
    const fragment = MasonryGallery.templates!.imageContainer.content.cloneNode(true) as DocumentFragment
    const container = fragment.firstElementChild as HTMLElement
    container.style.setProperty('--image-aspect-ratio', image.aspectRatio.toString())

    const imageWrapper = container.querySelector('[data-image-wrapper]') as HTMLElement

    // Add LQIP placeholder if available
    this.addLQIPPlaceholder(image, imageWrapper)

    // Create picture element using the factory
    const picture = PictureElementFactory.create(image, 'gallery', {
      lazyLoad: true,
      originalIndex,
      highPriority: originalIndex < MasonryGallery.HIGH_PRIORITY_IMAGE_COUNT
    })

    // Handle image load
    const img = picture.querySelector('img')
    if (img) {
      // Observe for lazy loading using shared observer
      MasonryGallery.sharedImageObserver?.observe(img)

      img.onload = () => {
        const placeholder = imageWrapper.querySelector('[data-placeholder]')
        if (placeholder) {
          (placeholder as HTMLElement).style.opacity = '0'
          setTimeout(() => placeholder.remove(), this.getTransitionDuration())
        }
        imageWrapper.classList.add('loaded')
        this.dispatchEvent(new CustomEvent('gallery:image-loaded', { detail: { image } }))
      }

      img.onerror = async () => {
        // Use the enhanced error handler
        await this.errorHandler.handleImageError(image, img)
      }
    }

    imageWrapper.appendChild(picture)
    column.appendChild(container)

    // Update the tracked height for this column
    const columnIndex = this.columns.indexOf(column)
    if (columnIndex !== -1) {
      const columnWidth = column.getBoundingClientRect().width || MasonryGallery.FALLBACK_COLUMN_WIDTH
      const gap = this.getColumnGap()
      const estimatedHeight = (columnWidth / image.aspectRatio) + gap
      this.columnHeights[columnIndex] += estimatedHeight
    }
  }


  private showError(message: string): void {
    const errorContent = MasonryGallery.templates!.error.content.cloneNode(true) as DocumentFragment
    const errorText = errorContent.querySelector('.gallery-error-text')
    if (errorText) {
      errorText.textContent = message
    }
    this.innerHTML = ''
    this.appendChild(errorContent)
  }

  private setupLazyLoading(): void {
    // Initialize shared image observer if not already created
    if (!MasonryGallery.sharedImageObserver) {
      MasonryGallery.sharedImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const picture = img.parentElement as HTMLPictureElement

            // Load sources
            picture.querySelectorAll('source[data-srcset]').forEach(source => {
              const srcset = (source as HTMLSourceElement).dataset.srcset
              if (srcset) (source as HTMLSourceElement).srcset = srcset
            })

            // Load img
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.classList.remove('lazy')
            }

            MasonryGallery.sharedImageObserver?.unobserve(img)
          }
        })
      }, {
        rootMargin: MasonryGallery.LAZY_LOAD_MARGIN
      })
    }
  }

  // Viewer Integration Methods (T024)
  getImages(): GalleryImageData[] {
    // Return cached data if available
    if (this.cachedImageData) {
      return this.cachedImageData
    }

    const images: GalleryImageData[] = []
    const imgElements = this.querySelectorAll('.portfolio-image img')

    // Convert to array and include the data-index for proper sorting
    const indexedImages = Array.from(imgElements).map(img => {
      const htmlImg = img as HTMLImageElement
      // Get the original index from data-index attribute (manifest order)
      const originalIndex = parseInt(htmlImg.dataset.index || '0', 10)
      return { img: htmlImg, originalIndex }
    })

    // Sort by the original manifest index to maintain expected visual order
    indexedImages.sort((a, b) => a.originalIndex - b.originalIndex)

    // Create ImageData array in original manifest order
    indexedImages.forEach((item, visualIndex) => {
      const htmlImg = item.img
      const picture = htmlImg.closest('picture') as HTMLPictureElement

      // Get WebP and JPEG sources from picture element for responsive viewer
      const webpSource = picture?.querySelector('source[type="image/webp"]') as HTMLSourceElement
      const jpegSource = picture?.querySelector('source[type="image/jpeg"]') as HTMLSourceElement

      // Extract srcset from data-srcset (lazy loaded) or srcset attribute
      const jpegSrcset = jpegSource?.dataset.srcset || jpegSource?.srcset || ''
      const webpSrcset = webpSource?.dataset.srcset || webpSource?.srcset || ''

      images.push({
        id: htmlImg.dataset.id || `image-${visualIndex}`,
        src: jpegSrcset.split(',')[0]?.trim().split(' ')[0] || htmlImg.src || '',
        srcset: jpegSrcset,
        webpSrcset: webpSrcset,
        alt: htmlImg.alt,
        width: parseInt(htmlImg.getAttribute('width') || '800', 10),
        height: parseInt(htmlImg.getAttribute('height') || '600', 10),
        index: visualIndex,  // Sequential index for navigation in sorted order
        pictureElement: picture  // Reference to original picture element
      })
    })

    // Cache the result
    this.cachedImageData = images
    return images
  }

  // Viewer Integration with Event-Based Communication
  private setupViewerIntegration(): void {
    this.setupViewer()
    this.setupClickHandler()
    this.setupResizeObserver()
  }

  private setupViewer(): void {
    this.viewer = document.querySelector('image-viewer') as IImageViewer | null

    if (this.viewer) {
      const images = this.getImages()
      this.viewer.setImages(images)

      const columns = this.getColumnCount()
      this.lastColumnCount = columns
      this.viewer.setEnabled(columns > 1)
    }
  }

  private setupClickHandler(): void {
    this.addEventListener('click', (e) => {
      const imageContainer = (e.target as HTMLElement).closest('.portfolio-image') as HTMLElement
      if (!imageContainer) return

      const img = imageContainer.querySelector('img')
      if (!img) return

      const currentImages = this.getImages()
      const index = currentImages.findIndex(imageData => imageData.id === img.dataset.id)

      if (index >= 0) {
        this.dispatchEvent(new CustomEvent('gallery:image-click', {
          detail: { index, images: currentImages },
          bubbles: true
        }))

        if (this.viewer && this.viewer.getState().enabled) {
          this.viewer.setImages(currentImages)
          this.viewer.open(index)
        }
      }
    })
  }

  private setupResizeObserver(): void {
    if (!MasonryGallery.sharedResizeObserver) {
      MasonryGallery.sharedResizeObserver = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          const gallery = entry.target as MasonryGallery
          if (MasonryGallery.observedGalleries.has(gallery)) {
            gallery.handleResize()
          }
        })
      })
    }

    MasonryGallery.observedGalleries.add(this)
    MasonryGallery.sharedResizeObserver.observe(this)
  }

  // Handle resize events for this gallery instance
  private handleResize(): void {
    const columns = this.getColumnCount()

    if (columns !== this.lastColumnCount) {
      this.lastColumnCount = columns

      // Invalidate cached image data (layout changed)
      this.cachedImageData = null

      // Redistribute images without destroying DOM
      this.redistributeImages()

      // Dispatch event (works without viewer)
      this.dispatchEvent(new CustomEvent('gallery:columns-changed', {
        detail: { columns },
        bubbles: true
      }))

      // Direct viewer integration if available
      if (this.viewer) {
        this.viewer.setEnabled(columns > 1)
      }
    }
  }

  // Redistribute images across columns without rebuilding DOM
  private redistributeImages(): void {
    const newColumnCount = this.getColumnCount()

    // If column count hasn't changed, just redistribute
    if (newColumnCount === this.columns.length) {
      // Clear columns but keep elements
      const allImages = Array.from(this.querySelectorAll('.portfolio-image'))
      this.columns.forEach(col => col.innerHTML = '')
      this.columnHeights = new Array(this.columns.length).fill(0)

      // Sort images by original index to preserve visual order
      allImages.sort((a, b) => {
        const indexA = parseInt(a.querySelector('img')?.dataset.index || '0', 10)
        const indexB = parseInt(b.querySelector('img')?.dataset.index || '0', 10)
        return indexA - indexB
      })

      // Re-distribute in visual order (not shortest column)
      allImages.forEach((imageContainer, i) => {
        const colIndex = i % this.columns.length
        const targetCol = this.columns[colIndex]
        targetCol.appendChild(imageContainer)

        // Get original index from data-index attribute (manifest order)
        const imgElement = imageContainer.querySelector('img')
        const originalIndex = imgElement ? parseInt(imgElement.dataset.index || '0', 10) : 0

        // Update height tracking using manifest order
        this.updateColumnHeight(colIndex, targetCol, originalIndex)
      })
    } else {
      // Column count changed - need to rebuild columns but keep images
      const allImages = Array.from(this.querySelectorAll('.portfolio-image'))
      this.createColumns()

      // Sort images by original index to preserve visual order
      allImages.sort((a, b) => {
        const indexA = parseInt(a.querySelector('img')?.dataset.index || '0', 10)
        const indexB = parseInt(b.querySelector('img')?.dataset.index || '0', 10)
        return indexA - indexB
      })

      // Re-distribute in visual order (not shortest column)
      allImages.forEach((imageContainer, i) => {
        const colIndex = i % this.columns.length
        const targetCol = this.columns[colIndex]
        targetCol.appendChild(imageContainer)

        // Get original index from data-index attribute (manifest order)
        const imgElement = imageContainer.querySelector('img')
        const originalIndex = imgElement ? parseInt(imgElement.dataset.index || '0', 10) : 0

        // Update height tracking using manifest order
        this.updateColumnHeight(colIndex, targetCol, originalIndex)
      })
    }
  }

  // Helper method to add LQIP placeholder
  private addLQIPPlaceholder(image: ResponsiveImage, wrapper: HTMLElement): void {
    if (!image.lqip || typeof image.lqip !== 'object') return

    const placeholder = document.createElement('div')
    placeholder.setAttribute('data-placeholder', 'true')
    placeholder.setAttribute('data-lqip-type', image.lqip.type)

    if (image.lqip.type === 'solid-color') {
      if (image.lqip.data.startsWith('data:image/svg+xml')) {
        placeholder.style.backgroundImage = `url("${image.lqip.data}")`
      } else {
        placeholder.style.backgroundColor = image.lqip.dominantColor || '#f0f0f0'
      }
    } else if (image.lqip.type === 'blur') {
      placeholder.style.backgroundImage = `url(${image.lqip.data})`
    }

    wrapper.appendChild(placeholder)
  }

  // Helper method to update column height (extracted from duplicate code)
  private updateColumnHeight(colIndex: number, column: HTMLElement, imageIndex: number): void {
    const imageData = this.images[imageIndex]
    if (imageData) {
      const colWidth = column.getBoundingClientRect().width || MasonryGallery.FALLBACK_COLUMN_WIDTH
      const gap = this.getColumnGap()
      this.columnHeights[colIndex] += (colWidth / imageData.aspectRatio) + gap
    }
  }

  private cleanup(): void {
    // Remove this gallery from shared observers
    MasonryGallery.observedGalleries.delete(this)

    // If this was the last gallery, clean up shared observers
    if (MasonryGallery.observedGalleries.size === 0) {
      if (MasonryGallery.sharedImageObserver) {
        MasonryGallery.sharedImageObserver.disconnect()
        MasonryGallery.sharedImageObserver = undefined
      }
      if (MasonryGallery.sharedResizeObserver) {
        MasonryGallery.sharedResizeObserver.disconnect()
        MasonryGallery.sharedResizeObserver = undefined
      }
    }

    this.isInitialized = false
    this.cachedImageData = null
  }
}

// Register the custom element
if (!customElements.get('masonry-gallery')) {
  customElements.define('masonry-gallery', MasonryGallery)
}
