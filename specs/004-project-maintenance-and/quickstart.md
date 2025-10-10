# Quickstart: Project Maintenance and Cleanup

**Feature**: Project Maintenance and Cleanup
**Date**: 2025-09-27
**Purpose**: Manual testing scenarios for validation

## Pre-Implementation Validation

### Current State Assessment
Run these commands to establish baseline before starting maintenance:

```bash
# Analyze current project structure
find src/ -type f -name "*.ts" -o -name "*.css" -o -name "*.html" | sort
find tests/ -type f -name "*.test.ts" | sort

# Check current build and test status
make build
make test-ci

# Document current component organization
ls -la src/components/
ls -la src/masonry/

# Check for unused files
find . -name "*.js" -not -path "./node_modules/*" -not -path "./dist/*"
find . -name "*.temp" -o -name "*.bak" -o -name "*.tmp"

# Assess current asset structure
ls -la public/images/
ls -la public/fonts/ 2>/dev/null || echo "No fonts directory"
```

Expected Results:
- Build completes successfully
- All tests pass
- Mixed component organization (some flat, some organized)
- Header/gallery components in flat structure
- Tests scattered across different patterns

## Component Reorganization Testing

### Header Component Reorganization
Test the header component reorganization following about-page pattern:

```bash
# Before: Check current header structure
find . -name "*header*" -type f | grep -v node_modules

# After reorganization: Verify new structure
ls -la src/components/header/
# Expected files:
# - header.ts
# - header.css
# - header.types.ts
# - header.html (if applicable)

# Verify imports still work
make build
make test-ci

# Test header component functionality
# Open browser to http://localhost:3000
# Verify header displays correctly
# Test responsive behavior across breakpoints
```

Expected Results:
- Header files organized in component-folder structure
- All imports functional
- Build successful
- Header renders correctly in browser

### Gallery Component Reorganization
Test the gallery component reorganization:

```bash
# Before: Check current gallery/masonry structure
find . -name "*masonry*" -o -name "*gallery*" -type f | grep -v node_modules

# After reorganization: Verify new structure
ls -la src/components/gallery/
# Expected files:
# - gallery.ts
# - gallery.css
# - gallery.types.ts
# - gallery.html (if applicable)

# Test gallery functionality
make dev
# Navigate to gallery section
# Verify masonry layout works
# Test responsive grid columns (1/3/4+ based on breakpoint)
# Verify image loading and performance
```

Expected Results:
- Gallery files organized in component-folder structure
- Masonry layout functional
- Responsive behavior maintained
- No performance regression

## Test Restructuring Validation

### Test Organization Assessment
Validate test restructuring follows about-page pattern:

```bash
# Before: Current test structure
find tests/ -name "*.test.ts" | sort

# After restructuring: Verify pattern compliance
ls -la tests/header/
ls -la tests/gallery/
ls -la tests/about-page/ # Reference pattern

# Expected structure for each feature:
# tests/[feature]/
# ├── [feature]-contract.test.ts
# ├── [feature]-ui.test.ts
# ├── [feature]-accessibility.test.ts
# └── [feature]-performance.test.ts

# Verify all tests run
make test-ci

# Check test coverage and organization
npm run test -- --reporter=verbose
```

Expected Results:
- Tests organized by feature in dedicated directories
- Consistent naming pattern across all features
- All tests pass
- No test functionality lost during restructuring

### Test Pattern Compliance
Verify each test suite follows the established pattern:

```bash
# Test each feature's test suite
make test-ci -- tests/header/
make test-ci -- tests/gallery/
make test-ci -- tests/about-page/

# Verify test naming consistency
find tests/ -name "*.test.ts" | grep -E "(contract|ui|accessibility|performance)" | wc -l
find tests/ -name "*.test.ts" | wc -l
# Should have 4 test types per feature minimum
```

Expected Results:
- Each feature has comprehensive test coverage
- Test types consistently named across features
- All test suites pass independently

## Asset Integration Testing

### Font Asset Validation
Test font file installation and optimization:

```bash
# Check font directory structure
ls -la public/fonts/
# Expected structure:
# public/fonts/
# ├── [font-family].woff2
# ├── [font-family].woff
# └── [font-family].css

# Verify font CSS integration
grep -r "@font-face" src/styles/ public/fonts/

# Test font loading in browser
make dev
# Open developer tools
# Check Network tab for font loading
# Verify no FOUT (Flash of Unstyled Text)
# Test font fallbacks work when font loading disabled
```

Expected Results:
- Font files properly organized
- CSS @font-face declarations valid
- Fonts load efficiently with proper fallbacks
- No layout shift during font loading

### Browser Icon Validation
Test browser and mobile icon installation:

```bash
# Check icon directory structure
ls -la public/images/branding/
# Expected files:
# ├── favicon.ico
# ├── favicon.png
# ├── apple-touch-icon.png
# ├── icon-192.png
# ├── icon-512.png
# └── manifest.json

# Verify HTML head links
grep -A 10 -B 2 'rel="icon"' index.html
grep -A 10 -B 2 'apple-touch-icon' index.html

# Test in browser
make dev
# Check browser tab shows custom favicon
# Test on mobile device or simulator
# Verify Apple touch icon when adding to home screen
```

Expected Results:
- All required icon formats present
- HTML properly links to icons
- Icons display correctly across platforms
- Mobile icons work for home screen shortcuts

## Performance Validation

### Build Performance Testing
Ensure maintenance operations don't negatively impact build performance:

```bash
# Test build time
time make build

# Test bundle size
ls -la dist/
du -sh dist/

# Compare with pre-maintenance baseline
# Build time should not increase significantly
# Bundle size should remain similar or decrease

# Test development server startup
time make dev
# Should start quickly (<5 seconds)
```

Expected Results:
- Build time unchanged or improved
- Bundle size similar or reduced
- Dev server starts quickly
- No build errors or warnings

### Runtime Performance Testing
Validate component performance after reorganization:

```bash
make dev
# Open browser dev tools
# Navigate through all components

# Test header performance:
# - Component initialization <100ms
# - Responsive transitions smooth (60fps)

# Test gallery performance:
# - Masonry layout renders quickly
# - Image loading <200ms initiation
# - Smooth scrolling maintained

# Test about page (reference):
# - Ensure no regression in about page performance
```

Expected Results:
- All components meet constitutional performance requirements
- No performance regression after reorganization
- Smooth user experience maintained

## Constitutional Compliance Validation

### Constitution Update Verification
Verify constitution reflects current project state:

```bash
# Check constitution version and content
cat .specify/memory/constitution.md

# Verify recent changes section includes:
# - About page feature completion
# - Component-folder architecture establishment
# - Test pattern standardization

# Check version increment
grep "Version.*:" .specify/memory/constitution.md
# Should be incremented from previous version
```

Expected Results:
- Constitution updated with completed features
- Architectural principles reflect current implementation
- Version properly incremented
- No outdated information remains

### Make Command Compliance
Verify all operations use constitutional make commands:

```bash
# Verify no direct npm commands in docs or scripts
grep -r "npm run\|npx\|node " specs/ || echo "Good: No direct npm commands found"

# Test all make commands work
make clean
make build
make test-ci
make dev
make preview

# Verify Makefile has required commands
grep -E "^(dev|build|test|test-ci|preview|clean):" Makefile
```

Expected Results:
- All operations use make commands exclusively
- No direct npm/node commands in documentation
- All constitutional commands functional

## Cleanup Validation

### Unused File Removal
Verify unused files properly removed:

```bash
# Check for common unused file patterns
find . -name "*.bak" -o -name "*.tmp" -o -name "*.orig" | grep -v node_modules
find . -name ".DS_Store" | grep -v node_modules

# Verify no orphaned JavaScript files (should be TypeScript)
find src/ -name "*.js" | grep -v node_modules

# Check for unused imports (manual review)
# Look for commented-out code or debug statements
grep -r "console.log\|debugger\|TODO\|FIXME" src/ || echo "Good: No debug code found"
```

Expected Results:
- No temporary or backup files remain
- No orphaned JavaScript files in source
- No debug code or console statements
- Clean, production-ready codebase

## Final Integration Test

### End-to-End Functionality
Complete workflow test of the portfolio website:

```bash
# Build and test complete workflow
make clean
make build
make test-ci
make preview

# Manual testing checklist:
# 1. Homepage loads correctly
# 2. Header component displays and functions
# 3. About page accessible and renders properly
# 4. Gallery/masonry layout works with images
# 5. Responsive behavior across all breakpoints
# 6. All fonts load properly
# 7. Favicon displays in browser tab
# 8. Performance meets constitutional requirements

# Test production build
# Verify all components work in production environment
# Check console for any errors or warnings
```

Expected Results:
- Complete website functionality maintained
- All features work in production build
- No console errors or warnings
- Professional appearance with proper branding assets
- Constitutional performance standards met

## Rollback Validation

### Recovery Testing
Test rollback capability if issues found:

```bash
# Test git status shows clean state after completion
git status

# Verify can rollback specific changes if needed
git log --oneline -10
# Should show clear commit history for maintenance changes

# Test build and functionality rollback
git stash  # If any uncommitted changes
make build
make test-ci
# System should work in any intermediate state
```

Expected Results:
- Clean git status after completion
- Clear commit history for traceability
- System functional at any point in process
- Rollback possible if issues discovered

---

## Success Criteria Summary

✅ **Component Organization**: Header and gallery follow about-page component-folder pattern
✅ **Test Structure**: All features have consistent test organization and naming
✅ **Asset Integration**: Fonts and icons properly installed and functional
✅ **Performance**: All constitutional performance requirements maintained
✅ **Build Process**: Make commands work, build successful, tests pass
✅ **Constitutional Compliance**: Updated governance, version incremented
✅ **Cleanup**: Unused files removed, codebase clean and professional

## Estimated Testing Time

- **Pre-Implementation Assessment**: 15 minutes
- **Component Reorganization Testing**: 30 minutes
- **Test Restructuring Validation**: 20 minutes
- **Asset Integration Testing**: 25 minutes
- **Performance Validation**: 20 minutes
- **Constitutional Compliance**: 10 minutes
- **Final Integration Test**: 20 minutes

**Total Estimated Time**: 2 hours 20 minutes

This thorough testing ensures all maintenance operations meet constitutional standards and maintain project quality.