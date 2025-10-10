/**
 * TypeScript Types: ThemeToggle Component
 *
 * Type definitions for dark mode theme toggle functionality.
 */

/**
 * Theme type - only two valid values
 */
export type Theme = 'light' | 'dark'

/**
 * ThemeToggle Web Component Interface
 */
export interface ThemeToggleElement extends HTMLElement {
  /**
   * Current active theme (readonly)
   * Reads from localStorage, defaults to 'light'
   */
  readonly currentTheme: Theme

  /**
   * Toggle between light and dark themes
   * Updates localStorage and DOM attribute
   */
  toggle(): void
}

/**
 * Theme Change Event
 * Dispatched when theme is toggled
 */
export interface ThemeChangeEvent extends CustomEvent {
  detail: {
    theme: Theme
    previousTheme: Theme
  }
}
