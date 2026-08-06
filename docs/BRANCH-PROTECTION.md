# Branch Protection Rules

This document outlines the branch protection rules for the Photography Portfolio repository. These rules enforce code quality, prevent accidental direct commits, and ensure all changes go through proper review and testing.

## Overview

Two branches have protection rules enabled:
- **`develop`** - Staging branch (protects staging environment)
- **`main`** - Production branch (protects production deployments)

## Why Branch Protection?

Branch protection rules provide:
- ✅ **Quality Gates**: All tests, builds, and a11y checks must pass
- ✅ **Code Review**: Changes require approval before merging
- ✅ **History Integrity**: Prevents force-pushes and history rewriting
- ✅ **Deployment Safety**: Ensures only tested code reaches production
- ✅ **Team Collaboration**: Encourages proper PR workflow

## Develop Branch Protection Rules

The `develop` branch is the staging environment. All feature branches merge here first.

### Required Status Checks

These checks **MUST pass** before merging:
1. **Test** - All test suites (`make test-run`)
2. **Build** - Production build succeeds (`make build`)
3. **Accessibility** - A11y tests pass (`make test-a11y`)

**Workflow**: `.github/workflows/pr-checks.yml`

### Required Reviews

- **Minimum**: 1 approving review
- **Dismiss stale reviews**: Yes (when new commits pushed)
- **Code owners**: Not required (optional for future)

### Additional Rules

- ✅ **Require conversation resolution before merging**
- ✅ **Require branches to be up to date before merging**
- ❌ **Linear history**: Not enforced (allow merge commits)
- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

### Who Can Push Directly

- **Admins only** (for emergency hotfixes)
- All other users must create PRs

## Main Branch Protection Rules

The `main` branch is the production environment. Only tested code from `develop` should be merged here.

### Required Status Checks

These checks **MUST pass** before merging:
1. **Test** - All test suites (`make test-run`)
2. **Build** - Production build succeeds (`make build`)
3. **Accessibility** - A11y tests pass (`make test-a11y`)

**Workflow**: `.github/workflows/pr-checks.yml`

### Required Reviews

- **Minimum**: 1 approving review
- **Dismiss stale reviews**: Yes (when new commits pushed)
- **Code owners**: Not required (optional for future)

### Additional Rules

- ✅ **Require conversation resolution before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Require linear history**: Enforced (no merge commits, rebase or squash only)
- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

### Who Can Push Directly

- **Admins only** (for emergency hotfixes)
- All other users must create PRs

### Linear History

The `main` branch enforces **linear history** to keep commit history clean and easy to follow.

**Allowed merge strategies**:
- ✅ **Squash and merge** (recommended - combines all PR commits into one)
- ✅ **Rebase and merge** (preserves individual commits, rebases onto main)
- ❌ **Merge commit** (disabled - creates merge bubbles)

**Why linear history?**
- Cleaner commit history (no merge bubbles)
- Easier to bisect and debug
- Simpler rollbacks
- Each commit in main is a complete feature/fix

## Configuration Steps

To configure these rules in GitHub:

### Navigate to Settings

1. Go to: https://github.com/richardkdrew/richarddrew.photography/settings
2. Click **"Branches"** in left sidebar
3. Under "Branch protection rules", click **"Add rule"**

### Configure Develop Branch

**Branch name pattern**: `develop`

**Settings to enable**:
- [x] Require a pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - **Status checks to require**:
    - `test` (from pr-checks.yml)
    - `build` (from pr-checks.yml)
    - `accessibility` (from pr-checks.yml)
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings (admins can override)
- [ ] Require linear history (OFF for develop)
- [ ] Allow force pushes (OFF)
- [ ] Allow deletions (OFF)

Click **"Create"** to save.

### Configure Main Branch

**Branch name pattern**: `main`

**Settings to enable**:
- [x] Require a pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - **Status checks to require**:
    - `test` (from pr-checks.yml)
    - `build` (from pr-checks.yml)
    - `accessibility` (from pr-checks.yml)
- [x] Require conversation resolution before merging
- [x] Require linear history (ON for main)
- [x] Do not allow bypassing the above settings (admins can override)
- [ ] Allow force pushes (OFF)
- [ ] Allow deletions (OFF)

Click **"Create"** to save.

## Workflow Examples

### Feature Development

```
feature-branch → PR → develop (after tests pass + review)
                  ↓
             Deploys to staging (dev-richarddrew-photography)
                  ↓
develop → PR → main (after tests pass + review)
           ↓
       Auto-tag (v1.x.x)
           ↓
       Deploys to production (richarddrew-photography)
```

### Hotfix to Production

```
hotfix-branch → PR → main (after tests pass + review)
                  ↓
              Auto-tag (v1.x.x)
                  ↓
              Deploys to production
                  ↓
              Cherry-pick to develop (to sync staging)
```

## Status Check Requirements

The three required status checks come from `.github/workflows/pr-checks.yml`:

### 1. Test Job
- Runs: `make test-run`
- Tests: All test suites (contract, UI, a11y, performance)
- Node: 20.x
- Caching: npm dependencies

### 2. Build Job
- Runs: `make build`
- Verifies: TypeScript compilation + Vite bundling
- Output: dist/ directory
- Node: 20.x
- Caching: npm dependencies

### 3. Accessibility Job
- Runs: `make test-a11y`
- Tests: Dedicated accessibility test suite
- Standards: WCAG AA compliance
- Node: 20.x
- Caching: npm dependencies

**All jobs run in parallel** for fast feedback (~2-3 minutes total).

## Bypassing Protection Rules

### When to Bypass

Only bypass in true emergencies:
- Critical security vulnerability
- Production site completely down
- Automated systems broken

### How to Bypass

1. **You must be an admin**
2. When merging PR, check "Use your administrator privileges to merge this pull request"
3. **Document why** in PR comment
4. **Fix properly** afterward with a follow-up PR that passes all checks

**Best practice**: Don't bypass. Fix the failing checks instead.

## Troubleshooting

### PR Can't Merge: "Required status checks are failing"

**Solution**: Fix the failing checks
1. Click "Details" next to failed check
2. Review workflow logs
3. Fix issues locally
4. Push updated code
5. Checks re-run automatically

### PR Can't Merge: "Branch is out of date"

**Solution**: Update your branch
```bash
git checkout your-branch
git pull origin develop  # or main
git push
```

Or use GitHub's "Update branch" button.

### PR Can't Merge: "Conversations must be resolved"

**Solution**: Resolve all review comments
1. Address each comment
2. Click "Resolve conversation" on each thread
3. Re-request review if needed

### PR Can't Merge: "Requires 1 approving review"

**Solution**: Request review from team member
1. Click "Reviewers" in right sidebar
2. Select reviewer
3. Wait for approval

## Future Enhancements

Potential additions to branch protection:

- **CODEOWNERS file**: Auto-assign reviewers by file path
- **Required reviews: 2**: Increase to 2 approvals for main
- **Deployment approvals**: Manual approval gate for production
- **Code coverage threshold**: Require 90%+ coverage to merge
- **Signed commits**: Require GPG-signed commits

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Project Constitution](CONSTITUTION.md)
- [Feature Spec: GitHub Actions CI/CD](../specs/008-add-build-actions/spec.md)
- [Implementation Plan](../specs/008-add-build-actions/plan.md)

## GitHub Documentation

- [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule)
- [About required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#require-status-checks-before-merging)
