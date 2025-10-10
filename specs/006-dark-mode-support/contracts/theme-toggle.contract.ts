/**
 * Contract: ThemeToggle Web Component
 *
 * Minimal interface for theme switching functionality.
 * Native CSS-driven approach with localStorage persistence.
 */

export type Theme = 'light' | 'dark'

/**
 * ThemeToggle Component Interface
 *
 * MUST extend HTMLElement
 * MUST be registered as 'theme-toggle' custom element
 */
export interface ThemeToggleElement extends HTMLElement {
  /**
   * Current active theme
   * Read-only property synced with localStorage and DOM attribute
   *
   * @returns 'light' | 'dark'
   */
  readonly currentTheme: Theme

  /**
   * Toggle between light and dark themes
   *
   * MUST:
   * - Switch currentTheme to opposite value
   * - Update localStorage('theme')
   * - Update document.documentElement.dataset.theme
   * - Dispatch 'theme:changed' event
   * - Complete within 100ms (constitutional requirement)
   */
  toggle(): void
}

/**
 * Theme Change Event
 *
 * Dispatched when theme is toggled
 * Event name: 'theme:changed'
 */
export interface ThemeChangeEvent extends CustomEvent {
  detail: {
    theme: Theme
    previousTheme: Theme
    timestamp: number
  }
}

/**
 * localStorage Contract
 *
 * Key: 'theme'
 * Value: 'light' | 'dark'
 *
 * MUST handle:
 * - Missing key → default to 'light'
 * - Invalid value → default to 'light'
 * - localStorage unavailable → session-only fallback (no error thrown)
 */
export interface ThemeStorage {
  /**
   * Get current theme from localStorage
   * Returns 'light' if not set or invalid
   */
  getTheme(): Theme

  /**
   * Set theme in localStorage and update DOM
   *
   * @param theme - 'light' | 'dark'
   * @throws Never (graceful degradation on storage errors)
   */
  setTheme(theme: Theme): void

  /**
   * Clear theme preference (revert to default 'light')
   */
  clearTheme(): void
}

/**
 * DOM Attribute Contract
 *
 * MUST set data-theme attribute on <html> element
 * CSS MUST use [data-theme="dark"] selector for overrides
 *
 * Example:
 * <html data-theme="light"> → light mode
 * <html data-theme="dark">  → dark mode
 */
export interface ThemeDOM {
  /**
   * Current theme attribute on document root
   * MUST be synchronized with localStorage
   */
  theme: Theme

  /**
   * MUST be set before first paint to prevent FOUC
   * Implemented via inline <script> in <head>
   */
  initializeTheme(): void
}

/**
 * Component Lifecycle Contract
 *
 * MUST implement standard Web Component lifecycle
 */
export interface ThemeToggleLifecycle {
  /**
   * Called when component is inserted into DOM
   *
   * MUST:
   * - Read currentTheme from localStorage
   * - Set initial button state (icon + aria-label)
   * - Attach click event listener
   */
  connectedCallback(): void

  /**
   * Called when component is removed from DOM
   *
   * MUST:
   * - Remove event listeners
   * - Clean up resources
   */
  disconnectedCallback(): void
}

/**
 * Accessibility Contract
 *
 * MUST meet WCAG 2.1 AA requirements
 */
export interface ThemeToggleAccessibility {
  /**
   * MUST have role="button"
   * MUST have aria-label describing current state
   * MUST have aria-pressed reflecting toggle state
   * MUST be keyboard accessible (Space/Enter to toggle)
   * MUST have visible focus indicator
   * MUST announce state changes to screen readers
   */
  ariaLabel: string
  ariaPressed: boolean
  role: 'button'
  tabIndex: 0
}

/**
 * Color Palette Contract
 *
 * CSS Custom Properties that MUST be defined
 */
export interface ThemeColors {
  // Light mode (default)
  light: {
    primary: string        // Text color
    secondary: string      // Secondary text
    accent: string         // Accent backgrounds
    pure: string           // Primary background
    interactive: string    // Links, buttons
    interactiveHover: string // Hover states
  }

  // Dark mode (overrides)
  dark: {
    primary: string        // MUST meet 4.5:1 contrast on dark.pure
    secondary: string      // MUST meet 4.5:1 contrast on dark.pure
    accent: string         // Dark variant
    pure: string           // Dark background
    interactive: string    // MUST meet 4.5:1 contrast on dark.pure
    interactiveHover: string // MUST meet 4.5:1 contrast on dark.pure
  }
}

/**
 * Performance Contract
 *
 * MUST meet constitutional performance requirements
 */
export interface ThemePerformance {
  /**
   * Theme toggle operation
   * MUST complete within 100ms
   * Measured from button click to DOM update
   */
  toggleDuration: number // < 100ms

  /**
   * Initial page load
   * MUST have zero FOUC (Flash of Unstyled Content)
   * Achieved via inline script before CSS parse
   */
  initialRenderDelay: 0

  /**
   * CSS transition duration
   * Visual-only, does not count toward 100ms requirement
   */
  transitionDuration: 250 // ms (from design system)
}

/**
 * Integration Points
 *
 * Where ThemeToggle component MUST be placed
 */
export interface ThemeToggleIntegration {
  /**
   * Desktop navigation
   * Location: Rightmost position in header nav
   * Parent: .header__navigation
   */
  desktopPlacement: {
    parent: '.header__navigation'
    position: 'last-child'
  }

  /**
   * Mobile menu
   * Location: Bottom of mobile menu overlay
   * Parent: .header__mobile-menu
   */
  mobilePlacement: {
    parent: '.header__mobile-menu'
    position: 'last-child'
  }
}
