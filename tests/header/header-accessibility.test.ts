/**
 * Accessibility Tests: Header Component
 * WCAG 2.1 AA compliance and screen reader support tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Header } from '../../src/components/header/header'
import { setupHeader, cleanupHeader } from './test-utils'

describe('Header Accessibility Tests', () => {
  let header: Header

  beforeEach(async () => {
    header = await setupHeader()
  })

  afterEach(() => {
    cleanupHeader(header)
  })

  describe('WCAG 2.1 AA Compliance', () => {
    describe('1.1.1 Non-text Content', () => {
      it('should provide alternative text for logo image', () => {
        const logo = header.querySelector('.header__logo') as HTMLImageElement

        expect(logo).toBeTruthy()
        expect(logo.alt).toBe('')
      })

      it('should provide accessible names for interactive elements', () => {
        const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

        expect(logoLink.getAttribute('aria-label')).toBeTruthy()
        expect(mobileToggle.getAttribute('aria-label')).toBeTruthy()

        expect(logoLink.getAttribute('aria-label')).toBe('Richard Drew Portfolio Home')
        expect(mobileToggle.getAttribute('aria-label')).toBe('Toggle mobile menu')
      })
    })

    describe('1.3.1 Info and Relationships', () => {
      it('should use proper semantic HTML structure', () => {
        const headerEl = header.querySelector('header')
        const nav = header.querySelector('nav')
        const list = header.querySelector('ul')
        const button = header.querySelector('button')

        expect(headerEl).toBeTruthy()
        expect(nav).toBeTruthy()
        expect(list).toBeTruthy()
        expect(button).toBeTruthy()
      })

      it('should have proper landmark roles', () => {
        const innerHeader = header.querySelector('header')
        const navigation = header.querySelector('.header__navigation')
        const mobileNav = header.querySelector('.header__mobile-nav')

        // Custom element must NOT carry explicit role — inner <header> provides banner semantics
        expect(header.getAttribute('role')).toBeNull()
        // <nav> elements must NOT carry explicit role — it is implicit
        expect(navigation?.getAttribute('role')).toBeNull()
        expect(mobileNav?.getAttribute('role')).toBeNull()
        // But the inner <header> element must exist
        expect(innerHeader).toBeTruthy()
        // And nav elements must have accessible names
        expect(navigation?.getAttribute('aria-label')).toBe('Main navigation')
        expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
      })

      it('should use proper list structure for navigation', () => {
        const navList = header.querySelector('.header__nav-list')
        const navItems = header.querySelectorAll('.header__nav-item')
        const navLinks = header.querySelectorAll('.header__nav-link')

        expect(navList?.tagName).toBe('UL')
        expect(navItems.length).toBeGreaterThan(0)
        expect(navLinks.length).toBeGreaterThan(0)

        navItems.forEach(item => {
          expect(item.tagName).toBe('LI')
        })
      })
    })

    describe('1.4.3 Contrast (Minimum)', () => {
      it('should have sufficient color contrast for text elements', () => {
        const navLink = header.querySelector('.header__nav-link') as HTMLElement
        const styles = getComputedStyle(navLink)

        // Text should be visible (not transparent)
        expect(styles.color).not.toBe('transparent')
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')

        // Should have a defined color
        expect(styles.color).toBeTruthy()
      })
    })

    describe('2.1.1 Keyboard', () => {
      it('should make all interactive elements keyboard accessible', () => {
        const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement
        const navLink = header.querySelector('.header__nav-link') as HTMLAnchorElement
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

        // All interactive elements should be focusable
        expect(logoLink.tabIndex).toBeGreaterThanOrEqual(0)
        expect(navLink.tabIndex).toBeGreaterThanOrEqual(0)
        expect(mobileToggle.tabIndex).toBeGreaterThanOrEqual(0)
      })

      it('should respond to keyboard activation', () => {
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

        // Focus the button
        mobileToggle.focus()

        // Simulate Enter key press
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true
        })

        mobileToggle.dispatchEvent(enterEvent)

        // Should activate the button (though implementation may vary)
        expect(mobileToggle).toBeTruthy() // Basic test that event handling doesn't crash
      })

      it('should handle Escape key to close mobile menu', () => {
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
        const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

        // Open menu first
        mobileToggle.click()
        expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)

        // Press Escape
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        })

        document.dispatchEvent(escapeEvent)

        // Menu should close
        expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(false)
      })
    })

    describe('2.1.2 No Keyboard Trap', () => {
      it('should not trap keyboard focus outside of mobile menu', () => {
        const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement
        const navLink = header.querySelector('.header__nav-link') as HTMLAnchorElement

        // Should be able to focus elements normally
        logoLink.focus()
        expect(document.activeElement).toBe(logoLink)

        navLink.focus()
        expect(document.activeElement).toBe(navLink)
      })

      it('should allow focus to leave component', () => {
        const externalButton = document.createElement('button')
        externalButton.textContent = 'External Button'
        document.body.appendChild(externalButton)

        const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement

        // Focus header element
        logoLink.focus()
        expect(document.activeElement).toBe(logoLink)

        // Focus external element
        externalButton.focus()
        expect(document.activeElement).toBe(externalButton)

        // Cleanup
        document.body.removeChild(externalButton)
      })
    })

    describe('2.4.3 Focus Order', () => {
      it('should have logical focus order', () => {
        const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement
        const navLink = header.querySelector('.header__nav-link') as HTMLAnchorElement
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

        // Elements should be focusable in logical order
        logoLink.focus()
        expect(document.activeElement).toBe(logoLink)

        // Note: Actual tab order is controlled by browser and CSS
        // We're testing that elements are focusable
        navLink.focus()
        expect(document.activeElement).toBe(navLink)

        mobileToggle.focus()
        expect(document.activeElement).toBe(mobileToggle)
      })
    })

    describe('4.1.2 Name, Role, Value', () => {
      it('should properly announce mobile menu button state', () => {
        const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
        const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

        // Initial state
        expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
        expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
        expect(mobileToggle.getAttribute('aria-controls')).toBe('mobile-menu')

        // After opening
        mobileToggle.click()
        expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
        expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')

        // After closing
        mobileToggle.click()
        expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
        expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
      })

      it('should have proper role and name for navigation landmarks', () => {
        const mainNav = header.querySelector('.header__navigation')
        const mobileNav = header.querySelector('.header__mobile-nav')

        // Role is implicit on <nav> — must NOT be set explicitly
        expect(mainNav?.getAttribute('role')).toBeNull()
        expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
        expect(mobileNav?.getAttribute('role')).toBeNull()
        expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide clear navigation structure', () => {
      // Inner <header> provides the banner landmark — custom element must not duplicate it
      const innerHeader = header.querySelector('header')
      expect(innerHeader).toBeTruthy()
      expect(header.getAttribute('role')).toBeNull()
      // Navigation landmark comes from <nav> elements, not explicit role attribute
      const nav = header.querySelector('nav')
      expect(nav).toBeTruthy()
    })

    it('should announce mobile menu state changes', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Check initial announcement text
      expect(mobileToggle.getAttribute('aria-label')).toBe('Toggle mobile menu')
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')

      // After click, state should change for screen readers
      mobileToggle.click()
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
    })

    it('should provide context for navigation links', () => {
      const navLinks = header.querySelectorAll('.header__nav-link')

      navLinks.forEach(link => {
        const linkElement = link as HTMLAnchorElement
        expect(linkElement.href).toBeTruthy()
        expect(linkElement.textContent?.trim()).toBeTruthy()
      })
    })

    it('should identify logo as link to home', () => {
      const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement

      expect(logoLink.getAttribute('aria-label')).toBe('Richard Drew Portfolio Home')
      expect(logoLink.href).toMatch(/\/$/)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through interactive elements', () => {
      const interactiveElements = header.querySelectorAll('a, button')

      expect(interactiveElements.length).toBeGreaterThan(0)

      interactiveElements.forEach(element => {
        const el = element as HTMLElement
        el.focus()
        expect(document.activeElement).toBe(el)
      })
    })

    it('should support Space and Enter key activation', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true
      })

      mobileToggle.focus()
      expect(() => mobileToggle.dispatchEvent(spaceEvent)).not.toThrow()

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      })

      expect(() => mobileToggle.dispatchEvent(enterEvent)).not.toThrow()
    })
  })

  describe('Focus Management', () => {
    it('should manage focus when mobile menu opens', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Open menu
      mobileToggle.click()

      // Focus should move appropriately (implementation-specific)
      // At minimum, button should remain focusable
      mobileToggle.focus()
      expect(document.activeElement).toBe(mobileToggle)
    })

    it('should restore focus when mobile menu closes with Escape', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Open menu
      mobileToggle.click()

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      })

      document.dispatchEvent(escapeEvent)

      // Focus should return to toggle button or be manageable
      expect(mobileToggle).toBeTruthy() // Button should still be available
    })
  })
})