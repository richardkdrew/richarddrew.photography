# Photography Portfolio Website

[![PR Checks](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/pr-checks.yml/badge.svg?branch=develop)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/pr-checks.yml)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%20AA-green)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/pr-checks.yml)
[![Dev Deploy](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-dev.yml/badge.svg?branch=develop)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-dev.yml)
[![Prod Deploy](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-prod.yml/badge.svg?branch=main)](https://github.com/richardkdrew/richarddrew.photography/actions/workflows/deploy-prod.yml)
[![Version](https://img.shields.io/github/v/tag/richardkdrew/richarddrew.photography)](https://github.com/richardkdrew/richarddrew.photography/tags)

A modern, professional photography portfolio built with performance and accessibility in mind. Features a responsive masonry gallery layout, full-screen image lightbox viewer and seamless dark mode support.

## ✨ Key Features

- **Responsive Masonry Gallery** - 5-breakpoint system
   (1-5 columns) with CSS-only layout
- **Full-Screen Image Viewer** - Keyboard navigation,
  visual order, smooth transitions
- **Dark Mode** - WCAG AA compliant theme toggle with
  localStorage persistence
- **Progressive Images** - WebP/JPEG fallback, srcset
  optimization, LQIP blur placeholders
- **Mobile-First Design** - Touch-optimized, hamburger
   menu, optimized for all devices
- **View Transitions API** - Smooth page navigation
  (Chrome/Edge)
- **About/Bio Section** - Professional photographer
  introduction
- **PWA Support** - Offline capability, installable,
  service worker caching

## 🛠 Tech Stack

- **TypeScript** → Vanilla JavaScript (ES2020+)
- **Web Components** - Custom elements, no framework
  dependencies
- **Vite** - Lightning-fast dev server and optimized
  builds
- **Vitest** - Comprehensive test coverage (96%+)
- **CSS Custom Properties** - Design system tokens
- **Makefile** - Simple command interface

## 📚 Documentation

This project has comprehensive documentation organized by purpose:

- **[CLAUDE.md](CLAUDE.md)**: Quick start and documentation map
  - **Start here** for fast orientation and task-type routing
  - MANDATORY reading requirements by task type
  - Current status, recent changes, quick reference

- **[CONSTITUTION.md](.specify/memory/CONSTITUTION.md)**: Principles and philosophy (WHY)
  - 20 foundational principles (vanilla-first, TDD, accessibility)
  - Anti-patterns, quality gates, success metrics
  - Source of truth for architectural decisions

- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)**: Workflow and development guide (HOW)
  - Complete 6-phase workflow (spec → plan → test → implement → verify → PR)
  - Code standards, testing requirements, TodoWrite usage
  - Quality gates, troubleshooting, commands reference

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture and patterns (WHAT)
  - Component architecture, build pipeline, data flow
  - Responsive system, performance architecture
  - Browser support, deployment architecture

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Deployment and operations (OPS)
  - Cloudflare Pages setup, GitHub Actions workflows
  - Troubleshooting, rollback procedures
  - Security best practices

- **[BRANCH-PROTECTION.md](docs/BRANCH-PROTECTION.md)**: GitHub configuration (SETUP)
  - Branch protection rules, required status checks
  - PR workflow, bypass procedures

### For Different Audiences

**For AI Assistants**:

1. Start with [CLAUDE.md](CLAUDE.md) for task-type specific MANDATORY documentation
2. Follow the documentation requirements defined in [CONSTITUTION.md - Section IX](.specify/memory/CONSTITUTION.md#ix-documentation-requirements)

**For Developers**:

1. Read [DEVELOPMENT.md](docs/DEVELOPMENT.md) for complete workflow
2. Reference [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system understanding
3. Consult [CONSTITUTION.md](.specify/memory/CONSTITUTION.md) for principles

**For DevOps/Admins**:

1. Start with [DEPLOYMENT.md](docs/DEPLOYMENT.md) for operations
2. Reference [BRANCH-PROTECTION.md](docs/BRANCH-PROTECTION.md) for GitHub setup
