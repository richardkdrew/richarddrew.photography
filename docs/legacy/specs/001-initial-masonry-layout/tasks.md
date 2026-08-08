# Tasks: Initial Masonry Layout

**Input**: Design documents from `/specs/001-initial-masonry-layout/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Source files under `src/`
- Test files under `tests/`
- Public assets under `public/`

## Phase 3.1: Setup
- [x] T001 Create project structure with src/, tests/, public/ directories
- [x] T002 Initialize Vite + TypeScript project with vanilla configuration
- [x] T003 [P] Create Makefile with dev, build, test, preview, clean commands
- [x] T004 [P] Configure TypeScript with ES2020 target and DOM types
- [x] T005 [P] Set up Vitest for unit testing
- [x] T006 [P] Create test image manifest and sample images in public/images/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Contract test ImageClient.fetchImages() in tests/contract/test_image_client.ts
- [x] T008 [P] Contract test ImageClient.fetchImageById() in tests/contract/test_image_client_by_id.ts
- [x] T009 [P] Contract test manifest schema validation in tests/contract/test_manifest_schema.ts
- [x] T010 [P] Integration test responsive layout mobile in tests/integration/test_responsive_mobile.ts
- [x] T011 [P] Integration test responsive layout tablet in tests/integration/test_responsive_tablet.ts
- [x] T012 [P] Integration test responsive layout desktop in tests/integration/test_responsive_desktop.ts
- [x] T013 [P] Integration test image loading states in tests/integration/test_image_loading.ts
- [x] T014 [P] Integration test failed image handling in tests/integration/test_image_errors.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T015 [P] TypeScript interfaces in src/types/gallery.ts
- [ ] T016 [P] TypeScript interfaces in src/types/image.ts
- [ ] T017 [P] TypeScript interfaces in src/types/client.ts
- [ ] T018 [P] LocalImageClient implementation in src/client/local-image-client.ts
- [ ] T019 [P] Image component with progressive loading in src/components/gallery-image.ts
- [ ] T020 [P] Column component for masonry layout in src/components/masonry-column.ts
- [ ] T021 Gallery container component in src/components/masonry-gallery.ts
- [ ] T022 Main application entry point in src/main.ts
- [ ] T023 Base HTML template in public/index.html

## Phase 3.4: Styling & Layout
- [ ] T024 [P] CSS reset and base styles in src/styles/base.css
- [ ] T025 [P] CSS Grid masonry layout in src/styles/masonry.css
- [ ] T026 [P] Responsive breakpoints with custom properties in src/styles/responsive.css
- [ ] T027 [P] Image loading states and placeholders in src/styles/images.css
- [ ] T028 CSS imports and coordination in src/styles/main.css

## Phase 3.5: Integration & Polish
- [ ] T029 Vite build configuration optimization in vite.config.ts
- [ ] T030 Test image manifest with varied aspect ratios in public/images/manifest.json
- [ ] T031 [P] Performance tests for smooth scrolling in tests/performance/test_scroll.ts
- [ ] T032 [P] Performance tests for resize reflow in tests/performance/test_resize.ts
- [ ] T033 [P] Accessibility tests for keyboard navigation in tests/a11y/test_keyboard.ts
- [ ] T034 [P] Cross-browser testing documentation in tests/manual/browser-testing.md
- [ ] T035 Manual testing execution per quickstart.md scenarios

## Dependencies
- Setup (T001-T006) before everything else
- Tests (T007-T014) before implementation (T015-T023)
- TypeScript interfaces (T015-T017) before components (T018-T021)
- LocalImageClient (T018) before Gallery components (T019-T021)
- Components (T019-T021) before main application (T022)
- CSS files (T024-T027) before CSS coordination (T028)
- Core implementation complete before integration (T029-T035)

## Parallel Example
```bash
# Setup phase - can run after T001-T002:
make task T003 & make task T004 & make task T005 & make task T006

# Contract tests - can run in parallel:
make task T007 & make task T008 & make task T009

# Integration tests - can run in parallel:
make task T010 & make task T011 & make task T012 & make task T013 & make task T014

# TypeScript interfaces - can run in parallel:
make task T015 & make task T016 & make task T017

# Component implementation - LocalImageClient first, then others in parallel:
make task T018
make task T019 & make task T020

# CSS styling - can run in parallel:
make task T024 & make task T025 & make task T026 & make task T027

# Performance and testing - can run in parallel:
make task T031 & make task T032 & make task T033 & make task T034
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify tests fail before implementing (TDD requirement)
- Use `make dev` for development server during implementation
- Run `make test` after each implementation task
- All CSS must support smooth responsive reflow
- Images must use WebP + JPEG fallback pattern
- Follow TypeScript strict mode throughout

## Validation Checklist

- [ ] All contract tests written and failing
- [ ] All integration tests cover responsive breakpoints
- [ ] LocalImageClient handles manifest loading and errors
- [ ] Gallery components use TypeScript interfaces
- [ ] CSS Grid layout supports 1/3/4+ columns
- [ ] Image loading includes progressive enhancement
- [ ] Manual testing scenarios executable
- [ ] Performance targets met (smooth reflow, fast loading)