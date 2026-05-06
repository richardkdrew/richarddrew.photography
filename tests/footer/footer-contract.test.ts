// tests/footer/footer-contract.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PortfolioFooter } from '../../src/components/footer/footer'

function mount(): PortfolioFooter {
  const el = document.createElement('portfolio-footer') as PortfolioFooter
  document.body.appendChild(el)
  return el
}

function unmount(el: PortfolioFooter) {
  el.isConnected && document.body.removeChild(el)
  localStorage.removeItem('theme')
  document.documentElement.removeAttribute('data-theme')
}

describe('PortfolioFooter Contract', () => {
  let el: PortfolioFooter

  beforeEach(() => { el = mount() })
  afterEach(() => unmount(el))

  describe('Custom element registration', () => {
    it('MUST be registered as portfolio-footer', () => {
      expect(customElements.get('portfolio-footer')).toBe(PortfolioFooter)
    })

    it('MUST extend HTMLElement', () => {
      expect(el).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Structure', () => {
    it('MUST have role="contentinfo"', () => {
      expect(el.getAttribute('role')).toBe('contentinfo')
    })

    it('MUST contain a version string', () => {
      expect(el.textContent).toMatch(/v\d{4}\.\d{3}|dev-local/)
    })

    it('MUST contain copyright text', () => {
      expect(el.textContent).toMatch(/Richard Drew Photography/)
    })

    it('MUST render a Dark Room button in light mode', () => {
      document.documentElement.removeAttribute('data-theme')
      const btn = el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')
      expect(btn).not.toBeNull()
      expect(btn?.tagName).toBe('BUTTON')
    })

    it('MUST render a Light Box button', () => {
      const btn = el.querySelector<HTMLButtonElement>('.footer__toggle--light-box')
      expect(btn).not.toBeNull()
      expect(btn?.tagName).toBe('BUTTON')
    })
  })

  describe('Theme contract', () => {
    it('MUST read initial theme from localStorage', () => {
      unmount(el)
      localStorage.setItem('theme', 'dark')
      const fresh = mount()
      expect(document.documentElement.dataset.theme).toBe('dark')
      unmount(fresh)
    })

    it('MUST default to light when localStorage is empty', () => {
      localStorage.removeItem('theme')
      unmount(el)
      const fresh = mount()
      expect(document.documentElement.dataset.theme).toBe('light')
      unmount(fresh)
    })

    it('MUST dispatch theme:changed event when toggled', () => {
      return new Promise<void>((resolve) => {
        document.addEventListener('theme:changed', () => resolve(), { once: true })
        el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')?.click()
      })
    })
  })
})
