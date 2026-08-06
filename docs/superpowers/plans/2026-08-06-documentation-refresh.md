# Documentation Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `CLAUDE.md`, `docs/CONSTITUTION.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/BRANCH-PROTECTION.md`, `docs/ARCHITECTURE.md`, and `.github/pull_request_template.md` back into alignment with actual project practice: superpowers-driven planning, tiered process rigor (strict for features, light for fixes), and corrected facts (versioning format, GitHub org, dead links, branch naming).

**Architecture:** This is a documentation-only change — no code, no automated tests. Each task edits one file (or creates one new file) and is independently committable. Verification is manual: grep checks for stale references + a read-through for internal consistency, both defined in Task 9.

**Tech Stack:** Markdown only.

## Global Constraints

- GitHub org/repo is `richardkdrew/richarddrew.photography` (not `richarddrew/richarddrew.photography`) — every doc URL must use this.
- Dev version format: `v{year}.dev-{sha}` (e.g. `v2026.dev-df8dd49`); local/no-VERSION default: `v{year}.dev-local`.
- Prod version format: `v{year}.NNN` sequential counter (e.g. `v2026.004`), incremented by the `tag` job in `deploy-prod.yml` on every push to `main` — **not** semantic versioning, **not** driven by conventional-commit types.
- Current specs/plans location: `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` and `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`. The old `specs/{number}-{name}/spec.md`+`plan.md` format is retired going forward; `specs/001-008/` remain as historical record only.
- Actual branch naming convention (observed in `git branch -r` and this session's own branches): plain `{number}-{short-description}` (e.g. `021-fix-header-scroll-tests`, `022-docs-refresh`) — **not** `feature/{number}-{name}`.
- Tiered process model (defined in full in Task 5, referenced by every other task):
  - **Feature tier** (new components/substantial features): superpowers brainstorm → spec → plan → TDD (4-category tests) → TodoWrite tracking.
  - **Fix tier** (bug fixes, refactors, small changes, docs): tests appropriate to the change, no formal spec/plan/TodoWrite required, straight to commit on a short-lived branch → PR (a PR is always required either way — branch protection allows no direct pushes to `develop` or `main`).
- 90%+ test coverage is stated as a target/aspiration everywhere (matches actual ~99%), never as an "enforced" or "required" CI gate — nothing in `.github/workflows/pr-checks.yml` checks coverage.
- E2E (Playwright) tests only run in CI for PRs targeting `main` (`if: github.base_ref == 'main'` in `pr-checks.yml`), not for PRs targeting `develop`. Any checklist implying e2e runs on every merge must be corrected.

---

## Task 1: Fix `docs/DEPLOYMENT.md` versioning facts

**Files:**
- Modify: `docs/DEPLOYMENT.md`

**Interfaces:** None (docs-only).

- [ ] **Step 1: Read the current versioning section to confirm exact current wording**

Run: `grep -n -A2 "Version format\|semantic version\|conventional commit" docs/DEPLOYMENT.md`

- [ ] **Step 2: Fix the environment overview versioning lines**

Find (near the top, in the environment overview):
```
  - Version format: `dev-{git-sha}` (e.g., `dev-a1b2c3d`)
```
Replace with:
```
  - Version format: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`)
```

Find:
```
  - Version format: Semantic versioning (e.g., `v1.2.3`)
  - Auto-tagging on merge using conventional commits
```
Replace with:
```
  - Version format: `v{year}.NNN` sequential counter (e.g., `v2026.004`)
  - Auto-tagging on every push to `main` (not driven by conventional commit types)
```

- [ ] **Step 3: Fix the dev deployment steps section**

Find:
```
3. Generate version: `dev-{git-sha}` (e.g., `dev-a1b2c3d`)
4. Build with `VERSION` environment variable
```
Replace with:
```
3. Generate version: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`)
4. Build with `VERSION` environment variable
```

- [ ] **Step 4: Fix the prod deployment steps section**

Find:
```
   - Create semantic version tag using conventional commits
   - Initial version: `v1.0.0`
```
Replace with:
```
   - Create sequential `v{year}.NNN` version tag on every push to main
   - Initial version each year: `v{year}.001`
```

Find:
```
   - Build with semantic version (e.g., `v1.2.3`)
```
Replace with:
```
   - Build with the generated version (e.g., `v2026.004`)
```

- [ ] **Step 5: Fix the "Version Injection" / "Version Formats" section**

Find:
```
**Version Formats**:
```
(Read the 3-4 lines directly below this heading to see current listed formats, then replace them with:)
```
**Version Formats**:

- **Dev**: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`) — set by `deploy-dev.yml` on every push to `develop`
- **Prod**: `v{year}.NNN` (e.g., `v2026.004`) — sequential counter set by the `tag` job in `deploy-prod.yml` on every push to `main`
- **Local**: `v{year}.dev-local` (default when `VERSION` env var not set)
```

- [ ] **Step 6: Verify no stale version-format strings remain**

Run: `grep -n "dev-{git-sha}\`\|v1\.2\.3\|v1\.0\.0\|semantic version\|conventional commit" docs/DEPLOYMENT.md`
Expected: no matches (the `` `dev-{git-sha}` `` pattern without the `v{year}.` prefix, and any semantic-version/conventional-commit mentions, should all be gone).

- [ ] **Step 7: Commit**

```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: fix versioning format in DEPLOYMENT.md

Prod versioning is a sequential v{year}.NNN counter, not semantic
versioning driven by conventional commits."
```

---

## Task 2: Fix `docs/ARCHITECTURE.md` versioning facts and dead link

**Files:**
- Modify: `docs/ARCHITECTURE.md`

**Interfaces:** None (docs-only).

- [ ] **Step 1: Fix the "Versioning Strategy" section**

Find:
```
**Conventional Commits**:
- `feat:` → Minor bump (v1.0.0 → v1.1.0)
- `fix:` → Patch bump (v1.0.0 → v1.0.1)
- `feat!:` / `BREAKING CHANGE:` → Major bump (v1.0.0 → v2.0.0)

**Version Injection** (Vite plugin):
```html
<!-- Injected at build time -->
<meta name="version" content="v1.0.0">
<meta name="build-date" content="2025-10-28T12:34:56Z">
```
```
Replace with:
```
**Version Format**:
- **Dev**: `v{year}.dev-{sha}` (e.g. `v2026.dev-df8dd49`) — rebuilt on every push to `develop`
- **Prod**: `v{year}.NNN` (e.g. `v2026.004`) — sequential counter auto-incremented by the `tag` job in `deploy-prod.yml` on every push to `main`. Not semantic versioning, not driven by conventional commit types.
- **Local**: `v{year}.dev-local` (default when `VERSION` env var not set)

**Version Injection** (Vite plugin):
```html
<!-- Injected at build time -->
<meta name="version" content="v2026.004">
<meta name="build-date" content="2025-10-28T12:34:56Z">
```
```

- [ ] **Step 2: Fix the dead `.specify/memory/constitution.md` link**

Find (in the "Constitutional Foundations" section near the top):
```
This architecture implements the principles defined in the project constitution ([`.specify/memory/CONSTITUTION.md`](../.specify/memory/CONSTITUTION.md) v2.0.0).
```
Replace with:
```
This architecture implements the principles defined in the project constitution ([`docs/CONSTITUTION.md`](CONSTITUTION.md) v3.0.0).
```

- [ ] **Step 3: Fix the same dead link in "Additional Resources"**

Find:
```
- **Constitution**: [.specify/memory/constitution.md](../.specify/memory/constitution.md) - Development principles (v2.0.0)
```
Replace with:
```
- **Constitution**: [docs/CONSTITUTION.md](CONSTITUTION.md) - Development principles (v3.0.0)
```

- [ ] **Step 4: Verify no stale references remain**

Run: `grep -n "\.specify\|v1\.0\.0\|v1\.1\.0\|v1\.2\.3\|Conventional Commits" docs/ARCHITECTURE.md`
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: fix versioning strategy and dead constitution link in ARCHITECTURE.md"
```

---

## Task 3: Fix `docs/BRANCH-PROTECTION.md` dead link and wrong org

**Files:**
- Modify: `docs/BRANCH-PROTECTION.md`

**Interfaces:** None (docs-only).

- [ ] **Step 1: Fix the GitHub settings URL**

Find:
```
1. Go to: https://github.com/richarddrew/richarddrew.photography/settings
```
Replace with:
```
1. Go to: https://github.com/richardkdrew/richarddrew.photography/settings
```

- [ ] **Step 2: Fix the dead constitution link**

Find:
```
- [Project Constitution](../.specify/memory/constitution.md)
```
Replace with:
```
- [Project Constitution](CONSTITUTION.md)
```

- [ ] **Step 3: Verify no stale references remain**

Run: `grep -n "\.specify\|github.com/richarddrew/" docs/BRANCH-PROTECTION.md`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add docs/BRANCH-PROTECTION.md
git commit -m "docs: fix dead constitution link and wrong GitHub org in BRANCH-PROTECTION.md"
```

---

## Task 4: Create `specs/README.md` legacy pointer

**Files:**
- Create: `specs/README.md`

**Interfaces:** None (docs-only).

- [ ] **Step 1: Create the file**

Write `specs/README.md`:
```markdown
# Legacy Specs

`specs/001` through `specs/008` are spec-kit-format specs from before the
project switched to superpowers for planning (~feature 012 onward).

Current specs and plans live in:
- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
```

- [ ] **Step 2: Commit**

```bash
git add specs/README.md
git commit -m "docs: add specs/README.md pointing legacy specs to docs/superpowers"
```

---

## Task 5: Rewrite `docs/CONSTITUTION.md` for tiered process model (v3.0.0)

**Files:**
- Modify: `docs/CONSTITUTION.md`

**Interfaces:**
- Produces: the canonical statement of the "tiered process model" (feature tier vs. fix tier) that Tasks 6, 7, and 8 reference and must stay consistent with.

- [ ] **Step 1: Replace the top changelog comment block and version header**

Find (lines 1-27, the HTML comment block plus title/version header):
```
<!--
Constitution Version 2.0.0 - Major Update 2025-10-10

Breaking Changes from v1.3.0:
- Restructured from prescriptive rules to principle-based guidelines
- Added 20 foundational principles based on actual implementation patterns
- Expanded anti-patterns section with concrete examples
- Added comprehensive quality gates and success metrics
- Removed outdated "Recent Feature Completions" section (moved to CLAUDE.md)
- Enhanced browser support strategy with progressive enhancement guidelines
- Added security & privacy principles
- Consolidated template management (inline templates now preferred)

Migration Impact:
- Existing code already compliant (constitution reflects actual practices)
- Future features must follow expanded principle set
- Quality gates now mandatory before commits/features
- Documentation standards raised
- No code changes required (constitution documents current state)
-->

# Portfolio Website Constitution

**Version**: 2.0.0
**Ratified**: 2025-09-23
**Last Amended**: 2025-10-10
**Status**: Active
```
Replace with:
```
<!--
Constitution Version 3.0.0 - Major Update 2026-08-06

Breaking Changes from v2.0.0:
- Replaced the single always-spec-first-always-TDD workflow (Section V)
  with a tiered process model: full rigor (spec/plan/TDD/TodoWrite) for
  new features and components, lighter rigor (tests appropriate to the
  change, direct to commit) for fixes, refactors, and small changes
- Removed Section IX (Documentation Requirements) — superseded by the
  tiered model and CLAUDE.md's task-type router
- Specs/plans now live in docs/superpowers/specs/ and
  docs/superpowers/plans/ (superpowers-driven), not specs/{number}-{name}/
- Softened Principle 5 (TDD), 6 (Spec-First), 9 (Commit Standards),
  10 (Makefile-only), and 16 (TodoWrite) to match actual practice
- Coverage (90%+) restated as an aspirational target, not an enforced
  CI gate — nothing in CI currently checks coverage
- Corrected commit message template to match actual conventional-commit
  usage observed in the git log

Migration Impact:
- No code changes required
- Existing fix-tier commits (small changes without a formal spec) are
  retroactively compliant — they always matched actual practice, just
  not the old constitution's stated rules
- Future feature-tier work should use superpowers brainstorming +
  writing-plans skills rather than manual specs/{number}/ folders
-->

# Portfolio Website Constitution

**Version**: 3.0.0
**Ratified**: 2025-09-23
**Last Amended**: 2026-08-06
**Status**: Active
```

- [ ] **Step 2: Soften Principle 5 (Test-Driven Development)**

Find:
```
### 5. Test-Driven Development (TDD)

Tests MUST be written BEFORE implementation. No exceptions.

**Workflow**: Write tests → Verify failure → Implement → Verify success

**Test Categories** (all mandatory):

```
tests/component-name/
├── component-name-contract.test.ts      # API interfaces, type contracts
├── component-name-ui.test.ts            # User interactions, DOM behavior
├── component-name-accessibility.test.ts # WCAG compliance, keyboard nav
└── component-name-performance.test.ts   # Performance benchmarks
```

**Coverage Minimum**: 90%+ across all test categories.

**Rationale**: TDD prevents regressions, documents behavior, and ensures testability.
```
Replace with:
```
### 5. Test-Driven Development (TDD)

**Feature tier** (new components, substantial features): tests MUST be written before implementation. Write tests → verify failure → implement → verify success, using the 4-category pattern (all mandatory for a new component):

```
tests/component-name/
├── component-name-contract.test.ts      # API interfaces, type contracts
├── component-name-ui.test.ts            # User interactions, DOM behavior
├── component-name-accessibility.test.ts # WCAG compliance, keyboard nav
└── component-name-performance.test.ts   # Performance benchmarks
```

**Fix tier** (bug fixes, refactors, small changes): tests appropriate to the change are required, but not necessarily all 4 categories — e.g. a logic fix inside an existing component's event handler needs a test proving the bug existed and is fixed, not a new performance-test suite.

**Coverage Target**: 90%+ across all test categories (aspirational — actual coverage is typically ~99%; this is not an enforced CI gate).

**Rationale**: TDD prevents regressions, documents behavior, and ensures testability.
```

- [ ] **Step 3: Soften Principle 6 (Specification-First Development)**

Find:
```
### 6. Specification-First Development

Every feature MUST begin with a complete specification. No implementation without approved spec.

**Required Specification Sections**:

- Functional requirements (testable and unambiguous)
- Technical constraints
- Architecture decisions with rationale
- Over-engineering analysis (YAGNI check)
- Success criteria (measurable)

**Specification Format**:

```
specs/[feature-number]-[feature-name]/
├── spec.md           # Complete feature specification
├── plan.md           # Implementation plan with tasks
├── research.md       # Technical research and decisions
├── data-model.md     # TypeScript interfaces and entities
├── quickstart.md     # Manual testing scenarios
└── contracts/        # API contracts for components
```

**Enforcement**: Pull requests without complete specs MUST be rejected.
```
Replace with:
```
### 6. Specification-First Development

**Feature tier** (new components, substantial features): every feature MUST begin with a complete specification via the superpowers `brainstorming` skill, followed by an implementation plan via `writing-plans`. No feature-tier implementation without an approved spec.

**Specification location**:

```
docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md   # Design spec
docs/superpowers/plans/YYYY-MM-DD-<topic>.md          # Implementation plan
```

A good spec covers: functional requirements (testable and unambiguous), technical constraints, architecture decisions with rationale, an over-engineering check (YAGNI), and measurable success criteria.

**Fix tier** (bug fixes, refactors, small changes): no formal spec or plan required. Use the superpowers `systematic-debugging` skill for investigation if the root cause isn't obvious, then implement directly.

**Enforcement**: Feature-tier pull requests without a linked spec and plan MUST be rejected. Fix-tier PRs have no such requirement.
```

- [ ] **Step 4: Soften Principle 9 (Git Commit Standards)**

Find:
```
### 9. Git Commit Standards

Commit messages MUST be descriptive and follow the standard format.

**Commit Message Template**:

```
[Action] [Subject]

## Problem
[What issue was addressed]

## Solution
[How it was solved]

## Technical Details
[Specific changes, line numbers, performance impact]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Requirements**:

- Include performance/technical details where relevant
- Reference line numbers for specific changes
- Document breaking changes
- Never commit without tests passing
```
Replace with:
```
### 9. Git Commit Standards

Commit messages MUST follow Conventional Commits format, matching actual practice in the git log.

**Commit Message Format**:

```
<type>(<scope>): <subject>

<body — optional, explain non-obvious rationale only>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

**Requirements**:

- Subject line is a conventional-commit one-liner (e.g. `fix(header): floor overscroll clamp at 0`)
- Body only when the *why* isn't obvious from the diff — don't restate what changed
- Document breaking changes in the body when relevant
- Never commit without tests passing
```

- [ ] **Step 5: Soften Principle 10 (Makefile Command Interface)**

Find:
```
### 10. Makefile Command Interface

All development commands MUST use the Makefile interface. Direct npm/npx commands are FORBIDDEN.

**Standard Commands**:

```makefile
make dev      # Development server (http://localhost:5173)
make build    # TypeScript compile + Vite production build
make test     # Run Vitest test suite
make preview  # Preview production build
make clean    # Remove dist/ directory
```

**Rationale**: Tool-agnostic abstraction layer ensures consistency and prevents tooling fragmentation.
```
Replace with:
```
### 10. Makefile Command Interface

The Makefile is the standard interface for normal workflows and CI parity.

**Standard Commands**:

```makefile
make dev      # Development server
make build    # TypeScript compile + Vite production build
make test     # Run Vitest test suite (watch mode)
make test-run # Run all tests once + Lighthouse audit (CI/pre-commit gate)
make preview  # Preview production build
make clean    # Remove dist/ directory
```

Direct `npm`/`npx` commands (e.g. `npx vitest run tests/header/`) are fine for targeted debugging — running one test file, one lint rule, isolating a failure — not a violation. Use `make` targets for anything that should match what CI runs.

**Rationale**: Tool-agnostic abstraction layer ensures consistency for standard workflows, without blocking fast iteration during debugging.
```

- [ ] **Step 6: Soften Principle 16 (Task Tracking with TodoWrite)**

Find:
```
### 16. Task Tracking with TodoWrite

TodoWrite tool MUST be used for ALL non-trivial tasks. Real-time updates are MANDATORY.

**Workflow**:

1. Mark task as `"in_progress"` BEFORE starting
2. Mark task as `"completed"` IMMEDIATELY after finishing
3. NO batching - update after each task completion
4. Include task IDs (T001, T002, etc.)
5. Clean up completed tasks when list exceeds 10 items

**Enforcement**: Implementation work without proper tracking is considered INCOMPLETE.
```
Replace with:
```
### 16. Task Tracking with TodoWrite

**Feature tier**: TodoWrite MUST be used to track tasks from the implementation plan. Real-time updates are mandatory.

**Workflow**:

1. Mark task as `"in_progress"` BEFORE starting
2. Mark task as `"completed"` IMMEDIATELY after finishing
3. NO batching - update after each task completion
4. Reference the plan's task identifiers
5. Clean up completed tasks when list exceeds 10 items

**Fix tier**: TodoWrite is optional — use it if a fix breaks down into multiple non-trivial steps worth tracking, skip it for single-step changes.

**Enforcement**: Feature-tier implementation work without proper tracking is considered incomplete.
```

- [ ] **Step 7: Replace Section V (Development Workflow) with the tiered model**

Find the entire Section V, from its heading through the section immediately before Section VI:
```
## V. Development Workflow

All development MUST follow this workflow:

### Phase 1: Specification

1. Create feature specification (`/specify` command or manual)
2. Define functional requirements (testable, unambiguous)
3. Document technical constraints
4. Perform over-engineering check (YAGNI analysis)
5. Get specification approved

### Phase 2: Planning

1. Create implementation plan (`/plan` command or manual)
2. Break feature into numbered tasks
3. Identify dependencies and parallel execution opportunities
4. Define test strategy (contract, UI, a11y, performance)
5. Document architecture decisions

### Phase 3: Test Development

1. Write contract tests (API interfaces, type contracts)
2. Write UI tests (user interactions, DOM behavior)
3. Write accessibility tests (WCAG compliance, keyboard nav)
4. Write performance tests (benchmarks, budgets)
5. **Verify all tests FAIL** (red phase of TDD)

### Phase 4: Implementation

1. Update TodoWrite with all tasks
2. Implement component logic (following TDD red-green-refactor)
3. Implement component styles (CSS custom properties)
4. Implement templates (inline preferred)
5. **Verify all tests PASS** (green phase of TDD)

### Phase 5: Validation

1. Manual testing (quickstart.md scenarios)
2. Cross-browser testing (Chrome, Safari, Firefox, Edge)
3. Performance validation (Lighthouse, Chrome DevTools)
4. Accessibility audit (axe, WAVE, manual keyboard/screen reader)
5. Code quality checks (ESLint, TypeScript strict mode)

### Phase 6: Completion

1. Update documentation (CLAUDE.md, README, comments)
2. Clean up unused files
3. Final TodoWrite update (all tasks completed)
4. Git commit with detailed message
5. Feature branch merge (if applicable)
```
Replace with:
```
## V. Development Workflow

Development follows a **tiered process model**, matched to the size and risk of the change.

### Feature Tier (new components, substantial features)

**Phase 1: Brainstorm & Spec**
1. Use the superpowers `brainstorming` skill to explore the idea through dialogue
2. Write the design spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
3. Get the spec approved

**Phase 2: Plan**
1. Use the superpowers `writing-plans` skill to break the spec into bite-sized tasks
2. Write the plan to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
3. Define test strategy (contract, UI, a11y, performance) per component

**Phase 3: Test-Driven Implementation**
1. Update TodoWrite with all plan tasks
2. Per task: write tests first, verify failure (red), implement, verify success (green)
3. Follow the 4-category test pattern for new components

**Phase 4: Validation**
1. Manual testing across viewports
2. Cross-browser testing (Chrome, Safari, Firefox, Edge)
3. Performance validation (Lighthouse, Chrome DevTools)
4. Accessibility audit (axe, WAVE, manual keyboard/screen reader)

**Phase 5: Completion**
1. Update documentation (CLAUDE.md if patterns changed)
2. Final TodoWrite update (all tasks completed)
3. Commit, push to a short-lived branch, open PR to `develop`

### Fix Tier (bug fixes, refactors, small changes)

1. If the root cause isn't obvious, use the superpowers `systematic-debugging` skill to investigate before proposing a fix
2. Write a test that reproduces the bug (or covers the change) and verify it fails
3. Implement the fix
4. Verify the test passes and the full suite still passes (`make test-run`)
5. Commit with a conventional-commit message, push to a short-lived branch, open PR to `develop`

No formal spec, plan, or TodoWrite tracking is required for fix-tier work — matching how bug fixes actually happen in this codebase (e.g. the header overscroll-clamp fix on 2026-08-06, which went straight from investigation to a committed fix with updated tests, no spec or plan involved).

### Both Tiers

- Branch protection requires a PR either way — there is no direct-commit path to `develop` or `main` for anyone but admins in emergencies.
- Branch naming: `{number}-{short-description}` off `develop` (e.g. `022-docs-refresh`).
```

- [ ] **Step 8: Remove Section IX (Documentation Requirements)**

Find the entire Section IX, from its heading through the section's end (immediately before "**End of Constitution v2.0.0**"):
```
## IX. Documentation Requirements

### Purpose

This section defines **MANDATORY** documentation reading requirements based on task type. Compliance ensures constitutional principles are understood and followed.

### Required Reading by Task Type

#### Task Type 1: Feature Implementation

**Triggers**: Adding new features, creating components, implementing functionality

**MUST READ** (non-negotiable):

1. **constitution.md** - Sections I-III (Foundational Principles, Anti-Patterns, Quality Gates)
2. **DEVELOPMENT.md** - Sections 1-7 (Quick Start through Quality Gates)
3. **CLAUDE.md** - Current Status section (understand completed features, current work)

**Rationale**: Feature implementation affects architecture and must follow all constitutional principles including specification-first development, TDD, and TodoWrite tracking.

**Enforcement**:
- TodoWrite tracking MUST reference task IDs from plan.md (proves spec exists)
- Tests MUST follow 4-category pattern (proves DEVELOPMENT.md was read)
- PR template MUST confirm documentation compliance

#### Task Type 2: Bug Fix / Investigation

**Triggers**: Fixing bugs, debugging errors, investigating issues

**MUST READ** (non-negotiable):

1. **ARCHITECTURE.md** - Sections 1-5 (Quick Reference through Testing Infrastructure)
2. **DEVELOPMENT.md** - Sections 8-10 (Common Tasks through Troubleshooting)
3. **CLAUDE.md** - Current Status section

**Rationale**: Bug fixes require understanding system architecture and established troubleshooting patterns.

**Enforcement**:
- Investigation MUST reference architectural patterns
- Fixes MUST include tests proving bug existed and is resolved
- PR template MUST confirm documentation compliance

#### Task Type 3: Codebase Exploration

**Triggers**: Understanding how things work, code review, learning the system

**MUST READ** (non-negotiable):

1. **ARCHITECTURE.md** - Complete file (comprehensive system understanding)
2. **CLAUDE.md** - Current Status section

**Rationale**: Exploration tasks require complete architectural context to provide accurate explanations.

**Enforcement**:
- Explanations MUST reference specific architectural sections
- Code examples MUST follow established patterns

#### Task Type 4: Deployment / Operations

**Triggers**: Deployment changes, CI/CD updates, infrastructure modifications

**MUST READ** (non-negotiable):

1. **deployment.md** - Complete file (deployment procedures and architecture)
2. **ARCHITECTURE.md** - Section 11 (Deployment Architecture)
3. **CLAUDE.md** - Current Status section

**Rationale**: Deployment changes affect production systems and require complete operational context.

**Enforcement**:
- Changes MUST preserve existing deployment patterns
- Updates MUST include rollback procedures
- PR template MUST confirm documentation compliance

### Acknowledgment Requirement

Before proceeding with any task, AI assistants MUST state:

```
I have read [list of documentation]. I understand [2-3 key principles relevant to task type].
```

**Example for Feature Implementation**:
> "I have read constitution.md (Sections I-III), DEVELOPMENT.md (Sections 1-7), and CLAUDE.md (Current Status). I understand: (1) Specification-first development is mandatory, (2) TDD with 4-category tests is required, (3) TodoWrite tracking with task IDs is non-negotiable."

### Workflow Artifacts as Proof

The following artifacts serve as **proof** that required documentation was read:

1. **spec.md exists** → Proves constitution Principle 6 (Specification-First) was followed
2. **plan.md with task IDs** → Proves systematic planning was followed
3. **4-category tests** → Proves DEVELOPMENT.md testing requirements were read
4. **TodoWrite with task IDs** → Proves constitution Principle 16 was followed
5. **PR checklist completed** → Final verification gate

### Governance

These documentation requirements are **constitutional mandates**. They cannot be bypassed or negotiated.

**Amendment Process**: Changes to documentation requirements follow standard constitutional amendment process (Section VII).

**Version**: Documentation requirements established 2025-10-28 as part of constitution v2.0.0.

---
```
Replace with:
```
## IX. Documentation Requirements

Superseded by `CLAUDE.md`'s task-type router, which is the current source of truth for which docs to read before starting a given kind of task, and by the tiered process model in Section V for which superpowers skill to invoke. See `CLAUDE.md` directly rather than duplicating its routing table here.

---
```

- [ ] **Step 9: Fix the footer version references**

Find:
```
**End of Constitution v2.0.0**

*This constitution represents the distilled wisdom of successful implementations. Follow these principles, and the code will be maintainable, performant, and accessible.*
```
Replace with:
```
**End of Constitution v3.0.0**

*This constitution represents the distilled wisdom of successful implementations. Follow these principles, and the code will be maintainable, performant, and accessible.*
```

- [ ] **Step 10: Verify no stale references remain**

Run: `grep -n "specs/\[feature-number\]\|specs/009\|/specify command\|/plan command\|v2\.0\.0\|FORBIDDEN\|non-negotiable" docs/CONSTITUTION.md`
Expected: no matches for the old spec path or slash-commands; any remaining "v2.0.0" or "FORBIDDEN"/"non-negotiable" hits should be reviewed — some uses of "non-negotiable" for genuinely still-mandatory things (e.g. accessibility) are fine and should stay; only the process-mandate ones from principles 5/6/9/10/16 needed softening.

- [ ] **Step 11: Commit**

```bash
git add docs/CONSTITUTION.md
git commit -m "docs: rewrite CONSTITUTION.md for tiered process model (v3.0.0)

Replace the always-spec-first-always-TDD model with feature-tier vs
fix-tier rigor, matching actual practice. Point specs/plans at
docs/superpowers/, soften Makefile-only and TodoWrite mandates,
restate coverage as a target not a gate, fix commit template to match
actual conventional-commit usage."
```

---

## Task 6: Rewrite `docs/DEVELOPMENT.md` for tiered process model and fixed facts

**Files:**
- Modify: `docs/DEVELOPMENT.md`

**Interfaces:**
- Consumes: the tiered process model defined in Task 5, Step 7 (must describe the same two tiers consistently).

- [ ] **Step 1: Fix the wrong GitHub org in the clone URL**

Find:
```
git clone https://github.com/richarddrew/richarddrew.photography.git
```
Replace with:
```
git clone https://github.com/richardkdrew/richarddrew.photography.git
```

- [ ] **Step 2: Fix the dead constitution link in "About This Documentation"**

Find:
```
- **[CONSTITUTION.md](../.specify/memory/CONSTITUTION.md)**: **WHY** we do things this way (principles, philosophy)
```
Replace with:
```
- **[CONSTITUTION.md](CONSTITUTION.md)**: **WHY** we do things this way (principles, philosophy)
```

- [ ] **Step 3: Fix the dead constitution link in "Constitutional Requirements" and update the summary to the tiered model**

Find:
```
## Constitutional Requirements (MANDATORY)

Before writing ANY code, read: [`.specify/memory/CONSTITUTION.md`](../.specify/memory/CONSTITUTION.md)

### Core Principles

1. **Specification-First Development**
   - Feature spec MUST exist before implementation
   - User stories, acceptance criteria, requirements documented
   - Plan with task breakdown and dependencies

2. **Test-Driven Development (TDD)**
   - Write tests → verify failure → implement → verify success
   - 4-category test pattern: Contract, UI, Accessibility, Performance
   - 90%+ test coverage non-negotiable

3. **Vanilla-First Architecture**
   - No framework dependencies (React, Vue, Angular, etc.)
   - TypeScript is compile-time only
   - Web Components for modularity
   - Native Web APIs preferred

4. **TodoWrite Tracking**
   - ALL tasks from plan.md tracked
   - Mark "in_progress" BEFORE starting
   - Mark "completed" IMMEDIATELY after finishing
   - NO BATCHING - update after each task

5. **Performance as Non-Negotiable**
   - 60fps animations (transform/opacity only)
   - <50KB initial JS bundle (gzipped)
   - IntersectionObserver for lazy loading
   - Lighthouse 95+ on all metrics

6. **Accessibility-First**
   - WCAG AA minimum (AAA where feasible)
   - Keyboard navigation for all interactions
   - Focus management in modals
   - Screen reader tested
```
Replace with:
```
## Constitutional Requirements

Before writing feature-tier code, read: [`docs/CONSTITUTION.md`](CONSTITUTION.md)

### Core Principles

1. **Specification-First Development (feature tier only)**
   - New components/substantial features: spec via superpowers `brainstorming`, plan via `writing-plans`, both in `docs/superpowers/`
   - Fixes/refactors/small changes: no formal spec required

2. **Test-Driven Development (TDD)**
   - Feature tier: write tests → verify failure → implement → verify success, 4-category pattern (Contract, UI, Accessibility, Performance)
   - Fix tier: tests appropriate to the change (at minimum, a test proving the bug existed and is fixed)
   - 90%+ test coverage is the target (not an enforced CI gate)

3. **Vanilla-First Architecture**
   - No framework dependencies (React, Vue, Angular, etc.)
   - TypeScript is compile-time only
   - Web Components for modularity
   - Native Web APIs preferred

4. **TodoWrite Tracking (feature tier)**
   - Feature-tier tasks from the plan tracked in TodoWrite
   - Mark "in_progress" BEFORE starting
   - Mark "completed" IMMEDIATELY after finishing
   - NO BATCHING - update after each task
   - Optional for fix-tier work

5. **Performance as Non-Negotiable**
   - 60fps animations (transform/opacity only)
   - <50KB initial JS bundle (gzipped)
   - IntersectionObserver for lazy loading
   - Lighthouse 95+ on all metrics

6. **Accessibility-First**
   - WCAG AA minimum (AAA where feasible)
   - Keyboard navigation for all interactions
   - Focus management in modals
   - Screen reader tested
```

- [ ] **Step 4: Replace the Phase 1 spec/plan directory creation and templates with the superpowers convention**

Find:
```
## Development Workflow

### Phase 1: Specification (Before Code)

#### Step 1: Create Feature Spec

```bash
# Create spec directory (numbered sequentially)
mkdir -p specs/009-feature-name
cd specs/009-feature-name

# Create required files
touch spec.md plan.md
```

#### spec.md Template

```markdown
# Feature Specification: {Feature Name}

**Feature Branch**: `009-feature-name`
**Created**: 2025-10-28
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - {Story Title} (Priority: P1)

As a {user type}, when I {action}, I want {outcome} so that {benefit}.

**Why this priority**: {Justification}

**Independent Test**: {How to verify in isolation}

**Acceptance Scenarios**:
1. **Given** {context}, **When** {action}, **Then** {outcome}
2. **Given** {context}, **When** {action}, **Then** {outcome}

---

## Requirements

### Functional Requirements
- **FR-001**: System MUST {requirement}
- **FR-002**: System MUST {requirement}

### Key Entities
- **Entity Name**: {Description, properties, behavior}

## Success Criteria
- **SC-001**: {Measurable outcome with metrics}
- **SC-002**: {Measurable outcome with metrics}
```

#### plan.md Template

```markdown
# Implementation Plan: {Feature Name}

**Feature**: {One-line description}
**Branch**: `009-feature-name`
**Status**: Planning

## Technical Stack
- **Dependencies**: {List new dependencies if any}
- **Components**: {List new/modified components}
- **Files to Create**: {List}
- **Files to Modify**: {List}

## Implementation Tasks

### Phase 1: Foundation (T001-T003)

**T001**: {Task description}
- {Implementation details}
- **Dependencies**: None
- **Acceptance**: {How to verify completion}

**T002**: {Task description}
- {Implementation details}
- **Dependencies**: T001
- **Acceptance**: {How to verify completion}

## Success Metrics
- **SM-001**: {Metric with target value}

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| {Risk} | {High/Med/Low} | {Mitigation strategy} |
```
```
Replace with:
```
## Development Workflow

This section covers **feature-tier** work (new components, substantial features). For fix-tier work (bug fixes, refactors, small changes), skip straight to implementation with appropriate tests — see [CONSTITUTION.md Section V](CONSTITUTION.md) for the full tiered model.

### Phase 1: Specification (Before Code)

#### Step 1: Brainstorm and Write the Spec

Use the superpowers `brainstorming` skill — it walks through clarifying questions, proposes approaches, and writes the resulting design to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. A good spec covers: problem statement, scope (in/out), architecture, and success criteria. See existing examples in `docs/superpowers/specs/` for the expected level of detail.

#### Step 2: Plan the Implementation

Use the superpowers `writing-plans` skill to turn the approved spec into a task-by-task implementation plan at `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`. Each task should be independently testable and specify exact files, interfaces, and test steps — see existing examples in `docs/superpowers/plans/`.
```

- [ ] **Step 5: Note the TodoWrite example in Phase 3 is feature-tier-only**

Find:
```
### Phase 3: Implementation

#### Step 5: Use TodoWrite Tool

**BEFORE starting any task**:
```
Replace with:
```
### Phase 3: Implementation

#### Step 5: Use TodoWrite Tool (feature tier)

**BEFORE starting any task**:
```

- [ ] **Step 6: Fix the coverage wording in Phase 4 verification**

Find:
```
# Verify coverage (90%+ required)
make test-coverage
```
Replace with:
```
# Verify coverage (90%+ target)
make test-coverage
```

- [ ] **Step 7: Fix branch naming and drop the duplicate embedded PR template in Phase 5**

Find:
```
### Phase 5: Pull Request

#### Step 10: Create Feature Branch

```bash
# Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/009-feature-name

# Commit changes (conventional commits)
git add .
git commit -m "feat: add feature name with full implementation"
git push origin feature/009-feature-name
```

#### Step 11: Open Pull Request

**PR Template**:

```markdown
## Summary
Implements feature {name} as specified in specs/009-feature-name/spec.md

## Changes
- ✅ Created FeatureName Web Component
- ✅ Added 4 test suites (23 tests, 95.8% coverage)
- ✅ Updated main.ts to register component
- ✅ WCAG AA compliant
- ✅ 60fps animations

## Testing
- [ ] All tests passing (make test-run)
- [ ] 90%+ coverage (make test-coverage)
- [ ] Manual testing (desktop/tablet/mobile)
- [ ] Keyboard navigation verified
- [ ] Screen reader tested

## Screenshots
[Attach screenshots of feature]

## Related
- Spec: specs/009-feature-name/spec.md
- Plan: specs/009-feature-name/plan.md
```

#### Step 12: Wait for CI Checks

GitHub Actions runs automatically:
- ✅ Tests (Vitest)
- ✅ Build (TypeScript + Vite)
- ✅ Accessibility (dedicated a11y tests)
- ✅ E2E (Playwright)

**All must pass before merge.**
```
Replace with:
```
### Phase 5: Pull Request

#### Step 10: Create Feature Branch

```bash
# Create branch from develop
git checkout develop
git pull origin develop
git checkout -b 009-feature-name

# Commit changes (conventional commits)
git add .
git commit -m "feat: add feature name with full implementation"
git push origin 009-feature-name
```

#### Step 11: Open Pull Request

Use the repo's PR template (`.github/pull_request_template.md`) — it's pre-filled automatically when you open a PR on GitHub. Link the spec and plan under "For Feature-tier work only".

#### Step 12: Wait for CI Checks

GitHub Actions runs automatically on every PR:
- ✅ Tests (Vitest)
- ✅ Build (TypeScript + Vite)
- ✅ Accessibility (dedicated a11y tests)
- ✅ E2E (Playwright) — **only for PRs targeting `main`**, not `develop`

**All applicable jobs must pass before merge.**
```

- [ ] **Step 8: Fix branch naming in the Branch Strategy diagram and rules**

Find:
```
## Git Workflow

### Branch Strategy

```
main (production)
  ↑
  PR (after QA)
  ↑
develop (staging)
  ↑
  PR
  ↑
feature/009-feature-name (feature work)
```

### Branch Rules

**`main`** (Production):
- Protected branch
- Requires PR approval
- Requires passing CI checks (tests, build, a11y, e2e)
- Linear history enforced
- Triggers production deployment + auto-tag

**`develop`** (Staging):
- Protected branch
- Requires PR approval
- Requires passing CI checks
- Triggers staging deployment

**`feature/{number}-{name}`** (Feature work):
- Created from `develop`
- Naming: `feature/009-dark-mode-toggle`
- Delete after merge
```
Replace with:
```
## Git Workflow

### Branch Strategy

```
main (production)
  ↑
  PR (after QA)
  ↑
develop (staging)
  ↑
  PR
  ↑
{number}-{short-description} (feature/fix work)
```

### Branch Rules

**`main`** (Production):
- Protected branch
- Requires PR approval
- Requires passing CI checks (tests, build, a11y, e2e)
- Linear history enforced
- Triggers production deployment + auto-tag

**`develop`** (Staging):
- Protected branch
- Requires PR approval
- Requires passing CI checks (tests, build, a11y — e2e only applies to PRs targeting main)
- Triggers staging deployment

**`{number}-{short-description}`** (Feature/fix work):
- Created from `develop`
- Naming: `022-docs-refresh`, `021-fix-header-scroll-tests` — plain numeric prefix, no `feature/` path segment
- Delete after merge
```

- [ ] **Step 9: Fix the versioning claim in "Commit Message Format"**

Find:
```
**Conventional Commits** (for semantic versioning):

```bash
# Feature (minor bump: v1.0.0 → v1.1.0)
feat: add dark mode toggle to header

# Bug fix (patch bump: v1.0.0 → v1.0.1)
fix: resolve image lazy loading race condition

# Breaking change (major bump: v1.0.0 → v2.0.0)
feat!: redesign gallery layout with new API

# Other types (no version bump)
docs: update README with setup instructions
chore: upgrade Vite to 5.1.0
refactor: extract image utils to separate module
test: add missing accessibility tests for gallery
```
```
Replace with:
```
**Conventional Commits** (readability and changelog clarity — production versioning is a separate sequential counter, not derived from commit type):

```bash
feat: add dark mode toggle to header
fix: resolve image lazy loading race condition
feat!: redesign gallery layout with new API
docs: update README with setup instructions
chore: upgrade Vite to 5.1.0
refactor: extract image utils to separate module
test: add missing accessibility tests for gallery
```
```

- [ ] **Step 10: Fix branch naming in "PR Process" and "Deployment Flow"**

Find:
```
### Deployment Flow

```
feature/009-feature-name
  ↓ (merge PR)
develop branch
```
Replace with:
```
### Deployment Flow

```
{number}-{short-description}
  ↓ (merge PR)
develop branch
```

- [ ] **Step 11: Fix coverage wording in "Test Coverage Requirements"**

Find:
```
### Test Coverage Requirements

**Minimum**: 90%
**Target**: 95%+
**Current**: 98.9%
```
Replace with:
```
### Test Coverage Requirements

**Target**: 90%+ (aspirational, not an enforced CI gate)
**Stretch**: 95%+
**Current**: ~99%
```

- [ ] **Step 12: Scope the TodoWrite Usage section to feature tier**

Find:
```
## TodoWrite Usage

### Constitutional Requirement

**ALL tasks from plan.md MUST be tracked using TodoWrite tool.**
```
Replace with:
```
## TodoWrite Usage

### Constitutional Requirement (feature tier)

**Feature-tier tasks from the implementation plan MUST be tracked using the TodoWrite tool.** Fix-tier work (bug fixes, refactors, small changes) doesn't require it, though it's fine to use for a fix that breaks down into several non-trivial steps.
```

- [ ] **Step 13: Fix the Pre-PR and Pre-Merge checklists**

Find:
```
### Pre-PR Checklist

Before opening pull request:

- [ ] All tests passing (`make test-run`)
- [ ] 90%+ coverage (`make test-coverage`)
- [ ] Accessibility tests passing (`make test-a11y`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Manual testing complete (desktop/tablet/mobile)
- [ ] Keyboard navigation verified
- [ ] Lighthouse scores 95+ (Performance, A11y, Best Practices, SEO)
- [ ] No layout jitter during resize
- [ ] Spec and plan files exist (if new feature)
- [ ] CLAUDE.md updated (if new patterns added)

### Pre-Merge Checklist

Before merging to develop/main:

- [ ] CI checks passing (all 4 jobs: test, build, a11y, e2e)
- [ ] Code review approved (if required)
- [ ] TodoWrite tasks completed
- [ ] Documentation updated
- [ ] No merge conflicts
```
Replace with:
```
### Pre-PR Checklist

Before opening pull request:

- [ ] All tests passing (`make test-run`)
- [ ] Coverage still near target (`make test-coverage`) — not a hard gate, but don't regress it
- [ ] Accessibility tests passing (`make test-a11y`)
- [ ] E2E tests passing (`npm run test:e2e`) — only relevant if targeting `main`
- [ ] Manual testing complete (desktop/tablet/mobile)
- [ ] Keyboard navigation verified
- [ ] Lighthouse scores 95+ (Performance, A11y, Best Practices, SEO)
- [ ] No layout jitter during resize
- [ ] Spec and plan linked (feature-tier only — see `docs/superpowers/specs/` and `docs/superpowers/plans/`)
- [ ] CLAUDE.md updated (if new patterns added)

### Pre-Merge Checklist

Before merging to develop/main:

- [ ] CI checks passing (test, build, a11y always; e2e only for PRs targeting main)
- [ ] Code review approved (if required)
- [ ] TodoWrite tasks completed (feature-tier only)
- [ ] Documentation updated
- [ ] No merge conflicts
```

- [ ] **Step 14: Fix branch naming and spec path in "Common Development Tasks" → Task 2**

Find:
```
### Task 2: Add a New Feature

```bash
# 1. Create spec directory
mkdir -p specs/009-feature-name
cd specs/009-feature-name
touch spec.md plan.md

# 2. Write specification
# Edit spec.md: user stories, requirements, success criteria
# Edit plan.md: tasks, dependencies, risks

# 3. Create feature branch
git checkout -b feature/009-feature-name develop

# 4. Follow TDD workflow
# - Write tests
# - Verify failure
# - Implement
# - Verify success
# - Use TodoWrite to track

# 5. Create PR
git add .
git commit -m "feat: add feature name"
git push origin feature/009-feature-name
```
```
Replace with:
```
### Task 2: Add a New Feature

```bash
# 1. Brainstorm and write the spec (superpowers brainstorming skill)
#    Writes to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md

# 2. Plan the implementation (superpowers writing-plans skill)
#    Writes to docs/superpowers/plans/YYYY-MM-DD-<topic>.md

# 3. Create feature branch
git checkout -b 009-feature-name develop

# 4. Follow TDD workflow
# - Write tests
# - Verify failure
# - Implement
# - Verify success
# - Use TodoWrite to track

# 5. Create PR
git add .
git commit -m "feat: add feature name"
git push origin 009-feature-name
```
```

- [ ] **Step 15: Verify no stale references remain**

Run: `grep -n "\.specify\|richarddrew/richarddrew\|specs/009\|specs/\[feature\|feature/{number}\|feature/009\|90%+ required\|90%+ non-negotiable" docs/DEVELOPMENT.md`
Expected: no matches.

- [ ] **Step 16: Commit**

```bash
git add docs/DEVELOPMENT.md
git commit -m "docs: rewrite DEVELOPMENT.md for tiered process model and fixed facts

Point spec/plan workflow at docs/superpowers/, fix branch naming
convention (plain {number}-{name}, no feature/ prefix), fix wrong
GitHub org, dead constitution link, coverage-as-gate language, and
the semantic-versioning claim in the commit format section."
```

---

## Task 7: Rewrite `.github/pull_request_template.md`

**Files:**
- Modify: `.github/pull_request_template.md`

**Interfaces:**
- Consumes: the tiered model from Task 5 (feature-tier spec/plan links only required for feature-tier PRs).

- [ ] **Step 1: Replace the entire file contents**

Replace the full file with:
```markdown
# Pull Request

## Description

<!-- What changed and why -->

## Type

<!-- Check ONE -->

- [ ] Feature (new component/functionality)
- [ ] Fix (bug fix, refactor, small change)
- [ ] Chore (docs, deps, tooling)

## For Feature-tier work only

- [ ] Spec: `docs/superpowers/specs/...`
- [ ] Plan: `docs/superpowers/plans/...`

## Checklist

- [ ] Tests pass locally (`make test-run`)
- [ ] Build succeeds (`make build`)
- [ ] Accessibility checked where relevant (`make test-a11y`)
- [ ] Screenshots attached for UI changes

## Testing notes

<!-- How to verify this manually, if relevant -->

## Related issues/PRs

<!-- Links, if any -->
```

- [ ] **Step 2: Commit**

```bash
git add .github/pull_request_template.md
git commit -m "docs: simplify PR template to match tiered process model

Replace the spec-kit compliance checklist (section-reference
acknowledgments, TodoWrite screenshots) with a template matching
actual review practice."
```

---

## Task 8: Rewrite `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the tiered model and file names from Tasks 5-7 (points readers at the refreshed docs).

- [ ] **Step 1: Confirm the branch this work is landing on**

Run: `git branch --show-current`
Expected: `022-docs-refresh` (this plan's own branch). If a different branch is checked out, use that branch's name in Step 2 instead.

- [ ] **Step 2: Update the header and task-type routing to mention superpowers skills**

Find:
```
# Claude Code Quick Start

**Last Updated**: 2025-10-28
**Current Branch**: 008-add-build-actions
**Latest Feature**: Feature 007 Complete ✅
**Constitution**: v2.0.0
```
Replace with:
```
# Claude Code Quick Start

**Last Updated**: 2026-08-06
**Current Branch**: 022-docs-refresh
**Constitution**: v3.0.0
```

- [ ] **Step 3: Add superpowers skill mentions to each task type**

Find:
```
### Task Type 1: Feature Implementation

**Triggers**: User says "add", "create", "implement", "build new feature"
**Example**: "Add dark mode toggle to the header"

**MANDATORY - Read Before ANY Work**:

1. ✅ [CONSTITUTION.md](docs/CONSTITUTION.md) - Sections I-III (Principles, Anti-Patterns, Quality Gates)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 1-7 (Quick Start → Quality Gates)
3. ✅ CLAUDE.md (this file) - Current Status section

**BEFORE PROCEEDING**: State "I have read [list]. I understand: (1) Specification-first is mandatory, (2) TDD with 4-category tests is required, (3) TodoWrite tracking with task IDs is non-negotiable."

### Task Type 2: Bug Fix / Investigation

**Triggers**: User says "fix", "bug", "error", "broken", "not working"
**Example**: "Fix the navigation menu on mobile"

**MANDATORY - Read Before ANY Work**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Sections 1-5 (Quick Reference → Testing Infrastructure)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 8-10 (Common Tasks → Troubleshooting)
3. ✅ CLAUDE.md (this file) - Current Status section

**BEFORE PROCEEDING**: State "I have read [list]. I understand the component architecture and troubleshooting approach."
```
Replace with:
```
### Task Type 1: Feature Implementation

**Triggers**: User says "add", "create", "implement", "build new feature"
**Example**: "Add dark mode toggle to the header"

**Start with**: the `superpowers:brainstorming` skill — it drives the spec/plan process described in [CONSTITUTION.md](docs/CONSTITUTION.md) Section V (feature tier).

**Read before starting**:

1. ✅ [CONSTITUTION.md](docs/CONSTITUTION.md) - Sections I-III (Principles, Anti-Patterns, Quality Gates) and Section V (feature-tier workflow)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 1-7 (Quick Start → Quality Gates)
3. ✅ CLAUDE.md (this file) - Current Status section

### Task Type 2: Bug Fix / Investigation

**Triggers**: User says "fix", "bug", "error", "broken", "not working"
**Example**: "Fix the navigation menu on mobile"

**Start with**: the `superpowers:systematic-debugging` skill if the root cause isn't already obvious — find root cause before proposing a fix.

**Read before starting**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Sections 1-5 (Quick Reference → Testing Infrastructure)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 8-10 (Common Tasks → Troubleshooting)
3. ✅ CLAUDE.md (this file) - Current Status section

This is fix-tier work per [CONSTITUTION.md](docs/CONSTITUTION.md) Section V — no formal spec/plan required, tests appropriate to the fix, straight to a PR.
```

- [ ] **Step 4: Update Task Type 3 and 4 headers to drop the "MANDATORY"/acknowledgment framing**

Find:
```
### Task Type 3: Codebase Exploration

**Triggers**: User says "how does", "explain", "show me", "where is"
**Example**: "How does the image viewer component work?"

**MANDATORY - Read Before ANY Work**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Complete file (understand system structure)
2. ✅ CLAUDE.md (this file) - Current Status section

**BEFORE PROCEEDING**: State "I have read ARCHITECTURE.md. I understand the system structure."

### Task Type 4: Deployment / Operations

**Triggers**: User says "deploy", "CI/CD", "GitHub Actions", "Cloudflare"
**Example**: "Update the deployment workflow"

**MANDATORY - Read Before ANY Work**:

1. ✅ [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Complete file
2. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Section 11 (Deployment Architecture)
3. ✅ CLAUDE.md (this file) - Current Status section

**BEFORE PROCEEDING**: State "I have read [list]. I understand the deployment architecture and workflows."
```
Replace with:
```
### Task Type 3: Codebase Exploration

**Triggers**: User says "how does", "explain", "show me", "where is"
**Example**: "How does the image viewer component work?"

**Read before starting**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Complete file (understand system structure)
2. ✅ CLAUDE.md (this file) - Current Status section

### Task Type 4: Deployment / Operations

**Triggers**: User says "deploy", "CI/CD", "GitHub Actions", "Cloudflare"
**Example**: "Update the deployment workflow"

**Read before starting**:

1. ✅ [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Complete file
2. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Section 11 (Deployment Architecture)
3. ✅ CLAUDE.md (this file) - Current Status section
```

- [ ] **Step 5: Update Current Status with actual recent history**

Find:
```
## ✅ Current Status

### Completed Features (7)

- ✅ **Masonry Gallery** - Responsive, lazy loading, 5-breakpoint system
- ✅ **Full-Screen Image Viewer** - White overlay, visual navigation, keyboard controls
- ✅ **Dark Mode** - WCAG AA, localStorage persistence, FOUC prevention
- ✅ **Responsive Images** - WebP/JPEG, srcset, LQIP blur placeholders
- ✅ **PWA** - Service worker, offline, installable
- ✅ **About Page** - Hero layout, responsive
- ✅ **CI/CD** - GitHub Actions, Cloudflare Pages, automated deployments

### Current Work
- **Branch**: 008-add-build-actions
- **Status**: Complete, ready to merge
- **Next**: Merge to develop → QA → production (v1.0.0)
```
Replace with:
```
## ✅ Current Status

### Completed Features

- ✅ **Masonry / Uniform Gallery** - Responsive, lazy loading, scroll-reveal animation
- ✅ **Full-Screen Image Viewer** - Lightbox, keyboard navigation, swipe support
- ✅ **Dark Mode** - WCAG AA, localStorage persistence, FOUC prevention
- ✅ **Responsive Images** - WebP/JPEG, srcset, LQIP blur placeholders
- ✅ **PWA** - Service worker, offline, installable
- ✅ **About Page** - Hero layout, responsive
- ✅ **Smart Header** - Scroll hide/show, active nav link underline
- ✅ **Footer** - Dark Room / Light Box theme toggle
- ✅ **404 Page** - Photography-themed redesign
- ✅ **CI/CD** - GitHub Actions, Cloudflare Pages, dual-environment deploys

### Current Work
- **Branch**: 022-docs-refresh (this documentation refresh)
- **In progress**: `015-photo-mcp-server` (Python FastMCP server for R2 photo uploads, rebased onto current develop 2026-08-06, not yet merged)
```

- [ ] **Step 6: Verify no stale references remain**

Run: `grep -n "008-add-build-actions\|Feature 007\|v2\.0\.0" CLAUDE.md`
Expected: no matches (except any deliberately-kept historical mention, which there shouldn't be after this rewrite).

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: refresh CLAUDE.md current status and task-type routing

Fix stale current-branch/recent-changes (unchanged since Oct 2025),
add superpowers skill pointers per task type, bump constitution
version reference to v3.0.0."
```

---

## Task 9: Final verification pass

**Files:** None created or modified — read-only verification across all files touched in Tasks 1-8.

- [ ] **Step 1: Grep for dead `.specify` references across all changed files**

Run: `grep -rn "\.specify" CLAUDE.md docs/CONSTITUTION.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md docs/BRANCH-PROTECTION.md docs/ARCHITECTURE.md .github/pull_request_template.md specs/README.md`
Expected: no matches.

- [ ] **Step 2: Grep for the wrong GitHub org across all changed files**

Run: `grep -rn "richarddrew/richarddrew\.photography" CLAUDE.md docs/CONSTITUTION.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md docs/BRANCH-PROTECTION.md docs/ARCHITECTURE.md .github/pull_request_template.md specs/README.md`
Expected: no matches (correct org is `richardkdrew/richarddrew.photography`).

- [ ] **Step 3: Grep for the retired spec path convention as a *current* instruction**

Run: `grep -rn "specs/009\|specs/\[feature-number\]\|specs/{feature-number}" CLAUDE.md docs/CONSTITUTION.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md docs/BRANCH-PROTECTION.md docs/ARCHITECTURE.md .github/pull_request_template.md`
Expected: no matches.

- [ ] **Step 4: Grep for the old `feature/{number}` branch naming convention**

Run: `grep -rn "feature/009\|feature/{number}\|feature/\[feature" CLAUDE.md docs/CONSTITUTION.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md docs/BRANCH-PROTECTION.md docs/ARCHITECTURE.md`
Expected: no matches.

- [ ] **Step 5: Grep for semantic-versioning / conventional-commit-driven versioning claims**

Run: `grep -rn "v1\.0\.0 → v1\.1\.0\|v1\.2\.3\|Semantic versioning" docs/CONSTITUTION.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md docs/ARCHITECTURE.md`
Expected: no matches.

- [ ] **Step 6: Spot-check internal consistency by reading CONSTITUTION.md Section V and DEVELOPMENT.md's Development Workflow section side by side**

Run: `grep -n "^## V\." -A5 docs/CONSTITUTION.md` and re-read the relevant `docs/DEVELOPMENT.md` section from Task 6. Confirm both describe the same two tiers with no contradictions (e.g. one shouldn't say TodoWrite is "mandatory" for fixes while the other says "optional").

- [ ] **Step 7: Confirm the full test suite still passes (sanity check — this was a docs-only change, so this should be a no-op, but confirms nothing was accidentally touched outside docs)**

Run: `git status --short` — expected: only the files from Tasks 1-8 (plus this plan/spec doc) show as changed, nothing under `src/` or `tests/`.

- [ ] **Step 8: Push the branch**

```bash
git push -u origin 022-docs-refresh
```

Report back to the user with a summary of what changed, and let them know it's ready for them to open the PR (matching the "push, I'll handle the PR" pattern established earlier in this session).
