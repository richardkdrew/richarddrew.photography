/**
 * ThemeToggle Test Utilities
 * Shared setup and utilities for theme-toggle tests
 */

import '../../src/components/theme-toggle/theme-toggle'

/**
 * Setup theme-toggle for testing
 * Creates element, appends to DOM, waits for initialization
 */
export function setupThemeToggle(): HTMLElement {
  // Clean up any existing theme-toggle elements
  document.querySelectorAll('theme-toggle').forEach(el => el.remove())

  // Create and append new element
  const element = document.createElement('theme-toggle')
  document.body.appendChild(element)

  return element
}

/**
 * Cleanup theme-toggle from DOM and localStorage
 */
export function cleanupThemeToggle(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }

  // Clean up localStorage
  localStorage.removeItem('theme')

  // Reset theme on document
  delete document.documentElement.dataset.theme
}
