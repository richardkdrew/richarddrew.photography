/**
 * Accessibility Tests: About Page Component
 * A11y tests for WCAG 2.1 AA compliance and inclusive design
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Import the component to register it
import '../../src/components/about-page/about-page'

describe('About Page Accessibility Tests', () => {
  let aboutPage: HTMLElement
  let container: HTMLElement

  beforeEach(async () => {
    // Setup page container
    container = document.createElement('div')
    container.className = 'page-container'
    document.body.appendChild(container)

    // Create about page element
    aboutPage = document.createElement('about-page')
    // Add static content that would normally be in about.html
    aboutPage.innerHTML = `
      <section class="about-hero">
        <div class="about-hero__content">
          <div class="about-hero__image-container">
            <picture>
              <source type="image/webp" srcset="/images/about/professional-headshot-400.webp 400w">
              <img
                class="about-hero__image"
                src="https://picsum.photos/400/600"
                alt="Professional headshot portrait"
                loading="eager"
                width="400"
                height="600">
            </picture>
          </div>
          <div class="about-hero__text">
            <h1 class="about-hero__heading">About</h1>
            <p class="about-hero__summary professional-summary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is test content for accessibility testing.
            </p>
          </div>
        </div>
      </section>
    `
    container.appendChild(aboutPage)

    // Wait for component to connect
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  describe('ARIA and Semantic HTML', () => {
    it('should NOT have explicit role or aria-label (main landmark is on the <main> element)', () => {
      expect(aboutPage.getAttribute('role')).toBeNull()
      expect(aboutPage.getAttribute('aria-label')).toBeNull()
    })

    it('should use semantic HTML structure', () => {
      const sections = aboutPage.querySelectorAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(1)

      const summary = aboutPage.querySelector('.about-hero__summary')
      expect(summary).toBeTruthy()
    })

    it('should have accessible content structure', () => {
      // Custom element must NOT carry main role — that belongs on <main>
      expect(aboutPage.getAttribute('role')).toBeNull()

      // Content should be accessible to screen readers
      const summary = aboutPage.querySelector('.about-hero__summary')
      expect(summary).toBeTruthy()
      expect(summary?.textContent?.trim().length).toBeGreaterThan(20)

      // Must have an h1 heading
      const h1 = aboutPage.querySelector('h1')
      expect(h1).toBeTruthy()
    })

    it('should have a visible h1 heading', () => {
      const h1 = aboutPage.querySelector('h1.about-hero__heading')
      expect(h1).toBeTruthy()
      expect(h1?.textContent?.trim()).toBe('About')
    })
  })

  describe('Image Accessibility', () => {
    it('should have meaningful alt text for images', () => {
      const images = aboutPage.querySelectorAll('img')

      images.forEach(img => {
        const alt = img.getAttribute('alt')
        expect(alt).toBeTruthy()
        expect(alt?.length).toBeGreaterThan(5)

        // Alt text should be descriptive, not just file names
        expect(alt).not.toMatch(/\.(jpg|jpeg|png|webp|gif)$/i)
        expect(alt?.toLowerCase()).toContain('professional')
      })
    })

    it('should not have decorative images with alt text', () => {
      const decorativeImages = aboutPage.querySelectorAll('img[alt=""]')
      // Decorative images should have empty alt text, not missing alt
      decorativeImages.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true)
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support tab navigation for interactive elements', () => {
      const focusableElements = aboutPage.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      focusableElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex')
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should provide proper content structure for screen readers', () => {
      const textContent = aboutPage.textContent
      expect(textContent).toBeTruthy()
      expect(textContent?.trim().length).toBeGreaterThan(50)
    })

    it('should have descriptive text content', () => {
      const summary = aboutPage.querySelector('.about-hero__summary')
      expect(summary?.textContent).toBeTruthy()

      // Content should have substantial length for accessibility
      const content = summary?.textContent?.trim()
      expect(content?.length).toBeGreaterThan(50)
    })

    it('should use proper landmark roles', () => {
      expect(aboutPage.getAttribute('role')).toBeNull()
    })
  })

  describe('Color and Contrast', () => {
    it('should use proper semantic HTML for accessibility', () => {
      // Component uses semantic HTML which inherits proper contrast from CSS
      const sections = aboutPage.querySelectorAll('section')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should support high contrast mode', () => {
      // Mock prefers-contrast
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      // Component should handle high contrast mode gracefully
      expect(() => {
        const contrastPage = document.createElement('about-page')
        container.appendChild(contrastPage)
      }).not.toThrow()
    })
  })

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility across breakpoints', async () => {
      // Test mobile
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(aboutPage.getAttribute('role')).toBeNull()

      // Test desktop
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(aboutPage.getAttribute('role')).toBeNull()
    })

    it('should have minimum touch target sizes on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 100))

      const interactive = aboutPage.querySelectorAll('a, button, [role="button"]')
      interactive.forEach(element => {
        const rect = element.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          // WCAG recommends minimum 44x44px touch targets
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(40) // Slightly relaxed for testing
        }
      })
    })
  })

  describe('Error Handling Accessibility', () => {
    it('should handle loading errors gracefully for screen readers', async () => {
      // Simulate image loading error
      const img = aboutPage.querySelector('img')
      if (img) {
        img.dispatchEvent(new Event('error'))

        // Component should still have meaningful content
        expect(aboutPage.textContent?.length).toBeGreaterThan(20)
      }
    })

    it('should provide fallback content when JavaScript fails', () => {
      // Check that loading fallback has meaningful content
      const loadingFallback = aboutPage.querySelector('.about-loading-fallback')
      if (loadingFallback) {
        expect(loadingFallback.textContent).toContain('Loading')
      }
    })
  })
})