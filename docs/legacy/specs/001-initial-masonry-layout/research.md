# Research: Initial Masonry Layout

**Phase 0 Research** | **Date**: 2025-09-23
**Feature**: Responsive image gallery with column-based masonry layout

## Research Areas

### 1. CSS Masonry Layout Strategies

**Decision**: CSS Grid with `grid-template-columns` and `grid-auto-flow: column`
**Rationale**: Best browser support and performance for column-based masonry
**Alternatives considered**:
- CSS Columns: Poor control over item distribution
- Flexbox: Requires JavaScript for proper masonry effect
- CSS Masonry spec: Limited browser support (Firefox only)

### 2. Vite + TypeScript Configuration for Vanilla Output

**Decision**: Vite with vanilla TypeScript target, no framework plugins
**Rationale**: Modern DX with fast HMR while maintaining vanilla runtime
**Configuration approach**:
- `vite.config.ts` with library mode disabled
- TypeScript `target: "ES2020"` for modern browser support
- Build outputs standard HTML/CSS/JS files

### 3. Responsive Breakpoint Implementation

**Decision**: CSS custom properties with media queries
**Rationale**: CSS-only responsive behavior prevents layout jitter
**Breakpoint strategy**:
- Mobile: 320-767px (1 column)
- Tablet: 768-1199px (3 columns)
- Desktop: 1200px+ (4-6 columns based on viewport)
- Use `clamp()` and `minmax()` for fluid column sizing

### 4. Progressive Image Loading

**Decision**: Intersection Observer API + responsive images with placeholder
**Rationale**: Native performance with smooth UX
**Implementation strategy**:
- `<picture>` element with WebP + JPEG srcset
- Blur-up placeholder using base64 micro images
- CSS aspect-ratio containers prevent layout shift
- Progressive enhancement for older browsers

### 5. Makefile Development Workflow

**Decision**: Makefile wrapping Vite commands
**Rationale**: Consistent interface independent of tool changes
**Command structure**:
- `make dev` → `vite dev`
- `make build` → `vite build`
- `make preview` → `vite preview`
- `make test` → `vitest`
- `make clean` → remove dist/

### 6. TypeScript Architecture for Vanilla Output

**Decision**: TypeScript interfaces with vanilla DOM manipulation
**Rationale**: Type safety during development, no runtime overhead
**Architecture approach**:
- Type definitions for Image, Gallery, API interfaces
- Web Components using TypeScript classes
- Compile to vanilla ES6 classes and modules

### 7. Image API Abstraction

**Decision**: Simple client interface with local file fallback
**Rationale**: Testable with local images, easily switchable to remote API
**Interface design**:
- `ImageClient` interface with `fetchImages()` method
- `LocalImageClient` implementation for testing
- JSON manifest file for local image metadata

### 8. Performance Optimization Strategies

**Decision**: Lazy loading + image size optimization + CSS containment
**Rationale**: Smooth scrolling and responsive behavior
**Optimization techniques**:
- CSS `contain: layout style paint`
- `loading="lazy"` for below-fold images
- Proper sizing with `sizes` attribute
- Minimal reflows with fixed aspect ratios

## Technical Decisions Summary

| Area | Technology | Justification |
|------|------------|---------------|
| Layout | CSS Grid + Custom Properties | Browser support + performance |
| Build | Vite + TypeScript | Modern DX, vanilla output |
| Images | WebP + JPEG srcset | Progressive enhancement |
| Loading | Intersection Observer | Native performance |
| Responsive | CSS-only media queries | Smooth reflow behavior |
| Commands | Makefile wrapper | Tool-independent interface |
| Testing | Local images + JSON manifest | Development independence |

## Implementation Readiness

All technical unknowns resolved. Ready for Phase 1 design documentation.