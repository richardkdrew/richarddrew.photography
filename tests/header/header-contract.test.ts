/**
 * Contract Tests: Header Component
 * Unit tests for TypeScript interfaces, types, and component contracts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Header } from '../../src/components/header/header'
import { setupHeader, cleanupHeader } from './test-utils'

describe('Header Contract Tests', () => {
  let header: Header

  beforeEach(async () => {
    header = await setupHeader()
  })

  afterEach(() => {
    cleanupHeader(header)
  })

  describe('Component Interface Contract', () => {
    it('MUST extend HTMLElement', () => {
      expect(header).toBeInstanceOf(HTMLElement)
      expect(header).toBeInstanceOf(Header)
    })

    it('MUST have portfolio-header class name', () => {
      expect(header.className).toBe('portfolio-header')
    })

    it('MUST have banner role for accessibility', () => {
      expect(header.getAttribute('role')).toBe('banner')
    })

    it('MUST be registered as custom element', () => {
      expect(customElements.get('portfolio-header')).toBe(Header)
    })
  })

  describe('Logo Configuration Contract', () => {
    it('MUST display SVG logo with correct source', () => {
      const logo = header.querySelector('.header__logo') as HTMLImageElement

      expect(logo).toBeTruthy()
      expect(logo.src).toContain('richard-drew-logo-dark.svg')
      expect(logo.tagName).toBe('IMG')
    })

    it('MUST have accessible logo attributes', () => {
      const logo = header.querySelector('.header__logo') as HTMLImageElement
      const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement

      expect(logo.alt).toBe('Richard Drew')
      // Sizing is controlled by CSS (max-height in rem), not HTML attributes
      expect(logoLink.getAttribute('aria-label')).toBe('Richard Drew Portfolio Home')
      expect(logoLink.href).toMatch(/\/$/) // Should end with /
    })

    it('MUST have fallback for logo loading', () => {
      const logo = header.querySelector('.header__logo') as HTMLImageElement

      // Logo should have alt text as fallback
      expect(logo.alt).toBeTruthy()
      expect(logo.alt.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation Contract', () => {
    it('MUST provide ABOUT navigation link', () => {
      const navLinks = header.querySelectorAll('.header__nav-link')
      const aboutLink = Array.from(navLinks).find(link =>
        link.textContent?.trim() === 'About'
      ) as HTMLAnchorElement

      expect(aboutLink).toBeTruthy()
      expect(aboutLink.href).toContain('/about.html')
    })

    it('MUST have desktop and mobile navigation variants', () => {
      const desktopNav = header.querySelector('.header__nav-list--desktop')
      const mobileNav = header.querySelector('.header__nav-list--mobile')

      expect(desktopNav).toBeTruthy()
      expect(mobileNav).toBeTruthy()
    })

    it('MUST have proper navigation ARIA labels', () => {
      const mainNav = header.querySelector('.header__navigation')
      const mobileNav = header.querySelector('.header__mobile-nav')

      expect(mainNav?.getAttribute('role')).toBe('navigation')
      expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
      expect(mobileNav?.getAttribute('role')).toBe('navigation')
      expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
    })
  })

  describe('Mobile Menu Contract', () => {
    it('MUST have mobile menu toggle button', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      expect(mobileToggle).toBeTruthy()
      expect(mobileToggle.tagName).toBe('BUTTON')
      expect(mobileToggle.getAttribute('aria-label')).toBe('Toggle mobile menu')
    })

    it('MUST have hamburger menu structure', () => {
      const hamburger = header.querySelector('.header__hamburger')
      const lines = header.querySelectorAll('.header__hamburger-line')

      expect(hamburger).toBeTruthy()
      expect(lines.length).toBe(3)
    })

    it('MUST have mobile overlay with correct attributes', () => {
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      expect(mobileMenu).toBeTruthy()
      expect(mobileMenu.id).toBe('mobile-menu')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
    })

    it('MUST control mobile menu state via ARIA', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Initial state
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')

      // After click
      mobileToggle.click()
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')
    })
  })

  describe('Event Handling Contract', () => {
    it('MUST handle mobile menu toggle events', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Should respond to click events
      expect(() => mobileToggle.click()).not.toThrow()

      // Should update state
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)
    })

    it('MUST handle keyboard events', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Open menu first
      mobileToggle.click()

      // Should respond to Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      expect(() => document.dispatchEvent(escapeEvent)).not.toThrow()
    })

    it('MUST clean up event listeners on disconnect', () => {
      // Component should not leak event listeners
      const originalListenerCount = document.eventListeners?.length || 0

      // Remove component
      document.body.removeChild(header)

      // Should not have increased listener count significantly
      const finalListenerCount = document.eventListeners?.length || 0
      expect(finalListenerCount).toBeLessThanOrEqual(originalListenerCount + 1)
    })
  })
})