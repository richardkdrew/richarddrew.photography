/**
 * Header Test Utilities
 * Shared setup and utilities for header tests
 */

import { Header } from '../../src/components/header/header'

/**
 * Setup header for testing
 * Creates header element, appends to DOM, waits for initialization
 */
export async function setupHeader(): Promise<Header> {
  // Register custom element if not already registered
  if (!customElements.get('portfolio-header')) {
    customElements.define('portfolio-header', Header)
  }

  // JSDOM doesn't run layout, so scrollHeight defaults to 0. The header's
  // overscroll clamp treats scrollHeight as the scrollable page height, so
  // without this it looks like there's nothing to scroll and hide/show never
  // triggers. Simulate a page much taller than the viewport.
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 5000,
    writable: true,
    configurable: true
  })

  const header = document.createElement('portfolio-header') as Header
  document.body.appendChild(header)

  // Wait for connectedCallback to complete
  let attempts = 0
  while (!header.querySelector('.header') && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 10))
    attempts++
  }

  return header
}

/**
 * Cleanup header from DOM
 */
export function cleanupHeader(header: Header): void {
  if (header && header.parentNode) {
    header.parentNode.removeChild(header)
  }
}

export function simulateScroll(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true
  })
  window.dispatchEvent(new Event('scroll'))
}

export function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true
  })
}
