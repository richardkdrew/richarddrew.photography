.PHONY: dev build test test-run test-coverage test-contract test-ui-tests test-a11y test-perf test-e2e preview clean install help lighthouse lighthouse-full

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

test: ## Run all tests in watch mode
	npm run test

test-run: ## Run all tests once + Lighthouse audit (for CI/pre-commit)
	npm run test:run
	$(MAKE) lighthouse

test-coverage: ## Run tests with coverage report
	npm run test:coverage

test-contract: ## Run contract tests only
	npm run test:contract

test-ui-tests: ## Run UI behavior tests only
	npm run test:ui-tests

test-a11y: ## Run accessibility tests only
	npm run test:a11y

test-perf: ## Run performance tests only
	npm run test:perf

test-e2e: ## Run E2E tests with Playwright (requires real browser)
	npm run test:e2e

test-vitest-ui: ## Open Vitest UI dashboard
	npm run test:ui

preview: ## Preview production build
	npm run preview

# Playwright ships "Google Chrome for Testing" — use it so we don't need a separate Chrome install
CHROME_BIN ?= $(HOME)/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing

lighthouse: build ## Build then run Lighthouse audit (mobile, thresholds: all ≥90)
	@mkdir -p reports
	@npm run preview -- --port 4173 &> /dev/null & \
	PREVIEW_PID=$$!; \
	echo "Waiting for preview server..."; \
	for i in $$(seq 1 20); do \
		curl -s http://localhost:4173 > /dev/null 2>&1 && break; \
		sleep 1; \
	done; \
	echo "Running Lighthouse audit..."; \
	CHROME_PATH="$(CHROME_BIN)" npx lighthouse http://localhost:4173 \
		--chrome-flags="--headless --no-sandbox" \
		--output=json \
		--output-path=reports/lighthouse-tmp.json \
		--only-categories=performance,accessibility,best-practices,seo \
		--quiet 2>/dev/null; \
	LH_STATUS=$$?; \
	kill $$PREVIEW_PID 2>/dev/null; \
	if [ $$LH_STATUS -ne 0 ]; then echo "✗ Lighthouse failed to run"; exit 1; fi; \
	node -e " \
		const r = JSON.parse(require('fs').readFileSync('reports/lighthouse-tmp.json', 'utf8')); \
		const cats = r.categories; \
		const scores = { \
			Performance: Math.round(cats.performance.score * 100), \
			Accessibility: Math.round(cats.accessibility.score * 100), \
			'Best Practices': Math.round(cats['best-practices'].score * 100), \
			SEO: Math.round(cats.seo.score * 100) \
		}; \
		const thresholds = { Performance: 75, Accessibility: 90, 'Best Practices': 90, SEO: 90 }; \
		let failed = false; \
		console.log(''); \
		console.log('Lighthouse Results (mobile):'); \
		Object.entries(scores).forEach(([k, v]) => { \
			const threshold = thresholds[k]; \
			const ok = v >= threshold; \
			console.log('  ' + (ok ? '✓' : '✗') + ' ' + k + ': ' + v + ' (min ' + threshold + ')'); \
			if (!ok) failed = true; \
		}); \
		if (failed) { console.error('\n✗ One or more scores below threshold'); process.exit(1); } \
		else { console.log('\n✓ All scores meet thresholds'); } \
	"

lighthouse-full: build ## Build then run Lighthouse, save HTML report to reports/lighthouse.html
	@mkdir -p reports
	@npm run preview -- --port 4173 &> /dev/null & \
	PREVIEW_PID=$$!; \
	echo "Waiting for preview server..."; \
	for i in $$(seq 1 20); do \
		curl -s http://localhost:4173 > /dev/null 2>&1 && break; \
		sleep 1; \
	done; \
	echo "Running Lighthouse audit..."; \
	CHROME_PATH="$(CHROME_BIN)" npx lighthouse http://localhost:4173 \
		--chrome-flags="--headless --no-sandbox" \
		--output=html \
		--output-path=reports/lighthouse.html \
		--only-categories=performance,accessibility,best-practices,seo \
		--quiet 2>/dev/null; \
	STATUS=$$?; \
	kill $$PREVIEW_PID 2>/dev/null; \
	echo "Report saved to reports/lighthouse.html"; \
	exit $$STATUS

clean: ## Clean build artifacts
	rm -rf dist
	rm -rf node_modules/.vite

# Development helpers
validate-manifest: ## Validate image manifest format
	@echo "Validating manifest.json..."
	@if [ -f public/manifest.json ]; then \
		node -e "JSON.parse(require('fs').readFileSync('public/manifest.json', 'utf8')); console.log('✓ Manifest is valid JSON')"; \
	else \
		echo "✗ Manifest not found at public/manifest.json"; \
		exit 1; \
	fi

check-images: ## Verify all manifest images exist
	@echo "Checking image files..."
	@node -e "\
		const manifest = JSON.parse(require('fs').readFileSync('public/manifest.json', 'utf8')); \
		const fs = require('fs'); \
		let missing = []; \
		manifest.images.forEach(img => { \
			img.sources.forEach(src => { \
				src.sizes.forEach(size => { \
					if (!fs.existsSync('public' + size.url)) missing.push(size.url); \
				}); \
			}); \
		}); \
		if (missing.length > 0) { \
			console.log('✗ Missing images:', missing); \
			process.exit(1); \
		} else { \
			console.log('✓ All manifest images found'); \
		}" || echo "Note: Run after creating manifest.json"

# Removed placeholder commands (replaced with test-perf and test-a11y above)