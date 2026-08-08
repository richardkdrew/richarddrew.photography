
# Implementation Plan: Full-Screen Image Viewer

**Branch**: `007-full-screen-image` | **Date**: 2025-10-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/Users/richarddrew/working/portfolio-website/specs/007-full-screen-image/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Full-page image viewer for portfolio gallery that provides seamless image browsing with keyboard navigation, touch gestures, and browser back button support. CSS-first implementation (~150 lines TS max) with 300ms transitions, preloading of adjacent images, and responsive sizing across mobile/tablet/desktop breakpoints. Only activates in multi-column gallery layouts (tablet/desktop), not in single-column mobile mode.

## Technical Context
**Language/Version**: TypeScript (ES2020+) → Vanilla JavaScript (Vite build)
**Primary Dependencies**: None (vanilla Web Components, CSS-first approach)
**Storage**: History API for URL state, localStorage for gallery scroll position
**Testing**: Vitest with JSDOM (contract, UI, accessibility, performance test suites)
**Target Platform**: Modern browsers (ES2020+), responsive web (mobile/tablet/desktop)
**Project Type**: Single (web component library with vanilla output)
**Performance Goals**: 60fps during 300ms CSS transitions, <200ms image preload initiation
**Constraints**: ~150 lines TypeScript max, CSS-first (minimal JS), 50px swipe threshold, no framework dependencies
**Scale/Scope**: Portfolio gallery viewer (single component, integrates with existing masonry-gallery)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Specification-First ✅
- Feature specification complete with 19 functional requirements
- All requirements testable and unambiguous
- Clarification session completed (18 clarifications resolved)

### II. Test-Driven Development ✅
- TDD workflow planned: Contract tests → Implementation → Integration tests
- Test suites will follow established pattern: contract, UI, accessibility, performance
- All tests written before implementation begins

### III. Feature Documentation ✅
- Specification complete: spec.md with user scenarios, requirements, entities
- Implementation plan: This document (plan.md)
- Phase 0 will generate: research.md
- Phase 1 will generate: data-model.md, contracts/, quickstart.md

### IV. Systematic Planning ✅
- Plan follows numbered task sequence
- Dependencies identified (viewer depends on gallery integration)
- Parallel execution opportunities marked in Phase 2

### V. Simplicity ✅
- CSS-first approach minimizes JavaScript complexity
- ~150 line TypeScript constraint enforces simplicity
- No framework dependencies, vanilla Web Components only
- Integrated viewer (not modal overlay) reduces complexity

### VI. Architectural Consistency ✅
- Follows component-folder pattern: `src/components/image-viewer/`
- Structure: image-viewer.ts, image-viewer.css, image-viewer.types.ts, image-viewer.html
- Test organization: `tests/image-viewer/` with 4 test suites
- Matches established pattern from about-page, theme-toggle

### VII. Dynamic Architecture Principles ✅
- **Clean Interfaces**: ViewerState interface, ImageData interface, minimal API surface
- **Optimal Performance**: 60fps transitions, preloading strategy, efficient event handling
- **Design Patterns**: Observer (resize/popstate events), State (viewer active/inactive)
- **Separation of Concerns**: Viewer logic separated from gallery, CSS handles presentation
- **Modular & Testable**: Component isolated, dependencies injected via gallery integration
- **Scalability**: Handles arbitrary gallery sizes, responsive across all breakpoints

**Initial Constitution Check**: PASS ✅

---

**Post-Design Constitution Check**: PASS ✅

After completing Phase 0 (Research) and Phase 1 (Design), re-evaluating constitutional compliance:

### I. Specification-First ✅
- Feature spec remains complete and unambiguous
- All design decisions traced to spec requirements
- No scope creep during design phase

### II. Test-Driven Development ✅
- Contract tests defined in advance (viewer-api.contract.md, gallery-integration.contract.md)
- 30 manual test scenarios documented (quickstart.md)
- All tests designed to fail before implementation

### III. Feature Documentation ✅
- Complete artifact set generated:
  - ✅ research.md (10 technical decisions documented)
  - ✅ data-model.md (7 core entities, validation rules)
  - ✅ contracts/ (2 contract files: API + integration)
  - ✅ quickstart.md (30 test scenarios)

### IV. Systematic Planning ✅
- Phase 0 research completed with rationale for all decisions
- Phase 1 design produced testable contracts
- Phase 2 approach defined (task generation strategy)
- Dependencies clear: Tests → Models → Implementation

### V. Simplicity ✅
- Design maintains ~150 line TypeScript constraint
- CSS-first approach preserved (10 CSS patterns, minimal JS)
- No new dependencies introduced
- Complexity justified: Full-page viewer simpler than modal overlay

### VI. Architectural Consistency ✅
- Component folder structure defined: `src/components/image-viewer/`
- Files: image-viewer.ts, .css, .types.ts, .html
- Test structure: `tests/image-viewer/` with 4 test suites
- Matches established pattern (about-page, theme-toggle, gallery)

### VII. Dynamic Architecture Principles ✅
- **Clean Interfaces**: ViewerAPI (7 methods), GalleryIntegration (4 methods)
- **Optimal Performance**: All targets defined (60fps, <200ms preload, <50ms open)
- **Design Patterns**: Observer (resize, popstate), State (active/inactive), Factory (ImageData)
- **Separation of Concerns**: Viewer/Gallery separation, CSS/JS separation
- **Modular & Testable**: 30 test scenarios, contract tests, integration tests
- **Scalability**: Handles arbitrary gallery sizes, responsive breakpoints

**Design Phase Violations**: NONE

**New Complexity Introduced**: NONE

**Post-Design Result**: PASS ✅ - Proceed to Phase 2

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Portfolio website with component-based architecture

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

1. **TypeScript Type Definitions** (from data-model.md)
   - Task: Create `image-viewer.types.ts` with all interfaces (ViewerState, ImageData, NavigationEvent, ViewerConfig, etc.)
   - Parallel: Independent of other tasks [P]

2. **Contract Tests** (from contracts/*.contract.md)
   - Task: Create `tests/image-viewer/image-viewer-contract.test.ts`
     - 10 API method tests (open, close, next, prev, getState, configure, setEnabled)
     - 5 event dispatch tests (viewer:open, viewer:close, etc.)
     - Type guard validation tests
   - Task: Create `tests/image-viewer/gallery-integration.test.ts`
     - 4 gallery method tests (getImages, getColumnCount, etc.)
     - 5 integration flow tests (click → open, resize → close, etc.)
   - Parallel: Test files independent [P]
   - Dependency: Requires types from image-viewer.types.ts

3. **UI Test Suite** (from quickstart.md scenarios)
   - Task: Create `tests/image-viewer/image-viewer-ui.test.ts`
     - 15 core UI scenarios (TS-001 to TS-015 from quickstart)
     - Responsive sizing tests (TS-016 to TS-017)
     - Navigation boundary tests (TS-005, TS-006)
   - Dependency: Requires types and contract tests

4. **Accessibility Test Suite** (from quickstart.md accessibility scenarios)
   - Task: Create `tests/image-viewer/image-viewer-accessibility.test.ts`
     - Focus trap tests (TS-024)
     - Screen reader tests (TS-025)
     - Keyboard navigation tests (TS-026)
     - Reduced motion tests (TS-027)
   - Parallel: Independent of UI tests [P]
   - Dependency: Requires types

5. **Performance Test Suite** (from quickstart.md performance benchmarks)
   - Task: Create `tests/image-viewer/image-viewer-performance.test.ts`
     - Open/close timing tests (<50ms, <16ms)
     - Transition duration tests (300ms ± 10ms)
     - Preload initiation tests (<200ms)
     - Memory cleanup tests
   - Parallel: Independent of other test suites [P]
   - Dependency: Requires types

6. **HTML Template** (from research.md and contracts)
   - Task: Create `src/components/image-viewer/image-viewer.html`
     - Viewer container with data-state attribute
     - Header with counter and close button
     - Image container with navigation buttons
     - ARIA live region for announcements
   - Parallel: Independent of tests [P]

7. **CSS Styles** (from research.md patterns)
   - Task: Create `src/components/image-viewer/image-viewer.css`
     - Full-page layout (position: fixed, inset: 0)
     - Responsive image sizing (CSS custom properties)
     - Transition animations (300ms GPU-accelerated)
     - Theme integration (CSS variables)
     - Reduced motion support
   - Parallel: Independent of tests [P]

8. **Component Implementation** (make tests pass)
   - Task: Create `src/components/image-viewer/image-viewer.ts`
     - Web Component class extending HTMLElement
     - Implement 7 public API methods (open, close, next, prev, etc.)
     - State management (ViewerState)
     - Event handlers (keyboard, touch, resize, popstate)
     - Image preloading logic
     - Focus trap implementation
   - Dependency: Requires all tests to be written and failing
   - Sequential: Must be done after all tests

9. **Gallery Integration** (from gallery-integration.contract.md)
   - Task: Update `src/components/gallery/gallery.ts`
     - Add getImages() method
     - Add getColumnCount() method
     - Add ResizeObserver for column detection
     - Add click handler to call viewer.open()
     - Wire up viewer.setEnabled() on resize
   - Dependency: Requires viewer component to exist
   - Sequential: After viewer implementation

10. **Gallery HTML Update**
    - Task: Update `gallery.html`
      - Add `<image-viewer>` element to page
      - Ensure proper component order (gallery before viewer)
    - Sequential: After gallery integration

11. **Main Entry Point Update**
    - Task: Update `src/main.ts`
      - Import image-viewer component
      - Register custom element
    - Sequential: Final integration task

**Ordering Strategy**:
- **Phase 1 (Parallel)**: Tasks 1-7 [P] - Types, tests, template, CSS (can run simultaneously)
- **Phase 2 (Sequential)**: Task 8 - Component implementation (after all tests written)
- **Phase 3 (Sequential)**: Tasks 9-11 - Integration (after component complete)

**TDD Enforcement**:
- All test files created BEFORE implementation (Phase 1)
- Tests MUST fail initially (no implementation exists)
- Implementation ONLY in Phase 2 (make tests pass)
- Integration ONLY in Phase 3 (wire components together)

**Estimated Output**:
- **Total Tasks**: ~35-40 numbered tasks
- **Parallel Tasks**: 12-15 tasks (types, tests, templates)
- **Sequential Tasks**: 8-10 tasks (implementation, integration)
- **Duration**: ~6-8 hours (with TDD workflow)

**Task Format**:
```
T001: Create TypeScript type definitions [P]
T002: Create viewer API contract tests [P] (depends: T001)
T003: Create gallery integration tests [P] (depends: T001)
...
T015: Implement image-viewer component (depends: T001-T014)
T016: Update gallery integration (depends: T015)
...
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: NONE ✅

**Artifacts Generated**:
- [x] research.md (10 technical decisions) ✅
- [x] data-model.md (7 core entities) ✅
- [x] contracts/viewer-api.contract.md (API contract) ✅
- [x] contracts/gallery-integration.contract.md (Integration contract) ✅
- [x] quickstart.md (30 test scenarios) ✅
- [x] CLAUDE.md updated (agent context) ✅
- [x] tasks.md (45 numbered tasks) ✅

**Next Step**: Begin implementation with T001 (Create component folder structure)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
