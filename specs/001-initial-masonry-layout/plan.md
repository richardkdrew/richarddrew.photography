
# Implementation Plan: Initial Masonry Layout

**Branch**: `001-initial-masonry-layout` | **Date**: 2025-09-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/richarddrew/working/portfolio-website/specs/001-initial-masonry-layout/spec.md`

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
Responsive image gallery with column-based masonry layout: 1 column (mobile), 3 columns (tablet), 4+ columns (desktop). Built with Vite + TypeScript for modern development experience, compiled to vanilla HTML/CSS/JavaScript for runtime. Features progressive image loading with WebP+JPEG fallback, smooth CSS-only responsive reflow, and abstracted client API for testing with local images. Plain white interface focusing purely on layout functionality.

## Technical Context
**Language/Version**: TypeScript (latest) compiled to vanilla ES6+ JavaScript, HTML5, CSS3
**Primary Dependencies**: Vite (build tool), TypeScript compiler, native web APIs only
**Storage**: Local image files for testing, abstracted client API interface
**Testing**: Native browser testing, Vitest for unit tests, manual testing scenarios
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: single - frontend-only portfolio website
**Performance Goals**: Smooth responsive reflow, <200ms image load start, 60fps scroll
**Constraints**: No framework dependencies, Makefile-only commands, CSS-only responsive behavior
**Scale/Scope**: Image gallery for portfolio site, ~20-50 test images, responsive breakpoints

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Specification-First**: ✅ PASS
- Feature specification complete with clarifications (Session 2025-09-23)
- All requirements testable and unambiguous
- No implementation details in specification

**II. Test-Driven Development (NON-NEGOTIABLE)**: ✅ PASS
- Plan includes contract tests for responsive breakpoints
- Integration tests for image loading states planned
- TDD workflow: tests → implementation → validation

**III. Feature Documentation**: ✅ PASS
- Implementation plan (this document)
- Research documentation planned (Phase 0)
- Data model and contracts planned (Phase 1)
- Quickstart manual testing scenarios planned

**IV. Systematic Planning**: ✅ PASS
- Following structured Specify framework workflow
- Clear phase breakdown with dependencies
- Task generation approach planned (Phase 2)

**V. Simplicity**: ✅ PASS
- Vanilla JavaScript approach (no framework complexity)
- Focused scope: image gallery only
- Progressive enhancement with modern tooling

**Initial Constitution Check: PASS** - No violations detected, ready for Phase 0.

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

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

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

## Post-Design Constitution Check
*GATE: Re-evaluation after Phase 1 design artifacts*

**I. Specification-First**: ✅ PASS
- Design maintains specification focus without implementation details
- All artifacts derive from original feature requirements

**II. Test-Driven Development (NON-NEGOTIABLE)**: ✅ PASS
- Contract tests specified for ImageClient interface
- Integration tests planned for responsive behavior
- Manual testing scenarios documented in quickstart.md

**III. Feature Documentation**: ✅ PASS
- Complete documentation suite generated: research, data model, contracts, quickstart
- Technical decisions recorded with rationale
- Agent guidance updated with current context

**IV. Systematic Planning**: ✅ PASS
- Clear task generation approach planned for Phase 2
- Dependencies identified between tests and implementation
- Parallel execution opportunities marked

**V. Simplicity**: ✅ PASS
- Design maintains vanilla approach without framework complexity
- TypeScript provides development safety without runtime overhead
- Single responsibility maintained for each component

**Post-Design Constitution Check: PASS** - Ready for Phase 2 task generation.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs and technical requirements
- Setup tasks: Vite + TypeScript + Makefile configuration
- Contract tests for ImageClient interface validation [P]
- Integration tests for responsive breakpoint behavior [P]
- Component implementation tasks following TDD workflow
- CSS and image optimization implementation

**Ordering Strategy**:
- TDD order: Setup → Tests (failing) → Implementation → Validation
- Dependency order: Types → Client → Components → Styling → Integration
- Mark [P] for parallel execution where files are independent
- Makefile commands for each development phase

**Specific Task Categories**:
1. **Setup Phase**: Vite config, TypeScript setup, Makefile, test images
2. **Contract Tests**: ImageClient interface, response validation, error handling
3. **Integration Tests**: Responsive layout, image loading, performance
4. **Type Definitions**: TypeScript interfaces for Image, Gallery, Client
5. **Client Implementation**: LocalImageClient with manifest loading
6. **Component Implementation**: Gallery, Image, Column web components
7. **CSS Implementation**: Grid layout, responsive breakpoints, loading states
8. **Manual Testing**: Quickstart scenarios, cross-browser validation

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

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
- [x] Phase 0: Research complete (/plan command) - research.md generated
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md, CLAUDE.md generated
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - approach documented
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - all 5 principles verified
- [x] Post-Design Constitution Check: PASS - design maintains constitutional compliance
- [x] All NEEDS CLARIFICATION resolved - clarifications session 2025-09-23 complete
- [x] Complexity deviations documented - no deviations detected

**Implementation Plan Status: COMPLETE** - Ready for `/tasks` command

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
