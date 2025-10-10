import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupThemeToggle, cleanupThemeToggle } from './test-utils'

/**
 * UI Behavior Tests: ThemeToggle Component
 *
 * Tests the user interaction and behavior of the theme toggle.
 * These tests MUST fail until implementation is complete (TDD).
 */

describe('ThemeToggle UI Behavior', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = setupThemeToggle()
    document.documentElement.dataset.theme = 'light'
  })

  afterEach(() => {
    cleanupThemeToggle(element)
    document.documentElement.dataset.theme = 'light'
  })

  describe('Toggle Functionality', () => {
    it('should switch from light to dark on first toggle', () => {
      expect((element as any).currentTheme).toBe('light')

      ;(element as any).toggle()

      expect((element as any).currentTheme).toBe('dark')
    })

    it('should switch from dark to light on second toggle', () => {
      localStorage.setItem('theme', 'dark')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe('dark')

      ;(newElement as any).toggle()

      expect((newElement as any).currentTheme).toBe('light')

      newElement.remove()
    })

    it('should toggle back and forth multiple times', () => {
      expect((element as any).currentTheme).toBe('light')

      ;(element as any).toggle()
      expect((element as any).currentTheme).toBe('dark')

      ;(element as any).toggle()
      expect((element as any).currentTheme).toBe('light')

      ;(element as any).toggle()
      expect((element as any).currentTheme).toBe('dark')
    })
  })

  describe('localStorage Integration', () => {
    it('should persist theme to localStorage on toggle', () => {
      ;(element as any).toggle()

      expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('should update localStorage when toggling from dark to light', () => {
      // Set initial theme to dark
      localStorage.setItem('theme', 'dark')

      // Recreate element so it reads from localStorage
      element.remove()
      element = document.createElement('theme-toggle')
      document.body.appendChild(element)

      // Toggle from dark to light
      ;(element as any).toggle()

      expect(localStorage.getItem('theme')).toBe('light')
    })

    it('should read persisted theme on component remount', () => {
      // Set theme to dark
      ;(element as any).toggle()
      expect(localStorage.getItem('theme')).toBe('dark')

      // Remove and recreate component
      element.remove()
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      // Should read from localStorage
      expect((newElement as any).currentTheme).toBe('dark')

      newElement.remove()
    })
  })

  describe('DOM Attribute Updates', () => {
    it('should update data-theme attribute on toggle', () => {
      expect(document.documentElement.dataset.theme).toBe('light')

      ;(element as any).toggle()

      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('should keep data-theme in sync with currentTheme', () => {
      ;(element as any).toggle()
      expect(document.documentElement.dataset.theme).toBe((element as any).currentTheme)

      ;(element as any).toggle()
      expect(document.documentElement.dataset.theme).toBe((element as any).currentTheme)
    })
  })

  describe('Default Behavior', () => {
    it('should default to light mode when localStorage is empty', () => {
      expect((element as any).currentTheme).toBe('light')
      expect(localStorage.getItem('theme')).toBeNull()
    })

    it('should default to light mode for invalid localStorage values', () => {
      localStorage.setItem('theme', 'auto')
      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe('light')

      newElement.remove()
    })

    it('should not set localStorage until first toggle', () => {
      // On mount, localStorage should remain empty (default light)
      expect(localStorage.getItem('theme')).toBeNull()

      // After toggle, should be set
      ;(element as any).toggle()
      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('Click Interaction', () => {
    it('should toggle theme on click', () => {
      const initialTheme = (element as any).currentTheme

      element.click()

      expect((element as any).currentTheme).not.toBe(initialTheme)
    })

    it('should toggle from light to dark on click', () => {
      expect((element as any).currentTheme).toBe('light')

      element.click()

      expect((element as any).currentTheme).toBe('dark')
    })
  })

  describe('Visual State Updates', () => {
    it('should update button content when theme changes', () => {
      // Content/HTML stays the same (both icons always present)
      // CSS controls visibility based on data-theme attribute
      const initialTheme = document.documentElement.dataset.theme

      ;(element as any).toggle()

      const newTheme = document.documentElement.dataset.theme

      // data-theme attribute should change (this triggers CSS updates)
      expect(newTheme).not.toBe(initialTheme)
      expect(newTheme).toBe('dark')
    })
  })

  describe('Multiple Instance Sync', () => {
    it('should sync theme across multiple toggle instances', () => {
      const element2 = document.createElement('theme-toggle')
      document.body.appendChild(element2)

      // Toggle first element
      ;(element as any).toggle()

      // Both should reflect the same theme from localStorage
      expect((element as any).currentTheme).toBe('dark')
      expect((element2 as any).currentTheme).toBe('dark')

      element2.remove()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid toggling without errors', () => {
      for (let i = 0; i < 10; i++) {
        ;(element as any).toggle()
      }

      // Should end up back at light (even number of toggles)
      expect((element as any).currentTheme).toBe('light')
    })

    it('should handle component removal and recreation', () => {
      ;(element as any).toggle()
      const theme = (element as any).currentTheme

      element.remove()

      const newElement = document.createElement('theme-toggle')
      document.body.appendChild(newElement)

      expect((newElement as any).currentTheme).toBe(theme)

      newElement.remove()
    })
  })
})
