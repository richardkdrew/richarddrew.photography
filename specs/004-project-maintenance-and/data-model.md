# Data Model: Project Maintenance and Cleanup

**Feature**: Project Maintenance and Cleanup
**Date**: 2025-09-27
**Generated From**: Feature specification entities

## Entity Definitions

### ProjectStructure
Represents the overall directory hierarchy and file organization patterns.

```typescript
interface ProjectStructure {
  rootPath: string
  directories: ComponentDirectory[]
  configFiles: ConfigFile[]
  testDirectories: TestDirectory[]
  assetDirectories: AssetDirectory[]
  lastOrganized: Date
  organizationVersion: string
}

interface ComponentDirectory {
  name: string
  path: string
  pattern: ComponentPattern
  files: ComponentFile[]
  isOrganized: boolean
}

enum ComponentPattern {
  COMPONENT_FOLDER = 'component-folder',
  FLAT_FILE = 'flat-file',
  MIXED = 'mixed'
}
```

### Component
Represents individual components requiring reorganization (Header, Gallery).

```typescript
interface Component {
  name: string
  currentPath: string
  targetPath: string
  files: ComponentFile[]
  dependencies: string[]
  reorganizationStatus: ReorganizationStatus
  testFiles: string[]
}

interface ComponentFile {
  name: string
  path: string
  type: ComponentFileType
  size: number
  lastModified: Date
  hasValidContent: boolean
}

enum ComponentFileType {
  LOGIC = 'ts',
  STYLES = 'css',
  TYPES = 'types.ts',
  TEMPLATE = 'html',
  TEST = 'test.ts',
  UNKNOWN = 'unknown'
}

enum ReorganizationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

### TestSuite
Represents test organization and restructuring requirements.

```typescript
interface TestSuite {
  featureName: string
  currentPath: string
  targetPath: string
  testFiles: TestFile[]
  coveragePattern: CoveragePattern
  restructureStatus: RestructureStatus
}

interface TestFile {
  name: string
  path: string
  testType: TestType
  lineCount: number
  testCount: number
  isValidStructure: boolean
}

enum TestType {
  CONTRACT = 'contract',
  UI = 'ui',
  ACCESSIBILITY = 'accessibility',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  UNIT = 'unit'
}

enum CoveragePattern {
  ABOUT_PAGE_PATTERN = 'about-page-pattern',
  MIXED_PATTERN = 'mixed-pattern',
  NO_PATTERN = 'no-pattern'
}

enum RestructureStatus {
  ANALYSIS_PENDING = 'analysis_pending',
  RESTRUCTURE_PLANNED = 'restructure_planned',
  RESTRUCTURE_IN_PROGRESS = 'restructure_in_progress',
  RESTRUCTURE_COMPLETED = 'restructure_completed'
}
```

### Constitution
Represents project governance document requiring updates.

```typescript
interface Constitution {
  version: string
  lastUpdated: Date
  filePath: string
  sections: ConstitutionSection[]
  completedFeatures: CompletedFeature[]
  needsUpdate: boolean
}

interface ConstitutionSection {
  name: string
  content: string
  lastModified: Date
  isCurrentWithProject: boolean
}

interface CompletedFeature {
  name: string
  completionDate: Date
  branch: string
  impactOnPrinciples: string[]
}
```

### FontAssets
Represents font files and web font optimization.

```typescript
interface FontAssets {
  fontFamily: string
  files: FontFile[]
  loadingStrategy: FontLoadingStrategy
  fallbackStack: string[]
  isOptimized: boolean
}

interface FontFile {
  name: string
  path: string
  format: FontFormat
  size: number
  isPreloaded: boolean
  displayStrategy: FontDisplay
}

enum FontFormat {
  WOFF2 = 'woff2',
  WOFF = 'woff',
  TTF = 'ttf',
  OTF = 'otf'
}

enum FontDisplay {
  SWAP = 'swap',
  FALLBACK = 'fallback',
  OPTIONAL = 'optional',
  AUTO = 'auto'
}

interface FontLoadingStrategy {
  preloadCritical: boolean
  useSystemFallbacks: boolean
  optimizeForPerformance: boolean
}
```

### IconAssets
Represents browser and mobile icon files.

```typescript
interface IconAssets {
  brandingPath: string
  favicon: FaviconSet
  appleTouchIcons: AppleIcon[]
  pwaManifestIcons: PWAIcon[]
  isComplete: boolean
}

interface FaviconSet {
  ico: IconFile
  png: IconFile
  svg?: IconFile
}

interface AppleIcon {
  size: number
  path: string
  isRetina: boolean
}

interface PWAIcon {
  size: number
  path: string
  purpose: IconPurpose[]
}

interface IconFile {
  path: string
  size: number
  format: string
  isLinkedInHTML: boolean
}

enum IconPurpose {
  ANY = 'any',
  MASKABLE = 'maskable',
  MONOCHROME = 'monochrome'
}
```

### ConfigurationFiles
Represents build configs, test configs, and other project configuration.

```typescript
interface ConfigurationFiles {
  buildConfigs: ConfigFile[]
  testConfigs: ConfigFile[]
  lintingRules: ConfigFile[]
  dependencyManifests: ConfigFile[]
  duplicateConfigs: DuplicateConfig[]
}

interface ConfigFile {
  name: string
  path: string
  type: ConfigType
  isActive: boolean
  hasDuplicates: boolean
  lastModified: Date
}

enum ConfigType {
  VITE = 'vite',
  VITEST = 'vitest',
  TYPESCRIPT = 'typescript',
  ESLINT = 'eslint',
  PACKAGE_JSON = 'package',
  MAKEFILE = 'makefile',
  OTHER = 'other'
}

interface DuplicateConfig {
  originalPath: string
  duplicatePaths: string[]
  canConsolidate: boolean
  consolidationStrategy: string
}
```

### Dependencies
Represents package dependencies analysis.

```typescript
interface Dependencies {
  packageJsonPath: string
  productionDeps: Dependency[]
  devDeps: Dependency[]
  unusedDeps: string[]
  outdatedDeps: OutdatedDependency[]
  cleanupRequired: boolean
}

interface Dependency {
  name: string
  version: string
  isUsed: boolean
  lastChecked: Date
  usageLocations: string[]
}

interface OutdatedDependency {
  name: string
  currentVersion: string
  latestVersion: string
  isBreakingChange: boolean
}
```

## Validation Rules

### Component Validation
- All components MUST follow component-folder pattern
- Each component MUST have at minimum: logic file (.ts) and styles file (.css)
- Component names MUST be kebab-case
- All file references MUST be functional after reorganization

### Test Validation
- Test suites MUST follow about-page pattern
- Each feature MUST have at minimum: contract tests and UI tests
- Test file names MUST follow pattern: `[feature]-[type].test.ts`
- All tests MUST pass after restructuring

### Asset Validation
- Font files MUST include WOFF2 format for modern browsers
- Favicon MUST include ICO and PNG formats
- Apple Touch Icons MUST be 180x180px minimum
- PWA icons MUST include 192x192 and 512x512 sizes

### Constitutional Validation
- Constitution version MUST be incremented
- Completed features MUST be documented
- All constitutional principles MUST be reflected in current project state

## State Transitions

### Component Reorganization Flow
1. `PENDING` → `IN_PROGRESS`: Begin file reorganization
2. `IN_PROGRESS` → `COMPLETED`: All files moved and imports updated
3. `IN_PROGRESS` → `FAILED`: Error during reorganization, rollback required

### Test Restructuring Flow
1. `ANALYSIS_PENDING` → `RESTRUCTURE_PLANNED`: Analyze current test structure
2. `RESTRUCTURE_PLANNED` → `RESTRUCTURE_IN_PROGRESS`: Begin moving and updating tests
3. `RESTRUCTURE_IN_PROGRESS` → `RESTRUCTURE_COMPLETED`: All tests moved and passing

## Relationships

- `Component` has many `ComponentFile`
- `TestSuite` has many `TestFile`
- `ProjectStructure` contains many `ComponentDirectory`
- `Constitution` tracks many `CompletedFeature`
- `FontAssets` has many `FontFile`
- `IconAssets` has one `FaviconSet` and many `AppleIcon` and `PWAIcon`
- `ConfigurationFiles` may have many `DuplicateConfig`

## Performance Constraints

- Component initialization MUST remain <100ms after reorganization
- Build times MUST not increase significantly
- Test execution MUST remain efficient
- Asset loading MUST maintain <200ms for critical resources
- Memory usage during cleanup operations MUST be bounded