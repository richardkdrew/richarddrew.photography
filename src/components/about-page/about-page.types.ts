/**
 * About Page Component Types
 * Simplified types for the about page component
 */

// Core interfaces
export interface IAboutPage extends HTMLElement {
  readonly isInitialized: boolean
  readonly isContentLoaded: boolean
  readonly currentBreakpoint: BreakpointType

  initialize(content?: AboutContent): Promise<void>
  destroy(): void
  updateContent(content: AboutContent): void
  refreshLayout(): void
}

export interface AboutContent {
  title: string
  subtitle?: string
  professionalSummary: string
  lastUpdated: Date
  version: string
}

export interface AboutPageState {
  isInitialized: boolean
  isContentLoaded: boolean
  currentBreakpoint: BreakpointType
  imageLoaded: boolean
  imageError: boolean
  hasError: boolean
  errorMessage?: string
}

export type BreakpointType = 'mobile' | 'tablet' | 'desktop'

// Default configurations
export const DEFAULT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
}

export const DEFAULT_LAYOUT_WIDTH = {
  constrained: '90%',
  full: '100%'
}

export const DEFAULT_SPACING = {
  hero: '2rem',
  content: '1.5rem'
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  title: 'About',
  professionalSummary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  lastUpdated: new Date(),
  version: '1.0.0'
}

// Validation function
export function isValidAboutContent(content: any): content is AboutContent {
  return (
    typeof content === 'object' &&
    typeof content.title === 'string' &&
    content.title.trim().length > 0 &&
    typeof content.professionalSummary === 'string' &&
    content.professionalSummary.trim().length > 0 &&
    content.lastUpdated instanceof Date &&
    typeof content.version === 'string' &&
    content.version.trim().length > 0
  )
}