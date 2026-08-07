/**
 * UI Tests: Header Component
 * User interface behavior and visual presentation tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Header } from '../../src/components/header/header'
import { setupHeader, cleanupHeader, simulateScroll, setViewportWidth } from './test-utils'

// Mock fetch for any potential resource requests
global.fetch = vi.fn()

describe('Header UI Tests', () => {
  let header: Header

  beforeEach(async () => {
    header = await setupHeader()
    header.setAttribute('data-current-page', 'home')
  })

  afterEach(() => {
    cleanupHeader(header)
    vi.clearAllMocks()
  })

  describe('Component Structure', () => {
    it('should render header with correct class and no explicit role', () => {
      expect(header.getAttribute('role')).toBeNull()
      expect(header.className).toBe('portfolio-header')
    })

    it('should display logo with correct attributes', () => {
      const logo = header.querySelector('.header__logo') as HTMLImageElement

      expect(logo).toBeTruthy()
      expect(logo.src).toContain('richard-drew-logo-dark.svg')
      expect(logo.alt).toBe('')
      // Sizing is controlled by CSS (max-height in rem), not HTML attributes
    })

    it('should have navigation with About link', () => {
      const navLink = header.querySelector('.header__nav-link')

      expect(navLink).toBeTruthy()
      expect(navLink?.textContent?.trim()).toBe('About')
      expect(navLink?.getAttribute('href')).toBe('/about.html')
    })

    it('should have mobile menu toggle', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle')

      expect(mobileToggle).toBeTruthy()
      expect(mobileToggle?.getAttribute('aria-label')).toBe('Toggle mobile menu')
      expect(mobileToggle?.getAttribute('aria-expanded')).toBe('false')
    })

    it('should have mobile menu overlay', () => {
      const mobileMenu = header.querySelector('.header__mobile-menu')

      expect(mobileMenu).toBeTruthy()
      expect(mobileMenu?.getAttribute('id')).toBe('mobile-menu')
      expect(mobileMenu?.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('Mobile Menu Functionality', () => {
    it('should toggle mobile menu when button is clicked', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Initially closed
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')

      // Click to open
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)

      // Click to close
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
    })

    it('should NOT close mobile menu when nav link is clicked (multi-page behavior)', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement
      const mobileNavLink = mobileMenu.querySelector('.header__nav-link') as HTMLElement

      // Open menu first
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')

      // Click nav link - menu should stay open
      mobileNavLink.click()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')
      expect(header.isMobileMenuOpen).toBe(true)
    })

    it('should close mobile menu when Escape key is pressed', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Open menu first
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('Responsive Behavior', () => {
    it('should have both desktop and mobile navigation elements', () => {
      const desktopNav = header.querySelector('.header__nav-list--desktop')
      const mobileNav = header.querySelector('.header__nav-list--mobile')

      expect(desktopNav).toBeTruthy()
      expect(mobileNav).toBeTruthy()
    })

    it('should have hamburger menu structure', () => {
      const hamburger = header.querySelector('.header__hamburger')
      const lines = header.querySelectorAll('.header__hamburger-line')

      expect(hamburger).toBeTruthy()
      expect(lines.length).toBe(3)
    })

    it('should hide desktop navigation on mobile viewport', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      header.handleResize()

      const desktopNav = header.querySelector('.header__nav-list--desktop')
      const mobileToggle = header.querySelector('.header__mobile-toggle')

      // Desktop nav should exist but be hidden via CSS
      expect(desktopNav).toBeTruthy()
      expect(mobileToggle).toBeTruthy()

      // Verify breakpoint was updated correctly
      expect(header.currentBreakpoint).toBe('mobile')

      // The CSS classes should be present (CSS handles visibility)
      expect(desktopNav?.classList.contains('header__nav-list--desktop')).toBe(true)
      expect(mobileToggle?.classList.contains('header__mobile-toggle')).toBe(true)
    })

    it('should show desktop navigation on desktop viewport', () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
      header.handleResize()

      const desktopNav = header.querySelector('.header__nav-list--desktop')
      const mobileToggle = header.querySelector('.header__mobile-toggle')

      expect(desktopNav).toBeTruthy()
      expect(mobileToggle).toBeTruthy()

      // Verify breakpoint was updated correctly
      expect(header.currentBreakpoint).toBe('desktop')

      // The CSS classes should be present (CSS handles visibility)
      expect(desktopNav?.classList.contains('header__nav-list--desktop')).toBe(true)
      expect(mobileToggle?.classList.contains('header__mobile-toggle')).toBe(true)
    })
  })

  describe('Visual Presentation', () => {
    it('should have proper CSS classes for styling', () => {
      const headerElement = header.querySelector('.header')
      const logoLink = header.querySelector('.header__logo-link')
      const navigation = header.querySelector('.header__navigation')

      expect(headerElement).toBeTruthy()
      expect(logoLink).toBeTruthy()
      expect(navigation).toBeTruthy()
    })

    it('should have proper hamburger menu styling classes', () => {
      const hamburger = header.querySelector('.header__hamburger')
      const lines = header.querySelectorAll('.header__hamburger-line')

      expect(hamburger).toBeTruthy()
      lines.forEach(line => {
        expect(line.classList.contains('header__hamburger-line')).toBe(true)
      })
    })

    it('should apply open state classes when mobile menu is active', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Open menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)
    })

    it('should show mobile menu overlay when hamburger is clicked', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      header.handleResize()

      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Initially, mobile menu should be hidden
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(false)
      expect(header.isMobileMenuOpen).toBe(false)

      // Check initial ARIA states
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')

      // Click hamburger to open menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50)) // Allow for state updates

      // Mobile menu should have open class and correct state
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)
      expect(header.isMobileMenuOpen).toBe(true)

      // Check ARIA states updated correctly
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')
    })

    it('should hide mobile menu overlay when hamburger is clicked again', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      // Open menu first
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(true)
      expect(header.isMobileMenuOpen).toBe(true)

      // Click again to close
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Menu should be closed
      expect(mobileMenu.classList.contains('header__mobile-menu--open')).toBe(false)
      expect(header.isMobileMenuOpen).toBe(false)

      // Check ARIA states updated correctly
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')
    })

    it('should prevent body scroll when mobile menu is open', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const body = document.body

      // Open mobile menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Body should have mobile-menu-open class to prevent scrolling
      expect(body.classList.contains('mobile-menu-open')).toBe(true)

      // Close mobile menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Body should not have the class anymore
      expect(body.classList.contains('mobile-menu-open')).toBe(false)
    })

    it('should update hamburger icon animation when menu opens', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Initially, toggle should not have active class
      expect(mobileToggle.classList.contains('header__mobile-toggle--active')).toBe(false)

      // Open menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Toggle should have active class for hamburger->cross animation
      expect(mobileToggle.classList.contains('header__mobile-toggle--active')).toBe(true)

      // Close menu
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // Toggle should not have active class
      expect(mobileToggle.classList.contains('header__mobile-toggle--active')).toBe(false)
    })
  })

  describe('Scroll Hide/Show Behavior', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
      setViewportWidth(1024)
      header.handleResize()
    })

    it('should add header--hidden after 101px of downward scroll', () => {
      simulateScroll(101)

      expect(header.classList.contains('header--hidden')).toBe(true)
    })

    it('should NOT add header--hidden after only 99px of downward scroll', () => {
      simulateScroll(99)

      expect(header.classList.contains('header--hidden')).toBe(false)
    })

    it('should remove header--hidden after 101px of upward scroll', () => {
      simulateScroll(200)
      expect(header.classList.contains('header--hidden')).toBe(true)

      simulateScroll(99)

      expect(header.classList.contains('header--hidden')).toBe(false)
    })

    it('should NOT add header--hidden when mobile menu is open', () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      mobileToggle.click()

      simulateScroll(100)

      expect(header.classList.contains('header--hidden')).toBe(false)
    })

    it('should remove header--hidden when scrolled to top (scrollY=0)', () => {
      simulateScroll(100)
      expect(header.classList.contains('header--hidden')).toBe(true)

      simulateScroll(0)

      expect(header.classList.contains('header--hidden')).toBe(false)
    })

    it('should disable scroll behavior and show header when resized to < 768px', () => {
      simulateScroll(100)
      expect(header.classList.contains('header--hidden')).toBe(true)

      setViewportWidth(600)
      header.handleResize()

      expect(header.classList.contains('header--hidden')).toBe(false)

      simulateScroll(200)
      expect(header.classList.contains('header--hidden')).toBe(false)
    })

    it('should enable scroll behavior when resized to >= 768px', () => {
      setViewportWidth(600)
      header.handleResize()

      simulateScroll(100)
      expect(header.classList.contains('header--hidden')).toBe(false)

      setViewportWidth(1024)
      header.handleResize()
      simulateScroll(200)

      expect(header.classList.contains('header--hidden')).toBe(true)
    })
  })
})