/**
 * About Page Component
 * Self-contained web component with inline template
 *
 * Design: Simplified component with inline template for consistency with
 * other components (Header, ThemeToggle) - no async loading needed.
 */

import './about-page.css'

export class AboutPage extends HTMLElement {
  private isInitialized = false

  connectedCallback() {
    this.className = 'about-page'
    this.setAttribute('role', 'main')
    this.setAttribute('aria-label', 'About page')

    this.loadTemplate()
  }

  private loadTemplate(): void {
    if (this.isInitialized) return

    // Check if content is already present
    if (this.querySelector('.about-hero')) {
      this.isInitialized = true
      this.dispatchEvent(new CustomEvent('about:loaded'))
      return
    }

    // Inline template (consistent with Header/ThemeToggle pattern)
    this.innerHTML = `
      <section class="about-hero">
        <div class="about-hero__content">
          <div class="about-hero__image-container">
            <picture>
              <source
                type="image/webp"
                srcset="/images/about/professional-headshot-400.webp 400w,
                        /images/about/professional-headshot-600.webp 600w,
                        /images/about/professional-headshot-800.webp 800w"
                sizes="(max-width: 32rem) 100vw, (max-width: 48rem) 50vw, (max-width: 56rem) 40vw, (max-width: 80rem) 35vw, 30vw">
              <img
                class="about-hero__image"
                src="https://picsum.photos/400/600?random=1"
                alt="Professional headshot portrait"
                loading="eager"
                fetchpriority="high"
                width="400"
                height="600">
            </picture>
          </div>
          <div class="about-hero__text">
            <p class="about-hero__summary professional-summary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      </section>
    `

    this.isInitialized = true
    this.dispatchEvent(new CustomEvent('about:loaded'))

    // Hide loading fallback if present
    const loadingFallback = this.querySelector('.about-loading-fallback')
    if (loadingFallback) {
      loadingFallback.remove()
    }
  }
}

// Register the custom element
if (!customElements.get('about-page')) {
  customElements.define('about-page', AboutPage)
}
