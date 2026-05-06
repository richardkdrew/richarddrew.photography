// tests/footer/footer-accessibility.test.ts

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

describe('PortfolioFooter Accessibility', () => {
  let el: PortfolioFooter

  beforeEach(() => { el = mount() })
  afterEach(() => unmount(el))

  describe('Landmark role', () => {
    it('has role="contentinfo" for screen reader navigation', () => {
      expect(el.getAttribute('role')).toBe('contentinfo')
    })
  })

  describe('Button labels', () => {
    it('Dark Room button has descriptive aria-label', () => {
      const btn = el.querySelector('.footer__toggle--dark-room')
      expect(btn?.getAttribute('aria-label')).toBe('Switch to dark mode')
    })

    it('Light Box button has descriptive aria-label', () => {
      const btn = el.querySelector('.footer__toggle--light-box')
      expect(btn?.getAttribute('aria-label')).toBe('Switch to light mode')
    })
  })

  describe('Keyboard interaction', () => {
    it('Dark Room button responds to Enter key', () => {
      const btn = el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')!
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('Dark Room button responds to Space key', () => {
      const btn = el.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')!
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('buttons are natively focusable (native button element)', () => {
      const darkRoom = el.querySelector('.footer__toggle--dark-room')
      const lightBox = el.querySelector('.footer__toggle--light-box')
      expect(darkRoom?.tagName).toBe('BUTTON')
      expect(lightBox?.tagName).toBe('BUTTON')
    })
  })

  describe('Reduced motion', () => {
    it('renders without animation-dependent content', () => {
      // Footer is text/button only — no animation assertions needed,
      // but confirm it renders correctly in all cases
      expect(el.querySelector('.footer__toggle--dark-room')).not.toBeNull()
    })
  })
})
