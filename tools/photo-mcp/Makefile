.PHONY: install dev test test-integration lint format quality

install:
	uv sync --dev

dev:
	uv run fastmcp dev src/photo_mcp/server.py

test:
	uv run pytest

test-integration:
	RUN_INTEGRATION_TESTS=1 uv run pytest tests/test_integration.py -v

lint:
	uv run ruff check src/ tests/

format:
	uv run ruff format src/ tests/

quality: lint format test
