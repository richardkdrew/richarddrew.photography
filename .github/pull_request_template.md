# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

## Task Type

<!-- Check ONE that applies to this PR -->

- [ ] Feature Implementation
- [ ] Bug Fix / Investigation
- [ ] Codebase Exploration (documentation/refactoring)
- [ ] Deployment / Operations

---

## Documentation Compliance Checklist

> **MANDATORY**: Confirm you have read the required documentation for your task type.
> See [CONSTITUTION.md - Section IX](../.specify/memory/CONSTITUTION.md#ix-documentation-requirements) for requirements.

### For Feature Implementation

- [ ] **CONSTITUTION.md** - Sections I-III (Foundational Principles, Anti-Patterns, Quality Gates)
- [ ] **DEVELOPMENT.md** - Sections 1-7 (Quick Start through Quality Gates)
- [ ] **CLAUDE.md** - Current Status section

**Constitutional Compliance**:
- [ ] `spec.md` exists in `specs/{feature-id}/` with user stories and requirements
- [ ] `plan.md` exists with numbered task IDs (T001, T002, etc.)
- [ ] Tests follow 4-category pattern (contract, UI, accessibility, performance)
- [ ] TodoWrite tracking completed with task IDs referenced
- [ ] 90%+ test coverage maintained

### For Bug Fix / Investigation

- [ ] **ARCHITECTURE.md** - Sections 1-5 (Quick Reference through Testing Infrastructure)
- [ ] **DEVELOPMENT.md** - Sections 8-10 (Common Tasks through Troubleshooting)
- [ ] **CLAUDE.md** - Current Status section

**Fix Compliance**:
- [ ] Tests prove bug existed (failing test case added)
- [ ] Tests prove bug is resolved (tests now pass)
- [ ] Root cause documented in PR description
- [ ] Architectural patterns followed

### For Codebase Exploration (Documentation/Refactoring)

- [ ] **ARCHITECTURE.md** - Complete file
- [ ] **CLAUDE.md** - Current Status section

**Exploration Compliance**:
- [ ] Documentation references specific architectural sections
- [ ] Code examples follow established patterns
- [ ] No breaking changes to public APIs

### For Deployment / Operations

- [ ] **DEPLOYMENT.md** - Complete file
- [ ] **ARCHITECTURE.md** - Section 11 (Deployment Architecture)
- [ ] **CLAUDE.md** - Current Status section

**Operations Compliance**:
- [ ] Existing deployment patterns preserved
- [ ] Rollback procedure documented
- [ ] No breaking changes to CI/CD pipeline
- [ ] Secrets/credentials handled securely

---

## Workflow Artifacts (Proof of Compliance)

**Feature Implementation Only** - Attach evidence:

- [ ] Link to `spec.md`: `specs/{feature-id}/spec.md`
- [ ] Link to `plan.md`: `specs/{feature-id}/plan.md`
- [ ] Screenshot of TodoWrite completion (all tasks marked "completed")
- [ ] Test coverage report showing 90%+ (run `make test-coverage`)

---

## Quality Gates

### Pre-PR Checklist (ALL PRs)

- [ ] All tests pass locally (`make test-run`)
- [ ] Build succeeds (`make build`)
- [ ] No linting errors
- [ ] Accessibility tests pass (`make test-a11y`)
- [ ] Manual testing completed
- [ ] Git commit messages follow conventional commits format

### Code Review Checklist

- [ ] Code follows project code standards ([DEVELOPMENT.md - Code Standards](../docs/DEVELOPMENT.md#code-standards))
- [ ] No anti-patterns introduced ([DEVELOPMENT.md - Anti-Patterns](../docs/DEVELOPMENT.md#anti-patterns-avoid))
- [ ] Performance budgets maintained ([DEVELOPMENT.md - Performance Budgets](../docs/DEVELOPMENT.md#performance-budgets))
- [ ] Accessibility requirements met (WCAG AA minimum)
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)

---

## Additional Context

<!-- Add any additional context, screenshots, or relevant information -->

### Related Issues/PRs

<!-- Link to related issues or PRs -->

### Testing Notes

<!-- Describe how to test these changes -->

### Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

---

## Acknowledgment

I confirm that:

- [ ] I have read the MANDATORY documentation for my task type
- [ ] I understand the constitutional principles relevant to this PR
- [ ] All workflow artifacts are complete and linked above
- [ ] This PR follows the project's development workflow

**Documentation Read**: <!-- List the docs you read, e.g., "CONSTITUTION.md (Sections I-III), DEVELOPMENT.md (Sections 1-7), CLAUDE.md" -->

**Key Principles Understood**: <!-- List 2-3 key principles, e.g., "(1) Specification-first is mandatory, (2) TDD with 4-category tests is required, (3) TodoWrite tracking with task IDs is non-negotiable" -->
