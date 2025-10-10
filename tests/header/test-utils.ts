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
