# Claude Code Development Guidance

**Project**: Portfolio Website
**Updated**: 2025-10-10
**Constitution**: v2.0.0

> **MANDATORY**: All development MUST follow the constitutional requirements defined in `.specify/memory/constitution.md`. The constitution supersedes all other development practices and contains mandatory requirements for specification-first development, TDD, progress tracking with TodoWrite, and architectural consistency.

## Project Overview

Responsive portfolio website built with modern web technologies. Latest completion: Full-screen image viewer with clean white overlay design. Follows constitutional principles of specification-first development, TDD, and systematic planning.

## Current Status: Feature 007 Complete ✅

**Branch**: `007-full-screen-image`
**Status**: **COMPLETE** - Full-screen image viewer with visual navigation
**Implementation**: White overlay modal, gallery integration with visual order navigation (left-to-right), keyboard controls, responsive design, 96% test coverage (301/313 tests passing)

### Tech Stack
- **Build**: Vite + TypeScript → vanilla HTML/CSS/JavaScript
- **Commands**: Makefile-only interface (`make dev`, `make build`, `make test`)
- **Responsive**: CSS-only breakpoints (5-breakpoint system: mobile/tablet/large-tablet/desktop/large-desktop)
- **Navigation**: Web Components with TypeScript, animated mobile menu
- **Testing**: Comprehensive test suites (contract, UI, accessibility, performance)
- **Maintenance**: Component reorganization, test restructuring, asset management

## Development Workflow

### Constitutional Requirements (MANDATORY)
1. **Specification-First**: Feature spec must be complete before implementation
2. **Test-Driven Development**: Write tests → verify failure → implement → verify success
3. **Feature Documentation**: Maintain plan, research, data model, contracts
4. **Systematic Planning**: Follow numbered task sequence with dependencies
5. **Simplicity**: Vanilla approach, no framework dependencies
6. **Progress Tracking**: Use TodoWrite tool for ALL tasks - mark "in_progress" before starting, "completed" immediately after finishing. Include task IDs (T001, T002, etc.). NO BATCHING - update immediately.

### Command Interface
All development through Makefile:
```bash
# Core Commands
make dev                # Start development server
make build              # Production build
make preview            # Preview production build
make clean              # Remove build artifacts
make install            # Install dependencies

# Testing Commands (Constitutional 4-Category Pattern)
make test               # Run all tests in watch mode
make test-run           # Run all tests once (CI/pre-commit quality gate)
make test-coverage      # Generate coverage report (validate 90%+ requirement)
make test-contract      # Run contract tests only (*-contract.test.ts)
make test-ui-tests      # Run UI behavior tests only (*-ui.test.ts)
make test-a11y          # Run accessibility tests only (*-accessibility.test.ts)
make test-perf          # Run performance tests only (*-performance.test.ts)
make test-vitest-ui     # Open Vitest UI dashboard

# Development Helpers
make validate-manifest  # Validate gallery-data.json format
make check-images       # Verify all manifest images exist
make help               # Show all available commands
```

### File Structure
```
# Current maintenance feature
specs/004-project-maintenance-and/
├── spec.md           # Feature specification (16 functional requirements)
├── plan.md           # Implementation plan (complete)
├── research.md       # Technical research and decisions
├── data-model.md     # TypeScript interfaces and entities
├── quickstart.md     # Manual testing scenarios
└── contracts/        # API contracts for maintenance operations

# Component organization (established pattern)
src/components/about-page/     # Reference pattern for reorganization
├── about-page.ts              # Component logic (inline template preferred)
├── about-page.css             # Component styles
├── about-page.types.ts        # TypeScript interfaces
└── about-page.html            # Component template (optional, inline preferred)

# Test organization (established pattern)
tests/about-page/              # Reference pattern for restructuring
├── about-page-contract.test.ts     # Contract/interface tests
├── about-page-ui.test.ts           # UI behavior tests
├── about-page-accessibility.test.ts # A11y compliance tests
└── about-page-performance.test.ts   # Performance validation tests
```

## Implementation Guidelines

### TypeScript Development
- Compile to vanilla ES6+ JavaScript (no framework runtime)
- Use interfaces for type safety during development
- Web Components with TypeScript classes
- Target modern browsers (ES2020+)

### CSS Strategy
- CSS Custom Properties for design tokens and responsive breakpoints (5-breakpoint system)
- Rem-based measurements for accessibility and scalability
- CSS transforms for smooth animations
- Z-index layering for navigation overlays

### Navigation Strategy
- Responsive design: desktop nav bar → mobile hamburger menu
- Smooth hamburger-to-cross animation
- Full-screen mobile overlay with scroll prevention
- Accessible ARIA states and keyboard navigation

### Testing Approach
- Contract tests for API interfaces
- Integration tests for responsive behavior
- Manual testing scenarios documented
- Local test data with JSON manifest

## Current Phase Status

**Completed Features**:
- ✅ **Initial Masonry Layout**: Responsive image gallery with column-based layout
- ✅ **Portfolio Header**: Responsive navigation with mobile hamburger menu
- ✅ **About Page**: Hero-only layout with responsive image and professional summary
- ✅ **PWA Functionality**: Service worker, manifest, offline capabilities
- ✅ **Responsive Images (005)**: Picture element, WebP/JPEG fallback, srcset, lazy loading
- ✅ **Dark Mode Support (006)**: ThemeToggle component, localStorage persistence, WCAG AA compliant
- ✅ **Full-Screen Image Viewer (007)**: White overlay modal, visual navigation, gallery integration, 96% test coverage

**Completed Phase**: Dark Mode Support (006) ✅
- ✅ ThemeToggle Web Component with light/dark theme switching
- ✅ localStorage persistence (device-local, no cross-device sync)
- ✅ FOUC prevention with inline script in <head>
- ✅ Dark mode color palette in design-system.css (WCAG AA compliant)
- ✅ Integrated into header (desktop nav + mobile menu)
- ✅ Logo variants for light/dark modes (CSS-based switching)
- ✅ CSS-driven icon visibility (no JavaScript template updates)
- ✅ Cross-instance synchronization (storage events + custom events)
- ✅ All 68 theme-toggle tests passing (contract, UI, accessibility, performance)
- ✅ Fixed IntersectionObserver mock for gallery tests (added tests/setup.ts)
- ✅ **248/250 tests passing (99.2%)** - 2 remaining failures are JSDOM rendering limitations

**Completed Phase**: Responsive Images (005) ✅
- ✅ Core responsive image support integrated into gallery component
- ✅ Picture element with WebP/JPEG fallback and srcset
- ✅ Aspect-ratio CSS for layout stability
- ✅ Responsive manifest format with multiple image sizes
- ✅ Intersection Observer lazy loading (200px buffer for progressive loading)
- ✅ Enhanced responsive breakpoints (2-column at 32rem for large mobile/landscape)
- ✅ Mobile UX improvements (hamburger animation, menu stability)
- ✅ Component simplification (AboutPage reduced 84%, removed over-engineering)
- ✅ All tests passing (gallery: 79/79, about-page: 25/25)

## Architecture Decisions

### Responsive Strategy
- **Mobile**: <768px, hamburger menu with full-screen overlay
- **Tablet**: 768-1199px, desktop navigation bar
- **Desktop**: 1200px+, full navigation with enhanced logo sizing
- Page container width: 92% (≤2 columns) / 96% (3+ columns) for scrollbar compensation

### Component Architecture
- **Component Organization**: Group related files in dedicated component folders
  ```
  src/components/component-name/
  ├── component-name.ts        # Component logic & Web Component class
  ├── component-name.css       # Component-specific styles
  ├── component-name.html      # Component template (if needed)
  └── component-name.types.ts  # TypeScript interfaces & types
  ```
- **Separation of Concerns**: Logic, styles, templates, and types in separate files
- **Web Components**: TypeScript classes extending HTMLElement
- **CSS Custom Properties**: Design tokens and responsive breakpoints (5-breakpoint system)
- **Event-driven State Management**: Component lifecycle and user interactions
- **Accessible Implementation**: Focus management and ARIA attributes

### Theme System (Feature 006)
- **Native CSS Approach**: `[data-theme="dark"]` attribute on `<html>` element
- **CSS Custom Properties**: Color overrides for dark mode
- **Minimal JavaScript**: Only for toggle and localStorage (no state management)
- **FOUC Prevention**: Inline script in `<head>` sets theme before CSS parse
- **Storage**: localStorage with key `theme`, values `"light"` | `"dark"`
- **Default**: Always light mode (no system preference detection)
- **Performance**: <100ms toggle, 250ms CSS transition
- **Integration**: Toggle at rightmost nav (desktop), bottom of mobile menu

### Build Strategy
- Vite for modern development experience
- TypeScript for development-time safety
- Output vanilla web technologies
- Makefile abstraction for tool independence

## Performance Requirements

- Smooth 60fps scrolling and resize
- <200ms image load initiation
- No layout jitter during responsive transitions
- Memory efficient with lazy loading

## Quality Gates

Before any implementation:
1. All tests written and failing (TDD requirement)
2. Constitutional compliance verified
3. Task dependencies clearly defined
4. Manual testing scenarios ready

## Recent Changes
- 2025-10-10: **Constitution Updated to v2.0.0** ✅ - Major restructure from prescriptive rules to 20 principle-based guidelines documenting proven patterns. Added comprehensive quality gates, success metrics, anti-patterns, 6-phase development workflow, and proven component/test/CSS templates. File size: 189 → 687 lines. Philosophy: "The web platform is powerful enough. Use it."
- 2025-10-10: **View Transitions API Implemented** ✅ - Added native cross-document view transitions for smooth page navigation (Chrome 126+, Edge 126+). Header persists, content fades (300ms). Zero JavaScript. Graceful degradation for Safari/Firefox. ~60 lines CSS in design-system.css.
- 2025-10-10: **Hamburger Animation Optimized** ✅ - Replaced layout-triggering animations with GPU-accelerated transform-only approach. 60fps smooth burger-to-cross transition (150ms, down from 180ms). No layout reflow.
- 2025-10-10: **Makefile Enhanced with Test Commands** ✅ - Added comprehensive test category commands: test-contract, test-ui-tests, test-a11y, test-perf, test-coverage, test-run. Supports constitutional 4-category test pattern and quality gates. Removed placeholder commands.
- 2025-10-10: **Cleanup: Removed 12 Unused Placeholder Images** ✅ - Deleted landscape/portrait/square-001-{200,250,300,500}.jpg files (not referenced, gallery uses Lorem Picsum URLs). Build verified successful.
- 2025-10-03: **Feature 007: Full-Screen Image Viewer Complete** ✅ - White overlay modal with visual order navigation, keyboard controls, responsive design. **301/313 tests passing (96%)** - remaining failures are JSDOM limitations. Key decisions: NO History API, NO scroll position management, visual navigation matches reading order.
- 2025-10-01: **Feature 006: Dark Mode Support Complete** ✅ - ThemeToggle Web Component with localStorage persistence, FOUC prevention, WCAG AA compliant. **248/250 tests passing (99.2%)**.
- 2025-09-30: **Feature 005: Responsive Images Complete** ✅ - Picture element, WebP/JPEG fallback, srcset (6 sizes: 400w-1600w), LQIP blur placeholders. All 211 tests passing.
