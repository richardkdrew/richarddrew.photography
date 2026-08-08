/**
 * Header Component Interface Contract
 * Defines the public API and behavioral contracts for the portfolio header component
 */

// ============================================================================
// Core Component Interface
// ============================================================================

export interface IPortfolioHeader extends HTMLElement {
  // Public Properties (read-only)
  readonly isInitialized: boolean
  readonly isMobileMenuOpen: boolean
  readonly currentBreakpoint: BreakpointType

  // Public Methods
  initialize(config?: HeaderConfiguration): Promise<void>
  destroy(): void
  toggleMobileMenu(): void
  setActiveNavigation(itemId: string): void
  updateLogo(logoConfig: LogoConfiguration): void
}

// ============================================================================
// Configuration Contracts
// ============================================================================

export interface HeaderConfiguration {
  logo: LogoConfiguration
  navigation: NavigationItem[]
  breakpoints?: BreakpointConfiguration
  mobileMenu?: MobileMenuConfiguration
  accessibility?: AccessibilityConfiguration
}

export interface LogoConfiguration {
  // Required Assets
  mobileLogoSrc: string
  desktopLogoSrc: string

  // Optional Assets
  fallbackSrc?: string

  // Navigation
  homeUrl: string

  // Accessibility (Required)
  altText: string
  ariaLabel: string

  // Display
  title?: string
  loadingPriority?: 'high' | 'low'
}

export interface NavigationItem {
  // Identity (Required)
  id: string
  label: string
  href: string

  // Behavior
  target?: '_self' | '_blank'
  order: number

  // State
  isActive?: boolean
  isDisabled?: boolean

  // Responsive
  mobileOnly?: boolean
  desktopOnly?: boolean

  // Accessibility
  ariaLabel?: string
  description?: string
}

export interface BreakpointConfiguration {
  mobile: number      // Max width for mobile (default: 767)
  tablet: number      // Min width for tablet (default: 768)
  desktop: number     // Min width for desktop (default: 1024)
  largeDesktop: number // Min width for large desktop (default: 1200)
}

export interface MobileMenuConfiguration {
  animationDuration: number
  easing: string
  closeOnNavigate: boolean
  closeOnOutsideClick: boolean
  closeOnEscape: boolean
}

export interface AccessibilityConfiguration {
  skipLinkText: string
  menuButtonText: string
  menuButtonExpandedText: string
  menuButtonCollapsedText: string
  closeMenuText: string
}

// ============================================================================
// State and Event Contracts
// ============================================================================

export type BreakpointType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'

export interface HeaderState {
  isInitialized: boolean
  isMobileMenuOpen: boolean
  isAnimating: boolean
  currentBreakpoint: BreakpointType
  activeNavigationId: string | null
}

export interface ResponsiveState {
  viewportWidth: number
  viewportHeight: number
  currentBreakpoint: BreakpointType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  shouldShowMobileMenu: boolean
  shouldShowDesktopNav: boolean
}

// ============================================================================
// Event Contracts
// ============================================================================

export interface HeaderEventMap {
  'header:initialized': CustomEvent<HeaderInitializedDetail>
  'header:destroyed': CustomEvent<void>
  'header:breakpoint-change': CustomEvent<BreakpointChangeDetail>
  'header:mobile-menu-open': CustomEvent<void>
  'header:mobile-menu-close': CustomEvent<void>
  'header:navigation-click': CustomEvent<NavigationClickDetail>
  'header:logo-click': CustomEvent<LogoClickDetail>
}

export interface HeaderInitializedDetail {
  component: IPortfolioHeader
  configuration: HeaderConfiguration
  timestamp: number
}

export interface BreakpointChangeDetail {
  previousBreakpoint: BreakpointType
  currentBreakpoint: BreakpointType
  viewportWidth: number
  timestamp: number
}

export interface NavigationClickDetail {
  navigationItem: NavigationItem
  event: Event
  timestamp: number
}

export interface LogoClickDetail {
  logoConfig: LogoConfiguration
  event: Event
  timestamp: number
}

// ============================================================================
// Error and Validation Contracts
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export class HeaderConfigurationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'HeaderConfigurationError'
  }
}

export class HeaderStateError extends Error {
  constructor(
    message: string,
    public currentState: Partial<HeaderState>,
    public expectedState: string
  ) {
    super(message)
    this.name = 'HeaderStateError'
  }
}

// ============================================================================
// Component Lifecycle Contracts
// ============================================================================

export interface ComponentLifecycle {
  // Web Components Standard
  connectedCallback(): void
  disconnectedCallback(): void
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void

  // Custom Lifecycle
  beforeInitialize(): Promise<void>
  afterInitialize(): void
  beforeDestroy(): void
  afterDestroy(): void
}

// ============================================================================
// Testing Contracts
// ============================================================================

export interface HeaderTestHelpers {
  // State Inspection
  getInternalState(): HeaderState
  getResponsiveState(): ResponsiveState

  // DOM Inspection
  getLogoElement(): HTMLElement | null
  getNavigationElement(): HTMLElement | null
  getMobileToggleElement(): HTMLElement | null
  getMobileOverlayElement(): HTMLElement | null

  // Interaction Simulation
  simulateResize(width: number, height: number): void
  simulateNavigationClick(itemId: string): void
  simulateKeyboardNavigation(key: string): void

  // Accessibility Testing
  getFocusableElements(): HTMLElement[]
  getAriaAttributes(): Record<string, string>
  getScreenReaderText(): string
}

// ============================================================================
// Performance Monitoring Contracts
// ============================================================================

export interface PerformanceMetrics {
  initializationTime: number
  firstRenderTime: number
  mobileMenuToggleTime: number
  responsiveTransitionTime: number
  memoryUsage: number
}

export interface PerformanceMonitor {
  startMeasurement(name: string): void
  endMeasurement(name: string): number
  getMetrics(): PerformanceMetrics
  reset(): void
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_BREAKPOINTS: BreakpointConfiguration = {
  mobile: 767,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200
}

export const DEFAULT_MOBILE_MENU: MobileMenuConfiguration = {
  animationDuration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  closeOnNavigate: true,
  closeOnOutsideClick: true,
  closeOnEscape: true
}

export const DEFAULT_ACCESSIBILITY: AccessibilityConfiguration = {
  skipLinkText: 'Skip to main content',
  menuButtonText: 'Menu',
  menuButtonExpandedText: 'Close navigation menu',
  menuButtonCollapsedText: 'Open navigation menu',
  closeMenuText: 'Close menu'
}

// ============================================================================
// Type Guards and Validation
// ============================================================================

export function isValidLogoConfiguration(config: any): config is LogoConfiguration {
  return (
    typeof config === 'object' &&
    typeof config.mobileLogoSrc === 'string' &&
    config.mobileLogoSrc.trim().length > 0 &&
    typeof config.desktopLogoSrc === 'string' &&
    config.desktopLogoSrc.trim().length > 0 &&
    typeof config.homeUrl === 'string' &&
    typeof config.altText === 'string' &&
    config.altText.trim().length > 0 &&
    typeof config.ariaLabel === 'string' &&
    config.ariaLabel.trim().length > 0
  )
}

export function isValidNavigationItem(item: any): item is NavigationItem {
  return (
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    item.id.trim().length > 0 &&
    typeof item.label === 'string' &&
    item.label.trim().length > 0 &&
    typeof item.href === 'string' &&
    item.href.trim().length > 0 &&
    typeof item.order === 'number' &&
    item.order >= 0
  )
}

export function isValidBreakpointConfiguration(config: any): config is BreakpointConfiguration {
  return (
    typeof config === 'object' &&
    typeof config.mobile === 'number' &&
    typeof config.tablet === 'number' &&
    typeof config.desktop === 'number' &&
    typeof config.largeDesktop === 'number' &&
    config.mobile < config.tablet &&
    config.tablet <= config.desktop &&
    config.desktop <= config.largeDesktop
  )
}