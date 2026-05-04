# Photo MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Python FastMCP server that uploads photos to Cloudflare R2, maintains a lean JSON manifest, and implement the TypeScript `CloudflareR2GalleryDataService` that fetches that manifest and constructs on-the-fly resize URLs for the portfolio web UI.

**Architecture:** A local Python process (`tools/photo-mcp/`) exposes four MCP tools (`create_gallery`, `upload_photo`, `batch_upload`, `list_galleries`) via FastMCP. Photos are stored as originals in R2; resize variants are generated on-the-fly by Cloudflare Image Resizing via `cdn-cgi/image/` URLs. The web UI's `CloudflareR2GalleryDataService` fetches the R2 manifest and maps it to `ResponsiveImage[]` — the `IGalleryDataService` interface is unchanged.

**Tech Stack:** Python 3.13+, FastMCP 2.x, boto3 (S3-compatible R2), Pydantic v2, pydantic-settings, Pillow, pytest, ruff, uv. TypeScript/Vitest for the web UI service.

**Spec:** `docs/superpowers/specs/2026-04-18-photo-mcp-server-design.md`

---

## File Map

### New files (Python MCP server)
- `tools/photo-mcp/pyproject.toml` — project config, deps, pytest config
- `tools/photo-mcp/Makefile` — dev commands
- `tools/photo-mcp/.env.example` — env var template
- `tools/photo-mcp/.gitignore` — ignore .env, pycache, etc.
- `tools/photo-mcp/src/photo_mcp/__init__.py` — empty
- `tools/photo-mcp/src/photo_mcp/types.py` — Pydantic models for manifest and tool I/O
- `tools/photo-mcp/src/photo_mcp/config.py` — pydantic-settings Settings class
- `tools/photo-mcp/src/photo_mcp/r2.py` — boto3 R2 client factory
- `tools/photo-mcp/src/photo_mcp/manifest.py` — manifest load/save via R2
- `tools/photo-mcp/src/photo_mcp/tools/__init__.py` — empty
- `tools/photo-mcp/src/photo_mcp/tools/gallery.py` — create_gallery, list_galleries logic
- `tools/photo-mcp/src/photo_mcp/tools/upload.py` — upload_photo, batch_upload logic
- `tools/photo-mcp/src/photo_mcp/server.py` — FastMCP entry point, registers all tools
- `tools/photo-mcp/tests/conftest.py` — env var setup, shared fixtures
- `tools/photo-mcp/tests/test_types.py` — Pydantic model contract tests
- `tools/photo-mcp/tests/test_config.py` — settings loading tests
- `tools/photo-mcp/tests/test_manifest.py` — manifest load/save tests
- `tools/photo-mcp/tests/test_gallery.py` — gallery tool tests
- `tools/photo-mcp/tests/test_upload.py` — upload tool tests
- `tools/photo-mcp/tests/test_integration.py` — R2 integration tests (gated)

### New files (docs)
- `docs/mcp/ARCHITECTURE.md` — MCP system architecture, R2 setup steps
- `docs/mcp/DEVELOPMENT.md` — Python/FastMCP dev standards for this project

### Modified files
- `src/services/cloudflare-r2.gallery-data.service.ts` — implement (currently a stub)
- `src/services/gallery-data.service.ts` — update factory to pass manifest URL to R2 service
- `src/vite-env.d.ts` — add `VITE_R2_MANIFEST_URL` env var type
- `tests/services/gallery-data.service.factory.test.ts` — update factory test
- `.mcp.json` — register photo-mcp server
- `.gitignore` — add Python cache patterns

---

## Task 1: Documentation

**Files:**
- Create: `docs/mcp/ARCHITECTURE.md`
- Create: `docs/mcp/DEVELOPMENT.md`

- [ ] **Step 1: Create docs/mcp/ARCHITECTURE.md**

```bash
mkdir -p docs/mcp
```

Write `docs/mcp/ARCHITECTURE.md`:

```markdown
# Photo MCP Server — Architecture

## System Overview

```
Local machine
┌──────────────────────────────────────────────┐
│  Claude / AI assistant                        │
│        │ MCP protocol (stdio)                 │
│        ▼                                      │
│  tools/photo-mcp/  (FastMCP, Python)          │
│        │ boto3 S3-compatible API              │
└────────┼─────────────────────────────────────┘
         │
         ▼
Cloudflare R2 (portfolio-photos bucket)
├── landscapes/mountain-sunset.jpg   ← originals only
├── portraits/studio-1.jpg
└── manifest.json                    ← lean manifest

         │  https://photos.richarddrew.photography/manifest.json
         ▼
Web UI (Cloudflare Pages)
  CloudflareR2GalleryDataService
        │ fetches manifest, constructs cdn-cgi/image/ URLs
        ▼
  Gallery component (ResponsiveImage[] — unchanged interface)
```

## Image Resizing

Cloudflare Image Resizing handles on-the-fly resizing. Only one original is stored per photo. Free tier: 1M transforms/month.

URL pattern:
```
https://photos.richarddrew.photography/cdn-cgi/image/width=400,format=webp,quality=85/landscapes/mountain-sunset.jpg
```

Retina/HiDPI (DPR=2) is handled automatically by the browser via `w` descriptors in `srcset`. No explicit 2x variants are needed.

## Manifest Schema

Stored at `manifest.json` in the R2 bucket root.

```json
{
  "version": "1.0",
  "generated": "2026-04-18T10:00:00Z",
  "base_url": "https://photos.richarddrew.photography",
  "galleries": {
    "landscapes": {
      "title": "Landscapes",
      "description": "Nature and landscape photography",
      "created": "2026-04-18T10:00:00Z"
    }
  },
  "images": {
    "mountain-sunset": {
      "id": "mountain-sunset",
      "filename": "mountain-sunset.jpg",
      "path": "landscapes/mountain-sunset.jpg",
      "gallery": "landscapes",
      "alt": "Mountain at golden hour",
      "date_taken": "2025-08-15",
      "uploaded": "2026-04-18T10:00:00Z",
      "dimensions": { "width": 6000, "height": 4000 }
    }
  }
}
```

## MCP Tools (v1)

| Tool | Purpose |
|------|---------|
| `create_gallery(name, description)` | Create gallery entry in manifest |
| `list_galleries()` | List galleries with photo counts |
| `upload_photo(file_path, gallery, alt, date_taken)` | Upload single photo + update manifest |
| `batch_upload(folder_path, gallery, alt_prefix, date_taken)` | Upload all images from folder |

## R2 / Cloudflare Setup

One-time manual steps:

1. **Create R2 bucket** in Cloudflare dashboard → Storage & Databases → R2 → Create bucket. Name: `portfolio-photos`.

2. **Custom domain** → bucket Settings → Custom Domains → Connect Domain. Add `photos.richarddrew.photography`. Ensure your Cloudflare DNS has this domain.

3. **Verify Image Resizing** — test a URL like `https://photos.richarddrew.photography/cdn-cgi/image/width=400,format=webp/test.jpg` returns a resized image (requires a test file in R2 first).

4. **R2 API token** → My Profile → API Tokens → Create Token → Use "Edit Cloudflare Workers" template → scope to `portfolio-photos` bucket with Object Read & Write. Copy the token — you won't see it again.

5. **Account ID** → Cloudflare dashboard right sidebar.

6. **Access Key ID + Secret** → R2 bucket → Manage R2 API Tokens → Create API Token → select your token → generate credentials.

7. **CORS policy** → R2 bucket → Settings → CORS Policy:
```json
[
  {
    "AllowedOrigins": ["https://richarddrew.photography", "http://localhost:3000"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

## Environment Variables

```bash
# tools/photo-mcp/.env (local dev only — never commit)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=portfolio-photos
R2_BASE_URL=https://photos.richarddrew.photography
MANIFEST_PATH=manifest.json
```

For MCP usage via Claude Code, set these in `~/.zshrc`:
```bash
export R2_ACCOUNT_ID=your-cloudflare-account-id
export R2_ACCESS_KEY_ID=your-r2-access-key-id
export R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
export R2_BUCKET_NAME=portfolio-photos
export R2_BASE_URL=https://photos.richarddrew.photography
```

## Project Structure

```
tools/photo-mcp/
├── src/photo_mcp/
│   ├── server.py         # FastMCP entry point
│   ├── config.py         # pydantic-settings
│   ├── r2.py             # boto3 R2 client factory
│   ├── manifest.py       # manifest load/save
│   ├── types.py          # Pydantic models
│   └── tools/
│       ├── gallery.py    # create_gallery, list_galleries
│       └── upload.py     # upload_photo, batch_upload
└── tests/
    ├── conftest.py
    ├── test_types.py
    ├── test_config.py
    ├── test_manifest.py
    ├── test_gallery.py
    ├── test_upload.py
    └── test_integration.py
```
```

- [ ] **Step 2: Create docs/mcp/DEVELOPMENT.md**

Write `docs/mcp/DEVELOPMENT.md`:

```markdown
# Photo MCP Server — Development Guide

> Dual-purpose: project guardrails for this server + template source for future Python MCP projects.

## Prerequisites

- Python 3.13+
- `uv` package manager (`brew install uv`)
- Cloudflare R2 credentials (see ARCHITECTURE.md)

## Quick Start

```bash
cd tools/photo-mcp
cp .env.example .env        # fill in credentials
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
logger.warning("Skipping duplicate: {image_id}")
logger.error(f"Failed to upload {filename}: {e}", exc_info=True)
```

### Error Handling in Tools

Tools raise `ValueError` for user-facing errors (bad input, missing gallery, file not found). FastMCP converts these to MCP error responses. Do not catch and silently swallow errors.

```python
# ✅ correct
if not path.exists():
    raise ValueError(f"File not found: {file_path}")

# ❌ never
try:
    upload(path)
except Exception:
    pass
```

### Datetime

```python
# ✅ always timezone-aware
from datetime import datetime, timezone
now = datetime.now(timezone.utc)

# ❌ never
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/mcp/ARCHITECTURE.md docs/mcp/DEVELOPMENT.md
git commit -m "docs: add MCP server architecture and development guide"
```

---

## Task 2: Project Scaffold

**Files:**
- Create: `tools/photo-mcp/pyproject.toml`
- Create: `tools/photo-mcp/Makefile`
- Create: `tools/photo-mcp/.env.example`
- Create: `tools/photo-mcp/.gitignore`
- Create: `tools/photo-mcp/src/photo_mcp/__init__.py`
- Create: `tools/photo-mcp/src/photo_mcp/tools/__init__.py`
- Create: `tools/photo-mcp/tests/__init__.py`
- Modify: `.gitignore`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p tools/photo-mcp/src/photo_mcp/tools
mkdir -p tools/photo-mcp/tests
touch tools/photo-mcp/src/photo_mcp/__init__.py
touch tools/photo-mcp/src/photo_mcp/tools/__init__.py
touch tools/photo-mcp/tests/__init__.py
```

- [ ] **Step 2: Create tools/photo-mcp/pyproject.toml**

```toml
[project]
name = "photo-mcp"
version = "0.1.0"
description = "MCP server for managing photos in Cloudflare R2"
requires-python = ">=3.13"
dependencies = [
    "fastmcp>=2.0.0",
    "boto3>=1.34.0,<2.0.0",
    "pydantic>=2.0.0,<3.0.0",
    "pydantic-settings>=2.0.0,<3.0.0",
    "Pillow>=10.0.0,<12.0.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-cov>=4.0.0",
    "pytest-mock>=3.0.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/photo_mcp"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
addopts = "--cov=photo_mcp --cov-report=term-missing --cov-fail-under=90"

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
```

- [ ] **Step 3: Create tools/photo-mcp/Makefile**

```makefile
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
```

- [ ] **Step 4: Create tools/photo-mcp/.env.example**

```bash
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=portfolio-photos
R2_BASE_URL=https://photos.richarddrew.photography
MANIFEST_PATH=manifest.json
LOG_LEVEL=INFO
```

- [ ] **Step 5: Create tools/photo-mcp/.gitignore**

```
.env
__pycache__/
*.egg-info/
.pytest_cache/
htmlcov/
.coverage
dist/
.venv/
```

- [ ] **Step 6: Update root .gitignore with Python patterns**

Add to `.gitignore` after the `# Claude Code specific` section:

```
# Python
__pycache__/
*.egg-info/
.pytest_cache/
htmlcov/
.coverage
```

- [ ] **Step 7: Install dependencies**

```bash
cd tools/photo-mcp
uv sync --dev
```

Expected: resolves and installs fastmcp, boto3, pydantic, pillow, pytest, ruff.

- [ ] **Step 8: Commit**

```bash
git add tools/photo-mcp/ .gitignore
git commit -m "feat: scaffold photo-mcp Python project"
```

---

## Task 3: Pydantic Types

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/types.py`
- Create: `tools/photo-mcp/tests/test_types.py`

- [ ] **Step 1: Write failing tests**

Write `tools/photo-mcp/tests/test_types.py`:

```python
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError


def test_image_dimensions_requires_width_and_height():
    from photo_mcp.types import ImageDimensions
    with pytest.raises(ValidationError):
        ImageDimensions(width=100)  # missing height


def test_manifest_image_requires_required_fields():
    from photo_mcp.types import ManifestImage
    with pytest.raises(ValidationError):
        ManifestImage(id="x")  # missing filename, path, gallery, alt, uploaded, dimensions


def test_manifest_image_date_taken_is_optional():
    from photo_mcp.types import ManifestImage, ImageDimensions
    img = ManifestImage(
        id="test",
        filename="test.jpg",
        path="landscapes/test.jpg",
        gallery="landscapes",
        alt="A test image",
        uploaded=datetime.now(timezone.utc),
        dimensions=ImageDimensions(width=3000, height=2000),
    )
    assert img.date_taken is None


def test_manifest_defaults_to_empty_galleries_and_images():
    from photo_mcp.types import Manifest
    m = Manifest(generated=datetime.now(timezone.utc), base_url="https://photos.test.com")
    assert m.galleries == {}
    assert m.images == {}
    assert m.version == "1.0"


def test_manifest_round_trips_via_json():
    from photo_mcp.types import Manifest, ManifestGallery, ManifestImage, ImageDimensions
    m = Manifest(
        generated=datetime.now(timezone.utc),
        base_url="https://photos.test.com",
        galleries={"landscapes": ManifestGallery(title="Landscapes", created=datetime.now(timezone.utc))},
        images={"test-img": ManifestImage(
            id="test-img", filename="test.jpg", path="landscapes/test.jpg",
            gallery="landscapes", alt="Test", uploaded=datetime.now(timezone.utc),
            dimensions=ImageDimensions(width=3000, height=2000)
        )}
    )
    json_str = m.model_dump_json()
    restored = Manifest.model_validate_json(json_str)
    assert restored.base_url == "https://photos.test.com"
    assert "test-img" in restored.images
    assert "landscapes" in restored.galleries


def test_gallery_summary_has_expected_fields():
    from photo_mcp.types import GallerySummary
    s = GallerySummary(slug="landscapes", title="Landscapes", description="", photo_count=5)
    assert s.photo_count == 5
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_types.py -v
```

Expected: `ModuleNotFoundError: No module named 'photo_mcp.types'`

- [ ] **Step 3: Implement types.py**

Write `tools/photo-mcp/src/photo_mcp/types.py`:

```python
from datetime import datetime
from pydantic import BaseModel


class ImageDimensions(BaseModel):
    width: int
    height: int


class ManifestImage(BaseModel):
    id: str
    filename: str
    path: str
    gallery: str
    alt: str
    date_taken: str | None = None
    uploaded: datetime
    dimensions: ImageDimensions


class ManifestGallery(BaseModel):
    title: str
    description: str = ""
    created: datetime


class Manifest(BaseModel):
    version: str = "1.0"
    generated: datetime
    base_url: str
    galleries: dict[str, ManifestGallery] = {}
    images: dict[str, ManifestImage] = {}


class GallerySummary(BaseModel):
    slug: str
    title: str
    description: str
    photo_count: int
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_types.py -v
```

Expected: 6 tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/types.py tools/photo-mcp/tests/test_types.py
git commit -m "feat: add Pydantic types for photo-mcp manifest"
```

---

## Task 4: Config and conftest

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/config.py`
- Create: `tools/photo-mcp/tests/conftest.py`
- Create: `tools/photo-mcp/tests/test_config.py`

- [ ] **Step 1: Create tests/conftest.py**

This must be created BEFORE test_config.py so env vars are set before any module is imported by pytest.

Write `tools/photo-mcp/tests/conftest.py`:

```python
import os

# Set env vars before any photo_mcp modules are imported.
# pydantic-settings reads env vars at Settings() creation time (module import).
os.environ.setdefault("R2_ACCOUNT_ID", "test-account-id")
os.environ.setdefault("R2_ACCESS_KEY_ID", "test-access-key")
os.environ.setdefault("R2_SECRET_ACCESS_KEY", "test-secret-key")
os.environ.setdefault("R2_BUCKET_NAME", "test-bucket")
os.environ.setdefault("R2_BASE_URL", "https://photos.test.com")
os.environ.setdefault("MANIFEST_PATH", "manifest.json")
os.environ.setdefault("LOG_LEVEL", "WARNING")
```

- [ ] **Step 2: Write failing tests**

Write `tools/photo-mcp/tests/test_config.py`:

```python
def test_settings_loads_from_environment():
    from photo_mcp.config import settings
    assert settings.r2_account_id == "test-account-id"
    assert settings.r2_access_key_id == "test-access-key"
    assert settings.r2_bucket_name == "test-bucket"
    assert settings.r2_base_url == "https://photos.test.com"
    assert settings.manifest_path == "manifest.json"


def test_settings_has_default_log_level():
    from photo_mcp.config import settings
    assert settings.log_level.upper() in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")


def test_settings_has_default_manifest_path():
    from photo_mcp.config import settings
    assert settings.manifest_path == "manifest.json"
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_config.py -v
```

Expected: `ModuleNotFoundError: No module named 'photo_mcp.config'`

- [ ] **Step 4: Implement config.py**

Write `tools/photo-mcp/src/photo_mcp/config.py`:

```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    r2_account_id: str = Field(..., description="Cloudflare account ID")
    r2_access_key_id: str = Field(..., description="R2 access key ID")
    r2_secret_access_key: str = Field(..., description="R2 secret access key")
    r2_bucket_name: str = Field(default="portfolio-photos", description="R2 bucket name")
    r2_base_url: str = Field(..., description="Base URL for photos CDN")
    manifest_path: str = Field(default="manifest.json", description="Path to manifest in R2")
    log_level: str = Field(default="INFO", description="Logging level")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow",
    )


settings = Settings()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_config.py -v
```

Expected: 3 tests PASSED.

- [ ] **Step 6: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/config.py tools/photo-mcp/tests/conftest.py tools/photo-mcp/tests/test_config.py
git commit -m "feat: add pydantic-settings config for photo-mcp"
```

---

## Task 5: R2 Client and Manifest

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/r2.py`
- Create: `tools/photo-mcp/src/photo_mcp/manifest.py`
- Create: `tools/photo-mcp/tests/test_manifest.py`

- [ ] **Step 1: Write failing tests**

Write `tools/photo-mcp/tests/test_manifest.py`:

```python
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock
from botocore.exceptions import ClientError


def _client_error(code: str) -> ClientError:
    return ClientError({"Error": {"Code": code, "Message": "test"}}, "GetObject")


def test_load_manifest_returns_empty_when_not_found(mocker):
    mock_client = MagicMock()
    mock_client.get_object.side_effect = _client_error("NoSuchKey")
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest
    manifest = load_manifest()

    assert manifest.version == "1.0"
    assert manifest.galleries == {}
    assert manifest.images == {}


def test_load_manifest_parses_existing_manifest(mocker):
    mock_client = MagicMock()
    data = {
        "version": "1.0",
        "generated": "2026-04-18T10:00:00Z",
        "base_url": "https://photos.test.com",
        "galleries": {
            "landscapes": {"title": "Landscapes", "description": "", "created": "2026-04-18T10:00:00Z"}
        },
        "images": {}
    }
    mock_client.get_object.return_value = {"Body": MagicMock(read=lambda: json.dumps(data).encode())}
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest
    manifest = load_manifest()

    assert "landscapes" in manifest.galleries
    assert manifest.galleries["landscapes"].title == "Landscapes"


def test_load_manifest_raises_on_unexpected_r2_error(mocker):
    import pytest
    mock_client = MagicMock()
    mock_client.get_object.side_effect = _client_error("AccessDenied")
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest
    with pytest.raises(ClientError):
        load_manifest()


def test_save_manifest_writes_json_to_r2(mocker):
    from photo_mcp.types import Manifest
    mock_client = MagicMock()
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)
    mocker.patch("photo_mcp.manifest.settings.r2_bucket_name", "test-bucket")
    mocker.patch("photo_mcp.manifest.settings.manifest_path", "manifest.json")

    from photo_mcp.manifest import save_manifest
    manifest = Manifest(generated=datetime.now(timezone.utc), base_url="https://photos.test.com")
    save_manifest(manifest)

    mock_client.put_object.assert_called_once()
    call_kwargs = mock_client.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "test-bucket"
    assert call_kwargs["Key"] == "manifest.json"
    assert call_kwargs["ContentType"] == "application/json"
    body = json.loads(call_kwargs["Body"].decode())
    assert body["base_url"] == "https://photos.test.com"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_manifest.py -v
```

Expected: `ModuleNotFoundError: No module named 'photo_mcp.r2'`

- [ ] **Step 3: Implement r2.py**

Write `tools/photo-mcp/src/photo_mcp/r2.py`:

```python
import boto3
from botocore.config import Config

from photo_mcp.config import settings


def get_r2_client():
    """Create a boto3 S3-compatible client for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
```

- [ ] **Step 4: Implement manifest.py**

Write `tools/photo-mcp/src/photo_mcp/manifest.py`:

```python
import json
import logging
from datetime import datetime, timezone

from botocore.exceptions import ClientError

from photo_mcp.config import settings
from photo_mcp.r2 import get_r2_client
from photo_mcp.types import Manifest

logger = logging.getLogger(__name__)


def load_manifest() -> Manifest:
    """Load manifest from R2. Returns empty manifest if not found."""
    client = get_r2_client()
    try:
        response = client.get_object(
            Bucket=settings.r2_bucket_name,
            Key=settings.manifest_path,
        )
        data = json.loads(response["Body"].read().decode("utf-8"))
        return Manifest.model_validate(data)
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            logger.info("Manifest not found in R2 — creating empty manifest")
            return Manifest(
                generated=datetime.now(timezone.utc),
                base_url=settings.r2_base_url,
            )
        raise


def save_manifest(manifest: Manifest) -> None:
    """Write manifest to R2 as JSON."""
    client = get_r2_client()
    manifest.generated = datetime.now(timezone.utc)
    body = manifest.model_dump_json(indent=2).encode("utf-8")
    client.put_object(
        Bucket=settings.r2_bucket_name,
        Key=settings.manifest_path,
        Body=body,
        ContentType="application/json",
    )
    logger.info(f"Manifest saved to R2: {settings.manifest_path}")
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_manifest.py -v
```

Expected: 4 tests PASSED.

- [ ] **Step 6: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/r2.py tools/photo-mcp/src/photo_mcp/manifest.py tools/photo-mcp/tests/test_manifest.py
git commit -m "feat: add R2 client and manifest load/save"
```

---

## Task 6: Gallery Tools

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/tools/gallery.py`
- Create: `tools/photo-mcp/tests/test_gallery.py`

- [ ] **Step 1: Write failing tests**

Write `tools/photo-mcp/tests/test_gallery.py`:

```python
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

from photo_mcp.types import Manifest, ManifestGallery, ManifestImage, ImageDimensions


def _make_manifest(**kwargs) -> Manifest:
    return Manifest(generated=datetime.now(timezone.utc), base_url="https://photos.test.com", **kwargs)


def _make_image(gallery: str, image_id: str = "img-1") -> ManifestImage:
    return ManifestImage(
        id=image_id, filename=f"{image_id}.jpg", path=f"{gallery}/{image_id}.jpg",
        gallery=gallery, alt="Test", uploaded=datetime.now(timezone.utc),
        dimensions=ImageDimensions(width=3000, height=2000),
    )


# --- derive_slug ---

def test_derive_slug_lowercases():
    from photo_mcp.tools.gallery import derive_slug
    assert derive_slug("Summer Adventures") == "summer-adventures"


def test_derive_slug_replaces_spaces_with_hyphens():
    from photo_mcp.tools.gallery import derive_slug
    assert derive_slug("My Photo Gallery") == "my-photo-gallery"


def test_derive_slug_strips_special_chars():
    from photo_mcp.tools.gallery import derive_slug
    assert derive_slug("Café & Sunsets!") == "caf-sunsets"


def test_derive_slug_collapses_multiple_hyphens():
    from photo_mcp.tools.gallery import derive_slug
    assert derive_slug("Hello   World") == "hello-world"


# --- create_gallery ---

def test_create_gallery_adds_entry_to_manifest(mocker):
    from photo_mcp.tools.gallery import create_gallery
    manifest = _make_manifest()
    mocker.patch("photo_mcp.tools.gallery.load_manifest", return_value=manifest)
    mock_save = mocker.patch("photo_mcp.tools.gallery.save_manifest")

    result = create_gallery("Summer 2024", "Summer holiday shots")

    assert result["slug"] == "summer-2024"
    assert result["title"] == "Summer 2024"
    assert result["photo_count"] == 0
    assert result["created"] is True
    mock_save.assert_called_once_with(manifest)
    assert "summer-2024" in manifest.galleries


def test_create_gallery_is_idempotent(mocker):
    from photo_mcp.tools.gallery import create_gallery
    gallery = ManifestGallery(title="Landscapes", created=datetime.now(timezone.utc))
    manifest = _make_manifest(galleries={"landscapes": gallery})
    mocker.patch("photo_mcp.tools.gallery.load_manifest", return_value=manifest)
    mock_save = mocker.patch("photo_mcp.tools.gallery.save_manifest")

    result = create_gallery("Landscapes")

    assert result["slug"] == "landscapes"
    assert result["created"] is False
    mock_save.assert_not_called()


def test_create_gallery_returns_correct_photo_count(mocker):
    from photo_mcp.tools.gallery import create_gallery
    gallery = ManifestGallery(title="Landscapes", created=datetime.now(timezone.utc))
    manifest = _make_manifest(
        galleries={"landscapes": gallery},
        images={"img-1": _make_image("landscapes"), "img-2": _make_image("landscapes", "img-2")},
    )
    mocker.patch("photo_mcp.tools.gallery.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.gallery.save_manifest")

    result = create_gallery("Landscapes")
    assert result["photo_count"] == 2


# --- list_galleries ---

def test_list_galleries_returns_all_galleries_with_counts(mocker):
    from photo_mcp.tools.gallery import list_galleries
    gallery = ManifestGallery(title="Landscapes", created=datetime.now(timezone.utc))
    manifest = _make_manifest(
        galleries={"landscapes": gallery},
        images={"img-1": _make_image("landscapes")},
    )
    mocker.patch("photo_mcp.tools.gallery.load_manifest", return_value=manifest)

    result = list_galleries()

    assert len(result) == 1
    assert result[0]["slug"] == "landscapes"
    assert result[0]["title"] == "Landscapes"
    assert result[0]["photo_count"] == 1


def test_list_galleries_returns_empty_list_when_no_galleries(mocker):
    from photo_mcp.tools.gallery import list_galleries
    mocker.patch("photo_mcp.tools.gallery.load_manifest", return_value=_make_manifest())

    result = list_galleries()
    assert result == []
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_gallery.py -v
```

Expected: `ModuleNotFoundError: No module named 'photo_mcp.tools.gallery'`

- [ ] **Step 3: Implement gallery.py**

Write `tools/photo-mcp/src/photo_mcp/tools/gallery.py`:

```python
import logging
import re
from datetime import datetime, timezone

from photo_mcp.manifest import load_manifest, save_manifest
from photo_mcp.types import ManifestGallery

logger = logging.getLogger(__name__)


def derive_slug(name: str) -> str:
    """Convert a display name to a URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def create_gallery(name: str, description: str = "") -> dict:
    """Create a gallery entry in the manifest. Idempotent."""
    slug = derive_slug(name)
    manifest = load_manifest()

    if slug in manifest.galleries:
        photo_count = sum(1 for img in manifest.images.values() if img.gallery == slug)
        logger.info(f"Gallery already exists: {slug}")
        return {"slug": slug, "title": name, "description": description, "photo_count": photo_count, "created": False}

    manifest.galleries[slug] = ManifestGallery(
        title=name,
        description=description,
        created=datetime.now(timezone.utc),
    )
    save_manifest(manifest)
    logger.info(f"Created gallery: {slug}")
    return {"slug": slug, "title": name, "description": description, "photo_count": 0, "created": True}


def list_galleries() -> list[dict]:
    """List all galleries with photo counts."""
    manifest = load_manifest()
    result = []
    for slug, gallery in manifest.galleries.items():
        photo_count = sum(1 for img in manifest.images.values() if img.gallery == slug)
        result.append({
            "slug": slug,
            "title": gallery.title,
            "description": gallery.description,
            "photo_count": photo_count,
        })
    return result
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_gallery.py -v
```

Expected: 10 tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/tools/gallery.py tools/photo-mcp/tests/test_gallery.py
git commit -m "feat: add create_gallery and list_galleries tools"
```

---

## Task 7: Upload Tool (single photo)

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/tools/upload.py` (partial — single upload only)
- Create: `tools/photo-mcp/tests/test_upload.py` (partial)

- [ ] **Step 1: Write failing tests for single upload**

Write `tools/photo-mcp/tests/test_upload.py`:

```python
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from photo_mcp.types import Manifest, ManifestGallery, ImageDimensions


def _make_manifest_with_gallery(slug: str = "landscapes") -> Manifest:
    return Manifest(
        generated=datetime.now(timezone.utc),
        base_url="https://photos.test.com",
        galleries={slug: ManifestGallery(title=slug.title(), created=datetime.now(timezone.utc))},
    )


def _create_test_image(directory: Path, name: str = "test-photo.jpg") -> Path:
    """Create a minimal valid JPEG for testing."""
    from PIL import Image
    path = directory / name
    img = Image.new("RGB", (100, 75), color=(255, 0, 0))
    img.save(path, "JPEG")
    return path


# --- derive_id ---

def test_derive_id_lowercases_filename():
    from photo_mcp.tools.upload import derive_id
    assert derive_id("/some/path/Mountain-Sunset.jpg") == "mountain-sunset"


def test_derive_id_replaces_spaces_with_hyphens():
    from photo_mcp.tools.upload import derive_id
    assert derive_id("/path/my photo.jpg") == "my-photo"


def test_derive_id_strips_extension():
    from photo_mcp.tools.upload import derive_id
    assert derive_id("/path/IMG_1234.jpg") == "img-1234"


# --- humanise_filename ---

def test_humanise_filename_title_cases_stem():
    from photo_mcp.tools.upload import humanise_filename
    assert humanise_filename("/path/mountain-sunset.jpg") == "Mountain Sunset"


def test_humanise_filename_replaces_underscores():
    from photo_mcp.tools.upload import humanise_filename
    assert humanise_filename("/path/IMG_1234.jpg") == "Img 1234"


# --- upload_photo validation ---

def test_upload_photo_raises_for_missing_file(mocker):
    from photo_mcp.tools.upload import upload_photo
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=_make_manifest_with_gallery())

    with pytest.raises(ValueError, match="File not found"):
        upload_photo("/nonexistent/photo.jpg", "landscapes")


def test_upload_photo_raises_for_unsupported_format(mocker, tmp_path):
    from photo_mcp.tools.upload import upload_photo
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=_make_manifest_with_gallery())
    bad_file = tmp_path / "doc.pdf"
    bad_file.write_bytes(b"fake pdf")

    with pytest.raises(ValueError, match="Unsupported format"):
        upload_photo(str(bad_file), "landscapes")


def test_upload_photo_raises_for_missing_gallery(mocker, tmp_path):
    from photo_mcp.tools.upload import upload_photo
    manifest = _make_manifest_with_gallery("portraits")
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    img_path = _create_test_image(tmp_path)

    with pytest.raises(ValueError, match="Gallery 'landscapes' does not exist"):
        upload_photo(str(img_path), "landscapes")


# --- upload_photo success ---

def test_upload_photo_skips_duplicate(mocker, tmp_path):
    from photo_mcp.tools.upload import upload_photo
    from photo_mcp.types import ManifestImage
    img_path = _create_test_image(tmp_path)
    manifest = _make_manifest_with_gallery()
    manifest.images["test-photo"] = ManifestImage(
        id="test-photo", filename="test-photo.jpg", path="landscapes/test-photo.jpg",
        gallery="landscapes", alt="Test", uploaded=datetime.now(timezone.utc),
        dimensions=ImageDimensions(width=100, height=75),
    )
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)

    result = upload_photo(str(img_path), "landscapes")

    assert result["skipped"] is True
    assert result["id"] == "test-photo"


def test_upload_photo_uploads_and_updates_manifest(mocker, tmp_path):
    from photo_mcp.tools.upload import upload_photo
    img_path = _create_test_image(tmp_path)
    manifest = _make_manifest_with_gallery()

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mock_save = mocker.patch("photo_mcp.tools.upload.save_manifest")
    mock_client = MagicMock()
    mocker.patch("photo_mcp.tools.upload.get_r2_client", return_value=mock_client)

    result = upload_photo(str(img_path), "landscapes", alt="A test photo")

    assert result["skipped"] is False
    assert result["id"] == "test-photo"
    assert result["path"] == "landscapes/test-photo.jpg"
    assert "test-photo" in manifest.images
    assert manifest.images["test-photo"].alt == "A test photo"
    mock_client.put_object.assert_called_once()
    mock_save.assert_called_once_with(manifest)


def test_upload_photo_defaults_alt_to_humanised_filename(mocker, tmp_path):
    from photo_mcp.tools.upload import upload_photo
    img_path = _create_test_image(tmp_path, "golden-hour.jpg")
    manifest = _make_manifest_with_gallery()

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload.save_manifest")
    mocker.patch("photo_mcp.tools.upload.get_r2_client", return_value=MagicMock())

    upload_photo(str(img_path), "landscapes")
    assert manifest.images["golden-hour"].alt == "Golden Hour"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_upload.py -v
```

Expected: `ModuleNotFoundError: No module named 'photo_mcp.tools.upload'`

- [ ] **Step 3: Implement upload.py (single upload)**

Write `tools/photo-mcp/src/photo_mcp/tools/upload.py`:

```python
import logging
import re
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

from photo_mcp.config import settings
from photo_mcp.manifest import load_manifest, save_manifest
from photo_mcp.r2 import get_r2_client
from photo_mcp.types import ImageDimensions, ManifestImage

logger = logging.getLogger(__name__)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
_CONTENT_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def derive_id(file_path: str) -> str:
    """Derive a URL-safe ID from a filename stem."""
    stem = Path(file_path).stem
    slug = stem.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def humanise_filename(file_path: str) -> str:
    """Convert filename stem to a human-readable string."""
    stem = Path(file_path).stem
    return re.sub(r"[-_]+", " ", stem).title()


def _get_dimensions(file_path: str) -> ImageDimensions:
    with Image.open(file_path) as img:
        width, height = img.size
        return ImageDimensions(width=width, height=height)


def upload_photo(file_path: str, gallery: str, alt: str = "", date_taken: str = "") -> dict:
    """Upload a single photo to R2 and update the manifest."""
    path = Path(file_path)

    if not path.exists():
        raise ValueError(f"File not found: {file_path}")

    ext = path.suffix.lower()
    if ext not in VALID_EXTENSIONS:
        raise ValueError(f"Unsupported format: {ext}. Supported: {sorted(VALID_EXTENSIONS)}")

    manifest = load_manifest()

    if gallery not in manifest.galleries:
        raise ValueError(f"Gallery '{gallery}' does not exist. Create it first with create_gallery().")

    image_id = derive_id(file_path)

    if image_id in manifest.images:
        logger.warning(f"Skipping duplicate: {image_id}")
        return {
            "id": image_id,
            "path": manifest.images[image_id].path,
            "gallery": gallery,
            "skipped": True,
            "message": f"Already uploaded: {image_id}",
        }

    r2_path = f"{gallery}/{image_id}{ext}"
    dimensions = _get_dimensions(file_path)

    client = get_r2_client()
    with open(file_path, "rb") as f:
        client.put_object(
            Bucket=settings.r2_bucket_name,
            Key=r2_path,
            Body=f,
            ContentType=_CONTENT_TYPES.get(ext, "image/jpeg"),
        )

    manifest.images[image_id] = ManifestImage(
        id=image_id,
        filename=path.name,
        path=r2_path,
        gallery=gallery,
        alt=alt or humanise_filename(file_path),
        date_taken=date_taken or None,
        uploaded=datetime.now(timezone.utc),
        dimensions=dimensions,
    )
    save_manifest(manifest)
    logger.info(f"Uploaded: {image_id} → {r2_path}")

    return {
        "id": image_id,
        "path": r2_path,
        "gallery": gallery,
        "skipped": False,
        "message": f"Uploaded: {image_id}",
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_upload.py -v
```

Expected: 11 tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/tools/upload.py tools/photo-mcp/tests/test_upload.py
git commit -m "feat: add upload_photo tool"
```

---

## Task 8: Batch Upload

**Files:**
- Modify: `tools/photo-mcp/src/photo_mcp/tools/upload.py` (add `batch_upload`)
- Modify: `tools/photo-mcp/tests/test_upload.py` (add batch tests)

- [ ] **Step 1: Write failing tests for batch_upload**

Append to `tools/photo-mcp/tests/test_upload.py`:

```python
# --- batch_upload ---

def test_batch_upload_raises_for_missing_folder(mocker):
    from photo_mcp.tools.upload import batch_upload
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=_make_manifest_with_gallery())

    with pytest.raises(ValueError, match="Folder not found"):
        batch_upload("/nonexistent/folder", "landscapes")


def test_batch_upload_processes_all_valid_images(mocker, tmp_path):
    from photo_mcp.tools.upload import batch_upload
    manifest = _make_manifest_with_gallery()
    _create_test_image(tmp_path, "photo-a.jpg")
    _create_test_image(tmp_path, "photo-b.jpg")

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload.save_manifest")
    mocker.patch("photo_mcp.tools.upload.get_r2_client", return_value=MagicMock())

    result = batch_upload(str(tmp_path), "landscapes")

    assert result["uploaded"] == 2
    assert result["skipped"] == 0
    assert result["failed"] == 0
    assert "2 uploaded" in result["summary"]


def test_batch_upload_skips_non_image_files(mocker, tmp_path):
    from photo_mcp.tools.upload import batch_upload
    manifest = _make_manifest_with_gallery()
    _create_test_image(tmp_path, "photo.jpg")
    (tmp_path / "readme.txt").write_text("not an image")

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload.save_manifest")
    mocker.patch("photo_mcp.tools.upload.get_r2_client", return_value=MagicMock())

    result = batch_upload(str(tmp_path), "landscapes")

    assert result["uploaded"] == 1


def test_batch_upload_counts_duplicates_as_skipped(mocker, tmp_path):
    from photo_mcp.tools.upload import batch_upload
    from photo_mcp.types import ManifestImage
    img_path = _create_test_image(tmp_path)
    manifest = _make_manifest_with_gallery()
    manifest.images["test-photo"] = ManifestImage(
        id="test-photo", filename="test-photo.jpg", path="landscapes/test-photo.jpg",
        gallery="landscapes", alt="Test", uploaded=datetime.now(timezone.utc),
        dimensions=ImageDimensions(width=100, height=75),
    )
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload.save_manifest")

    result = batch_upload(str(tmp_path), "landscapes")

    assert result["skipped"] == 1
    assert result["uploaded"] == 0


def test_batch_upload_continues_after_individual_failure(mocker, tmp_path):
    from photo_mcp.tools.upload import batch_upload
    manifest = _make_manifest_with_gallery()
    _create_test_image(tmp_path, "photo-a.jpg")
    _create_test_image(tmp_path, "photo-b.jpg")

    call_count = 0

    def fail_first(file_path, gallery, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RuntimeError("Simulated R2 failure")
        return {"id": "photo-b", "path": "landscapes/photo-b.jpg", "gallery": gallery, "skipped": False, "message": "OK"}

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload._upload_single", side_effect=fail_first)

    result = batch_upload(str(tmp_path), "landscapes")

    assert result["failed"] == 1
    assert result["uploaded"] == 1
    assert "1 failed" in result["summary"]
```

- [ ] **Step 2: Run new tests to verify they fail**

```bash
cd tools/photo-mcp
uv run pytest tests/test_upload.py::test_batch_upload_raises_for_missing_folder -v
```

Expected: `AttributeError: module 'photo_mcp.tools.upload' has no attribute 'batch_upload'`

- [ ] **Step 3: Add batch_upload to upload.py**

Append to `tools/photo-mcp/src/photo_mcp/tools/upload.py`:

```python

def _upload_single(file_path: str, gallery: str, alt: str = "", date_taken: str = "") -> dict:
    """Internal single-upload used by batch_upload — enables clean mocking in tests."""
    return upload_photo(file_path, gallery, alt=alt, date_taken=date_taken)


def batch_upload(folder_path: str, gallery: str, alt_prefix: str = "", date_taken: str = "") -> dict:
    """Upload all valid images from a folder to a gallery."""
    folder = Path(folder_path)

    if not folder.exists() or not folder.is_dir():
        raise ValueError(f"Folder not found: {folder_path}")

    files = sorted(f for f in folder.iterdir() if f.suffix.lower() in VALID_EXTENSIONS)
    uploaded, skipped, failed = 0, 0, 0
    results = []

    for file in files:
        try:
            result = _upload_single(str(file), gallery, alt=alt_prefix, date_taken=date_taken)
            if result["skipped"]:
                skipped += 1
            else:
                uploaded += 1
            results.append(result)
        except Exception as e:
            failed += 1
            logger.error(f"Failed to upload {file.name}: {e}", exc_info=True)
            results.append({
                "id": file.name, "path": "", "gallery": gallery,
                "skipped": False, "message": f"Failed: {e}",
            })

    summary = f"{uploaded} uploaded, {skipped} skipped, {failed} failed"
    logger.info(f"Batch complete: {summary}")
    return {"uploaded": uploaded, "skipped": skipped, "failed": failed, "results": results, "summary": summary}
```

- [ ] **Step 4: Run all upload tests to verify they pass**

```bash
cd tools/photo-mcp
uv run pytest tests/test_upload.py -v
```

Expected: all tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/tools/upload.py tools/photo-mcp/tests/test_upload.py
git commit -m "feat: add batch_upload tool"
```

---

## Task 9: Server Wiring and .mcp.json

**Files:**
- Create: `tools/photo-mcp/src/photo_mcp/server.py`
- Create: `tools/photo-mcp/tests/test_integration.py`
- Modify: `.mcp.json`

- [ ] **Step 1: Write failing integration test skeleton**

Write `tools/photo-mcp/tests/test_integration.py`:

```python
import os
import pytest


@pytest.mark.skipif(
    not os.getenv("RUN_INTEGRATION_TESTS"),
    reason="Set RUN_INTEGRATION_TESTS=1 to run integration tests against real R2",
)
class TestR2Integration:
    def test_manifest_round_trip(self):
        """Upload manifest to real R2 and read it back."""
        from datetime import datetime, timezone
        from photo_mcp.manifest import load_manifest, save_manifest
        from photo_mcp.types import Manifest

        manifest = Manifest(
            generated=datetime.now(timezone.utc),
            base_url=os.environ["R2_BASE_URL"],
        )
        save_manifest(manifest)
        loaded = load_manifest()
        assert loaded.base_url == manifest.base_url

    def test_server_tools_are_registered(self):
        """All four v1 tools are registered on the FastMCP server."""
        from photo_mcp.server import mcp
        tool_names = {tool.name for tool in mcp.list_tools()}
        assert "create_gallery" in tool_names
        assert "list_galleries" in tool_names
        assert "upload_photo" in tool_names
        assert "batch_upload" in tool_names
```

- [ ] **Step 2: Run to verify it skips without the env var**

```bash
cd tools/photo-mcp
uv run pytest tests/test_integration.py -v
```

Expected: 2 tests SKIPPED.

- [ ] **Step 3: Implement server.py**

Write `tools/photo-mcp/src/photo_mcp/server.py`:

```python
import logging

from fastmcp import FastMCP

from photo_mcp.config import settings
from photo_mcp.tools.gallery import create_gallery as _create_gallery
from photo_mcp.tools.gallery import list_galleries as _list_galleries
from photo_mcp.tools.upload import batch_upload as _batch_upload
from photo_mcp.tools.upload import upload_photo as _upload_photo

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

mcp = FastMCP("photo-mcp")


@mcp.tool()
def create_gallery(name: str, description: str = "") -> dict:
    """Create a new photo gallery. Returns the gallery slug and photo count.

    Args:
        name: Display name for the gallery (e.g. "Summer Adventures 2024")
        description: Optional description
    """
    return _create_gallery(name, description)


@mcp.tool()
def list_galleries() -> list[dict]:
    """List all galleries with their photo counts."""
    return _list_galleries()


@mcp.tool()
def upload_photo(file_path: str, gallery: str, alt: str = "", date_taken: str = "") -> dict:
    """Upload a single photo to a gallery in R2.

    Args:
        file_path: Absolute local path to the image file
        gallery: Gallery slug (must already exist — use create_gallery first)
        alt: Alt text for the image (defaults to humanised filename)
        date_taken: Date photo was taken, ISO format YYYY-MM-DD (optional)
    """
    return _upload_photo(file_path, gallery, alt=alt, date_taken=date_taken)


@mcp.tool()
def batch_upload(folder_path: str, gallery: str, alt_prefix: str = "", date_taken: str = "") -> dict:
    """Upload all images from a local folder to a gallery.

    Skips duplicates and continues on individual failures.

    Args:
        folder_path: Absolute local path to folder of images
        gallery: Gallery slug (must already exist)
        alt_prefix: Alt text prefix for all images (defaults to humanised filename per image)
        date_taken: Shared date taken for all images, ISO format YYYY-MM-DD (optional)
    """
    return _batch_upload(folder_path, gallery, alt_prefix=alt_prefix, date_taken=date_taken)
```

- [ ] **Step 4: Update .mcp.json**

Read current `.mcp.json` and add the photo-mcp entry:

```json
{
    "mcpServers": {
        "playwright": {
            "command": "npx",
            "args": ["-y", "@executeautomation/playwright-mcp-server"]
        },
        "a11y": {
            "command": "npx",
            "args": ["a11y-mcp"],
            "disabled": false,
            "autoApprove": []
        },
        "photo-mcp": {
            "command": "uv",
            "args": ["run", "--directory", "tools/photo-mcp", "fastmcp", "run", "src/photo_mcp/server.py"],
            "env": {
                "R2_ACCOUNT_ID": "${R2_ACCOUNT_ID}",
                "R2_ACCESS_KEY_ID": "${R2_ACCESS_KEY_ID}",
                "R2_SECRET_ACCESS_KEY": "${R2_SECRET_ACCESS_KEY}",
                "R2_BUCKET_NAME": "${R2_BUCKET_NAME}",
                "R2_BASE_URL": "${R2_BASE_URL}"
            }
        }
    }
}
```

- [ ] **Step 5: Run full test suite**

```bash
cd tools/photo-mcp
uv run pytest -v
```

Expected: all tests PASSED, coverage ≥ 90%.

- [ ] **Step 6: Commit**

```bash
git add tools/photo-mcp/src/photo_mcp/server.py tools/photo-mcp/tests/test_integration.py .mcp.json
git commit -m "feat: wire FastMCP server and register photo-mcp in .mcp.json"
```

---

## Task 10: CloudflareR2GalleryDataService (TypeScript)

**Files:**
- Modify: `src/services/cloudflare-r2.gallery-data.service.ts`
- Create: `tests/services/cloudflare-r2.gallery-data.service.test.ts`

- [ ] **Step 1: Write failing tests**

Write `tests/services/cloudflare-r2.gallery-data.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

const BASE_URL = 'https://photos.test.com'
const MANIFEST_URL = `${BASE_URL}/manifest.json`

const makeManifest = (overrides = {}) => ({
  version: '1.0',
  generated: '2026-04-18T10:00:00Z',
  base_url: BASE_URL,
  galleries: {
    landscapes: { title: 'Landscapes', description: '', created: '2026-04-18T10:00:00Z' }
  },
  images: {
    'mountain-sunset': {
      id: 'mountain-sunset',
      filename: 'mountain-sunset.jpg',
      path: 'landscapes/mountain-sunset.jpg',
      gallery: 'landscapes',
      alt: 'Mountain at golden hour',
      date_taken: '2025-08-15',
      uploaded: '2026-04-18T10:00:00Z',
      dimensions: { width: 6000, height: 4000 }
    }
  },
  ...overrides
})

const makeOkResponse = (body: object) =>
  ({ ok: true, json: () => Promise.resolve(body) }) as Response

const makeErrorResponse = (status = 500) =>
  ({ ok: false, status, statusText: 'Server Error' }) as Response

describe('CloudflareR2GalleryDataService', () => {
  let service: CloudflareR2GalleryDataService

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    service = new CloudflareR2GalleryDataService(MANIFEST_URL)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- Contract ---

  it('implements IGalleryDataService — getImages returns ResponsiveImage[]', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    expect(Array.isArray(images)).toBe(true)
    expect(images[0]).toHaveProperty('id')
    expect(images[0]).toHaveProperty('alt')
    expect(images[0]).toHaveProperty('aspectRatio')
    expect(images[0]).toHaveProperty('sources')
    expect(images[0]).toHaveProperty('metadata')
  })

  it('fetches from the manifest URL', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    await service.getImages()
    expect(fetch).toHaveBeenCalledWith(MANIFEST_URL)
  })

  // --- Unit: URL construction ---

  it('generates 6 breakpoint sizes per image', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')
    expect(webpSource?.sizes).toHaveLength(6)
  })

  it('constructs cdn-cgi/image/ URLs with correct width and quality', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const mobile = webpSource.sizes.find(s => s.width === 400)!
    expect(mobile.url).toBe(
      `${BASE_URL}/cdn-cgi/image/width=400,format=webp,quality=85/landscapes/mountain-sunset.jpg`
    )
  })

  it('uses quality=90 for large-desktop breakpoint (1600px)', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const largeDesktop = webpSource.sizes.find(s => s.width === 1600)!
    expect(largeDesktop.url).toContain('quality=90')
  })

  it('calculates correct aspectRatio from dimensions', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    // 6000 / 4000 = 1.5
    expect(images[0].aspectRatio).toBeCloseTo(1.5)
  })

  it('calculates correct height for each breakpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    const webpSource = images[0].sources.find(s => s.format === 'webp')!
    const mobile = webpSource.sizes.find(s => s.width === 400)!
    // 400 / (6000/4000) = 400 / 1.5 = 267
    expect(mobile.height).toBe(267)
  })

  it('maps metadata fields from manifest', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(makeManifest()))
    const images = await service.getImages()
    expect(images[0].metadata.originalWidth).toBe(6000)
    expect(images[0].metadata.originalHeight).toBe(4000)
    expect(images[0].metadata.dateTaken).toBe('2025-08-15')
  })

  it('returns multiple images when manifest has multiple', async () => {
    const manifest = makeManifest({
      images: {
        'img-1': { id: 'img-1', filename: 'img-1.jpg', path: 'landscapes/img-1.jpg', gallery: 'landscapes', alt: 'One', uploaded: '2026-04-18T10:00:00Z', dimensions: { width: 3000, height: 2000 } },
        'img-2': { id: 'img-2', filename: 'img-2.jpg', path: 'landscapes/img-2.jpg', gallery: 'landscapes', alt: 'Two', uploaded: '2026-04-18T10:00:00Z', dimensions: { width: 3000, height: 2000 } },
      }
    })
    vi.mocked(fetch).mockResolvedValue(makeOkResponse(manifest))
    const images = await service.getImages()
    expect(images).toHaveLength(2)
  })

  // --- Error ---

  it('throws when manifest fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValue(makeErrorResponse(500))
    await expect(service.getImages()).rejects.toThrow('Failed to load R2 manifest: 500')
  })

  it('throws when manifest has no images field', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ version: '1.0', base_url: BASE_URL }))
    await expect(service.getImages()).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
make test-run
```

Expected: tests fail with `CloudflareR2GalleryDataService: not implemented`.

- [ ] **Step 3: Implement CloudflareR2GalleryDataService**

Write `src/services/cloudflare-r2.gallery-data.service.ts`:

```typescript
import type { IGalleryDataService } from './gallery-data.types'
import type { ResponsiveImage, ResponsiveImageSource, ImageSize } from '../components/gallery/gallery.types'

interface R2ManifestDimensions {
  width: number
  height: number
}

interface R2ManifestImage {
  id: string
  filename: string
  path: string
  gallery: string
  alt: string
  date_taken?: string
  uploaded: string
  dimensions: R2ManifestDimensions
}

interface R2Manifest {
  version: string
  generated: string
  base_url: string
  galleries: Record<string, { title: string; description: string; created: string }>
  images: Record<string, R2ManifestImage>
}

const BREAKPOINTS: { width: number; quality: number }[] = [
  { width: 400, quality: 85 },
  { width: 600, quality: 85 },
  { width: 800, quality: 85 },
  { width: 1000, quality: 85 },
  { width: 1200, quality: 85 },
  { width: 1600, quality: 90 },
]

export class CloudflareR2GalleryDataService implements IGalleryDataService {
  constructor(private readonly manifestUrl: string) {}

  async getImages(): Promise<ResponsiveImage[]> {
    const response = await fetch(this.manifestUrl)
    if (!response.ok) {
      throw new Error(`Failed to load R2 manifest: ${response.status} ${response.statusText}`)
    }
    const manifest = await response.json() as R2Manifest
    if (!manifest.images || typeof manifest.images !== 'object') {
      throw new Error('Invalid R2 manifest: missing images field')
    }
    return Object.values(manifest.images).map(image =>
      this._toResponsiveImage(image, manifest.base_url)
    )
  }

  private _toResponsiveImage(image: R2ManifestImage, baseUrl: string): ResponsiveImage {
    const aspectRatio = image.dimensions.width / image.dimensions.height

    const sizes: ImageSize[] = BREAKPOINTS.map(bp => ({
      width: bp.width,
      height: Math.round(bp.width / aspectRatio),
      url: `${baseUrl}/cdn-cgi/image/width=${bp.width},format=webp,quality=${bp.quality}/${image.path}`,
    }))

    const source: ResponsiveImageSource = { format: 'webp', sizes }

    return {
      id: image.id,
      alt: image.alt,
      aspectRatio,
      sources: [source],
      metadata: {
        originalWidth: image.dimensions.width,
        originalHeight: image.dimensions.height,
        fileSize: 0,
        dateTaken: image.date_taken,
      },
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
make test-run
```

Expected: all new tests PASSED.

- [ ] **Step 5: Commit**

```bash
git add src/services/cloudflare-r2.gallery-data.service.ts tests/services/cloudflare-r2.gallery-data.service.test.ts
git commit -m "feat: implement CloudflareR2GalleryDataService with cdn-cgi/image/ URL construction"
```

---

## Task 11: Factory and env var update

**Files:**
- Modify: `src/services/gallery-data.service.ts`
- Modify: `src/vite-env.d.ts`
- Modify: `tests/services/gallery-data.service.factory.test.ts`

- [ ] **Step 1: Write failing test for factory R2 path**

Add to `tests/services/gallery-data.service.factory.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createGalleryDataService } from '../../src/services/gallery-data.service'
import { StaticManifestGalleryDataService } from '../../src/services/static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from '../../src/services/cloudflare-r2.gallery-data.service'

describe('createGalleryDataService factory', () => {
  it('returns StaticManifestGalleryDataService by default', () => {
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(StaticManifestGalleryDataService)
  })

  it('returns CloudflareR2GalleryDataService when VITE_GALLERY_SOURCE is r2', () => {
    import.meta.env.VITE_GALLERY_SOURCE = 'r2'
    import.meta.env.VITE_R2_MANIFEST_URL = 'https://photos.test.com/manifest.json'
    const service = createGalleryDataService({ manifestUrl: '/gallery-data.json' })
    expect(service).toBeInstanceOf(CloudflareR2GalleryDataService)
    import.meta.env.VITE_GALLERY_SOURCE = undefined
    import.meta.env.VITE_R2_MANIFEST_URL = undefined
  })
})
```

- [ ] **Step 2: Run to verify new test fails**

```bash
make test-run
```

Expected: `CloudflareR2GalleryDataService getImages() throws not-implemented` test now needs updating. The R2 factory test will also show the current implementation doesn't accept a URL.

- [ ] **Step 3: Update gallery-data.service.ts**

Write `src/services/gallery-data.service.ts`:

```typescript
import { StaticManifestGalleryDataService } from './static-manifest.gallery-data.service'
import { CloudflareR2GalleryDataService } from './cloudflare-r2.gallery-data.service'

export type { IGalleryDataService } from './gallery-data.types'
import type { IGalleryDataService } from './gallery-data.types'

export function createGalleryDataService(config: { manifestUrl: string }): IGalleryDataService {
  if (import.meta.env.VITE_GALLERY_SOURCE === 'r2') {
    const r2ManifestUrl = import.meta.env.VITE_R2_MANIFEST_URL
      ?? 'https://photos.richarddrew.photography/manifest.json'
    return new CloudflareR2GalleryDataService(r2ManifestUrl)
  }
  return new StaticManifestGalleryDataService(config.manifestUrl)
}
```

- [ ] **Step 4: Update src/vite-env.d.ts**

Open `src/vite-env.d.ts` and ensure it contains:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GALLERY_SOURCE?: string
  readonly VITE_R2_MANIFEST_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 5: Update factory test to replace the stub test**

Replace the existing `gallery-data.service.factory.test.ts` with the full version from Step 1 (which removes the now-stale "throws not-implemented" test).

- [ ] **Step 6: Run full test suite**

```bash
make test-run
```

Expected: all tests PASSED.

- [ ] **Step 7: Check test coverage**

```bash
make test-coverage
```

Expected: ≥ 90% coverage across all files.

- [ ] **Step 8: Commit**

```bash
git add src/services/gallery-data.service.ts src/vite-env.d.ts tests/services/gallery-data.service.factory.test.ts
git commit -m "feat: update factory to wire CloudflareR2GalleryDataService via VITE_R2_MANIFEST_URL"
```

---

## Done

At this point:

- ✅ Python MCP server with 4 tools running locally via FastMCP
- ✅ Registered in `.mcp.json` — available to Claude immediately after shell env vars are set
- ✅ `CloudflareR2GalleryDataService` implemented — web UI reads R2 manifest when `VITE_GALLERY_SOURCE=r2`
- ✅ `docs/mcp/ARCHITECTURE.md` — R2 setup steps, manifest schema, tool inventory
- ✅ `docs/mcp/DEVELOPMENT.md` — Python/FastMCP standards (template source for future MCP projects)

**Before the MCP server will work end-to-end**, complete the manual R2 setup steps in `docs/mcp/ARCHITECTURE.md` and set shell env vars in `~/.zshrc`.
