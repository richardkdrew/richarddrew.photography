# Research: Responsive Images Implementation

**Feature**: Responsive Images for Portfolio Gallery
**Date**: 2025-09-28
**Context**: Modern responsive image delivery with WebP/JPEG fallback and layout stability

## Research Areas

### 1. HTML Responsive Image Techniques

**Decision**: Use `<picture>` element with `<source>` elements for format selection and `srcset` for responsive sizing
**Rationale**:
- Provides native browser support for format selection (WebP with JPEG fallback)
- Allows art direction and responsive sizing in a single declarative approach
- Better SEO and accessibility than JavaScript-only solutions
- Works without JavaScript for basic functionality

**Alternatives considered**:
- `<img srcset>` only: Limited format fallback capabilities
- JavaScript-only solution: Fails accessibility and SEO requirements
- CSS `image-set()`: Limited browser support and integration complexity

### 2. Image Format Strategy

**Decision**: WebP primary with JPEG fallback, no AVIF initially
**Rationale**:
- WebP has 96%+ browser support and excellent compression (30-35% smaller than JPEG)
- JPEG provides universal fallback compatibility
- AVIF support still inconsistent across browsers (~85%)
- Two-format strategy balances compatibility with performance gains

**Alternatives considered**:
- WebP + AVIF + JPEG: Added complexity, marginal gains over WebP
- JPEG only: Fails performance requirements (30% payload reduction)
- WebP only: Fails fallback requirements for older browsers

### 3. Responsive Breakpoints and Sizing

**Decision**: Align with existing design system breakpoints (5-breakpoint system)
**Rationale**:
- Consistency with current masonry layout system (5 breakpoints)
- Reduces complexity by reusing existing breakpoint logic
- Supports 1x, 1.5x, 2x pixel density variants for each of the 5 breakpoints
- Aligns with CSS custom properties: --breakpoint-mobile (48rem/768px), --breakpoint-tablet (52.5rem/840px), --breakpoint-large-tablet (64rem/1024px), --breakpoint-desktop (75rem/1200px), --breakpoint-large-desktop (100rem/1600px)

**Image sizes per breakpoint** (aligned with actual design system):
- Mobile (<48rem / 768px): 320w, 480w (1.5x), 640w (2x)
- Tablet (48-52.4375rem / 768-839px): 400w, 600w (1.5x), 800w (2x)
- Large Tablet (52.5-63.9375rem / 840-1023px): 480w, 720w (1.5x), 960w (2x)
- Desktop (64-74.9375rem / 1024-1199px): 600w, 900w (1.5x), 1200w (2x)
- Large Desktop (≥75rem / 1200px): 800w, 1200w (1.5x), 1600w (2x)

### 4. Layout Stability During Loading

**Decision**: Use CSS `aspect-ratio` property with calculated dimensions from image metadata
**Rationale**:
- Prevents Cumulative Layout Shift (CLS) during image loading
- Maintains masonry column spacing without JavaScript calculations
- Works with existing masonry layout manager
- Supports progressive loading with stable placeholders

**Implementation approach**:
- Extract aspect ratio from image metadata in JSON manifest
- Apply `aspect-ratio` CSS property to image containers
- Use intrinsic sizing to maintain responsive behavior

### 5. Progressive Loading Strategy

**Decision**: Implement lazy loading with Intersection Observer API and low-quality placeholders
**Rationale**:
- Native browser lazy loading (`loading="lazy"`) for baseline functionality
- Intersection Observer for enhanced control and placeholder management
- LQIP (Low Quality Image Placeholder) for smooth visual transitions
- Prioritize above-the-fold images for LCP optimization

**Loading sequence**:
1. Aspect-ratio placeholder (instant)
2. LQIP blur effect (fast, small file)
3. Progressive JPEG or WebP (main image)
4. Fade transition between states

### 6. Integration with Existing Gallery System

**Decision**: Extend current `SimpleImage` interface and enhance gallery component
**Rationale**:
- Minimal disruption to existing masonry layout logic
- Leverages current responsive breakpoint system
- Maintains compatibility with existing image loading infrastructure

**Integration points**:
- Extend `SimpleImage` type with responsive image data for all 5 breakpoints
- Update gallery JSON manifest to include multiple sizes/formats per breakpoint
- Enhance image rendering within existing masonry columns using CSS custom properties
- Preserve current lazy loading and error handling patterns
- Leverage existing column count variables (--columns-mobile: 1, --columns-tablet: 2, --columns-large-tablet: 3)

### 7. Performance Optimization Techniques

**Decision**: Implement preloading for critical images, lazy loading for below-fold content
**Rationale**:
- Preload first 2-3 visible images for optimal LCP performance
- Use resource hints (`<link rel="preload">`) for critical images
- Implement efficient cache headers for image assets
- Optimize image compression with quality settings per format

**Performance targets validation**:
- LCP under 2.5s: Achieved through preloading and WebP compression
- CLS under 0.1: Achieved through aspect-ratio preservation
- 30% payload reduction: Achieved through WebP adoption and responsive sizing

## Implementation Architecture

### Enhanced Data Model
```typescript
interface ResponsiveImageSource {
  format: 'webp' | 'jpeg'
  sizes: Array<{
    width: number
    density: 1 | 2 | 3
    url: string
  }>
}

interface ResponsiveImage extends SimpleImage {
  sources: ResponsiveImageSource[]
  aspectRatio: number
  lqip?: string // Low quality image placeholder
}
```

### Browser Support Strategy
- **WebP support**: Chrome 14+, Firefox 65+, Safari 14+, Edge 18+
- **Picture element**: All modern browsers, IE 13+ with polyfill
- **Aspect-ratio CSS**: Chrome 88+, Firefox 89+, Safari 15+, fallback with padding-top
- **Intersection Observer**: Chrome 51+, Firefox 55+, Safari 12.1+, polyfill available

### Testing Strategy
- Contract tests for responsive image data structures
- Integration tests for progressive loading behavior
- Performance tests for LCP, CLS, and payload metrics
- Cross-browser compatibility testing for fallback scenarios

## Recommendations

1. **Start with WebP + JPEG dual format approach** for optimal compatibility/performance balance
2. **Implement aspect-ratio with padding-top fallback** for older browser support
3. **Use existing masonry layout system** as foundation, extending rather than replacing
4. **Generate multiple image sizes during build process** for static asset optimization
5. **Implement comprehensive performance monitoring** to validate LCP and CLS targets