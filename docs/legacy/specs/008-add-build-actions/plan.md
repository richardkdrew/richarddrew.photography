# Implementation Plan: GitHub Actions CI/CD Pipeline

**Feature**: GitHub Actions CI/CD with Cloudflare Pages deployment
**Branch**: `008-add-build-actions`
**Created**: 2025-10-16
**Status**: Planning

---

## Overview

Implement GitHub Actions workflows for automated testing, building, versioning, and Cloudflare Pages deployment. Pattern 2 approach: GitHub Actions handles full build pipeline and deploys to Cloudflare via Wrangler CLI.

---

## Technical Stack

**Language/Version**: Node.js 20.x (TypeScript → ES2020+ JavaScript)
**Primary Dependencies**: Vite (build), Vitest (tests), Wrangler CLI (Cloudflare deployment)
**Storage**: N/A
**Project Type**: Static website (portfolio)
**Build Output**: dist/ directory (minified HTML/CSS/JS, optimized assets)

---

## Architecture Decisions

### Version Shipping Strategy

**Problem**: How do users/developers know which version is deployed?

**Solution**: Embed version in HTML meta tags only (dev-only, no user-visible footer)

**Implementation**:
- Meta tag: `<meta name="version" content="v1.0.0">`
- Meta tag: `<meta name="build-date" content="2025-10-16T14:32:00Z">`
- Vite plugin to inject version at build time from `process.env.VERSION`
- GitHub Actions passes git tag to build via environment variable
- **Note**: User-visible version display (footer) deferred to future feature

**Alternative Considered**: Separate version.json file → Rejected (extra HTTP request, complexity)

---

### Auto-Tagging Strategy

**Problem**: How to automatically version releases on merge to main?

**Solution**: Semantic versioning with conventional commits, starting at v1.0.0

**Rules**:
- `feat:` commits → MINOR bump (v1.0.0 → v1.1.0)
- `fix:` commits → PATCH bump (v1.0.0 → v1.0.1)
- `feat!:` or `BREAKING CHANGE:` → MAJOR bump (v1.0.0 → v2.0.0)
- Tag format: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v1.2.3`)
- **Initial version**: v1.0.0 (project is production-ready)
- **Scope**: Only applies to `main` branch (develop uses `dev-{sha}` versioning)

**Tool**: `anothrNick/github-tag-action` (simpler, no npm dependency)

---

### Cloudflare Pages Deployment

**Pattern**: GitHub Actions builds → Wrangler CLI deploys (dual-environment)

**Deployment Strategy**:
- **Develop Branch** → `dev-richarddrew-photography` (staging environment)
- **Main Branch** → `richarddrew-photography` (production environment)

**Required Secrets** (stored in GitHub Settings → Secrets):
- `CLOUDFLARE_API_TOKEN`: Scoped token with Pages:Edit permission
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**Deployment Commands**:
```bash
# Develop branch (on successful PR merge)
npx wrangler pages deploy dist/ --project-name=dev-richarddrew-photography

# Main branch (production)
npx wrangler pages deploy dist/ --project-name=richarddrew-photography
```

**Versioning by Environment**:
- **Dev**: `dev-{git-sha}` (e.g., `dev-a1b2c3d`)
- **Prod**: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v1.2.3`)

**Benefits over Git Integration**:
- Build environment consistency (same Node version as local)
- Faster deploys (pre-built artifacts, no Cloudflare build step)
- Build artifacts retained in GitHub (30-day debugging)
- Full control over build optimization

---

## Implementation Tasks

### Phase 1: Foundation (T001-T003)

**T001**: Create PR validation workflow (`.github/workflows/pr-checks.yml`)
- Trigger: `pull_request` on any branch
- Jobs: `test`, `build`, `accessibility` (parallel)
- Test job: `make test-run` (all test suites including a11y)
- Build job: `make build` (TypeScript + Vite)
- Accessibility job: `make test-a11y` (dedicated a11y validation)
- Node cache: npm dependencies
- All status checks must pass to allow merge
- **Dependencies**: None
- **Acceptance**: PR with failing tests/a11y shows red status check

**T002**: Create version injection mechanism
- Vite plugin: `vite-plugin-version-injector.ts`
- Injects `VERSION` env var into HTML meta tag
- Injects `BUILD_DATE` into HTML meta tag
- **No user-visible footer** (deferred to future feature)
- Default to `dev-local` if VERSION not set
- **Dependencies**: None
- **Acceptance**: Built HTML contains `<meta name="version" content="v1.0.0">` and `<meta name="build-date" content="...">`

**T003**: Write tests for version injection
- Test: Version meta tag exists in built HTML
- Test: Build date meta tag exists in built HTML
- Test: Default to "dev-local" when VERSION unset
- Test: No user-visible version text in footer/UI
- **Dependencies**: T002
- **Acceptance**: `make test-run` passes with version tests

---

### Phase 2: Deployment Workflows (T004-T009)

**T004**: Create develop deployment workflow (`.github/workflows/deploy-dev.yml`)
- Trigger: `push` to `develop` branch
- Concurrency: Cancel in-progress runs (latest wins)
- Jobs: `build-and-deploy` (sequential steps)
- Version: `dev-{git-sha}` (e.g., `dev-a1b2c3d`)
- Deploy to: `dev-richarddrew-photography`
- **Dependencies**: T001 (reuse build patterns)
- **Acceptance**: Merge to develop triggers staging deployment

**T005**: Implement develop build step with versioning
- Export `dev-{git-sha}` as `VERSION` env var
- Run `make build` with VERSION set
- Verify dist/ directory exists
- **Dependencies**: T002, T004
- **Acceptance**: Built HTML contains `<meta name="version" content="dev-a1b2c3d">`

**T006**: Implement develop Cloudflare deployment
- Install Wrangler CLI: `npm install -g wrangler`
- Deploy: `wrangler pages deploy dist/ --project-name=dev-richarddrew-photography`
- Use secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Output deployment URL in workflow logs
- **Dependencies**: T005
- **Acceptance**: Staging site updates after develop merge

**T007**: Create production deployment workflow (`.github/workflows/deploy-prod.yml`)
- Trigger: `push` to `main` branch
- Concurrency: Cancel in-progress runs (latest wins)
- Jobs: `tag`, `build-and-deploy` (sequential)
- **Dependencies**: T004 (similar structure)
- **Acceptance**: Merge to main triggers production workflow

**T008**: Implement auto-tagging step (main only)
- Action: `anothrNick/github-tag-action@v1`
- Parse commit messages for version bump type
- Create git tag: `v{MAJOR}.{MINOR}.{PATCH}`
- Initial version: `v1.0.0`
- Push tag to repository
- **Dependencies**: T007
- **Acceptance**: Merge with `feat:` creates new minor version tag

**T009**: Implement production build and deploy
- Export git tag as `VERSION` env var
- Run `make build` with VERSION set
- Deploy: `wrangler pages deploy dist/ --project-name=richarddrew-photography`
- Upload build artifacts (30-day retention)
- **Dependencies**: T002, T008
- **Acceptance**: Production site updates with versioned build

---

### Phase 3: Documentation & Polish (T010-T013)

**T010**: Add status badges to README (top, after title)
- Badge 1: Build status (pr-checks.yml) - `![Build](https://...)`
- Badge 2: Tests passing (pr-checks.yml) - `![Tests](https://...)`
- Badge 3: Accessibility (pr-checks.yml) - `![A11y](https://...)`
- Badge 4: Dev deployment (deploy-dev.yml) - `![Dev Deploy](https://...)`
- Badge 5: Prod deployment (deploy-prod.yml) - `![Prod Deploy](https://...)`
- Badge 6: Latest version (git tag) - `![Version](https://...)`
- Position: Immediately after `# Portfolio Website` title
- **Dependencies**: T001, T004, T007
- **Acceptance**: All badges display correctly on GitHub README

**T011**: Document required GitHub Secrets
- Create `docs/deployment.md`
- List: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Instructions: How to generate Cloudflare API token
- Permissions required: Pages:Edit
- Note: Two Cloudflare projects (dev + prod)
- **Dependencies**: None
- **Acceptance**: Documentation complete and accurate

**T012**: Document branch protection rules
- Create `docs/branch-protection.md`
- **Develop branch**: Require PR reviews, require status checks (build + tests + a11y)
- **Main branch**: Require PR reviews, require status checks (build + tests + a11y), enforce linear history
- GitHub Settings → Branches → Add rule
- **Dependencies**: T001
- **Acceptance**: Documentation ready for GitHub configuration

**T013**: Add manual workflow dispatch triggers
- Add `workflow_dispatch` to deploy-dev.yml and deploy-prod.yml
- Allow manual deployments to both environments
- Use case: Emergency hotfixes, rollback, testing
- **Dependencies**: T004, T007
- **Acceptance**: "Run workflow" button visible in Actions tab for both workflows

---

### Phase 4: Testing & Validation (T014-T017)

**T014**: Test PR workflow with intentional failures
- Create test PR with failing Vitest tests
- Verify: Red status check, merge blocked
- Create test PR with failing a11y tests
- Verify: Red accessibility status check, merge blocked
- Fix tests, verify: All green status checks
- **Dependencies**: T001
- **Acceptance**: PR status checks work correctly (build, tests, a11y)

**T015**: Test develop deployment end-to-end
- Merge simple change to develop (e.g., update meta description)
- Verify: Version set to `dev-{git-sha}`
- Verify: Build succeeds with dev version injected
- Verify: Staging site updates on dev-richarddrew-photography
- Verify: Build artifact retained
- **Dependencies**: T004-T006
- **Acceptance**: Full develop deployment cycle completes successfully

**T016**: Test production deployment end-to-end
- Merge simple change to main (e.g., update meta description)
- Verify: Auto-tag created (v1.0.0 or v1.0.1)
- Verify: Build succeeds with semantic version injected
- Verify: Production site updates on richarddrew-photography
- Verify: Build artifact retained
- **Dependencies**: T007-T009
- **Acceptance**: Full production deployment cycle completes successfully

**T017**: Verify artifact retention and downloadability
- Check artifacts in Actions tab for both environments
- Verify retention shows 30 days
- Download production artifact, verify contents
- Download dev artifact, verify contents
- **Dependencies**: T009
- **Acceptance**: Artifacts contain complete dist/ directory

---

## Success Metrics

- **SM-001**: PR checks complete within 5 minutes (test + build jobs)
- **SM-002**: Production deployments complete within 10 minutes (tag + build + deploy)
- **SM-003**: Auto-tagging succeeds 100% of merges to main
- **SM-004**: Deployed site displays correct version in footer
- **SM-005**: Build artifacts retained for 30 days
- **SM-006**: Status badges in README update in real-time
- **SM-007**: Zero manual deployments needed after setup

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloudflare API token expires | High | Document token generation, set calendar reminder |
| Version injection breaks build | High | Write comprehensive tests (T003) |
| Concurrent deployments conflict | Medium | Use concurrency cancellation in workflow |
| npm install fails in CI | Medium | Cache dependencies, retry logic |
| Wrangler CLI version mismatch | Low | Pin Wrangler version in workflow |

---

## Open Questions

1. ✅ **Project names**: Prod = `richarddrew-photography`, Dev = `dev-richarddrew-photography` (CONFIRMED)
2. ✅ **Initial version**: Start at `v1.0.0` (CONFIRMED - project is production-ready)
3. ✅ **Version visibility**: HTML meta only, no footer (CONFIRMED - footer deferred to future)
4. ✅ **Branch protection**: Develop + Main require PR reviews and status checks (build, tests, a11y) (CONFIRMED)
5. ✅ **Accessibility badge**: Include dedicated a11y badge in README (CONFIRMED)
6. ⏳ **CLOUDFLARE_ACCOUNT_ID**: Need to obtain from Cloudflare dashboard
7. ⏳ **Coverage reporting**: Include test coverage badge now or later? (DEFERRED - can add later)

---

## Files to Create/Modify

### New Files
- `.github/workflows/pr-checks.yml` (T001)
- `.github/workflows/deploy-dev.yml` (T004)
- `.github/workflows/deploy-prod.yml` (T007)
- `src/plugins/vite-plugin-version-injector.ts` (T002)
- `tests/version-injection/version-injection-contract.test.ts` (T003)
- `docs/deployment.md` (T011)
- `docs/branch-protection.md` (T012)

### Modified Files
- `README.md` (T010 - add 6 status badges at top)
- `vite.config.ts` (T002 - register version plugin)
- `index.html` (T002 - add version + build-date meta tags)

---

**Dependencies Summary**: 17 tasks total, longest critical path: T001 → T004 → T005 → T006 → T015 (5 tasks for dev), T007 → T008 → T009 → T016 (4 tasks for prod)
