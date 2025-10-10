/**
 * Image Viewer Performance Tests
 * Tests for performance characteristics and resource management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setupViewer, cleanupViewer } from './test-utils'

describe('Image Viewer Performance', () => {
  let viewer: any

  beforeEach(async () => {
    viewer = await setupViewer()
  })

  afterEach(() => {
    cleanupViewer(viewer)
  })

  describe('Behavioral Performance', () => {
    it('Viewer opens synchronously', () => {
      viewer.open(0)
      expect(viewer.getState().active).toBe(true)
    })

    it('Viewer closes synchronously', () => {
      viewer.open(0)
      viewer.close()
      expect(viewer.getState().active).toBe(false)
    })

    it('Navigation updates state immediately', () => {
      viewer.open(0)
      viewer.next()
      expect(viewer.getState().currentIndex).toBe(1)
    })

    it('Resize triggers auto-close when disabled', () => {
      viewer.setEnabled(true)
      viewer.open(1)
      viewer.setEnabled(false)

      expect(viewer.getState().active).toBe(false)
    })
  })

  describe('Resource Management', () => {
    it('Event listeners cleaned up on disconnect', () => {
      const removeListenerSpy = vi.spyOn(viewer, 'removeEventListener')

      viewer.disconnectedCallback()

      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(removeListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
      expect(removeListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
    })

    it('Preload links cleaned up on close', () => {
      viewer.open(1)

      // Create a mock preload link
      const link = document.createElement('link')
      link.rel = 'preload'
      link.setAttribute('data-viewer', 'true')
      document.head.appendChild(link)

      viewer.close()

      const remainingLinks = document.querySelectorAll('link[rel="preload"][data-viewer]')
      expect(remainingLinks.length).toBe(0)
    })
  })
})
