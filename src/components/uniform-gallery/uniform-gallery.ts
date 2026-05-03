// src/components/uniform-gallery/uniform-gallery.ts

import type { IUniformGallery } from './uniform-gallery.types'
import type {
  ResponsiveImage,
  GalleryImageData,
  IImageViewer
} from '../gallery/gallery.types'
import { PictureElementFactory } from '../../utils/picture-element-factory'
import type { IGalleryDataService } from '../../services/gallery-data.types'
import { StaticManifestGalleryDataService } from '../../services/static-manifest.gallery-data.service'
import { ImageErrorHandler } from '../../utils/image-error-handler'
import './uniform-gallery.css'
import { computeRows } from './uniform-gallery.layout'

export class UniformGallery extends HTMLElement implements IUniformGallery {
  private static readonly LAZY_LOAD_MARGIN = '200px'
  private static readonly REVEAL_MARGIN = '50px'
  private static readonly HIGH_PRIORITY_IMAGE_COUNT = 3
  private static readonly LAYOUT_TARGET_HEIGHT = 300
  private static readonly LAYOUT_GAP = 10
  private static readonly LAYOUT_MIN_ROW_RATIO = 0.6
  private static readonly MOBILE_BREAKPOINT = 576
  private static layoutRafPending = false

  private images: ResponsiveImage[] = []
  private cachedImageData: GalleryImageData[] | null = null
  private isInitialized = false
  private viewer: IImageViewer | null = null

  private _dataService: IGalleryDataService | null = null
  private errorHandler = new ImageErrorHandler()

  set dataService(service: IGalleryDataService) {
    this._dataService = service
  }

  // Shared static observers (same pattern as MasonryGallery)
  private static sharedImageObserver?: IntersectionObserver
  private static sharedRevealObserver?: IntersectionObserver
  private static sharedResizeObserver?: ResizeObserver
  private static observedGalleries = new Set<UniformGallery>()

  connectedCallback() {
    // setTimeout(0) fires after deferred module scripts — gives main.ts a chance to
    // inject a service before the fallback fires; also handles pre-connection injection
    setTimeout(() => {
      if (!this.isInitialized) {
        if (!this._dataService) {
          const url = this.getAttribute('data-manifest-url') || '/gallery-data.json'
          this._dataService = new StaticManifestGalleryDataService(url)
        }
        this.isInitialized = true
        this.runInitialize()
      }
    }, 0)
  }

  disconnectedCallback() {
    this.cleanup()
  }

  private async runInitialize(): Promise<void> {
    this.className = 'uniform-gallery'
    this.setupLazyLoading()
    this.setupRevealObserver()
    await this.loadImages()
    if (!this.images.length) {
      this.dispatchEvent(new CustomEvent('uniform-gallery:error', {
        detail: { message: 'Failed to load gallery' }
      }))
      return
    }
    this.renderImages()
    this.setupViewerIntegration()
    this.dispatchEvent(new CustomEvent('uniform-gallery:initialized'))
  }

  private async loadImages(): Promise<void> {
    if (!this._dataService) {
      this.showError('Failed to load gallery')
      return
    }
    try {
      this.images = await this._dataService.getImages()
    } catch {
      this.showError('Failed to load gallery')
    }
  }

  private renderImages(): void {
    this.innerHTML = ''

    this.images.forEach((image, index) => {
      const item = this.createItem(image, index)
      this.appendChild(item)
    })

    // Spacer prevents last row from stretching
    const spacer = document.createElement('div')
    spacer.className = 'gallery-spacer'
    this.appendChild(spacer)

    this.applyLayout(this.clientWidth)
  }

  private applyLayout(containerWidth: number): void {
    const items = Array.from(this.querySelectorAll<HTMLElement>('.gallery-item'))
    if (!items.length) return

    if (containerWidth <= UniformGallery.MOBILE_BREAKPOINT) {
      items.forEach(item => {
        item.style.removeProperty('width')
        item.style.removeProperty('height')
        item.style.removeProperty('flex-basis')
        item.style.removeProperty('flex-grow')
      })
      return
    }

    const rows = computeRows(
      this.images.map(img => img.aspectRatio),
      containerWidth,
      UniformGallery.LAYOUT_TARGET_HEIGHT,
      UniformGallery.LAYOUT_GAP,
      UniformGallery.LAYOUT_MIN_ROW_RATIO
    )

    let itemIndex = 0
    for (const row of rows) {
      for (const layoutItem of row.items) {
        const el = items[itemIndex++]
        if (!el) continue
        el.style.width = `${layoutItem.width}px`
        el.style.height = `${row.height}px`
        el.style.flexBasis = `${layoutItem.width}px`
        el.style.flexGrow = '0'
      }
    }
  }

  private createItem(image: ResponsiveImage, index: number): HTMLElement {
    const item = document.createElement('div')
    item.className = 'gallery-item'
    item.setAttribute('tabindex', '0')
    item.setAttribute('role', 'button')
    item.setAttribute('aria-label', `View ${image.alt}`)
    item.style.setProperty('--ar', image.aspectRatio.toString())

    const wrapper = document.createElement('div')
    item.appendChild(wrapper)

    // LQIP placeholder
    this.addLQIPPlaceholder(image, wrapper)

    // Picture element (lazy for non-priority images)
    const picture = PictureElementFactory.create(image, 'gallery', {
      lazyLoad: true,
      originalIndex: index,
      highPriority: index < UniformGallery.HIGH_PRIORITY_IMAGE_COUNT
    })

    const img = picture.querySelector('img')
    if (img) {
      UniformGallery.sharedImageObserver?.observe(img)

      img.onload = () => {
        const placeholder = wrapper.querySelector('[data-placeholder]')
        if (placeholder) {
          (placeholder as HTMLElement).style.opacity = '0'
          setTimeout(() => placeholder.remove(), 300)
        }
        wrapper.classList.add('loaded')
        this.dispatchEvent(new CustomEvent('uniform-gallery:image-loaded', {
          detail: { image }
        }))
      }

      img.onerror = async () => {
        await this.errorHandler.handleImageError(image, img)
      }
    }

    wrapper.appendChild(picture)

    // Above-fold images reveal immediately; others use observer
    if (index < UniformGallery.HIGH_PRIORITY_IMAGE_COUNT) {
      item.classList.add('visible')
    } else {
      UniformGallery.sharedRevealObserver?.observe(item)
    }

    // Keyboard support (Enter/Space opens viewer)
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        item.click()
      }
    })

    return item
  }

  // ── Public API ────────────────────────────────────────

  getImages(): GalleryImageData[] {
    if (this.cachedImageData) return this.cachedImageData

    this.cachedImageData = this.images.map((image, index) => {
      const jpegSource = image.sources.find(s => s.format === 'jpeg')
      const webpSource = image.sources.find(s => s.format === 'webp')
      const jpegSrcset = jpegSource?.sizes.map(s => `${s.url} ${s.width}w`).join(', ') || ''
      const webpSrcset = webpSource?.sizes.map(s => `${s.url} ${s.width}w`).join(', ') || ''

      return {
        id: image.id,
        src: jpegSource?.sizes[0]?.url || '',
        srcset: jpegSrcset,
        webpSrcset,
        alt: image.alt,
        width: image.metadata.originalWidth,
        height: image.metadata.originalHeight,
        index
      }
    })

    return this.cachedImageData
  }

  // ── Observers ─────────────────────────────────────────

  private setupLazyLoading(): void {
    if (!UniformGallery.sharedImageObserver) {
      UniformGallery.sharedImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const img = entry.target as HTMLImageElement
          const picture = img.parentElement as HTMLPictureElement
          picture.querySelectorAll('source[data-srcset]').forEach(source => {
            const srcset = (source as HTMLSourceElement).dataset.srcset
            if (srcset) (source as HTMLSourceElement).srcset = srcset
          })
          const src = img.dataset.src
          if (src) { img.src = src; img.classList.remove('lazy') }
          UniformGallery.sharedImageObserver?.unobserve(img)
        })
      }, { rootMargin: UniformGallery.LAZY_LOAD_MARGIN })
    }
  }

  private setupRevealObserver(): void {
    if (!UniformGallery.sharedRevealObserver) {
      UniformGallery.sharedRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('visible')
          UniformGallery.sharedRevealObserver?.unobserve(entry.target)
        })
      }, { rootMargin: UniformGallery.REVEAL_MARGIN })
    }
  }

  // ── Viewer Integration ────────────────────────────────

  private setupViewerIntegration(): void {
    this.setupViewer()
    this.setupClickHandler()
    this.setupResizeObserver()
  }

  private isMobile(): boolean {
    return window.matchMedia('(max-width: 36rem)').matches
  }

  private setupViewer(): void {
    this.viewer = document.querySelector('image-viewer') as IImageViewer | null
    if (this.viewer) {
      this.viewer.setImages(this.getImages())
      this.viewer.setEnabled(!this.isMobile())
    }
  }

  private setupClickHandler(): void {
    this.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.gallery-item') as HTMLElement
      if (!item) return
      const img = item.querySelector('img')
      if (!img) return
      const images = this.getImages()
      const index = images.findIndex(d => d.id === img.dataset.id)
      if (index < 0) return
      this.dispatchEvent(new CustomEvent('uniform-gallery:image-click', {
        detail: { index, images },
        bubbles: true
      }))
      if (this.viewer?.getState().enabled) {
        this.viewer.setImages(images)
        this.viewer.open(index)
      }
    })
  }

  private setupResizeObserver(): void {
    if (!UniformGallery.sharedResizeObserver) {
      UniformGallery.sharedResizeObserver = new ResizeObserver((entries) => {
        if (!UniformGallery.layoutRafPending) {
          UniformGallery.layoutRafPending = true
          requestAnimationFrame(() => {
            UniformGallery.layoutRafPending = false
            entries.forEach(entry => {
              const gallery = entry.target as UniformGallery
              gallery.applyLayout(entry.contentRect.width)
              if (gallery.viewer) gallery.viewer.setEnabled(!gallery.isMobile())
            })
          })
        }
      })
    }
    UniformGallery.observedGalleries.add(this)
    UniformGallery.sharedResizeObserver.observe(this)
  }

  // ── Error ─────────────────────────────────────────────

  private showError(message: string): void {
    const container = document.createElement('div')
    container.className = 'uniform-gallery-error'
    container.textContent = message
    this.innerHTML = ''
    this.appendChild(container)
  }

  // ── LQIP ─────────────────────────────────────────────

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
      placeholder.style.backgroundImage = `url("${image.lqip.data}")`
    }
    wrapper.appendChild(placeholder)
  }

  // ── Cleanup ───────────────────────────────────────────

  private cleanup(): void {
    UniformGallery.observedGalleries.delete(this)
    UniformGallery.sharedResizeObserver?.unobserve(this)
    if (UniformGallery.observedGalleries.size === 0) {
      UniformGallery.sharedImageObserver?.disconnect()
      delete UniformGallery.sharedImageObserver
      UniformGallery.sharedRevealObserver?.disconnect()
      delete UniformGallery.sharedRevealObserver
      UniformGallery.sharedResizeObserver?.disconnect()
      delete UniformGallery.sharedResizeObserver
      UniformGallery.layoutRafPending = false
    }
    this.isInitialized = false
    this.cachedImageData = null
  }
}

if (!customElements.get('uniform-gallery')) {
  customElements.define('uniform-gallery', UniformGallery)
}
