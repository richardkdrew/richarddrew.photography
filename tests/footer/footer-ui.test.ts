// tests/footer/footer-ui.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PortfolioFooter } from '../../src/components/footer/footer'

if (!customElements.get('portfolio-footer')) {
  customElements.define('portfolio-footer', PortfolioFooter)
}

function mount(): PortfolioFooter {
  document.documentElement.removeAttribute('data-theme')
  localStorage.removeItem('theme')
  const el = document.createElement('portfolio-footer') as PortfolioFooter
  document.body.appendChild(el)
  return el
}

function unmount(el: PortfolioFooter) {
  el.isConnected && document.body.removeChild(el)
  localStorage.removeItem('theme')
  document.documentElement.removeAttribute('data-theme')
}

describe('PortfolioFooter UI', () => {
  let el: PortfolioFooter

  beforeEach(() => { el = mount() })
  afterEach(() => unmount(el))

  describe('Version and copyright', () => {
    it('displays version from meta tag or fallback', () => {
      expect(el.textContent).toMatch(/v\d{4}\.\d{3}|dev-local/)
    })

    it('displays copyright with current year', () => {
      const year = new Date().getFullYear()
      expect(el.textContent).toContain(`© ${year}`)
    })

    it('displays "Richard Drew Photography"', () => {
      expect(el.textContent).toContain('Richard Drew Photography')
    })
  })

  describe('Theme toggle — light mode', () => {
    it('Dark Room button is visible', () => {
      const btn = el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')
      expect(btn).not.toBeNull()
      expect(btn?.style.display).not.toBe('none')
    })

    it('clicking Dark Room sets data-theme to dark', () => {
      el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')?.click()
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('clicking Dark Room saves dark to localStorage', () => {
      el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')?.click()
      expect(localStorage.getItem('theme')).toBe('dark')
    })
  })

  describe('Theme toggle — dark mode', () => {
    beforeEach(() => {
      // Switch to dark via the component itself so _currentTheme is in sync
      el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')?.click()
    })

    it('clicking Light Box sets data-theme to light', () => {
      el.querySelector<HTMLButtonElement>('.footer__toggle--light-box')?.click()
      expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('clicking Light Box saves light to localStorage', () => {
      el.querySelector<HTMLButtonElement>('.footer__toggle--light-box')?.click()
      expect(localStorage.getItem('theme')).toBe('light')
    })
  })

  describe('theme:changed event sync', () => {
    it('responds to theme:changed dispatched externally', () => {
      document.dispatchEvent(new CustomEvent('theme:changed', {
        detail: { theme: 'dark', previousTheme: 'light' }
      }))
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  describe('Button stability', () => {
    it('both buttons share the same toggle class for consistent sizing', () => {
      const darkRoom = el.querySelector('.footer__toggle--dark-room')
      const lightBox = el.querySelector('.footer__toggle--light-box')
      expect(darkRoom?.classList.contains('footer__toggle')).toBe(true)
      expect(lightBox?.classList.contains('footer__toggle')).toBe(true)
    })
  })
})
