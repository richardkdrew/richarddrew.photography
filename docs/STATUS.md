# Project Status

**Last Updated**: 2026-08-17

> This file tracks what's shipped and what's in progress. It's read on demand (see [CLAUDE.md](../CLAUDE.md) Documentation Map), not loaded into every session — update it whenever status changes, but it isn't a source of behavioral instructions.

---

## Completed Features

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

## Current Work

- **`026-ipad-footer-dvh-fix`** - Sticky-footer `min-height` fix using `100dvh`.
- **`015-photo-mcp-server`** - Python FastMCP server for R2 photo uploads. Not yet merged. ⚠️ Status needs confirming — last commit 2026-08-08, currently behind `develop` (needs rebase before it can land). Update this entry once you know whether it's still active.

## Recent Changes

- 2026-08-17: **CLAUDE.md restructured** ✅ - Trimmed to routing/behavior content only; status and changelog moved here
- 2025-10-28: **DEVELOPMENT.md + ARCHITECTURE.md Created** ✅ - Comprehensive documentation (77KB, 2,997 lines) split by purpose (HOW vs WHAT)
- 2025-10-10: **Constitution Updated to v2.0.0** ✅ - 20 principle-based guidelines
- 2025-10-10: **View Transitions API** ✅ - Native page transitions (Chrome/Edge)
- 2025-10-03: **Feature 007 Complete** ✅ - Full-screen image viewer (96% coverage)
- 2025-10-01: **Feature 006 Complete** ✅ - Dark mode (99.2% passing)
- 2025-09-30: **Feature 005 Complete** ✅ - Responsive images (100% passing)
