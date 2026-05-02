/**
 * ThemeToggle Web Component
 *
 * Minimal JavaScript for theme switching.
 * Follows constitutional principles: native CSS, no over-engineering.
 */

import type { Theme, ThemeChangeEvent, ThemeToggleElement } from './theme-toggle.types'
import './theme-toggle.css'

export class ThemeToggle extends HTMLElement implements ThemeToggleElement {
  private _currentTheme: Theme = 'light'

  /**
   * Current theme (readonly)
   * Reads from localStorage, defaults to 'light'
   */
  get currentTheme(): Theme {
    return this._currentTheme
  }

  /**
   * Component lifecycle: Connected to DOM
   */
  connectedCallback(): void {
    // Read initial theme from localStorage
    this._currentTheme = this.getThemeFromStorage()

    // Set initial state
    this.updateDOM()

    // Set ARIA attributes
    this.setAttribute('role', 'button')
    this.setAttribute('tabindex', '0')
    this.updateAriaAttributes()

    // Load template
    this.loadTemplate()

    // Attach event listeners
    this.addEventListener('click', () => this.toggle())
    this.addEventListener('keydown', this.handleKeydown)

    // Listen for storage events to sync across instances
    window.addEventListener('storage', this.handleStorageChange)

    // Listen for theme changes from other instances on same page
    document.addEventListener('theme:changed', this.handleThemeChanged)
  }

  /**
   * Component lifecycle: Disconnected from DOM
   */
  disconnectedCallback(): void {
    // Clean up event listeners
    this.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('storage', this.handleStorageChange)
    document.removeEventListener('theme:changed', this.handleThemeChanged)
  }

  /**
   * Toggle between light and dark themes
   */
  toggle(): void {
    const previousTheme = this._currentTheme
    this._currentTheme = this._currentTheme === 'light' ? 'dark' : 'light'

    // Update localStorage
    this.setThemeInStorage(this._currentTheme)

    // Update DOM
    this.updateDOM()

    // Update ARIA
    this.updateAriaAttributes()

    // Dispatch custom event
    this.dispatchThemeChangeEvent(previousTheme)
  }

  /**
   * Read theme from localStorage
   */
  private getThemeFromStorage(): Theme {
    const stored = localStorage.getItem('theme')

    // Validate and return
    if (stored === 'dark' || stored === 'light') {
      return stored
    }

    // Default to light for invalid/missing values
    return 'light'
  }

  /**
   * Save theme to localStorage
   */
  private setThemeInStorage(theme: Theme): void {
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      // Graceful degradation for private browsing mode
      console.warn('localStorage unavailable, theme will not persist')
    }
  }

  /**
   * Update DOM attribute (CSS uses this for theme switching)
   */
  private updateDOM(): void {
    document.documentElement.dataset.theme = this._currentTheme
  }

  /**
   * Update ARIA attributes for accessibility
   */
  private updateAriaAttributes(): void {
    const label = this._currentTheme === 'light'
      ? 'Switch to dark theme'
      : 'Switch to light theme'

    this.setAttribute('aria-label', label)
    this.setAttribute('aria-pressed', this._currentTheme === 'dark' ? 'true' : 'false')
  }

  /**
   * Load SVG icon template
   */
  private loadTemplate(): void {
    // Inline SVG icons (simple, no fetch needed)
    this.innerHTML = `
      <svg class="theme-toggle__icon theme-toggle__icon--sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <title>Sun icon - Switch to light mode</title>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>

      <svg class="theme-toggle__icon theme-toggle__icon--moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <title>Moon icon - Switch to dark mode</title>
        <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"></path>
      </svg>
    `
  }

  /**
   * Handle keyboard events (Space and Enter)
   */
  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault() // Prevent scroll on Space
      this.toggle()
    }
  }

  /**
   * Handle storage events (for cross-tab/window sync)
   */
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === 'theme' && (event.newValue === 'light' || event.newValue === 'dark')) {
      this._currentTheme = event.newValue
      this.updateDOM()
      this.updateAriaAttributes()
      // CSS handles icon visibility - no need to reload template
    }
  }

  /**
   * Handle theme changes from other instances on same page
   */
  private handleThemeChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<{ theme: Theme }>
    // Don't update self when own event is triggered
    if (customEvent.detail && customEvent.detail.theme !== this._currentTheme) {
      this._currentTheme = customEvent.detail.theme
      this.updateAriaAttributes()
      // CSS handles icon visibility - no need to reload template
    }
  }

  /**
   * Dispatch theme change event
   */
  private dispatchThemeChangeEvent(previousTheme: Theme): void {
    const event: ThemeChangeEvent = new CustomEvent('theme:changed', {
      detail: {
        theme: this._currentTheme,
        previousTheme
      },
      bubbles: true,
      composed: true
    })

    document.dispatchEvent(event)
  }
}

// Register custom element
customElements.define('theme-toggle', ThemeToggle)
