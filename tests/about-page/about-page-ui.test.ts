/**
 * E2E Tests: About Page UI Behavior
 * Simple tests for user interface behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../../src/components/about-page/about-page'

describe('About Page UI Tests', () => {
  let aboutPage: HTMLElement
  let container: HTMLElement

  beforeEach(async () => {
    container = document.createElement('div')
    container.className = 'page-container'
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
                alt="Professional headshot portrait"
                loading="eager"
                width="400"
                height="600">
            </picture>
          </div>
          <div class="about-hero__text">
            <p class="about-hero__summary professional-summary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>
      </section>
    `
    container.appendChild(aboutPage)

    // Wait for component to connect
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  afterEach(() => {
    container.remove()
  })

  describe('Hero Section', () => {
    it('should display hero section with image and text', () => {
      const heroSection = aboutPage.querySelector('.about-hero')
      expect(heroSection).toBeTruthy()

      const heroImage = heroSection?.querySelector('.about-hero__image')
      const heroSummary = heroSection?.querySelector('.about-hero__summary')

      expect(heroImage).toBeTruthy()
      expect(heroSummary).toBeTruthy()
    })

    it('should have proper image structure', () => {
      const picture = aboutPage.querySelector('picture')
      const source = aboutPage.querySelector('source[type="image/webp"]')
      const img = aboutPage.querySelector('img')

      expect(picture).toBeTruthy()
      expect(source).toBeTruthy()
      expect(img).toBeTruthy()
    })

    it('should have professional summary text', () => {
      const summary = aboutPage.querySelector('.professional-summary')
      expect(summary).toBeTruthy()
      expect(summary?.textContent).toBeTruthy()
    })
  })

  describe('Image Attributes', () => {
    it('should have proper alt text', () => {
      const img = aboutPage.querySelector('img')
      expect(img?.getAttribute('alt')).toBeTruthy()
    })

    it('should have width and height attributes', () => {
      const img = aboutPage.querySelector('img')
      expect(img?.getAttribute('width')).toBeTruthy()
      expect(img?.getAttribute('height')).toBeTruthy()
    })

    it('should use eager loading for hero image', () => {
      const img = aboutPage.querySelector('img')
      expect(img?.getAttribute('loading')).toBe('eager')
    })
  })
})
