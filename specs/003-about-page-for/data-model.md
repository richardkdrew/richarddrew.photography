# Data Model: About Page for Portfolio Website

**Date**: 2025-09-27
**Feature**: About Page for Portfolio Website
**Phase**: Data Model and Entity Design

---

## Entity Overview

The about page feature involves primarily content display entities for professional information presentation. The core entities manage page content, responsive layout, and user interaction tracking.

---

## Core Entities

### 1. AboutPageComponent

**Purpose**: Main about page component managing all page functionality and content display
**Lifecycle**: Created on page load, persists for page session

**Properties**:
```typescript
interface AboutPageComponent {
  // State Management
  isInitialized: boolean
  isContentLoaded: boolean
  currentBreakpoint: BreakpointType

  // DOM References
  element: HTMLElement
  heroSection: HTMLElement
  contentSection: HTMLElement
  imageElement: HTMLImageElement

  // Configuration
  content: AboutContent
  layout: LayoutConfiguration
  images: ImageAssets

  // Event Handlers
  handleResize: () => void
  handleImageLoad: () => void
  handleImageError: () => void
}
```

**State Transitions**:
- `uninitialized` → `initialized` (on component mount)
- `loading` → `loaded` (on content/image load)
- `mobile` ↔ `desktop` (on resize)

**Validation Rules**:
- `isInitialized` must be true before content loading
- `content` must be valid before rendering
- DOM references must exist before state changes

### 2. AboutContent

**Purpose**: Content structure for about page information
**Lifecycle**: Static content loaded once, may be updated

**Properties**:
```typescript
interface AboutContent {
  // Hero Section
  title: string
  subtitle?: string
  professionalSummary: string

  // Main Content
  background: ContentSection
  skills: SkillsSection
  experience: ExperienceSection
  contact: ContactSection

  // Metadata
  lastUpdated: Date
  version: string
}

interface ContentSection {
  heading: string
  content: string[]
  order: number
}

interface SkillsSection {
  heading: string
  skillCategories: SkillCategory[]
  order: number
}

interface SkillCategory {
  name: string
  skills: string[]
  description?: string
}

interface ExperienceSection {
  heading: string
  highlights: ExperienceHighlight[]
  order: number
}

interface ExperienceHighlight {
  title: string
  organization?: string
  description: string
  timeframe?: string
}

interface ContactSection {
  heading: string
  callToAction: string
  contactMethods: ContactMethod[]
  order: number
}

interface ContactMethod {
  type: 'email' | 'social' | 'other'
  label: string
  value: string
  url?: string
}
```

**Validation Rules**:
- `title` and `professionalSummary` are required
- `content` arrays must not be empty
- `order` values must be unique within sections
- Contact methods must have valid `type` and `value`

### 3. ImageAssets

**Purpose**: Image configuration and responsive image management
**Lifecycle**: Loaded on page initialization, cached for session

**Properties**:
```typescript
interface ImageAssets {
  // Primary Image
  hero: ResponsiveImage

  // Fallbacks
  placeholder: string
  errorFallback: string

  // Loading Configuration
  loadingStrategy: 'eager' | 'lazy'
  preloadSizes: string[]
}

interface ResponsiveImage {
  // Source Sets
  webp: ImageSource[]
  jpeg: ImageSource[]

  // Metadata
  alt: string
  aspectRatio: number
  caption?: string
  credit?: string

  // Display Properties
  sizes: string
  loading: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

interface ImageSource {
  url: string
  width: number
  density?: number
}
```

**Validation Rules**:
- `hero.alt` must be non-empty for accessibility
- `webp` and `jpeg` arrays must have matching width entries
- `aspectRatio` must be positive number
- `sizes` must be valid CSS sizes attribute

### 4. LayoutConfiguration

**Purpose**: Responsive layout configuration and breakpoint management
**Lifecycle**: Set during initialization, updated on resize

**Properties**:
```typescript
interface LayoutConfiguration {
  // Breakpoint Settings
  breakpoints: BreakpointSettings
  currentBreakpoint: BreakpointType

  // Layout Properties
  maxWidth: LayoutWidth
  contentFlow: LayoutFlow
  spacing: SpacingConfiguration

  // Responsive Behavior
  imagePosition: ImagePosition
  textAlignment: TextAlignment
}

interface BreakpointSettings {
  mobile: number
  tablet: number
  desktop: number
  largeDesktop: number
}

interface LayoutWidth {
  mobile: string      // '100%' for ≤2 columns
  tablet: string      // '100%' for ≤2 columns
  desktop: string     // '50%' for 3+ columns
  largeDesktop: string // '50%' for 3+ columns
}

interface LayoutFlow {
  mobile: 'vertical' | 'horizontal'
  tablet: 'vertical' | 'horizontal'
  desktop: 'vertical' | 'horizontal'
}

interface SpacingConfiguration {
  sectionGap: string
  contentGap: string
  imageTextGap: string
}

type BreakpointType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
type ImagePosition = 'top' | 'left' | 'right' | 'bottom'
type TextAlignment = 'left' | 'center' | 'right'
```

**State Transitions**:
- Breakpoint changes trigger layout updates
- Image position adjusts based on breakpoint
- Text alignment adapts to layout flow

### 5. AboutPageState

**Purpose**: Manages about page interaction state and performance tracking
**Lifecycle**: Active during page session

**Properties**:
```typescript
interface AboutPageState {
  // Loading State
  isLoading: boolean
  hasError: boolean
  errorMessage?: string

  // Interaction State
  hasScrolled: boolean
  sectionsViewed: string[]
  timeOnPage: number

  // Performance Metrics
  loadTime: number
  imageLoadTime: number
  interactionTime: number

  // Accessibility State
  focusedElement: HTMLElement | null
  screenReaderMode: boolean
  reducedMotion: boolean
}
```

**Validation Rules**:
- `loadTime` and `imageLoadTime` should be positive numbers
- `sectionsViewed` should track unique section identifiers
- `timeOnPage` should increment while page is active

---

## Entity Relationships

```
AboutPageComponent
├── contains: AboutContent (1:1)
├── contains: ImageAssets (1:1)
├── manages: LayoutConfiguration (1:1)
└── tracks: AboutPageState (1:1)

AboutContent
├── contains: ContentSection[] (1:many)
├── contains: SkillsSection (1:1)
├── contains: ExperienceSection (1:1)
└── contains: ContactSection (1:1)

LayoutConfiguration
├── determines: ImageAssets.display
├── controls: AboutContent.layout
└── triggers: AboutPageComponent.resize

AboutPageState
├── tracks: AboutPageComponent.interactions
└── monitors: AboutContent.engagement
```

---

## Content Management Patterns

### 1. Content Loading Flow
```typescript
class AboutPage extends HTMLElement {
  private content: AboutContent
  private images: ImageAssets

  async connectedCallback() {
    this.initializeState()
    await this.loadContent()
    await this.loadImages()
    this.render()
    this.setupEventListeners()
  }

  private async loadContent(): Promise<void> {
    // Load from static JSON or inline data
    this.content = await this.fetchContentData()
    this.validateContent(this.content)
  }
}
```

### 2. Responsive Layout Management
```typescript
private handleResize = () => {
  const newBreakpoint = this.detectBreakpoint()

  if (newBreakpoint !== this.layout.currentBreakpoint) {
    this.layout.currentBreakpoint = newBreakpoint
    this.updateLayoutFlow()
    this.adjustImagePosition()
    this.recalculateSpacing()
  }
}

private updateLayoutFlow() {
  const isDesktop = this.layout.currentBreakpoint === 'desktop' ||
                   this.layout.currentBreakpoint === 'large-desktop'

  this.element.classList.toggle('about-page--desktop', isDesktop)
  this.element.classList.toggle('about-page--mobile', !isDesktop)
}
```

### 3. Image Loading Management
```typescript
private handleImageLoad() {
  this.state.imageLoadTime = performance.now() - this.state.loadStartTime
  this.state.isLoading = false
  this.updateLoadingState()
}

private handleImageError() {
  this.state.hasError = true
  this.state.errorMessage = 'Failed to load profile image'
  this.showFallbackImage()
}
```

---

## Configuration Schema

### Default Content Configuration
```typescript
const DEFAULT_ABOUT_CONTENT: AboutContent = {
  title: "About",
  professionalSummary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

  background: {
    heading: "Background & Expertise",
    content: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco."
    ],
    order: 1
  },

  skills: {
    heading: "Skills & Technologies",
    skillCategories: [
      {
        name: "Design",
        skills: ["Typography", "Layout", "Color Theory"],
        description: "Visual design expertise"
      },
      {
        name: "Development",
        skills: ["HTML", "CSS", "JavaScript"],
        description: "Frontend development skills"
      }
    ],
    order: 2
  },

  experience: {
    heading: "Experience Highlights",
    highlights: [
      {
        title: "Senior Designer",
        organization: "Example Company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        timeframe: "2020-Present"
      }
    ],
    order: 3
  },

  contact: {
    heading: "Let's Connect",
    callToAction: "Interested in working together? Get in touch!",
    contactMethods: [
      {
        type: 'email',
        label: 'Email',
        value: 'hello@example.com',
        url: 'mailto:hello@example.com'
      }
    ],
    order: 4
  },

  lastUpdated: new Date(),
  version: "1.0.0"
}
```

### Default Layout Configuration
```typescript
const DEFAULT_LAYOUT_CONFIG: LayoutConfiguration = {
  breakpoints: {
    mobile: 767,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1200
  },

  currentBreakpoint: 'mobile',

  maxWidth: {
    mobile: '100%',
    tablet: '100%',
    desktop: '50%',
    largeDesktop: '50%'
  },

  contentFlow: {
    mobile: 'vertical',
    tablet: 'vertical',
    desktop: 'horizontal',
  },

  spacing: {
    sectionGap: 'var(--space-2xl)',
    contentGap: 'var(--space-lg)',
    imageTextGap: 'var(--space-xl)'
  },

  imagePosition: 'top',
  textAlignment: 'left'
}
```

---

## Validation and Error Handling

### Content Validation
```typescript
function validateAboutContent(content: AboutContent): ValidationResult {
  const errors: string[] = []

  if (!content.title?.trim()) {
    errors.push('Title is required')
  }

  if (!content.professionalSummary?.trim()) {
    errors.push('Professional summary is required')
  }

  // Validate sections have required content
  if (!content.background.content.length) {
    errors.push('Background section must have content')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### Runtime State Validation
```typescript
function validatePageState(state: AboutPageState): boolean {
  // Ensure performance metrics are reasonable
  if (state.loadTime < 0 || state.loadTime > 10000) {
    console.warn('Unusual load time detected')
    return false
  }

  // Validate interaction tracking
  if (state.timeOnPage < 0) {
    console.error('Invalid time on page')
    return false
  }

  return true
}
```

---

## Performance Considerations

### Memory Management
- Content loaded once and cached for session
- Image assets managed with lazy loading
- Event listeners cleaned up on component disconnect
- Resize handlers debounced to prevent excessive recalculation

### Loading Optimization
- Critical content loaded first (hero section)
- Non-critical sections loaded progressively
- Images lazy loaded except hero image
- Font preloading for typography consistency

### Responsive Performance
- Layout calculations minimized during resize
- CSS custom properties updated rather than style recalculation
- Intersection Observer used for section tracking
- RequestAnimationFrame used for smooth transitions

---

## Testing Considerations

### Content Testing
- Content structure validation
- Responsive layout verification
- Image loading and fallback testing

### State Management Testing
- Component initialization state verification
- Responsive state transitions testing
- Error handling validation

### Performance Testing
- Load time measurement
- Image optimization verification
- Responsive transition smoothness

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation flow
- Focus management verification
- Color contrast validation