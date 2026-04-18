# Photo MCP Server — Development Guide

> Dual-purpose: project guardrails for this server + template source for future Python MCP projects.

## Prerequisites

- Python 3.13+
- `uv` package manager (`brew install uv`)
- Cloudflare R2 credentials (see ARCHITECTURE.md)

## Quick Start

```bash
cd tools/photo-mcp
cp .env.example .env        # add credentials
make install                 # uv sync --dev
make dev                     # fastmcp dev (opens MCP inspector)
make test                    # run all tests
```

## Make Commands

```bash
make install          # uv sync --dev
make dev              # fastmcp dev inspector
make test             # pytest with coverage (90% required)
make test-integration # integration tests against real R2
make lint             # ruff check
make format           # ruff format
make quality          # lint + format + test
```

## Code Standards

These are non-negotiable. See root CONSTITUTION.md for project-wide principles.

### Quality Non-Negotiables

- **Type hints on all function signatures** — no exceptions
- **No bare `except:`** — always catch specific types
- **No `except Exception as e: pass`** — log or re-raise
- **No `print()` for logging** — use `logging.getLogger(__name__)`
- **No hardcoded credentials** — always from `config.settings`
- **90%+ coverage** — enforced by `--cov-fail-under=90`
- **All tests pass before committing** — `make test` must be green

### Decision Framework

1. Explicit over implicit
2. Standard over novel
3. Simple over complete
4. Tested over theoretical

### Naming

- Files: `snake_case.py`
- Test files: `test_{module}.py` in `tests/`
- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Private: `_leading_underscore`

### Imports

```python
# Standard library first
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

# Third-party second
from pydantic import BaseModel

# Local last
from photo_mcp.config import settings
from photo_mcp.r2 import get_r2_client
```

### Logging

```python
logger = logging.getLogger(__name__)  # always __name__, never hardcoded

logger.debug("Detailed diagnostic")
logger.info(f"Uploaded: {image_id}")
logger.warning(f"Skipping duplicate: {image_id}")
logger.error(f"Failed to upload {filename}: {e}", exc_info=True)
```

### Error Handling in Tools

Tools raise `ValueError` for user-facing errors (bad input, missing gallery, file not found). FastMCP converts these to MCP error responses. Do not catch and silently swallow errors.

```python
# correct
if not path.exists():
    raise ValueError(f"File not found: {file_path}")

# never
try:
    upload(path)
except Exception:
    pass
```

### Datetime

```python
# always timezone-aware
from datetime import datetime, timezone
now = datetime.now(timezone.utc)

# never
datetime.utcnow()
```

## Adding a New Tool

1. Write the logic function in `tools/{domain}.py`
2. Write tests in `tests/test_{domain}.py` — TDD: failing test first
3. Register the tool in `server.py` with `@mcp.tool()`
4. Update `docs/mcp/ARCHITECTURE.md` tool inventory

## Testing Approach

Four test categories:

| Category | File | What it covers |
|----------|------|---------------|
| Contract | `test_types.py` | Pydantic schema validation, required fields |
| Unit | `test_gallery.py`, `test_upload.py` | Logic: slugs, IDs, dedup, URL construction |
| Integration | `test_manifest.py`, `test_integration.py` | R2 calls (mocked or real) |
| Error | All test files | Invalid input, missing files, R2 failures |

Integration tests against real R2 are gated:
```bash
RUN_INTEGRATION_TESTS=1 make test-integration
```

## Dependency Management

```bash
uv add package-name          # add production dependency
uv add --dev package-name    # add dev dependency
uv sync --dev                # install all deps
# Never: pip install, uv pip install, poetry
```

## Pre-Commit Checklist

- [ ] `make test` is green (90%+ coverage)
- [ ] `make lint` passes
- [ ] No bare `except:` clauses
- [ ] All new functions have type hints
- [ ] No `print()` in production code
- [ ] No hardcoded secrets
- [ ] `datetime.now(timezone.utc)` not `datetime.utcnow()`
- [ ] `.env.example` updated if new env vars added
- [ ] `docs/mcp/ARCHITECTURE.md` updated if behaviour changed
- [ ] Commit: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
