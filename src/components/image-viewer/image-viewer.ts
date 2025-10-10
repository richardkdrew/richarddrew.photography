/**
 * Image Viewer Component
 * Full-page image viewer with keyboard/touch navigation
 */

import './image-viewer.css'
import type { ViewerState, ImageData, NavigationEventDetail } from './image-viewer.types'
import { getResponsiveSizes } from '../../utils/responsive-picture'

export class ImageViewer extends HTMLElement {
  // Performance constants
  private static readonly SWIPE_THRESHOLD = 50
  private static readonly PRELOAD_ADJACENT = true

  private state: ViewerState = { active: false, currentIndex: 0, totalImages: 0, enabled: false }
  private images: ImageData[] = []
  private elements!: { container: HTMLElement; image: HTMLImageElement; counter: HTMLElement; prevBtn: HTMLButtonElement; nextBtn: HTMLButtonElement; closeBtn: HTMLButtonElement; loading: HTMLElement }
  private touchStartX = 0
  private touchStartY = 0
  private cachedSizes: string | null = null

  // Static template (parsed once, cloned many times)
  private static template: HTMLTemplateElement | null = null

  private static initializeTemplate(): void {
    if (ImageViewer.template) return

    ImageViewer.template = document.createElement('template')
    ImageViewer.template.innerHTML = `
      <article class="image-viewer" data-state="inactive">
        <!-- Close Button - Floating Overlay (Top Right) -->
        <button class="viewer__close" data-close aria-label="Close image viewer" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Counter - Floating Overlay (Bottom Center) -->
        <span class="viewer__counter" data-counter aria-live="polite" aria-atomic="true">
          Image 1 of 1
        </span>

        <figure class="viewer__content">
          <!-- Loading Spinner -->
          <div class="viewer__loading" data-loading aria-live="polite" aria-label="Loading image">
            <svg class="viewer__spinner" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="31.4 31.4" />
            </svg>
          </div>

          <div class="viewer__image-container">
            <picture>
              <source type="image/webp" srcset="" data-webp-srcset>
              <img
                class="viewer__image"
                src=""
                srcset=""
                alt=""
                loading="eager"
                fetchpriority="high"
                data-image
              >
            </picture>
          </div>

          <button class="viewer__nav viewer__nav--prev" data-prev aria-label="Previous image" type="button" disabled>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button class="viewer__nav viewer__nav--next" data-next aria-label="Next image" type="button">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </figure>
      </article>
    `
  }

  connectedCallback() {
    try {
      this.className = 'image-viewer'
      this.setAttribute('role', 'dialog')
      this.setAttribute('aria-label', 'Image viewer')
      this.setAttribute('aria-modal', 'true')

      // Initialize static template
      ImageViewer.initializeTemplate()

      // Clone template content
      const content = ImageViewer.template!.content.cloneNode(true) as DocumentFragment
      this.appendChild(content)

      // Initialize elements with validation
      this.initializeElements()

      // Set up event listeners
      this.setupEventListeners()

      // Initialize images from data attribute if present
      const imagesData = this.getAttribute('data-images')
      if (imagesData) {
        try {
          this.setImages(JSON.parse(imagesData))
        } catch (e) {
          console.error('Failed to parse data-images attribute:', e)
          this.dispatchEvent(new CustomEvent('viewer:error', {
            detail: { error: new Error('Invalid data-images attribute') },
            bubbles: true
          }))
        }
      }
    } catch (error) {
      console.error('Failed to initialize image viewer:', error)
      this.dispatchEvent(new CustomEvent('viewer:error', {
        detail: { error },
        bubbles: true
      }))
    }
  }

  private initializeElements(): void {
    const requiredElements = {
      image: '[data-image]',
      counter: '[data-counter]',
      prevBtn: '[data-prev]',
      nextBtn: '[data-next]',
      closeBtn: '[data-close]',
      loading: '[data-loading]'
    }

    const elements: any = { container: this }

    for (const [key, selector] of Object.entries(requiredElements)) {
      const element = this.querySelector(selector)
      if (!element) {
        throw new Error(`Required element not found: ${selector}`)
      }
      elements[key] = element
    }

    this.elements = elements
  }

  private setupEventListeners(): void {
    if (!this.elements) {
      throw new Error('Elements not initialized')
    }

    try {
      this.elements.closeBtn.addEventListener('click', () => this.close())
      this.elements.prevBtn.addEventListener('click', () => this.prev())
      this.elements.nextBtn.addEventListener('click', () => this.next())
      this.addEventListener('keydown', this.handleKeydown)
      this.addEventListener('touchstart', this.handleTouchStart, { passive: true })
      this.addEventListener('touchend', this.handleTouchEnd, { passive: true })
    } catch (error) {
      console.error('Failed to set up event listeners:', error)
      throw error
    }
  }

  disconnectedCallback() {
    // Clean up event listeners
    this.removeEventListener('keydown', this.handleKeydown)
    this.removeEventListener('touchstart', this.handleTouchStart)
    this.removeEventListener('touchend', this.handleTouchEnd)

    // Clean up preload links
    document.querySelectorAll('link[rel="preload"][data-viewer]').forEach(el => el.remove())

    // Restore scroll if viewer was active
    if (this.state.active) {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }

    // Clear cached references
    this.cachedSizes = null
    this.images = []

    // Reset state
    this.state = { active: false, currentIndex: 0, totalImages: 0, enabled: false }
  }

  open(index: number) {
    if (index < 0) throw new RangeError('Index cannot be negative')
    if (index >= this.state.totalImages) throw new RangeError('Index out of bounds')
    if (!this.state.enabled) throw new Error('Viewer disabled in single-column layout')

    this.state.active = true
    this.state.currentIndex = index
    this.setAttribute('data-state', 'active')

    // Update inner article element state
    const article = this.querySelector('.image-viewer')
    if (article) article.setAttribute('data-state', 'active')

    // Lock scroll on both html and body (some browsers scroll html instead of body)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    this.updateImage()
    this.updateButtons()

    this.dispatchEvent(new CustomEvent('viewer:open', { detail: { index }, bubbles: true }))
  }

  close() {
    if (!this.state.active) return

    const fromIndex = this.state.currentIndex
    this.state.active = false
    this.setAttribute('data-state', 'inactive')

    // Update inner article element state
    const article = this.querySelector('.image-viewer')
    if (article) article.setAttribute('data-state', 'inactive')

    // Unlock scroll on both html and body
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''

    document.querySelectorAll('link[rel="preload"][data-viewer]').forEach(el => el.remove())

    this.dispatchEvent(new CustomEvent('viewer:close', { detail: { fromIndex }, bubbles: true }))
  }

  next() {
    this.navigateToDirection('next', 'button')
  }

  prev() {
    this.navigateToDirection('prev', 'button')
  }

  private navigateToDirection(direction: 'next' | 'prev', trigger: NavigationEventDetail['trigger']) {
    if (!this.state.active) return
    
    const newIndex = direction === 'next' 
      ? this.state.currentIndex + 1 
      : this.state.currentIndex - 1
    
    // Check bounds
    if (newIndex < 0 || newIndex >= this.state.totalImages) return
    
    this.navigate(newIndex, direction, trigger)
  }

  getState(): ViewerState {
    return { ...this.state }
  }

  setImages(images: ImageData[]) {
    this.images = images
    this.state.totalImages = images.length
  }

  setEnabled(enabled: boolean) {
    this.state.enabled = enabled
    if (this.state.active && !enabled) this.close()
    this.dispatchEvent(new CustomEvent('viewer:enabled', { detail: { enabled }, bubbles: true }))
  }

  private navigate(toIndex: number, direction: 'next' | 'prev', trigger: NavigationEventDetail['trigger']) {
    const fromIndex = this.state.currentIndex

    // Update image instantly - no transitions
    this.state.currentIndex = toIndex
    this.updateImage()
    this.updateButtons()

    this.dispatchEvent(new CustomEvent('viewer:navigate', { detail: { direction, fromIndex, toIndex, trigger }, bubbles: true }))
  }

  private updateImage() {
    const img = this.images[this.state.currentIndex]
    if (!img || !this.elements) return

    // Show loading spinner
    this.elements.loading.setAttribute('data-state', 'active')
    this.elements.image.style.opacity = '0'

    // Get sizes string for viewer context (full viewport width)
    if (!this.cachedSizes) {
      this.cachedSizes = getResponsiveSizes('viewer')
    }

    // Determine orientation from image dimensions
    const aspectRatio = img.width / img.height
    const orientation = aspectRatio > 1.1 ? 'landscape'
      : aspectRatio < 0.9 ? 'portrait' : 'square'

    // Update image sources directly
    this.elements.image.srcset = img.srcset || ''
    this.elements.image.sizes = this.cachedSizes
    this.elements.image.src = img.src
    this.elements.image.alt = img.alt
    this.elements.image.setAttribute('data-orientation', orientation)

    // Update WebP source with srcset and sizes
    const webpSource = this.querySelector('source[type="image/webp"]') as HTMLSourceElement
    if (webpSource && img.webpSrcset) {
      webpSource.srcset = img.webpSrcset
      webpSource.sizes = this.cachedSizes
    }

    // Update counter
    this.elements.counter.textContent = `Image ${this.state.currentIndex + 1} of ${this.state.totalImages}`

    // Handle image load
    this.elements.image.onload = () => {
      this.elements.loading.removeAttribute('data-state')
      this.elements.image.style.opacity = '1'
    }

    // Handle image error - show error state without auto-navigation
    this.elements.image.onerror = () => {
      this.elements.loading.removeAttribute('data-state')
      this.elements.image.style.opacity = '1'
      this.elements.image.alt = `Failed to load: ${img.alt}`
      this.dispatchEvent(new CustomEvent('viewer:error', {
        detail: { index: this.state.currentIndex, error: new Error('Image failed to load') },
        bubbles: true
      }))
    }

    if (ImageViewer.PRELOAD_ADJACENT) this.preloadAdjacentImages()
  }

  private updateButtons() {
    if (!this.elements) return

    const atFirst = this.state.currentIndex === 0
    const atLast = this.state.currentIndex === this.state.totalImages - 1

    this.elements.prevBtn.disabled = atFirst
    this.elements.prevBtn.setAttribute('aria-disabled', String(atFirst))
    this.elements.nextBtn.disabled = atLast
    this.elements.nextBtn.setAttribute('aria-disabled', String(atLast))
  }

  private preloadAdjacentImages() {
    // Clean up any existing preload links
    document.querySelectorAll('link[rel="preload"][data-viewer]').forEach(el => el.remove())

    const preload = (index: number) => {
      if (index >= 0 && index < this.state.totalImages) {
        const img = this.images[index]
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = img.src
        if (img.srcset) link.setAttribute('imagesrcset', img.srcset)
        link.setAttribute('data-viewer', 'true')
        document.head.appendChild(link)
      }
    }

    // Preload adjacent images
    preload(this.state.currentIndex - 1)
    preload(this.state.currentIndex + 1)
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.state.active) return
    
    if (e.key === 'ArrowRight') { 
      e.preventDefault()
      this.navigateToDirection('next', 'keyboard')
    }
    else if (e.key === 'ArrowLeft') { 
      e.preventDefault()
      this.navigateToDirection('prev', 'keyboard')
    }
    else if (e.key === 'Escape') { 
      e.preventDefault()
      this.close()
    }
    else if (e.key === 'Tab') {
      this.handleTabTrap(e)
    }
  }

  private handleTabTrap(e: KeyboardEvent) {
    const focusable = Array.from(this.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  private handleTouchStart = (e: TouchEvent) => {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
  }

  private handleTouchEnd = (e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - this.touchStartX
    const deltaY = Math.abs(e.changedTouches[0].clientY - this.touchStartY)

    if (Math.abs(deltaX) > ImageViewer.SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
      const direction = deltaX > 0 ? 'prev' : 'next'
      this.navigateToDirection(direction, 'swipe')
    }
  }

}

if (!customElements.get('image-viewer')) {
  customElements.define('image-viewer', ImageViewer)
}
