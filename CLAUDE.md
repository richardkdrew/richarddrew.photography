# Claude Code Quick Start

**Last Updated**: 2025-10-28
**Current Branch**: 008-add-build-actions
**Latest Feature**: Feature 007 Complete ✅
**Constitution**: v2.0.0

> **For AI Assistants**: This file provides fast context loading and routes you to comprehensive documentation. Read this first (2 min), then dive into detailed docs as required by your task type.

---

## 🚨 Task Type Identification (MANDATORY)

**BEFORE ANY WORK**: Identify your task type and read the MANDATORY documentation.

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

---

## 🚀 Quick Context

**Project**: Photography portfolio website
**Tech**: TypeScript → Vanilla JavaScript, Web Components, Vite
**Testing**: 98.9% coverage (350/354 tests passing)
**Status**: Production-ready (v1.0.0 pending)

---

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

---

## 🎯 Quick Commands

```bash
make dev           # Start dev server (localhost:3000)
make test-run      # Run all tests (CI mode)
make build         # Production build
make test-coverage # Check coverage (90%+ required)
```

**Full commands**: See [DEVELOPMENT.md - Commands Reference](docs/DEVELOPMENT.md#commands-reference)

---

## 📋 Quick Reference

### Component Pattern

```text
src/components/name/
├── name.ts        # Web Component class
├── name.css       # Styles
├── name.types.ts  # TypeScript interfaces
└── name.html      # Template (optional)
```

### Test Pattern (4 categories - MANDATORY)

```text
tests/name/
├── name-contract.test.ts      # API/interfaces
├── name-ui.test.ts            # User interactions
├── name-accessibility.test.ts # WCAG compliance
└── name-performance.test.ts   # Benchmarks
```

**Detailed patterns**: See [DEVELOPMENT.md - Code Standards](docs/DEVELOPMENT.md#code-standards)

---

## 📝 Recent Changes

- 2025-10-28: **DEVELOPMENT.md + ARCHITECTURE.md Created** ✅ - Comprehensive documentation (77KB, 2,997 lines) split by purpose (HOW vs WHAT)
- 2025-10-10: **Constitution Updated to v2.0.0** ✅ - 20 principle-based guidelines
- 2025-10-10: **View Transitions API** ✅ - Native page transitions (Chrome/Edge)
- 2025-10-03: **Feature 007 Complete** ✅ - Full-screen image viewer (96% coverage)
- 2025-10-01: **Feature 006 Complete** ✅ - Dark mode (99.2% passing)
- 2025-09-30: **Feature 005 Complete** ✅ - Responsive images (100% passing)

---

## 🚨 Key Reminders for AI Assistants

1. **TDD is MANDATORY** - Write tests first, verify failure, implement, verify success
2. **TodoWrite for ALL tasks** - Track in_progress → completed immediately (NO BATCHING)
3. **90%+ coverage required** - Non-negotiable quality gate
4. **Constitution is source of truth** - Read `docs/CONSTITUTION.md` for principles
5. **Specification-first** - No implementation without approved spec

---

## 🔗 Quick Links

- [Development Workflow](docs/DEVELOPMENT.md#development-workflow)
- [Architecture Overview](docs/ARCHITECTURE.md#architectural-principles)
- [Constitutional Principles](docs/CONSTITUTION.md#i-foundational-principles)
- [Testing Requirements](docs/DEVELOPMENT.md#testing-requirements)
- [Troubleshooting](docs/DEVELOPMENT.md#troubleshooting)

---

**For comprehensive details**: Read the full documentation files above.
**For quick orientation**: You've just read it (this file).
