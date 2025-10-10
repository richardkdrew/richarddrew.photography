/**
 * Contract: Test Management and Restructuring
 * Defines interfaces for test suite reorganization and standardization
 */

export interface ITestManager {
  // Analysis operations
  analyzeTestStructure(): Promise<TestStructureAnalysis>
  validateTestPatterns(): Promise<TestPatternValidation>
  assessTestCoverage(): Promise<TestCoverageAssessment>

  // Restructuring operations
  restructureTestSuite(featureName: string): Promise<TestRestructureResult>
  standardizeTestNaming(): Promise<TestNamingResult>
  generateMissingTests(featureName: string, testTypes: TestType[]): Promise<TestGenerationResult>

  // Validation operations
  validateTestExecution(): Promise<TestExecutionResult>
  verifyTestPatternCompliance(): Promise<TestComplianceResult>
}

export interface TestStructureAnalysis {
  totalTestFiles: number
  featuresWithTests: FeatureTestStatus[]
  testPatternCompliance: TestPatternCompliance
  missingTestTypes: MissingTestReport[]
  organizationScore: number
}

export interface TestPatternValidation {
  currentPattern: TestOrganizationPattern
  targetPattern: TestOrganizationPattern
  requiredRestructuring: TestRestructureOperation[]
  estimatedEffort: TestEffortEstimate
}

export interface TestCoverageAssessment {
  overallCoverage: number
  featureCoverage: FeatureCoverageReport[]
  testTypeDistribution: TestTypeDistribution
  qualityMetrics: TestQualityMetrics
}

export interface TestRestructureResult {
  featureName: string
  status: OperationStatus
  testFilesMoved: number
  testFilesRenamed: number
  testFilesGenerated: number
  errors: TestOperationError[]
}

export interface TestNamingResult {
  filesRenamed: number
  namingStandardApplied: TestNamingStandard
  conflicts: TestNamingConflict[]
  errors: TestOperationError[]
}

export interface TestGenerationResult {
  featureName: string
  testsGenerated: GeneratedTest[]
  templateUsed: string
  customizations: TestCustomization[]
  validationErrors: TestValidationError[]
}

export interface TestExecutionResult {
  totalTests: number
  passingTests: number
  failingTests: number
  skippedTests: number
  executionTime: number
  failureDetails: TestFailure[]
}

export interface TestComplianceResult {
  complianceScore: number
  compliantFeatures: string[]
  nonCompliantFeatures: ComplianceViolation[]
  recommendedActions: TestRecommendation[]
}

// Supporting types
export enum TestType {
  CONTRACT = 'contract',
  UI = 'ui',
  ACCESSIBILITY = 'accessibility',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  UNIT = 'unit'
}

export enum TestOrganizationPattern {
  ABOUT_PAGE_PATTERN = 'about-page-pattern',
  FEATURE_BASED = 'feature-based',
  TYPE_BASED = 'type-based',
  FLAT = 'flat',
  MIXED = 'mixed'
}

export enum OperationStatus {
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILED = 'failed',
  ROLLBACK_REQUIRED = 'rollback_required'
}

export interface FeatureTestStatus {
  featureName: string
  testDirectory: string
  testFiles: TestFileInfo[]
  hasCompletePattern: boolean
  missingTestTypes: TestType[]
}

export interface TestFileInfo {
  name: string
  path: string
  testType: TestType
  testCount: number
  lastModified: Date
  isValidStructure: boolean
}

export interface TestPatternCompliance {
  aboutPagePattern: boolean
  consistentNaming: boolean
  properGrouping: boolean
  completeTestTypes: boolean
  overallScore: number
}

export interface MissingTestReport {
  featureName: string
  missingTypes: TestType[]
  priority: 'high' | 'medium' | 'low'
  estimatedEffort: number
}

export interface TestRestructureOperation {
  type: 'move' | 'rename' | 'split' | 'merge' | 'create'
  source: string
  target?: string
  reason: string
  testType: TestType
}

export interface TestEffortEstimate {
  testFilesAffected: number
  estimatedTimeHours: number
  complexityLevel: 'low' | 'medium' | 'high'
  requiresManualIntervention: boolean
}

export interface FeatureCoverageReport {
  featureName: string
  testTypes: TestType[]
  coveragePercentage: number
  qualityScore: number
  recommendations: string[]
}

export interface TestTypeDistribution {
  contract: number
  ui: number
  accessibility: number
  performance: number
  integration: number
  unit: number
}

export interface TestQualityMetrics {
  averageTestsPerFile: number
  averageTestComplexity: number
  testMaintainabilityScore: number
  duplicateTestLogic: number
}

export interface TestOperationError {
  type: string
  message: string
  testFile?: string
  isRecoverable: boolean
  suggestedFix?: string
}

export interface TestNamingStandard {
  pattern: string
  examples: string[]
  enforceKebabCase: boolean
  includeTestType: boolean
}

export interface TestNamingConflict {
  originalName: string
  suggestedName: string
  conflictReason: string
  resolution: string
}

export interface GeneratedTest {
  fileName: string
  testType: TestType
  testCount: number
  template: string
  customizations: string[]
}

export interface TestCustomization {
  property: string
  value: string
  reason: string
}

export interface TestValidationError {
  fileName: string
  line: number
  message: string
  severity: 'error' | 'warning'
}

export interface TestFailure {
  testName: string
  fileName: string
  message: string
  stack?: string
  canAutoFix: boolean
}

export interface ComplianceViolation {
  featureName: string
  violationType: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface TestRecommendation {
  action: string
  priority: 'high' | 'medium' | 'low'
  description: string
  estimatedImpact: string
  testTypes: TestType[]
}