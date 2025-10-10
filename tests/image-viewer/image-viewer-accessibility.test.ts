/**
 * Image Viewer Accessibility Tests
 * Tests for WCAG 2.1 AA compliance
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupViewer, cleanupViewer } from './test-utils'

describe('Image Viewer Accessibility', () => {
  let viewer: any

  beforeEach(async () => {
    viewer = await setupViewer()
  })

  afterEach(() => {
    cleanupViewer(viewer)
  })

  describe('Focus Trap', () => {
    it('TS-024: Tab cycles within viewer', () => {
      viewer.open(1)

      const focusableElements = viewer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      expect(focusableElements.length).toBeGreaterThan(0)

      // Tab from last element should cycle to first
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      lastElement.focus()

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      viewer.dispatchEvent(tabEvent)

      expect(document.activeElement).toBe(focusableElements[0])
    })

    it('TS-024b: Shift+Tab cycles backward', () => {
      viewer.open(1)

      const focusableElements = viewer.querySelectorAll('button, [href]')
      const firstElement = focusableElements[0] as HTMLElement
      firstElement.focus()

      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      viewer.dispatchEvent(shiftTabEvent)

      expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1])
    })
  })

  describe('ARIA Attributes', () => {
    it('TS-025: Correct role, aria-label, aria-modal', () => {
      viewer.open(0)

      expect(viewer.getAttribute('role')).toBe('dialog')
      expect(viewer.getAttribute('aria-label')).toBe('Image viewer')
      expect(viewer.getAttribute('aria-modal')).toBe('true')
    })

    it('TS-025b: ARIA live region announces changes', () => {
      viewer.open(0)

      const liveRegion = viewer.querySelector('[aria-live]')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')

      viewer.next()
      expect(liveRegion?.textContent).toContain('Image 2 of')
    })

    it('Button labels correct', () => {
      viewer.open(1)

      const closeBtn = viewer.querySelector('[data-close]')
      const nextBtn = viewer.querySelector('[data-next]')
      const prevBtn = viewer.querySelector('[data-prev]')

      expect(closeBtn?.getAttribute('aria-label')).toBe('Close image viewer')
      expect(nextBtn?.getAttribute('aria-label')).toBe('Next image')
      expect(prevBtn?.getAttribute('aria-label')).toBe('Previous image')
    })

    it('Disabled buttons have aria-disabled', () => {
      viewer.open(0)

      const prevBtn = viewer.querySelector('[data-prev]')
      expect(prevBtn?.getAttribute('aria-disabled')).toBe('true')
    })
  })

  describe('Keyboard Navigation', () => {
    it('TS-026: All controls accessible via keyboard', () => {
      viewer.open(1)

      const closeBtn = viewer.querySelector('[data-close]')
      const nextBtn = viewer.querySelector('[data-next]')
      const prevBtn = viewer.querySelector('[data-prev]')

      expect(closeBtn?.tabIndex).toBeGreaterThanOrEqual(0)
      expect(nextBtn?.tabIndex).toBeGreaterThanOrEqual(0)
      expect(prevBtn?.tabIndex).toBeGreaterThanOrEqual(0)
    })
  })

})
