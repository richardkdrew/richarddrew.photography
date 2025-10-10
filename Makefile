.PHONY: dev build test test-run test-coverage test-contract test-ui-tests test-a11y test-perf preview clean install help

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

test-run: ## Run all tests once (for CI/pre-commit)
	npm run test:run

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

test-vitest-ui: ## Open Vitest UI dashboard
	npm run test:ui

preview: ## Preview production build
	npm run preview

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