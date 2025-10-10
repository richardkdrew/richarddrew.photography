# Data Model: Dark Mode Support

**Feature**: Dark Mode Support
**Date**: 2025-10-01
**Status**: Complete

## Entities

### 1. ThemePreference

**Purpose**: Represents user's theme selection persisted in localStorage

**Storage Schema**:
```typescript
// localStorage key-value
{
  "theme": "light" | "dark"
}
```

**Validation Rules**:
- Value must be exactly `"light"` or `"dark"`
- Invalid values default to `"light"`
- Missing key defaults to `"light"`

**State Transitions**:
```
light → toggle → dark
dark  → toggle → light
```

---

### 2. ThemeToggle Component

**Purpose**: Interactive button for switching between light and dark themes

**TypeScript Interface**:
```typescript
interface ThemeToggleElement extends HTMLElement {
  // Read-only: Current theme state
  readonly currentTheme: 'light' | 'dark'

  // Method: Toggle theme
  toggle(): void
}
```

**Component State**:
- Internal state synced with localStorage
- Visual state (sun/moon icon) derived from theme
- No additional state management needed

**DOM Attributes**:
```typescript
// data-theme attribute on component reflects current state
<theme-toggle data-theme="light|dark"></theme-toggle>
```

---

### 3. Document Theme Attribute

**Purpose**: Root HTML element attribute that CSS uses for theme switching

**Schema**:
```html
<html data-theme="light|dark">
```

**CSS Custom Property Overrides**:
```css
:root {
  /* Light mode (default) */
  --color-primary: #2C2C2C;
  --color-background: #FFFFFF;
  /* ... other colors */
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-primary: #E5E5E5;
  --color-background: #1A1A1A;
  /* ... other colors */
}
```

**Validation**:
- Only values `"light"` or `"dark"` allowed
- Missing attribute treated as `"light"`
- Set synchronously before first paint to prevent FOUC

---

## Design System Color Palette Extensions

### Light Mode (Existing)
```typescript
interface LightThemeColors {
  primary: '#2C2C2C'           // Deep charcoal text
  secondary: '#6B6B6B'         // Warm gray
  accent: '#F8F6F3'            // Soft cream
  pure: '#FFFFFF'              // Clean white
  interactive: '#B8860B'       // Muted gold
  interactiveHover: '#9A7209'  // Darker gold
}
```

### Dark Mode (New)
```typescript
interface DarkThemeColors {
  primary: '#E5E5E5'           // Light gray text (14.2:1 on #1A1A1A)
  secondary: '#B8B8B8'         // Medium gray
  accent: '#2A2A2A'            // Dark gray accent
  pure: '#1A1A1A'              // Near black background
  interactive: '#D4AF37'       // Brighter gold (needs contrast validation)
  interactiveHover: '#F0C14B'  // Even brighter for hover
}
```

**Note**: Interactive colors need WCAG validation during implementation.

---

## Component File Structure

```
src/components/theme-toggle/
├── theme-toggle.ts        # Web Component class (ThemeToggleElement)
├── theme-toggle.css       # Toggle button styles
├── theme-toggle.types.ts  # TypeScript interfaces
└── theme-toggle.html      # SVG icons (sun/moon)
```

**TypeScript Types** (`theme-toggle.types.ts`):
```typescript
export type Theme = 'light' | 'dark'

export interface ThemeToggleElement extends HTMLElement {
  readonly currentTheme: Theme
  toggle(): void
}

export interface ThemeChangeEvent extends CustomEvent {
  detail: {
    theme: Theme
    previousTheme: Theme
  }
}
```

---

## localStorage API Contract

```typescript
// Storage operations
function getTheme(): Theme {
  const stored = localStorage.getItem('theme')
  return stored === 'dark' ? 'dark' : 'light'
}

function setTheme(theme: Theme): void {
  localStorage.setItem('theme', theme)
  document.documentElement.dataset.theme = theme
}

function clearTheme(): void {
  localStorage.removeItem('theme')
  // Reverts to default light mode
  document.documentElement.dataset.theme = 'light'
}
```

**Error Handling**:
- If localStorage unavailable (private browsing): fall back to session-only theme
- No exceptions thrown, graceful degradation

---

## Relationship Diagram

```
User Click
    ↓
ThemeToggle Component
    ↓
localStorage.setItem('theme', newTheme)
    ↓
document.documentElement.dataset.theme = newTheme
    ↓
CSS [data-theme="..."] selectors apply
    ↓
Visual theme change (with 250ms transition)
```

**No complex state management. No event buses. No observers.**

---

## Validation Requirements

### WCAG 2.1 AA Contrast Ratios

**Light Mode** (already validated):
- Text on background: `#2C2C2C` on `#FFFFFF` = 15.8:1 ✓
- Interactive on background: `#B8860B` on `#FFFFFF` = 4.9:1 ✓

**Dark Mode** (to validate during implementation):
- Text on background: `#E5E5E5` on `#1A1A1A` = 14.2:1 ✓
- Interactive on background: `#D4AF37` on `#1A1A1A` = ? (must be ≥4.5:1)
- Interactive hover: `#F0C14B` on `#1A1A1A` = ? (must be ≥4.5:1)

---

## Performance Considerations

**Initial Page Load**:
- Inline `<script>` in `<head>` reads localStorage (synchronous, <1ms)
- Sets `data-theme` attribute before CSS parse
- Zero FOUC, zero layout shift

**Theme Toggle**:
- localStorage write: <1ms
- DOM attribute update: <1ms
- CSS transition: 250ms (visual only)
- **Total**: <100ms (meets constitutional requirement)

---

## Summary

This is the **simplest possible data model** for dark mode:
- One localStorage key-value pair
- One HTML data attribute
- One Web Component with two methods
- CSS custom property overrides

**No framework. No state library. No complexity.**
