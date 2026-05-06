// src/components/footer/footer.ts

import './footer.css'

type Theme = 'light' | 'dark'

export class PortfolioFooter extends HTMLElement {
  private _currentTheme: Theme = 'light'

  connectedCallback(): void {
    this.setAttribute('role', 'contentinfo')
    this._currentTheme = this.readTheme()
    this.render()
    this.applyTheme()
    this.attachListeners()
  }

  disconnectedCallback(): void {
    document.removeEventListener('theme:changed', this.handleThemeChanged)
    window.removeEventListener('storage', this.handleStorageChange)
  }

  private readTheme(): Theme {
    const stored = localStorage.getItem('theme')
    return stored === 'dark' ? 'dark' : 'light'
  }

  private readVersion(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="version"]')
      ?.getAttribute('content') || 'dev-local'
  }

  private render(): void {
    const version = this.readVersion()
    const year = new Date().getFullYear()

    this.innerHTML = `
      <div class="footer__container">
        <p class="footer__meta">
          <span class="footer__version">${version}</span>
          &nbsp;© ${year} Richard Drew Photography
        </p>
        <div class="footer__toggle-group">
          <button
            class="footer__toggle footer__toggle--dark-room"
            aria-label="Switch to dark mode"
          >Dark Room</button>
          <button
            class="footer__toggle footer__toggle--light-box"
            aria-label="Switch to light mode"
          >Light Box</button>
        </div>
      </div>
    `
  }

  private applyTheme(): void {
    document.documentElement.dataset.theme = this._currentTheme
  }

  private toggle(): void {
    const previous = this._currentTheme
    this._currentTheme = this._currentTheme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', this._currentTheme)
    this.applyTheme()
    document.dispatchEvent(new CustomEvent('theme:changed', {
      detail: { theme: this._currentTheme, previousTheme: previous },
      bubbles: true,
      composed: true
    }))
  }

  private attachListeners(): void {
    this.querySelector('.footer__toggle--dark-room')
      ?.addEventListener('click', () => this.toggle())
    this.querySelector('.footer__toggle--light-box')
      ?.addEventListener('click', () => this.toggle())

    this.querySelectorAll<HTMLButtonElement>('.footer__toggle').forEach(btn => {
      btn.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.toggle()
        }
      })
    })

    document.addEventListener('theme:changed', this.handleThemeChanged)
    window.addEventListener('storage', this.handleStorageChange)
  }

  private handleThemeChanged = (e: Event): void => {
    const theme = (e as CustomEvent<{ theme: Theme }>).detail?.theme
    if (theme && theme !== this._currentTheme) {
      this._currentTheme = theme
      this.applyTheme()
    }
  }

  private handleStorageChange = (e: StorageEvent): void => {
    if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
      this._currentTheme = e.newValue
      this.applyTheme()
    }
  }
}

if (!customElements.get('portfolio-footer')) {
  customElements.define('portfolio-footer', PortfolioFooter)
}
