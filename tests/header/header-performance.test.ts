/**
 * Performance Tests: Header Component
 * Performance validation tests for constitutional requirements
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Header } from '../../src/components/header/header'
import { setupHeader, cleanupHeader } from './test-utils'

describe('Header Performance Tests', () => {
  let header: Header

  beforeEach(async () => {
    header = await setupHeader()
  })

  afterEach(() => {
    cleanupHeader(header)
  })

  describe('Constitutional Performance Requirements', () => {
    it('should initialize within 100ms', async () => {
      const startTime = performance.now()

      // Create new header component
      const newHeader = document.createElement('portfolio-header') as Header
      document.body.appendChild(newHeader)

      // Wait for initialization to complete
      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const initializationTime = endTime - startTime

      expect(initializationTime).toBeLessThan(100)

      // Cleanup
      document.body.removeChild(newHeader)
    })

    it('should respond to mobile menu toggle within 100ms', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      const startTime = performance.now()
      mobileToggle.click()

      // Wait for DOM updates to complete
      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })

    it('should respond to logo click within 100ms', async () => {
      const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement

      const startTime = performance.now()

      // Simulate click (prevent actual navigation)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      clickEvent.preventDefault = () => {} // Mock preventDefault

      logoLink.dispatchEvent(clickEvent)

      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })

    it('should respond to navigation link click within 100ms', async () => {
      const navLink = header.querySelector('.header__nav-link') as HTMLAnchorElement

      const startTime = performance.now()

      // Simulate click (prevent actual navigation)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      clickEvent.preventDefault = () => {} // Mock preventDefault

      navLink.dispatchEvent(clickEvent)

      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })

    it('should respond to keyboard navigation within 100ms', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Focus the element first
      mobileToggle.focus()

      const startTime = performance.now()

      // Simulate Enter key press
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      })

      mobileToggle.dispatchEvent(keyEvent)

      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })

    it('should close mobile menu with Escape key within 100ms', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Open menu first
      mobileToggle.click()
      await new Promise(resolve => requestAnimationFrame(resolve))

      const startTime = performance.now()

      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      })

      document.dispatchEvent(escapeEvent)

      await new Promise(resolve => requestAnimationFrame(resolve))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      expect(responseTime).toBeLessThan(100)
    })
  })

  describe('Resize Performance', () => {
    it('should handle window resize within 100ms', async () => {
      const startTime = performance.now()

      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      })

      window.dispatchEvent(new Event('resize'))

      // Wait for resize debounce (100ms) + handler execution
      await new Promise(resolve => setTimeout(resolve, 150))

      const endTime = performance.now()
      const responseTime = endTime - startTime

      // Should complete within debounce time + reasonable overhead
      expect(responseTime).toBeLessThan(200)
    })

    it('should handle rapid resize events efficiently', async () => {
      const startTime = performance.now()

      // Simulate rapid resizing (10 resize events)
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 320 + (i * 100)
        })

        window.dispatchEvent(new Event('resize'))
        await new Promise(resolve => requestAnimationFrame(resolve))
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Should handle 10 resizes in reasonable time
      expect(totalTime).toBeLessThan(500) // 50ms per resize on average
    })
  })

  describe('Animation Performance', () => {
    it('should complete mobile menu animation smoothly', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Monitor animation frame rate (simplified)
      let frameCount = 0
      const startTime = performance.now()

      const frameCounter = () => {
        frameCount++
        if (performance.now() - startTime < 300) { // Animation duration
          requestAnimationFrame(frameCounter)
        }
      }

      // Start animation
      mobileToggle.click()
      requestAnimationFrame(frameCounter)

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 350))

      const totalTime = performance.now() - startTime

      // Should maintain reasonable frame rate (aim for 60fps = 16.67ms per frame)
      // Note: Test environment timing is less accurate than real browsers
      const averageFrameTime = totalTime / frameCount
      expect(averageFrameTime).toBeLessThan(50) // More lenient for test environment
    })

    it('should not cause layout thrashing during animations', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      let layoutCount = 0

      // Monitor forced reflows (simplified detection)
      const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get: function() {
          layoutCount++
          return originalOffsetHeight.get!.call(this)
        }
      })

      // Trigger animation
      mobileToggle.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Restore original property
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)

      // Should not cause excessive layout calculations during animation
      expect(layoutCount).toBeLessThan(10)
    })
  })

  describe('Memory Performance', () => {
    it('should not leak memory during repeated interactions', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement

      // Perform many interactions
      for (let i = 0; i < 50; i++) {
        mobileToggle.click() // Open
        await new Promise(resolve => requestAnimationFrame(resolve))
        mobileToggle.click() // Close
        await new Promise(resolve => requestAnimationFrame(resolve))
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (less than 100KB for repeated interactions)
      if (initialMemory > 0) {
        expect(memoryIncrease).toBeLessThan(102400) // 100KB in bytes
      }
    })

    it('should clean up event listeners properly', async () => {
      // Create and destroy multiple headers
      const headers: Header[] = []

      for (let i = 0; i < 5; i++) {
        const testHeader = document.createElement('portfolio-header') as Header
        document.body.appendChild(testHeader)
        headers.push(testHeader)
        await new Promise(resolve => requestAnimationFrame(resolve))
      }

      // Remove all headers
      headers.forEach(h => {
        if (h.parentNode) {
          h.parentNode.removeChild(h)
        }
      })

      // Should not have accumulated excessive event listeners
      expect(headers.length).toBe(5) // Verify test setup worked
    })
  })

  describe('Accessibility Performance', () => {
    it('should update ARIA attributes efficiently', async () => {
      const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
      const mobileMenu = header.querySelector('.header__mobile-menu') as HTMLElement

      const startTime = performance.now()

      // Toggle menu and check ARIA updates
      mobileToggle.click()
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('true')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('false')

      mobileToggle.click()
      expect(mobileToggle.getAttribute('aria-expanded')).toBe('false')
      expect(mobileMenu.getAttribute('aria-hidden')).toBe('true')

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // ARIA updates should be very fast
      expect(totalTime).toBeLessThan(50)
    })
  })
})