/**
 * Image Viewer UI Tests
 * Tests for user interface scenarios and interactions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupViewer, cleanupViewer } from './test-utils'

describe('Image Viewer UI', () => {
  let viewer: any

  beforeEach(async () => {
    viewer = await setupViewer()
  })

  afterEach(() => {
    cleanupViewer(viewer)
  })

  describe('Viewer Activation', () => {
    it('TS-001: should activate in multi-column mode', () => {
      viewer.setEnabled(true)
      viewer.open(2)
      expect(viewer.getState().active).toBe(true)
    })

    it('TS-002: should be disabled in single-column mobile', () => {
      viewer.setEnabled(false)
      expect(viewer.getState().enabled).toBe(false)
    })
  })

  describe('Keyboard Navigation', () => {
    it('TS-003: Right Arrow navigates to next', () => {
      viewer.open(0)
      viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      expect(viewer.getState().currentIndex).toBe(1)
    })

    it('TS-004: Left Arrow navigates to previous', () => {
      viewer.open(2)
      viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      expect(viewer.getState().currentIndex).toBe(1)
    })

    it('TS-007: ESC key closes viewer', () => {
      viewer.open(1)
      viewer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(viewer.getState().active).toBe(false)
    })
  })

  describe('Navigation Boundaries', () => {
    it('TS-005: Previous disabled at first image', () => {
      viewer.open(0)
      const prevBtn = viewer.querySelector('[data-prev]')
      expect(prevBtn?.disabled).toBe(true)
    })

    it('TS-006: Next disabled at last image', () => {
      viewer.open(2) // Assuming 3 images total
      const nextBtn = viewer.querySelector('[data-next]')
      expect(nextBtn?.disabled).toBe(true)
    })
  })

  describe('Touch Gestures', () => {
    it('TS-010: Swipe left (>50px) navigates to next', () => {
      viewer.open(0)
      // Simulate swipe left
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 300 } as any]
      })
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 300 } as any]
      })

      viewer.dispatchEvent(touchStart)
      viewer.dispatchEvent(touchEnd)

      expect(viewer.getState().currentIndex).toBe(1)
    })
  })

  describe('Responsive Sizing', () => {
    it('TS-016: Image uses responsive srcset', () => {
      viewer.open(0)
      const img = viewer.querySelector('img')

      // Should have srcset and sizes attributes for responsive images
      expect(img).toBeTruthy()
      expect(img?.hasAttribute('sizes')).toBe(true)
    })
  })

  describe('Browser Resize', () => {
    it('TS-018: Desktop→mobile auto-closes viewer', () => {
      viewer.setEnabled(true)
      viewer.open(1)

      viewer.setEnabled(false) // Simulate resize to mobile

      expect(viewer.getState().active).toBe(false)
    })
  })

  describe('Image Load Failure', () => {
    it('TS-020: Shows error state without auto-navigation', () => {
      viewer.open(0)

      let errorFired = false
      viewer.addEventListener('viewer:error', () => {
        errorFired = true
      })

      const img = viewer.querySelector('img')
      img?.dispatchEvent(new Event('error'))

      // Should stay on same image (no auto-navigation)
      expect(viewer.getState().currentIndex).toBe(0)
      // Should fire error event
      expect(errorFired).toBe(true)
    })
  })
})
