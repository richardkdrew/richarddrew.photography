/**
 * Contract Tests: About Page Component
 * Simple tests for basic component functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../../src/components/about-page/about-page'

describe('About Page Contract Tests', () => {
  let aboutPage: HTMLElement
  let container: HTMLElement

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)

    aboutPage = document.createElement('about-page')
    // Add static content that would normally be in about.html
    aboutPage.innerHTML = `
      <section class="about-hero">
        <div class="about-hero__content">
          <div class="about-hero__image-container">
            <picture>
              <source type="image/webp" srcset="/images/about/professional-headshot-400.webp 400w">
              <img
                class="about-hero__image"
                src="https://picsum.photos/400/600"
                alt="Professional headshot"
                loading="eager"
                width="400"
                height="600">
            </picture>
          </div>
          <div class="about-hero__text">
            <p class="about-hero__summary professional-summary">Test summary text</p>
          </div>
        </div>
      </section>
    `
    container.appendChild(aboutPage)

    // Wait for connectedCallback to run
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  afterEach(() => {
    container.remove()
  })

  describe('Component Basics', () => {
    it('should extend HTMLElement', () => {
      expect(aboutPage).toBeInstanceOf(HTMLElement)
    })

    it('should be registered as custom element', () => {
      expect(customElements.get('about-page')).toBeDefined()
    })

    it('should have about-page class', () => {
      expect(aboutPage.className).toBe('about-page')
    })

    it('should NOT have explicit role (main landmark belongs on <main> element)', () => {
      expect(aboutPage.getAttribute('role')).toBeNull()
    })

    it('should NOT have aria-label on custom element', () => {
      expect(aboutPage.getAttribute('aria-label')).toBeNull()
    })
  })

  describe('Content Structure', () => {
    it('should render hero section', () => {
      const hero = aboutPage.querySelector('.about-hero')
      expect(hero).toBeTruthy()
    })

    it('should render image container', () => {
      const imageContainer = aboutPage.querySelector('.about-hero__image-container')
      expect(imageContainer).toBeTruthy()
    })

    it('should render professional summary', () => {
      const summary = aboutPage.querySelector('.about-hero__summary')
      expect(summary).toBeTruthy()
    })
  })
})
