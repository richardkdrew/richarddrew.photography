
# Implementation Plan: Dark Mode Support

**Branch**: `006-dark-mode-support` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-dark-mode-support/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
3. Fill Constitution Check ✓
4. Evaluate Constitution Check → No violations ✓
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md ✓
7. Re-evaluate Constitution Check → No new violations ✓
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command
```

**STATUS**: Phase 0-1 complete. Ready for /tasks command.

---

## Summary

Implement light/dark theme toggle for portfolio website using native CSS custom properties with `[data-theme]` attribute approach. Toggle button placed at rightmost edge of desktop navigation and bottom of mobile menu. Theme preference persisted in localStorage with default to light mode. No system preference detection. WCAG 2.1 AA contrast compliance required.

**Core Principle**: Native CSS-driven approach, minimal JavaScript, no over-engineering.

---

## Technical Context

**Language/Version**: TypeScript 5.3+ → ES2020 JavaScript
**Primary Dependencies**: None (vanilla Web Components)
**Storage**: localStorage (browser native API)
**Testing**: Vitest (existing test framework)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single (web application with vanilla stack)
**Performance Goals**: <100ms theme toggle, <1ms localStorage operations, 0ms FOUC
**Constraints**: WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 interactive)
**Scale/Scope**: Site-wide theme (2 pages: home + about), 1 new component (theme-toggle)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Simplicity Requirements
- **No new dependencies**: Using browser native APIs (localStorage, data attributes, CSS custom properties)
- **No framework**: Web Components with vanilla TypeScript
- **Minimal abstraction**: Direct localStorage access, no state management library
- **CSS-first**: Theme switching via CSS cascade, JavaScript only for toggle/storage

### ✅ TDD Requirements
- Contract tests planned (TypeScript interfaces, localStorage API)
- UI tests planned (toggle functionality, theme persistence)
- Accessibility tests planned (WCAG contrast, keyboard navigation)
- Performance tests planned (<100ms toggle duration)
- Manual test scenarios documented (quickstart.md with 15 scenarios)

### ✅ Component Limits
- **Current components**: header, gallery, about-page (3 total)
- **Adding**: theme-toggle (4th component)
- **Justification**: Theme toggle is a distinct, reusable UI element with encapsulated logic
- **Constitutional compliance**: Within 5-component limit, follows established patterns

### ✅ Performance Requirements
- Theme toggle: <100ms (constitutional requirement)
- localStorage operations: <1ms (synchronous API)
- Initial page load: 0ms FOUC (inline script prevents flash)
- CSS transitions: 250ms (visual only, doesn't count toward 100ms)

### ✅ Accessibility Requirements
- WCAG 2.1 AA contrast ratios (4.5:1 normal, 3:1 interactive)
- Keyboard accessible toggle (Space/Enter)
- ARIA attributes (role, label, pressed)
- Screen reader announcements
- Respects prefers-reduced-motion

**Gate Status**: ✅ PASS - No constitutional violations

---

## Project Structure

### Documentation (this feature)
```
specs/006-dark-mode-support/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification (complete)
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (complete)
├── quickstart.md        # Phase 1 output (complete)
├── contracts/           # Phase 1 output (complete)
│   ├── theme-toggle.contract.ts
│   └── css-contract.css
└── tasks.md             # Phase 2 output (/tasks command - NOT created yet)
```

### Source Code (repository root)
```
# Single project structure
src/
├── components/
│   ├── header/              # Existing (integrate toggle here)
│   ├── gallery/             # Existing
│   ├── about-page/          # Existing
│   └── theme-toggle/        # NEW
│       ├── theme-toggle.ts        # Web Component class
│       ├── theme-toggle.css       # Toggle button styles
│       ├── theme-toggle.types.ts  # TypeScript interfaces
│       └── theme-toggle.html      # SVG icons (sun/moon)
├── styles/
│   └── design-system.css    # MODIFY: Add dark mode color overrides
└── index.html               # MODIFY: Add inline theme script in <head>

tests/
├── theme-toggle/            # NEW
│   ├── theme-toggle-contract.test.ts     # Interface/API tests
│   ├── theme-toggle-ui.test.ts           # Toggle behavior tests
│   ├── theme-toggle-accessibility.test.ts # A11y compliance tests
│   └── theme-toggle-performance.test.ts   # <100ms validation
└── integration/
    └── theme-persistence.test.ts         # Cross-page persistence tests
```

**Structure Decision**: Single project (Option 1) - vanilla web application

---

## Phase 0: Outline & Research

### Research Tasks Completed ✓

1. **Theme switching mechanism** → `[data-theme]` attribute on `<html>` element
   - Rationale: Clean, declarative, CSS cascade-friendly
   - Alternatives: class-based (less semantic), inline styles (poor performance), separate stylesheets (FOUC)

2. **Storage mechanism** → localStorage with key `theme`
   - Rationale: Simple, synchronous, persistent, no backend
   - Alternatives: sessionStorage (no persistence), cookies (overhead), IndexedDB (over-engineered)

3. **WCAG 2.1 AA contrast** → 4.5:1 normal text, 3:1 interactive
   - Light mode validated: 15.8:1 text, 4.9:1 interactive
   - Dark mode to validate: #E5E5E5 on #1A1A1A (14.2:1 estimated)

4. **Component architecture** → Web Component following constitutional pattern
   - Follows header/gallery/about-page structure
   - Component-folder organization
   - TypeScript interfaces for type safety

5. **Transition strategy** → CSS transitions with `prefers-reduced-motion` support
   - 250ms transition on color properties
   - Respects accessibility preferences

6. **Initial page load** → Inline script in `<head>` before CSS parse
   - Prevents FOUC
   - Synchronous execution
   - Industry standard approach

7. **Logo handling** → CSS background-image swap via `[data-theme]` selector
   - Light logo already exists
   - Dark logo variant needed
   - No JavaScript required

8. **Testing strategy** → Four-tier approach per constitutional pattern
   - Contract, UI, accessibility, performance tests

**Output**: [research.md](./research.md) ✓

---

## Phase 1: Design & Contracts

### 1. Data Model ✓

Created minimal entity model:
- **ThemePreference**: localStorage schema (`"light"` | `"dark"`)
- **ThemeToggle Component**: TypeScript interface with `currentTheme` and `toggle()`
- **Document Theme Attribute**: `data-theme` on `<html>` element
- **Color Palette Extensions**: Light and dark mode CSS custom properties

**Output**: [data-model.md](./data-model.md) ✓

### 2. Contracts ✓

Generated TypeScript and CSS contracts:
- **theme-toggle.contract.ts**: Component interface, lifecycle, accessibility, performance
- **css-contract.css**: Color variable requirements, WCAG validation, transition specs

**Output**: [contracts/](./contracts/) ✓

### 3. Contract Tests (TDD - to be written in /tasks phase)

Test files to create:
- `tests/theme-toggle/theme-toggle-contract.test.ts`
  - Assert ThemeToggleElement interface
  - Assert localStorage API contract
  - Assert TypeScript types

**Status**: Planned (Phase 2)

### 4. Manual Test Scenarios ✓

Created comprehensive quickstart guide:
- 15 test scenarios covering all functional requirements
- Performance validation script
- Accessibility validation checklist
- Cross-browser compatibility tests

**Output**: [quickstart.md](./quickstart.md) ✓

### 5. Agent Context Update ✓

Updated CLAUDE.md with:
- Current feature: Dark Mode Support (006)
- Theme system architecture section
- Planning phase status
- Recent changes log

**Output**: [CLAUDE.md](../../CLAUDE.md) ✓

---

## Phase 2: Task Planning Approach

**IMPORTANT**: This section describes what the /tasks command will do - DO NOT execute during /plan

### Task Generation Strategy

The /tasks command will:
1. Load `.specify/templates/tasks-template.md` as base structure
2. Generate tasks from Phase 1 artifacts (contracts, data model, quickstart)
3. Order tasks following TDD principles (tests before implementation)
4. Mark parallelizable tasks with [P]

### Expected Task Breakdown

**Contract Tests** (TDD - write first):
1. Create `tests/theme-toggle/theme-toggle-contract.test.ts` [P]
   - Test ThemeToggleElement interface
   - Test localStorage contract
   - Verify tests fail (no implementation yet)

2. Create `tests/theme-toggle/theme-toggle-ui.test.ts` [P]
   - Test toggle functionality
   - Test theme persistence
   - Verify tests fail

3. Create `tests/theme-toggle/theme-toggle-accessibility.test.ts` [P]
   - Test WCAG contrast ratios
   - Test keyboard navigation
   - Test ARIA attributes
   - Verify tests fail

4. Create `tests/theme-toggle/theme-toggle-performance.test.ts` [P]
   - Test <100ms toggle duration
   - Verify tests fail

**Component Implementation**:
5. Create `src/components/theme-toggle/theme-toggle.types.ts`
   - Define Theme type
   - Define ThemeToggleElement interface
   - Define ThemeChangeEvent interface

6. Create `src/components/theme-toggle/theme-toggle.html`
   - SVG icon for sun (light mode available)
   - SVG icon for moon (dark mode available)

7. Create `src/components/theme-toggle/theme-toggle.css`
   - Toggle button base styles
   - Icon animation
   - Focus states
   - Responsive positioning

8. Create `src/components/theme-toggle/theme-toggle.ts`
   - Web Component class extending HTMLElement
   - localStorage integration
   - Toggle logic
   - Event dispatching
   - Lifecycle methods

**CSS Integration**:
9. Update `src/styles/design-system.css`
   - Add `[data-theme="dark"]` section
   - Define dark mode color overrides
   - Validate WCAG contrast ratios
   - Add transition styles with prefers-reduced-motion

**HTML Integration**:
10. Update `index.html` (and other HTML files)
    - Add inline script in `<head>` for FOUC prevention
    - Add `<theme-toggle>` to desktop nav (rightmost position)
    - Add `<theme-toggle>` to mobile menu (bottom position)

**Header Integration**:
11. Update `src/components/header/header.ts`
    - Import theme-toggle component
    - No additional logic needed (component is self-contained)

**Logo Assets**:
12. Create dark mode logo variant
    - Generate `/images/logo-dark.svg` (or appropriate format)
    - Ensure same dimensions as light logo
    - High contrast for dark backgrounds

**Test Verification** (TDD - verify success):
13. Run contract tests → verify PASS
14. Run UI tests → verify PASS
15. Run accessibility tests → verify PASS
16. Run performance tests → verify PASS
17. Execute quickstart manual scenarios → verify all pass

**Final Validation**:
18. Cross-browser testing (Chrome, Firefox, Safari, Edge)
19. Mobile device testing (iOS, Android)
20. Accessibility audit with screen reader

### Ordering Strategy

- **TDD order**: All tests (tasks 1-4) before implementation (tasks 5-12)
- **Dependency order**: Types → Templates → Styles → Component → Integration
- **Parallel execution**: Tests can be written in parallel [P]
- **Sequential execution**: Implementation tasks must follow dependency chain

### Estimated Output

25-30 numbered tasks in tasks.md with:
- Clear descriptions
- Acceptance criteria
- Dependencies noted
- Parallel execution markers [P]

**IMPORTANT**: Phase 2 is executed by /tasks command, NOT by /plan

---

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following TDD workflow)
**Phase 5**: Validation (run automated tests, execute quickstart.md scenarios)

---

## Complexity Tracking

*No constitutional violations - no complexity tracking needed*

**Result**: Simple, vanilla implementation with no deviations from constitutional principles.

---

## Progress Tracking

**Phase Status**:
- [✓] Phase 0: Research complete (/plan command)
- [✓] Phase 1: Design complete (/plan command)
- [✓] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [✓] Initial Constitution Check: PASS
- [✓] Post-Design Constitution Check: PASS
- [✓] All NEEDS CLARIFICATION resolved
- [✓] No complexity deviations

**Deliverables**:
- [✓] research.md
- [✓] data-model.md
- [✓] contracts/ (theme-toggle.contract.ts, css-contract.css)
- [✓] quickstart.md
- [✓] CLAUDE.md updated
- [ ] tasks.md (next: /tasks command)

---

## Implementation Notes

### Critical Requirements (User Constraints)

1. **Native CSS approach**: "i want this to be as native css, etc... as possible. no over engineering"
   - All theme styling via CSS custom properties
   - JavaScript ONLY for: localStorage, data-attribute, toggle event
   - No state management libraries, no complex abstractions

2. **Toggle Placement**:
   - Desktop: Rightmost edge of `.header__navigation`
   - Mobile: Bottom of `.header__mobile-menu`

3. **Logo Consideration**:
   - Light logo already exists
   - Need dark variant for dark mode

4. **Default Behavior**:
   - Always default to light mode
   - No system preference detection
   - User explicitly rejected auto-detection for simplicity

### Performance Targets

- Theme toggle: <100ms (constitutional requirement FR-004)
- localStorage operations: <1ms (synchronous API)
- Initial page load: 0ms FOUC (inline script prevents)
- CSS transitions: 250ms (visual only, non-blocking)

### Accessibility Targets

- WCAG 2.1 AA compliance (FR-007)
- Keyboard navigation (FR-008)
- Screen reader support
- Focus indicators
- Reduced motion support

### Browser Compatibility

- Target: Modern browsers (last 2 versions)
- Chrome, Firefox, Safari, Edge
- Required features: CSS custom properties, localStorage, Web Components, data attributes
- All features have universal modern browser support

---

**NEXT STEP**: Run `/tasks` command to generate tasks.md

---

*Based on Constitution v1.1.0 - See `/memory/constitution.md`*
