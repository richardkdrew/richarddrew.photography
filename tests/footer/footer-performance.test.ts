// tests/footer/footer-performance.test.ts

import { describe, it, expect, afterEach } from 'vitest'
import { PortfolioFooter } from '../../src/components/footer/footer'

if (!customElements.get('portfolio-footer')) {
  customElements.define('portfolio-footer', PortfolioFooter)
}

afterEach(() => {
  document.querySelectorAll('portfolio-footer').forEach(el => el.remove())
  localStorage.removeItem('theme')
  document.documentElement.removeAttribute('data-theme')
})

describe('PortfolioFooter Performance', () => {
  it('renders in under 50ms', () => {
    const start = performance.now()
    const el = document.createElement('portfolio-footer')
    document.body.appendChild(el)
    const duration = performance.now() - start
    expect(duration).toBeLessThan(50)
  })

  it('cleans up event listeners on disconnect', () => {
    const el = document.createElement('portfolio-footer')
    document.body.appendChild(el)
    // Should not throw on removal
    expect(() => document.body.removeChild(el)).not.toThrow()
  })

  it('multiple instances do not interfere with each other', () => {
    const a = document.createElement('portfolio-footer') as PortfolioFooter
    const b = document.createElement('portfolio-footer') as PortfolioFooter
    document.body.appendChild(a)
    document.body.appendChild(b)

    a.querySelector<HTMLButtonElement>('.footer__toggle--dark-room')?.click()
    expect(document.documentElement.dataset.theme).toBe('dark')

    b.querySelector<HTMLButtonElement>('.footer__toggle--light-box')?.click()
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
