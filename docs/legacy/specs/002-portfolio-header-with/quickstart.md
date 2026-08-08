# Quickstart Guide: Portfolio Header Testing

**Feature**: Portfolio Header with Navigation and Branding
**Date**: 2025-09-26
**Purpose**: Manual testing scenarios and validation steps

---

## Prerequisites

### Environment Setup
1. **Development Server**: Run `make dev` from repository root
2. **Browser**: Use Chrome, Firefox, or Safari latest version
3. **Developer Tools**: Enable responsive design mode for mobile testing
4. **Screen Reader** (optional): NVDA, JAWS, or VoiceOver for accessibility testing

### Test Assets Required
- `public/assets/logo-mobile.svg` - Mobile logo variant
- `public/assets/logo-desktop.svg` - Desktop logo variant
- Existing masonry gallery should be functional

---

## Quick Start Test Sequence

### 1. Basic Functionality Verification (5 minutes)

**Desktop Layout Test**:
1. Open browser to `http://localhost:5173`
2. Ensure viewport width > 1024px
3. **Expected**: Header visible at top with:
   - Desktop logo on left
   - "ABOUT" link on right
   - Horizontal layout
   - Header scrolls with content (not fixed)

**Mobile Layout Test**:
1. Set browser to 375px width (iPhone simulation)
2. Refresh page
3. **Expected**: Header adapts to:
   - Mobile logo variant on left
   - Hamburger menu icon on right
   - No visible navigation links

**Mobile Menu Test**:
1. Click hamburger menu icon
2. **Expected**: Full-screen overlay appears with:
   - Large "ABOUT" text
   - Close (X) button
   - Body scroll disabled
3. Click "ABOUT" link
4. **Expected**: Menu closes, navigates to about section

### 2. Responsive Behavior Testing (10 minutes)

**Breakpoint Transitions**:
```
Test Sequence:
1. Start at 1200px width → Desktop logo + horizontal nav
2. Resize to 800px → Mobile logo + hamburger menu
3. Resize to 1024px → Desktop logo + horizontal nav
4. Resize rapidly between sizes → No broken layouts
```

**Breakpoint Validation**:
- **Mobile**: 0-767px (mobile logo + hamburger)
- **Tablet**: 768-1023px (desktop logo + horizontal nav)
- **Desktop**: 1024px+ (desktop logo + horizontal nav)

**Logo Switching Test**:
1. Open Developer Tools Network tab
2. Resize from desktop → mobile → desktop
3. **Expected**: Appropriate logo variant loads for each breakpoint
4. **Performance**: No unnecessary logo reloading

### 3. Integration Testing (5 minutes)

**Gallery Integration**:
1. Verify header appears above masonry gallery
2. Scroll down to view gallery images
3. **Expected**: Header scrolls naturally with content
4. **Expected**: Header does not interfere with gallery layout
5. **Expected**: No horizontal scrollbars at any screen size

**Global Styles Integration**:
1. Compare header typography with existing gallery text
2. **Expected**: Consistent font family and sizing scale
3. **Expected**: Colors match existing design system
4. **Expected**: Spacing follows existing rhythm

---

## Detailed Testing Scenarios

### Scenario 1: Desktop Navigation

**Test Steps**:
1. Open site at 1200px viewport width
2. Observe header layout and positioning
3. Hover over "ABOUT" link
4. Click "ABOUT" link
5. Use Tab key to navigate through header

**Success Criteria**:
- ✅ Desktop logo displays correctly
- ✅ "ABOUT" link visible horizontally
- ✅ Hover state provides visual feedback
- ✅ Click navigates to about section/page
- ✅ Keyboard focus visible and logical
- ✅ Header integrates with existing page layout

**Common Issues to Check**:
- Logo appears blurry or incorrectly sized
- Navigation link not aligned properly
- Focus indicators missing or unclear
- Header overlaps or interferes with gallery

### Scenario 2: Mobile Navigation

**Test Steps**:
1. Set viewport to 375px width (iPhone)
2. Observe header adaptation
3. Click hamburger menu button
4. Navigate within mobile menu
5. Close menu and verify state

**Success Criteria**:
- ✅ Mobile logo variant displays
- ✅ Hamburger icon (3 lines) visible
- ✅ Menu opens as full-screen overlay
- ✅ Large typography in mobile menu
- ✅ Menu closes on navigation or close button
- ✅ Body scroll disabled when menu open

**Mobile Menu Interaction Flow**:
```
Closed State:
- Hamburger icon visible
- ARIA expanded="false"

Open State:
- Full screen overlay
- "ABOUT" link large and prominent
- Close (X) button in top right
- ARIA expanded="true"
- Focus trapped within menu
```

### Scenario 3: Responsive Transitions

**Test Steps**:
1. Start at desktop width (1200px)
2. Slowly resize to tablet (800px)
3. Continue to mobile (400px)
4. Resize back up to desktop
5. Test rapid resizing

**Success Criteria**:
- ✅ Logo switches appropriately at breakpoints
- ✅ Navigation adapts smoothly
- ✅ No broken layouts during transition
- ✅ Mobile menu closes if open during resize to desktop
- ✅ Performance remains smooth during resize

### Scenario 4: Keyboard Accessibility

**Test Steps**:
1. Load page and press Tab to enter header
2. Tab through all header elements
3. Press Enter/Space on interactive elements
4. Test Escape key in mobile menu
5. Test arrow key navigation

**Success Criteria**:
- ✅ Skip link appears on first Tab (optional)
- ✅ Logo link receives focus with clear indicator
- ✅ Navigation links receive focus
- ✅ Mobile menu button accessible via keyboard
- ✅ Focus trapped in mobile menu when open
- ✅ Escape key closes mobile menu
- ✅ Focus returns to menu button after closing

### Scenario 5: Screen Reader Testing

**Test Steps** (with screen reader enabled):
1. Navigate to page and hear page structure
2. Navigate through header elements
3. Activate mobile menu and listen to announcements
4. Test landmark navigation

**Success Criteria**:
- ✅ Header identified as banner landmark
- ✅ Logo has descriptive alt text
- ✅ Navigation identified as navigation landmark
- ✅ Menu button announces expanded/collapsed state
- ✅ Mobile menu state changes announced
- ✅ Focus changes announced correctly

---

## Performance Testing

### Core Web Vitals Verification

**Largest Contentful Paint (LCP)**:
1. Open DevTools Performance tab
2. Record page load
3. **Expected**: Header contributes to LCP < 1.5s

**Cumulative Layout Shift (CLS)**:
1. Load page and observe header rendering
2. Resize browser window
3. **Expected**: No layout shift from header < 0.1

**First Input Delay (FID)**:
1. Load page and immediately click navigation
2. **Expected**: Response time < 100ms

### Animation Performance

**Mobile Menu Animation**:
1. Open DevTools Performance tab
2. Record mobile menu open/close sequence
3. **Expected**: 60fps throughout animation
4. **Expected**: Animation completes in ~300ms

---

## Accessibility Verification

### WCAG 2.1 AA Compliance Checklist

**1.4.3 Contrast (Minimum)**:
- [ ] Logo has sufficient contrast with background
- [ ] Navigation text meets 4.5:1 ratio
- [ ] Focus indicators meet contrast requirements

**2.1.1 Keyboard**:
- [ ] All functionality available via keyboard
- [ ] No keyboard traps (except intentional menu trap)
- [ ] Logical tab order maintained

**2.4.3 Focus Order**:
- [ ] Focus moves logically: logo → navigation → mobile button
- [ ] Mobile menu focus trap works correctly

**2.4.7 Focus Visible**:
- [ ] Clear focus indicators on all interactive elements
- [ ] Focus indicators visible against all backgrounds

**4.1.2 Name, Role, Value**:
- [ ] Logo has accessible name via alt text
- [ ] Navigation buttons have clear roles
- [ ] Menu button states properly announced

### Screen Reader Test Script

```
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to homepage
3. Use landmarks navigation (H key in NVDA)
4. Should announce "Banner" for header
5. Use navigation mode (N key in NVDA)
6. Should find "Main navigation"
7. Tab through all header elements
8. Each should announce clearly with role/state
9. Open mobile menu
10. Should announce state change
11. Navigate within menu
12. Close menu with Escape
13. Should announce closure and return focus
```

---

## Troubleshooting Common Issues

### Logo Problems

**Logo not displaying**:
- Check file paths in configuration
- Verify SVG files exist in public/assets/
- Check browser console for loading errors
- Validate SVG markup for syntax errors

**Logo wrong size/blurry**:
- Verify CSS sizing uses proper units (rem/em)
- Check SVG viewBox attributes
- Ensure aspect ratio maintained
- Test on high-DPI displays

### Navigation Issues

**Mobile menu not opening**:
- Check JavaScript event listeners attached
- Verify hamburger button has proper ARIA attributes
- Check for console JavaScript errors
- Ensure touch events work on mobile devices

**Navigation links not working**:
- Verify href attributes in configuration
- Check for JavaScript preventing default behavior
- Test with keyboard activation (Enter key)
- Validate anchor link targets exist

### Responsive Problems

**Breakpoint not triggering**:
- Verify CSS media query syntax
- Check viewport meta tag in HTML
- Test with browser developer tools device simulation
- Validate breakpoint values in configuration

**Layout breaks during resize**:
- Check for fixed widths causing overflow
- Verify flexbox/grid properties handle content
- Test with extreme viewport sizes
- Check for JavaScript resize handler issues

### Performance Issues

**Slow header rendering**:
- Check for large SVG files (optimize if needed)
- Verify efficient CSS selectors
- Check for excessive DOM queries in JavaScript
- Test with CPU throttling enabled

**Janky animations**:
- Use CSS transforms instead of layout properties
- Check for forced synchronous layouts
- Verify animations use compositor-only properties
- Test on lower-end devices

---

## Test Data and Configurations

### Test Navigation Configuration
```typescript
const TEST_NAVIGATION: NavigationItem[] = [
  {
    id: 'about',
    label: 'ABOUT',
    href: '/about',
    order: 1,
    ariaLabel: 'About page'
  }
]
```

### Test Breakpoint Configuration
```typescript
const TEST_BREAKPOINTS: BreakpointConfiguration = {
  mobile: 767,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200
}
```

### Device Testing Matrix

| Device Type | Width | Height | Logo | Navigation |
|-------------|-------|--------|------|------------|
| iPhone SE   | 375   | 667    | Mobile | Hamburger |
| iPhone 12   | 390   | 844    | Mobile | Hamburger |
| iPad        | 768   | 1024   | Desktop | Horizontal |
| iPad Pro    | 1024  | 1366   | Desktop | Horizontal |
| Desktop     | 1440  | 900    | Desktop | Horizontal |
| Large       | 1920  | 1080   | Desktop | Horizontal |

---

## Success Criteria Summary

**Must Have** ✅:
- [ ] Logo displays correctly on all breakpoints
- [ ] Mobile menu opens/closes properly
- [ ] Navigation is fully keyboard accessible
- [ ] No interference with existing gallery
- [ ] WCAG 2.1 AA compliance achieved

**Should Have** ⚠️:
- [ ] Smooth animations at 60fps
- [ ] Logo variants optimize for each screen size
- [ ] Performance meets Core Web Vitals targets
- [ ] Screen reader testing passes completely

**Nice to Have** 💡:
- [ ] Prefers-reduced-motion support
- [ ] Advanced keyboard shortcuts
- [ ] Theme switching capability
- [ ] Advanced focus management

**Time Investment**:
- **Quick validation**: 5-10 minutes
- **Comprehensive testing**: 30-45 minutes
- **Full accessibility audit**: 1-2 hours
- **Performance optimization**: 2-4 hours

---

*This quickstart guide should be executed after header implementation to validate all functional requirements and user acceptance criteria.*