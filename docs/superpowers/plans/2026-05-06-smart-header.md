# Smart Auto-Hide Header + Semantic HTML Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical ARIA landmark errors across the site and implement a scroll-triggered auto-hide header that slides off on downward scroll and returns on upward scroll.

**Architecture:** `portfolio-header` moves to a top-level fixed element (outside `div.page-container`), width-managed internally. A passive scroll listener in `header.ts` accumulates directional scroll delta and toggles `.header--hidden` (CSS `translateY(-100%)`) after a 30px threshold. Existing tests that were asserting the wrong ARIA behavior are corrected first (TDD red → green).

**Tech Stack:** TypeScript, Web Components, Vite, Vitest, CSS custom properties (design tokens)

---

## File Map

| File | Change type | What changes |
|---|---|---|
| `src/styles/design-system.css` | Modify | Add `--transition-slow` token, `.sr-only` class, `padding-top` on `.page-container` |
| `src/components/header/header.ts` | Modify | Remove `role="banner"` from `initialize()`; remove `role="navigation"` from nav template; fix logo `alt=""`; add scroll state + 5 new methods |
| `src/components/header/header.css` | Modify | Make `.portfolio-header` fixed; add `.header--hidden`; give `.header__container` own width; reduced-motion override |
| `src/components/about-page/about-page.ts` | Modify | Remove `role="main"` + `aria-label` from `connectedCallback`; add `<h1>` to template |
| `index.html` | Modify | Move `portfolio-header` outside `.page-container`; add sr-only `<h1>`; remove `role="main"` from `<uniform-gallery>` |
| `about.html` | Modify | Move `portfolio-header` outside `.page-container`; `<section>` → `<div>` for about-container |
| `404.html` | Modify | Move `portfolio-header` outside `.page-container` |
| `public/404.html` | Modify | Move `portfolio-header` outside `.page-container` |
| `tests/header/header-contract.test.ts` | Modify | Fix 3 wrong assertions; add 6 new contract tests |
| `tests/header/header-accessibility.test.ts` | Modify | Fix 5 wrong assertions; add 6 new accessibility tests |
| `tests/header/header-ui.test.ts` | Modify | Fix 2 wrong assertions; add 7 new UI tests |
| `tests/header/header-performance.test.ts` | Modify | Add 2 new performance tests |
| `tests/about-page/about-page-accessibility.test.ts` | Modify | Fix any `role="main"` assertions |

---

## Task 1: Design System CSS Additions

**Files:**
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Add `--transition-slow` token**

In `src/styles/design-system.css`, find the transitions block (around line 72) and add after `--transition-medium`:

```css
  --transition-slow: 350ms ease-out;
```

Result:
```css
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-medium: 250ms ease-out;
  --transition-slow: 350ms ease-out;
```

- [ ] **Step 2: Add `.sr-only` utility class**

After the `@media print` block at the bottom of `design-system.css`, add:

```css
/* Visually hidden but accessible to screen readers */
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

- [ ] **Step 3: Add `padding-top` to `.page-container`**

Find `.page-container` (around line 267):

```css
.page-container {
  width: var(--page-width-full);
  margin: 0 auto;
  box-sizing: border-box;
}
```

Change to:

```css
.page-container {
  width: var(--page-width-full);
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: var(--header-height, 5.5rem);
}
```

- [ ] **Step 4: Verify no tests broken**

```bash
make test-run
```

Expected: all existing tests pass (CSS-only change, no JS behaviour touched yet).

- [ ] **Step 5: Commit**

```bash
git add src/styles/design-system.css
git commit -m "style: add transition-slow token, sr-only utility, header-height offset on page-container"
```

---

## Task 2: Fix Wrong ARIA Test Assertions (Red Phase)

The existing header tests assert incorrect behavior (the bugs we're fixing). Correct them first so they fail, then fix the code to make them pass.

**Files:**
- Modify: `tests/header/header-contract.test.ts`
- Modify: `tests/header/header-accessibility.test.ts`
- Modify: `tests/header/header-ui.test.ts`

- [ ] **Step 1: Fix `header-contract.test.ts`**

Find and update these three assertions:

**Change 1** — "MUST have banner role" test (around line 31):
```typescript
// BEFORE (wrong):
it('MUST have banner role for accessibility', () => {
  expect(header.getAttribute('role')).toBe('banner')
})

// AFTER (correct — inner <header> carries banner, not the custom element):
it('MUST NOT have explicit banner role on custom element (inner <header> carries it implicitly)', () => {
  expect(header.getAttribute('role')).toBeNull()
})
```

**Change 2** — logo alt assertion (around line 53):
```typescript
// BEFORE (wrong):
expect(logo.alt).toBe('Richard Drew')

// AFTER (correct — link aria-label is the accessible name; alt is empty):
expect(logo.alt).toBe('')
```

**Change 3** — logo fallback test (around line 59):
```typescript
// BEFORE (wrong — empty alt would fail these):
it('MUST have fallback for logo loading', () => {
  const logo = header.querySelector('.header__logo') as HTMLImageElement
  expect(logo.alt).toBeTruthy()
  expect(logo.alt.length).toBeGreaterThan(0)
})

// AFTER (correct — accessible name is on the link, not the img):
it('MUST have accessible logo link name (not alt text)', () => {
  const logoLink = header.querySelector('.header__logo-link') as HTMLAnchorElement
  expect(logoLink.getAttribute('aria-label')).toBe('Richard Drew Portfolio Home')
})
```

**Change 4** — nav role assertions (around line 91):
```typescript
// BEFORE (wrong):
expect(mainNav?.getAttribute('role')).toBe('navigation')
expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
expect(mobileNav?.getAttribute('role')).toBe('navigation')
expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')

// AFTER (correct — role="navigation" is implicit on <nav>, not explicit):
expect(mainNav?.getAttribute('role')).toBeNull()
expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
expect(mobileNav?.getAttribute('role')).toBeNull()
expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
```

- [ ] **Step 2: Fix `header-accessibility.test.ts`**

**Change 1** — logo alt assertion (around line 28):
```typescript
// BEFORE:
expect(logo.alt.trim()).toBe('Richard Drew')
expect(logo.alt.length).toBeGreaterThan(0)

// AFTER:
expect(logo.alt).toBe('')
```

**Change 2** — landmark roles test (around line 57):
```typescript
// BEFORE:
it('should have proper landmark roles', () => {
  const headerElement = header
  const navigation = header.querySelector('.header__navigation')
  const mobileNav = header.querySelector('.header__mobile-nav')

  expect(headerElement?.getAttribute('role')).toBe('banner')
  expect(navigation?.getAttribute('role')).toBe('navigation')
  expect(mobileNav?.getAttribute('role')).toBe('navigation')
})

// AFTER:
it('should have proper landmark roles', () => {
  const innerHeader = header.querySelector('header')
  const navigation = header.querySelector('.header__navigation')
  const mobileNav = header.querySelector('.header__mobile-nav')

  // Custom element must NOT carry explicit role — inner <header> provides banner semantics
  expect(header.getAttribute('role')).toBeNull()
  // <nav> elements must NOT carry explicit role — it is implicit
  expect(navigation?.getAttribute('role')).toBeNull()
  expect(mobileNav?.getAttribute('role')).toBeNull()
  // But the inner <header> element must exist
  expect(innerHeader).toBeTruthy()
  // And nav elements must have accessible names
  expect(navigation?.getAttribute('aria-label')).toBe('Main navigation')
  expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
})
```

**Change 3** — screen reader banner test (around line 237):
```typescript
// BEFORE:
it('should provide clear navigation structure', () => {
  const banner = header.getAttribute('role')
  const navigation = header.querySelector('[role="navigation"]')
  expect(banner).toBe('banner')
  expect(navigation).toBeTruthy()
})

// AFTER:
it('should provide clear navigation structure', () => {
  // Inner <header> provides the banner landmark — custom element must not duplicate it
  const innerHeader = header.querySelector('header')
  expect(innerHeader).toBeTruthy()
  expect(header.getAttribute('role')).toBeNull()
  // Navigation landmark comes from <nav> elements, not explicit role attribute
  const nav = header.querySelector('nav')
  expect(nav).toBeTruthy()
})
```

**Change 4** — nav role and name test (around line 223):
```typescript
// BEFORE:
it('should have proper role and name for navigation landmarks', () => {
  const mainNav = header.querySelector('.header__navigation')
  const mobileNav = header.querySelector('.header__mobile-nav')
  expect(mainNav?.getAttribute('role')).toBe('navigation')
  expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
  expect(mobileNav?.getAttribute('role')).toBe('navigation')
  expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
})

// AFTER:
it('should have proper role and name for navigation landmarks', () => {
  const mainNav = header.querySelector('.header__navigation')
  const mobileNav = header.querySelector('.header__mobile-nav')
  // Role is implicit on <nav> — must NOT be set explicitly
  expect(mainNav?.getAttribute('role')).toBeNull()
  expect(mainNav?.getAttribute('aria-label')).toBe('Main navigation')
  expect(mobileNav?.getAttribute('role')).toBeNull()
  expect(mobileNav?.getAttribute('aria-label')).toBe('Mobile navigation')
})
```

- [ ] **Step 3: Fix `header-ui.test.ts`**

**Change 1** — "should render header with proper role" (around line 27):
```typescript
// BEFORE:
it('should render header with proper role', () => {
  expect(header.getAttribute('role')).toBe('banner')
  expect(header.className).toBe('portfolio-header')
})

// AFTER:
it('should render header with correct class and no explicit role', () => {
  expect(header.getAttribute('role')).toBeNull()
  expect(header.className).toBe('portfolio-header')
})
```

**Change 2** — logo alt assertion (around line 37):
```typescript
// BEFORE:
expect(logo.alt).toBe('Richard Drew')

// AFTER:
expect(logo.alt).toBe('')
```

- [ ] **Step 4: Run tests to verify they now fail**

```bash
make test-run
```

Expected: the 7 assertions we changed now fail (the tests are red because the source code still has the wrong behavior). Everything else passes.

- [ ] **Step 5: Fix `header.ts` — remove wrong ARIA attributes**

In `src/components/header/header.ts`, `initialize()` method (around line 115), remove this line:

```typescript
// DELETE this line:
this.setAttribute('role', 'banner')
```

In the static template (around line 32), find both `<nav>` elements and remove `role="navigation"` from each:

```typescript
// BEFORE:
<nav class="header__navigation" role="navigation" aria-label="Main navigation">
// AFTER:
<nav class="header__navigation" aria-label="Main navigation">
```

```typescript
// BEFORE:
<nav class="header__mobile-nav" role="navigation" aria-label="Mobile navigation">
// AFTER:
<nav class="header__mobile-nav" aria-label="Mobile navigation">
```

Change both logo image `alt` attributes to empty string:

```typescript
// BEFORE:
alt="Richard Drew"
class="header__logo header__logo--light"
// ...
alt="Richard Drew"
class="header__logo header__logo--dark"

// AFTER:
alt=""
class="header__logo header__logo--light"
// ...
alt=""
class="header__logo header__logo--dark"
```

- [ ] **Step 6: Run tests to verify they now pass**

```bash
make test-run
```

Expected: all previously-failing tests now pass. Full suite green.

- [ ] **Step 7: Commit**

```bash
git add src/components/header/header.ts tests/header/header-contract.test.ts tests/header/header-accessibility.test.ts tests/header/header-ui.test.ts
git commit -m "fix(a11y): remove duplicate banner/navigation ARIA roles from header; fix logo alt text"
```

---

## Task 3: Fix `about-page.ts` + `about-page-accessibility.test.ts`

**Files:**
- Modify: `src/components/about-page/about-page.ts`
- Modify: `tests/about-page/about-page-accessibility.test.ts`

- [ ] **Step 1: Read `about-page-accessibility.test.ts` and identify wrong assertions**

```bash
cat -n tests/about-page/about-page-accessibility.test.ts
```

Look for any `role="main"` or `aria-label="About page"` assertions. If found, update them to expect `toBeNull()`.

- [ ] **Step 2: Update `about-page-accessibility.test.ts` if needed**

If `tests/about-page/about-page-accessibility.test.ts` contains:
```typescript
expect(something.getAttribute('role')).toBe('main')
```

Change to:
```typescript
expect(something.getAttribute('role')).toBeNull()
```

Add a new test to verify `<h1>` is present:
```typescript
it('should have a visible h1 heading', () => {
  const h1 = aboutPage.querySelector('h1.about-hero__heading')
  expect(h1).toBeTruthy()
  expect(h1?.textContent?.trim()).toBe('About')
})
```

- [ ] **Step 3: Run tests to verify they fail (if assertions were wrong)**

```bash
make test-run
```

- [ ] **Step 4: Fix `about-page.ts`**

In `src/components/about-page/about-page.ts`, `connectedCallback()` (lines 14–19):

```typescript
// BEFORE:
connectedCallback() {
  this.className = 'about-page'
  this.setAttribute('role', 'main')
  this.setAttribute('aria-label', 'About page')
  this.loadTemplate()
}

// AFTER:
connectedCallback() {
  this.className = 'about-page'
  this.loadTemplate()
}
```

In the same file, inside the inline template string, find `.about-hero__text` div and add `<h1>` as its first child:

```typescript
// BEFORE:
<div class="about-hero__text">
  <p class="about-hero__summary professional-summary">

// AFTER:
<div class="about-hero__text">
  <h1 class="about-hero__heading">About</h1>
  <p class="about-hero__summary professional-summary">
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
make test-run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/about-page/about-page.ts tests/about-page/about-page-accessibility.test.ts
git commit -m "fix(a11y): remove duplicate main landmark from about-page; add h1 heading"
```

---

## Task 4: Fix `index.html` Semantic Issues

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove `role="main"` from `<uniform-gallery>` and add sr-only `<h1>`**

In `index.html`, find the `<main>` block (around line 75):

```html
<!-- BEFORE: -->
<main style="view-transition-name: main">
  <uniform-gallery
    data-manifest-url="/gallery-data.json"
    role="main"
    aria-label="Portfolio image gallery">

<!-- AFTER: -->
<main style="view-transition-name: main">
  <h1 class="sr-only">Portfolio</h1>
  <uniform-gallery
    data-manifest-url="/gallery-data.json"
    aria-label="Portfolio image gallery">
```

- [ ] **Step 2: Verify tests still pass**

```bash
make test-run
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix(a11y): remove duplicate main role from gallery; add sr-only h1 to index page"
```

---

## Task 5: Restructure HTML — Move `portfolio-header` Outside `.page-container`

**Files:**
- Modify: `index.html`
- Modify: `about.html`
- Modify: `404.html`
- Modify: `public/404.html`
- Modify: `src/components/header/header.css`

- [ ] **Step 1: Update `index.html` structure**

Move `<portfolio-header>` before `<div class="page-container">`:

```html
<!-- BEFORE: -->
<body>
  <div class="page-container">
    <portfolio-header data-current-page="home" style="view-transition-name: header"></portfolio-header>
    <main style="view-transition-name: main">
      ...
    </main>
  </div>
  <image-viewer data-state="inactive"></image-viewer>

<!-- AFTER: -->
<body>
  <portfolio-header data-current-page="home" style="view-transition-name: header"></portfolio-header>
  <div class="page-container">
    <main style="view-transition-name: main">
      ...
    </main>
  </div>
  <image-viewer data-state="inactive"></image-viewer>
```

- [ ] **Step 2: Update `about.html` structure**

Move `<portfolio-header>` before `<div class="page-container">` and replace `<section class="about-container">` with `<div>`:

```html
<!-- BEFORE: -->
<body>
  <div class="page-container">
    <portfolio-header data-current-page="about" style="view-transition-name: header"></portfolio-header>
    <main style="view-transition-name: main">
      <section class="about-container">
        <about-page>...</about-page>
      </section>
    </main>
  </div>

<!-- AFTER: -->
<body>
  <portfolio-header data-current-page="about" style="view-transition-name: header"></portfolio-header>
  <div class="page-container">
    <main style="view-transition-name: main">
      <div class="about-container">
        <about-page>...</about-page>
      </div>
    </main>
  </div>
```

- [ ] **Step 3: Update `404.html`**

Read the file first:
```bash
cat -n 404.html
```

Move `<portfolio-header>` before `<div class="page-container">`, same pattern as above.

- [ ] **Step 4: Update `public/404.html`**

```bash
cat -n public/404.html
```

Move `<portfolio-header>` before `<div class="page-container">`, same pattern.

- [ ] **Step 5: Give `.header__container` its own width management in `header.css`**

In `src/components/header/header.css`, find `.header__container` (around line 28):

```css
/* BEFORE: */
.header__container {
  /* Inherits width from .page-container parent */
  width: 100%;
  padding: var(--space-md) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  box-sizing: border-box;
  position: relative;
  z-index: 1001;
}
```

Change to:

```css
/* AFTER: */
.header__container {
  width: var(--page-width-full);
  margin: 0 auto;
  padding: var(--space-md) 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  box-sizing: border-box;
  position: relative;
  z-index: 1001;
}
```

Also find and add the responsive breakpoint after the main `.header__container` block. The existing `@media (min-width: 75rem)` block already sets `padding: var(--space-lg) 0` for desktop — add the width:

```css
@media (min-width: 52.5rem) {
  .header__container {
    width: var(--page-width-constrained);
  }
}
```

Remove the comment `/* Width is now handled by .page-container parent */` (line 337 area).

Also at the bottom of `header.css`, find the width comment and remove it:
```css
/* Width is now handled by .page-container parent */
```

- [ ] **Step 6: Run tests to verify nothing broken**

```bash
make test-run
```

Expected: all tests pass (structure change, JS behaviour unchanged).

- [ ] **Step 7: Commit**

```bash
git add index.html about.html 404.html public/404.html src/components/header/header.css
git commit -m "refactor: move portfolio-header outside page-container; give header__container own width management"
```

---

## Task 6: Write Failing Scroll Behavior Tests (Red Phase)

**Files:**
- Modify: `tests/header/header-contract.test.ts`
- Modify: `tests/header/header-accessibility.test.ts`
- Modify: `tests/header/header-ui.test.ts`
- Modify: `tests/header/header-performance.test.ts`

### Scroll simulation helper

Add this helper function inside each test file that simulates scroll (or define it once in `tests/header/test-utils.ts` and import):

```typescript
function simulateScroll(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true
  })
  window.dispatchEvent(new Event('scroll'))
}
```

- [ ] **Step 1: Add scroll helper to `test-utils.ts`**

In `tests/header/test-utils.ts`, add after the `cleanupHeader` function:

```typescript
export function simulateScroll(y: number): void {
  Object.defineProperty(window, 'scrollY', {
    value: y,
    writable: true,
    configurable: true
  })
  window.dispatchEvent(new Event('scroll'))
}

export function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true
  })
}
```

- [ ] **Step 2: Add new contract tests to `header-contract.test.ts`**

Import the new helpers and add a new `describe` block at the end of the file:

```typescript
import { setupHeader, cleanupHeader, simulateScroll, setViewportWidth } from './test-utils'
```

Add at the end of the top-level `describe('Header Contract Tests', ...)`:

```typescript
describe('Scroll Behavior Contract', () => {
  it('MUST dispatch header:scroll-hide event when header is hidden', async () => {
    setViewportWidth(1024)
    header.handleResize()
    let firedHide = false
    header.addEventListener('header:scroll-hide', () => { firedHide = true })

    simulateScroll(50)
    simulateScroll(100)

    expect(firedHide).toBe(true)
  })

  it('MUST dispatch header:scroll-show event when header is shown after being hidden', async () => {
    setViewportWidth(1024)
    header.handleResize()
    simulateScroll(50)
    simulateScroll(100)

    let firedShow = false
    header.addEventListener('header:scroll-show', () => { firedShow = true })

    simulateScroll(60)

    expect(firedShow).toBe(true)
  })

  it('MUST set --header-height CSS variable on :root after init', () => {
    const heightVar = document.documentElement.style.getPropertyValue('--header-height')
    expect(heightVar).not.toBe('')
  })

  it('header:scroll-hide event MUST bubble', () => {
    setViewportWidth(1024)
    header.handleResize()
    let captured = false
    document.addEventListener('header:scroll-hide', () => { captured = true }, { once: true })

    simulateScroll(50)
    simulateScroll(100)

    expect(captured).toBe(true)
  })

  it('header:scroll-show event MUST bubble', () => {
    setViewportWidth(1024)
    header.handleResize()
    simulateScroll(50)
    simulateScroll(100)
    let captured = false
    document.addEventListener('header:scroll-show', () => { captured = true }, { once: true })

    simulateScroll(60)

    expect(captured).toBe(true)
  })
})
```

- [ ] **Step 3: Add new UI tests to `header-ui.test.ts`**

Import the new helpers:
```typescript
import { setupHeader, cleanupHeader, simulateScroll, setViewportWidth } from './test-utils'
```

Update `beforeEach` to set a desktop viewport width before header init. Change the existing `beforeEach` to add viewport setup:

```typescript
beforeEach(async () => {
  setViewportWidth(1024)  // ensure desktop mode for scroll tests
  header = await setupHeader()
  header.setAttribute('data-current-page', 'home')
})
```

Add a new `describe` block:

```typescript
describe('Scroll Hide/Show Behavior', () => {
  it('should add header--hidden after 31px of downward scroll', () => {
    header.handleResize()  // sync scroll state with current innerWidth
    simulateScroll(31)

    expect(header.classList.contains('header--hidden')).toBe(true)
  })

  it('should NOT add header--hidden after only 29px of downward scroll', () => {
    header.handleResize()
    simulateScroll(29)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should remove header--hidden after 31px of upward scroll', () => {
    header.handleResize()
    simulateScroll(100)
    expect(header.classList.contains('header--hidden')).toBe(true)

    simulateScroll(69)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should NOT add header--hidden when mobile menu is open', () => {
    header.handleResize()
    const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
    mobileToggle.click()

    simulateScroll(100)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should remove header--hidden when scrolled to top (scrollY=0)', () => {
    header.handleResize()
    simulateScroll(100)
    expect(header.classList.contains('header--hidden')).toBe(true)

    simulateScroll(0)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should disable scroll behavior and show header when resized to < 768px', () => {
    header.handleResize()
    simulateScroll(100)
    expect(header.classList.contains('header--hidden')).toBe(true)

    setViewportWidth(600)
    header.handleResize()

    expect(header.classList.contains('header--hidden')).toBe(false)

    // Scrolling should not hide at narrow viewport
    simulateScroll(200)
    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should enable scroll behavior when resized to >= 768px', () => {
    setViewportWidth(600)
    header.handleResize()

    // Should not hide at narrow width
    simulateScroll(100)
    expect(header.classList.contains('header--hidden')).toBe(false)

    // Resize to desktop
    setViewportWidth(1024)
    header.handleResize()
    simulateScroll(200)

    expect(header.classList.contains('header--hidden')).toBe(true)
  })
})
```

- [ ] **Step 4: Add new accessibility tests to `header-accessibility.test.ts`**

Import helpers:
```typescript
import { setupHeader, cleanupHeader, simulateScroll, setViewportWidth } from './test-utils'
```

Add a new `describe` block:

```typescript
describe('Scroll Accessibility', () => {
  it('should not hide header at scrollY=0 (always visible at top)', () => {
    setViewportWidth(1024)
    header.handleResize()
    simulateScroll(0)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should not hide header when viewport width < 768px (portrait mobile)', () => {
    setViewportWidth(600)
    header.handleResize()
    simulateScroll(200)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should not hide header when mobile menu is open', () => {
    setViewportWidth(1024)
    header.handleResize()
    const mobileToggle = header.querySelector('.header__mobile-toggle') as HTMLButtonElement
    mobileToggle.click()
    simulateScroll(200)

    expect(header.classList.contains('header--hidden')).toBe(false)
  })

  it('should set --header-height on :root so content is not obscured', () => {
    const value = document.documentElement.style.getPropertyValue('--header-height')
    expect(value).not.toBe('')
  })
})
```

- [ ] **Step 5: Add performance tests to `header-performance.test.ts`**

Update the import line at the top of the file — add `vi` to the vitest imports and the new test-utils helpers:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Header } from '../../src/components/header/header'
import { setupHeader, cleanupHeader, setViewportWidth } from './test-utils'
```

Add at the end of the file:

```typescript
describe('Scroll Behavior Performance', () => {
  it('scroll listener should be registered as passive', async () => {
    // Must spy BEFORE the header is created so we catch the addEventListener call
    const addEventSpy = vi.spyOn(window, 'addEventListener')

    setViewportWidth(1024)
    const testHeader = document.createElement('portfolio-header') as Header
    document.body.appendChild(testHeader)
    await new Promise(resolve => setTimeout(resolve, 50))

    const scrollCall = addEventSpy.mock.calls.find(([event]) => event === 'scroll')
    expect(scrollCall).toBeTruthy()
    expect(scrollCall?.[2]).toMatchObject({ passive: true })

    document.body.removeChild(testHeader)
    addEventSpy.mockRestore()
  })

  it('should not trigger layout reads during scroll events', () => {
    setViewportWidth(1024)
    header.handleResize()

    let getBCRCallCount = 0
    const spy = vi.spyOn(header, 'getBoundingClientRect').mockImplementation(() => {
      getBCRCallCount++
      return { height: 80, top: 0, bottom: 0, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON: () => {} } as DOMRect
    })

    // Simulate several scroll events
    for (let i = 0; i < 10; i++) {
      Object.defineProperty(window, 'scrollY', { value: i * 10, writable: true, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    }

    // getBoundingClientRect must NOT be called during scroll — only on init/resize
    expect(getBCRCallCount).toBe(0)
    spy.mockRestore()
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
make test-run
```

Expected: the new scroll tests fail (header doesn't have scroll behavior yet). All existing tests still pass.

- [ ] **Step 7: Commit the failing tests**

```bash
git add tests/header/
git commit -m "test(header): add failing scroll behavior + corrected ARIA test assertions"
```

---

## Task 7: Implement Smart Header — CSS

**Files:**
- Modify: `src/components/header/header.css`

- [ ] **Step 1: Make `.portfolio-header` fixed with transition**

Find `.portfolio-header` at the top of `header.css` (around line 12):

```css
/* BEFORE: */
.portfolio-header {
  display: block;
  position: relative;
  z-index: 100;
  padding-top: 1.25rem;
}
```

Change to:

```css
/* AFTER: */
.portfolio-header {
  display: block;
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
```

- [ ] **Step 2: Add hidden state and reduced-motion override**

After the `.portfolio-header` block, add:

```css
.portfolio-header.header--hidden {
  transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-header {
    transition: none;
  }
}
```

- [ ] **Step 3: Run tests — expect still failing (JS not done yet)**

```bash
make test-run
```

---

## Task 8: Implement Smart Header — JS

**Files:**
- Modify: `src/components/header/header.ts`

- [ ] **Step 1: Add new private state fields**

In `header.ts`, after the existing private state fields (around line 22, after `resizeTimeout`):

```typescript
private lastScrollY = 0
private scrollDelta = 0
private scrollEnabled = false
private scrollListener: (() => void) | null = null
```

And add a new constant after `RESIZE_DEBOUNCE`:

```typescript
private static readonly SCROLL_THRESHOLD = 30
```

- [ ] **Step 2: Add `measureAndSetHeight()` method**

Add after the `updateBreakpoint()` method:

```typescript
private measureAndSetHeight(): void {
  const height = this.getBoundingClientRect().height
  document.documentElement.style.setProperty('--header-height', `${height}px`)
}
```

- [ ] **Step 3: Add `hideHeader()` and `showHeader()` methods**

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

- [ ] **Step 4: Add `setupScrollBehavior()` method**

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

- [ ] **Step 5: Call `measureAndSetHeight()` and `setupScrollBehavior()` from `initialize()`**

At the end of `initialize()`, after `this.dispatchEvent(new CustomEvent('header:initialized', ...))`, add:

```typescript
this.measureAndSetHeight()
this.setupScrollBehavior()
```

- [ ] **Step 6: Update `handleResize()` to re-measure and update scroll state**

Find `handleResize()` (around line 169). After the existing `updateBreakpoint()` call, add:

```typescript
this.measureAndSetHeight()
this.scrollEnabled = window.innerWidth >= Header.MOBILE_BREAKPOINT
if (!this.scrollEnabled) {
  this.showHeader()
  this.scrollDelta = 0
}
```

- [ ] **Step 7: Update `closeMobileMenu()` to reset scroll tracking**

Find `closeMobileMenu()` (around line 156). After `this.updateMobileMenuState()`, add:

```typescript
this.lastScrollY = window.scrollY
this.scrollDelta = 0
```

- [ ] **Step 8: Update `destroy()` to remove scroll listener**

Find `destroy()` (around line 141). Add before or after `this.removeEventListeners()`:

```typescript
if (this.scrollListener) {
  window.removeEventListener('scroll', this.scrollListener)
  this.scrollListener = null
}
```

- [ ] **Step 9: Run tests — expect all to pass**

```bash
make test-run
```

Expected: all tests pass including the new scroll behavior tests.

- [ ] **Step 10: Commit**

```bash
git add src/components/header/header.ts src/components/header/header.css
git commit -m "feat(header): implement smart auto-hide scroll behavior with 30px threshold"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
make test-run
```

Expected: all tests pass.

- [ ] **Step 2: Check coverage**

```bash
make test-coverage
```

Expected: 90%+ coverage maintained.

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
make build
```

Expected: clean build with no TS errors.

- [ ] **Step 4: Start dev server and manually verify**

```bash
make dev
```

Check in browser:
- Header is fixed at top of viewport on load
- Page content starts below header (not hidden behind it)
- Scrolling down 30+ pixels causes header to slide off top
- Scrolling up 30+ pixels causes header to slide back in
- At top of page (`scrollY === 0`), header is always visible
- On narrow viewport (< 768px), header never hides
- Mobile menu open → header never hides while open
- Dark mode: header correctly uses `var(--color-pure)` background
- About page: visible "About" heading renders correctly
- Gallery page: no visible `<h1>` (visually hidden, only for screen readers)

- [ ] **Step 5: Final commit if any visual tweaks made**

```bash
git add -p  # stage only the relevant files
git commit -m "fix: visual tweaks from dev server review"
```
