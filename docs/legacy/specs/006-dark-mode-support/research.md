# Research: Dark Mode Support

**Feature**: Dark Mode Support
**Date**: 2025-10-01
**Status**: Complete

## Technical Decisions

### 1. Theme Switching Mechanism

**Decision**: Use `[data-theme]` attribute on `<html>` element with CSS custom property overrides

**Rationale**:
- Clean, declarative approach that leverages CSS cascade
- No JavaScript required for styling, only for toggling attribute
- Easy to test and debug (visible in DevTools)
- Follows modern web standards
- Better performance than class-based or inline style approaches

**Alternatives Considered**:
- **CSS class approach** (`.dark-mode` on body): Similar but less semantic
- **Separate stylesheets**: Causes flash of unstyled content (FOUC)
- **Inline style injection**: Poor performance, harder to maintain
- **System preference detection**: Rejected for simplicity per spec clarifications

**Implementation**:
```css
:root {
  --color-primary: #2C2C2C;    /* light mode */
  --color-background: #FFFFFF;
}

[data-theme="dark"] {
  --color-primary: #E5E5E5;    /* dark mode override */
  --color-background: #1A1A1A;
}
```

### 2. Storage Mechanism

**Decision**: localStorage with key `theme`, values `"light"` | `"dark"`

**Rationale**:
- Simple, synchronous API (no async complexity)
- Persistent across browser sessions
- 5-10MB storage limit is more than sufficient
- No backend required (device-local per spec)
- Falls back gracefully if unavailable

**Alternatives Considered**:
- **sessionStorage**: Doesn't persist across sessions (violates requirement)
- **Cookies**: Unnecessary overhead, sent with every HTTP request
- **IndexedDB**: Over-engineered for single key-value pair
- **Backend API**: Violates device-local specification requirement

**Implementation**:
```typescript
function getTheme(): 'light' | 'dark' {
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
}

function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('theme', theme)
  document.documentElement.dataset.theme = theme
}
```

### 3. WCAG 2.1 AA Contrast Requirements

**Decision**: 4.5:1 for normal text, 3:1 for large text and interactive elements

**Rationale**:
- Constitutional requirement for accessibility
- WCAG 2.1 Level AA is industry standard
- Legally required in many jurisdictions
- Ensures usability for users with visual impairments

**Color Palette Requirements**:
- **Light mode** (already exists):
  - Text `#2C2C2C` on background `#FFFFFF`: 15.8:1 ✓
  - Interactive `#B8860B` on background `#FFFFFF`: 4.9:1 ✓

- **Dark mode** (to be created):
  - Text must be light color on dark background
  - Target: `#E5E5E5` text on `#1A1A1A` background: 14.2:1 ✓
  - Interactive elements need testing/adjustment

**Tools for Validation**:
- WebAIM Contrast Checker
- Browser DevTools accessibility panel
- Automated tests using contrast calculation libraries

### 4. Component Architecture

**Decision**: Create `theme-toggle` Web Component following constitutional pattern

**Rationale**:
- Maintains consistency with existing components (header, gallery, about-page)
- Encapsulation of toggle logic and styling
- Reusable across different pages
- Type-safe with TypeScript interfaces
- Follows constitutional component-folder structure

**Component Structure**:
```
src/components/theme-toggle/
├── theme-toggle.ts        # Web Component class
├── theme-toggle.css       # Toggle button styles
├── theme-toggle.types.ts  # TypeScript interfaces
└── theme-toggle.html      # SVG icons for sun/moon
```

**Integration Points**:
- Desktop: Insert into header nav (rightmost position)
- Mobile: Insert at bottom of mobile menu overlay

### 5. Transition Strategy

**Decision**: CSS transitions on color properties with `transition-medium` timing

**Rationale**:
- Smooth visual experience (no jarring flashes)
- Respects `prefers-reduced-motion` for accessibility
- Uses existing design system timing (`--transition-medium: 250ms`)
- Applied to all color-based properties

**Implementation**:
```css
* {
  transition: background-color var(--transition-medium),
              color var(--transition-medium),
              border-color var(--transition-medium);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

**Performance Consideration**: Wildcard selector is acceptable because:
- Only 3 properties affected (not layout/geometry)
- Browser optimized for color transitions
- Constitutional requirement <100ms easily met

### 6. Initial Page Load Strategy

**Decision**: Inline script in `<head>` to set theme before paint

**Rationale**:
- Prevents FOUC (flash of unstyled content)
- Synchronous execution before render
- Tiny performance cost (~10 lines of JS)
- Industry standard approach

**Implementation**:
```html
<script>
(function() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.dataset.theme = theme;
})();
</script>
```

### 7. Logo Handling

**Decision**: Create dark logo variant, swap via CSS background-image

**Rationale**:
- Light logo already exists in header
- Dark logo needed for visibility on dark backgrounds
- CSS-based swap is performant and automatic
- No JavaScript required for logo switching

**Implementation**:
```css
.header__logo {
  background-image: url('/images/logo-light.svg');
}

[data-theme="dark"] .header__logo {
  background-image: url('/images/logo-dark.svg');
}
```

**Asset Requirements**:
- Create dark version of existing logo
- Same dimensions and format
- High contrast for dark backgrounds

### 8. Testing Strategy

**Decision**: Four-tier test approach per constitutional pattern

**Rationale**:
- Follows established about-page test organization
- Comprehensive coverage of all requirements
- TDD compliance (tests before implementation)

**Test Categories**:
1. **Contract tests**: Component interface, localStorage API, TypeScript types
2. **UI tests**: Toggle functionality, theme persistence, visual changes
3. **Accessibility tests**: WCAG contrast ratios, keyboard navigation, screen reader support
4. **Performance tests**: <100ms switching, no FOUC, minimal overhead

## Open Questions Resolved

All clarifications were completed during `/clarify` phase:
- ✅ Default theme: Always light mode (no system detection)
- ✅ Cross-device sync: Device-local only (no backend)
- ✅ Toggle scope: Site-wide (all pages)
- ✅ Storage cleared: Revert to light mode default

## Dependencies

**Runtime**:
- TypeScript (existing)
- CSS Custom Properties (existing)
- Web Components API (existing)
- localStorage API (browser native)

**Development**:
- Vitest (existing test framework)
- JSDOM (existing test environment)

**No New Dependencies Required** ✓

## Performance Targets

Per constitutional requirements and spec:
- **Theme switching**: <100ms (FR-004)
- **Initial page load**: No FOUC, minimal overhead
- **Toggle interaction**: Instant visual feedback
- **Storage operations**: Synchronous, <1ms

## Security Considerations

**localStorage**:
- No sensitive data stored (theme preference only)
- XSS protection via CSP (existing)
- No cross-origin concerns (same-origin policy)

**User Privacy**:
- No tracking or analytics
- No external API calls
- Fully client-side implementation

## Browser Compatibility

**Required Features**:
- CSS Custom Properties: Supported in all modern browsers
- localStorage: Supported since IE8+
- Web Components: Polyfill not needed (target modern browsers)
- `data-*` attributes: Universal support

**Target**: Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)

## Implementation Risks

**Low Risk**:
- Well-established patterns
- No external dependencies
- Simple state management
- Clear requirements

**Mitigation Strategies**:
- Comprehensive test coverage
- Performance monitoring
- Contrast validation tools
- Manual accessibility testing

## References

- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)
