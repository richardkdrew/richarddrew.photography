# Tasks: Full-Screen Image Viewer

**Feature**: 007-full-screen-image
**Branch**: `007-full-screen-image`
**Input**: Design documents from `/Users/richarddrew/working/portfolio-website/specs/007-full-screen-image/`

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript → Vanilla JS, Vite, Vitest
   → Structure: Single project (src/, tests/)
2. Load design documents ✅
   → data-model.md: 7 entities extracted
   → contracts/: 2 contract files found
   → quickstart.md: 30 test scenarios identified
3. Generate tasks by category ✅
   → Setup: Component structure, dependencies
   → Tests: Contract, UI, accessibility, performance (TDD)
   → Core: Component implementation
   → Integration: Gallery integration
   → Polish: Manual testing, validation
4. Apply task rules ✅
   → Different files = [P] for parallel
   → Same file = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T045) ✅
6. Return: SUCCESS (45 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root

## Phase 3.1: Setup & Structure

- [x] **T001** Create component folder structure at `src/components/image-viewer/`
- [x] **T002** Create test folder structure at `tests/image-viewer/`
- [x] **T003** [P] Add IntersectionObserver mock to `tests/setup.ts` (if not already present for viewer preloading)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Type Definitions (Foundation)
- [x] **T004** [P] Create TypeScript interfaces in `src/components/image-viewer/image-viewer.types.ts`
  - ViewerState, ImageData, NavigationEventDetail, ViewerConfig, ViewerElements, ViewerAPI interfaces
  - Type guards: isValidViewerState, isValidImageData
  - ViewerEvents type definitions

### Contract Tests (API Compliance)
- [x] **T005** [P] Create viewer API contract tests in `tests/image-viewer/image-viewer-contract.test.ts` (depends: T004)
  - Test: open(index) sets state.active=true and currentIndex=index
  - Test: close() sets state.active=false and restores scroll
  - Test: next() increments currentIndex by 1
  - Test: prev() decrements currentIndex by 1
  - Test: getState() returns readonly ViewerState
  - Test: configure() updates config when inactive
  - Test: setEnabled(false) auto-closes if active
  - Test: open(-1) throws RangeError
  - Test: open(999) throws RangeError (out of bounds)
  - Test: configure() while active throws Error
  - Test: Navigation at boundaries disables buttons
  - Test: All events dispatch with correct detail objects (viewer:open, viewer:close, viewer:navigate, viewer:enabled, viewer:error)

- [x] **T006** [P] Create gallery integration contract tests in `tests/image-viewer/gallery-integration-contract.test.ts` (depends: T004)
  - Test: Gallery.getImages() returns valid ImageData array
  - Test: Gallery.getColumnCount() returns correct number at each breakpoint
  - Test: Gallery calls viewer.open() on image click when enabled
  - Test: Gallery does NOT call viewer.open() when disabled (mobile)
  - Test: Gallery updates viewer.setEnabled() on ResizeObserver callback
  - Test: Viewer queries gallery for images on init
  - Test: Viewer respects gallery column count for enabled state
  - Test: Viewer saves/restores gallery scroll position
  - Test: Viewer closes automatically when gallery resizes to 1 column
  - Test: Viewer handles image load failures from gallery srcset

### UI Tests (User Scenarios)
- [x] **T007** [P] Create viewer UI tests in `tests/image-viewer/image-viewer-ui.test.ts` (depends: T004)
  - Test TS-001: Viewer activation in multi-column mode
  - Test TS-002: Viewer disabled in single-column mobile
  - Test TS-003: Keyboard navigation - next (Right Arrow)
  - Test TS-004: Keyboard navigation - previous (Left Arrow)
  - Test TS-005: Navigation boundary - first image (prev disabled)
  - Test TS-006: Navigation boundary - last image (next disabled)
  - Test TS-007: Close via ESC key
  - Test TS-008: Close via close button
  - Test TS-009: Close via browser back button
  - Test TS-010: Touch swipe - next (>50px threshold)
  - Test TS-011: Touch swipe - previous (>50px threshold)
  - Test TS-012: Button navigation - next
  - Test TS-013: Button navigation - previous
  - Test TS-014: Image preloading (n-1, n+1)
  - Test TS-015: Rapid navigation - no animation queue
  - Test TS-016: Responsive sizing - desktop (80vw, max 85vh)
  - Test TS-017: Responsive sizing - tablet (90vw, max 85vh)
  - Test TS-018: Browser resize desktop→mobile auto-closes viewer
  - Test TS-019: Browser resize mobile→desktop enables viewer
  - Test TS-020: Image load failure - auto skip to next
  - Test TS-021: Rapid navigation maintains 60fps

### Accessibility Tests (WCAG Compliance)
- [x] **T008** [P] Create viewer accessibility tests in `tests/image-viewer/image-viewer-accessibility.test.ts` (depends: T004)
  - Test TS-024: Focus trap - Tab cycles within viewer
  - Test TS-024b: Focus trap - Shift+Tab cycles backward
  - Test TS-025: ARIA attributes correct (role="dialog", aria-label, aria-modal)
  - Test TS-025b: ARIA live region announces image changes
  - Test TS-026: Keyboard-only navigation works (arrow keys, ESC)
  - Test TS-026b: All controls accessible via keyboard
  - Test TS-027: Reduced motion disables transforms (opacity only)
  - Test: Button labels correct (Close, Next, Previous with aria-label)
  - Test: Disabled buttons have aria-disabled="true"
  - Test: Focus restored to trigger element on close

### Performance Tests (Benchmarks)
- [x] **T009** [P] Create viewer performance tests in `tests/image-viewer/image-viewer-performance.test.ts` (depends: T004)
  - Test: Viewer open completes in <50ms (click → first frame)
  - Test: Viewer close completes in <16ms (ESC → scroll restore)
  - Test: Navigation transition = 300ms ± 10ms
  - Test: Image preload initiates within 200ms
  - Test: Resize auto-close completes in <16ms
  - Test: Transitions maintain 60fps (16.67ms frame budget)
  - Test: Memory stable after 10 open/close cycles (no leaks)
  - Test: Event listeners cleaned up on disconnect

### Theme Integration Tests
- [x] **T010** [P] Create theme integration tests in `tests/image-viewer/image-viewer-theme.test.ts` (depends: T004)
  - Test TS-022: Viewer uses --background-color in dark mode
  - Test TS-023: Viewer uses --background-color in light mode
  - Test: Viewer uses --text-color for controls
  - Test: Theme changes while viewer open update styles

## Phase 3.3: Component Foundation (ONLY after tests are failing)

### HTML Template
- [x] **T011** [P] Create viewer HTML template in `src/components/image-viewer/image-viewer.html`
  - Viewer container with data-state="inactive" attribute
  - Header section: image counter + close button
  - Image container: <picture> element with srcset support
  - Navigation buttons: Previous (left) + Next (right)
  - ARIA live region for screen reader announcements
  - Proper semantic HTML: article > header + figure

### CSS Styles
- [x] **T012** [P] Create viewer CSS in `src/components/image-viewer/image-viewer.css`
  - Full-page layout: position: fixed, inset: 0, z-index: 100
  - Grid layout: grid-template-rows: auto 1fr (header + content)
  - Responsive image sizing with CSS custom properties:
    - --viewer-width-mobile: 100vw
    - --viewer-width-tablet: 90vw
    - --viewer-width-desktop: 80vw
    - --viewer-max-height: 85vh
  - Image styling: object-fit: contain, object-position: center
  - Transition animations (300ms, GPU-accelerated):
    - transform: translateX() for slides
    - opacity for fades
  - Button states: disabled (grayed out, aria-disabled)
  - Theme integration: var(--background-color), var(--text-color)
  - Reduced motion support: @media (prefers-reduced-motion: reduce)
  - Visibility states: [data-state="active"] display, [data-state="inactive"] hidden

## Phase 3.4: Core Implementation (Make tests pass)

### Component Logic
- [ ] **T013** Implement ImageViewer Web Component class in `src/components/image-viewer/image-viewer.ts` (depends: T004-T012)
  - Import types from image-viewer.types.ts
  - Import styles from image-viewer.css
  - Extend HTMLElement, define custom element 'image-viewer'
  - Initialize state: ViewerState with default values
  - Load HTML template from image-viewer.html
  - Query and cache DOM elements (ViewerElements interface)

- [ ] **T014** Implement public API methods in `src/components/image-viewer/image-viewer.ts` (depends: T013)
  - open(index: number): Validate index, save scroll, show viewer, push history, focus close button
  - close(): Restore scroll, hide viewer, replace history, restore focus, cleanup preload links
  - next(): Increment index, transition image, update counter, preload adjacent, update buttons
  - prev(): Decrement index, transition image, update counter, preload adjacent, update buttons
  - getState(): Return readonly copy of ViewerState
  - configure(config: Partial<ViewerConfig>): Merge with defaults, throw if active
  - setEnabled(enabled: boolean): Update state, auto-close if active and disabled

- [ ] **T015** Implement keyboard navigation in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Listen for keydown events on viewer container
  - ArrowLeft → prev() (if currentIndex > 0)
  - ArrowRight → next() (if currentIndex < totalImages - 1)
  - Escape → close()
  - Prevent default for all handled keys
  - Stop propagation to avoid page-level shortcuts

- [ ] **T016** Implement touch gesture handling in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Listen for touchstart (capture X/Y coords)
  - Listen for touchend (calculate deltaX/deltaY)
  - If |deltaX| > 50px AND |deltaX| > |deltaY| → horizontal swipe
  - deltaX > 0 → prev(), deltaX < 0 → next()
  - Use passive listeners for scroll performance

- [ ] **T017** Implement History API integration in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - On open(): pushState with { viewer: 'active', imageIndex: N }
  - Update URL with ?image=<id> query param
  - Listen for popstate event
  - If state.viewer !== 'active' → close()
  - On close(): replaceState to remove viewer state

- [ ] **T018** Implement image preloading in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Create preloadAdjacentImages(currentIndex, images) function
  - Remove existing <link rel="preload" data-viewer> from <head>
  - If currentIndex > 0: Create preload link for images[currentIndex - 1]
  - If currentIndex < totalImages - 1: Create preload link for images[currentIndex + 1]
  - Append links to <head>
  - Set loading="eager" on current image
  - Call preloadAdjacentImages() on navigation and open

- [ ] **T019** Implement focus trap in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Query all focusable elements in viewer (buttons, links, inputs)
  - Store first and last focusable elements
  - Listen for Tab key on viewer
  - If Shift+Tab at first element → focus last element
  - If Tab at last element → focus first element
  - Auto-focus close button on open
  - Save document.activeElement on open, restore on close

- [ ] **T020** Implement scroll position management in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - On open(): localStorage.setItem('gallery-scroll', String(window.scrollY))
  - Prevent page scroll: document.body.style.overflow = 'hidden'
  - On close(): Read scrollY from localStorage
  - Restore: window.scrollTo({ top: scrollY, behavior: 'instant' })
  - Re-enable scroll: document.body.style.overflow = ''
  - Cleanup: localStorage.removeItem('gallery-scroll')

- [ ] **T021** Implement image error handling in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Listen for 'error' event on <img> element
  - On error: Dispatch 'viewer:error' custom event
  - Auto-skip: If index < totalImages - 1 → next()
  - Else if index > 0 → prev()
  - Else (all images failed) → close()
  - Log warning to console (no error UI)

- [ ] **T022** Implement event dispatching in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Dispatch 'viewer:open' on open (detail: { index })
  - Dispatch 'viewer:close' on close (detail: { fromIndex })
  - Dispatch 'viewer:navigate' on next/prev (detail: { direction, fromIndex, toIndex, trigger })
  - Dispatch 'viewer:enabled' on setEnabled (detail: { enabled })
  - Dispatch 'viewer:error' on image failure (detail: { index, error })
  - All events: bubbles: true, cancelable: false

- [ ] **T023** Implement counter and button state updates in `src/components/image-viewer/image-viewer.ts` (depends: T014)
  - Update counter text: "N of M" on navigation
  - Update ARIA live region: "Image N of M"
  - Update prev button: disabled (aria-disabled="true") if currentIndex === 0
  - Update next button: disabled (aria-disabled="true") if currentIndex === totalImages - 1
  - Update both buttons enabled when between boundaries

## Phase 3.5: Gallery Integration

- [ ] **T024** Add viewer integration to Gallery component in `src/components/gallery/gallery.ts`
  - Implement getImages(): ImageData[] method
    - Query all .portfolio-image img elements
    - Map to ImageData objects with id, src, srcset, alt, width, height, index
    - Return array in display order
  - Implement getColumnCount(): number method
    - Use getComputedStyle(this).getPropertyValue('grid-template-columns')
    - Split by space, filter 'auto', return length
  - Store viewer reference: viewer = document.querySelector('image-viewer')

- [ ] **T025** Add click handler to Gallery component in `src/components/gallery/gallery.ts` (depends: T024)
  - Listen for click events on gallery container
  - Find closest .portfolio-image img from event target
  - Get image index from images array (match by dataset.id)
  - Check if viewer enabled: viewer.getState().enabled
  - If enabled: viewer.open(index)
  - If disabled: No-op (mobile single-column mode)

- [ ] **T026** Add ResizeObserver to Gallery component in `src/components/gallery/gallery.ts` (depends: T024)
  - Create ResizeObserver in connectedCallback
  - On resize: Get current column count via getColumnCount()
  - Compare to lastColumnCount (track state)
  - If changed: Call viewer.setEnabled(columns > 1)
  - Update lastColumnCount
  - Disconnect observer in disconnectedCallback

- [ ] **T027** Update gallery.html to include viewer element
  - Add <image-viewer data-state="inactive"></image-viewer> after <masonry-gallery>
  - Ensure viewer is sibling, not child of gallery
  - Verify component load order (gallery before viewer in DOM)

- [ ] **T028** Update main.ts to import and register viewer component
  - Add: import './components/image-viewer/image-viewer.ts'
  - Verify custom element registration (check if not already defined)
  - Ensure import after gallery component

## Phase 3.6: Polish & Validation

### Manual Testing
- [ ] **T029** Execute manual test scenarios from quickstart.md
  - Run dev server: make dev
  - Test TS-001 to TS-030 (30 scenarios)
  - Verify all test cases pass
  - Document any issues found

### Performance Validation
- [ ] **T030** [P] Run performance audit with Chrome DevTools
  - Open viewer, record Performance profile
  - Verify transitions maintain 60fps (16.67ms frames)
  - Verify open() completes in <50ms
  - Verify close() completes in <16ms
  - Verify preload initiates within 200ms
  - Check for layout thrashing (batch reads/writes)

- [ ] **T031** [P] Run Lighthouse performance audit
  - Command: npx lighthouse http://localhost:5173/gallery.html --only-categories=performance
  - Verify score ≥90
  - Check for no render-blocking resources
  - Verify efficient cache policy for images

### Accessibility Validation
- [ ] **T032** [P] Run Lighthouse accessibility audit
  - Command: npx lighthouse http://localhost:5173/gallery.html --only-categories=accessibility
  - Verify score = 100 (WCAG 2.1 AA)
  - Check ARIA attributes correct
  - Verify keyboard navigation works
  - Test with screen reader (VoiceOver or NVDA)

### Cross-Browser Testing
- [ ] **T033** [P] Test in Chrome/Firefox/Safari
  - Chrome 90+: Primary browser (full test suite)
  - Firefox 88+: Core functionality + accessibility
  - Safari 14+: Core functionality + mobile gestures
  - Document any browser-specific issues

- [ ] **T034** [P] Test on mobile devices
  - Mobile Safari iOS 14+: Touch gestures, responsive sizing
  - Chrome Android 90+: Touch gestures, resize behavior
  - Test single-column disable (viewer should NOT activate)
  - Verify swipe threshold (50px)

### Code Quality
- [ ] **T035** [P] Verify TypeScript line count constraint
  - Count lines in image-viewer.ts (excluding comments/whitespace)
  - Target: ≤150 lines (constitutional requirement)
  - If over: Refactor to simplify

- [ ] **T036** [P] Remove code duplication
  - Check for repeated logic between next/prev methods
  - Extract common navigation logic to shared function
  - Consolidate event dispatch patterns
  - DRY principle for DOM updates

- [ ] **T037** [P] Run linter and fix issues
  - Command: make test (includes linting)
  - Fix any TypeScript errors
  - Fix any ESLint warnings
  - Ensure consistent code style

### Final Integration
- [ ] **T038** Verify all 250+ tests pass
  - Run: make test
  - Verify image-viewer tests: ~60-70 tests
  - Verify no regressions in gallery: 79 tests
  - Verify no regressions in header: 71 tests
  - Verify no regressions in about-page: 61 tests
  - Verify no regressions in theme-toggle: 68 tests
  - Total expected: ~340 tests passing

- [ ] **T039** Test viewer with gallery manifest data
  - Ensure viewer works with responsive-images.json manifest
  - Test with multiple image formats (WebP, JPEG)
  - Test with various aspect ratios (portrait, landscape, square)
  - Verify srcset selection for different viewports

### Memory & Cleanup
- [ ] **T040** [P] Verify memory cleanup (DevTools Memory tab)
  - Take heap snapshot before opening viewer
  - Open/close viewer 10 times
  - Take heap snapshot after
  - Compare: Detached DOM nodes should return to baseline
  - Check: No orphaned event listeners (use getEventListeners())
  - Verify: Preload links removed from <head> on close

### Documentation Updates
- [ ] **T041** [P] Update CLAUDE.md with feature completion
  - Add to "Recent Changes" section
  - Document: "Feature 007: Full-Screen Image Viewer Complete"
  - Note: "Integrated full-page viewer with keyboard/touch navigation, History API, preloading, ~150 lines TS"
  - Update current feature status

- [ ] **T042** [P] Update constitution.md with feature completion (if needed)
  - Add to "Recent Feature Completions" section
  - Document architectural patterns used
  - Note any new constitutional precedents

### Git Integration
- [ ] **T043** Commit all viewer changes
  - Add: src/components/image-viewer/ (all files)
  - Add: tests/image-viewer/ (all files)
  - Add: Updated gallery files (gallery.ts, gallery.html)
  - Add: Updated main.ts
  - Commit message: "feat: Add full-screen image viewer with keyboard/touch navigation\n\n- CSS-first full-page viewer (~150 lines TS)\n- History API for back button support\n- Preload n±1 images for instant navigation\n- ResizeObserver auto-close on mobile\n- WCAG 2.1 AA compliant\n- 60+ tests (contract, UI, a11y, performance)\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"

- [ ] **T044** Run final test suite and verify build
  - Run: make test (all tests must pass)
  - Run: make build (production build must succeed)
  - Run: make preview (verify viewer works in production build)
  - Check: No console errors or warnings

- [ ] **T045** Mark feature complete and update spec
  - Update spec.md: Status → "Complete"
  - Update plan.md: Progress Tracking → All phases ✅
  - Update tasks.md: All tasks checked ✅
  - Feature ready for PR or merge to main

## Dependencies

### Phase Dependencies
- **Setup (T001-T003)** must complete before anything else
- **Tests (T004-T010)** must complete before implementation (T011-T023)
- **Foundation (T011-T012)** must complete before component logic (T013-T023)
- **Component (T013-T023)** must complete before integration (T024-T028)
- **Integration (T024-T028)** must complete before polish (T029-T045)

### Task-Level Dependencies
- T004 blocks: T005, T006, T007, T008, T009, T010 (types needed for tests)
- T013 blocks: T014-T023 (component class needed for methods)
- T024 blocks: T025, T026 (gallery methods needed for integration)
- T038 blocks: T043, T044, T045 (tests must pass before commit/complete)

### Parallel Execution Groups
**Group 1 - Test Suites** (after T004):
- T005, T006, T007, T008, T009, T010 can run in parallel [P]

**Group 2 - Foundation** (after tests fail):
- T011, T012 can run in parallel [P]

**Group 3 - Polish Tasks**:
- T030, T031, T032, T033, T034, T035, T036, T037, T040, T041, T042 can run in parallel [P]

## Parallel Execution Example

### Execute Test Suite in Parallel (after T004 complete)

```typescript
// Update TodoWrite before launching parallel tasks:
TodoWrite: [
  {"content": "T005 Viewer API contract tests", "status": "in_progress", "activeForm": "Writing viewer API contract tests"},
  {"content": "T006 Gallery integration contract tests", "status": "in_progress", "activeForm": "Writing gallery integration contract tests"},
  {"content": "T007 Viewer UI tests", "status": "in_progress", "activeForm": "Writing viewer UI tests"},
  {"content": "T008 Viewer accessibility tests", "status": "in_progress", "activeForm": "Writing viewer accessibility tests"},
  {"content": "T009 Viewer performance tests", "status": "in_progress", "activeForm": "Writing viewer performance tests"},
  {"content": "T010 Theme integration tests", "status": "in_progress", "activeForm": "Writing theme integration tests"}
]

// Launch tasks in parallel (single message, multiple tool calls):
Task: "Create viewer API contract tests in tests/image-viewer/image-viewer-contract.test.ts with 15 test cases from viewer-api.contract.md"
Task: "Create gallery integration contract tests in tests/image-viewer/gallery-integration-contract.test.ts with 10 test cases from gallery-integration.contract.md"
Task: "Create viewer UI tests in tests/image-viewer/image-viewer-ui.test.ts with 21 test scenarios from quickstart.md (TS-001 to TS-021)"
Task: "Create viewer accessibility tests in tests/image-viewer/image-viewer-accessibility.test.ts with 10 test cases from quickstart.md (TS-024 to TS-027)"
Task: "Create viewer performance tests in tests/image-viewer/image-viewer-performance.test.ts with 8 benchmark tests"
Task: "Create theme integration tests in tests/image-viewer/image-viewer-theme.test.ts with 4 test cases (TS-022, TS-023)"

// After completion, update TodoWrite:
TodoWrite: [
  {"content": "T005 Viewer API contract tests", "status": "completed", "activeForm": "Writing viewer API contract tests"},
  {"content": "T006 Gallery integration contract tests", "status": "completed", "activeForm": "Writing gallery integration contract tests"},
  {"content": "T007 Viewer UI tests", "status": "completed", "activeForm": "Writing viewer UI tests"},
  {"content": "T008 Viewer accessibility tests", "status": "completed", "activeForm": "Writing viewer accessibility tests"},
  {"content": "T009 Viewer performance tests", "status": "completed", "activeForm": "Writing viewer performance tests"},
  {"content": "T010 Theme integration tests", "status": "completed", "activeForm": "Writing theme integration tests"},
  {"content": "T011 Create HTML template", "status": "pending", "activeForm": "Creating HTML template"}
]
```

### Execute Foundation in Parallel (after tests fail)

```typescript
// Update TodoWrite:
TodoWrite: [
  {"content": "T011 Create HTML template", "status": "in_progress", "activeForm": "Creating HTML template"},
  {"content": "T012 Create CSS styles", "status": "in_progress", "activeForm": "Creating CSS styles"}
]

// Launch in parallel:
Task: "Create viewer HTML template in src/components/image-viewer/image-viewer.html with semantic structure from research.md"
Task: "Create viewer CSS in src/components/image-viewer/image-viewer.css with full-page layout, transitions, responsive sizing from research.md"

// After completion, update TodoWrite:
TodoWrite: [
  {"content": "T011 Create HTML template", "status": "completed", "activeForm": "Creating HTML template"},
  {"content": "T012 Create CSS styles", "status": "completed", "activeForm": "Creating CSS styles"},
  {"content": "T013 Implement Web Component class", "status": "pending", "activeForm": "Implementing Web Component class"}
]
```

## Progress Tracking Requirements

**CRITICAL**: Must use TodoWrite tool throughout implementation:

1. **Before starting any task**: Mark as "in_progress"
2. **After completing any task**: Mark as "completed" immediately
3. **Keep next 3-5 pending tasks visible** for context
4. **Include task ID (T001, T002, etc.)** in content
5. **Update after each task** - no batching
6. **Clean up completed tasks** when list exceeds 10 items

Example progression:
```typescript
// Starting T001
TodoWrite: [
  {"content": "T001 Create component folder structure", "status": "in_progress", "activeForm": "Creating component folder structure"},
  {"content": "T002 Create test folder structure", "status": "pending", "activeForm": "Creating test folder structure"},
  {"content": "T003 Add IntersectionObserver mock", "status": "pending", "activeForm": "Adding IntersectionObserver mock"}
]

// After T001 completes
TodoWrite: [
  {"content": "T001 Create component folder structure", "status": "completed", "activeForm": "Creating component folder structure"},
  {"content": "T002 Create test folder structure", "status": "in_progress", "activeForm": "Creating test folder structure"},
  {"content": "T003 Add IntersectionObserver mock", "status": "pending", "activeForm": "Adding IntersectionObserver mock"}
]
```

## Validation Checklist

Before marking feature complete (T045), verify:

- [x] All contracts have corresponding tests (T005, T006)
- [x] All entities have type definitions (T004)
- [x] All tests written before implementation (T004-T010 before T013-T023)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Progress tracking with TodoWrite throughout
- [x] Task IDs included in all descriptions

## Task Summary

**Total Tasks**: 45
**Parallel Tasks**: 18 ([P] markers)
**Sequential Tasks**: 27
**Estimated Duration**: 8-10 hours (with TDD workflow)

**By Phase**:
- Setup (3 tasks)
- Tests (7 tasks - 6 parallel + 1 foundation)
- Foundation (2 tasks - parallel)
- Implementation (11 tasks - sequential, depends on tests)
- Integration (5 tasks - sequential)
- Polish (17 tasks - mostly parallel)

**Critical Path**:
T001 → T002 → T004 → T005-T010 → T011-T012 → T013 → T014-T023 → T024-T028 → T038 → T043-T045

**Next Step**: Begin with T001 (Create component folder structure)
