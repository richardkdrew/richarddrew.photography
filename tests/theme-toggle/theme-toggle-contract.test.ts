import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupThemeToggle, cleanupThemeToggle } from './test-utils'

/**
 * Contract Tests: ThemeToggle Component
 *
 * Tests the interface and contract compliance of the theme-toggle Web Component.
 * These tests MUST fail until implementation is complete (TDD).
 */

describe('ThemeToggle Component Contract', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = setupThemeToggle()
  })

  afterEach(() => {
    cleanupThemeToggle(element)
  })

  describe('Custom Element Registration', () => {
    it('should be registered as a custom element', () => {
      expect(customElements.get('theme-toggle')).toBeDefined()
    })

    it('should create an instance of HTMLElement', () => {
      expect(element).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Interface Contract', () => {
    it('should have readonly currentTheme property', () => {
      expect(element).toHaveProperty('currentTheme')
      expect(typeof (element as any).currentTheme).toBe('string')
    })

    it('should have currentTheme as "light" or "dark"', () => {
      const currentTheme = (element as any).currentTheme
      expect(['light', 'dark']).toContain(currentTheme)
    })

    it('should have toggle() method', () => {
      expect(element).toHaveProperty('toggle')
      expect(typeof (element as any).toggle).toBe('function')
    })

    it('should not allow direct assignment to currentTheme (readonly)', () => {
      const initialTheme = (element as any).currentTheme

      // Attempt to assign should not change the value
      try {
        ;(element as any).currentTheme = 'invalid'
      } catch (e) {
        // Expected to throw or silently fail
      }

      // Value should remain unchanged
      expect((element as any).currentTheme).toBe(initialTheme)
    })
  })

  describe('localStorage Contract', () => {
    it('should default to "light" when localStorage is empty', () => {
      localStorage.removeItem('theme')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe('light')

      newElement.remove()
    })

    it('should read theme from localStorage if present', () => {
      localStorage.setItem('theme', 'dark')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe('dark')

      newElement.remove()
    })

    it('should default to "light" for invalid localStorage values', () => {
      localStorage.setItem('theme', 'invalid-value')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe('light')

      newElement.remove()
    })

    it('should update localStorage when toggle() is called', () => {
      localStorage.setItem('theme', 'light')
      ;(element as any).toggle()

      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('DOM Attribute Contract', () => {
    it('should set data-theme attribute on document.documentElement', () => {
      localStorage.setItem('theme', 'dark')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect(document.documentElement.dataset.theme).toBe('dark')

      newElement.remove()
    })

    it('should update data-theme attribute on toggle()', () => {
      document.documentElement.dataset.theme = 'light'
      localStorage.setItem('theme', 'light')

      ;(element as any).toggle()

      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  describe('Event Contract', () => {
    it('should dispatch "theme:changed" event on toggle', () => {
      return new Promise<void>((resolve) => {
        const handler = (event: Event) => {
          expect(event.type).toBe('theme:changed')
          document.removeEventListener('theme:changed', handler)
          resolve()
        }

        document.addEventListener('theme:changed', handler)
        ;(element as any).toggle()
      })
    })

    it('should include theme details in event', () => {
      localStorage.setItem('theme', 'light')

      return new Promise<void>((resolve) => {
        const handler = (event: CustomEvent) => {
          expect(event.detail).toBeDefined()
          expect(event.detail.theme).toBe('dark')
          expect(event.detail.previousTheme).toBe('light')

          document.removeEventListener('theme:changed', handler)
          resolve()
        }

        document.addEventListener('theme:changed', handler as EventListener)
        ;(element as any).toggle()
      })
    })
  })

  describe('TypeScript Type Contract', () => {
    it('should accept only "light" or "dark" as valid themes', () => {
      // This is validated at compile time by TypeScript
      // Runtime test: localStorage should reject invalid values
      localStorage.setItem('theme', 'purple')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      // Should default to 'light' for invalid value
      expect((newElement as any).currentTheme).toBe('light')

      newElement.remove()
    })
  })
})
