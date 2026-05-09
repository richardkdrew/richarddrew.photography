/**
 * Portfolio Header Component
 * Responsive header with branding and navigation
 */

import type { IHeader, BreakpointType } from './header.types'


export class Header extends HTMLElement implements IHeader {
  // Constants
  private static readonly MOBILE_BREAKPOINT = 768
  private static readonly DESKTOP_BREAKPOINT = 1200
  private static readonly RESIZE_DEBOUNCE = 100
  private static readonly SCROLL_THRESHOLD = 100

  // State
  private _initialized = false
  private _isMobileMenuOpen = false
  private _currentBreakpoint: BreakpointType = 'desktop'
  private mobileMenuButton: HTMLElement | null = null
  private mobileMenu: HTMLElement | null = null
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null
  private lastScrollY = 0
  private scrollDelta = 0
  private scrollEnabled = false
  private scrollListener: (() => void) | null = null

  // Static template (parsed once, cloned many times)
  private static template: HTMLTemplateElement | null = null

  private static initializeTemplate(): void {
    if (Header.template) return

    Header.template = document.createElement('template')
    Header.template.innerHTML = `
      <header class="header">
        <div class="header__container">
          <div class="header__branding">
            <a href="/" class="header__logo-link" aria-label="Richard Drew Portfolio Home">
              <!-- Light mode logo (dark.svg on light background) -->
              <img
                src="/images/branding/richard-drew-logo-dark.svg"
                alt=""
                class="header__logo header__logo--light"
              >
              <!-- Dark mode logo (light.svg on dark background) -->
              <img
                src="/images/branding/richard-drew-logo-light.svg"
                alt=""
                class="header__logo header__logo--dark"
              >
            </a>
          </div>

          <nav class="header__navigation" aria-label="Main navigation">
            <ul class="header__nav-list header__nav-list--desktop">
              <li class="header__nav-item">
                <a href="/about.html" class="header__nav-link">About</a>
              </li>
            </ul>

            <button
              class="header__mobile-toggle"
              aria-label="Toggle mobile menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <span class="header__hamburger">
                <span class="header__hamburger-line"></span>
                <span class="header__hamburger-line"></span>
                <span class="header__hamburger-line"></span>
              </span>
            </button>
          </nav>
        </div>

        <div class="header__mobile-menu" id="mobile-menu" aria-hidden="true">
          <nav class="header__mobile-nav" aria-label="Mobile navigation">
            <ul class="header__nav-list header__nav-list--mobile">
              <li class="header__nav-item">
                <a href="/about.html" class="header__nav-link">About</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    `
  }

  // Public getters (implementing IHeader interface)
  get isMobileMenuOpen(): boolean {
    return this._isMobileMenuOpen
  }

  get currentBreakpoint(): BreakpointType {
    return this._currentBreakpoint
  }

  static get observedAttributes() {
    return ['data-current-page']
  }

  connectedCallback() {
    this.initialize()
    this.updateActiveLink(this.dataset.currentPage ?? '')
  }

  disconnectedCallback() {
    this.destroy()
  }

  attributeChangedCallback(_name: string, _old: string, value: string): void {
    this.updateActiveLink(value ?? '')
  }

  // Public methods (implementing IHeader interface)
  initialize(): void {
    if (this._initialized) return
    this._initialized = true

    this.className = 'portfolio-header'

    // Initialize static template
    Header.initializeTemplate()

    // Clone template content
    const content = Header.template!.content.cloneNode(true) as DocumentFragment
    this.appendChild(content)

    // Cache DOM references
    this.mobileMenuButton = this.querySelector('.header__mobile-toggle')
    this.mobileMenu = this.querySelector('.header__mobile-menu')

    // Setup
    this.setupEventListeners()
    this.updateBreakpoint()

    // Dispatch initialization event
    this.dispatchEvent(new CustomEvent('header:initialized', { bubbles: true }))

    this.measureAndSetHeight()
    this.setupScrollBehavior()
  }

  private updateActiveLink(page: string): void {
    this.querySelectorAll<HTMLAnchorElement>('.header__nav-link').forEach(link => {
      const linkPage = (link.getAttribute('href') ?? '')
        .replace(/^\//, '')
        .replace(/\.html$/, '')
      if (linkPage === page) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
    })
  }

  destroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener)
      this.scrollListener = null
    }
    this.removeEventListeners()
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen = !this._isMobileMenuOpen
    this.updateMobileMenuState()

    // Dispatch toggle event
    this.dispatchEvent(new CustomEvent('header:mobile-menu-toggle', {
      detail: { isOpen: this._isMobileMenuOpen },
      bubbles: true
    }))
  }

  closeMobileMenu(): void {
    if (!this._isMobileMenuOpen) return

    this._isMobileMenuOpen = false
    this.updateMobileMenuState()

    this.lastScrollY = window.scrollY
    this.scrollDelta = 0

    // Dispatch toggle event
    this.dispatchEvent(new CustomEvent('header:mobile-menu-toggle', {
      detail: { isOpen: false },
      bubbles: true
    }))
  }

  handleResize(): void {
    const previousBreakpoint = this._currentBreakpoint
    this.updateBreakpoint()

    this.measureAndSetHeight()
    this.scrollEnabled = window.innerWidth >= Header.MOBILE_BREAKPOINT
    this.lastScrollY = window.scrollY
    if (!this.scrollEnabled) {
      this.showHeader()
      this.scrollDelta = 0
    }

    if (previousBreakpoint !== this._currentBreakpoint) {
      // Close mobile menu when switching to desktop
      if (this._currentBreakpoint === 'desktop' && this._isMobileMenuOpen) {
        this.closeMobileMenu()
      }

      // Dispatch breakpoint change event
      this.dispatchEvent(new CustomEvent('header:breakpoint-change', {
        detail: { previousBreakpoint, currentBreakpoint: this._currentBreakpoint },
        bubbles: true
      }))
    }
  }

  private measureAndSetHeight(): void {
    const height = this.getBoundingClientRect().height
    document.documentElement.style.setProperty('--header-height', `${height}px`)
  }

  private hideHeader(): void {
    this.classList.add('header--hidden')
    this.dispatchEvent(new CustomEvent('header:scroll-hide', { bubbles: true }))
  }

  private showHeader(): void {
    this.classList.remove('header--hidden')
    this.dispatchEvent(new CustomEvent('header:scroll-show', { bubbles: true }))
  }

  private setupScrollBehavior(): void {
    this.scrollEnabled = window.innerWidth >= Header.MOBILE_BREAKPOINT
    this.lastScrollY = window.scrollY
    this.scrollDelta = 0

    this.scrollListener = () => {
      if (!this.scrollEnabled) return

      // Clamp to [0, maxScrollY]: prevents rubber-band overscroll at either end
      // from poisoning lastScrollY and causing phantom hide/show transitions.
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight
      const currentY = Math.min(Math.max(0, window.scrollY), maxScrollY)

      // Guard must come BEFORE delta computation so overscroll spring-back
      // events (all clamped to currentY=0) cannot accumulate phantom downward delta.
      if (currentY === 0) {
        this.lastScrollY = 0
        this.showHeader()
        this.scrollDelta = 0
        return
      }

      const direction = currentY > this.lastScrollY ? 'down' : 'up'
      const delta = Math.abs(currentY - this.lastScrollY)

      if (direction === 'down') {
        this.scrollDelta = this.scrollDelta > 0 ? this.scrollDelta + delta : delta
      } else {
        this.scrollDelta = this.scrollDelta < 0 ? this.scrollDelta - delta : -delta
      }

      this.lastScrollY = currentY

      const isHidden = this.classList.contains('header--hidden')

      if (this.scrollDelta >= Header.SCROLL_THRESHOLD && !this._isMobileMenuOpen && !isHidden) {
        this.hideHeader()
      } else if (this.scrollDelta <= -Header.SCROLL_THRESHOLD && isHidden) {
        this.showHeader()
      }
    }

    window.addEventListener('scroll', this.scrollListener, { passive: true })
  }

  private setupEventListeners(): void {
    // Mobile menu toggle
    this.mobileMenuButton?.addEventListener('click', () => this.toggleMobileMenu())

    // Mobile menu link clicks
    this.mobileMenu?.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('header__nav-link')) {
        const href = target.getAttribute('href') || ''
        const label = target.textContent?.trim() || ''

        this.dispatchEvent(new CustomEvent('header:navigation-click', {
          detail: { label, href, isMobile: true },
          bubbles: true
        }))
      }
    })

    // Keyboard handling
    document.addEventListener('keydown', this.handleKeydown)

    // Resize handling
    window.addEventListener('resize', this.handleWindowResize)
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('resize', this.handleWindowResize)
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this._isMobileMenuOpen) {
      this.closeMobileMenu()
      this.mobileMenuButton?.focus()
    }
  }

  private handleWindowResize = (): void => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    this.resizeTimeout = setTimeout(() => this.handleResize(), Header.RESIZE_DEBOUNCE)
  }

  private updateMobileMenuState(): void {
    if (!this.mobileMenuButton || !this.mobileMenu) return

    // Update ARIA states
    this.mobileMenuButton.setAttribute('aria-expanded', String(this._isMobileMenuOpen))
    this.mobileMenu.setAttribute('aria-hidden', String(!this._isMobileMenuOpen))

    // Update classes for styling
    this.mobileMenuButton.classList.toggle('header__mobile-toggle--active', this._isMobileMenuOpen)
    this.mobileMenu.classList.toggle('header__mobile-menu--open', this._isMobileMenuOpen)
    document.body.classList.toggle('mobile-menu-open', this._isMobileMenuOpen)
    document.documentElement.classList.toggle('mobile-menu-open', this._isMobileMenuOpen)

    // Focus management
    if (this._isMobileMenuOpen) {
      const firstLink = this.mobileMenu.querySelector('.header__nav-link') as HTMLElement
      firstLink?.focus()
    }
  }

  private updateBreakpoint(): void {
    const width = window.innerWidth
    let newBreakpoint: BreakpointType

    if (width <= Header.MOBILE_BREAKPOINT) {
      newBreakpoint = 'mobile'
    } else if (width < Header.DESKTOP_BREAKPOINT) {
      newBreakpoint = 'tablet'
    } else {
      newBreakpoint = 'desktop'
    }

    this._currentBreakpoint = newBreakpoint
  }
}

// Register the custom element
if (!customElements.get('portfolio-header')) {
  customElements.define('portfolio-header', Header)
}