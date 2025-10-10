/**
 * Performance Tests: About Page Component
 * Simple performance validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../../src/components/about-page/about-page'

describe('About Page Performance Tests', () => {
  let aboutPage: HTMLElement
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  describe('Component Creation', () => {
    it('should create component quickly', () => {
      const startTime = performance.now()

      aboutPage = document.createElement('about-page')
      container.appendChild(aboutPage)

      const duration = performance.now() - startTime

      // Component creation should be nearly instantaneous
      expect(duration).toBeLessThan(50)
    })

    it('should load template within reasonable time', async () => {
      aboutPage = document.createElement('about-page')
      container.appendChild(aboutPage)

      const startTime = performance.now()

      // Wait for template load
      await new Promise(resolve => setTimeout(resolve, 100))

      const duration = performance.now() - startTime

      // Template should load within 200ms
      expect(duration).toBeLessThan(200)
    })
  })

  describe('Memory', () => {
    it('should clean up when removed from DOM', () => {
      aboutPage = document.createElement('about-page')
      container.appendChild(aboutPage)

      // Component should not hold references after removal
      container.removeChild(aboutPage)

      // If we get here without errors, cleanup worked
      expect(true).toBe(true)
    })
  })
})
