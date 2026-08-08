/**
 * Contract: Project Structure Management
 * Defines interfaces for project organization and maintenance operations
 */

export interface IProjectStructureManager {
  // Analysis operations
  analyzeCurrentStructure(): Promise<ProjectStructureAnalysis>
  validateComponentPattern(componentName: string): Promise<ComponentPatternValidation>
  identifyUnusedFiles(): Promise<UnusedFileReport>

  // Reorganization operations
  reorganizeComponent(componentName: string, targetPattern: ComponentPattern): Promise<ReorganizationResult>
  consolidateConfigurations(): Promise<ConsolidationResult>
  cleanupArtifacts(): Promise<CleanupResult>

  // Validation operations
  validateBuildProcess(): Promise<BuildValidationResult>
  validateImports(): Promise<ImportValidationResult>
}

export interface ProjectStructureAnalysis {
  totalFiles: number
  organizedComponents: string[]
  unorganizedComponents: string[]
  testCoverage: TestCoverageReport
  configurationStatus: ConfigurationStatus
  recommendedActions: RecommendedAction[]
}

export interface ComponentPatternValidation {
  componentName: string
  currentPattern: ComponentPattern
  targetPattern: ComponentPattern
  requiredChanges: FileOperation[]
  estimatedEffort: EffortEstimate
  risks: ValidationRisk[]
}

export interface UnusedFileReport {
  unusedFiles: UnusedFile[]
  safeToDelete: string[]
  requiresReview: string[]
  totalSizeReduction: number
}

export interface ReorganizationResult {
  componentName: string
  status: OperationStatus
  filesReorganized: number
  importsUpdated: number
  errors: OperationError[]
  rollbackRequired: boolean
}

export interface ConsolidationResult {
  duplicatesFound: number
  duplicatesConsolidated: number
  configFilesUpdated: string[]
  errors: OperationError[]
}

export interface CleanupResult {
  artifactsRemoved: number
  spaceClaimed: number
  buildTimeImprovement: number
  errors: OperationError[]
}

export interface BuildValidationResult {
  buildSuccessful: boolean
  buildTime: number
  bundleSize: number
  errors: BuildError[]
  warnings: BuildWarning[]
}

export interface ImportValidationResult {
  totalImports: number
  validImports: number
  brokenImports: ImportError[]
  circularDependencies: CircularDependency[]
}

// Supporting types
export enum ComponentPattern {
  COMPONENT_FOLDER = 'component-folder',
  FLAT_FILE = 'flat-file',
  MIXED = 'mixed'
}

export enum OperationStatus {
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILED = 'failed',
  ROLLBACK_REQUIRED = 'rollback_required'
}

export interface FileOperation {
  type: 'move' | 'rename' | 'delete' | 'create'
  source: string
  target?: string
  reason: string
}

export interface EffortEstimate {
  filesAffected: number
  estimatedTimeMinutes: number
  complexityLevel: 'low' | 'medium' | 'high'
  requiresManualReview: boolean
}

export interface ValidationRisk {
  level: 'low' | 'medium' | 'high'
  description: string
  mitigation: string
}

export interface UnusedFile {
  path: string
  size: number
  lastModified: Date
  reason: string
  safeToDelete: boolean
}

export interface OperationError {
  type: string
  message: string
  file?: string
  isRecoverable: boolean
}

export interface TestCoverageReport {
  featuresWithTests: string[]
  featuresWithoutTests: string[]
  testPatternCompliance: number
  recommendedTestAdditions: string[]
}

export interface ConfigurationStatus {
  totalConfigs: number
  duplicateConfigs: number
  outdatedConfigs: string[]
  consolidationOpportunities: string[]
}

export interface RecommendedAction {
  action: string
  priority: 'high' | 'medium' | 'low'
  description: string
  estimatedImpact: string
}

export interface BuildError {
  file: string
  line: number
  message: string
  severity: 'error' | 'warning'
}

export interface BuildWarning {
  file: string
  message: string
  canIgnore: boolean
}

export interface ImportError {
  file: string
  importPath: string
  message: string
  suggestedFix?: string
}

export interface CircularDependency {
  files: string[]
  severity: 'error' | 'warning'
  suggestedBreakPoint: string
}