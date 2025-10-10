
# Implementation Plan: Project Maintenance and Cleanup

**Branch**: `004-project-maintenance-and` | **Date**: 2025-09-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/richarddrew/working/portfolio-website/specs/004-project-maintenance-and/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Project maintenance and cleanup feature to establish consistent organizational patterns across the portfolio website codebase. Primary requirements include reorganizing header and gallery components into component-folder structure following about-page patterns, restructuring test suites for consistent grouping and naming, updating constitution to reflect current project state, and adding proper font files and browser/mobile icon assets. Focus on maintainability, clear organization, and following established constitutional principles while ensuring working build and test processes throughout cleanup operations.

## Technical Context
**Language/Version**: TypeScript 5.0+ targeting ES2020
**Primary Dependencies**: Vite (build), Vitest (testing), no external UI frameworks
**Storage**: Static files, local image manifest for development
**Testing**: Vitest with contract, UI, accessibility, and performance test suites
**Target Platform**: Modern browsers (ES2020+), responsive web design
**Project Type**: web - frontend-only portfolio website
**Performance Goals**: <100ms component initialization, 60fps responsive transitions, <200ms image load initiation
**Constraints**: Vanilla web technologies only, CSS-only responsive design, no framework runtime dependencies
**Scale/Scope**: Single developer portfolio site, component-folder architecture, constitutional compliance

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Specification-First**: Feature specification complete with clear requirements
✅ **Test-Driven Development**: TDD approach planned for test restructuring and component reorganization
✅ **Feature Documentation**: Complete planning documentation maintained
✅ **Systematic Planning**: Breaking down into ordered, dependency-aware tasks
✅ **Simplicity**: Maintenance operations follow existing patterns, no new complexity
✅ **Architectural Consistency**: Reorganization follows established component-folder pattern from about-page
✅ **Command Interface**: All operations will use Makefile commands exclusively

**Assessment**: PASS - All constitutional principles aligned with maintenance approach

**Post-Design Re-evaluation**: PASS - Design artifacts maintain constitutional compliance
- Component reorganization follows established about-page pattern
- Test restructuring maintains TDD principles and systematic organization
- Asset management adds value without introducing complexity
- All operations preserve build and test functionality

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) - Portfolio website with component-folder architecture

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate maintenance tasks from Phase 1 design docs and functional requirements
- Constitution update task (prerequisite for all others)
- Component reorganization tasks following about-page pattern
- Test restructuring tasks by feature
- Asset installation and optimization tasks
- Cleanup and validation tasks

**Ordering Strategy**:
- Constitution first (prerequisite for planning alignment)
- Component reorganization (header, gallery) in parallel [P]
- Test restructuring per feature [P]
- Asset management (fonts, icons) [P]
- Final cleanup and validation
- Performance validation throughout

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

**Key Task Categories**:
1. **Constitutional Compliance** (1-2 tasks): Update constitution, validate principles
2. **Component Reorganization** (4-6 tasks): Header and gallery restructuring with validation
3. **Test Restructuring** (4-6 tasks): Reorganize tests by feature following about-page pattern
4. **Asset Management** (4-5 tasks): Font installation, icon generation, optimization
5. **Cleanup Operations** (3-4 tasks): Remove unused files, consolidate configs
6. **Final Validation** (2-3 tasks): Performance verification, integration testing

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
