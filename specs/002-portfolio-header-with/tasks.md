# Tasks: Portfolio Header with Navigation and Branding

**Input**: Design documents from `/specs/002-portfolio-header-with/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript 5.0+ targeting ES2020, Vite (build), Vitest (testing)
   → Structure: Single frontend project with src/, tests/
2. Load design documents:
   → data-model.md: HeaderComponent, LogoConfiguration, NavigationItem, ResponsiveState, MobileMenuState
   → contracts/: header-component.interface.ts → interface contract tests
   → quickstart.md: Manual testing scenarios
3. Generate tasks by category:
   → Setup: TypeScript interfaces, component structure, test framework
   → Tests: contract tests, responsive behavior tests, accessibility tests
   → Core: header component, logo management, navigation, responsive behavior
   → Integration: mobile menu, keyboard navigation, gallery compatibility
   → Polish: performance optimization, accessibility verification
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests ✓
   → All entities have models ✓
   → All user scenarios have integration tests ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths assume existing portfolio structure with masonry gallery

## Phase 3.1: Setup
- [ ] T001 Create TypeScript interfaces from data model in src/types/header.types.ts
- [ ] T002 [P] Set up Vitest configuration for header component testing
- [ ] T003 [P] Create component directory structure in src/components/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test HeaderComponent interface in tests/contract/header-component.contract.test.ts
- [ ] T005 [P] Contract test LogoConfiguration validation in tests/contract/logo-configuration.contract.test.ts
- [ ] T006 [P] Contract test NavigationItem validation in tests/contract/navigation-item.contract.test.ts
- [ ] T007 [P] Integration test responsive breakpoint transitions in tests/integration/responsive-behavior.test.ts
- [ ] T008 [P] Integration test mobile menu functionality in tests/integration/mobile-menu.test.ts
- [ ] T009 [P] Integration test keyboard accessibility in tests/integration/keyboard-navigation.test.ts
- [ ] T010 [P] Integration test gallery compatibility in tests/integration/gallery-integration.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T011 [P] HeaderComponent base class in src/components/portfolio-header/portfolio-header.ts
- [ ] T012 [P] LogoConfiguration management in src/components/portfolio-header/logo-manager.ts
- [ ] T013 [P] ResponsiveState manager in src/components/portfolio-header/responsive-state.ts
- [ ] T014 [P] Component styles in src/styles/components/portfolio-header.css
- [ ] T015 MobileMenuState manager in src/components/portfolio-header/mobile-menu.ts
- [ ] T016 Navigation item handling in portfolio-header.ts
- [ ] T017 Event listener setup and cleanup in portfolio-header.ts
- [ ] T018 ARIA attributes and accessibility features in portfolio-header.ts

## Phase 3.4: Integration
- [ ] T019 Integrate header with existing page structure in index.html
- [ ] T020 Connect with global design system in src/styles/design-system.css
- [ ] T021 Ensure masonry gallery compatibility
- [ ] T022 Register Web Component and export in src/main.ts

## Phase 3.5: Polish
- [ ] T023 [P] Unit tests for responsive calculations in tests/unit/responsive-calculations.test.ts
- [ ] T024 [P] Unit tests for state validation in tests/unit/state-validation.test.ts
- [ ] T025 [P] Performance tests for menu animation (<100ms) in tests/performance/menu-animation.test.ts
- [ ] T026 Execute manual testing scenarios from quickstart.md
- [ ] T027 Accessibility audit with screen reader testing
- [ ] T028 Cross-browser compatibility verification
- [ ] T029 Remove debug code and optimize bundle size
- [ ] T030 [P] Edge case testing for narrow screens (<320px) in tests/integration/edge-cases.test.ts
- [ ] T031 [P] Error handling for logo loading failures in tests/integration/logo-fallback.test.ts
- [ ] T032 Handle ultrawide screen layouts (>1920px) in portfolio-header.ts

## Dependencies
- Setup (T001-T003) before tests (T004-T010)
- Tests (T004-T010) before implementation (T011-T018)
- T011 (base component) blocks T015, T016, T017, T018
- T012, T013 (managers) can run in parallel with T014 (styles)
- Core implementation (T011-T018) before integration (T019-T022)
- Integration before polish (T023-T032)
- Edge case tasks (T030-T032) run in parallel with other polish tasks

## Parallel Example
```
# Launch T004-T010 together (all test files):
Task: "Contract test HeaderComponent interface in tests/contract/header-component.contract.test.ts"
Task: "Contract test LogoConfiguration validation in tests/contract/logo-configuration.contract.test.ts"
Task: "Contract test NavigationItem validation in tests/contract/navigation-item.contract.test.ts"
Task: "Integration test responsive breakpoint transitions in tests/integration/responsive-behavior.test.ts"
Task: "Integration test mobile menu functionality in tests/integration/mobile-menu.test.ts"
Task: "Integration test keyboard accessibility in tests/integration/keyboard-navigation.test.ts"
Task: "Integration test gallery compatibility in tests/integration/gallery-integration.test.ts"

# Launch T011-T014 together (different component files):
Task: "HeaderComponent base class in src/components/portfolio-header/portfolio-header.ts"
Task: "LogoConfiguration management in src/components/portfolio-header/logo-manager.ts"
Task: "ResponsiveState manager in src/components/portfolio-header/responsive-state.ts"
Task: "Component styles in src/styles/components/portfolio-header.css"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow TDD: write test → see it fail → implement → see it pass
- Component uses Web Components standard with TypeScript
- Must integrate with existing masonry gallery without interference
- All measurements use rem-based units for design system compliance

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - header-component.interface.ts → contract test task T004 [P]
   - Interface validation functions → contract test tasks T005-T006 [P]

2. **From Data Model**:
   - HeaderComponent entity → base component task T011 [P]
   - LogoConfiguration → logo manager task T012 [P]
   - ResponsiveState → responsive manager task T013 [P]
   - MobileMenuState → mobile menu task T015

3. **From User Stories (spec.md)**:
   - Responsive behavior → integration test T007 [P]
   - Mobile menu overlay → integration test T008 [P]
   - Keyboard navigation → integration test T009 [P]
   - Gallery compatibility → integration test T010 [P]

4. **From Quickstart Scenarios**:
   - Manual testing scenarios → validation task T026
   - Accessibility verification → audit task T027
   - Cross-browser testing → compatibility task T028

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T004-T006)
- [x] All entities have model/implementation tasks (T011-T015)
- [x] All tests come before implementation (T004-T010 before T011-T018)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD workflow maintained (tests fail before implementation)
- [x] Integration scenarios covered (responsive, mobile, accessibility, compatibility)
- [x] Performance and polish tasks included (T023-T029)