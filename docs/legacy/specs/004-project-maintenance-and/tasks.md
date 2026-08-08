# Tasks: Project Maintenance and Cleanup

**Input**: Design documents from `/Users/richarddrew/working/portfolio-website/specs/004-project-maintenance-and/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Task Generation Summary

Generated from 16 functional requirements with focus on:
- Constitutional compliance and governance updates
- Component reorganization following about-page pattern
- Test restructuring for consistent feature-based organization
- Asset management for fonts and browser/mobile icons
- Project cleanup and validation

**Tech Stack**: TypeScript 5.0+, Vite build, Vitest testing, vanilla web technologies
**Project Structure**: Single project (`src/`, `tests/` at repository root)
**Key Patterns**: Component-folder architecture, comprehensive test suites

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Tasks follow TDD approach: tests before implementation
- File paths are absolute for precision

---

## Phase 3.1: Constitutional Compliance

### T001 Update Constitution Document
Update `/Users/richarddrew/working/portfolio-website/.specify/memory/constitution.md` to reflect current project state:
- Document completion of about-page feature with comprehensive test coverage
- Update architectural consistency section to reflect established component-folder pattern
- Add section about maintenance and cleanup principles
- Increment version from 1.1.0 to 1.2.0
- Update "Last Amended" date to 2025-09-27

**Dependencies**: None (prerequisite for planning alignment)
**Validation**: Constitution reflects current project state and completed features
**Files Modified**: `/.specify/memory/constitution.md`

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

### T002 [P] Create Project Structure Contract Tests
Create failing contract tests for `/Users/richarddrew/working/portfolio-website/specs/004-project-maintenance-and/contracts/project-structure.contract.ts`:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/project-structure.contract.test.ts`
- Test IProjectStructureManager interface methods
- Validate ProjectStructureAnalysis, ComponentPatternValidation, ReorganizationResult types
- Test error conditions and edge cases
- Tests MUST fail initially (no implementation yet)

**Dependencies**: T001 (constitutional compliance)
**Contract**: project-structure.contract.ts
**Test Pattern**: maintenance/[contract-name].contract.test.ts

### T003 [P] Create Test Management Contract Tests
Create failing contract tests for `/Users/richarddrew/working/portfolio-website/specs/004-project-maintenance-and/contracts/test-management.contract.ts`:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/test-management.contract.test.ts`
- Test ITestManager interface methods
- Validate TestStructureAnalysis, TestRestructureResult types
- Test about-page pattern compliance validation
- Tests MUST fail initially (no implementation yet)

**Dependencies**: T001 (constitutional compliance)
**Contract**: test-management.contract.ts
**Test Pattern**: maintenance/[contract-name].contract.test.ts

### T004 [P] Create Asset Management Contract Tests
Create failing contract tests for `/Users/richarddrew/working/portfolio-website/specs/004-project-maintenance-and/contracts/asset-management.contract.ts`:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/asset-management.contract.test.ts`
- Test IAssetManager interface methods
- Validate FontConfiguration, IconRequirementAnalysis types
- Test font optimization and icon generation workflows
- Tests MUST fail initially (no implementation yet)

**Dependencies**: T001 (constitutional compliance)
**Contract**: asset-management.contract.ts
**Test Pattern**: maintenance/[contract-name].contract.test.ts

### T005 Create Header Component Reorganization Tests
Create integration tests for header component reorganization:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/header-reorganization.test.ts`
- Test component-folder structure creation following about-page pattern
- Validate file moves: logic (.ts), styles (.css), types (.types.ts), template (.html)
- Test import path updates and functionality preservation
- Test build and runtime functionality after reorganization
- Tests MUST fail initially (no reorganization yet)

**Dependencies**: T001 (constitutional compliance)
**Integration Scenario**: Header component reorganization workflow
**References**: about-page pattern in `/Users/richarddrew/working/portfolio-website/src/components/about-page/`

### T006 Create Gallery Component Reorganization Tests
Create integration tests for gallery component reorganization:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/gallery-reorganization.test.ts`
- Test masonry/gallery component-folder structure creation
- Validate file moves and import updates for masonry layout components
- Test responsive grid functionality preservation (1/3/4+ columns)
- Test image loading and performance after reorganization
- Tests MUST fail initially (no reorganization yet)

**Dependencies**: T001 (constitutional compliance)
**Integration Scenario**: Gallery component reorganization workflow
**References**: masonry components in `/Users/richarddrew/working/portfolio-website/src/masonry/`

### T007 Create Test Restructuring Validation Tests
Create tests for test suite restructuring process:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/test-restructuring.test.ts`
- Test feature-based test directory creation (tests/header/, tests/gallery/)
- Validate test naming pattern compliance: [feature]-[type].test.ts
- Test comprehensive coverage: contract, UI, accessibility, performance tests
- Verify test execution and coverage preservation
- Tests MUST fail initially (no restructuring yet)

**Dependencies**: T001 (constitutional compliance)
**Integration Scenario**: Test restructuring following about-page pattern
**References**: about-page test pattern in `/Users/richarddrew/working/portfolio-website/tests/about-page/`

### T008 [P] Create Font Asset Integration Tests
Create tests for font file installation and optimization:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/font-integration.test.ts`
- Test font directory structure creation: `/Users/richarddrew/working/portfolio-website/public/fonts/`
- Validate WOFF2/WOFF format hierarchy and CSS @font-face generation
- Test font loading performance and fallback strategies
- Test HTML head link integration and font-display optimization
- Tests MUST fail initially (no fonts installed yet)

**Dependencies**: T001 (constitutional compliance)
**Integration Scenario**: Font asset installation and optimization workflow

### T009 [P] Create Icon Asset Integration Tests
Create tests for browser and mobile icon installation:
- File: `/Users/richarddrew/working/portfolio-website/tests/maintenance/icon-integration.test.ts`
- Test icon directory structure: `/Users/richarddrew/working/portfolio-website/public/images/branding/`
- Validate favicon.ico, favicon.png, apple-touch-icon.png generation
- Test PWA manifest icons (192x192, 512x512) and manifest.json creation
- Test HTML head link integration for all icon formats
- Tests MUST fail initially (no icons installed yet)

**Dependencies**: T001 (constitutional compliance)
**Integration Scenario**: Browser and mobile icon installation workflow

---

## Phase 3.3: Core Implementation

### T010 Reorganize Header Component Files
Reorganize header component into component-folder structure following about-page pattern:
- Create directory: `/Users/richarddrew/working/portfolio-website/src/components/header/`
- Move and organize files:
  - Logic: `header.ts` (main component class)
  - Styles: `header.css` (component-specific styles)
  - Types: `header.types.ts` (TypeScript interfaces)
  - Template: `header.html` (if applicable)
- Update all import references throughout codebase
- Ensure build and test processes remain functional

**Dependencies**: T002, T005 (tests must be written and failing)
**Implementation**: header component reorganization
**Files Modified**: `/Users/richarddrew/working/portfolio-website/src/components/header/*`
**Validation**: T005 tests pass, `make build` and `make test-ci` successful

### T011 Reorganize Gallery Component Files
Reorganize masonry/gallery components into component-folder structure:
- Create directory: `/Users/richarddrew/working/portfolio-website/src/components/gallery/`
- Consolidate masonry layout files into unified gallery component
- Move and organize files following component-folder pattern
- Update import references and maintain masonry functionality
- Preserve responsive grid behavior (1/3/4+ columns)
- Ensure image loading performance maintained

**Dependencies**: T002, T006 (tests must be written and failing)
**Implementation**: gallery component reorganization
**Files Modified**: `/Users/richarddrew/working/portfolio-website/src/components/gallery/*`
**Validation**: T006 tests pass, masonry layout functional

### T012 [P] Restructure Header Test Suite
Restructure header tests following about-page pattern:
- Create directory: `/Users/richarddrew/working/portfolio-website/tests/header/`
- Create test files following naming convention:
  - `header-contract.test.ts` (contract/interface tests)
  - `header-ui.test.ts` (UI behavior tests)
  - `header-accessibility.test.ts` (WCAG 2.1 AA compliance)
  - `header-performance.test.ts` (performance validation)
- Migrate existing header tests and improve coverage
- Ensure all tests pass after restructuring

**Dependencies**: T003 (test management contracts), T010 (header reorganization)
**Implementation**: header test restructuring
**Files Created**: `/Users/richarddrew/working/portfolio-website/tests/header/*`
**Validation**: T007 tests pass, `make test-ci` successful

### T013 [P] Restructure Gallery Test Suite
Restructure gallery/masonry tests following about-page pattern:
- Create directory: `/Users/richarddrew/working/portfolio-website/tests/gallery/`
- Create comprehensive test files:
  - `gallery-contract.test.ts` (component interface tests)
  - `gallery-ui.test.ts` (masonry layout and responsive behavior)
  - `gallery-accessibility.test.ts` (image alt text, keyboard navigation)
  - `gallery-performance.test.ts` (image loading, 60fps validation)
- Migrate and enhance existing masonry tests
- Validate responsive grid behavior across breakpoints

**Dependencies**: T003 (test management contracts), T011 (gallery reorganization)
**Implementation**: gallery test restructuring
**Files Created**: `/Users/richarddrew/working/portfolio-website/tests/gallery/*`
**Validation**: T007 tests pass, masonry performance maintained

### T014 [P] Install and Optimize Font Assets
Install font files with web font optimization:
- Create directory: `/Users/richarddrew/working/portfolio-website/public/fonts/`
- Install font files in WOFF2 and WOFF formats for browser compatibility
- Generate CSS @font-face declarations with font-display: swap
- Create font loading strategy with system font fallbacks
- Add preload links to `/Users/richarddrew/working/portfolio-website/index.html` for critical fonts
- Update design system CSS to reference local fonts

**Dependencies**: T004 (asset management contracts), T008 (font integration tests)
**Implementation**: font asset installation and optimization
**Files Created**: `/Users/richarddrew/working/portfolio-website/public/fonts/*`
**Files Modified**: `index.html`, CSS files for font references
**Validation**: T008 tests pass, fonts load efficiently with fallbacks

### T015 [P] Generate and Install Icon Assets
Generate and install comprehensive browser and mobile icon set:
- Create directory: `/Users/richarddrew/working/portfolio-website/public/images/branding/`
- Generate icon files:
  - `favicon.ico` (16x16, 32x32 multi-size)
  - `favicon.png` (32x32)
  - `apple-touch-icon.png` (180x180)
  - `icon-192.png`, `icon-512.png` (PWA manifest)
- Create PWA manifest.json with icon references
- Add HTML head links in `/Users/richarddrew/working/portfolio-website/index.html`
- Test icons display correctly across platforms

**Dependencies**: T004 (asset management contracts), T009 (icon integration tests)
**Implementation**: browser and mobile icon installation
**Files Created**: `/Users/richarddrew/working/portfolio-website/public/images/branding/*`
**Files Modified**: `index.html` (head links), `manifest.json`
**Validation**: T009 tests pass, icons display on all platforms

---

## Phase 3.4: Integration & Cleanup

### T016 Remove Unused Files and Dependencies
Systematically remove unused files and clean up project:
- Identify and remove unused JavaScript files (should be TypeScript)
- Remove temporary files: .bak, .tmp, .orig, debug artifacts
- Clean up commented-out code and console.log statements
- Review and remove unused dependencies from package.json
- Consolidate duplicate configuration files
- Preserve version control history during cleanup

**Dependencies**: T010, T011 (component reorganization complete)
**Implementation**: project cleanup and optimization
**Files Modified**: Various (removal operations)
**Validation**: `make build` and `make test-ci` successful, no debug artifacts

### T017 Validate Import References and Build Process
Validate all file references and imports remain functional after reorganization:
- Run comprehensive import validation across entire codebase
- Test build process with `make build` and verify no broken imports
- Validate all component references work correctly
- Test development server startup with `make dev`
- Verify production build with `make preview`
- Check for any circular dependencies or import issues

**Dependencies**: T010, T011, T012, T013 (all reorganization complete)
**Implementation**: import and build validation
**Validation**: All make commands successful, no import errors

### T018 Performance Validation and Integration Testing
Comprehensive performance validation and final integration testing:
- Validate constitutional performance requirements:
  - Component initialization <100ms
  - Responsive transitions 60fps
  - Image loading <200ms initiation
- Test responsive behavior across all breakpoints
- Validate accessibility compliance (WCAG 2.1 AA)
- Execute complete quickstart.md testing scenarios
- Verify all functional requirements (FR-001 through FR-016) met
- Test production build performance

**Dependencies**: T014, T015, T016, T017 (all implementation complete)
**Implementation**: performance validation and integration testing
**Validation**: All constitutional performance requirements met, quickstart scenarios pass

---

## Parallel Execution Examples

### Setup Phase (Can run T002-T004 in parallel after T001)
```bash
# Terminal 1: Project structure contract tests
Task: "Create contract tests for project-structure.contract.ts interface"

# Terminal 2: Test management contract tests
Task: "Create contract tests for test-management.contract.ts interface"

# Terminal 3: Asset management contract tests
Task: "Create contract tests for asset-management.contract.ts interface"
```

### Asset Phase (Can run T014-T015 in parallel)
```bash
# Terminal 1: Font installation
Task: "Install font assets with WOFF2/WOFF formats and CSS optimization"

# Terminal 2: Icon generation
Task: "Generate browser and mobile icon set with PWA manifest"
```

### Test Restructuring (Can run T012-T013 in parallel)
```bash
# Terminal 1: Header test restructuring
Task: "Restructure header tests following about-page pattern"

# Terminal 2: Gallery test restructuring
Task: "Restructure gallery tests following about-page pattern"
```

## Task Dependencies Graph

```
T001 (Constitution)
├── T002, T003, T004, T005, T006, T007, T008, T009 [P] (All tests)
│
T002, T005 → T010 (Header reorganization)
T002, T006 → T011 (Gallery reorganization)
│
T003, T010 → T012 [P] (Header tests)
T003, T011 → T013 [P] (Gallery tests)
│
T004, T008 → T014 [P] (Font assets)
T004, T009 → T015 [P] (Icon assets)
│
T010, T011 → T016 (Cleanup)
T012, T013 → T017 (Validation)
T014, T015, T016, T017 → T018 (Final integration)
```

## Constitutional Compliance Checklist

- ✅ **Specification-First**: Tasks generated from complete feature specification
- ✅ **Test-Driven Development**: All tests (T002-T009) before implementation (T010+)
- ✅ **Feature Documentation**: All design artifacts referenced and maintained
- ✅ **Systematic Planning**: 18 numbered tasks with clear dependencies
- ✅ **Simplicity**: Following established patterns, no new complexity
- ✅ **Architectural Consistency**: Component-folder pattern enforced
- ✅ **Command Interface**: All validation using make commands exclusively

## Success Criteria

All 16 functional requirements (FR-001 through FR-016) implemented with:
- Header and gallery components organized in component-folder structure
- Test suites following about-page pattern across all features
- Font and icon assets properly installed and optimized
- Constitution updated to reflect current project state
- Build and test processes fully functional
- Performance requirements maintained
- Clean, professional codebase ready for continued development

**Estimated Total Time**: 8-12 hours (depends on parallel execution)
**Critical Path**: T001 → T002-T009 → T010-T011 → T016-T018