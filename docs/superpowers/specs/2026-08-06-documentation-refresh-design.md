# Documentation Refresh — Design Spec

**Date**: 2026-08-06
**Status**: Approved
**Branch**: TBD (fix/chore-tier work, no dedicated feature branch required by the process this spec itself defines — but branch protection still requires a PR, so this needs a short-lived branch off `develop`)

---

## 1. Problem

The project's process documentation (`CLAUDE.md`, `docs/CONSTITUTION.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/BRANCH-PROTECTION.md`, `.github/pull_request_template.md`) was written for an earlier spec-kit-driven workflow and has drifted from how the project actually operates:

- The team now uses **superpowers** (brainstorm → spec → plan → implement) for substantial work, with specs/plans living in `docs/superpowers/specs/` and `docs/superpowers/plans/` — not `specs/{number}-{name}/spec.md` + `plan.md` as the docs describe.
- Small fixes and refactors routinely go straight to a commit with appropriate tests (e.g. the header-scroll-threshold fix on 2026-08-06), with no formal spec, plan, or TodoWrite ceremony — but the constitution states TDD, full specs, and TodoWrite-with-task-IDs are mandatory for *every* change, with no exceptions.
- Several concrete facts are wrong: `docs/DEPLOYMENT.md` describes prod versioning as semantic-versioning-via-conventional-commits (`v1.2.3`), but the actual implementation (`deploy-prod.yml`) is a simple sequential `v{year}.NNN` counter unrelated to conventional commits. `docs/BRANCH-PROTECTION.md` links to `.specify/memory/constitution.md` (an empty directory) and points at the wrong GitHub org in its settings URL (`richarddrew` instead of `richardkdrew`). `CLAUDE.md`'s "Current Status" section is stale since October 2025 (wrong current branch, missing all work since).
- The 90%+ coverage figure is stated as an enforced CI gate; nothing in `.github/workflows/pr-checks.yml` actually checks coverage. Actual coverage is ~99%, so the number itself is fine — the "enforced" claim isn't.
- The constitution forbids direct `npm`/`npx` commands (Makefile-only, no exceptions); in practice, targeted debugging commands like `npx vitest run <file>` are used routinely without issue.

This spec defines the target end state for these docs so a future session (or this one) can execute the rewrite without re-deriving the same analysis.

## 2. Scope

**In scope**: `CLAUDE.md`, `docs/CONSTITUTION.md`, `docs/DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `docs/BRANCH-PROTECTION.md`, `.github/pull_request_template.md`, new `specs/README.md`, and a small targeted fix to `docs/ARCHITECTURE.md` (versioning section + dead link only).

**Out of scope**: No code changes. No CI workflow changes (the missing coverage gate and the Lighthouse local-run flakiness noted in the 2026-08-06 session are separate, later follow-ups — not fixed here, just not mis-described here either). `README.md` is already accurate and untouched. `specs/001-008/` content is untouched, only gains a sibling pointer file.

## 3. What stays unchanged

- **Product/code principles** in `CONSTITUTION.md`: vanilla-first architecture, CSS-native approach, performance budgets, accessibility-is-non-negotiable, mobile-first breakpoints, browser support strategy, design token system, component folder structure, state management approach, security & privacy. These are accurate and well-observed in the current codebase — keep them essentially as written, renumbered as needed once process sections are cut.
- **`docs/ARCHITECTURE.md`** structure and content generally — it's accurate (verified during the 2026-08-06 session's initial orientation). Only the versioning-strategy description and the `.specify/memory/constitution.md` link need correcting.
- **`README.md`** — already accurate, not touched.
- **`specs/001-008/`** — left as historical record.

## 4. Core change: tiered process rigor

Replace every "MUST do X for every single change, no exceptions" mandate with a two-tier model:

**Feature tier** (new components, substantial features):

1. superpowers `brainstorming` → design doc in `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
2. superpowers `writing-plans` → plan in `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
3. TDD with the 4-category test pattern (contract, UI, accessibility, performance) — write tests first, verify red, implement, verify green
4. TodoWrite tracking against the plan's tasks

**Fix tier** (bug fixes, refactors, small changes, doc updates):

1. Optionally use superpowers `systematic-debugging` for investigation if root cause isn't obvious
2. Direct implementation with tests appropriate to the change (not necessarily all 4 categories — e.g. a logic fix inside an existing component's scroll handler doesn't need a new performance-test suite)
3. No formal spec/plan/TodoWrite required
4. Straight to commit on a short-lived branch → PR (branch protection requires a PR either way; there's no such thing as a "direct commit to develop" regardless of tier)

**Supporting rule changes:**

- **Coverage**: 90%+ stated as the expected/aspirational bar (matches actual results), not an enforced CI gate — because nothing currently enforces it.
- **Makefile**: `make dev/build/test-run/etc.` remain the standard interface for normal workflows and CI parity. Direct `npm`/`npx` commands are explicitly fine for targeted debugging (e.g. running one test file, one lint rule) — not a violation.
- **Spec/plan location**: all current and future specs/plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/`. The old `specs/{number}-{name}/spec.md`+`plan.md` format is retired going forward (existing `specs/001-008/` folders remain as history).
- **TodoWrite**: expected for feature-tier work tracked against a plan's tasks; not required for fix-tier work.
- **Commit message template**: the constitution's current commit template (Problem/Solution/Technical Details sections) is heavier than what's actually used in the git log (conventional-commit-style one-liners like `fix(header): ...`, `feat(footer): ...`). Update to match actual practice: conventional-commit-style subject line, optional body for non-obvious rationale.

## 5. File-by-file changes

### `CLAUDE.md`

- Fix "Current Branch" / "Latest Feature" / "Recent Changes" (stale since 2025-10-28) — pull from actual recent git log.
- Keep the 4 task-type router (Feature Implementation / Bug Fix / Codebase Exploration / Deployment) — it's a useful at-a-glance entry point.
- Update each task type's mandatory reading list to point at the refreshed docs, and note which superpowers skill applies:
  - Feature Implementation → mention `superpowers:brainstorming` as the starting point
  - Bug Fix / Investigation → mention `superpowers:systematic-debugging`
  - Codebase Exploration → unchanged in spirit (read ARCHITECTURE.md)
  - Deployment / Operations → unchanged in spirit (read DEPLOYMENT.md)
- Update the "Quick Context" / "Current Status" sections to reflect actual current feature set (uniform gallery, smart header, footer, dark room/light box theme toggle, 404 redesign, etc. — whatever's landed since October per `git log develop`).

### `docs/CONSTITUTION.md`

- Cut **Section V (Development Workflow)** and **Section IX (Documentation Requirements)** entirely — both describe the single-path spec-first-always workflow being replaced.
- Replace with a new section describing the tiered model from §4 above.
- Soften within Section I:
  - **Principle 5 (TDD)**: still mandatory for feature-tier work; fix-tier work gets appropriate tests, not necessarily the full 4-category suite.
  - **Principle 6 (Specification-First)**: still mandatory for feature-tier work via superpowers; not required for fix-tier. Update the spec format shown (§141-149 in the old doc) to the `docs/superpowers/specs/` + `docs/superpowers/plans/` convention.
  - **Principle 9 (Git Commit Standards)**: replace the Problem/Solution/Technical-Details template with the conventional-commit-style pattern actually in use.
  - **Principle 10 (Makefile Command Interface)**: soften "FORBIDDEN" direct npm/npx to "standard interface for normal workflows; direct commands fine for targeted debugging."
  - **Principle 16 (TodoWrite)**: scope to feature-tier work tracked against a plan.
- Bump version to **3.0.0** with a changelog comment at the top matching the existing style (see the v2.0.0 comment block for format), documenting this as a breaking change from the always-spec-first model to the tiered model.
- Leave Principles 1-4, 7-8, 11-15, 17-20 substantively as-is (renumber only if principles are removed rather than modified in place — prefer modifying in place to minimize renumbering churn).

### `docs/DEVELOPMENT.md`

- Long file (2001 lines); apply the same tiered-model pass mechanically once CONSTITUTION.md's new philosophy is settled:
  - Update spec/plan location references and templates (§158-165, §550, §570-571 in the old doc, and any other `specs/009-feature-name` style examples) to `docs/superpowers/specs/` / `docs/superpowers/plans/` conventions.
  - Update the TodoWrite section (~§1233-1341 old numbering) to scope it to feature-tier work.
  - Update coverage language (~§118, §491-510, §1153-1169) to "target, not gate."
  - Update the PR checklist section to match the new PR template (§6 below).

### `docs/DEPLOYMENT.md`

- Fix the versioning section (currently ~§11-16, §131-132, §151-152, §160, §181-184):
  - Dev: `v{year}.dev-{sha}` (e.g. `v2026.dev-df8dd49`), rebuilt on every push to `develop`.
  - Prod: `v{year}.NNN` sequential counter (e.g. `v2026.004`), auto-incremented by the `tag` job in `deploy-prod.yml` on every push to `main` — **not** semantic versioning, **not** driven by conventional commit types.
  - Local/no-VERSION-set default: `v{year}.dev-local`.

### `docs/BRANCH-PROTECTION.md`

- Fix dead link: `.specify/memory/constitution.md` → `docs/CONSTITUTION.md`.
- Fix GitHub settings URL: `github.com/richarddrew/richarddrew.photography/settings` → `github.com/richardkdrew/richarddrew.photography/settings`.

### `docs/ARCHITECTURE.md`

- Fix the "Versioning Strategy" section to match the corrected DEPLOYMENT.md description (same fix as above, this doc has its own copy of the same wrong facts).
- Fix the `.specify/memory/constitution.md` reference in "Constitutional Foundations" → `docs/CONSTITUTION.md`.

### `.github/pull_request_template.md`

Replace the spec-kit compliance checklist entirely with something matching actual practice:

```markdown
## Description
<!-- What changed and why -->

## Type
- [ ] Feature (new component/functionality)
- [ ] Fix (bug fix, refactor, small change)
- [ ] Chore (docs, deps, tooling)

## For Feature-tier work only
- [ ] Spec: `docs/superpowers/specs/...`
- [ ] Plan: `docs/superpowers/plans/...`

## Checklist
- [ ] Tests pass locally (`make test-run`)
- [ ] Build succeeds (`make build`)
- [ ] Accessibility checked where relevant
- [ ] Screenshots attached for UI changes

## Testing notes
<!-- How to verify this manually, if relevant -->
```

### `specs/README.md` (new file)

Short note:

```markdown
# Legacy Specs

`specs/001` through `specs/008` are spec-kit-format specs from before the
project switched to superpowers for planning (~feature 012 onward).

Current specs and plans live in:
- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
```

## 6. Testing / verification

This is a documentation-only change — no automated tests apply. Verification is manual:

- Every internal doc link (`.md` cross-references) resolves to a real file.
- No remaining references to `.specify/memory/` (dead path) anywhere in the changed files.
- No remaining references to `specs/{number}-{name}/spec.md` as the *current* convention (historical mentions in the legacy-specs note are fine).
- `grep -ri "richarddrew/richarddrew.photography"` across changed files returns nothing (should be `richardkdrew`).
- Read through each rewritten section once for internal consistency (a modified-in-place CONSTITUTION.md shouldn't contradict itself between old and new sections).

## 7. Out of scope / explicit non-goals

- No CI workflow changes (coverage gate gap, Lighthouse flakiness) — noted as real gaps during the 2026-08-06 session but deliberately not addressed here.
- No changes to `README.md` (already accurate).
- No changes to `specs/001-008/` content (only a new sibling README).
- No renumbering of CONSTITUTION.md principles unless a principle is fully removed rather than modified in place.
