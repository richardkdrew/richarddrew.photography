# Quickstart: Responsive Images Testing

**Feature**: Responsive Images for Portfolio Gallery
**Purpose**: Manual validation scenarios for responsive image functionality
**Date**: 2025-09-28

## Prerequisites

- Portfolio website running locally (make dev)
- Modern browser with developer tools
- Test images in multiple formats (WebP, JPEG)
- Device emulation capabilities

## Test Scenarios

### Scenario 1: Format Selection and Fallback
**Objective**: Verify WebP delivery with JPEG fallback

**Steps**:
1. Open portfolio gallery in Chrome (WebP supported)
2. Open browser developer tools → Network tab
3. Clear network cache and reload page
4. Filter requests by "Img" type
5. Verify image requests show WebP format being loaded
6. Open same page in older browser or disable WebP support
7. Verify JPEG images load as fallback

**Expected Results**:
- Modern browsers load WebP variants
- Legacy browsers automatically fall back to JPEG
- No broken images or loading errors
- Performance improvements visible in WebP scenarios

### Scenario 2: Responsive Sizing Across Breakpoints
**Objective**: Verify appropriate image sizes load for different viewports

**Steps**:
1. Open gallery in large desktop browser (100rem+ / 1600px+ width)
2. Monitor network requests and note image dimensions
3. Resize browser to desktop width (75-99.9375rem / 1200-1599px)
4. Trigger page reload and observe new image requests
5. Resize to large tablet width (64-74.9375rem / 1024-1199px)
6. Reload and verify medium-large images are requested
7. Resize to tablet width (52.5-63.9375rem / 840-1023px)
8. Reload and verify medium images are requested
9. Resize to mobile width (<48rem / 768px)
10. Reload and verify smallest images are requested
11. Test on actual mobile device for device pixel ratio scaling

**Expected Results**:
- Large Desktop (≥100rem / 1600px) loads largest image variants (800w, 1200w, 1600w)
- Desktop (75-99.9375rem / 1200-1599px) loads large variants (600w, 900w, 1200w)
- Large Tablet (64-74.9375rem / 1024-1199px) loads medium-large variants (480w, 720w, 960w)
- Tablet (52.5-63.9375rem / 840-1023px) loads medium variants (400w, 600w, 800w)
- Mobile (<48rem / 768px) loads smallest variants (320w, 480w, 640w)
- High-DPI devices automatically request higher density variants for each breakpoint

### Scenario 3: Layout Stability During Loading
**Objective**: Ensure masonry layout remains stable during progressive image loading

**Steps**:
1. Open gallery with network throttling enabled (Slow 3G)
2. Observe initial page load with placeholder states
3. Watch for layout shifting as images progressively load
4. Measure Cumulative Layout Shift using browser performance tools
5. Verify masonry columns maintain proper spacing throughout loading
6. Test with mixed aspect ratio images to validate container sizing

**Expected Results**:
- No visible layout jumping or shifting during image loading
- Masonry columns maintain consistent spacing
- CLS score remains under 0.1
- Aspect ratio containers preserve space before images load

### Scenario 4: Progressive Loading and Lazy Loading
**Objective**: Verify performance optimizations for above/below-fold content

**Steps**:
1. Open gallery and monitor network activity immediately
2. Count number of images loaded before scrolling
3. Verify only visible/critical images load initially
4. Scroll down slowly through gallery
5. Observe lazy loading behavior as images enter viewport
6. Note LQIP (low quality) placeholders if implemented
7. Verify smooth transitions from placeholder to full image

**Expected Results**:
- First 3-5 visible images preload immediately
- Below-fold images only load when scrolled into view
- Smooth visual transitions between loading states
- No performance degradation during scrolling

### Scenario 5: Error Handling and Fallbacks
**Objective**: Test graceful degradation when images fail to load

**Steps**:
1. Use browser dev tools to block specific image requests
2. Reload gallery and observe behavior for blocked images
3. Test with malformed image URLs in manifest
4. Verify fallback images or error states display appropriately
5. Test with network connectivity issues
6. Ensure gallery remains functional with partial loading failures

**Expected Results**:
- Failed WebP images fall back to JPEG variants
- Broken image links show appropriate error placeholders
- Gallery layout remains stable with missing images
- Error states provide user feedback without breaking experience

### Scenario 6: Performance Validation
**Objective**: Verify performance targets are met

**Performance Targets**:
- Largest Contentful Paint (LCP): Under 2.5 seconds
- Cumulative Layout Shift (CLS): Under 0.1
- Payload reduction: 30% smaller than JPEG-only
- Total gallery loading: Within 4 seconds

**Steps**:
1. Open browser performance tools (Chrome → Lighthouse)
2. Run performance audit on gallery page
3. Note LCP, CLS, and total loading time metrics
4. Compare total image payload before/after implementation
5. Test on different network conditions (Fast 3G, Slow 3G)
6. Validate metrics across mobile and desktop viewports

**Expected Results**:
- All performance targets met consistently
- WebP adoption showing measurable payload reduction
- No performance regression compared to previous implementation
- Smooth user experience across all tested conditions

## Device Testing Matrix

### Desktop Browsers (5 breakpoint testing)
- Chrome 100+ (full WebP support) - Test all 5 breakpoints
- Firefox 95+ (full support) - Test all 5 breakpoints
- Safari 15+ (recent WebP support) - Test all 5 breakpoints
- Edge 100+ (full support) - Test all 5 breakpoints

### Mobile Devices (mobile/tablet breakpoints)
- iOS Safari 15+ (iPhone 12+) - Mobile breakpoint (<48rem / 768px)
- Android Chrome 100+ (Pixel 6+) - Mobile breakpoint (<48rem / 768px)
- iPad (various sizes) - Tablet/large-tablet breakpoints (48-63.9375rem / 768-1023px)
- Samsung Internet 15+ - Various breakpoints
- Various screen densities (1x, 1.5x, 2x) across all 5 breakpoints

### Network Conditions
- Fast broadband (>10 Mbps)
- Regular 4G (3-10 Mbps)
- Slow 3G (0.5-1.5 Mbps)
- Offline scenario (PWA functionality)

## Success Criteria Validation

### Functional Requirements Checklist
- [ ] FR-001: Appropriately sized images based on viewport ✓
- [ ] FR-002: WebP with JPEG fallback ✓
- [ ] FR-003: Progressive loading with placeholders ✓
- [ ] FR-004: Lazy loading for off-screen content ✓
- [ ] FR-005: Fallback images for loading failures ✓
- [ ] FR-006: Automatic adaptation to device capabilities ✓
- [ ] FR-007: High-density display support ✓
- [ ] FR-008: Aspect ratio preservation ✓
- [ ] FR-009: Critical image preloading ✓
- [ ] FR-010: Lazy loading implementation ✓
- [ ] FR-011: Accessibility features maintained ✓
- [ ] FR-012: Performance targets achieved ✓
- [ ] FR-013: Responsive breakpoint alignment ✓
- [ ] FR-014: Consistent visual quality ✓
- [ ] FR-015: JavaScript-free fallback ✓
- [ ] FR-016: CLS under 0.1 ✓
- [ ] FR-017: 30% payload reduction ✓
- [ ] FR-018: Multi-density variant support ✓
- [ ] FR-019: Masonry layout preservation ✓

## Troubleshooting Guide

### Common Issues
1. **WebP not loading**: Check browser support and server MIME types
2. **Layout shifting**: Verify aspect-ratio CSS implementation
3. **Slow loading**: Check image compression and lazy loading logic
4. **Format fallback failing**: Validate picture element structure
5. **Mobile sizing issues**: Test device pixel ratio detection

### Debug Tools
- Browser Network tab for format/size verification
- Lighthouse performance audits
- Chrome DevTools device emulation
- WebP support detection in console
- Layout shift measurement tools

## Manual Test Execution Log

**Date**: ___________
**Tester**: ___________
**Environment**: ___________

| Scenario | Status | Notes | Issues |
|----------|--------|-------|--------|
| Format Selection | ⬜ Pass ⬜ Fail | | |
| Responsive Sizing | ⬜ Pass ⬜ Fail | | |
| Layout Stability | ⬜ Pass ⬜ Fail | | |
| Progressive Loading | ⬜ Pass ⬜ Fail | | |
| Error Handling | ⬜ Pass ⬜ Fail | | |
| Performance | ⬜ Pass ⬜ Fail | | |

**Overall Result**: ⬜ PASS ⬜ FAIL

**Additional Notes**:
___________________________________
___________________________________