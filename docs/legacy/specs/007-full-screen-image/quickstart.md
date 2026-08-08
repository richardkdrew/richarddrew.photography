# Quickstart: Image Viewer Manual Testing

**Feature**: 007-full-screen-image
**Date**: 2025-10-02
**Purpose**: Manual test scenarios to validate image viewer implementation

## Prerequisites

### Setup
1. Start development server: `make dev`
2. Open browser to `http://localhost:5173/gallery.html`
3. Open browser DevTools (Console + Performance tabs)
4. Ensure window is desktop size (>1200px width) initially

### Test Data
- Gallery must have at least 15 images
- Mix of portrait and landscape images
- At least one image that will 404 (for error handling)

---

## Test Suite

### TS-001: Viewer Activation (Multi-Column)

**Given**: Desktop viewport (1200px+ width), gallery showing 4 columns
**When**: Click on image #3 in gallery
**Then**:
- ✅ Viewer transitions to full-page mode (300ms)
- ✅ Image #3 displayed with `object-fit: contain`
- ✅ Counter shows "3 of 15" in header
- ✅ Browser URL updated with `?image=<id>`
- ✅ Close button receives focus
- ✅ Page scroll disabled (cannot scroll gallery behind viewer)
- ✅ Previous button enabled, Next button enabled

**Performance Check**:
- DevTools Performance: Transition maintains 60fps
- Image loads within 200ms

---

### TS-002: Viewer Disabled (Single-Column Mobile)

**Given**: Mobile viewport (375px width), gallery showing 1 column
**When**: Click on any gallery image
**Then**:
- ✅ Viewer does NOT open
- ✅ Image stays displayed inline in gallery
- ✅ No URL change
- ✅ No page scroll prevention

**Validation**:
- Check `image-viewer[data-enabled="false"]` in DOM

---

### TS-003: Keyboard Navigation - Next

**Given**: Viewer open at image 3 of 15
**When**: Press Right Arrow key
**Then**:
- ✅ Image slides to #4 with 300ms transition
- ✅ Counter updates to "4 of 15"
- ✅ ARIA live region announces "Image 4 of 15" (check screen reader or aria-live element)
- ✅ Image #5 preloaded (check Network tab for preload request)

**Performance Check**:
- Transition completes in exactly 300ms ± 10ms
- No layout shifts or jank

---

### TS-004: Keyboard Navigation - Previous

**Given**: Viewer open at image 4 of 15
**When**: Press Left Arrow key
**Then**:
- ✅ Image slides to #3 with 300ms transition
- ✅ Counter updates to "3 of 15"
- ✅ ARIA live region announces "Image 3 of 15"
- ✅ Image #2 preloaded

---

### TS-005: Navigation Boundary - First Image

**Given**: Viewer open at image 1 of 15
**When**: Observe UI
**Then**:
- ✅ Previous button is disabled (grayed out, aria-disabled="true")
- ✅ Next button is enabled
- ✅ Pressing Left Arrow does nothing (no error, no movement)

**Validation**:
- Click disabled Previous button → no action
- Press Left Arrow → no console errors

---

### TS-006: Navigation Boundary - Last Image

**Given**: Viewer open at image 15 of 15
**When**: Observe UI
**Then**:
- ✅ Next button is disabled (grayed out, aria-disabled="true")
- ✅ Previous button is enabled
- ✅ Pressing Right Arrow does nothing

---

### TS-007: Close via ESC Key

**Given**: Viewer open at image 5, gallery was scrolled to 800px
**When**: Press ESC key
**Then**:
- ✅ Viewer closes with 300ms transition
- ✅ Gallery scroll position restored to 800px (instant, no smooth scroll)
- ✅ Page scroll re-enabled
- ✅ Browser URL resets to `/gallery.html` (no `?image` param)
- ✅ Focus restored to original clicked image in gallery

**Performance Check**:
- Scroll restoration is instant (<16ms)
- No layout shift during close

---

### TS-008: Close via Close Button

**Given**: Viewer open at image 5
**When**: Click close button (X in header)
**Then**:
- ✅ Same behavior as TS-007 (ESC key)
- ✅ Scroll position restored
- ✅ URL reset

---

### TS-009: Close via Browser Back Button

**Given**: Viewer open at image 5 (URL: `/gallery.html?image=5`)
**When**: Click browser back button
**Then**:
- ✅ Viewer closes
- ✅ Gallery scroll position restored
- ✅ URL returns to `/gallery.html`
- ✅ No page reload (History API navigation)

**Validation**:
- Check Network tab: No new page load requests
- popstate event handled correctly

---

### TS-010: Touch Swipe - Next (Mobile)

**Given**: Tablet viewport (768px width), viewer open at image 3
**When**: Swipe left >50px horizontally
**Then**:
- ✅ Image transitions to #4
- ✅ Counter updates to "4 of 15"
- ✅ Transition same as keyboard (300ms)

**Validation**:
- Swipe <50px → no navigation (threshold enforced)
- Diagonal swipe (more vertical) → prioritizes scroll, not navigation

---

### TS-011: Touch Swipe - Previous (Mobile)

**Given**: Tablet viewport (768px width), viewer open at image 4
**When**: Swipe right >50px horizontally
**Then**:
- ✅ Image transitions to #3
- ✅ Counter updates to "3 of 15"

---

### TS-012: Button Navigation - Next

**Given**: Viewer open at image 3 of 15
**When**: Click Next button
**Then**:
- ✅ Same behavior as Right Arrow key (TS-003)
- ✅ Image transitions to #4
- ✅ Preloading occurs

---

### TS-013: Button Navigation - Previous

**Given**: Viewer open at image 4 of 15
**When**: Click Previous button
**Then**:
- ✅ Same behavior as Left Arrow key (TS-004)
- ✅ Image transitions to #3

---

### TS-014: Image Preloading

**Given**: Viewer opens at image 5 of 15
**When**: Observe Network tab
**Then**:
- ✅ Image #5 loads with `loading="eager"` (immediate)
- ✅ `<link rel="preload">` created for image #4
- ✅ `<link rel="preload">` created for image #6
- ✅ Preload requests initiated within 200ms

**When**: Navigate to image 6
**Then**:
- ✅ Image #6 displays instantly (already preloaded)
- ✅ Preload links updated: #5 and #7

---

### TS-015: Responsive Image Sizing - Desktop

**Given**: Desktop viewport (1400px width)
**When**: Viewer open with landscape image
**Then**:
- ✅ Image width = 80vw (desktop size)
- ✅ Image max-height = 85vh
- ✅ Image uses `object-fit: contain` (no cropping)
- ✅ Image centered in viewport

**Validation**:
- Check computed styles: `width: 1120px` (80% of 1400px)
- Entire image visible, aspect ratio preserved

---

### TS-016: Responsive Image Sizing - Tablet

**Given**: Tablet viewport (900px width)
**When**: Viewer open with portrait image
**Then**:
- ✅ Image width = 90vw (tablet size)
- ✅ Image max-height = 85vh
- ✅ Tall image fits within max-height without overflow

**Validation**:
- Check computed styles: `width: 810px` (90% of 900px)

---

### TS-017: Responsive Image Sizing - Mobile

**Given**: Mobile viewport (375px width)
**When**: Viewer open with ultra-wide image
**Then**:
- ✅ Image width = 100vw (mobile size)
- ✅ Image max-height = 85vh
- ✅ Wide image scales down to fit viewport

**Note**: Viewer should be enabled on tablet (768px+), this tests sizing if enabled at mobile size

---

### TS-018: Browser Resize - Desktop to Mobile

**Given**: Desktop viewport (1400px), viewer open at image 7
**When**: Resize browser window to 375px width (mobile)
**Then**:
- ✅ Gallery column count changes to 1
- ✅ Viewer automatically closes
- ✅ Gallery scroll position restored
- ✅ Viewer attribute `data-enabled="false"` set

**Performance Check**:
- Auto-close happens immediately (no delay)
- No console errors during resize

---

### TS-019: Browser Resize - Mobile to Desktop

**Given**: Mobile viewport (375px), viewer disabled
**When**: Resize browser window to 1400px width (desktop)
**Then**:
- ✅ Gallery column count changes to 4
- ✅ Viewer attribute `data-enabled="true"` set
- ✅ Clicking gallery image now opens viewer

**Validation**:
- Check `image-viewer[data-enabled="true"]` in DOM
- Click image → viewer opens

---

### TS-020: Image Load Failure - Auto Skip

**Given**: Gallery has image #8 with invalid src (404 error)
**When**: Viewer navigates to image #8
**Then**:
- ✅ Image error event fires
- ✅ Viewer automatically skips to image #9
- ✅ Counter updates to "9 of 15"
- ✅ `viewer:error` event dispatched with index 8
- ✅ Console logs error (but no error UI shown)

**Validation**:
- Check Network tab: 404 for image #8
- Check Console: Error logged but viewer continues
- User experience: Seamless skip, no broken UI

---

### TS-021: Rapid Navigation - No Animation Queue

**Given**: Viewer open at image 1 of 15
**When**: Rapidly press Right Arrow 10 times (fast)
**Then**:
- ✅ Viewer navigates to image 11
- ✅ No animation queue buildup (each transition completes before next)
- ✅ Transitions remain smooth (60fps)
- ✅ No visual glitches or jumps

**Performance Check**:
- DevTools Performance: All frames <16.67ms
- No dropped frames during rapid navigation

---

### TS-022: Theme Integration - Dark Mode

**Given**: Dark mode enabled (check theme-toggle state)
**When**: Viewer opens
**Then**:
- ✅ Viewer background uses `var(--background-color)` (dark)
- ✅ Text/controls use `var(--text-color)` (light)
- ✅ Theme matches page theme (no flash)

**Validation**:
- Check computed styles on `.image-viewer`
- Background should be dark (#1a1a1a or similar)

---

### TS-023: Theme Integration - Light Mode

**Given**: Light mode enabled
**When**: Viewer opens
**Then**:
- ✅ Viewer background uses `var(--background-color)` (light)
- ✅ Text/controls use `var(--text-color)` (dark)

---

### TS-024: Accessibility - Focus Trap

**Given**: Viewer open at image 5
**When**: Press Tab repeatedly
**Then**:
- ✅ Focus cycles through: Close → Previous → Next → Close (repeats)
- ✅ Focus never leaves viewer (trapped)
- ✅ Gallery links behind viewer NOT focusable

**When**: Press Shift+Tab
**Then**:
- ✅ Focus cycles backward: Close → Next → Previous → Close

**Validation**:
- Check `document.activeElement` while tabbing
- Confirm focus trap contains only viewer controls

---

### TS-025: Accessibility - Screen Reader

**Given**: Screen reader active (VoiceOver on macOS, NVDA on Windows)
**When**: Viewer opens at image 3
**Then**:
- ✅ Screen reader announces "Image viewer dialog"
- ✅ Screen reader announces "Image 3 of 15"
- ✅ Close button announced as "Close image viewer"

**When**: Navigate to next image
**Then**:
- ✅ ARIA live region announces "Image 4 of 15"

**Validation**:
- Check `role="dialog"` on viewer container
- Check `aria-live="polite"` on counter element
- Verify ARIA labels on all buttons

---

### TS-026: Accessibility - Keyboard Only Navigation

**Given**: Mouse disconnected, keyboard only
**When**: Tab to gallery image, press Enter
**Then**:
- ✅ Viewer opens (keyboard activation)
- ✅ Close button receives focus
- ✅ All navigation works via keyboard (arrows, ESC, Tab)

---

### TS-027: Prefers Reduced Motion

**Given**: OS setting "Reduce motion" enabled
**When**: Viewer opens and navigates
**Then**:
- ✅ No transform transitions (only opacity fades)
- ✅ Transitions faster (100ms vs 300ms)
- ✅ All functionality still works

**Validation**:
- Check CSS `@media (prefers-reduced-motion: reduce)`
- Transitions should use `opacity` only, no `transform`

---

### TS-028: History API - Forward Navigation

**Given**: Viewer opened at image 3, then closed via back button
**When**: Click browser forward button
**Then**:
- ✅ Viewer re-opens at image 3
- ✅ URL restored to `?image=3`
- ✅ State correctly restored (no errors)

---

### TS-029: Multi-Instance Prevention

**Given**: Viewer already open at image 5
**When**: Gallery image clicked again (e.g., via programmatic event)
**Then**:
- ✅ Viewer ignores duplicate open request
- ✅ Viewer stays at image 5
- ✅ No console errors
- ✅ No state corruption

---

### TS-030: Memory Cleanup on Close

**Given**: Viewer opened and closed 10 times
**When**: Check DevTools Memory tab
**Then**:
- ✅ No memory leaks (heap size returns to baseline)
- ✅ Event listeners cleaned up (check with getEventListeners())
- ✅ Preload links removed from <head>
- ✅ No orphaned DOM nodes

**Validation**:
- Take heap snapshot before/after 10 open/close cycles
- Detached DOM tree count should return to baseline

---

## Performance Benchmarks

### Target Metrics
Run each test 10 times, average results:

| Metric | Target | Test |
|--------|--------|------|
| Viewer open (click → first frame) | <50ms | TS-001 |
| Viewer close (ESC → scroll restore) | <16ms | TS-007 |
| Navigation transition | 300ms ± 10ms | TS-003 |
| Image preload initiation | <200ms | TS-014 |
| Resize auto-close | <16ms | TS-018 |
| Frame rate during transitions | 60fps (16.67ms) | TS-021 |

### DevTools Performance Checklist
1. No layout thrashing (batch reads/writes)
2. Transitions use GPU (transform, opacity only)
3. No long tasks >50ms during user interaction
4. Memory stable (no leaks after 10+ cycles)

---

## Browser Compatibility

Test in:
- ✅ Chrome 90+ (primary)
- ✅ Firefox 88+ (secondary)
- ✅ Safari 14+ (secondary)
- ✅ Mobile Safari iOS 14+ (mobile primary)
- ✅ Chrome Android 90+ (mobile secondary)

---

## Acceptance Criteria

### Must Pass (Blocking)
- All TS-001 to TS-021 tests pass
- All performance benchmarks meet targets
- No console errors or warnings
- Accessibility tests (TS-024 to TS-027) pass

### Should Pass (Important)
- TS-022 to TS-030 tests pass
- Browser compatibility verified
- Memory usage stable

### Nice to Have
- Additional edge cases discovered and documented
- Performance exceeds targets by 20%

---

## Test Execution Log

### Session: [DATE]
**Tester**: [NAME]
**Browser**: [Chrome 120 / Firefox 115 / Safari 16]
**Viewport**: [Desktop 1920x1080 / Tablet 768x1024 / Mobile 375x667]

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| TS-001 | ⬜ | |
| TS-002 | ⬜ | |
| ... | ⬜ | |

**Overall Result**: ⬜ PASS / ⬜ FAIL / ⬜ PARTIAL

**Issues Found**:
1. [Description]
2. [Description]

**Performance Notes**:
- Viewer open: [X]ms (target <50ms)
- Navigation: [X]ms (target 300ms ± 10ms)
- Frame rate: [X]fps (target 60fps)

---

## Quick Validation Commands

```bash
# Start dev server
make dev

# Run automated tests (after implementation)
make test

# Check accessibility
# (Use browser extension: axe DevTools or Lighthouse)
npx lighthouse http://localhost:5173/gallery.html --only-categories=accessibility

# Performance audit
npx lighthouse http://localhost:5173/gallery.html --only-categories=performance
```

---

## Notes for Testers

1. **Focus on UX**: Viewer should feel like seamless page navigation, not a popup
2. **Performance First**: Any jank or lag is a failure, report immediately
3. **Accessibility Critical**: All keyboard and screen reader tests must pass
4. **Edge Cases Matter**: Test boundary conditions (first/last image, rapid clicks, errors)
5. **Real Devices**: Emulation is insufficient, test on actual mobile devices

---

## Success Criteria Summary

✅ **Functional**: All 30 test scenarios pass
✅ **Performance**: All benchmarks meet targets
✅ **Accessibility**: WCAG 2.1 AA compliance (keyboard, screen reader, focus trap)
✅ **Cross-browser**: Works in Chrome, Firefox, Safari (desktop + mobile)
✅ **No Regressions**: Gallery functionality unchanged
✅ **Constitutional**: CSS-first, ~150 lines TS, no frameworks
