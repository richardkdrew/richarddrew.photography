# Smart Auto-Hide Header + Semantic HTML Fixes

**Date**: 2026-05-06
**Branch**: to be created from `develop`
**Status**: Approved, ready for implementation planning

---

## Overview

Two concerns addressed together because they share the same files:

1. **Semantic HTML fixes** — critical ARIA/landmark errors found in a structured review. Existing accessibility tests were asserting the wrong behavior, which is why they never caught these issues.
2. **Smart auto-hide header** — header hides on downward scroll (after threshold), reappears on upward scroll (after threshold). Header moves outside `.page-container` as part of this work.

---

## Part 1 — Semantic HTML Fixes

### Issues to Fix

| Issue | File(s) | Change |
|---|---|---|
| Double `main` landmark | `index.html`, `about-page.ts` | Remove `role="main"` from `<uniform-gallery>` in `index.html`; remove lines 16–17 (`role="main"` and `aria-label="About page"`) from `about-page.ts` `connectedCallback` |
| Double `banner` landmark | `index.html`, `about.html`, `header.ts` | Remove `role="banner"` attribute from `<portfolio-header>` in both HTML files; remove `this.setAttribute('role', 'banner')` from `initialize()` in `header.ts` — inner `<header>` carries it implicitly |
| Redundant `role="navigation"` | `header.ts` template | Remove `role="navigation"` from both `<nav>` elements in the template — implicit on `<nav>` |
| Unnamed `<section>` | `about.html` | Replace `<section class="about-container">` with `<div class="about-container">` |
| Missing `<h1>` on gallery page | `index.html` | Add `<h1 class="sr-only">Portfolio</h1>` as first child of `<main>` |
| Missing `<h1>` on about page | `about-page.ts` template | Add `<h1 class="about-hero__heading">About</h1>` as first child of `.about-hero__text` div, before the `<p>` element |
| Dual logo `alt` text | `header.ts` template | Change both logo `img` `alt` to `""` — link `aria-label="Richard Drew Portfolio Home"` is the accessible name |

### Visually Hidden Utility Class

Add to `design-system.css` (only if not already present):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Part 2 — HTML Structure Restructure

### Current Structure (all pages)

```html
<body>
  <div class="page-container">
    <portfolio-header ...></portfolio-header>   <!-- inside width container -->
    <main>...</main>
  </div>
  <image-viewer ...></image-viewer>
</body>
```

### Target Structure (all pages)

```html
<body>
  <portfolio-header ...></portfolio-header>     <!-- top-level, full viewport -->
  <div class="page-container">
    <main>...</main>
  </div>
  <image-viewer ...></image-viewer>
</body>
```

**Pages to update:** `index.html`, `about.html`, `404.html`, `public/404.html`

`.header__container` currently inherits width from `.page-container`. Once `portfolio-header` is outside, it must manage its own width:

```css
/* header.css — give header__container its own width management */
.header__container {
  width: var(--page-width-full);      /* 96%, matches page-container */
  margin: 0 auto;
  /* ...existing styles unchanged */
}

@media (min-width: 52.5rem) {
  .header__container {
    width: var(--page-width-constrained);  /* 92% */
  }
}
```

Remove the comment `/* Width is now handled by .page-container parent */`.

`.page-container` gets `padding-top` to compensate for the fixed header height (set dynamically by JS):

```css
/* design-system.css */
.page-container {
  padding-top: var(--header-height, 5.5rem);  /* 5.5rem fallback covers first paint */
  /* ...existing styles unchanged */
}
```

---

## Part 3 — Smart Auto-Hide Header

### Behavior

- **Scroll down** past 30px accumulated delta → header slides off the top (`translateY(-100%)`)
- **Scroll up** past 30px accumulated delta → header slides back into view
- **At `scrollY === 0`** → always visible, reset accumulated delta
- **Portrait mobile (`width < 768px`)** → scroll behavior disabled; header always visible
- **Landscape iPhone Pro and larger (`width >= 768px`)** → same behavior as desktop
- **Mobile menu open** → header never hidden regardless of scroll direction
- **`prefers-reduced-motion`** → class toggle still happens, `transition: none` (snaps instantly)

### New Design System Token

```css
/* design-system.css */
--transition-slow: 350ms ease-out;
```

### CSS Changes — `header.css`

```css
/* portfolio-header: fixed, full viewport width, slide transition */
.portfolio-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  padding-top: 1.25rem;
  transition: transform var(--transition-slow);
  will-change: transform;
}

/* Hidden state */
.portfolio-header.header--hidden {
  transform: translateY(-100%);
}

/* Reduced motion: snap, no animation */
@media (prefers-reduced-motion: reduce) {
  .portfolio-header {
    transition: none;
  }
}
```

Flatten the stacking context: `.header__container` and `.header__branding` z-index values (`1001`) can be reduced once `portfolio-header` is a top-level element with its own stacking context.

### JS Changes — `header.ts`

New private state:

```typescript
private static readonly SCROLL_THRESHOLD = 30
private static readonly MOBILE_BREAKPOINT = 768  // already exists

private lastScrollY = 0
private scrollDelta = 0
private scrollEnabled = false
private scrollListener: (() => void) | null = null
```

New methods:

**`measureAndSetHeight()`** — called after `initialize()` and on resize:
```typescript
private measureAndSetHeight(): void {
  const height = this.getBoundingClientRect().height
  document.documentElement.style.setProperty('--header-height', `${height}px`)
}
```

**`setupScrollBehavior()`** — called after init:
```typescript
private setupScrollBehavior(): void {
  this.scrollEnabled = window.innerWidth >= Header.MOBILE_BREAKPOINT
  this.lastScrollY = window.scrollY
  this.scrollDelta = 0

  this.scrollListener = () => {
    if (!this.scrollEnabled) return

    const currentY = window.scrollY
    const direction = currentY > this.lastScrollY ? 'down' : 'up'
    const delta = Math.abs(currentY - this.lastScrollY)

    if (direction === 'down') {
      this.scrollDelta = this.scrollDelta > 0 ? this.scrollDelta + delta : delta
    } else {
      this.scrollDelta = this.scrollDelta < 0 ? this.scrollDelta - delta : -delta
    }

    this.lastScrollY = currentY

    if (currentY === 0) {
      this.showHeader()
      this.scrollDelta = 0
      return
    }

    const isHidden = this.classList.contains('header--hidden')

    if (this.scrollDelta >= Header.SCROLL_THRESHOLD && !this._isMobileMenuOpen && !isHidden) {
      this.hideHeader()
    } else if (this.scrollDelta <= -Header.SCROLL_THRESHOLD && isHidden) {
      this.showHeader()
    }
  }

  window.addEventListener('scroll', this.scrollListener, { passive: true })
}
```

**`hideHeader()` / `showHeader()`**:
```typescript
private hideHeader(): void {
  this.classList.add('header--hidden')
  this.dispatchEvent(new CustomEvent('header:scroll-hide', { bubbles: true }))
}

private showHeader(): void {
  this.classList.remove('header--hidden')
  this.dispatchEvent(new CustomEvent('header:scroll-show', { bubbles: true }))
}
```

**`handleResize()` update** — add to existing method:
```typescript
this.measureAndSetHeight()
this.scrollEnabled = window.innerWidth >= Header.MOBILE_BREAKPOINT
if (!this.scrollEnabled) this.showHeader()  // reset when switching to mobile
```

**`closeMobileMenu()` update** — when mobile menu closes, reset scroll tracking from current position:
```typescript
this.lastScrollY = window.scrollY
this.scrollDelta = 0
```

**`destroy()` update** — remove scroll listener:
```typescript
if (this.scrollListener) {
  window.removeEventListener('scroll', this.scrollListener)
}
```

---

## Part 4 — Test Changes

### Tests That Need Correcting (asserting wrong behavior)

**`tests/header/header-accessibility.test.ts`**

| Current (wrong) assertion | Corrected assertion |
|---|---|
| `expect(headerElement?.getAttribute('role')).toBe('banner')` | `expect(headerElement?.getAttribute('role')).toBeNull()` — role is on inner `<header>` |
| `expect(navigation?.getAttribute('role')).toBe('navigation')` | `expect(navigation?.getAttribute('role')).toBeNull()` — implicit on `<nav>` |
| `expect(mobileNav?.getAttribute('role')).toBe('navigation')` | `expect(mobileNav?.getAttribute('role')).toBeNull()` |
| `expect(banner).toBe('banner')` (screen reader test) | Assert that inner `<header>` element exists and carries the landmark implicitly |
| `expect(mainNav?.getAttribute('role')).toBe('navigation')` | `expect(mainNav?.getAttribute('role')).toBeNull()` |
| Logo `alt` assertion `toBe('Richard Drew')` | Update to `toBe('')` after logo alt change |

### New Tests — `header-accessibility.test.ts`

```
- inner <header> element exists (carries banner landmark implicitly via element semantics)
- custom element does NOT have role="banner"
- no <nav> element has explicit role="navigation"
- header is visible at scrollY=0 (no header--hidden class)
- header:scroll-hide event fires after 30px+ downward accumulation
- header:scroll-show event fires after 30px+ upward accumulation
- header--hidden is not applied when mobile menu is open
- --header-height CSS variable is set on :root after init
```

### New Tests — `header-contract.test.ts`

```
- header:scroll-hide custom event is dispatched with bubbles: true
- header:scroll-show custom event is dispatched with bubbles: true
- showHeader() removes header--hidden class
- hideHeader() adds header--hidden class
- scrollEnabled is false when window.innerWidth < 768
- scrollEnabled is true when window.innerWidth >= 768
```

### New Tests — `header-ui.test.ts`

```
- scroll down 31px → adds header--hidden class
- scroll down 29px → does NOT add header--hidden class (below threshold)
- scroll down 31px then up 31px → removes header--hidden class
- scroll down 31px with mobile menu open → does NOT add header--hidden
- scroll to top (scrollY=0) → removes header--hidden
- resize to < 768px → removes header--hidden, disables scroll behavior
- resize to >= 768px → enables scroll behavior
```

### New Tests — `header-performance.test.ts`

```
- scroll listener is registered with { passive: true }
- measureAndSetHeight does not read layout properties during scroll events (only on init/resize)
```

---

## Acceptance Criteria

- [ ] Zero duplicate ARIA landmark roles in the accessibility tree
- [ ] `<h1>` present on every page
- [ ] `portfolio-header` is a direct child of `<body>` on all pages
- [ ] `--header-height` CSS variable set correctly after header init
- [ ] Header hides after 30px downward scroll on desktop/landscape
- [ ] Header shows after 30px upward scroll on desktop/landscape
- [ ] Header never hidden on portrait mobile (< 768px width)
- [ ] Header always visible when mobile menu is open
- [ ] Header always visible at `scrollY === 0`
- [ ] Scroll listener is passive (no performance regression)
- [ ] All existing tests pass with corrected assertions
- [ ] All new tests pass
- [ ] 90%+ test coverage maintained
