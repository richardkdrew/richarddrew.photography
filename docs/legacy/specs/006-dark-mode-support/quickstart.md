# Quickstart: Dark Mode Support Manual Testing

**Feature**: Dark Mode Support
**Date**: 2025-10-01
**Purpose**: Manual test scenarios to validate dark mode implementation

## Prerequisites

- Development server running (`make dev`)
- Browser DevTools open (Console + Application tabs)
- Test on both desktop and mobile viewports
- Screen reader available for accessibility testing (optional but recommended)

---

## Test Scenario 1: First-Time Visitor (Default Light Mode)

**Requirement**: FR-001 - System MUST default to light mode for first-time visitors

### Steps:
1. Open DevTools → Application tab → Local Storage
2. Delete `theme` key if present
3. Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)

### Expected Results:
- ✓ Page loads in light mode
- ✓ No flash of wrong theme (FOUC)
- ✓ `localStorage.getItem('theme')` returns `null` (no key set yet)
- ✓ `document.documentElement.dataset.theme` is `"light"`
- ✓ Toggle button shows moon icon (indicating dark mode is available)

---

## Test Scenario 2: Theme Toggle Functionality

**Requirement**: FR-002 - Toggle MUST switch between light and dark themes

### Steps (Desktop):
1. Locate theme toggle button (rightmost position in header nav)
2. Click toggle button
3. Observe visual transition
4. Check localStorage in DevTools
5. Click toggle button again
6. Check localStorage again

### Expected Results:
- ✓ Button is visible and accessible in header navigation
- ✓ First click: Theme changes from light → dark
- ✓ Smooth 250ms color transition (no jarring flash)
- ✓ `localStorage.getItem('theme')` now returns `"dark"`
- ✓ `document.documentElement.dataset.theme` is `"dark"`
- ✓ Toggle icon changes to sun (indicating light mode is available)
- ✓ Second click: Theme changes from dark → light
- ✓ `localStorage.getItem('theme')` now returns `"light"`
- ✓ Icon changes back to moon

### Steps (Mobile):
1. Resize viewport to < 768px (mobile breakpoint)
2. Open hamburger menu
3. Scroll to bottom of menu overlay
4. Locate theme toggle button
5. Click toggle button
6. Observe theme change

### Expected Results:
- ✓ Toggle button is at bottom of mobile menu
- ✓ Theme changes from light → dark (or vice versa)
- ✓ Mobile menu remains open during transition
- ✓ localStorage updated correctly

---

## Test Scenario 3: Theme Persistence

**Requirement**: FR-003 - Theme preference MUST persist across browser sessions

### Steps:
1. Set theme to dark mode (click toggle)
2. Verify dark mode is active
3. Navigate to different page (e.g., About page)
4. Navigate back to home page
5. Close browser tab
6. Reopen website in new tab

### Expected Results:
- ✓ Dark mode persists when navigating between pages
- ✓ Dark mode persists after closing and reopening browser
- ✓ No flash of light mode on page load (FOUC prevention working)
- ✓ `localStorage.getItem('theme')` returns `"dark"` on all pages

---

## Test Scenario 4: localStorage Cleared (Revert to Light)

**Requirement**: FR-005 - System MUST default to light mode when storage is cleared

### Steps:
1. Set theme to dark mode
2. Open DevTools → Application → Local Storage
3. Delete `theme` key manually
4. Refresh page (F5 or Cmd+R)

### Expected Results:
- ✓ Theme reverts to light mode after refresh
- ✓ No error in console
- ✓ `document.documentElement.dataset.theme` is `"light"`
- ✓ Toggle button shows moon icon

---

## Test Scenario 5: Site-Wide Application

**Requirement**: FR-006 - Theme toggle MUST affect entire website

### Steps:
1. Start on home page (gallery view)
2. Set theme to dark mode
3. Navigate to About page
4. Observe theme
5. Navigate back to home page
6. Observe theme

### Expected Results:
- ✓ Dark mode applies to home page (header, gallery, footer)
- ✓ Dark mode applies to About page (header, hero section, footer)
- ✓ All pages use same theme preference
- ✓ No theme flickering when navigating between pages

---

## Test Scenario 6: Toggle Performance

**Requirement**: FR-004 - Theme switching MUST complete within 100ms

### Steps:
1. Open DevTools Console
2. Run performance test:
```javascript
const start = performance.now();
document.querySelector('theme-toggle').toggle();
const end = performance.now();
console.log(`Toggle duration: ${end - start}ms`);
```
3. Repeat test 5 times
4. Calculate average duration

### Expected Results:
- ✓ Average toggle duration < 100ms
- ✓ Visual transition (250ms) happens AFTER toggle completes
- ✓ No console errors
- ✓ No layout shift or jank

---

## Test Scenario 7: WCAG Contrast Compliance

**Requirement**: FR-007 - All color combinations MUST meet WCAG 2.1 AA

### Steps (Light Mode):
1. Set theme to light mode
2. Open DevTools → Elements → Computed styles
3. Check text color on background color
4. Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**Test Cases**:
- Primary text (`--color-primary: #2C2C2C`) on background (`--color-pure: #FFFFFF`)
- Interactive elements (`--color-interactive: #B8860B`) on background
- Interactive hover (`--color-interactive-hover: #9A7209`) on background

### Expected Results:
- ✓ Normal text contrast ≥ 4.5:1
- ✓ Large text contrast ≥ 3:1
- ✓ Interactive elements contrast ≥ 3:1

### Steps (Dark Mode):
1. Set theme to dark mode
2. Check computed styles for dark mode colors

**Test Cases**:
- Primary text (`--color-primary: #E5E5E5`) on background (`--color-pure: #1A1A1A`)
- Interactive elements (`--color-interactive: #D4AF37`) on background
- Interactive hover (`--color-interactive-hover: #F0C14B`) on background

### Expected Results:
- ✓ Normal text contrast ≥ 4.5:1
- ✓ Large text contrast ≥ 3:1
- ✓ Interactive elements contrast ≥ 3:1

---

## Test Scenario 8: Logo Variant Switching

**Requirement**: Logo MUST swap to appropriate variant based on theme

### Steps:
1. Inspect header logo element in DevTools
2. Note current `background-image` URL
3. Toggle theme to dark mode
4. Inspect logo element again
5. Toggle back to light mode
6. Inspect logo element again

### Expected Results:
- ✓ Light mode: Logo uses `/images/logo-light.svg` (or similar)
- ✓ Dark mode: Logo uses `/images/logo-dark.svg` (or similar)
- ✓ Logo swap is instant (CSS-driven, no JavaScript)
- ✓ No broken image placeholder

---

## Test Scenario 9: Keyboard Accessibility

**Requirement**: FR-008 - Toggle MUST be keyboard accessible

### Steps:
1. Set theme to light mode
2. Press Tab key until theme toggle has focus
3. Observe focus indicator
4. Press Space or Enter key
5. Observe theme change
6. Press Space or Enter again

### Expected Results:
- ✓ Toggle button receives focus via Tab key
- ✓ Visible focus indicator (outline or ring)
- ✓ Space key toggles theme
- ✓ Enter key toggles theme
- ✓ Focus remains on toggle button after activation
- ✓ Screen reader announces state change (e.g., "Dark mode enabled")

---

## Test Scenario 10: Reduced Motion Preference

**Requirement**: Theme transitions MUST respect `prefers-reduced-motion`

### Steps:
1. Enable reduced motion in OS settings:
   - macOS: System Preferences → Accessibility → Display → Reduce Motion
   - Windows: Settings → Ease of Access → Display → Show animations
2. Return to browser and refresh page
3. Toggle theme
4. Observe transition

### Expected Results:
- ✓ Theme changes instantly (no 250ms transition)
- ✓ Colors update immediately
- ✓ No animation or fade effect

---

## Test Scenario 11: FOUC Prevention (Flash Prevention)

**Requirement**: No flash of unstyled content on page load

### Steps:
1. Set theme to dark mode
2. Hard refresh page multiple times (Cmd+Shift+R)
3. Observe initial page render carefully

### Expected Results:
- ✓ Page loads directly in dark mode
- ✓ No flash of light mode before dark mode applies
- ✓ Inline script in `<head>` executes before CSS parse
- ✓ `data-theme` attribute set before first paint

---

## Test Scenario 12: Private Browsing Mode (localStorage Unavailable)

**Requirement**: Graceful degradation when localStorage is unavailable

### Steps:
1. Open browser in private/incognito mode
2. Navigate to website
3. Attempt to toggle theme
4. Refresh page
5. Check console for errors

### Expected Results:
- ✓ Theme toggle still works (session-only)
- ✓ Theme does not persist after refresh (reverts to light)
- ✓ No console errors or exceptions thrown
- ✓ No broken functionality

---

## Test Scenario 13: Cross-Browser Compatibility

**Requirement**: Theme works in all modern browsers

### Browsers to Test:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Steps:
1. Open website in each browser
2. Toggle theme
3. Refresh page
4. Check for visual issues

### Expected Results:
- ✓ Toggle works in all browsers
- ✓ Theme persists in all browsers
- ✓ Colors render correctly in all browsers
- ✓ No console errors in any browser

---

## Test Scenario 14: Mobile Toggle Position

**Requirement**: Toggle MUST be at bottom of mobile menu overlay

### Steps:
1. Resize viewport to < 768px (mobile)
2. Open hamburger menu
3. Scroll to bottom of menu
4. Locate theme toggle

### Expected Results:
- ✓ Toggle is visible at bottom of mobile menu
- ✓ Toggle is centered horizontally
- ✓ Toggle has adequate spacing from nav items above
- ✓ Toggle does not overlap with other elements

---

## Test Scenario 15: Desktop Toggle Position

**Requirement**: Toggle MUST be at rightmost edge of desktop navigation

### Steps:
1. Resize viewport to ≥ 768px (desktop)
2. Locate theme toggle in header
3. Measure position relative to nav items

### Expected Results:
- ✓ Toggle is rightmost element in header navigation
- ✓ Toggle aligns vertically with nav links
- ✓ Toggle has consistent spacing from last nav item
- ✓ Toggle does not push layout or cause horizontal scroll

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 15 test scenarios pass
- [ ] WCAG contrast ratios validated with WebAIM tool
- [ ] Toggle performance < 100ms (average of 5 tests)
- [ ] No FOUC on any page
- [ ] Theme persists across sessions
- [ ] Keyboard navigation works
- [ ] Screen reader announces state changes
- [ ] Logo variants swap correctly
- [ ] Mobile and desktop placements correct
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Private browsing mode gracefully degrades
- [ ] `prefers-reduced-motion` respected

---

## Performance Validation

Run this script in DevTools Console for comprehensive performance check:

```javascript
// Toggle performance test
const iterations = 10;
const durations = [];

for (let i = 0; i < iterations; i++) {
  const start = performance.now();
  document.querySelector('theme-toggle').toggle();
  const end = performance.now();
  durations.push(end - start);
}

const avg = durations.reduce((a, b) => a + b) / iterations;
const max = Math.max(...durations);
const min = Math.min(...durations);

console.log(`Toggle Performance (n=${iterations}):`);
console.log(`  Average: ${avg.toFixed(2)}ms`);
console.log(`  Min: ${min.toFixed(2)}ms`);
console.log(`  Max: ${max.toFixed(2)}ms`);
console.log(`  Constitutional requirement: < 100ms`);
console.log(`  Pass: ${avg < 100 ? '✓' : '✗'}`);
```

---

## Accessibility Validation

Use browser DevTools Accessibility panel:

1. Open DevTools → Accessibility
2. Inspect theme toggle element
3. Verify ARIA attributes:
   - `role="button"` ✓
   - `aria-label` describes state ✓
   - `aria-pressed` reflects toggle state ✓
   - `tabindex="0"` for keyboard access ✓

---

## Success Criteria

Feature is complete when:
- ✅ All 15 test scenarios pass
- ✅ Performance < 100ms
- ✅ WCAG AA compliance verified
- ✅ No FOUC on any page
- ✅ Cross-browser compatibility confirmed
- ✅ Keyboard accessibility working
- ✅ Reduced motion preference respected
