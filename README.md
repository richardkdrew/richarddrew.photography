# Richard Drew Photography

[![Dev Deploy](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-dev.yml/badge.svg?branch=develop)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-dev.yml)
[![Prod Deploy](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-prod.yml/badge.svg)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-prod.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

A professional photography portfolio with a focus on image quality, fast loading, and a clean viewing experience across all devices.

## Features

### Gallery

- Justified grid layout — images display at consistent row heights with natural aspect ratios preserved, no cropping
- Scroll-reveal animation — images fade in as you scroll, above-fold images appear immediately
- Full-screen viewer — click any image to open a lightbox with keyboard navigation (arrow keys, Escape) and swipe support on mobile
- LQIP placeholders — a blurred low-quality preview shows instantly while the full image loads

### Images

- Native lazy loading — first 6 images load eagerly with high fetch priority; the rest load on demand
- Responsive srcset — the browser selects the right image size for the screen
- WebP/AVIF support with JPEG fallback

### Experience

- Dark mode — system preference detected automatically, toggleable, persists across sessions
- Mobile-first — touch-optimised, full-width gallery on small screens, hamburger navigation
- Smooth page transitions using the View Transitions API
- Installable as a PWA with offline support

### Performance & Quality

- Lighthouse scores (mobile, local): Performance 83, Accessibility 100, Best Practices 96, SEO 100
- WCAG AA accessibility throughout
- 414 automated tests across unit, UI, accessibility, and performance categories

## Built With

TypeScript compiled to vanilla JavaScript, Web Components (no framework), Vite, Vitest, deployed on Cloudflare Pages.

## Development

```bash
make dev           # Start dev server at localhost:3000
make test-run      # Run tests + Lighthouse audit (pre-commit gate)
make build         # Production build
make lighthouse    # Lighthouse audit only (builds first)
make lighthouse-full  # Lighthouse with full HTML report → reports/lighthouse.html
```

## Documentation

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) — workflow, code standards, commands
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — component structure, data flow, build pipeline
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Cloudflare Pages setup, CI/CD, rollback
