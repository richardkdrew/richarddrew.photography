# Data Model: Portfolio Header with Navigation and Branding

**Date**: 2025-09-26
**Feature**: Portfolio Header with Navigation and Branding
**Phase**: Data Model and Entity Design

---

## Entity Overview

The header feature involves primarily UI state entities rather than persistent data entities. The core entities manage component state, navigation items, and responsive behavior.

---

## Core Entities

### 1. HeaderComponent

**Purpose**: Main header component managing all header functionality
**Lifecycle**: Created on page load, persists for page session

**Properties**:
```typescript
interface HeaderComponent {
  // State Management
  isInitialized: boolean
  isMobileMenuOpen: boolean
  currentBreakpoint: BreakpointType

  // DOM References
  element: HTMLElement
  logoElement: HTMLElement
  navigationElement: HTMLElement
  mobileToggle: HTMLElement
  mobileOverlay: HTMLElement

  // Configuration
  logoConfig: LogoConfiguration
  navigationItems: NavigationItem[]

  // Event Handlers
  handleResize: () => void
  handleMobileToggle: () => void
  handleKeyboardNavigation: (event: KeyboardEvent) => void
}
```

**State Transitions**:
- `uninitialized` → `initialized` (on component mount)
- `desktop` ↔ `mobile` (on resize)
- `menu-closed` ↔ `menu-open` (on mobile menu toggle)

**Validation Rules**:
- `isInitialized` must be true before any interactions
- `isMobileMenuOpen` only valid on mobile breakpoints
- DOM references must exist before state changes

### 2. LogoConfiguration

**Purpose**: Configuration for responsive logo display
**Lifecycle**: Static configuration, loaded once

**Properties**:
```typescript
interface LogoConfiguration {
  // Asset Paths
  mobileLogoSrc: string
  desktopLogoSrc: string
  fallbackSrc?: string

  // Display Properties
  altText: string
  title: string
  homeUrl: string

  // Responsive Behavior
  mobileBreakpoint: number // px
  loadingPriority: 'high' | 'low'

  // Accessibility
  ariaLabel: string
  focusable: boolean
}
```

**Validation Rules**:
- `mobileLogoSrc` and `desktopLogoSrc` must be valid URLs
- `altText` and `ariaLabel` must be non-empty strings
- `mobileBreakpoint` must be positive number (default: 768)

### 3. NavigationItem

**Purpose**: Individual navigation menu item configuration
**Lifecycle**: Static configuration, loaded once

**Properties**:
```typescript
interface NavigationItem {
  // Identification
  id: string
  label: string

  // Navigation
  href: string
  target?: '_self' | '_blank'

  // State
  isActive?: boolean
  isDisabled?: boolean

  // Display
  order: number
  mobileOnly?: boolean
  desktopOnly?: boolean

  // Accessibility
  ariaLabel?: string
  description?: string
}
```

**Validation Rules**:
- `id` must be unique within navigation set
- `label` must be non-empty string
- `href` must be valid URL or anchor
- `order` must be positive integer for sorting

### 4. ResponsiveState

**Purpose**: Manages responsive behavior and breakpoint detection
**Lifecycle**: Updated on resize events

**Properties**:
```typescript
interface ResponsiveState {
  // Current State
  currentBreakpoint: BreakpointType
  viewportWidth: number
  viewportHeight: number

  // Configuration
  breakpoints: BreakpointConfiguration

  // Computed Properties
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  shouldShowMobileMenu: boolean
  shouldShowDesktopNav: boolean
}

type BreakpointType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'

interface BreakpointConfiguration {
  mobile: number    // 0-767px
  tablet: number    // 768-1023px
  desktop: number   // 1024-1199px
  largeDesktop: number // 1200px+
}
```

**State Transitions**:
- Breakpoint changes trigger responsive behavior updates
- Navigation visibility toggles based on breakpoint
- Logo variant selection based on breakpoint

### 5. MobileMenuState

**Purpose**: Manages mobile menu overlay state and interactions
**Lifecycle**: Active only on mobile breakpoints

**Properties**:
```typescript
interface MobileMenuState {
  // Visibility
  isOpen: boolean
  isAnimating: boolean

  // Focus Management
  previousFocusElement: HTMLElement | null
  focusableElements: HTMLElement[]
  currentFocusIndex: number

  // Interaction State
  closeOnNavigate: boolean
  closeOnOutsideClick: boolean
  closeOnEscape: boolean

  // Animation
  animationDuration: number // ms
  easing: string
}
```

**Validation Rules**:
- `isOpen` and `isAnimating` cannot both be true simultaneously
- `focusableElements` must be updated when menu opens
- `previousFocusElement` must be restored when menu closes

---

## Entity Relationships

```
HeaderComponent
├── contains: LogoConfiguration (1:1)
├── contains: NavigationItem[] (1:many)
├── manages: ResponsiveState (1:1)
└── manages: MobileMenuState (1:1, conditional)

ResponsiveState
├── triggers: HeaderComponent.handleResize()
└── determines: MobileMenuState.availability

MobileMenuState
├── depends on: ResponsiveState.isMobile
└── manages: NavigationItem.visibility
```

---

## State Management Patterns

### 1. Initialization Flow
```typescript
class PortfolioHeader extends HTMLElement {
  private state: HeaderComponent

  connectedCallback() {
    this.initializeState()
    this.setupEventListeners()
    this.renderInitialLayout()
    this.state.isInitialized = true
  }
}
```

### 2. Responsive Updates
```typescript
private handleResize = () => {
  const newBreakpoint = this.detectBreakpoint()

  if (newBreakpoint !== this.state.currentBreakpoint) {
    this.state.currentBreakpoint = newBreakpoint
    this.updateNavigationVisibility()
    this.updateLogoVariant()

    // Close mobile menu if switching to desktop
    if (newBreakpoint !== 'mobile' && this.state.isMobileMenuOpen) {
      this.closeMobileMenu()
    }
  }
}
```

### 3. Mobile Menu Management
```typescript
private toggleMobileMenu() {
  if (this.state.isMobileMenuOpen) {
    this.closeMobileMenu()
  } else {
    this.openMobileMenu()
  }
}

private openMobileMenu() {
  this.state.isMobileMenuOpen = true
  this.storePreviousFocus()
  this.trapFocus()
  this.preventBodyScroll()
}

private closeMobileMenu() {
  this.state.isMobileMenuOpen = false
  this.restorePreviousFocus()
  this.allowBodyScroll()
}
```

---

## Configuration Schema

### Default Configuration
```typescript
const DEFAULT_HEADER_CONFIG: HeaderConfiguration = {
  logo: {
    mobileLogoSrc: '/assets/logo-mobile.svg',
    desktopLogoSrc: '/assets/logo-desktop.svg',
    altText: 'Portfolio Logo',
    title: 'Portfolio Home',
    homeUrl: '/',
    mobileBreakpoint: 768,
    ariaLabel: 'Return to homepage',
    focusable: true
  },

  navigation: [
    {
      id: 'about',
      label: 'ABOUT',
      href: '/about',
      order: 1,
      ariaLabel: 'About page'
    }
  ],

  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    largeDesktop: 1600
  },

  mobileMenu: {
    animationDuration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    closeOnNavigate: true,
    closeOnOutsideClick: true,
    closeOnEscape: true
  }
}
```

---

## Validation and Error Handling

### Required Field Validation
```typescript
function validateHeaderConfig(config: HeaderConfiguration): ValidationResult {
  const errors: string[] = []

  // Logo validation
  if (!config.logo.mobileLogoSrc) {
    errors.push('Mobile logo source is required')
  }

  if (!config.logo.desktopLogoSrc) {
    errors.push('Desktop logo source is required')
  }

  if (!config.logo.altText?.trim()) {
    errors.push('Logo alt text is required for accessibility')
  }

  // Navigation validation
  if (!config.navigation || config.navigation.length === 0) {
    errors.push('At least one navigation item is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### Runtime State Validation
```typescript
function validateComponentState(state: HeaderComponent): boolean {
  // Ensure critical DOM elements exist
  if (!state.element || !state.logoElement || !state.navigationElement) {
    console.error('Critical header elements missing')
    return false
  }

  // Validate mobile menu state consistency
  if (state.isMobileMenuOpen && state.currentBreakpoint !== 'mobile') {
    console.warn('Mobile menu open on non-mobile breakpoint')
    return false
  }

  return true
}
```

---

## Performance Considerations

### Memory Management
- Event listeners properly cleaned up in `disconnectedCallback`
- Resize handlers debounced to prevent excessive recalculation
- Focus management uses WeakMap for element references

### State Updates
- Minimal DOM queries through cached element references
- State changes batched using `requestAnimationFrame`
- CSS custom properties updated rather than style recalculation

### Responsive Optimization
- Breakpoint detection uses `ResizeObserver` when available
- Logo switching uses CSS media queries rather than JavaScript
- Navigation visibility controlled via CSS classes, not inline styles

---

## Testing Considerations

### State Testing
- Component initialization state verification
- Responsive state transitions testing
- Mobile menu state management validation

### Integration Testing
- Logo variant switching across breakpoints
- Navigation item interaction behavior
- Focus management during mobile menu usage

### Edge Case Testing
- Rapid resize events handling
- Network failure logo loading
- Keyboard navigation edge cases
- Screen reader announcement verification