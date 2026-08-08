<!--
Constitution Version 3.0.0 - Major Update 2026-08-06

Breaking Changes from v2.0.0:
- Replaced the single always-spec-first-always-TDD workflow (Section V)
  with a tiered process model: full rigor (spec/plan/TDD/TodoWrite) for
  new features and components, lighter rigor (tests appropriate to the
  change, direct to commit) for fixes, refactors, and small changes
- Removed Section IX (Documentation Requirements) — superseded by the
  tiered model and CLAUDE.md's task-type router
- Specs/plans now live in docs/superpowers/specs/ and
  docs/superpowers/plans/ (superpowers-driven), not specs/{number}-{name}/
- Softened Principle 5 (TDD), 6 (Spec-First), 9 (Commit Standards),
  10 (Makefile-only), and 16 (TodoWrite) to match actual practice
- Coverage (90%+) restated as an aspirational target, not an enforced
  CI gate — nothing in CI currently checks coverage
- Corrected commit message template to match actual conventional-commit
  usage observed in the git log

Migration Impact:
- No code changes required
- Existing fix-tier commits (small changes without a formal spec) are
  retroactively compliant — they always matched actual practice, just
  not the old constitution's stated rules
- Future feature-tier work should use superpowers brainstorming +
  writing-plans skills rather than manual specs/{number}/ folders
-->

# Portfolio Website Constitution

**Version**: 3.0.0
**Ratified**: 2025-09-23
**Last Amended**: 2026-08-06
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

**Feature tier** (new components, substantial features): tests MUST be written before implementation. Write tests → verify failure → implement → verify success, using the 4-category pattern (all mandatory for a new component):

```
tests/component-name/
├── component-name-contract.test.ts      # API interfaces, type contracts
├── component-name-ui.test.ts            # User interactions, DOM behavior
├── component-name-accessibility.test.ts # WCAG compliance, keyboard nav
└── component-name-performance.test.ts   # Performance benchmarks
```

**Fix tier** (bug fixes, refactors, small changes): tests appropriate to the change are required, but not necessarily all 4 categories — e.g. a logic fix inside an existing component's event handler needs a test proving the bug existed and is fixed, not a new performance-test suite.

**Coverage Target**: 90%+ across all test categories (aspirational — actual coverage is typically ~99%; this is not an enforced CI gate).

**Rationale**: TDD prevents regressions, documents behavior, and ensures testability.

---

### 6. Specification-First Development

**Feature tier** (new components, substantial features): every feature MUST begin with a complete specification via the superpowers `brainstorming` skill, followed by an implementation plan via `writing-plans`. No feature-tier implementation without an approved spec.

**Specification location**:

```
docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md   # Design spec
docs/superpowers/plans/YYYY-MM-DD-<topic>.md          # Implementation plan
```

A good spec covers: functional requirements (testable and unambiguous), technical constraints, architecture decisions with rationale, an over-engineering check (YAGNI), and measurable success criteria.

**Fix tier** (bug fixes, refactors, small changes): no formal spec or plan required. Use the superpowers `systematic-debugging` skill for investigation if the root cause isn't obvious, then implement directly.

**Enforcement**: Feature-tier pull requests without a linked spec and plan MUST be rejected. Fix-tier PRs have no such requirement.

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

Commit messages MUST follow Conventional Commits format, matching actual practice in the git log.

**Commit Message Format**:

```
<type>(<scope>): <subject>

<body — optional, explain non-obvious rationale only>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

**Requirements**:

- Subject line is a conventional-commit one-liner (e.g. `fix(header): floor overscroll clamp at 0`)
- Body only when the *why* isn't obvious from the diff — don't restate what changed
- Document breaking changes in the body when relevant
- Never commit without tests passing

---

### 10. Makefile Command Interface

The Makefile is the standard interface for normal workflows and CI parity.

**Standard Commands**:

```makefile
make dev      # Development server
make build    # TypeScript compile + Vite production build
make test     # Run Vitest test suite (watch mode)
make test-run # Run all tests once + Lighthouse audit (CI/pre-commit gate)
make preview  # Preview production build
make clean    # Remove dist/ directory
```

Direct `npm`/`npx` commands (e.g. `npx vitest run tests/header/`) are fine for targeted debugging — running one test file, one lint rule, isolating a failure — not a violation. Use `make` targets for anything that should match what CI runs.

**Rationale**: Tool-agnostic abstraction layer ensures consistency for standard workflows, without blocking fast iteration during debugging.

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

**Feature tier**: TodoWrite MUST be used to track tasks from the implementation plan. Real-time updates are mandatory.

**Workflow**:

1. Mark task as `"in_progress"` BEFORE starting
2. Mark task as `"completed"` IMMEDIATELY after finishing
3. NO batching - update after each task completion
4. Reference the plan's task identifiers
5. Clean up completed tasks when list exceeds 10 items

**Fix tier**: TodoWrite is optional — use it if a fix breaks down into multiple non-trivial steps worth tracking, skip it for single-step changes.

**Enforcement**: Feature-tier implementation work without proper tracking is considered incomplete.

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
5. **Feature-Tier Implementation Without Specs** - No feature-tier coding without an approved spec (fix-tier work is exempt — see Section V)
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
5. **Complete Specifications (Feature Tier)** - Full spec before any feature-tier implementation (see Section V)
6. **CSS Specificity** - Proper cascade, no !important hacks
7. **Touch-First Design** - Mobile before desktop
8. **Design Tokens** - Use CSS custom properties for all values
9. **CSS Classes** - Semantic, reusable class names
10. **Accessibility Testing** - Keyboard, screen reader, contrast checks

---

## III. Quality Gates

### Before ANY Commit

- [ ] Tests written and passing
- [ ] Build successful (`make build`)
- [ ] No console errors/warnings
- [ ] Accessibility tested (keyboard + screen reader)
- [ ] Performance verified (60fps animations, Lighthouse 95+)
- [ ] Documentation updated (CLAUDE.md, comments — specs/plans additionally for feature-tier work)

### Before ANY Feature

- [ ] Specification complete and approved
- [ ] Over-engineering check performed (YAGNI analysis)
- [ ] Test strategy defined (contract, UI, a11y, performance)
- [ ] Browser compatibility documented
- [ ] Performance budget defined and validated
- [ ] Component folder structure created
- [ ] Tasks numbered and sequenced
- [ ] TodoWrite tasks marked completed
- [ ] 90%+ coverage target met

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

Development follows a **tiered process model**, matched to the size and risk of the change.

### Feature Tier (new components, substantial features)

**Phase 1: Brainstorm & Spec**
1. Use the superpowers `brainstorming` skill to explore the idea through dialogue
2. Write the design spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
3. Get the spec approved

**Phase 2: Plan**
1. Use the superpowers `writing-plans` skill to break the spec into bite-sized tasks
2. Write the plan to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
3. Define test strategy (contract, UI, a11y, performance) per component

**Phase 3: Test-Driven Implementation**
1. Update TodoWrite with all plan tasks
2. Per task: write tests first, verify failure (red), implement, verify success (green)
3. Follow the 4-category test pattern for new components

**Phase 4: Validation**
1. Manual testing across viewports
2. Cross-browser testing (Chrome, Safari, Firefox, Edge)
3. Performance validation (Lighthouse, Chrome DevTools)
4. Accessibility audit (axe, WAVE, manual keyboard/screen reader)

**Phase 5: Completion**
1. Update documentation (CLAUDE.md if patterns changed)
2. Final TodoWrite update (all tasks completed)
3. Commit, push to a short-lived branch, open PR to `develop`

### Fix Tier (bug fixes, refactors, small changes)

1. If the root cause isn't obvious, use the superpowers `systematic-debugging` skill to investigate before proposing a fix
2. Write a test that reproduces the bug (or covers the change) and verify it fails
3. Implement the fix
4. Verify the test passes and the full suite still passes (`make test-run`)
5. Commit with a conventional-commit message, push to a short-lived branch, open PR to `develop`

No formal spec, plan, or TodoWrite tracking is required for fix-tier work — matching how bug fixes actually happen in this codebase (e.g. the header overscroll-clamp fix on 2026-08-06, which went straight from investigation to a committed fix with updated tests, no spec or plan involved).

### Both Tiers

- Branch protection requires a PR either way — there is no direct-commit path to `develop` or `main` for anyone but admins in emergencies.
- Branch naming: `{number}-{short-description}` off `develop` (e.g. `022-docs-refresh`).

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

Superseded by `CLAUDE.md`'s task-type router, which is the current source of truth for which docs to read before starting a given kind of task, and by the tiered process model in Section V for which superpowers skill to invoke. See `CLAUDE.md` directly rather than duplicating its routing table here.

---

**End of Constitution v3.0.0**

*This constitution represents the distilled wisdom of successful implementations. Follow these principles, and the code will be maintainable, performant, and accessible.*
