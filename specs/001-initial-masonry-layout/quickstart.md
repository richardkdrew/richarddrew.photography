# Quickstart: Initial Masonry Layout Testing

**Phase 1 Design** | **Date**: 2025-09-23
**Feature**: Responsive image gallery manual testing guide

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Development server running

### Quick Start Commands
```bash
# Start development server
make dev

# Run tests
make test

# Build for production
make build

# Preview production build
make preview

# Clean build artifacts
make clean
```

## Manual Testing Scenarios

### 1. Responsive Layout Testing

**Objective**: Verify column layout adapts correctly across breakpoints

**Test Steps**:
1. Open gallery page in browser
2. Start with desktop viewport (1400px width)
3. Verify 4+ columns are displayed
4. Slowly resize window to tablet width (900px)
5. Verify layout transitions to 3 columns
6. Continue resizing to mobile width (400px)
7. Verify layout transitions to 1 column

**Expected Results**:
- Smooth transition between breakpoints
- No layout jitter or flashing during resize
- Images maintain aspect ratios
- Columns remain balanced (similar heights)

### 2. Image Loading Testing

**Objective**: Verify progressive image loading and placeholder behavior

**Test Steps**:
1. Open gallery page with network throttling (Slow 3G)
2. Observe initial page load
3. Scroll down to trigger lazy loading
4. Test with failed image loads (disable network)
5. Re-enable network and refresh

**Expected Results**:
- Placeholders appear immediately with correct aspect ratios
- Blur-up effect or skeleton animation during load
- Images progressively enhance from placeholder to final
- Failed images show appropriate fallback
- No layout shift during image loading

### 3. Image Format Testing

**Objective**: Verify WebP/JPEG fallback works correctly

**Test Steps**:
1. Test in modern browser (Chrome/Firefox)
2. Verify WebP images load via Network tab
3. Test in browser without WebP support (if available)
4. Verify JPEG fallback loads
5. Check responsive image sizes are appropriate

**Expected Results**:
- WebP images load in supporting browsers
- JPEG images load as fallback
- Appropriate image size loaded based on viewport
- No oversized images on mobile

### 4. Performance Testing

**Objective**: Verify smooth scrolling and responsive behavior

**Test Steps**:
1. Load gallery with 20+ images
2. Scroll rapidly up and down
3. Resize window repeatedly
4. Monitor for frame drops or jank

**Expected Results**:
- Smooth 60fps scrolling
- No visible lag during window resize
- Memory usage remains stable
- CPU usage reasonable

### 5. Accessibility Testing

**Objective**: Verify basic accessibility requirements

**Test Steps**:
1. Navigate using keyboard only (Tab/Shift+Tab)
2. Test with screen reader (VoiceOver/NVDA)
3. Verify alt text is read correctly
4. Check focus indicators are visible

**Expected Results**:
- All images focusable via keyboard
- Alt text properly announced
- Focus indicators clearly visible
- Logical tab order maintained

## Test Data Setup

### Local Image Manifest
Create `/public/images/manifest.json`:
```json
{
  "images": [
    {
      "id": "test-landscape-01",
      "alt": "Sample landscape image for testing",
      "aspectRatio": 1.5,
      "sources": [
        {
          "format": "webp",
          "sizes": [
            { "width": 200, "url": "/images/test-landscape-01-200.webp" },
            { "width": 250, "url": "/images/test-landscape-01-250.webp" },
            { "width": 300, "url": "/images/test-landscape-01-300.webp" },
            { "width": 500, "url": "/images/test-landscape-01-500.webp" }
          ]
        },
        {
          "format": "jpeg",
          "sizes": [
            { "width": 200, "url": "/images/test-landscape-01-200.jpg" },
            { "width": 250, "url": "/images/test-landscape-01-250.jpg" },
            { "width": 300, "url": "/images/test-landscape-01-300.jpg" },
            { "width": 500, "url": "/images/test-landscape-01-500.jpg" }
          ]
        }
      ],
      "placeholder": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
    }
  ]
}
```

### Test Image Requirements
- Minimum 20 test images for proper gallery testing
- Mix of aspect ratios: landscape (1.5:1), portrait (0.67:1), square (1:1)
- Various content types: photos, illustrations, graphics
- File sizes: 200w (~15KB), 500w (~60KB) for performance testing

## Browser Testing Matrix

| Browser | Version | WebP Support | Notes |
|---------|---------|--------------|-------|
| Chrome | Latest | ✅ | Primary development browser |
| Firefox | Latest | ✅ | Test WebP compatibility |
| Safari | Latest | ✅ | Test WebKit rendering |
| Edge | Latest | ✅ | Test Chromium compatibility |

## Performance Benchmarks

**Target Metrics**:
- Initial page load: <2s (3G network)
- Image lazy load: <200ms after scroll
- Resize reflow: <16ms (60fps)
- Memory usage: <50MB for 50 images

**Measurement Tools**:
- Chrome DevTools Performance tab
- Lighthouse performance audit
- WebPageTest.org for network conditions
- Manual stopwatch for subjective smoothness

## Debugging Guide

### Common Issues
1. **Layout jitter on resize**: Check CSS containment and aspect-ratio
2. **Images not loading**: Verify manifest.json format and file paths
3. **Poor performance**: Check image sizes and lazy loading implementation
4. **Accessibility issues**: Verify alt text and focus management

### Debug Commands
```bash
# Check manifest format
make validate-manifest

# Test image URLs
make check-images

# Performance profiling
make profile

# Accessibility audit
make a11y-test
```