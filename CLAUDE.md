# Claude Code Quick Start

**Last Updated**: 2026-08-17
**Constitution**: v3.0.0

> **For AI Assistants**: This file provides fast context loading and routes you to comprehensive documentation. Read this first (2 min), then dive into detailed docs as required by your task type.

---

## 🚨 Task Type Identification (MANDATORY)

**BEFORE ANY WORK**: Identify your task type and read the MANDATORY documentation.

### Task Type 1: Feature Implementation

**Triggers**: User says "add", "create", "implement", "build new feature"
**Example**: "Add dark mode toggle to the header"

**Start with**: the `superpowers:brainstorming` skill — it drives the spec/plan process described in [CONSTITUTION.md](docs/CONSTITUTION.md) Section V (feature tier).

**Read before starting**:

1. ✅ [CONSTITUTION.md](docs/CONSTITUTION.md) - Sections I-III (Principles, Anti-Patterns, Quality Gates) and Section V (feature-tier workflow)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 1-7 (Quick Start → Quality Gates)

### Task Type 2: Bug Fix / Investigation

**Triggers**: User says "fix", "bug", "error", "broken", "not working"
**Example**: "Fix the navigation menu on mobile"

**Start with**: the `superpowers:systematic-debugging` skill if the root cause isn't already obvious — find root cause before proposing a fix.

**Read before starting**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Sections 1-5 (Quick Reference → Testing Infrastructure)
2. ✅ [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Sections 8-10 (Common Tasks → Troubleshooting)

This is fix-tier work per [CONSTITUTION.md](docs/CONSTITUTION.md) Section V — no formal spec/plan required, tests appropriate to the fix, straight to a PR.

### Task Type 3: Codebase Exploration

**Triggers**: User says "how does", "explain", "show me", "where is"
**Example**: "How does the image viewer component work?"

**Read before starting**:

1. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Complete file (understand system structure)

### Task Type 4: Deployment / Operations

**Triggers**: User says "deploy", "CI/CD", "GitHub Actions", "Cloudflare"
**Example**: "Update the deployment workflow"

**Read before starting**:

1. ✅ [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Complete file
2. ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Section 11 (Deployment Architecture)

---

## 📚 Documentation Map

**Read this depending on your task**:

1. **Implementing a feature?** → [DEVELOPMENT.md](docs/DEVELOPMENT.md)
   - Complete workflow (spec → plan → test → implement → PR)
   - Code standards, testing requirements, TodoWrite usage
   - Quality gates, troubleshooting, commands reference

2. **Understanding the system?** → [ARCHITECTURE.md](docs/ARCHITECTURE.md)
   - System structure, component architecture, data flow
   - Build pipeline, responsive system, performance architecture
   - Browser support, deployment architecture

3. **Understanding project values?** → [CONSTITUTION.md](docs/CONSTITUTION.md)
   - 20 foundational principles (vanilla-first, TDD, accessibility)
   - Anti-patterns, quality gates, success metrics
   - Source of truth for architectural decisions

4. **Setting up deployment?** → [DEPLOYMENT.md](docs/DEPLOYMENT.md)
   - Cloudflare setup, GitHub secrets, workflows
   - Troubleshooting, rollback procedures

5. **Configuring GitHub?** → [BRANCH-PROTECTION.md](docs/BRANCH-PROTECTION.md)
   - Branch protection rules, status checks
   - PR workflow, bypass procedures

6. **Checking current project status?** → [STATUS.md](docs/STATUS.md)
   - Completed features, in-progress branches, changelog

---

## 🚨 Key Reminders for AI Assistants

1. **Match the tier to the task** - Feature tier (new components/substantial features): spec/plan via superpowers, full TDD, TodoWrite tracking. Fix tier (bug fixes, refactors, small changes): tests appropriate to the change, no formal spec/plan required.
2. **TodoWrite for feature-tier tasks** - Track in_progress → completed immediately (NO BATCHING); optional for fix-tier work
3. **90%+ coverage is the target** - Aspirational, not an enforced CI gate
4. **Constitution is source of truth** - Read `docs/CONSTITUTION.md` for principles
5. **Specification-first for feature-tier work** - Fix-tier work skips straight to implementation with appropriate tests

---

## 🔗 Quick Links

- [Development Workflow](docs/DEVELOPMENT.md#development-workflow)
- [Architecture Overview](docs/ARCHITECTURE.md#architectural-principles)
- [Constitutional Principles](docs/CONSTITUTION.md#i-foundational-principles)
- [Testing Requirements](docs/DEVELOPMENT.md#testing-requirements)
- [Troubleshooting](docs/DEVELOPMENT.md#troubleshooting)
- [Project Status](docs/STATUS.md)

---

**For comprehensive details**: Read the full documentation files above.
**For quick orientation**: You've just read it (this file).
