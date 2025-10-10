/**
 * About Page Component Interface Contract
 * Defines the public API and behavioral contracts for the about page component
 */

// ============================================================================
// Core Component Interface
// ============================================================================

export interface IAboutPage extends HTMLElement {
  // Public Properties (read-only)
  readonly isInitialized: boolean
  readonly isContentLoaded: boolean
  readonly currentBreakpoint: BreakpointType

  // Public Methods
  initialize(content?: AboutContent): Promise<void>
  destroy(): void
  updateContent(content: AboutContent): void
  refreshLayout(): void
}

// ============================================================================
// Content Management Contracts
// ============================================================================

export interface AboutContent {
  // Hero Section
  title: string
  subtitle?: string
  professionalSummary: string

  // Main Content Sections
  background: ContentSection
  skills: SkillsSection
  experience: ExperienceSection
  contact: ContactSection

  // Metadata
  lastUpdated: Date
  version: string
}

export interface ContentSection {
  heading: string
  content: string[]
  order: number
  isVisible?: boolean
}

export interface SkillsSection {
  heading: string
  skillCategories: SkillCategory[]
  order: number
  displayStyle?: 'list' | 'grid' | 'tags'
}

export interface SkillCategory {
  name: string
  skills: string[]
  description?: string
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface ExperienceSection {
  heading: string
  highlights: ExperienceHighlight[]
  order: number
  showTimeline?: boolean
}

export interface ExperienceHighlight {
  title: string
  organization?: string
  description: string
  timeframe?: string
  tags?: string[]
}

export interface ContactSection {
  heading: string
  callToAction: string
  contactMethods: ContactMethod[]
  order: number
  style?: 'minimal' | 'detailed' | 'social'
}

export interface ContactMethod {
  type: 'email' | 'social' | 'phone' | 'website' | 'other'
  label: string
  value: string
  url?: string
  icon?: string
  primary?: boolean
}

// ============================================================================
// Layout and Display Contracts
// ============================================================================

export interface LayoutConfiguration {
  // Breakpoint Management
  breakpoints: BreakpointSettings
  currentBreakpoint: BreakpointType

  // Responsive Layout
  maxWidth: LayoutWidth
  contentFlow: LayoutFlow
  spacing: SpacingConfiguration

  // Visual Layout
  imagePosition: ImagePosition
  textAlignment: TextAlignment
  sectionSpacing: SectionSpacing
}

export interface BreakpointSettings {
  mobile: number      // Max width for mobile (default: 767)
  tablet: number      // Min width for tablet (default: 768)
  desktop: number     // Min width for desktop (default: 1024)
  largeDesktop: number // Min width for large desktop (default: 1200)
}

export interface LayoutWidth {
  mobile: string      // '100%' for ≤2 columns
  tablet: string      // '100%' for ≤2 columns
  desktop: string     // '50%' for 3+ columns
  largeDesktop: string // '50%' for 3+ columns
}

export interface LayoutFlow {
  mobile: FlowDirection
  tablet: FlowDirection
  desktop: FlowDirection
  largeDesktop: FlowDirection
}

export interface SpacingConfiguration {
  sectionGap: string
  contentGap: string
  imageTextGap: string
  paragraphSpacing: string
}

export interface SectionSpacing {
  hero: string
  content: string
  skills: string
  experience: string
  contact: string
}

export type BreakpointType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
export type FlowDirection = 'vertical' | 'horizontal'
export type ImagePosition = 'top' | 'left' | 'right' | 'bottom'
export type TextAlignment = 'left' | 'center' | 'right'

// ============================================================================
// Image Management Contracts
// ============================================================================

export interface ImageAssets {
  // Primary Images
  hero: ResponsiveImage

  // Fallback Options
  placeholder: string
  errorFallback: string

  // Loading Configuration
  loadingStrategy: LoadingStrategy
  preloadSizes: string[]
}

export interface ResponsiveImage {
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
  loading: LoadingType
  fetchPriority?: FetchPriority
  decoding?: DecodingType
}

export interface ImageSource {
  url: string
  width: number
  height?: number
  density?: number
}

export type LoadingStrategy = 'eager' | 'lazy' | 'progressive'
export type LoadingType = 'eager' | 'lazy'
export type FetchPriority = 'high' | 'low' | 'auto'
export type DecodingType = 'sync' | 'async' | 'auto'

// ============================================================================
// State Management Contracts
// ============================================================================

export interface AboutPageState {
  // Component State
  isInitialized: boolean
  isLoading: boolean
  hasError: boolean
  errorMessage?: string

  // Layout State
  currentBreakpoint: BreakpointType
  isContentVisible: boolean
  activeSection?: string

  // Interaction State
  hasScrolled: boolean
  sectionsViewed: Set<string>
  timeOnPage: number
  lastInteraction: number

  // Performance Metrics
  loadTime: number
  imageLoadTime: number
  renderTime: number

  // Accessibility State
  focusedElement: HTMLElement | null
  screenReaderMode: boolean
  reducedMotion: boolean
  highContrast: boolean
}

export interface ResponsiveState {
  // Viewport Information
  viewportWidth: number
  viewportHeight: number
  currentBreakpoint: BreakpointType

  // Layout State
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  usesConstrainedWidth: boolean

  // Layout Configuration
  maxContentWidth: string
  layoutFlow: FlowDirection
  imagePosition: ImagePosition
}

// ============================================================================
// Event Contracts
// ============================================================================

export interface AboutPageEventMap {
  'about:initialized': CustomEvent<AboutInitializedDetail>
  'about:content-loaded': CustomEvent<ContentLoadedDetail>
  'about:layout-changed': CustomEvent<LayoutChangeDetail>
  'about:section-viewed': CustomEvent<SectionViewedDetail>
  'about:image-loaded': CustomEvent<ImageLoadedDetail>
  'about:image-error': CustomEvent<ImageErrorDetail>
  'about:contact-clicked': CustomEvent<ContactClickedDetail>
}

export interface AboutInitializedDetail {
  component: IAboutPage
  content: AboutContent
  layout: LayoutConfiguration
  timestamp: number
}

export interface ContentLoadedDetail {
  content: AboutContent
  loadTime: number
  timestamp: number
}

export interface LayoutChangeDetail {
  previousBreakpoint: BreakpointType
  currentBreakpoint: BreakpointType
  layoutConfig: LayoutConfiguration
  timestamp: number
}

export interface SectionViewedDetail {
  sectionId: string
  sectionName: string
  viewTime: number
  timestamp: number
}

export interface ImageLoadedDetail {
  imageType: string
  loadTime: number
  size: { width: number; height: number }
  timestamp: number
}

export interface ImageErrorDetail {
  imageType: string
  error: string
  fallbackUsed: string
  timestamp: number
}

export interface ContactClickedDetail {
  contactMethod: ContactMethod
  section: string
  timestamp: number
}

// ============================================================================
// Validation and Error Contracts
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
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  suggestion?: string
}

export class AboutContentError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message)
    this.name = 'AboutContentError'
  }
}

export class AboutLayoutError extends Error {
  constructor(
    message: string,
    public breakpoint: BreakpointType,
    public constraint: string
  ) {
    super(message)
    this.name = 'AboutLayoutError'
  }
}

export class AboutImageError extends Error {
  constructor(
    message: string,
    public imageType: string,
    public fallbackAvailable: boolean
  ) {
    super(message)
    this.name = 'AboutImageError'
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
  beforeContentLoad(): void
  afterContentLoad(): void
  beforeLayoutUpdate(): void
  afterLayoutUpdate(): void
  beforeDestroy(): void
  afterDestroy(): void
}

// ============================================================================
// Testing Contracts
// ============================================================================

export interface AboutPageTestHelpers {
  // State Inspection
  getInternalState(): AboutPageState
  getLayoutConfig(): LayoutConfiguration
  getContentData(): AboutContent

  // DOM Inspection
  getHeroSection(): HTMLElement | null
  getContentSections(): HTMLElement[]
  getImageElements(): HTMLImageElement[]
  getContactElements(): HTMLElement[]

  // Interaction Simulation
  simulateResize(width: number, height: number): void
  simulateScroll(position: number): void
  simulateContactClick(contactType: string): void
  simulateImageLoad(success: boolean): void

  // Layout Testing
  measureSectionSpacing(): Record<string, number>
  getComputedLayout(): LayoutMeasurements
  validateResponsiveBreakpoints(): BreakpointValidation[]

  // Content Testing
  validateContentStructure(): ValidationResult
  checkImageOptimization(): ImageOptimizationReport
  verifyAccessibility(): AccessibilityReport
}

export interface LayoutMeasurements {
  containerWidth: number
  contentWidth: number
  imageWidth: number
  sectionHeights: Record<string, number>
  gaps: Record<string, number>
}

export interface BreakpointValidation {
  breakpoint: BreakpointType
  width: number
  expectedLayout: string
  actualLayout: string
  isValid: boolean
}

export interface ImageOptimizationReport {
  totalImages: number
  optimizedImages: number
  formatSupport: Record<string, boolean>
  loadingPerformance: Record<string, number>
  recommendations: string[]
}

export interface AccessibilityReport {
  headingStructure: boolean
  altTexts: boolean
  keyboardNavigation: boolean
  colorContrast: boolean
  focusManagement: boolean
  screenReaderSupport: boolean
  issues: AccessibilityIssue[]
}

export interface AccessibilityIssue {
  type: string
  severity: 'error' | 'warning' | 'info'
  element: string
  description: string
  recommendation: string
}

// ============================================================================
// Performance Monitoring Contracts
// ============================================================================

export interface PerformanceMetrics {
  // Loading Performance
  initializationTime: number
  contentLoadTime: number
  imageLoadTime: number
  firstRenderTime: number

  // Runtime Performance
  layoutCalculationTime: number
  resizeHandlingTime: number
  scrollHandlingTime: number

  // Resource Usage
  memoryUsage: number
  imageMemoryUsage: number
  domNodeCount: number
}

export interface PerformanceMonitor {
  startMeasurement(name: string): void
  endMeasurement(name: string): number
  getMetrics(): PerformanceMetrics
  getAverages(): Record<string, number>
  reset(): void
  exportReport(): PerformanceReport
}

export interface PerformanceReport {
  metrics: PerformanceMetrics
  averages: Record<string, number>
  recommendations: PerformanceRecommendation[]
  timestamp: number
}

export interface PerformanceRecommendation {
  category: string
  issue: string
  impact: 'high' | 'medium' | 'low'
  solution: string
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_BREAKPOINTS: BreakpointSettings = {
  mobile: 767,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200
}

export const DEFAULT_LAYOUT_WIDTH: LayoutWidth = {
  mobile: '100%',
  tablet: '100%',
  desktop: '50%',
  largeDesktop: '50%'
}

export const DEFAULT_SPACING: SpacingConfiguration = {
  sectionGap: 'var(--space-2xl)',
  contentGap: 'var(--space-lg)',
  imageTextGap: 'var(--space-xl)',
  paragraphSpacing: 'var(--space-md)'
}

export const DEFAULT_IMAGE_CONFIG: Partial<ResponsiveImage> = {
  loading: 'lazy',
  fetchPriority: 'auto',
  decoding: 'async',
  sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 50vw'
}

// ============================================================================
// Type Guards and Validation
// ============================================================================

export function isValidAboutContent(content: any): content is AboutContent {
  return (
    typeof content === 'object' &&
    typeof content.title === 'string' &&
    content.title.trim().length > 0 &&
    typeof content.professionalSummary === 'string' &&
    content.professionalSummary.trim().length > 0 &&
    isValidContentSection(content.background) &&
    isValidSkillsSection(content.skills) &&
    isValidExperienceSection(content.experience) &&
    isValidContactSection(content.contact)
  )
}

export function isValidContentSection(section: any): section is ContentSection {
  return (
    typeof section === 'object' &&
    typeof section.heading === 'string' &&
    section.heading.trim().length > 0 &&
    Array.isArray(section.content) &&
    section.content.length > 0 &&
    typeof section.order === 'number' &&
    section.order >= 0
  )
}

export function isValidSkillsSection(section: any): section is SkillsSection {
  return (
    typeof section === 'object' &&
    typeof section.heading === 'string' &&
    Array.isArray(section.skillCategories) &&
    section.skillCategories.every(isValidSkillCategory) &&
    typeof section.order === 'number'
  )
}

export function isValidSkillCategory(category: any): category is SkillCategory {
  return (
    typeof category === 'object' &&
    typeof category.name === 'string' &&
    category.name.trim().length > 0 &&
    Array.isArray(category.skills) &&
    category.skills.length > 0 &&
    category.skills.every((skill: any) => typeof skill === 'string')
  )
}

export function isValidExperienceSection(section: any): section is ExperienceSection {
  return (
    typeof section === 'object' &&
    typeof section.heading === 'string' &&
    Array.isArray(section.highlights) &&
    section.highlights.every(isValidExperienceHighlight) &&
    typeof section.order === 'number'
  )
}

export function isValidExperienceHighlight(highlight: any): highlight is ExperienceHighlight {
  return (
    typeof highlight === 'object' &&
    typeof highlight.title === 'string' &&
    highlight.title.trim().length > 0 &&
    typeof highlight.description === 'string' &&
    highlight.description.trim().length > 0
  )
}

export function isValidContactSection(section: any): section is ContactSection {
  return (
    typeof section === 'object' &&
    typeof section.heading === 'string' &&
    typeof section.callToAction === 'string' &&
    Array.isArray(section.contactMethods) &&
    section.contactMethods.every(isValidContactMethod) &&
    typeof section.order === 'number'
  )
}

export function isValidContactMethod(method: any): method is ContactMethod {
  return (
    typeof method === 'object' &&
    ['email', 'social', 'phone', 'website', 'other'].includes(method.type) &&
    typeof method.label === 'string' &&
    method.label.trim().length > 0 &&
    typeof method.value === 'string' &&
    method.value.trim().length > 0
  )
}

export function isValidLayoutConfiguration(config: any): config is LayoutConfiguration {
  return (
    typeof config === 'object' &&
    isValidBreakpointSettings(config.breakpoints) &&
    isValidLayoutWidth(config.maxWidth) &&
    typeof config.currentBreakpoint === 'string' &&
    ['mobile', 'tablet', 'desktop', 'large-desktop'].includes(config.currentBreakpoint)
  )
}

export function isValidBreakpointSettings(settings: any): settings is BreakpointSettings {
  return (
    typeof settings === 'object' &&
    typeof settings.mobile === 'number' &&
    typeof settings.tablet === 'number' &&
    typeof settings.desktop === 'number' &&
    typeof settings.largeDesktop === 'number' &&
    settings.mobile < settings.tablet &&
    settings.tablet <= settings.desktop &&
    settings.desktop <= settings.largeDesktop
  )
}

export function isValidLayoutWidth(width: any): width is LayoutWidth {
  return (
    typeof width === 'object' &&
    typeof width.mobile === 'string' &&
    typeof width.tablet === 'string' &&
    typeof width.desktop === 'string' &&
    typeof width.largeDesktop === 'string'
  )
}