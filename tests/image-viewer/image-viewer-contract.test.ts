/**
 * Image Viewer API Contract Tests
 * Tests for the public API interface of the image viewer component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ViewerState, ImageData } from '../../src/components/image-viewer/image-viewer.types'
import { setupViewer, cleanupViewer } from './test-utils'

describe('Image Viewer API Contract', () => {
  let viewer: any
  let testImages: ImageData[]

  beforeEach(async () => {
    // Contract tests use more detailed mock images with srcset
    testImages = [
      {
        id: 'img-1',
        src: '/images/1.jpg',
        srcset: '/images/1-400.jpg 400w, /images/1-800.jpg 800w',
        alt: 'Image 1',
        width: 800,
        height: 600,
        index: 0
      },
      {
        id: 'img-2',
        src: '/images/2.jpg',
        srcset: '/images/2-400.jpg 400w, /images/2-800.jpg 800w',
        alt: 'Image 2',
        width: 600,
        height: 800,
        index: 1
      },
      {
        id: 'img-3',
        src: '/images/3.jpg',
        srcset: '/images/3-400.jpg 400w, /images/3-800.jpg 800w',
        alt: 'Image 3',
        width: 800,
        height: 600,
        index: 2
      }
    ]

    viewer = await setupViewer()
    // Override with more detailed test images
    viewer.setImages(testImages)
  })

  afterEach(() => {
    cleanupViewer(viewer)
  })

  describe('open(index)', () => {
    it('should set state.active=true and currentIndex=index', () => {
      viewer.open(1)
      const state = viewer.getState()

      expect(state.active).toBe(true)
      expect(state.currentIndex).toBe(1)
    })

    it('should throw RangeError for negative index', () => {
      expect(() => viewer.open(-1)).toThrow(RangeError)
      expect(() => viewer.open(-1)).toThrow('Index cannot be negative')
    })

    it('should throw RangeError for index out of bounds', () => {
      expect(() => viewer.open(999)).toThrow(RangeError)
      expect(() => viewer.open(999)).toThrow('Index out of bounds')
    })



    it('should dispatch viewer:open event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:open', eventSpy)

      viewer.open(1)

      expect(eventSpy).toHaveBeenCalledTimes(1)
      expect(eventSpy.mock.calls[0][0].detail).toEqual({ index: 1 })
    })

    it('should prevent page scroll (overflow: hidden)', () => {
      viewer.open(0)
      expect(document.body.style.overflow).toBe('hidden')
    })
  })

  describe('close()', () => {
    beforeEach(() => {
      viewer.open(1) // Open viewer first
    })

    it('should set state.active=false', () => {
      viewer.close()
      const state = viewer.getState()

      expect(state.active).toBe(false)
    })


    it('should re-enable page scroll', () => {
      viewer.close()
      expect(document.body.style.overflow).toBe('')
    })


    it('should dispatch viewer:close event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:close', eventSpy)

      viewer.close()

      expect(eventSpy).toHaveBeenCalledTimes(1)
      expect(eventSpy.mock.calls[0][0].detail).toEqual({ fromIndex: 1 })
    })
  })

  describe('next()', () => {
    beforeEach(() => {
      viewer.open(0) // Open at first image
    })

    it('should increment currentIndex by 1', () => {
      viewer.next()
      const state = viewer.getState()

      expect(state.currentIndex).toBe(1)
    })

    it('should dispatch viewer:navigate event with correct details', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:navigate', eventSpy)

      viewer.next()

      expect(eventSpy).toHaveBeenCalledTimes(1)
      expect(eventSpy.mock.calls[0][0].detail).toEqual({
        direction: 'next',
        fromIndex: 0,
        toIndex: 1,
        trigger: 'button'
      })
    })

    it('should update counter text', () => {
      viewer.next()
      const counter = viewer.querySelector('[data-counter]')

      expect(counter?.textContent).toContain('2 of 3')
    })

    it('should be no-op at last image', () => {
      viewer.open(2) // Open at last image
      viewer.next()
      const state = viewer.getState()

      expect(state.currentIndex).toBe(2) // Still at last image
    })
  })

  describe('prev()', () => {
    beforeEach(() => {
      viewer.open(2) // Open at last image
    })

    it('should decrement currentIndex by 1', () => {
      viewer.prev()
      const state = viewer.getState()

      expect(state.currentIndex).toBe(1)
    })

    it('should dispatch viewer:navigate event with correct details', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:navigate', eventSpy)

      viewer.prev()

      expect(eventSpy).toHaveBeenCalledTimes(1)
      expect(eventSpy.mock.calls[0][0].detail).toEqual({
        direction: 'prev',
        fromIndex: 2,
        toIndex: 1,
        trigger: 'button'
      })
    })

    it('should be no-op at first image', () => {
      viewer.open(0) // Open at first image
      viewer.prev()
      const state = viewer.getState()

      expect(state.currentIndex).toBe(0) // Still at first image
    })
  })

  describe('getState()', () => {
    it('should return readonly ViewerState', () => {
      const state = viewer.getState()

      expect(state).toHaveProperty('active')
      expect(state).toHaveProperty('currentIndex')
      expect(state).toHaveProperty('totalImages')
      expect(state).toHaveProperty('enabled')
    })

    it('should return copy of state (not reference)', () => {
      const state1 = viewer.getState()
      const state2 = viewer.getState()

      // Should be different objects (copies)
      expect(state1).not.toBe(state2)
      // But with same values
      expect(state1).toEqual(state2)
    })
  })

  describe('setEnabled(enabled)', () => {
    it('should update enabled state', () => {
      viewer.setEnabled(true)
      const state = viewer.getState()

      expect(state.enabled).toBe(true)
    })

    it('should auto-close if active and disabled', () => {
      viewer.setEnabled(true)
      viewer.open(0)

      viewer.setEnabled(false)

      const state = viewer.getState()
      expect(state.active).toBe(false)
    })

    it('should dispatch viewer:enabled event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:enabled', eventSpy)

      viewer.setEnabled(true)

      expect(eventSpy).toHaveBeenCalledTimes(1)
      expect(eventSpy.mock.calls[0][0].detail).toEqual({ enabled: true })
    })
  })

  describe('Navigation Boundaries', () => {
    it('should disable prev button at first image', () => {
      viewer.open(0)

      const prevButton = viewer.querySelector('[data-prev]')
      expect(prevButton?.getAttribute('aria-disabled')).toBe('true')
      expect(prevButton?.hasAttribute('disabled')).toBe(true)
    })

    it('should disable next button at last image', () => {
      viewer.open(2) // Last image (index 2 of 3 images)

      const nextButton = viewer.querySelector('[data-next]')
      expect(nextButton?.getAttribute('aria-disabled')).toBe('true')
      expect(nextButton?.hasAttribute('disabled')).toBe(true)
    })

    it('should enable both buttons between boundaries', () => {
      viewer.open(1) // Middle image

      const prevButton = viewer.querySelector('[data-prev]')
      const nextButton = viewer.querySelector('[data-next]')

      expect(prevButton?.getAttribute('aria-disabled')).toBe('false')
      expect(nextButton?.getAttribute('aria-disabled')).toBe('false')
    })
  })

  describe('Custom Events', () => {
    it('should dispatch viewer:open event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:open', eventSpy)

      viewer.open(1)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewer:open',
          detail: { index: 1 }
        })
      )
    })

    it('should dispatch viewer:close event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:close', eventSpy)

      viewer.open(1)
      viewer.close()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewer:close',
          detail: { fromIndex: 1 }
        })
      )
    })

    it('should dispatch viewer:navigate event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:navigate', eventSpy)

      viewer.open(0)
      viewer.next()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewer:navigate',
          detail: {
            direction: 'next',
            fromIndex: 0,
            toIndex: 1,
            trigger: expect.any(String)
          }
        })
      )
    })

    it('should dispatch viewer:error event on image load failure', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:error', eventSpy)

      viewer.open(0)

      // Simulate image error
      const img = viewer.querySelector('img')
      img?.dispatchEvent(new Event('error'))

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewer:error',
          detail: {
            index: expect.any(Number),
            error: expect.any(Error)
          }
        })
      )
    })

    it('should dispatch viewer:enabled event', () => {
      const eventSpy = vi.fn()
      viewer.addEventListener('viewer:enabled', eventSpy)

      viewer.setEnabled(false)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewer:enabled',
          detail: { enabled: false }
        })
      )
    })
  })
})
