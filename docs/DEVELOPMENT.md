# Development Guide

> **Purpose**: Complete guide for adding, changing, or fixing features in the portfolio website.
>
> **For System Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)

**Last Updated**: 2025-10-28
**Constitution Version**: 2.0.0

---

## Quick Start

### Prerequisites

- **Node.js**: 20.x (LTS)
- **Git**: 2.x+
- **Make**: Pre-installed on macOS/Linux (Windows: use WSL or install via Chocolatey)
- **Editor**: VS Code recommended (with TypeScript, ESLint extensions)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/richardkdrew/richarddrew.photography.git
cd richarddrew.photography

# Install dependencies
make install

# Start development server
make dev

# Open browser to http://localhost:3000
```

### Verify Setup

```bash
# Run all tests (should pass)
make test-run

# Build production bundle
make build

# Preview production build
make preview
```

---

## About This Documentation

This project has comprehensive documentation organized by purpose:

- **[CONSTITUTION.md](CONSTITUTION.md)**: **WHY** we do things this way (principles, philosophy)
  - Read this to understand project values and foundational decisions
  - 20 principles including vanilla-first, TDD, accessibility
  - Source of truth for architectural decisions

- **DEVELOPMENT.md** (this file): **HOW** to do things (workflow, practices)
  - Read this to implement features, fix bugs, follow process
  - Step-by-step workflow, code standards, testing requirements
  - Quality gates, troubleshooting, commands reference

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: **WHAT** exists in the system (structure, patterns)
  - Read this to understand the codebase architecture
  - Component architecture, build pipeline, data flow
  - System structure, responsive design, performance architecture

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: **OPS** (deploy, monitor, rollback)
  - Read this for deployment setup and operations
  - Cloudflare configuration, GitHub Actions, workflows
  - Troubleshooting deployments, rollback procedures

- **[BRANCH-PROTECTION.md](BRANCH-PROTECTION.md)**: **SETUP** (GitHub config)
  - Read this for repository configuration
  - Branch protection rules, status checks
  - PR workflow, bypass procedures

**Start here**: If you're implementing a feature or fixing a bug, you're in the right place.

**For task-specific guidance**: See [CLAUDE.md](../CLAUDE.md) for MANDATORY documentation by task type.

---

## Table of Contents

1. [Constitutional Requirements](#constitutional-requirements)
2. [Development Workflow](#development-workflow)
3. [Git Workflow](#git-workflow)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [TodoWrite Usage](#todowrite-usage)
7. [Quality Gates](#quality-gates)
8. [Common Development Tasks](#common-development-tasks)
9. [Anti-Patterns](#anti-patterns-avoid)
10. [Troubleshooting](#troubleshooting)
11. [Performance Budgets](#performance-budgets)
12. [Commands Reference](#commands-reference)

---

## Constitutional Requirements

Before writing feature-tier code, read: [`docs/CONSTITUTION.md`](CONSTITUTION.md)

### Core Principles

1. **Specification-First Development (feature tier only)**
   - New components/substantial features: spec via superpowers `brainstorming`, plan via `writing-plans`, both in `docs/superpowers/`
   - Fixes/refactors/small changes: no formal spec required

2. **Test-Driven Development (TDD)**
   - Feature tier: write tests → verify failure → implement → verify success, 4-category pattern (Contract, UI, Accessibility, Performance)
   - Fix tier: tests appropriate to the change (at minimum, a test proving the bug existed and is fixed)
   - 90%+ test coverage is the target (not an enforced CI gate)

3. **Vanilla-First Architecture**
   - No framework dependencies (React, Vue, Angular, etc.)
   - TypeScript is compile-time only
   - Web Components for modularity
   - Native Web APIs preferred

4. **TodoWrite Tracking (feature tier)**
   - Feature-tier tasks from the plan tracked in TodoWrite
   - Mark "in_progress" BEFORE starting
   - Mark "completed" IMMEDIATELY after finishing
   - NO BATCHING - update after each task
   - Optional for fix-tier work

5. **Performance as Non-Negotiable**
   - 60fps animations (transform/opacity only)
   - <50KB initial JS bundle (gzipped)
   - IntersectionObserver for lazy loading
   - Lighthouse 95+ on all metrics

6. **Accessibility-First**
   - WCAG AA minimum (AAA where feasible)
   - Keyboard navigation for all interactions
   - Focus management in modals
   - Screen reader tested

### Philosophy

> "The web platform is powerful enough. Use it."

---

## Development Workflow

This section covers **feature-tier** work (new components, substantial features). For fix-tier work (bug fixes, refactors, small changes), skip straight to implementation with appropriate tests — see [CONSTITUTION.md Section V](CONSTITUTION.md) for the full tiered model.

### Phase 1: Specification (Before Code)

#### Step 1: Brainstorm and Write the Spec

Use the superpowers `brainstorming` skill — it walks through clarifying questions, proposes approaches, and writes the resulting design to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. A good spec covers: problem statement, scope (in/out), architecture, and success criteria. See existing examples in `docs/superpowers/specs/` for the expected level of detail.

#### Step 2: Plan the Implementation

Use the superpowers `writing-plans` skill to turn the approved spec into a task-by-task implementation plan at `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`. Each task should be independently testable and specify exact files, interfaces, and test steps — see existing examples in `docs/superpowers/plans/`.

### Phase 2: Test-Driven Development

#### Step 2: Create Test Structure

```bash
# Create test directory (mirrors src/components/)
mkdir -p tests/feature-name
cd tests/feature-name

# Create 4 test files (constitutional requirement)
touch feature-name-contract.test.ts
touch feature-name-ui.test.ts
touch feature-name-accessibility.test.ts
touch feature-name-performance.test.ts
```

#### Step 3: Write Tests FIRST

**Contract Tests Example**:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { FeatureName } from '../../src/components/feature-name/feature-name.types'

describe('FeatureName Contract Tests', () => {
  let component: FeatureName

  beforeEach(() => {
    component = document.createElement('feature-name') as FeatureName
    document.body.appendChild(component)
  })

  afterEach(() => {
    component.remove()
  })

  it('MUST expose public API method', () => {
    expect(typeof component.methodName).toBe('function')
  })

  it('MUST accept valid input', () => {
    expect(() => component.methodName('valid')).not.toThrow()
  })

  it('MUST handle invalid input gracefully', () => {
    expect(() => component.methodName(null)).not.toThrow()
  })
})
```

#### Step 4: Verify Tests FAIL

```bash
make test-run  # Should show failing tests for new feature
```

**Expected Output**:
```
❌ FAIL  tests/feature-name/feature-name-contract.test.ts
   FeatureName Contract Tests
     ✗ MUST expose public API method
       ReferenceError: FeatureName is not defined
```

### Phase 3: Implementation

#### Step 5: Use TodoWrite Tool (feature tier)

**BEFORE starting any task**:

```typescript
// Example: AI assistant using TodoWrite
TodoWrite([
  { content: "T001: Create component structure", status: "in_progress", activeForm: "Creating component structure" },
  { content: "T002: Implement public API methods", status: "pending", activeForm: "Implementing public API methods" },
  { content: "T003: Add event listeners", status: "pending", activeForm: "Adding event listeners" },
  { content: "T004: Style component", status: "pending", activeForm: "Styling component" }
])
```

**After EACH task completes**:

```typescript
// ✅ CORRECT: Update immediately after T001 finishes
TodoWrite([
  { content: "T001: Create component structure", status: "completed", activeForm: "Creating component structure" },
  { content: "T002: Implement public API methods", status: "in_progress", activeForm: "Implementing public API methods" },
  { content: "T003: Add event listeners", status: "pending", activeForm: "Adding event listeners" },
  { content: "T004: Style component", status: "pending", activeForm: "Styling component" }
])

// ❌ WRONG: Don't batch multiple completions
// (Delays visibility, violates constitutional requirement)
```

#### Step 6: Create Component Files

```bash
# Create component directory
mkdir -p src/components/feature-name
cd src/components/feature-name

# Create files (standardized structure)
touch feature-name.ts        # Component logic + Web Component class
touch feature-name.css       # Component-specific styles
touch feature-name.types.ts  # TypeScript interfaces
touch feature-name.html      # Template (optional, inline preferred)
```

**Component Template** ([feature-name.ts](../src/components/)):

```typescript
// 1. Imports
import type { FeatureNameProps } from './feature-name.types.js'
import './feature-name.css'

// 2. Component class
export class FeatureName extends HTMLElement {
  // 2a. Private properties
  private isOpen = false
  private state: FeatureNameProps | null = null

  // 2b. Lifecycle hooks
  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  // 2c. Public API (contract)
  public open(data: FeatureNameProps): void {
    this.state = data
    this.isOpen = true
    this.render()
  }

  public close(): void {
    this.isOpen = false
    this.render()
  }

  // 2d. Private methods
  private render(): void {
    this.innerHTML = `
      <div class="feature-name ${this.isOpen ? 'open' : ''}">
        ${this.state ? this.renderContent() : ''}
      </div>
    `
  }

  private renderContent(): string {
    return `<p>${this.state?.title}</p>`
  }

  private attachEventListeners(): void {
    this.addEventListener('click', this.handleClick)
  }

  private handleClick = (e: Event): void => {
    // Handle click
  }

  private cleanup(): void {
    this.removeEventListener('click', this.handleClick)
  }
}

// 3. Register custom element
customElements.define('feature-name', FeatureName)
```

**Types Template** ([feature-name.types.ts](../src/components/)):

```typescript
export interface FeatureNameProps {
  title: string
  description?: string
}

export interface FeatureName extends HTMLElement {
  open(data: FeatureNameProps): void
  close(): void
}
```

**CSS Template** ([feature-name.css](../src/components/)):

```css
/* 1. Custom properties (component-specific tokens) */
.feature-name {
  --feature-bg: var(--color-pure);
  --feature-text: var(--color-primary);
}

/* 2. Layout */
.feature-name {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* 3. Typography */
.feature-name__title {
  font-family: var(--font-header);
  font-size: var(--text-2xl);
  color: var(--feature-text);
}

/* 4. States & interactions */
.feature-name.open {
  opacity: 1;
  transform: scale(1);
  transition: opacity var(--transition-medium),
              transform var(--transition-medium);
}

.feature-name:not(.open) {
  opacity: 0;
  transform: scale(0.95);
}

/* 5. Responsive (mobile-first) */
@media (min-width: 48rem) {
  .feature-name {
    flex-direction: row;
  }
}
```

#### Step 7: Register Component

Edit page entry point ([src/pages/main.ts](../src/pages/main.ts)):

```typescript
import '../components/feature-name/feature-name.js'

// Component auto-registers via customElements.define()
```

### Phase 4: Verification

#### Step 8: Verify Tests Pass

```bash
# Run all tests
make test-run

# Verify coverage (90%+ target)
make test-coverage

# Run specific test category
make test-contract
make test-ui-tests
make test-a11y
make test-perf
```

**Expected Output**:
```
✓ tests/feature-name/feature-name-contract.test.ts (5 tests)
✓ tests/feature-name/feature-name-ui.test.ts (8 tests)
✓ tests/feature-name/feature-name-accessibility.test.ts (7 tests)
✓ tests/feature-name/feature-name-performance.test.ts (3 tests)

Test Files  4 passed (4)
     Tests  23 passed (23)
  Coverage  95.8% (meets 90%+ requirement)
```

#### Step 9: Manual Testing

```bash
# Start dev server
make dev

# Open browser to http://localhost:3000
# Test feature manually:
# - Desktop viewport (1920x1080)
# - Tablet viewport (768x1024)
# - Mobile viewport (375x667)
# - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
# - Screen reader (VoiceOver on macOS, NVDA on Windows)
```

### Phase 5: Pull Request

#### Step 10: Create Feature Branch

```bash
# Create branch from develop
git checkout develop
git pull origin develop
git checkout -b 009-feature-name

# Commit changes (conventional commits)
git add .
git commit -m "feat: add feature name with full implementation"
git push origin 009-feature-name
```

#### Step 11: Open Pull Request

Use the repo's PR template (`.github/pull_request_template.md`) — it's pre-filled automatically when you open a PR on GitHub. Link the spec and plan under "For Feature-tier work only".

#### Step 12: Wait for CI Checks

GitHub Actions runs automatically on every PR:
- ✅ Tests (Vitest)
- ✅ Build (TypeScript + Vite)
- ✅ Accessibility (dedicated a11y tests)
- ✅ E2E (Playwright) — **only for PRs targeting `main`**, not `develop`

**All applicable jobs must pass before merge.**

---

## Git Workflow

### Branch Strategy

```
main (production)
  ↑
  PR (after QA)
  ↑
develop (staging)
  ↑
  PR
  ↑
{number}-{short-description} (feature/fix work)
```

### Branch Rules

**`main`** (Production):
- Protected branch
- Requires PR approval
- Requires passing CI checks (tests, build, a11y, e2e)
- Linear history enforced
- Triggers production deployment + auto-tag

**`develop`** (Staging):
- Protected branch
- Requires PR approval
- Requires passing CI checks (tests, build, a11y — e2e only applies to PRs targeting main)
- Triggers staging deployment

**`{number}-{short-description}`** (Feature/fix work):
- Created from `develop`
- Naming: `022-docs-refresh`, `021-fix-header-scroll-tests` — plain numeric prefix, no `feature/` path segment
- Delete after merge

### Commit Message Format

**Conventional Commits** (readability and changelog clarity — production versioning is a separate sequential counter, not derived from commit type):

```bash
feat: add dark mode toggle to header
fix: resolve image lazy loading race condition
feat!: redesign gallery layout with new API
docs: update README with setup instructions
chore: upgrade Vite to 5.1.0
refactor: extract image utils to separate module
test: add missing accessibility tests for gallery
```

**Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code change that neither fixes bug nor adds feature
- `perf`: Performance improvement
- `test`: Add/update tests
- `chore`: Maintenance (dependencies, build, etc.)

### PR Process

1. **Create feature branch** from `develop`
2. **Implement feature** (follow TDD workflow)
3. **Push branch** and open PR to `develop`
4. **Wait for CI checks** (auto-runs on PR)
5. **Request review** (optional, but recommended)
6. **Merge to develop** → triggers staging deployment
7. **QA on staging** (https://dev.richarddrew.photography)
8. **Create PR** from `develop` to `main`
9. **Merge to main** → triggers production deployment + auto-tag

### Deployment Flow

```
{number}-{short-description}
  ↓ (merge PR)
develop branch
  ↓ (auto-deploy via GitHub Actions)
Staging environment (dev.richarddrew.photography)
  ↓ (QA testing)
  ↓ (merge PR to main)
main branch
  ↓ (auto-tag with version)
  ↓ (auto-deploy via GitHub Actions)
Production environment (richarddrew.photography)
```

---

## Code Standards

### Naming Conventions

#### Files

```bash
kebab-case.ts          # Components, utilities, services
kebab-case.css         # Stylesheets
kebab-case.test.ts     # Tests
kebab-case.types.ts    # TypeScript type definitions
```

**Examples**:
- ✅ `theme-toggle.ts`
- ✅ `gallery-data.service.ts`
- ✅ `responsive-picture.ts`
- ❌ `ThemeToggle.ts`
- ❌ `gallery_data.service.ts`

#### Classes & Interfaces

```typescript
// TypeScript classes: PascalCase
class MasonryGallery extends HTMLElement {}
interface ImageData {}
type GalleryState = {}

// CSS classes: kebab-case with BEM
.masonry-gallery {}
.masonry-gallery__column {}
.masonry-gallery__column--active {}

// CSS custom properties: --kebab-case
--color-primary
--font-header
--transition-medium
```

#### Variables & Functions

```typescript
// Variables: camelCase
const currentIndex = 0
let isOpen = false

// Constants: SCREAMING_SNAKE_CASE
const MAX_COLUMNS = 5
const DEFAULT_THEME = 'light'

// Functions: camelCase
function handleClick() {}
const openViewer = () => {}
```

#### Custom Elements

```html
<!-- Must have hyphen (Web Components spec requirement) -->
<theme-toggle></theme-toggle>
<masonry-gallery></masonry-gallery>
<image-viewer></image-viewer>

<!-- ❌ WRONG: No hyphen -->
<themtoggle></themetoggle>
<gallery></gallery>
```

### File Organization

#### Component Structure

Every component MUST follow this structure:

```
src/components/component-name/
├── component-name.ts        # Component logic + Web Component class
├── component-name.css       # Component-specific styles
├── component-name.types.ts  # TypeScript interfaces
└── component-name.html      # Template (optional, inline preferred)
```

**Why**:
- Separation of concerns
- Easy to locate files
- Consistent across codebase
- Scales well with team growth

#### Component Code Structure

```typescript
// 1. Imports (grouped)
import type { ComponentProps } from './component.types.js'
import './component.css'
import { utilityFunction } from '../../utils/helpers.js'

// 2. Constants
const DEFAULT_CONFIG = {}

// 3. Component class
export class ComponentName extends HTMLElement {
  // 3a. Private properties (state)
  private state: ComponentProps | null = null
  private isActive = false

  // 3b. Lifecycle hooks
  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  disconnectedCallback() {
    this.cleanup()
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // Handle attribute changes
  }

  static get observedAttributes() {
    return ['data-active']
  }

  // 3c. Public API (contract)
  public methodName(param: string): void {
    // Public method
  }

  // 3d. Private methods (alphabetical)
  private attachEventListeners(): void {}
  private cleanup(): void {}
  private handleEvent = (e: Event): void => {}
  private render(): void {}
}

// 4. Register custom element
customElements.define('component-name', ComponentName)
```

#### CSS Organization

```css
/* 1. Custom properties (component tokens) */
.component {
  --component-bg: var(--color-pure);
  --component-padding: var(--space-md);
}

/* 2. Base layout */
.component {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  padding: var(--component-padding);
  background: var(--component-bg);
}

/* 3. Child elements (BEM naming) */
.component__header {}
.component__body {}
.component__footer {}

/* 4. Modifiers (BEM naming) */
.component--active {}
.component--disabled {}

/* 5. States */
.component:hover {}
.component:focus {}
.component.is-loading {}

/* 6. Responsive (mobile-first) */
@media (min-width: 32rem) {
  .component {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 48rem) {
  .component {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### TypeScript Standards

#### Strict Mode (Always Enabled)

```json
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "exactOptionalPropertyTypes": true
}
```

#### Type Annotations

```typescript
// ✅ GOOD: Explicit types for public API
public open(data: ImageData): void {}
public loadImages(images: ImageData[]): Promise<void> {}

// ✅ GOOD: Inferred types for obvious cases
const count = 0  // number (inferred)
const name = 'example'  // string (inferred)

// ❌ AVOID: Unnecessary explicit types when obvious
const count: number = 0  // Redundant
const name: string = 'example'  // Redundant
```

#### Interfaces vs Types

```typescript
// ✅ PREFER: Interfaces for object shapes (extensible)
interface ImageData {
  id: string
  alt: string
  url: string
}

interface GalleryImage extends ImageData {
  aspectRatio: number
}

// ✅ USE: Types for unions, intersections, primitives
type Theme = 'light' | 'dark'
type Status = 'pending' | 'loading' | 'success' | 'error'
type Point = { x: number; y: number }
```

#### Avoid `any`

```typescript
// ❌ WRONG: Using any
function handleData(data: any) {
  return data.value
}

// ✅ CORRECT: Use unknown + type guard
function handleData(data: unknown) {
  if (isImageData(data)) {
    return data.value
  }
  throw new Error('Invalid data')
}

function isImageData(data: unknown): data is ImageData {
  return typeof data === 'object' &&
         data !== null &&
         'id' in data &&
         'url' in data
}
```

---

## Testing Requirements

### 4-Category Test Pattern (Constitutional)

Every component MUST have these 4 test files:

#### 1. Contract Tests (`*-contract.test.ts`)

**Purpose**: Verify public API, component interface, lifecycle.

```typescript
describe('ComponentName Contract Tests', () => {
  it('MUST extend HTMLElement', () => {
    const component = document.createElement('component-name')
    expect(component instanceof HTMLElement).toBe(true)
  })

  it('MUST expose public method', () => {
    const component = document.createElement('component-name')
    expect(typeof component.methodName).toBe('function')
  })

  it('MUST accept valid input without throwing', () => {
    const component = document.createElement('component-name')
    expect(() => component.methodName('valid')).not.toThrow()
  })

  it('MUST handle invalid input gracefully', () => {
    const component = document.createElement('component-name')
    expect(() => component.methodName(null)).not.toThrow()
  })

  it('MUST clean up when disconnected from DOM', () => {
    const component = document.createElement('component-name')
    document.body.appendChild(component)
    const spy = vi.spyOn(component, 'cleanup')
    component.remove()
    expect(spy).toHaveBeenCalled()
  })
})
```

#### 2. UI Tests (`*-ui.test.ts`)

**Purpose**: Verify user interactions, DOM updates, behavior.

```typescript
describe('ComponentName UI Tests', () => {
  let component: ComponentName

  beforeEach(() => {
    component = document.createElement('component-name')
    document.body.appendChild(component)
  })

  afterEach(() => {
    component.remove()
  })

  it('should render content when data provided', () => {
    component.open({ title: 'Test' })
    expect(component.querySelector('.component__title')).toBeTruthy()
  })

  it('should toggle state on button click', async () => {
    const button = component.querySelector('button')
    button?.click()

    await vi.waitFor(() => {
      expect(component.classList.contains('open')).toBe(true)
    })
  })

  it('should dispatch custom event on action', () => {
    const handler = vi.fn()
    component.addEventListener('custom-event', handler)

    component.triggerAction()

    expect(handler).toHaveBeenCalled()
  })
})
```

#### 3. Accessibility Tests (`*-accessibility.test.ts`)

**Purpose**: Verify WCAG compliance, keyboard nav, ARIA attributes.

```typescript
describe('ComponentName Accessibility Tests', () => {
  it('MUST support Escape key to close', () => {
    const component = document.createElement('component-name')
    component.open({ title: 'Test' })

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    component.dispatchEvent(event)

    expect(component.isOpen).toBe(false)
  })

  it('MUST have accessible name', () => {
    const component = document.createElement('component-name')
    const button = component.querySelector('button')
    expect(button?.getAttribute('aria-label')).toBeTruthy()
  })

  it('MUST manage focus when opened', () => {
    const component = document.createElement('component-name')
    document.body.appendChild(component)

    component.open({ title: 'Test' })

    const focusable = component.querySelector('[tabindex]')
    expect(document.activeElement).toBe(focusable)
  })

  it('MUST trap focus within modal', () => {
    const component = document.createElement('component-name')
    component.open({ title: 'Test' })

    const focusableElements = component.querySelectorAll('[tabindex]')
    const first = focusableElements[0] as HTMLElement
    const last = focusableElements[focusableElements.length - 1] as HTMLElement

    last.focus()
    const tab = new KeyboardEvent('keydown', { key: 'Tab' })
    last.dispatchEvent(tab)

    expect(document.activeElement).toBe(first)
  })
})
```

#### 4. Performance Tests (`*-performance.test.ts`)

**Purpose**: Verify timing budgets, memory leaks, frame rates.

```typescript
describe('ComponentName Performance Tests', () => {
  it('MUST render within 100ms', async () => {
    const start = performance.now()

    const component = document.createElement('component-name')
    document.body.appendChild(component)
    component.open({ title: 'Test' })

    await vi.waitFor(() => {
      expect(component.querySelector('.component__title')).toBeTruthy()
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100)
  })

  it('MUST not leak memory on repeated open/close', () => {
    const component = document.createElement('component-name')
    const initialMemory = performance.memory?.usedJSHeapSize || 0

    for (let i = 0; i < 100; i++) {
      component.open({ title: `Test ${i}` })
      component.close()
    }

    const finalMemory = performance.memory?.usedJSHeapSize || 0
    const growth = finalMemory - initialMemory

    // Memory growth should be minimal (<1MB)
    expect(growth).toBeLessThan(1024 * 1024)
  })

  it('MUST animate at 60fps', async () => {
    const component = document.createElement('component-name')
    document.body.appendChild(component)

    const frames: number[] = []
    let lastTime = performance.now()

    const measureFrame = () => {
      const now = performance.now()
      frames.push(now - lastTime)
      lastTime = now

      if (frames.length < 60) {
        requestAnimationFrame(measureFrame)
      }
    }

    component.open({ title: 'Test' })
    requestAnimationFrame(measureFrame)

    await vi.waitFor(() => frames.length >= 60)

    const avgFrameTime = frames.reduce((a, b) => a + b) / frames.length
    expect(avgFrameTime).toBeLessThan(16.67) // 60fps = 16.67ms per frame
  })
})
```

### Test Coverage Requirements

**Target**: 90%+ (aspirational, not an enforced CI gate)
**Stretch**: 95%+
**Current**: ~99%

```bash
# Generate coverage report
make test-coverage

# View HTML report
open coverage/index.html
```

**Coverage by Category**:
- Statements: 90%+
- Branches: 85%+
- Functions: 95%+
- Lines: 90%+

### Running Tests

```bash
# All tests (watch mode)
make test

# All tests (run once, CI mode)
make test-run

# Specific category
make test-contract      # Contract tests only
make test-ui-tests      # UI tests only
make test-a11y          # Accessibility tests only
make test-perf          # Performance tests only

# Specific file
npx vitest tests/gallery/gallery-ui.test.ts

# Specific test by name
npx vitest -t "should load images"

# Vitest UI (interactive)
make test-vitest-ui
```

### Test Utilities

**Setup File** ([tests/setup.ts](../tests/setup.ts)):

```typescript
// JSDOM mocks
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true
})

// localStorage mock
const storage: Record<string, string> = {}
global.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value },
  removeItem: (key: string) => { delete storage[key] },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
  length: 0,
  key: () => null
}
```

---

## TodoWrite Usage

### Constitutional Requirement (feature tier)

**Feature-tier tasks from the implementation plan MUST be tracked using the TodoWrite tool.** Fix-tier work (bug fixes, refactors, small changes) doesn't require it, though it's fine to use for a fix that breaks down into several non-trivial steps.

### Rules

1. **Mark "in_progress" BEFORE starting** any task
2. **Mark "completed" IMMEDIATELY after finishing** (NO BATCHING)
3. **Include task IDs** from plan.md (T001, T002, etc.)
4. **Update after each task**, not after multiple tasks

### Examples

#### ✅ CORRECT Usage

```typescript
// Starting first task
TodoWrite([
  { content: "T001: Create component structure", status: "in_progress", activeForm: "Creating component structure" },
  { content: "T002: Write contract tests", status: "pending", activeForm: "Writing contract tests" },
  { content: "T003: Implement public API", status: "pending", activeForm: "Implementing public API" }
])

// [Work on T001...]

// T001 complete, immediately update
TodoWrite([
  { content: "T001: Create component structure", status: "completed", activeForm: "Creating component structure" },
  { content: "T002: Write contract tests", status: "in_progress", activeForm: "Writing contract tests" },
  { content: "T003: Implement public API", status: "pending", activeForm: "Implementing public API" }
])

// [Work on T002...]

// T002 complete, immediately update
TodoWrite([
  { content: "T001: Create component structure", status: "completed", activeForm: "Creating component structure" },
  { content: "T002: Write contract tests", status: "completed", activeForm: "Writing contract tests" },
  { content: "T003: Implement public API", status: "in_progress", activeForm: "Implementing public API" }
])
```

#### ❌ WRONG Usage

```typescript
// BAD: Batching multiple completions
TodoWrite([
  { content: "T001: Create component structure", status: "completed", activeForm: "Creating component structure" },
  { content: "T002: Write contract tests", status: "completed", activeForm: "Writing contract tests" },
  { content: "T003: Implement public API", status: "completed", activeForm: "Implementing public API" }
])
// This delays visibility and violates constitutional requirement

// BAD: Missing task IDs
TodoWrite([
  { content: "Create files", status: "in_progress", activeForm: "Creating files" }
])
// Should reference plan.md task IDs (T001, T002, etc.)

// BAD: Not updating after each task
// Work on T001, T002, T003, then update once
// Violates immediate update requirement
```

### Why This Matters

- **Visibility**: User sees progress in real-time
- **Debugging**: Clear audit trail of what's been done
- **Accountability**: Prevents skipping steps
- **Collaboration**: Other developers/AI can see current state

---

## Quality Gates

### Pre-Commit Checklist

Before committing ANY code:

- [ ] All tests passing (`make test-run`)
- [ ] Build succeeds (`make build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors in browser
- [ ] TodoWrite updated (if applicable)

### Pre-PR Checklist

Before opening pull request:

- [ ] All tests passing (`make test-run`)
- [ ] Coverage still near target (`make test-coverage`) — not a hard gate, but don't regress it
- [ ] Accessibility tests passing (`make test-a11y`)
- [ ] E2E tests passing (`npm run test:e2e`) — only relevant if targeting `main`
- [ ] Manual testing complete (desktop/tablet/mobile)
- [ ] Keyboard navigation verified
- [ ] Lighthouse scores 95+ (Performance, A11y, Best Practices, SEO)
- [ ] No layout jitter during resize
- [ ] Spec and plan linked (feature-tier only — see `docs/superpowers/specs/` and `docs/superpowers/plans/`)
- [ ] CLAUDE.md updated (if new patterns added)

### Pre-Merge Checklist

Before merging to develop/main:

- [ ] CI checks passing (test, build, a11y always; e2e only for PRs targeting main)
- [ ] Code review approved (if required)
- [ ] TodoWrite tasks completed (feature-tier only)
- [ ] Documentation updated
- [ ] No merge conflicts

---

## Common Development Tasks

### Task 1: Add a New Component

```bash
# 1. Create component directory
mkdir -p src/components/new-component
cd src/components/new-component

# 2. Create component files
touch new-component.ts
touch new-component.css
touch new-component.types.ts

# 3. Create test directory
mkdir -p tests/new-component
cd tests/new-component

# 4. Create test files (4 required)
touch new-component-contract.test.ts
touch new-component-ui.test.ts
touch new-component-accessibility.test.ts
touch new-component-performance.test.ts

# 5. Register component
# Edit src/pages/main.ts or about.ts
# Add: import '../components/new-component/new-component.js'

# 6. Write tests first (TDD)
# Edit test files, verify they fail

# 7. Implement component
# Edit new-component.ts, new-component.css, new-component.types.ts

# 8. Verify tests pass
make test-run
```

### Task 2: Add a New Feature

```bash
# 1. Brainstorm and write the spec (superpowers brainstorming skill)
#    Writes to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md

# 2. Plan the implementation (superpowers writing-plans skill)
#    Writes to docs/superpowers/plans/YYYY-MM-DD-<topic>.md

# 3. Create feature branch
git checkout -b 009-feature-name develop

# 4. Follow TDD workflow
# - Write tests
# - Verify failure
# - Implement
# - Verify success
# - Use TodoWrite to track

# 5. Create PR
git add .
git commit -m "feat: add feature name"
git push origin 009-feature-name
```

### Task 3: Fix a Bug

```bash
# 1. Reproduce bug locally
make dev
# Test in browser

# 2. Write failing test that reproduces bug
# Edit appropriate test file
make test-run  # Verify test fails

# 3. Fix bug
# Edit component file(s)

# 4. Verify test passes
make test-run

# 5. Commit with fix prefix
git commit -m "fix: resolve issue with component behavior"
```

### Task 4: Debug Test Failures

```bash
# Run specific test file
npx vitest tests/gallery/gallery-ui.test.ts

# Run specific test by name
npx vitest -t "should load images"

# Open Vitest UI (interactive debugging)
make test-vitest-ui

# Check JSDOM limitations
# If test fails in Vitest but works in browser:
npm run test:e2e  # Run Playwright E2E tests

# Enable debug logging
DEBUG=* npx vitest

# Check test setup/mocks
# Edit tests/setup.ts if mocks need adjustment
```

### Task 5: Investigate Performance Issue

```bash
# 1. Build production bundle
make build

# 2. Preview production build
make preview

# 3. Open Chrome DevTools
# - Performance tab
# - Record interaction
# - Stop recording
# - Look for:
#   - Long tasks (>50ms yellow blocks)
#   - Layout thrashing (purple blocks)
#   - Forced reflow warnings

# 4. Check bundle size
du -sh dist/assets/*.js
du -sh dist/assets/*.css

# 5. Analyze bundle composition
npx vite-bundle-visualizer

# 6. Check for memory leaks
# - Memory tab in DevTools
# - Take heap snapshot
# - Interact with app
# - Take another snapshot
# - Compare (look for detached DOM nodes)
```

### Task 6: Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm install package@latest

# Update all patch/minor versions
npm update

# Test after updating
make test-run
make build

# If tests fail, revert
git checkout package.json package-lock.json
npm install
```

---

## Anti-Patterns (AVOID)

### ❌ Framework Dependencies

```typescript
// ❌ WRONG: Using React
import React from 'react'
import { useState } from 'react'

function Component() {
  const [count, setCount] = useState(0)
  return <div>{count}</div>
}

// ✅ CORRECT: Using Web Components
class Component extends HTMLElement {
  private count = 0

  connectedCallback() {
    this.render()
  }

  private render() {
    this.innerHTML = `<div>${this.count}</div>`
  }
}
```

### ❌ Layout-Triggering Animations

```css
/* ❌ WRONG: Animating layout properties */
.modal {
  transition: width 300ms, height 300ms, top 300ms;
}

.modal.open {
  width: 100%;
  height: 100%;
  top: 0;
}
/* Causes layout reflow on every frame = janky animation */

/* ✅ CORRECT: GPU-accelerated properties */
.modal {
  transition: transform 300ms, opacity 300ms;
}

.modal:not(.open) {
  transform: scale(0.95);
  opacity: 0;
}

.modal.open {
  transform: scale(1);
  opacity: 1;
}
/* Runs on compositor thread = smooth 60fps */
```

### ❌ Scroll Events

```typescript
// ❌ WRONG: Using scroll events
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY
  if (scrollTop > 100) {
    // Load images
  }
})
// Fires constantly, kills performance

// ✅ CORRECT: Using IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Load image
      observer.unobserve(entry.target)
    }
  })
}, {
  rootMargin: '200px'  // Load 200px before visible
})

images.forEach(img => observer.observe(img))
```

### ❌ Batching TodoWrite Updates

```typescript
// ❌ WRONG: Batching completions
// Complete T001, T002, T003
// Then update TodoWrite once with all three completed
TodoWrite([
  { content: "T001", status: "completed", activeForm: "..." },
  { content: "T002", status: "completed", activeForm: "..." },
  { content: "T003", status: "completed", activeForm: "..." }
])

// ✅ CORRECT: Update after each task
// Complete T001
TodoWrite([
  { content: "T001", status: "completed", activeForm: "..." },
  { content: "T002", status: "in_progress", activeForm: "..." }
])
// Complete T002
TodoWrite([
  { content: "T001", status: "completed", activeForm: "..." },
  { content: "T002", status: "completed", activeForm: "..." },
  { content: "T003", status: "in_progress", activeForm: "..." }
])
```

### ❌ Skipping Tests

```typescript
// ❌ WRONG: Skipping failing tests
it.skip('should work correctly', () => {
  // Test that fails
})

// ❌ WRONG: Commenting out tests
// it('should work correctly', () => {
//   // Test that fails
// })

// ✅ CORRECT: Fix the test or the code
it('should work correctly', () => {
  // Fixed test that passes
})
```

### ❌ Using `any` Type

```typescript
// ❌ WRONG: Using any
function processData(data: any) {
  return data.value.toUpperCase()
}
// No type safety, runtime errors possible

// ✅ CORRECT: Using proper types
interface Data {
  value: string
}

function processData(data: Data): string {
  return data.value.toUpperCase()
}
// Type-safe, autocomplete, refactoring support
```

### ❌ Implementing Before Tests

```typescript
// ❌ WRONG: Writing implementation first
// 1. Write component code
// 2. Write tests to verify it works
// Problem: Tests may not catch edge cases

// ✅ CORRECT: TDD approach
// 1. Write tests (they fail)
// 2. Write minimal implementation (tests pass)
// 3. Refactor
// Benefits: Better coverage, clearer requirements
```

---

## Troubleshooting

### Issue: TypeScript Errors in Tests

**Symptoms**: `Cannot find name 'describe'`, `Cannot find name 'expect'`

**Cause**: Vitest globals not configured

**Solution**:
```typescript
// Add to top of test file
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Or enable globals in vite.config.ts
export default defineConfig({
  test: {
    globals: true  // Already enabled in this project
  }
})
```

### Issue: JSDOM Test Failures (Layout/CSS)

**Symptoms**: Tests fail with `Cannot read properties of undefined (reading 'getComputedStyle')`

**Cause**: JSDOM doesn't fully support CSS layout calculations

**Solution**:
```bash
# 1. Verify feature works in real browser
npm run test:e2e  # Playwright E2E tests

# 2. Mock getComputedStyle in test
vi.spyOn(window, 'getComputedStyle').mockReturnValue({
  getPropertyValue: () => '1rem'
} as CSSStyleDeclaration)

# 3. Accept limitation (mark as known JSDOM issue)
# Add comment explaining test would pass in real browser
```

### Issue: Build Fails with Module Errors

**Symptoms**: `Failed to resolve import`, `MODULE_NOT_FOUND`

**Cause**: Incorrect import paths or missing dependencies

**Solution**:
```bash
# 1. Clean build cache
make clean

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
make install

# 3. Check import paths (must be relative or from node_modules)
# ✅ CORRECT
import { Component } from './component.js'
import { helper } from '../../utils/helper.js'

# ❌ WRONG
import { Component } from 'component'  # Not in node_modules
import { helper } from 'utils/helper'  # Missing relative path
```

### Issue: Images Not Loading in Gallery

**Symptoms**: Broken image icons, 404 errors in Network tab

**Cause**: Invalid `gallery-data.json` or incorrect URLs

**Solution**:
```bash
# 1. Validate manifest schema
make validate-manifest

# 2. Check image URLs
make check-images

# 3. Inspect network requests
# Open DevTools → Network tab → Filter by "Img"
# Look for 404 errors

# 4. Check CORS headers (if images from external domain)
# Images must have Access-Control-Allow-Origin header
```

### Issue: Dark Mode Not Persisting

**Symptoms**: Theme resets to light mode on page refresh

**Cause**: localStorage not accessible (private browsing, disabled, or full)

**Solution**:
```typescript
// Add fallback for when localStorage unavailable
function saveTheme(theme: 'light' | 'dark') {
  try {
    if ('localStorage' in window) {
      localStorage.setItem('theme', theme)
    } else {
      // Fallback: session-only storage
      sessionStorage.setItem('theme', theme)
    }
  } catch (error) {
    // Storage quota exceeded or disabled
    console.warn('Failed to save theme preference:', error)
  }
}
```

### Issue: Tests Pass Locally, Fail in CI

**Symptoms**: Green tests on local machine, red tests in GitHub Actions

**Cause**: Timing differences, missing mocks, environment differences

**Solution**:
```typescript
// 1. Use waitFor for async operations
await vi.waitFor(() => {
  expect(element).toBeTruthy()
}, { timeout: 5000 })  // Increase timeout for CI

// 2. Check for race conditions
// Ensure async operations complete before assertions

// 3. Verify CI environment
# Check GitHub Actions logs for specific error messages
# May need different mocks for Node.js vs browser environment
```

### Issue: Performance Degradation

**Symptoms**: Slow page load, janky animations, memory leaks

**Solution**:
```bash
# 1. Profile with Chrome DevTools
# Performance tab → Record → Interact → Stop
# Look for long tasks (>50ms)

# 2. Check bundle size
du -sh dist/assets/*.js
# If > 50KB gzipped, investigate code splitting

# 3. Check for memory leaks
# Memory tab → Heap snapshot → Interact → Snapshot → Compare
# Look for detached DOM nodes, growing arrays

# 4. Verify animations use transform/opacity only
# No width, height, top, left, margin, padding in transitions

# 5. Check for scroll events (should use IntersectionObserver)
grep -r "addEventListener('scroll'" src/
# Should return no results
```

---

## Performance Budgets

### Bundle Size Budget

| Asset | Budget | How to Check | Status |
|-------|--------|--------------|--------|
| Initial JS (gzipped) | <50KB | `du -sh dist/assets/main-*.js` then check gzip | ✅ 26KB |
| Initial CSS (gzipped) | <20KB | `du -sh dist/assets/main-*.css` then check gzip | ✅ 12KB |
| Total initial load | <70KB | Sum of above | ✅ 38KB |
| Per-page JS | <30KB | Check about.js, header.js | ✅ ~3-10KB |

### Timing Budget

| Metric | Budget | How to Measure | Status |
|--------|--------|----------------|--------|
| Theme toggle | <100ms | Performance tests | ✅ ~50ms |
| Image load initiation | <200ms | IntersectionObserver callback timing | ✅ ~150ms |
| Animation frame rate | 60fps (16.67ms/frame) | Chrome DevTools Performance tab | ✅ 60fps |
| Full-screen viewer open | <300ms | Performance tests | ✅ ~250ms |
| Component mount | <100ms | Performance tests | ✅ Varies |

### Test Coverage Budget

| Category | Budget | How to Check | Status |
|----------|--------|--------------|--------|
| Overall coverage | 90%+ | `make test-coverage` | ✅ 98.9% |
| Statements | 90%+ | Coverage report | ✅ 98%+ |
| Branches | 85%+ | Coverage report | ✅ 96%+ |
| Functions | 95%+ | Coverage report | ✅ 99%+ |
| Lines | 90%+ | Coverage report | ✅ 98%+ |

### Lighthouse Budget

| Category | Budget | How to Measure | Status |
|----------|--------|----------------|--------|
| Performance | 95+ | Chrome DevTools Lighthouse | ✅ 98 |
| Accessibility | 100 | Chrome DevTools Lighthouse | ✅ 100 |
| Best Practices | 100 | Chrome DevTools Lighthouse | ✅ 100 |
| SEO | 95+ | Chrome DevTools Lighthouse | ✅ 100 |

---

## Commands Reference

### Development Commands

```bash
make dev           # Start dev server (localhost:3000)
make build         # Production build (outputs to dist/)
make preview       # Preview production build
make clean         # Remove dist/ and build cache
make install       # Install npm dependencies (npm ci)
```

### Testing Commands

```bash
make test               # Run tests in watch mode (development)
make test-run           # Run tests once (CI mode)
make test-coverage      # Generate coverage report (HTML + terminal)
make test-contract      # Run contract tests only
make test-ui-tests      # Run UI tests only
make test-a11y          # Run accessibility tests only
make test-perf          # Run performance tests only
make test-vitest-ui     # Open Vitest UI dashboard (interactive)
```

### Validation Commands

```bash
make validate-manifest  # Validate gallery-data.json schema
make check-images       # Verify all manifest images exist
```

### Manual Testing Commands

```bash
# TypeScript type checking (no emit)
npx tsc --noEmit

# Lint (if ESLint configured)
npx eslint src/

# Format (if Prettier configured)
npx prettier --check src/

# Run specific test file
npx vitest tests/gallery/gallery-ui.test.ts

# Run specific test by name
npx vitest -t "should load images"

# E2E tests (Playwright)
npm run test:e2e
```

---

## Additional Resources

### Documentation

- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - System structure and technical decisions
- **Constitution**: [docs/CONSTITUTION.md](CONSTITUTION.md) - Development principles (v3.0.0)
- **AI Guide**: [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
- **Deployment**: [deployment.md](deployment.md) - CI/CD setup and troubleshooting
- **Branch Protection**: [branch-protection.md](branch-protection.md) - Git workflow rules

### Example Specs

- **Feature 005**: [specs/005-responsive-images/](../specs/005-responsive-images/) - Responsive image implementation
- **Feature 006**: [specs/006-dark-mode/](../specs/006-dark-mode/) - Dark mode toggle
- **Feature 007**: [specs/007-full-screen-image/](../specs/007-full-screen-image/) - Image viewer modal
- **Feature 008**: [specs/008-add-build-actions/](../specs/008-add-build-actions/) - CI/CD pipeline

### Reference Components

- **Gallery**: [src/components/gallery/](../src/components/gallery/) - Masonry layout, lazy loading
- **ImageViewer**: [src/components/image-viewer/](../src/components/image-viewer/) - Full-screen modal
- **ThemeToggle**: [src/components/theme-toggle/](../src/components/theme-toggle/) - Dark mode toggle
- **Header**: [src/components/header/](../src/components/header/) - Responsive navigation

---

## FAQ

### Q: Do I need to write tests before implementing?

**A**: Yes. TDD is a constitutional requirement. Write tests → verify failure → implement → verify success.

### Q: Can I use a CSS framework like Tailwind?

**A**: No. Constitution requires CSS Custom Properties with vanilla CSS. No frameworks.

### Q: What if JSDOM tests fail but feature works in browser?

**A**: Document as known JSDOM limitation. Verify with Playwright E2E tests (`npm run test:e2e`).

### Q: Can I skip TodoWrite if task is simple?

**A**: No. All tasks must be tracked. Constitutional requirement for visibility and accountability.

### Q: How do I know if my PR is ready?

**A**: Check Pre-PR Checklist section. All CI checks must pass (tests, build, a11y, e2e).

### Q: Can I merge directly to main?

**A**: No. All changes require PR to develop first, then QA on staging, then PR to main.

### Q: What if I need a third-party library?

**A**: Avoid unless absolutely necessary. Prefer native Web APIs. If required, justify in spec and get approval.

---

**Remember**: Specification-first, TDD, TodoWrite tracking, 90%+ coverage. No exceptions.

**For system architecture context**: See [ARCHITECTURE.md](ARCHITECTURE.md)
