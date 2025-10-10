# Tasks: Dark Mode Support

**Input**: Design documents from `/specs/006-dark-mode-support/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript → Vanilla JS, Web Components, Vitest
   → Structure: Single project (src/, tests/)
2. Load design documents ✓
   → data-model.md: ThemePreference, ThemeToggle, ThemeDOM
   → contracts/: theme-toggle.contract.ts, css-contract.css
   → research.md: 8 technical decisions
   → quickstart.md: 15 manual test scenarios
3. Generate tasks by category ✓
   → Setup: Component directory, test directory
   → Tests: Contract, UI, accessibility, performance
   → Core: Types, templates, styles, component
   → Integration: Design system, HTML, header
   → Polish: Logo asset, validation
4. Apply TDD rules ✓
   → All tests before implementation
   → Different files marked [P]
   → Same file sequential
5. Number tasks sequentially (T001-T025)
6. Ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [ ] **T001** Create component directory `src/components/theme-toggle/`
- [ ] **T002** Create test directory `tests/theme-toggle/`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] **T003 [P]** Contract test for ThemeToggle component interface in `tests/theme-toggle/theme-toggle-contract.test.ts`
  - Test ThemeToggleElement extends HTMLElement
  - Test readonly currentTheme property exists
  - Test toggle() method exists
  - Test custom element registration as 'theme-toggle'
  - Verify tests FAIL (no implementation yet)

- [ ] **T004 [P]** UI behavior tests in `tests/theme-toggle/theme-toggle-ui.test.ts`
  - Test toggle switches from light to dark
  - Test toggle switches from dark to light
  - Test localStorage updates on toggle
  - Test data-theme attribute updates on toggle
  - Test theme persistence across component remount
  - Test default theme is 'light' when localStorage empty
  - Test invalid localStorage value defaults to 'light'
  - Verify tests FAIL (no implementation yet)

- [ ] **T005 [P]** Accessibility tests in `tests/theme-toggle/theme-toggle-accessibility.test.ts`
  - Test role="button" attribute
  - Test aria-label describes current state
  - Test aria-pressed reflects toggle state
  - Test keyboard Space key toggles theme
  - Test keyboard Enter key toggles theme
  - Test focus indicator visible
  - Test WCAG contrast ratios for dark mode colors
  - Verify tests FAIL (no implementation yet)

- [ ] **T006 [P]** Performance tests in `tests/theme-toggle/theme-toggle-performance.test.ts`
  - Test toggle operation completes in <100ms
  - Test localStorage operation completes in <1ms
  - Test no layout shift on theme change
  - Verify tests FAIL (no implementation yet)

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] **T007 [P]** Create TypeScript types in `src/components/theme-toggle/theme-toggle.types.ts`
  - Define `Theme = 'light' | 'dark'` type
  - Define ThemeToggleElement interface
  - Define ThemeChangeEvent interface

- [ ] **T008 [P]** Create SVG icons template in `src/components/theme-toggle/theme-toggle.html`
  - SVG icon for sun (indicates light mode available)
  - SVG icon for moon (indicates dark mode available)
  - Accessible title attributes

- [ ] **T009 [P]** Create component styles in `src/components/theme-toggle/theme-toggle.css`
  - Base button styles (reset browser defaults)
  - Icon display logic (show sun in dark mode, moon in light mode)
  - Focus indicator styles (visible outline)
  - Hover states
  - Transition animations (respect prefers-reduced-motion)
  - Desktop positioning (rightmost in nav)
  - Mobile positioning (bottom of menu)

- [ ] **T010** Create ThemeToggle Web Component in `src/components/theme-toggle/theme-toggle.ts`
  - Class extends HTMLElement
  - Implement currentTheme getter (reads from localStorage)
  - Implement toggle() method (updates localStorage + DOM attribute)
  - Implement connectedCallback (setup, load template, event listeners)
  - Implement disconnectedCallback (cleanup)
  - Dispatch 'theme:changed' custom event on toggle
  - Handle keyboard events (Space, Enter)
  - Set ARIA attributes
  - Define and register custom element

- [ ] **T011** Update design system with dark mode colors in `src/styles/design-system.css`
  - Add `[data-theme="dark"]` selector block
  - Define dark mode color overrides:
    - `--color-primary: #E5E5E5` (light text)
    - `--color-secondary: #B8B8B8` (medium gray)
    - `--color-accent: #2A2A2A` (dark accent)
    - `--color-pure: #1A1A1A` (dark background)
    - `--color-interactive: #D4AF37` (gold)
    - `--color-interactive-hover: #F0C14B` (brighter gold)
  - Add CSS transitions for color properties
  - Add `@media (prefers-reduced-motion: reduce)` block
  - Validate WCAG contrast ratios (comment with ratios)

- [ ] **T012** Add FOUC prevention script to `index.html`
  - Insert inline `<script>` in `<head>` BEFORE stylesheet links
  - Read `localStorage.getItem('theme')`
  - Set `document.documentElement.dataset.theme` synchronously
  - Default to 'light' if not set

- [ ] **T013** Add theme toggle to desktop navigation in `index.html`
  - Insert `<theme-toggle>` element as last child of `.header__navigation`
  - Verify rightmost positioning

- [ ] **T014** Add theme toggle to mobile menu in `index.html`
  - Insert `<theme-toggle>` element as last child of `.header__mobile-menu`
  - Verify bottom positioning

- [ ] **T015** Import and register theme-toggle component in `src/components/header/header.ts`
  - Import './theme-toggle/theme-toggle.js' (or ensure it's loaded)
  - No additional logic needed (component is self-contained)

- [ ] **T016** Add logo variant support in `src/components/header/header.css`
  - Add `[data-theme="dark"] .header__logo` selector
  - Set `background-image: url('/images/logo-dark.svg')`
  - Ensure same dimensions as light logo

## Phase 3.4: Integration & Validation

- [ ] **T017** Verify contract tests now PASS
  - Run `npm test theme-toggle-contract.test.ts`
  - All interface tests must pass
  - Fix any failures

- [ ] **T018** Verify UI tests now PASS
  - Run `npm test theme-toggle-ui.test.ts`
  - All behavior tests must pass
  - Fix any failures

- [ ] **T019** Verify accessibility tests now PASS
  - Run `npm test theme-toggle-accessibility.test.ts`
  - All WCAG and keyboard tests must pass
  - Fix any failures

- [ ] **T020** Verify performance tests now PASS
  - Run `npm test theme-toggle-performance.test.ts`
  - Toggle must complete in <100ms
  - Fix any failures

- [ ] **T021** Execute manual test scenarios from `specs/006-dark-mode-support/quickstart.md`
  - Test Scenario 1: First-time visitor (default light mode)
  - Test Scenario 2: Theme toggle functionality (desktop + mobile)
  - Test Scenario 3: Theme persistence across sessions
  - Test Scenario 4: localStorage cleared (revert to light)
  - Test Scenario 5: Site-wide application
  - Test Scenario 6: Toggle performance (<100ms)
  - Test Scenario 7: WCAG contrast compliance
  - Test Scenario 8: Logo variant switching
  - Test Scenario 9: Keyboard accessibility
  - Test Scenario 10: Reduced motion preference
  - Test Scenario 11: FOUC prevention
  - Test Scenario 12: Private browsing mode
  - Test Scenario 13: Cross-browser compatibility
  - Test Scenario 14: Mobile toggle position
  - Test Scenario 15: Desktop toggle position

## Phase 3.5: Assets & Polish

- [ ] **T022 [P]** Create dark mode logo variant at `/images/logo-dark.svg`
  - Generate SVG with high contrast for dark backgrounds
  - Ensure same dimensions as light logo
  - Test visibility on `#1A1A1A` background

- [ ] **T023** Apply FOUC prevention to About page `about.html` (if separate HTML file)
  - Add same inline script in `<head>`
  - Verify theme consistency

- [ ] **T024** Cross-browser testing
  - Test in Chrome (latest)
  - Test in Firefox (latest)
  - Test in Safari (latest)
  - Test in Edge (latest)
  - Document any browser-specific issues

- [ ] **T025** Final validation and cleanup
  - Run full test suite: `make test`
  - Verify all 211+ tests passing
  - Check console for errors
  - Verify no layout shift
  - Verify no FOUC
  - Remove any debug code
  - Update CLAUDE.md with completion status

## Dependencies

```
Setup (T001-T002)
  ↓
Tests (T003-T006) [can run in parallel]
  ↓
Types & Templates (T007-T009) [can run in parallel]
  ↓
Component Implementation (T010)
  ↓
CSS Integration (T011)
  ↓
HTML Integration (T012-T014) [sequential, same file]
  ↓
Header Integration (T015-T016)
  ↓
Test Verification (T017-T020) [sequential, must validate]
  ↓
Manual Testing (T021)
  ↓
Assets & Polish (T022-T025)
```

## Parallel Execution Examples

### Phase 3.2: Write All Tests in Parallel

```typescript
// Before launching parallel tasks, update TodoWrite:
TodoWrite([
  {"content": "T003 Contract test ThemeToggle interface", "status": "in_progress", "activeForm": "Writing contract test ThemeToggle interface"},
  {"content": "T004 UI behavior tests", "status": "in_progress", "activeForm": "Writing UI behavior tests"},
  {"content": "T005 Accessibility tests", "status": "in_progress", "activeForm": "Writing accessibility tests"},
  {"content": "T006 Performance tests", "status": "in_progress", "activeForm": "Writing performance tests"}
])

// Launch T003-T006 together (4 different test files):
Task: "Write contract test for ThemeToggle component interface in tests/theme-toggle/theme-toggle-contract.test.ts. Test ThemeToggleElement extends HTMLElement, readonly currentTheme property, toggle() method, and custom element registration as 'theme-toggle'. Verify tests FAIL."

Task: "Write UI behavior tests in tests/theme-toggle/theme-toggle-ui.test.ts. Test toggle switches light/dark, localStorage updates, data-theme attribute updates, theme persistence, default to light, invalid value handling. Verify tests FAIL."

Task: "Write accessibility tests in tests/theme-toggle/theme-toggle-accessibility.test.ts. Test role, aria-label, aria-pressed, keyboard Space/Enter, focus indicator, WCAG contrast ratios. Verify tests FAIL."

Task: "Write performance tests in tests/theme-toggle/theme-toggle-performance.test.ts. Test toggle <100ms, localStorage <1ms, no layout shift. Verify tests FAIL."

// After completion, update TodoWrite:
TodoWrite([
  {"content": "T003 Contract test ThemeToggle interface", "status": "completed", "activeForm": "Writing contract test ThemeToggle interface"},
  {"content": "T004 UI behavior tests", "status": "completed", "activeForm": "Writing UI behavior tests"},
  {"content": "T005 Accessibility tests", "status": "completed", "activeForm": "Writing accessibility tests"},
  {"content": "T006 Performance tests", "status": "completed", "activeForm": "Writing performance tests"},
  {"content": "T007 Create TypeScript types", "status": "pending", "activeForm": "Creating TypeScript types"}
])
```

### Phase 3.3: Create Types & Templates in Parallel

```typescript
// Update TodoWrite:
TodoWrite([
  {"content": "T007 Create TypeScript types", "status": "in_progress", "activeForm": "Creating TypeScript types"},
  {"content": "T008 Create SVG icons template", "status": "in_progress", "activeForm": "Creating SVG icons template"},
  {"content": "T009 Create component styles", "status": "in_progress", "activeForm": "Creating component styles"}
])

// Launch T007-T009 together (3 different files):
Task: "Create TypeScript types in src/components/theme-toggle/theme-toggle.types.ts. Define Theme = 'light' | 'dark', ThemeToggleElement interface, ThemeChangeEvent interface."

Task: "Create SVG icons template in src/components/theme-toggle/theme-toggle.html. Include sun icon (for light mode available) and moon icon (for dark mode available) with accessible title attributes."

Task: "Create component styles in src/components/theme-toggle/theme-toggle.css. Include base button styles, icon display logic, focus indicator, hover states, transitions with prefers-reduced-motion support, desktop/mobile positioning."
```

## Progress Tracking Requirements

**CRITICAL**: After completing each task, MUST update progress using TodoWrite tool:

```typescript
TodoWrite([
  {"content": "T001 Create component directory", "status": "completed", "activeForm": "Creating component directory"},
  {"content": "T002 Create test directory", "status": "in_progress", "activeForm": "Creating test directory"},
  {"content": "T003 Contract tests", "status": "pending", "activeForm": "Writing contract tests"}
])
```

**Progress Tracking Rules**:
1. **Before starting any task**: Mark as "in_progress"
2. **After completing any task**: Mark as "completed"
3. **Always keep next 3-5 pending tasks visible** for context
4. **Include task ID (T001, T002, etc.) in content** for clear tracking
5. **Update immediately after each task completion** - don't batch updates
6. **Clean up completed tasks** when todo list gets >10 items

## Notes

- **TDD Critical**: All tests (T003-T006) MUST fail before implementing (T007-T025)
- **Native CSS Approach**: No over-engineering, minimal JavaScript
- **Performance**: <100ms toggle, 0ms FOUC
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Logo**: Dark variant needed for dark mode
- **FOUC Prevention**: Inline script MUST be in `<head>` before CSS
- **Always update TodoWrite** after each task completion

## Validation Checklist

*GATE: Must pass before marking feature complete*

- [ ] All contract tests written and passing (T003, T017)
- [ ] All UI tests written and passing (T004, T018)
- [ ] All accessibility tests written and passing (T005, T019)
- [ ] All performance tests written and passing (T006, T020)
- [ ] All 15 manual scenarios passing (T021)
- [ ] WCAG contrast ratios validated (T011, T019)
- [ ] Cross-browser compatibility verified (T024)
- [ ] No FOUC on any page (T012, T021)
- [ ] Theme persists across sessions (T021)
- [ ] Logo variants swap correctly (T016, T022)
- [ ] Toggle positioned correctly (desktop + mobile) (T013-T014, T021)
- [ ] All tests passing: `make test` (T025)
- [ ] Progress tracked with TodoWrite throughout

---

**NEXT STEP**: Execute T001-T002 (Setup), then T003-T006 in parallel (Tests First - TDD)

---

*Based on Constitution v1.1.0 - TDD workflow enforced*
