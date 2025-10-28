<!--
Constitution Version 2.0.0 - Major Update 2025-10-10

Breaking Changes from v1.3.0:
- Restructured from prescriptive rules to principle-based guidelines
- Added 20 foundational principles based on actual implementation patterns
- Expanded anti-patterns section with concrete examples
- Added comprehensive quality gates and success metrics
- Removed outdated "Recent Feature Completions" section (moved to CLAUDE.md)
- Enhanced browser support strategy with progressive enhancement guidelines
- Added security & privacy principles
- Consolidated template management (inline templates now preferred)

Migration Impact:
- Existing code already compliant (constitution reflects actual practices)
- Future features must follow expanded principle set
- Quality gates now mandatory before commits/features
- Documentation standards raised
- No code changes required (constitution documents current state)
-->

# Portfolio Website Constitution

**Version**: 2.0.0
**Ratified**: 2025-09-23
**Last Amended**: 2025-10-10
**Status**: Active

---

## Preamble

This constitution defines the foundational principles and development practices for the Portfolio Website project. It represents not aspirational goals, but **proven patterns** derived from successful implementation of features including responsive galleries, full-screen image viewers, dark mode, and view transitions.

**Core Philosophy**: The web platform is powerful enough. Use it.

---

## I. Foundational Principles

### 1. Vanilla-First Architecture

Every solution MUST prioritize native web technologies over third-party frameworks. TypeScript compiles to vanilla ES2020+ JavaScript with zero runtime dependencies. Web Components provide modularity without framework overhead. Native Web APIs take precedence over libraries.

**Enforcement**: No React, Vue, Angular, or similar frameworks. Progressive enhancement is the default strategy.

**Rationale**: Framework independence ensures longevity, maintainability, and minimal bundle size.

---

### 2. CSS-Native Approach

CSS Custom Properties MUST be used for all design system tokens. Responsive layouts MUST be CSS-only (no JavaScript breakpoints). Native CSS features MUST be preferred over JavaScript solutions (e.g., View Transitions API over routers).

**Animation Requirements**:

- Transform/opacity animations only (60fps mandatory)
- No layout-triggering properties (top, left, width, height)
- GPU acceleration via `will-change` where beneficial

**Measurement System**: Rem-based units for all spacing, typography, and responsive breakpoints.

**Rationale**: Platform features are faster, more reliable, and future-proof.

---

### 3. Performance as a Feature

Performance is non-negotiable. All animations MUST achieve 60fps. Intersection Observer MUST be used for lazy loading (never scroll events). Images MUST use LQIP (Low Quality Image Placeholder) for perceived performance.

**Performance Budget**:

- Theme toggle: <100ms
- Image load initiation: <200ms
- Animation frame rate: 60fps (16.67ms per frame)
- Lighthouse scores: 95+ on all metrics
- Initial JS bundle: <50KB gzipped

**Techniques Required**:

- GPU-accelerated animations (transform/opacity)
- Intersection Observer lazy loading with 200px buffer
- Base64 LQIP blur placeholders
- Responsive images with srcset/picture element
- Code splitting and tree shaking

---

### 4. Accessibility is Non-Negotiable

WCAG AA compliance is the minimum standard (AAA where feasible). All interactive elements MUST support keyboard navigation. Focus management MUST be implemented for modals and overlays. ARIA attributes MUST be used where semantic HTML is insufficient.

**Testing Requirements**:

- Keyboard navigation verification
- Screen reader testing
- Focus trap validation (modals/overlays)
- Color contrast verification (WCAG AA minimum)
- Reduced motion support (`prefers-reduced-motion`)

**Accessibility Test Suite**: Every component MUST have dedicated accessibility tests in `component-name-accessibility.test.ts`.

---

### 5. Test-Driven Development (TDD)

Tests MUST be written BEFORE implementation. No exceptions.

**Workflow**: Write tests → Verify failure → Implement → Verify success

**Test Categories** (all mandatory):

```
tests/component-name/
├── component-name-contract.test.ts      # API interfaces, type contracts
├── component-name-ui.test.ts            # User interactions, DOM behavior
├── component-name-accessibility.test.ts # WCAG compliance, keyboard nav
└── component-name-performance.test.ts   # Performance benchmarks
```

**Coverage Minimum**: 90%+ across all test categories.

**Rationale**: TDD prevents regressions, documents behavior, and ensures testability.

---

### 6. Specification-First Development

Every feature MUST begin with a complete specification. No implementation without approved spec.

**Required Specification Sections**:

- Functional requirements (testable and unambiguous)
- Technical constraints
- Architecture decisions with rationale
- Over-engineering analysis (YAGNI check)
- Success criteria (measurable)

**Specification Format**:

```
specs/[feature-number]-[feature-name]/
├── spec.md           # Complete feature specification
├── plan.md           # Implementation plan with tasks
├── research.md       # Technical research and decisions
├── data-model.md     # TypeScript interfaces and entities
├── quickstart.md     # Manual testing scenarios
└── contracts/        # API contracts for components
```

**Enforcement**: Pull requests without complete specs MUST be rejected.

---

### 7. Component Organization

All components MUST follow the component-folder pattern.

**Component Structure**:

```
src/components/component-name/
├── component-name.ts        # Logic & Web Component class
├── component-name.css       # Component-specific styles
├── component-name.types.ts  # TypeScript interfaces & types
└── component-name.html      # Template (optional, inline preferred)
```

**Template Management**: Inline templates are PREFERRED for consistency (see Header, ThemeToggle, AboutPage). External `.html` files are permitted but must be justified (e.g., very large templates).

**Rationale**: Co-location improves discoverability and maintainability.

---

### 8. Progressive Enhancement Strategy

Core functionality MUST work without JavaScript. CSS MUST load before JavaScript executes. FOUC (Flash of Unstyled Content) MUST be prevented with inline `<head>` scripts where necessary.

**Enhancement Layers**:

1. **HTML**: Semantic, accessible structure
2. **CSS**: Visual presentation, responsive layout
3. **JavaScript**: Enhanced interactions, Web Components

**Browser Support**:

- Graceful degradation for unsupported features
- Feature detection via `@supports` and `if ('feature' in window)`
- No user-agent sniffing

---

### 9. Git Commit Standards

Commit messages MUST be descriptive and follow the standard format.

**Commit Message Template**:

```
[Action] [Subject]

## Problem
[What issue was addressed]

## Solution
[How it was solved]

## Technical Details
[Specific changes, line numbers, performance impact]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Requirements**:

- Include performance/technical details where relevant
- Reference line numbers for specific changes
- Document breaking changes
- Never commit without tests passing

---

### 10. Makefile Command Interface

All development commands MUST use the Makefile interface. Direct npm/npx commands are FORBIDDEN.

**Standard Commands**:

```makefile
make dev      # Development server (http://localhost:5173)
make build    # TypeScript compile + Vite production build
make test     # Run Vitest test suite
make preview  # Preview production build
make clean    # Remove dist/ directory
```

**Rationale**: Tool-agnostic abstraction layer ensures consistency and prevents tooling fragmentation.

---

### 11. Simplicity Over Cleverness

YAGNI (You Aren't Gonna Need It) principle MUST guide all decisions. Premature optimization MUST be avoided. Boring, proven solutions MUST be preferred over clever, novel approaches.

**Examples**:

- ✅ Multi-page architecture (not SPA router for 2-page site)
- ✅ CSS Custom Properties (not CSS-in-JS)
- ✅ Web Components (not framework components)
- ✅ View Transitions API (not JavaScript router)
- ✅ localStorage (not IndexedDB for simple data)

**Code Deletion**: Delete aggressively. Git history is the backup.

---

### 12. Mobile-First Responsive Design

Design for the smallest screen first, then enhance for larger viewports.

**5-Breakpoint System**:

- **Mobile**: <512px (32rem) - 1 column
- **Tablet**: 512-767px (32-48rem) - 2 columns
- **Large Tablet**: 768-895px (48-56rem) - 3 columns
- **Desktop**: 896-1279px (56-80rem) - 4 columns
- **Large Desktop**: 1280px+ (80rem+) - 5 columns

**Touch Optimization**:

- Touch-optimized hit targets (min 44×44px)
- No hover-dependent functionality
- Swipe gestures where appropriate
- Mobile hamburger menu for navigation

---

### 13. Browser Support Strategy

Target modern browsers (last 2 versions of Chrome, Safari, Firefox, Edge).

**Progressive Enhancement**:

- Use new features if >75% browser support OR graceful degradation exists
- Document browser compatibility in code comments
- Test on Chrome, Safari, Firefox, Edge

**Example**: View Transitions API

- ✅ Chrome 126+: Full support
- ✅ Edge 126+: Full support
- ⏳ Safari 18.x: Same-document only (cross-document coming)
- ⏳ Firefox 144+: Coming Oct 2025
- **Strategy**: Implement with graceful degradation (works in Chrome/Edge, normal navigation in Safari/Firefox)

---

### 14. Documentation Standards

Comments MUST explain WHY, not WHAT. Code should be self-documenting for WHAT.

**Documentation Requirements**:

- Performance rationale for optimizations
- Browser compatibility notes
- Links to external resources (MDN, specs)
- Architecture decision records (ADRs)

**CLAUDE.md**: MUST be kept up-to-date with:

- Current feature status
- Recent completions
- Tech stack changes
- Development workflow updates

---

### 15. File Cleanup Discipline

Unused files MUST be deleted immediately. Commented-out code is FORBIDDEN. Regular codebase audits MUST be performed.

**Cleanup Schedule**:

- **On completion**: Delete unused feature files
- **Monthly**: Review for unused imports/variables
- **Quarterly**: Dependency audit
- **Semi-annual**: Architecture review

**Enforcement**: Git history is the backup. Delete without hesitation.

---

### 16. Task Tracking with TodoWrite

TodoWrite tool MUST be used for ALL non-trivial tasks. Real-time updates are MANDATORY.

**Workflow**:

1. Mark task as `"in_progress"` BEFORE starting
2. Mark task as `"completed"` IMMEDIATELY after finishing
3. NO batching - update after each task completion
4. Include task IDs (T001, T002, etc.)
5. Clean up completed tasks when list exceeds 10 items

**Enforcement**: Implementation work without proper tracking is considered INCOMPLETE.

---

### 17. Design System Consistency

All visual design MUST use CSS Custom Properties from the design system.

**Design Tokens**:

```css
:root {
  /* Color Palette */
  --color-primary: #2C2C2C;      /* Deep charcoal */
  --color-secondary: #6B6B6B;    /* Warm gray */
  --color-accent: #F8F6F3;       /* Soft cream */
  --color-pure: #FFFFFF;         /* Clean white */
  --color-interactive: #B8860B;  /* Muted gold */

  /* Typography */
  --font-header: 'Bebas Neue', serif;
  --font-body: 'Lora', serif;
  --font-caption: 'Inter', sans-serif;

  /* Spacing (rem-based) */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.65, 0, 0.35, 1);
  --transition-medium: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Dark Mode**: Theme colors MUST have `[data-theme="dark"]` overrides. WCAG AA contrast MUST be maintained.

---

### 18. Image Optimization Strategy

All images MUST be optimized for responsive delivery.

**Image Requirements**:

- **Format**: WebP with JPEG fallback via `<picture>` element
- **Sizes**: Six srcset sizes: 400w, 600w, 800w, 1000w, 1200w, 1600w
- **LQIP**: Base64 blur placeholders inline in HTML
- **Lazy Loading**: Intersection Observer with 200px buffer
- **Layout Stability**: `aspect-ratio` CSS to prevent layout shift

**Rationale**: Optimized images reduce bandwidth and improve perceived performance.

---

### 19. State Management

State MUST be managed with the simplest approach that meets requirements.

**State Strategies**:

- **Persistent**: localStorage for theme, preferences (device-local)
- **Component**: Web Component lifecycle for component state
- **Cross-component**: Custom events for communication
- **NO**: Global state libraries, reactive frameworks, Redux, Vuex, etc.

**localStorage Convention**:

- Keys: kebab-case (e.g., `theme`, `gallery-scroll`)
- Values: JSON strings for objects, plain strings for primitives
- No cookies (privacy-first)

---

### 20. Security & Privacy

Security and privacy MUST be respected.

**Requirements**:

- NO third-party analytics
- NO external trackers
- localStorage only (no cookies)
- NO PII (Personally Identifiable Information) collection
- HTTPS only in production
- Content Security Policy (CSP) headers

**Rationale**: User privacy is a feature, not a compliance checkbox.

---

## II. Anti-Patterns to Avoid

### ❌ FORBIDDEN Practices

1. **Framework Dependencies** - No React, Vue, Angular for this project
2. **CSS-in-JS** - Use CSS Custom Properties and external stylesheets
3. **Layout-Triggering Animations** - Never animate top, left, width, height
4. **Code-First Development** - Tests MUST be written before implementation
5. **Implementation Without Specs** - No coding without approved specification
6. **CSS !important** - Use specificity correctly (exception: body scroll lock)
7. **Hover-Dependent UX** - Design for touch-first
8. **Magic Numbers** - Use CSS custom properties for all design values
9. **Inline Styles** - Use CSS classes (exception: view-transition-name)
10. **Skipping Accessibility** - Keyboard and screen reader testing MANDATORY

### ✅ REQUIRED Practices

1. **Question Dependencies** - Every npm package must be justified
2. **Use Native Features** - Platform APIs over third-party libraries
3. **GPU-Accelerated Animations** - Transform/opacity only
4. **Test-Driven Development** - Write tests first, always
5. **Complete Specifications** - Full spec before any implementation
6. **CSS Specificity** - Proper cascade, no !important hacks
7. **Touch-First Design** - Mobile before desktop
8. **Design Tokens** - Use CSS custom properties for all values
9. **CSS Classes** - Semantic, reusable class names
10. **Accessibility Testing** - Keyboard, screen reader, contrast checks

---

## III. Quality Gates

### Before ANY Commit

- [ ] Tests written and passing (90%+ coverage)
- [ ] Build successful (`make build`)
- [ ] No console errors/warnings
- [ ] Accessibility tested (keyboard + screen reader)
- [ ] Performance verified (60fps animations, Lighthouse 95+)
- [ ] Documentation updated (CLAUDE.md, specs, comments)
- [ ] TodoWrite tasks marked completed

### Before ANY Feature

- [ ] Specification complete and approved
- [ ] Over-engineering check performed (YAGNI analysis)
- [ ] Test strategy defined (contract, UI, a11y, performance)
- [ ] Browser compatibility documented
- [ ] Performance budget defined and validated
- [ ] Component folder structure created
- [ ] Tasks numbered and sequenced

---

## IV. Success Metrics

### Technical Metrics

- **Test Coverage**: 90%+ across all test categories
- **Lighthouse Scores**: 95+ on Performance, Accessibility, Best Practices, SEO
- **Accessibility**: 0 violations (axe-core, WAVE)
- **Bundle Size**: <50KB initial JS bundle (gzipped)
- **Interaction Latency**: <100ms for all user interactions
- **Animation Performance**: 60fps (16.67ms per frame)

### Qualitative Metrics

- **Code Simplicity**: Code is boring and predictable
- **Progressive Enhancement**: Features work without JavaScript
- **Network Resilience**: Works on slow networks (3G simulation)
- **Universal Accessibility**: Usable by all users (screen readers, keyboard-only)
- **Maintainability**: Understandable by future developers (6-month rule)

---

## V. Development Workflow

All development MUST follow this workflow:

### Phase 1: Specification

1. Create feature specification (`/specify` command or manual)
2. Define functional requirements (testable, unambiguous)
3. Document technical constraints
4. Perform over-engineering check (YAGNI analysis)
5. Get specification approved

### Phase 2: Planning

1. Create implementation plan (`/plan` command or manual)
2. Break feature into numbered tasks
3. Identify dependencies and parallel execution opportunities
4. Define test strategy (contract, UI, a11y, performance)
5. Document architecture decisions

### Phase 3: Test Development

1. Write contract tests (API interfaces, type contracts)
2. Write UI tests (user interactions, DOM behavior)
3. Write accessibility tests (WCAG compliance, keyboard nav)
4. Write performance tests (benchmarks, budgets)
5. **Verify all tests FAIL** (red phase of TDD)

### Phase 4: Implementation

1. Update TodoWrite with all tasks
2. Implement component logic (following TDD red-green-refactor)
3. Implement component styles (CSS custom properties)
4. Implement templates (inline preferred)
5. **Verify all tests PASS** (green phase of TDD)

### Phase 5: Validation

1. Manual testing (quickstart.md scenarios)
2. Cross-browser testing (Chrome, Safari, Firefox, Edge)
3. Performance validation (Lighthouse, Chrome DevTools)
4. Accessibility audit (axe, WAVE, manual keyboard/screen reader)
5. Code quality checks (ESLint, TypeScript strict mode)

### Phase 6: Completion

1. Update documentation (CLAUDE.md, README, comments)
2. Clean up unused files
3. Final TodoWrite update (all tasks completed)
4. Git commit with detailed message
5. Feature branch merge (if applicable)

---

## VI. Evolution & Maintenance

### Constitution Updates

This constitution is a **living document** that evolves based on proven patterns.

**Update Triggers**:

- New patterns emerge from multiple features
- Technology landscape changes (new web standards)
- Performance requirements evolve
- Accessibility standards update

**Update Process**:

1. Document rationale for changes
2. Version increment (semantic versioning)
3. Sync comment at top of file
4. Update CLAUDE.md with constitution version
5. Quarterly review cycle

### Codebase Audits

**Regular Maintenance Schedule**:

- **Monthly**: Cleanup unused files, review imports
- **Quarterly**: Dependency audit, security updates
- **Semi-annual**: Architecture review, refactoring opportunities
- **Annual**: Performance audit, accessibility re-validation

---

## VII. Governance

This constitution **supersedes all other development practices**. When in doubt, refer to this document.

**Conflict Resolution**:

1. Constitution takes precedence over convenience
2. Deviations MUST be justified in writing
3. Temporary exceptions MUST have sunset dates
4. All pull requests MUST verify constitutional compliance

**CLAUDE.md Role**: Provides runtime development guidance specific to Claude Code integration and current feature status. Constitution defines principles; CLAUDE.md defines current state.

**Amendment Authority**: Constitution amendments require:

- Written rationale
- Impact analysis
- Migration plan (if breaking changes)
- Version increment

---

## VIII. Appendix: Proven Patterns

### A. Component Template (Web Component)

```typescript
// src/components/example/example.ts
export class ExampleComponent extends HTMLElement {
  // State
  private state: ExampleState = { /* ... */ }

  // Lifecycle
  connectedCallback(): void {
    this.render()
    this.attachEventListeners()
  }

  disconnectedCallback(): void {
    this.removeEventListeners()
  }

  // Public API
  public doSomething(): void { /* ... */ }

  // Private methods
  private render(): void {
    this.innerHTML = `<!-- inline template -->`
  }

  private attachEventListeners(): void { /* ... */ }
  private removeEventListeners(): void { /* ... */ }
}

customElements.define('example-component', ExampleComponent)
```

### B. Test Template (Contract Test)

```typescript
// tests/example/example-contract.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import type { ExampleComponent } from '../../src/components/example/example'

describe('ExampleComponent - Contract Tests', () => {
  let component: ExampleComponent

  beforeEach(() => {
    component = document.createElement('example-component') as ExampleComponent
    document.body.appendChild(component)
  })

  it('MUST expose public API method doSomething()', () => {
    expect(component.doSomething).toBeDefined()
    expect(typeof component.doSomething).toBe('function')
  })

  // ... more contract tests
})
```

### C. CSS Template (Component Styles)

```css
/* src/components/example/example.css */

/* Component container */
example-component {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

/* Internal elements */
.example__element {
  color: var(--color-primary);
  padding: var(--space-md);
  transition: transform var(--transition-fast);
}

/* States */
.example__element:hover {
  transform: translateY(-0.125rem);
}

/* Responsive */
@media (min-width: 32rem) {
  .example__element {
    padding: var(--space-lg);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .example__element {
    transition: none;
  }
}
```

---

## IX. Documentation Requirements

### Purpose

This section defines **MANDATORY** documentation reading requirements based on task type. Compliance ensures constitutional principles are understood and followed.

### Required Reading by Task Type

#### Task Type 1: Feature Implementation

**Triggers**: Adding new features, creating components, implementing functionality

**MUST READ** (non-negotiable):

1. **constitution.md** - Sections I-III (Foundational Principles, Anti-Patterns, Quality Gates)
2. **DEVELOPMENT.md** - Sections 1-7 (Quick Start through Quality Gates)
3. **CLAUDE.md** - Current Status section (understand completed features, current work)

**Rationale**: Feature implementation affects architecture and must follow all constitutional principles including specification-first development, TDD, and TodoWrite tracking.

**Enforcement**:
- TodoWrite tracking MUST reference task IDs from plan.md (proves spec exists)
- Tests MUST follow 4-category pattern (proves DEVELOPMENT.md was read)
- PR template MUST confirm documentation compliance

#### Task Type 2: Bug Fix / Investigation

**Triggers**: Fixing bugs, debugging errors, investigating issues

**MUST READ** (non-negotiable):

1. **ARCHITECTURE.md** - Sections 1-5 (Quick Reference through Testing Infrastructure)
2. **DEVELOPMENT.md** - Sections 8-10 (Common Tasks through Troubleshooting)
3. **CLAUDE.md** - Current Status section

**Rationale**: Bug fixes require understanding system architecture and established troubleshooting patterns.

**Enforcement**:
- Investigation MUST reference architectural patterns
- Fixes MUST include tests proving bug existed and is resolved
- PR template MUST confirm documentation compliance

#### Task Type 3: Codebase Exploration

**Triggers**: Understanding how things work, code review, learning the system

**MUST READ** (non-negotiable):

1. **ARCHITECTURE.md** - Complete file (comprehensive system understanding)
2. **CLAUDE.md** - Current Status section

**Rationale**: Exploration tasks require complete architectural context to provide accurate explanations.

**Enforcement**:
- Explanations MUST reference specific architectural sections
- Code examples MUST follow established patterns

#### Task Type 4: Deployment / Operations

**Triggers**: Deployment changes, CI/CD updates, infrastructure modifications

**MUST READ** (non-negotiable):

1. **deployment.md** - Complete file (deployment procedures and architecture)
2. **ARCHITECTURE.md** - Section 11 (Deployment Architecture)
3. **CLAUDE.md** - Current Status section

**Rationale**: Deployment changes affect production systems and require complete operational context.

**Enforcement**:
- Changes MUST preserve existing deployment patterns
- Updates MUST include rollback procedures
- PR template MUST confirm documentation compliance

### Acknowledgment Requirement

Before proceeding with any task, AI assistants MUST state:

```
I have read [list of documentation]. I understand [2-3 key principles relevant to task type].
```

**Example for Feature Implementation**:
> "I have read constitution.md (Sections I-III), DEVELOPMENT.md (Sections 1-7), and CLAUDE.md (Current Status). I understand: (1) Specification-first development is mandatory, (2) TDD with 4-category tests is required, (3) TodoWrite tracking with task IDs is non-negotiable."

### Workflow Artifacts as Proof

The following artifacts serve as **proof** that required documentation was read:

1. **spec.md exists** → Proves constitution Principle 6 (Specification-First) was followed
2. **plan.md with task IDs** → Proves systematic planning was followed
3. **4-category tests** → Proves DEVELOPMENT.md testing requirements were read
4. **TodoWrite with task IDs** → Proves constitution Principle 16 was followed
5. **PR checklist completed** → Final verification gate

### Governance

These documentation requirements are **constitutional mandates**. They cannot be bypassed or negotiated.

**Amendment Process**: Changes to documentation requirements follow standard constitutional amendment process (Section VII).

**Version**: Documentation requirements established 2025-10-28 as part of constitution v2.0.0.

---

**End of Constitution v2.0.0**

*This constitution represents the distilled wisdom of successful implementations. Follow these principles, and the code will be maintainable, performant, and accessible.*
