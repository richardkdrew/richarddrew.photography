# Deployment Guide

This document explains how to set up and manage deployments for the Photography Portfolio website using GitHub Actions and Cloudflare Pages.

## Overview

The project uses two separate Cloudflare Pages projects for independent staging and production environments:

- **Staging**: `dev-richarddrew-photography` project → `dev.richarddrew.photography`
  - Deploys from `develop` branch
  - Version format: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`)

- **Production**: `richarddrew-photography` project → `richarddrew.photography`
  - Deploys from `main` branch
  - Version format: `v{year}.NNN` sequential counter (e.g., `v2026.004`)
  - Auto-tagging on every push to `main` (not driven by conventional commit types)

This two-project architecture ensures complete environment isolation and stable URLs for both staging and production.

## Prerequisites

### 1. Cloudflare Pages Projects

Ensure both Cloudflare Pages projects exist and are properly configured:

#### Staging Project: `dev-richarddrew-photography`

1. Log into Cloudflare Dashboard
2. Navigate to Workers & Pages → Pages
3. Create or verify project: `dev-richarddrew-photography`
4. Go to Settings → Builds & deployments
5. Set **Production branch** to `develop`
6. Go to Custom domains
7. Add custom domain: `dev.richarddrew.photography`

#### Production Project: `richarddrew-photography`

1. Navigate to Workers & Pages → Pages
2. Create or verify project: `richarddrew-photography`
3. Go to Settings → Builds & deployments
4. Set **Production branch** to `main`
5. Go to Custom domains
6. Add custom domain: `richarddrew.photography`

### 2. Cloudflare API Credentials

You need two pieces of information from Cloudflare:

#### CLOUDFLARE_ACCOUNT_ID

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Look at any page URL: `https://dash.cloudflare.com/{account-id}/...`
3. Copy the account ID (32-character hex string like `a1b2c3d4e5f6...`)

#### CLOUDFLARE_API_TOKEN

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"** OR create custom token:
   - **Permissions**: `Account` → `Cloudflare Pages` → `Edit`
   - **Account Resources**: Include → Your account
4. Click **"Continue to summary"** → **"Create Token"**
5. **COPY THE TOKEN NOW** (you won't see it again!)

## GitHub Secrets Configuration

Add the Cloudflare credentials as GitHub repository secrets:

### Step-by-Step Instructions

1. **Navigate to GitHub Repository Settings**:
   ```
   https://github.com/richardkdrew/richarddrew.photography/settings
   ```

2. **Access Secrets**:
   - Click **"Secrets and variables"** in left sidebar
   - Click **"Actions"**

3. **Add CLOUDFLARE_API_TOKEN**:
   - Click **"New repository secret"**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Paste your API token from Cloudflare
   - Click **"Add secret"**

4. **Add CLOUDFLARE_ACCOUNT_ID**:
   - Click **"New repository secret"**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: Paste your account ID
   - Click **"Add secret"**

### Verify Secrets

After adding secrets, you should see them listed under "Actions secrets":
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

**Security Notes**:
- Secrets are encrypted and never exposed in logs
- Only GitHub Actions workflows in this repository can access them
- Rotate tokens periodically for security
- Never commit secrets to the repository

## Deployment Workflows

### PR Checks Workflow

**File**: `.github/workflows/pr-checks.yml`

**Triggers**: Pull requests to any branch

**Jobs**:
- **Test**: Runs `make test-run` (all test suites)
- **Build**: Runs `make build` (TypeScript + Vite)
- **Accessibility**: Runs `make test-a11y` (dedicated a11y tests)

**Status**: All jobs must pass to allow PR merge

### Staging Deployment Workflow

**File**: `.github/workflows/deploy-dev.yml`

**Triggers**:
- Push to `develop` branch
- Manual trigger (workflow_dispatch)

**Process**:

1. Checkout code
2. Install dependencies
3. Generate version: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`)
4. Build with `VERSION` environment variable
5. Upload build artifact (30-day retention)
6. Deploy to `dev-richarddrew-photography` project

**Deployment URLs**:

- **Custom domain**: <https://dev.richarddrew.photography>
- **Cloudflare default**: <https://dev-richarddrew-photography.pages.dev>

### Production Deployment Workflow

**File**: `.github/workflows/deploy-prod.yml`

**Triggers**:
- Push to `main` branch
- Manual trigger (workflow_dispatch)

**Process**:
1. **Tag Job**:
   - Create sequential `v{year}.NNN` version tag on every push to main
   - Initial version each year: `v{year}.001`

2. **Build and Deploy Job**:
   - Checkout code
   - Install dependencies
   - Build with the generated version (e.g., `v2026.004`)
   - Upload build artifact (30-day retention)
   - Deploy to `richarddrew-photography` project
   - Create GitHub Release with changelog

**Deployment URLs**:

- **Custom domain**: <https://richarddrew.photography>
- **Cloudflare default**: <https://richarddrew-photography.pages.dev>

## Version Injection

The build process injects version information into HTML meta tags:

```html
<meta name="version" content="v2026.004">
<meta name="build-date" content="2025-10-16T14:32:00Z">
```

**Implementation**: Vite plugin (`src/plugins/vite-plugin-version-injector.ts`)

**Version Formats**:

- **Dev**: `v{year}.dev-{git-sha}` (e.g., `v2026.dev-a1b2c3d`) — set by `deploy-dev.yml` on every push to `develop`
- **Prod**: `v{year}.NNN` (e.g., `v2026.004`) — sequential counter set by the `tag` job in `deploy-prod.yml` on every push to `main`
- **Local**: `v{year}.dev-local` (default when `VERSION` env var not set)

## Manual Deployments

Both deployment workflows support manual triggering for emergency deployments or testing.

**To manually trigger a deployment**:

1. Go to [GitHub Actions tab](https://github.com/richardkdrew/richarddrew.photography/actions)
2. Select workflow:
   - **Staging**: "Deploy to Dev (Staging)"
   - **Production**: "Deploy to Production"
3. Click **"Run workflow"**
4. Select branch (develop or main)
5. Click **"Run workflow"** button

## Build Artifacts

Build artifacts are automatically uploaded and retained for 30 days.

**To download artifacts**:

1. Go to GitHub Actions tab
2. Click on a completed workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `dev-build-dev-{sha}` (staging builds)
   - `production-build-v{version}` (production builds)

**Use cases**:

- Debugging production issues
- Comparing builds between versions
- Rollback reference

## Troubleshooting

### Deployment Fails: "Unauthorized"

**Cause**: Invalid or expired `CLOUDFLARE_API_TOKEN`

**Solution**:

1. Generate new API token in Cloudflare Dashboard
2. Update `CLOUDFLARE_API_TOKEN` secret in GitHub
3. Re-run failed workflow

### Deployment Fails: "Project not found"

**Cause**: Cloudflare Pages project doesn't exist

**Solution**:

1. Create projects in Cloudflare Dashboard:
   - Staging: `dev-richarddrew-photography` (production branch: `develop`)
   - Production: `richarddrew-photography` (production branch: `main`)
2. Re-run failed workflow

### Build Fails: "VERSION not set"

**Cause**: Workflow not passing VERSION environment variable

**Solution**:

- Check workflow YAML files have VERSION set correctly
- For local builds, VERSION defaults to "dev-local" (expected behavior)

### Tests Fail in PR Checks

**Cause**: Code changes broke tests or a11y requirements

**Solution**:

1. Run tests locally: `make test-run`
2. Run a11y tests locally: `make test-a11y`
3. Fix failing tests
4. Push updated code to PR

## Monitoring

### GitHub Actions

Monitor workflow runs: [GitHub Actions Dashboard](https://github.com/richardkdrew/richarddrew.photography/actions)

**Status badges** in README.md show real-time status:

- Build status
- Tests passing
- Accessibility compliance
- Deployment status
- Latest version

### Cloudflare Pages

Monitor deployments in Cloudflare Dashboard:

1. Navigate to Workers & Pages → Pages
2. Select project:
   - Staging: `dev-richarddrew-photography`
   - Production: `richarddrew-photography`
3. View deployment history, logs, and metrics

## Rollback Procedure

If a production deployment needs to be rolled back:

### Option 1: Revert Commit

1. Revert the problematic commit on main branch
2. Push to main → triggers new deployment with previous code

### Option 2: Manual Deploy from Artifact

1. Download previous production build artifact from GitHub Actions
2. Use Wrangler CLI to deploy manually:

   ```bash
   npx wrangler pages deploy dist/ --project-name=richarddrew-photography
   ```

### Option 3: Cloudflare Rollback

1. Go to Cloudflare Pages project
2. View deployment history
3. Click "..." on previous deployment
4. Select "Rollback to this deployment"

## Security Best Practices

1. **Rotate API tokens** every 90 days
2. **Use scoped tokens** with minimum required permissions (Pages:Edit only)
3. **Enable 2FA** on Cloudflare account
4. **Review deployment logs** for suspicious activity
5. **Monitor GitHub Actions** usage and workflow runs
6. **Never commit secrets** to repository
7. **Use branch protection** rules (see [BRANCH-PROTECTION.md](./BRANCH-PROTECTION.md))

## Support

For issues or questions:

- [GitHub Issues](https://github.com/richardkdrew/richarddrew.photography/issues)
- [Cloudflare Support](https://support.cloudflare.com)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Related Documentation

- [Branch Protection Rules](./BRANCH-PROTECTION.md)
- [Project Constitution](CONSTITUTION.md)
- [Feature Spec: GitHub Actions CI/CD](../specs/008-add-build-actions/spec.md)
- [Implementation Plan](../specs/008-add-build-actions/plan.md)
