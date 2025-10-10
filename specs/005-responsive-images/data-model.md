# Data Model: Responsive Images

**Feature**: Responsive Images for Portfolio Gallery
**Date**: 2025-09-28
**Context**: Enhanced image data structures for responsive delivery

## Core Entities

### ResponsiveImage
Primary entity representing an image with multiple responsive variants.

**Fields**:
- `id: string` - Unique identifier for the image
- `alt: string` - Accessibility description text
- `aspectRatio: number` - Width/height ratio for layout stability
- `sources: ResponsiveImageSource[]` - Array of format/size variants
- `lqip?: string` - Optional low-quality image placeholder URL
- `metadata: ImageMetadata` - Additional image information

**Relationships**:
- Has many `ResponsiveImageSource` (format variants)
- Belongs to gallery collection
- Used by masonry layout system

**Validation Rules**:
- `id` must be unique within gallery
- `alt` must be non-empty string for accessibility
- `aspectRatio` must be positive number
- `sources` must contain at least one WebP and one JPEG source
- Each source must have complete size variants for all breakpoints

### ResponsiveImageSource
Format-specific collection of image sizes.

**Fields**:
- `format: 'webp' | 'jpeg'` - Image format type
- `sizes: ResponsiveImageSize[]` - Array of size variants

**Validation Rules**:
- `format` must be 'webp' or 'jpeg'
- `sizes` must include variants for all breakpoints (mobile/tablet/large-tablet/desktop/large-desktop)
- Each of the 5 breakpoints must have 1x, 2x, and 3x density variants

### ResponsiveImageSize
Individual image variant with specific dimensions and density.

**Fields**:
- `width: number` - Image width in pixels
- `height: number` - Image height in pixels
- `density: 1 | 2 | 3` - Pixel density multiplier
- `url: string` - Asset URL for this variant
- `breakpoint: 'mobile' | 'tablet' | 'large-tablet' | 'desktop' | 'large-desktop'` - Target viewport

**Validation Rules**:
- `width` and `height` must be positive integers
- `density` must be 1, 2, or 3
- `url` must be valid absolute or relative URL
- Dimensions must maintain consistent aspect ratio across variants

### ImageMetadata
Additional image information for optimization and display.

**Fields**:
- `originalWidth: number` - Source image width
- `originalHeight: number` - Source image height
- `fileSize: number` - Compressed file size in bytes
- `caption?: string` - Optional image caption
- `tags?: string[]` - Optional categorization tags
- `dateTaken?: string` - Optional capture date (ISO 8601)

### ResponsiveImageManifest
Gallery-level configuration for responsive images.

**Fields**:
- `version: string` - Manifest version for cache busting
- `breakpoints: BreakpointConfiguration` - Responsive breakpoint settings
- `images: ResponsiveImage[]` - Array of all gallery images
- `performance: PerformanceConfiguration` - Loading optimization settings

### BreakpointConfiguration
Responsive breakpoint definitions aligned with design system.

**Fields**:
- `mobile: { maxWidth: 47.9375, sizes: number[] }` - Mobile breakpoint configuration (<48rem / 768px)
- `tablet: { minWidth: 48, maxWidth: 52.4375, sizes: number[] }` - Tablet configuration (48-52.4375rem / 768-839px)
- `largeTablet: { minWidth: 52.5, maxWidth: 63.9375, sizes: number[] }` - Large tablet configuration (52.5-63.9375rem / 840-1023px)
- `desktop: { minWidth: 64, maxWidth: 74.9375, sizes: number[] }` - Desktop configuration (64-74.9375rem / 1024-1199px)
- `largeDesktop: { minWidth: 75, sizes: number[] }` - Large desktop configuration (≥75rem / 1200px)

### PerformanceConfiguration
Loading optimization settings.

**Fields**:
- `preloadCount: number` - Number of images to preload (default: 3)
- `lazyLoadThreshold: string` - Intersection observer threshold (default: '6.25rem' / 100px)
- `placeholderQuality: number` - LQIP quality setting (default: 10)
- `enableWebP: boolean` - WebP format support toggle

## State Transitions

### Image Loading States
1. **Placeholder** - Aspect ratio container with background color
2. **LQIP** - Low quality image placeholder visible
3. **Loading** - Progressive image loading in progress
4. **Loaded** - Full resolution image displayed
5. **Error** - Loading failed, fallback image shown

### Format Selection Flow
1. **Browser Detection** - Check WebP support via feature detection
2. **Format Priority** - WebP preferred, JPEG fallback
3. **Size Selection** - Choose appropriate size based on viewport and density
4. **Cache Check** - Verify if image already loaded/cached
5. **Load Request** - Initiate image loading with selected variant

## Integration with Existing System

### Extended SimpleImage Interface
The current `SimpleImage` interface will be extended to support responsive variants while maintaining backward compatibility.

```typescript
// Current interface (preserved)
interface SimpleImage {
  id: string
  url: string
  alt: string
  aspectRatio: number
  metadata: {
    width: number
    height: number
  }
}

// Enhanced interface (new)
interface ResponsiveImage extends Omit<SimpleImage, 'url'> {
  sources: ResponsiveImageSource[]
  lqip?: string
  metadata: ImageMetadata
}
```

### Gallery Component Integration
- Existing masonry layout logic remains unchanged
- Image rendering enhanced to support `<picture>` elements
- Lazy loading system extended for responsive variants
- Error handling updated for multiple format fallbacks

## Data Validation Schema

### Runtime Validation Rules
- All images must have valid aspect ratios matching their dimensions
- Each responsive source must include all required breakpoint variants
- URLs must be accessible and return valid image content
- LQIP placeholders must be valid base64 or URL strings

### Performance Constraints
- Total manifest size should not exceed 100KB for 30 images
- Individual image metadata should not exceed 1KB per image
- LQIP strings should be under 2KB when base64 encoded
- Aspect ratio calculations must be precise to 3 decimal places

## Migration Strategy

### Backward Compatibility
- Current `SimpleImage` format supported during transition
- Existing gallery JSON manifest enhanced with responsive data
- Graceful degradation for missing responsive variants
- Legacy image URLs preserved as JPEG fallback sources

### Data Transformation
1. Analyze existing image assets for responsive variant generation
2. Calculate aspect ratios from current image dimensions
3. Generate WebP variants for all existing images
4. Create size variants for mobile/tablet/desktop breakpoints
5. Update gallery manifest with enhanced responsive data structure