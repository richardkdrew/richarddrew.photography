/**
 * Contract: Asset Management (Fonts and Icons)
 * Defines interfaces for managing font files and browser/mobile icons
 */

export interface IAssetManager {
  // Font management operations
  analyzeFontRequirements(): Promise<FontRequirementAnalysis>
  installFontAssets(fontConfig: FontConfiguration): Promise<FontInstallationResult>
  optimizeFontLoading(): Promise<FontOptimizationResult>

  // Icon management operations
  analyzeIconRequirements(): Promise<IconRequirementAnalysis>
  generateIconSet(sourceIcon: string): Promise<IconGenerationResult>
  installBrowserIcons(iconSet: BrowserIconSet): Promise<IconInstallationResult>

  // Validation operations
  validateAssetIntegration(): Promise<AssetValidationResult>
  verifyAssetPerformance(): Promise<AssetPerformanceResult>
}

export interface FontRequirementAnalysis {
  currentFonts: CurrentFontUsage[]
  requiredFormats: FontFormat[]
  loadingStrategy: FontLoadingStrategy
  performanceImpact: FontPerformanceImpact
  recommendations: FontRecommendation[]
}

export interface FontInstallationResult {
  fontsInstalled: InstalledFont[]
  cssGenerated: string
  htmlUpdatesRequired: HTMLFontUpdate[]
  status: OperationStatus
  errors: AssetOperationError[]
}

export interface FontOptimizationResult {
  originalSize: number
  optimizedSize: number
  loadingImprovements: LoadingImprovement[]
  fallbacksConfigured: FallbackConfiguration[]
  status: OperationStatus
}

export interface IconRequirementAnalysis {
  requiredIcons: RequiredIcon[]
  currentIcons: CurrentIcon[]
  missingIcons: MissingIcon[]
  formatRequirements: IconFormatRequirement[]
  platformSupport: PlatformIconSupport[]
}

export interface IconGenerationResult {
  sourceIcon: string
  generatedIcons: GeneratedIcon[]
  manifestUpdated: boolean
  htmlUpdatesRequired: HTMLIconUpdate[]
  status: OperationStatus
}

export interface IconInstallationResult {
  iconsInstalled: InstalledIcon[]
  manifestGenerated: PWAManifest
  htmlLinksAdded: string[]
  status: OperationStatus
  errors: AssetOperationError[]
}

export interface AssetValidationResult {
  fontsValid: boolean
  iconsValid: boolean
  htmlLinksValid: boolean
  manifestValid: boolean
  performanceImpact: AssetPerformanceImpact
  issues: AssetValidationIssue[]
}

export interface AssetPerformanceResult {
  fontLoadingTime: number
  iconLoadingTime: number
  totalAssetSize: number
  performanceScore: number
  optimizationOpportunities: PerformanceOptimization[]
}

// Supporting types
export enum FontFormat {
  WOFF2 = 'woff2',
  WOFF = 'woff',
  TTF = 'ttf',
  OTF = 'otf'
}

export enum IconFormat {
  ICO = 'ico',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp'
}

export enum OperationStatus {
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILED = 'failed',
  ROLLBACK_REQUIRED = 'rollback_required'
}

export interface CurrentFontUsage {
  fontFamily: string
  currentSource: 'system' | 'web' | 'external' | 'none'
  usageLocations: string[]
  isOptimal: boolean
}

export interface FontConfiguration {
  fontFamily: string
  variants: FontVariant[]
  formats: FontFormat[]
  loadingStrategy: FontLoadingStrategy
  fallbackStack: string[]
}

export interface FontVariant {
  weight: number
  style: 'normal' | 'italic'
  filename: string
  displayName: string
}

export interface FontLoadingStrategy {
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  preload: boolean
  critical: boolean
}

export interface FontPerformanceImpact {
  estimatedLoadTime: number
  sizeIncrease: number
  layoutShiftRisk: 'low' | 'medium' | 'high'
  renderBlockingPotential: boolean
}

export interface FontRecommendation {
  action: string
  priority: 'high' | 'medium' | 'low'
  description: string
  performanceBenefit: string
}

export interface InstalledFont {
  fontFamily: string
  variants: InstalledFontVariant[]
  cssPath: string
  preloadTags: string[]
}

export interface InstalledFontVariant {
  weight: number
  style: string
  formats: FontFileInfo[]
}

export interface FontFileInfo {
  format: FontFormat
  path: string
  size: number
}

export interface HTMLFontUpdate {
  location: 'head' | 'css'
  content: string
  reason: string
}

export interface LoadingImprovement {
  metric: string
  beforeValue: number
  afterValue: number
  improvementPercentage: number
}

export interface FallbackConfiguration {
  fontFamily: string
  fallbackStack: string[]
  matchingMetrics: FontMetrics
}

export interface FontMetrics {
  ascent: number
  descent: number
  lineGap: number
  sizeAdjust: number
}

export interface RequiredIcon {
  type: IconType
  sizes: number[]
  format: IconFormat
  purpose: IconPurpose[]
  priority: 'critical' | 'important' | 'nice-to-have'
}

export enum IconType {
  FAVICON = 'favicon',
  APPLE_TOUCH = 'apple-touch',
  PWA_MANIFEST = 'pwa-manifest',
  BROWSER_CONFIG = 'browser-config'
}

export enum IconPurpose {
  ANY = 'any',
  MASKABLE = 'maskable',
  MONOCHROME = 'monochrome'
}

export interface CurrentIcon {
  type: IconType
  path: string
  size: number
  format: IconFormat
  isLinked: boolean
}

export interface MissingIcon {
  type: IconType
  requiredSizes: number[]
  formats: IconFormat[]
  priority: 'high' | 'medium' | 'low'
}

export interface IconFormatRequirement {
  platform: string
  requiredFormats: IconFormat[]
  optionalFormats: IconFormat[]
  sizeRequirements: IconSizeRequirement[]
}

export interface IconSizeRequirement {
  size: number
  isRequired: boolean
  usageContext: string
}

export interface PlatformIconSupport {
  platform: string
  supportedFormats: IconFormat[]
  recommendedSizes: number[]
  specialRequirements: string[]
}

export interface GeneratedIcon {
  type: IconType
  size: number
  format: IconFormat
  path: string
  purpose?: IconPurpose[]
}

export interface HTMLIconUpdate {
  tagType: 'link' | 'meta'
  attributes: Record<string, string>
  location: 'head'
  reason: string
}

export interface InstalledIcon {
  type: IconType
  files: IconFileInfo[]
  htmlLinks: string[]
  manifestEntry?: PWAManifestIcon
}

export interface IconFileInfo {
  path: string
  size: number
  format: IconFormat
  purpose?: IconPurpose[]
}

export interface PWAManifest {
  name: string
  shortName: string
  icons: PWAManifestIcon[]
  themeColor: string
  backgroundColor: string
}

export interface PWAManifestIcon {
  src: string
  sizes: string
  type: string
  purpose?: string
}

export interface AssetOperationError {
  type: string
  message: string
  asset?: string
  isRecoverable: boolean
  suggestedFix?: string
}

export interface AssetPerformanceImpact {
  additionalBytes: number
  additionalRequests: number
  estimatedLoadTimeIncrease: number
  cacheEfficiency: number
}

export interface AssetValidationIssue {
  asset: string
  issue: string
  severity: 'error' | 'warning' | 'info'
  recommendation: string
}

export interface PerformanceOptimization {
  asset: string
  optimization: string
  estimatedBenefit: string
  implementationComplexity: 'low' | 'medium' | 'high'
}