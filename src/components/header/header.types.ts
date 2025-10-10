/**
 * Header Component Types
 * Simplified types for the header component
 */

// Core interfaces
export interface IHeader extends HTMLElement {
  readonly isMobileMenuOpen: boolean
  readonly currentBreakpoint: BreakpointType

  initialize(): void
  destroy(): void
  toggleMobileMenu(): void
  closeMobileMenu(): void
  handleResize(): void
}

export type BreakpointType = 'mobile' | 'tablet' | 'desktop'