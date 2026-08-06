# Architecture Documentation

> **Purpose**: Provide AI assistants with comprehensive architectural context for rapid understanding of system structure and technical decisions.
>
> **For Development Workflow**: See [DEVELOPMENT.md](DEVELOPMENT.md)

**Last Updated**: 2026-08-06
**Application Version**: Live in production (see Versioning Strategy for current tag format)
**Constitution Version**: 3.0.0

---

## Quick Reference

### Core Tech Stack
- **Language**: TypeScript → Vanilla JavaScript (ES2020+)
- **Build Tool**: Vite 5.x
- **Test Framework**: Vitest 1.x + Playwright 1.x
- **Component Model**: Web Components (Custom Elements)
- **Styling**: CSS Custom Properties (zero CSS-in-JS)
- **Deployment**: Cloudflare Pages (dual-environment)

### Key Commands
```bash
make dev           # Start dev server (localhost:3000)
make build         # Production build
make test-run      # Run all tests once (CI mode)
```

**For complete commands**: See [DEVELOPMENT.md - Commands Reference](DEVELOPMENT.md#commands-reference)

### Project Type
**Static photography portfolio** - No server-side rendering, no database, no authentication. Pure client-side web application with offline PWA capabilities.

---

## Constitutional Foundations

This architecture implements the principles defined in the project constitution ([`docs/CONSTITUTION.md`](CONSTITUTION.md) v3.0.0).

### Key Constitutional Principles Reflected in This Architecture

1. **Vanilla-First Architecture** (Principle 1)
   - Zero framework dependencies in production code
   - TypeScript as compile-time tool only
   - Web Components for modularity
   - Native Web APIs preferred (IntersectionObserver, View Transitions API, Storage API)

2. **CSS-Native Approach** (Principle 2)
   - All styling via CSS Custom Properties (design-system.css)
   - Zero CSS-in-JS or runtime style generation
   - GPU-accelerated animations (transform/opacity only)
   - Responsive design through CSS media queries

3. **Performance as a Feature** (Principle 3)
   - <50KB initial JS bundle (actual: ~26KB gzipped)
   - 60fps animations enforced
   - Lazy loading via IntersectionObserver
   - LQIP blur-up image loading

4. **Accessibility is Non-Negotiable** (Principle 4)
   - WCAG AA minimum compliance
   - Keyboard navigation for all interactive elements
   - Focus management in modals
   - `prefers-reduced-motion` support

5. **Test-Driven Development** (Principle 5)
   - 4-category test pattern (contract, UI, accessibility, performance)
   - 90%+ coverage requirement
   - Tests written before implementation

6. **Specification-First Development** (Principle 6)
   - Feature specs in `specs/{feature-id}/` before any code
   - User stories, acceptance criteria, implementation plan
   - No implementation without approved specification

7. **Component Organization** (Principle 7)
   - Dedicated folders per component in `src/components/{name}/`
   - Separation: logic (.ts), styles (.css), types (.types.ts)
   - Tests mirror structure in `tests/{name}/`

8. **Progressive Enhancement Strategy** (Principle 8)
   - Core content accessible without JavaScript
   - Features degrade gracefully
   - Service worker as optional enhancement

See the constitution for the complete philosophical foundation and all 20 principles.

---

## Table of Contents

1. [Architectural Principles](#architectural-principles)
2. [Directory Structure](#directory-structure)
3. [Component Architecture](#component-architecture)
4. [Build Pipeline](#build-pipeline)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Responsive System](#responsive-system)
7. [Performance Architecture](#performance-architecture)
8. [Data Flow](#data-flow)
9. [Browser Support](#browser-support)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance Metrics](#performance-metrics)
12. [Naming Conventions Quick Reference](#naming-conventions-quick-reference)
13. [Quick Troubleshooting](#quick-troubleshooting)

---

## Architectural Principles

### 1. Vanilla-First Philosophy

**Core Tenet**: "The web platform is powerful enough. Use it."

- **Zero framework dependencies** in production code
- TypeScript is compile-time only (no runtime overhead)
- Web Components for modularity without framework lock-in
- Native Web APIs preferred over libraries (IntersectionObserver, View Transitions API, etc.)

**Why**: Longevity, minimal bundle size, future-proof, no framework churn.

### 2. CSS-Native Approach

- **All styling via CSS Custom Properties** (design tokens in [design-system.css](../src/styles/design-system.css))
- **Zero JavaScript for responsive layouts** (CSS Grid, Flexbox, media queries only)
- **GPU-accelerated animations** (transform/opacity only, no layout triggers)
- **Native features first**: View Transitions API, Container Queries, CSS Grid

**Why**: Better performance, progressive enhancement, accessibility by default.

### 3. Progressive Enhancement

- Core content accessible without JavaScript
- Features degrade gracefully (View Transitions → instant navigation)
- Images use `<noscript>` fallbacks
- Service worker optional (offline enhancement)

### 4. Performance as Non-Negotiable

**Budget**:
- Initial JS bundle: <50KB gzipped (actual: ~26KB)
- Theme toggle: <100ms
- 60fps animations (16.67ms per frame)
- Lighthouse scores: 95+ all metrics

**Techniques**:
- Intersection Observer lazy loading (200px buffer)
- LQIP (Low Quality Image Placeholder) blur-up
- Code splitting via Vite dynamic imports
- WebP with JPEG fallback

### 5. Accessibility-First

- **WCAG AA minimum** (AAA where feasible)
- Keyboard navigation for all interactive elements
- Focus management in modals/overlays
- Color contrast verified (design tokens enforce compliance)
- `prefers-reduced-motion` support

### 6. Test-Driven Development

**Constitutional Requirement**: Write tests → verify failure → implement → verify success

- 4-category test pattern: Contract, UI, Accessibility, Performance
- 90%+ coverage requirement
- Tests live in `tests/{component}/` mirroring `src/components/{component}/`

---

## Directory Structure

```
richarddrew.photography/
├── .github/
│   └── workflows/           # CI/CD pipelines
│       ├── pr-checks.yml    # PR validation (tests, build, a11y)
│       ├── deploy-dev.yml   # Staging deployment (develop branch)
│       └── deploy-prod.yml  # Production deployment (main branch)
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # This file
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── BRANCH-PROTECTION.md # Git workflow rules
│
├── public/                  # Static assets (copied as-is to dist/)
│   ├── gallery-data.json    # Image manifest (structured data)
│   ├── images/
│   │   └── branding/        # Logos, favicons, PWA icons
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker (offline caching)
│
├── specs/                   # Feature specifications (spec-first development)
│   ├── 005-responsive-images/
│   ├── 006-dark-mode/
│   ├── 007-full-screen-image/
│   └── 008-add-build-actions/
│       ├── spec.md          # User stories, requirements, acceptance criteria
│       ├── plan.md          # Implementation tasks with dependencies
│       ├── research.md      # Technical decisions
│       └── data-model.md    # TypeScript interfaces
│
├── src/
│   ├── components/          # Web Components (modular, reusable)
│   │   ├── about-page/
│   │   │   ├── about-page.ts       # Component logic + Web Component class
│   │   │   ├── about-page.css      # Component-specific styles
│   │   │   ├── about-page.types.ts # TypeScript interfaces
│   │   │   └── about-page.html     # Template (optional, inline preferred)
│   │   ├── gallery/
│   │   │   ├── gallery.ts          # Masonry gallery logic
│   │   │   ├── gallery.css         # Gallery-specific styles
│   │   │   └── gallery.types.ts    # Gallery data model
│   │   ├── header/
│   │   │   ├── header.ts           # Responsive nav + hamburger menu
│   │   │   ├── header.css          # Header/nav styles
│   │   │   └── header.types.ts
│   │   ├── image-viewer/
│   │   │   ├── image-viewer.ts     # Full-screen modal viewer
│   │   │   ├── image-viewer.css    # Overlay styles
│   │   │   └── image-viewer.types.ts
│   │   └── theme-toggle/
│   │       ├── theme-toggle.ts     # Dark mode toggle component
│   │       ├── theme-toggle.css    # Toggle button styles
│   │       └── theme-toggle.types.ts
│   ├── pages/               # Page entry points
│   │   ├── main.ts          # index.html entry (gallery page)
│   │   └── about.ts         # about.html entry (bio page)
│   ├── plugins/
│   │   └── vite-plugin-version-injector.ts  # Inject VERSION into HTML
│   ├── services/
│   │   └── gallery-data.service.ts  # Fetch/parse gallery-data.json
│   ├── styles/
│   │   ├── design-system.css    # Design tokens (CSS Custom Properties)
│   │   └── global.css           # Global resets, typography
│   └── utils/
│       ├── picture-element-factory.ts  # Generate <picture> elements
│       ├── responsive-picture.ts       # Srcset/sizes logic
│       └── image-error-handler.ts      # Fallback for broken images
│
├── tests/                   # Test suites (mirrors src/components/)
│   ├── setup.ts             # Vitest global setup (JSDOM mocks)
│   ├── about-page/
│   │   ├── about-page-contract.test.ts      # API/interface tests
│   │   ├── about-page-ui.test.ts            # Behavior tests
│   │   ├── about-page-accessibility.test.ts # WCAG compliance
│   │   └── about-page-performance.test.ts   # Performance metrics
│   ├── gallery/
│   ├── header/
│   ├── image-viewer/
│   ├── theme-toggle/
│   └── version-injection/
│
├── index.html               # Gallery page (root)
├── about.html               # About/bio page
├── 404.html                 # Custom error page
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript compiler options
├── Makefile                 # Command interface (abstraction over tools)
├── CLAUDE.md                # Development guide for AI assistants
└── README.md                # Public project documentation
```

### Directory Patterns

**Components** (`src/components/`):
- Each component = dedicated folder
- Minimum 3 files: `.ts`, `.css`, `.types.ts`
- Optional `.html` (inline templates preferred for simplicity)

**Tests** (`tests/`):
- Mirror component structure exactly
- 4 test files per component (contract, ui, accessibility, performance)
- Naming: `{component}-{category}.test.ts`

**Specs** (`specs/`):
- One folder per feature (numbered: `001-`, `002-`, etc.)
- Minimum files: `spec.md`, `plan.md`
- Optional: `research.md`, `data-model.md`, `contracts/`

---

## Component Architecture

### Web Components Pattern

All components extend `HTMLElement` and use Custom Elements API:

```typescript
// Example: ThemeToggle Component
export class ThemeToggle extends HTMLElement {
  private theme: 'light' | 'dark' = 'light'

  connectedCallback() {
    this.render()
    this.attachEventListeners()
    this.loadTheme()
  }

  disconnectedCallback() {
    // Cleanup
  }

  private render() {
    this.innerHTML = `...` // Inline template
  }

  private attachEventListeners() {
    this.addEventListener('click', this.toggleTheme)
  }

  private toggleTheme = () => {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
    this.saveTheme()
    this.applyTheme()
  }
}

// Register custom element
customElements.define('theme-toggle', ThemeToggle)
```

### Component Communication

**Events** (preferred):
```typescript
// Dispatch custom event
this.dispatchEvent(new CustomEvent('image-click', {
  detail: { imageId: 'landscape-001' },
  bubbles: true
}))

// Listen for event
document.addEventListener('image-click', (e) => {
  const { imageId } = e.detail
})
```

**Direct API** (when parent-child):
```typescript
const viewer = document.querySelector('image-viewer')
viewer?.openImage(imageData)
```

### Lifecycle Hooks

1. `connectedCallback()` - Component added to DOM (setup, render, attach listeners)
2. `disconnectedCallback()` - Component removed from DOM (cleanup, remove listeners)
3. `attributeChangedCallback()` - Attribute changed (reactive updates)

### State Management

**No global state library**. State managed via:

1. **Component-local state** (TypeScript private properties)
2. **localStorage** (theme preference, persistent across sessions)
3. **URL state** (future: query params for gallery filters)
4. **DOM state** (ARIA attributes, data attributes)

Example:
```typescript
// Component state
private currentIndex = 0

// Persistent state
localStorage.setItem('theme', this.theme)

// DOM state
this.setAttribute('aria-expanded', 'true')
```

---

## Build Pipeline

### Vite Configuration

**File**: [vite.config.ts](../vite.config.ts)

```typescript
export default defineConfig({
  plugins: [versionInjector()],  // Inject VERSION env var into HTML
  build: {
    outDir: 'dist',
    target: 'es2020',              // Modern browsers only
    minify: 'esbuild',             // Fast minification
    sourcemap: true,               // Debug production builds
    rollupOptions: {
      input: {
        main: 'index.html',        // Multi-page app
        about: 'about.html',
        '404': '404.html'
      }
    }
  },
  server: {
    port: 3000,
    host: true  // Expose to network (mobile testing)
  }
})
```

### Build Process

1. **TypeScript Compilation** (`tsc`)
   - Strict mode enabled
   - Target: ES2020
   - Output: Vanilla JavaScript (no .ts in dist/)

2. **Vite Bundling**
   - Entry points: `index.html`, `about.html`, `404.html`
   - Code splitting: Dynamic imports → separate chunks
   - Tree shaking: Remove unused exports
   - CSS extraction: Separate `.css` files per page

3. **Version Injection**
   - Plugin reads `VERSION` environment variable
   - Injects `<meta name="version" content="v2026.004">` (or `v2026.dev-{sha}` on develop)
   - Injects `<meta name="build-date" content="2025-10-28T...">`

4. **Asset Optimization**
   - Images: Copied as-is (pre-optimized, hosted externally)
   - Fonts: Preloaded via `<link rel="preload">`
   - Icons: Inlined SVGs (small file size)

### Build Outputs

```
dist/
├── index.html              4.10 kB (gzipped: 1.61 kB)
├── about.html              3.87 kB (gzipped: 1.52 kB)
├── 404.html                5.08 kB (gzipped: 1.78 kB)
├── assets/
│   ├── main.css            8.28 kB (gzipped: 1.90 kB)
│   ├── main.js            25.97 kB (gzipped: 7.77 kB)  ← Gallery page JS
│   ├── header.css         11.65 kB (gzipped: 2.87 kB)
│   ├── header.js          10.11 kB (gzipped: 2.78 kB)  ← Header component
│   └── about.js            2.26 kB (gzipped: 0.96 kB)  ← About page JS
├── gallery-data.json
├── images/ (branding assets)
├── manifest.json
└── sw.js
```

**Total Initial Load** (index.html): ~26 kB JS + ~12 kB CSS (gzipped) = **~38 kB**

---

## Testing Strategy

### 4-Category Test Pattern

**Constitutional Requirement**: All components MUST have 4 test suites.

#### 1. Contract Tests (`*-contract.test.ts`)

**Purpose**: Verify API interfaces, public methods, component contracts.

```typescript
describe('Gallery Contract Tests', () => {
  it('MUST expose loadImages() method', () => {
    const gallery = document.createElement('masonry-gallery')
    expect(typeof gallery.loadImages).toBe('function')
  })

  it('MUST accept images array as input', () => {
    const gallery = document.createElement('masonry-gallery')
    expect(() => gallery.loadImages([])).not.toThrow()
  })
})
```

#### 2. UI Tests (`*-ui.test.ts`)

**Purpose**: Verify user interactions, DOM updates, behavior.

```typescript
describe('ThemeToggle UI Tests', () => {
  it('should toggle theme on click', async () => {
    const toggle = document.createElement('theme-toggle')
    document.body.appendChild(toggle)

    const button = toggle.querySelector('button')
    button?.click()

    await vi.waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })
})
```

#### 3. Accessibility Tests (`*-accessibility.test.ts`)

**Purpose**: Verify WCAG compliance, keyboard nav, ARIA attributes.

```typescript
describe('ImageViewer Accessibility Tests', () => {
  it('MUST support Escape key to close', () => {
    const viewer = document.createElement('image-viewer')
    viewer.openImage(mockImage)

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    viewer.dispatchEvent(event)

    expect(viewer.isOpen).toBe(false)
  })

  it('MUST trap focus when open', () => {
    const viewer = document.createElement('image-viewer')
    viewer.openImage(mockImage)

    // Tab through all focusable elements
    // Verify focus returns to first element after last
  })
})
```

#### 4. Performance Tests (`*-performance.test.ts`)

**Purpose**: Verify performance budgets, memory leaks, timing constraints.

```typescript
describe('ThemeToggle Performance Tests', () => {
  it('MUST toggle in under 100ms', async () => {
    const toggle = document.createElement('theme-toggle')
    const start = performance.now()

    toggle.querySelector('button')?.click()
    await vi.waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100)
  })
})
```

### Test Infrastructure

**Framework**: Vitest (Vite-native, fast, ESM-first)

**Environment**: JSDOM (simulates browser DOM in Node.js)

**Mocks** (in [tests/setup.ts](../tests/setup.ts)):
```typescript
// IntersectionObserver (for lazy loading tests)
global.IntersectionObserver = class {...}

// matchMedia (for responsive tests)
global.matchMedia = (query) => ({...})

// localStorage (for persistence tests)
global.localStorage = {...}
```

### Running Tests

```bash
make test-run          # Run all tests once (CI mode)
make test              # Watch mode (development)
make test-contract     # Contract tests only
make test-ui-tests     # UI tests only
make test-a11y         # Accessibility tests only
make test-perf         # Performance tests only
make test-coverage     # Generate coverage report (90%+ required)
make test-vitest-ui    # Open Vitest UI dashboard
```

### Test Coverage Requirements

- **Minimum**: 90% overall coverage
- **Current**: 98.9% (350/354 tests passing)
- **Failing Tests**: 4 JSDOM layout simulation issues (not real bugs)

---

## Responsive System

### 5-Breakpoint Architecture

**Breakpoints** (defined in [design-system.css](../src/styles/design-system.css)):

```css
:root {
  /* Breakpoints (rem-based for accessibility) */
  --breakpoint-mobile:       32rem;  /* 512px - Large mobile/landscape */
  --breakpoint-tablet:       48rem;  /* 768px - Tablet portrait */
  --breakpoint-large-tablet: 56rem;  /* 896px - Tablet landscape */
  --breakpoint-desktop:      80rem;  /* 1280px - Desktop */
  --breakpoint-large:        100rem; /* 1600px - Large desktop */
}
```

**Gallery Columns**:
- **<32rem** (Mobile): 1 column
- **32-48rem** (Large mobile): 2 columns
- **48-56rem** (Tablet): 3 columns
- **56-80rem** (Large tablet): 4 columns
- **≥80rem** (Desktop): 5 columns

### Responsive Images

**Pattern**: `<picture>` element with srcset + sizes.

```html
<picture>
  <source
    type="image/webp"
    srcset="img-400.webp 400w, img-800.webp 800w, img-1200.webp 1200w"
    sizes="(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, 29.3vw"
  />
  <source
    type="image/jpeg"
    srcset="img-400.jpg 400w, img-800.jpg 800w, img-1200.jpg 1200w"
    sizes="(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, 29.3vw"
  />
  <img src="img-800.jpg" alt="..." loading="lazy" />
</picture>
```

**Sizes Calculation** (CSS Custom Properties):
```css
/* Gallery: Accounts for page width (88% mobile, 92% desktop) + column divisions */
--sizes-gallery: "(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, (max-width: 56rem) 29.3vw, (max-width: 80rem) 23vw, 18.4vw";

/* Viewer: Full viewport (100vw at all breakpoints) */
--sizes-viewer: "100vw";

/* About: Hero image proportional to page container */
--sizes-about: "(max-width: 32rem) 88vw, (max-width: 48rem) 44vw, 35.2vw";
```

**Factory Pattern**: [picture-element-factory.ts](../src/utils/picture-element-factory.ts)

```typescript
const picture = new PictureElementFactory(imageData)
  .addSourceElement('webp')
  .addSourceElement('jpeg')
  .addImgElement()
  .create()
```

### Layout Strategy

**CSS Grid** (masonry-like layout):
```css
.masonry-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: var(--space-md);
}
```

**No JavaScript for responsive layout** (CSS-only media queries).

---

## Performance Architecture

### Lazy Loading

**Pattern**: IntersectionObserver API (never scroll events).

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement
      img.src = img.dataset.src!  // Load actual image
      observer.unobserve(img)     // Stop observing
    }
  })
}, {
  rootMargin: '200px'  // Start loading 200px before visible
})

images.forEach(img => observer.observe(img))
```

### LQIP (Low Quality Image Placeholder)

**Strategy**: Base64-encoded blur placeholder → sharp image on load.

```html
<img
  src="data:image/jpeg;base64,/9j/4AAQ..."  <!-- Tiny blur placeholder -->
  data-src="image-800.jpg"                   <!-- Actual image (lazy) -->
  class="blur-up"
  loading="lazy"
/>
```

```css
.blur-up {
  filter: blur(10px);
  transition: filter 0.3s ease-out;
}

.blur-up.loaded {
  filter: blur(0);
}
```

### Animation Performance

**GPU-Accelerated Only**:
```css
/* ✅ GOOD: Transform/opacity (composited, 60fps) */
.modal {
  transform: scale(0.95);
  opacity: 0;
  transition: transform 250ms, opacity 250ms;
}

.modal.open {
  transform: scale(1);
  opacity: 1;
}

/* ❌ BAD: Layout-triggering properties (causes reflow) */
.modal {
  width: 0;      /* Triggers layout */
  height: 0;     /* Triggers layout */
  top: -100px;   /* Triggers layout */
}
```

### Code Splitting

**Dynamic Imports**:
```typescript
// Lazy load image viewer only when needed
const openViewer = async (imageData: ImageData) => {
  const { ImageViewer } = await import('./components/image-viewer/image-viewer.js')
  const viewer = new ImageViewer()
  viewer.openImage(imageData)
}
```

### Service Worker Caching

**File**: [public/sw.js](../public/sw.js)

**Strategy**: Cache-first for static assets, network-first for API calls.

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
```

---

## Data Flow

### Gallery Data Architecture

**Source**: [public/gallery-data.json](../public/gallery-data.json)

**Schema**:
```typescript
interface GalleryManifest {
  images: ImageData[]
}

interface ImageData {
  id: string
  alt: string
  aspectRatio: number  // Width / height
  sources: ImageSource[]
}

interface ImageSource {
  format: 'webp' | 'jpeg'
  sizes: ImageSize[]
}

interface ImageSize {
  width: number
  height: number
  density: 1 | 2        // Retina support
  url: string
  breakpoint: string    // 'mobile' | 'tablet' | 'desktop'
}
```

**Example**:
```json
{
  "images": [
    {
      "id": "landscape-001",
      "alt": "Mountain landscape at golden hour",
      "aspectRatio": 1.5,
      "sources": [
        {
          "format": "jpeg",
          "sizes": [
            { "width": 400, "height": 267, "density": 1, "url": "...", "breakpoint": "mobile" },
            { "width": 800, "height": 533, "density": 1, "url": "...", "breakpoint": "tablet" },
            { "width": 1200, "height": 800, "density": 1, "url": "...", "breakpoint": "desktop" }
          ]
        }
      ]
    }
  ]
}
```

### Data Flow Diagram

```
User → Browser
  ↓
index.html loads
  ↓
main.ts entry point
  ↓
GalleryDataService.fetchImages()
  ↓
Fetch /gallery-data.json
  ↓
Parse & validate JSON
  ↓
MasonryGallery.loadImages(images)
  ↓
For each image:
  ↓
  PictureElementFactory.create()
    ↓
    Generate <picture> with srcset
    ↓
    IntersectionObserver.observe()
      ↓
      On intersection → load actual image
      ↓
      Replace blur placeholder with sharp image
```

### State Flow (Dark Mode Example)

```
User clicks ThemeToggle
  ↓
ThemeToggle.toggleTheme()
  ↓
localStorage.setItem('theme', newTheme)
  ↓
document.documentElement.dataset.theme = newTheme
  ↓
CSS Custom Properties update automatically
  ↓
All components re-render with new colors (CSS transition: 250ms)
  ↓
Storage event dispatched
  ↓
Other ThemeToggle instances sync (cross-tab support)
```

---

## Browser Support

### Target Browsers

**Modern browsers only** (ES2020+, no polyfills):

- ✅ **Chrome/Edge**: 90+ (2021+)
- ✅ **Firefox**: 88+ (2021+)
- ✅ **Safari**: 14+ (2020+)
- ✅ **Mobile Safari**: 14+ (iOS 14+)
- ✅ **Samsung Internet**: 15+ (2021+)

### Progressive Enhancement Strategy

**Core Features** (work everywhere):
- Image gallery (masonry layout via CSS Grid)
- Responsive navigation
- Image viewer modal
- Dark mode toggle

**Enhanced Features** (graceful degradation):
- **View Transitions API** (Chrome 126+, Edge 126+)
  - Fallback: Instant navigation (no transition)
- **AVIF images** (Chrome 85+, Firefox 93+)
  - Fallback: WebP → JPEG
- **Container Queries** (Chrome 105+, Safari 16+)
  - Fallback: Media queries

**Not Supported**:
- ❌ IE11 (EOL June 2022)
- ❌ Legacy Edge (<90)
- ❌ Safari <14

### Feature Detection

```javascript
// View Transitions API
if ('startViewTransition' in document) {
  document.startViewTransition(() => {
    // Navigation logic
  })
} else {
  // Instant navigation (no transition)
}

// IntersectionObserver (required, fail gracefully)
if ('IntersectionObserver' in window) {
  // Lazy load images
} else {
  // Load all images immediately
}
```

---

## Deployment Architecture

### Dual-Environment Strategy

**Two Cloudflare Pages Projects**:

1. **Staging** (`dev-richarddrew-photography`)
   - Branch: `develop`
   - URL: https://dev.richarddrew.photography
   - Versioning: `dev-{git-sha}` (e.g., `dev-a1b2c3d`)
   - Purpose: QA, preview features before production

2. **Production** (`richarddrew-photography`)
   - Branch: `main`
   - URL: https://richarddrew.photography
   - Versioning: Year-based sequential (e.g., `v2026.004`)
   - Purpose: Live site for users

### CI/CD Pipeline

**GitHub Actions Workflows**:

1. **PR Checks** ([pr-checks.yml](../.github/workflows/pr-checks.yml))
   - Triggers: Pull request to any branch
   - Jobs: Tests, Build, Accessibility, E2E (Playwright)
   - Status: Blocks merge if failing

2. **Staging Deployment** ([deploy-dev.yml](../.github/workflows/deploy-dev.yml))
   - Triggers: Push to `develop` branch
   - Steps: Build → Deploy to staging → Upload artifacts (30-day retention)
   - Version: `v{year}.dev-{sha}`

3. **Production Deployment** ([deploy-prod.yml](../.github/workflows/deploy-prod.yml))
   - Triggers: Push to `main` branch
   - Steps:
     1. Auto-tag with sequential `v{year}.NNN` counter (not conventional commits)
     2. Build with version injection
     3. Deploy to production
     4. Create GitHub Release with changelog
   - Version: `v{year}.NNN`

### Versioning Strategy

**Version Format**:
- **Dev**: `v{year}.dev-{sha}` (e.g. `v2026.dev-df8dd49`) — rebuilt on every push to `develop`
- **Prod**: `v{year}.NNN` (e.g. `v2026.004`) — sequential counter auto-incremented by the `tag` job in `deploy-prod.yml` on every push to `main`. Not semantic versioning, not driven by conventional commit types.
- **Local**: `v{year}.dev-local` (default when `VERSION` env var not set)

**Version Injection** (Vite plugin):
```html
<!-- Injected at build time -->
<meta name="version" content="v2026.004">
<meta name="build-date" content="2025-10-28T12:34:56Z">
```

### Rollback Procedure

1. **Cloudflare Dashboard**: Rollback to previous deployment
2. **Git Revert**: Revert commit on `main` → triggers new deployment
3. **Manual Deploy**: Download artifact from GitHub Actions → deploy via Wrangler CLI

---

## Performance Metrics

### Current Performance (Lighthouse)

- **Performance**: 98/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

### Bundle Size Budget

| Asset | Budget | Actual | Status |
|-------|--------|--------|--------|
| Initial JS (gzipped) | <50KB | 26KB | ✅ |
| Initial CSS (gzipped) | <20KB | 12KB | ✅ |
| Total initial load | <70KB | 38KB | ✅ |

### Timing Budget

| Metric | Budget | Actual | Status |
|--------|--------|--------|--------|
| Theme toggle | <100ms | ~50ms | ✅ |
| Image load initiation | <200ms | ~150ms | ✅ |
| Animation frame rate | 60fps | 60fps | ✅ |
| Full-screen viewer open | <300ms | ~250ms | ✅ |

### Test Coverage

- **Target**: 90%+
- **Actual**: 98.9% (350/354 passing)
- **Status**: ✅ Exceeds requirement

**For development workflows, coding standards, and troubleshooting**: See [DEVELOPMENT.md](DEVELOPMENT.md)

---

## Naming Conventions Quick Reference

**Files**: `kebab-case.ts`, `kebab-case.css`, `{name}-{category}.test.ts`
**Classes**: `PascalCase` (TypeScript), `.kebab-case` (CSS)
**Variables**: `camelCase` (TypeScript), `--kebab-case` (CSS Custom Properties)
**Custom Elements**: `<kebab-case>` (must have hyphen)

**For complete code standards**: See [DEVELOPMENT.md - Code Standards](DEVELOPMENT.md#code-standards)

---

## Quick Troubleshooting

**Common Issues**:

- **JSDOM test failures**: Verify in real browser with `npm run test:e2e` (Playwright)
- **Build fails**: Run `npx tsc --noEmit` for detailed TypeScript errors
- **Images not loading**: `make validate-manifest && make check-images`
- **Dark mode not persisting**: Check localStorage availability
- **Tests pass locally, fail in CI**: Increase timeouts in `vi.waitFor()`

**For complete troubleshooting**: See [DEVELOPMENT.md - Troubleshooting](DEVELOPMENT.md#troubleshooting)

---

## Additional Resources

### Documentation

- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md) - Workflows, code standards, testing, troubleshooting
- **Constitution**: [docs/CONSTITUTION.md](CONSTITUTION.md) - Development principles (v3.0.0)
- **AI Guide**: [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md) - CI/CD setup and troubleshooting
- **Branch Protection**: [BRANCH-PROTECTION.md](BRANCH-PROTECTION.md) - Git workflow rules

### Reference Examples

- **Feature Specs**: [specs/008-add-build-actions/](../specs/008-add-build-actions/) - Complete spec/plan example
- **Gallery Component**: [src/components/gallery/](../src/components/gallery/) - Masonry layout, lazy loading
- **ImageViewer Component**: [src/components/image-viewer/](../src/components/image-viewer/) - Full-screen modal
- **ThemeToggle Component**: [src/components/theme-toggle/](../src/components/theme-toggle/) - Dark mode implementation
- **Header Component**: [src/components/header/](../src/components/header/) - Responsive navigation

---

## For AI Assistants

When starting a new task:

1. **Understand the system**: Read relevant sections in this document (ARCHITECTURE.md)
2. **Learn the workflow**: Read [DEVELOPMENT.md](DEVELOPMENT.md) for processes and standards
3. **Follow the constitution**: Review [docs/CONSTITUTION.md](CONSTITUTION.md)
4. **Study patterns**: Check existing components in `src/components/`
5. **Match the tier to the task**: feature-tier work (new components) gets spec/plan/TDD via superpowers; fix-tier work (bug fixes, small changes) gets tests appropriate to the change and goes straight to a PR — see CONSTITUTION.md Section V.

**Remember**: Feature-tier work is spec-first with full TDD and TodoWrite tracking; fix-tier work is lighter-weight but still tested. Coverage target is 90%+, not an enforced gate.

---

**End of Architecture Documentation**
