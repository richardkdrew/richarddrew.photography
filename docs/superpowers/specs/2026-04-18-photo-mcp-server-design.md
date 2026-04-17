# Photo MCP Server — Design Spec

**Date**: 2026-04-18
**Status**: Approved
**Branch**: develop

---

## 1. Overview

Build a local Python MCP server (`tools/photo-mcp/`) that allows uploading photos to Cloudflare R2 and maintaining a JSON manifest consumed by the portfolio web UI. The MCP server runs as a local process, registered in `.mcp.json`, giving Claude direct access to the local filesystem and R2.

**Scope (v1):**

- Upload single photo or batch folder to R2
- Create and list galleries
- Maintain a lean manifest in R2
- Implement `CloudflareR2GalleryDataService` in the web UI to consume the manifest

**Out of scope (v1):**

- `update_metadata` tool (v1.5)
- Docker deployment (v1.5)
- EXIF extraction, LQIP generation
- Cloudflare Worker API layer
- Git commit / deploy_manifest automation

---

## 2. Architecture

```
Local machine
┌─────────────────────────────────────────────┐
│  Claude / AI assistant                       │
│        │ MCP protocol                        │
│        ▼                                     │
│  tools/photo-mcp/  (FastMCP, Python)         │
│        │ boto3 (S3-compatible)               │
└────────┼────────────────────────────────────┘
         │
         ▼
Cloudflare R2 (portfolio-photos bucket)
├── landscapes/mountain-sunset.jpg     ← originals only
├── portraits/studio-1.jpg
└── manifest.json                      ← lean manifest

         │  https://photos.richarddrew.photography/manifest.json
         ▼
Web UI (Cloudflare Pages)
  CloudflareR2GalleryDataService
        │ fetches manifest, constructs cdn-cgi/image/ URLs
        ▼
  Gallery component (ResponsiveImage[] — unchanged interface)
```

**Image resizing:** Cloudflare Image Resizing handles on-the-fly resizing via `cdn-cgi/image/` URL parameters. Free tier includes 1M transforms/month. Only one original is uploaded per photo.

**Resize URL pattern:**

```text
https://photos.richarddrew.photography/cdn-cgi/image/width=400,format=webp,quality=85/landscapes/mountain-sunset.jpg
```

---

## 3. Project Structure

```text
richarddrew.photography/
├── src/                                     # Web UI (unchanged)
│   └── services/
│       └── cloudflare-r2.gallery-data.service.ts  # implement in this feature
├── tools/
│   └── photo-mcp/                           # New — Python MCP server
│       ├── src/
│       │   └── photo_mcp/
│       │       ├── server.py                # FastMCP entry point
│       │       ├── config.py                # pydantic-settings config
│       │       ├── r2.py                    # boto3 R2 client wrapper
│       │       ├── manifest.py              # manifest read/write logic
│       │       ├── types.py                 # Pydantic models
│       │       └── tools/
│       │           ├── upload.py            # upload_photo, batch_upload
│       │           ├── gallery.py           # create_gallery, list_galleries
│       │           └── manifest_tools.py    # get_manifest (read-only tool)
│       ├── tests/
│       │   ├── test_upload.py
│       │   ├── test_gallery.py
│       │   ├── test_manifest.py
│       │   └── test_integration.py          # gated by RUN_INTEGRATION_TESTS=1
│       ├── pyproject.toml
│       ├── Makefile
│       ├── .env.example
│       └── .env                             # gitignored
├── docs/
│   ├── mcp/
│   │   ├── ARCHITECTURE.md                  # new — MCP-specific architecture
│   │   └── DEVELOPMENT.md                   # new — MCP dev standards (dual-purpose: template source)
│   └── ...
└── .mcp.json                                # add photo-mcp entry
```

---

## 4. MCP Tools (v1)

### `create_gallery(name, description)`
Creates a gallery entry in the manifest. Idempotent — no-ops if it already exists. Returns the gallery slug and current photo count.

**Input:**

- `name` — display name (e.g. "Summer Adventures 2024")
- `description` — optional description string

**Behaviour:**

- Derives slug from name: lowercase, spaces to hyphens, strip special chars
- Reads manifest from R2, adds gallery entry, writes back
- Returns slug for use in subsequent upload calls

---

### `upload_photo(file_path, gallery, metadata)`
Uploads a single local photo to R2 and adds it to the manifest.

**Input:**

- `file_path` — absolute local path to image file
- `gallery` — gallery slug (must exist in manifest)
- `metadata` — optional dict: `alt`, `date_taken`

**Behaviour:**

- Validates file exists and format is `.jpg/.jpeg/.png/.webp`
- Derives friendly ID from filename (lowercase, spaces/underscores to hyphens)
- Skips if ID already exists in manifest (duplicate check)
- Uploads original to R2 at `{gallery}/{id}.{ext}`
- Reads image dimensions (using Pillow)
- Adds lean manifest entry
- Writes updated manifest to R2 (write-per-photo — partial progress preserved)
- Returns R2 path and summary

---

### `batch_upload(folder_path, gallery, metadata)`
Uploads all valid images from a local folder to a gallery.

**Input:**

- `folder_path` — absolute local path to folder
- `gallery` — gallery slug (must exist in manifest)
- `metadata` — optional shared metadata for all photos in batch

**Behaviour:**

- Reads all `.jpg/.jpeg/.png/.webp` files from folder (non-recursive)
- Calls upload logic per file
- Skips duplicates (already in manifest), logs skips
- Continues on individual file failures, logs failures
- Reports final summary: `"47 uploaded, 2 skipped, 1 failed"`

---

### `list_galleries()`
Returns all galleries from the manifest with photo counts.

**Output:** List of `{ slug, title, description, photo_count }`

---

## 5. Manifest Schema (stored in R2)

The manifest is lean — it stores what the MCP server knows. The web UI service derives resize URLs at fetch time.

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

**Key decisions:**

- No pre-computed resize URLs — derived by `CloudflareR2GalleryDataService`
- No file_size (not required by web UI, saves a stat call)
- `alt` is optional at upload time — defaults to humanised filename

---

## 6. CloudflareR2GalleryDataService (web UI)

Implements `IGalleryDataService` — interface unchanged.

**Responsibilities:**
1. Fetch `manifest.json` from R2 via custom domain URL
2. Map each manifest image to `ResponsiveImage` by constructing `cdn-cgi/image/` URLs for each breakpoint and format

**Breakpoints** (matching existing `gallery-data.json` schema):

| Name | Width | Quality | Format |
|------|-------|---------|--------|
| mobile | 400px | 85 | webp |
| tablet | 600px | 85 | webp |
| large-tablet | 800px | 85 | webp |
| large-tablet-2x | 1000px | 85 | webp |
| desktop | 1200px | 85 | webp |
| large-desktop | 1600px | 90 | webp |

**URL construction:**

```text
{base_url}/cdn-cgi/image/width={w},format=webp,quality={q}/{path}
```

**`aspectRatio`** derived from manifest `dimensions.width / dimensions.height`.

`StaticManifestGalleryDataService` is unchanged — continues to serve `gallery-data.json` for local dev and tests.

---

## 7. Cloudflare / R2 Setup (manual steps)

These are one-time manual configuration steps documented in `docs/mcp/ARCHITECTURE.md`:

1. **Create R2 bucket** — `portfolio-photos` in Cloudflare dashboard
2. **Custom domain** — add `photos.richarddrew.photography` pointing to the R2 bucket via Cloudflare DNS + R2 bucket settings
3. **Verify Image Resizing** — confirm `cdn-cgi/image/` transforms work on the custom domain (free tier: 1M/month)
4. **R2 API token** — create token with `Object Read & Write` scoped to `portfolio-photos` bucket
5. **CORS policy** — set on R2 bucket to allow `GET` from `richarddrew.photography` and `localhost:3000`

**Environment variables (`tools/photo-mcp/.env`):**

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=portfolio-photos
R2_BASE_URL=https://photos.richarddrew.photography
MANIFEST_PATH=manifest.json
```

---

## 8. Error Handling

**Manifest integrity:** Write-per-photo strategy. Each successful upload updates the manifest immediately. A mid-batch failure leaves the manifest accurate for completed uploads. Re-running the batch skips already-uploaded files via duplicate check.

**Upload failures:** Individual file failures in batch do not stop the batch. All failures are collected and reported in the final summary.

**Manifest not found:** On first run, if no manifest exists in R2, the server creates a new empty one.

**Duplicate uploads:** Detected by checking if the derived ID already exists in the manifest. Silently skipped with a log entry.

**Invalid formats:** Files that are not `.jpg/.jpeg/.png/.webp` are skipped with a warning. No hard failure.

---

## 9. Testing Approach

Following the 4-category pattern from the web UI, adapted for Python/FastMCP:

| Category | What it covers |
|----------|---------------|
| **Contract** | Tool input/output schemas, manifest structure validity, Pydantic model validation |
| **Unit** | ID generation, slug derivation, URL construction, duplicate detection, gallery logic |
| **Integration** | Actual R2 calls — gated behind `RUN_INTEGRATION_TESTS=1` env var |
| **Error** | Invalid paths, unsupported formats, R2 failures, missing manifest |

**Web UI side:** `CloudflareR2GalleryDataService` tests follow existing 4-category pattern — contract (interface), unit (URL construction with mock manifest), error (fetch failure, malformed manifest).

**Coverage target:** 80%+ enforced via `--cov-fail-under=80` in `pyproject.toml`.

---

## 10. Documentation Strategy

`docs/mcp/DEVELOPMENT.md` and `docs/mcp/ARCHITECTURE.md` serve a dual purpose:

1. **Immediate:** Project-specific guardrails for building this MCP server
2. **After build:** Source material for a generic `python-mcp.md` template (reusable across future MCP projects)

Both docs should be written to be generalisable — avoid hard-coding project-specific details where a pattern description suffices. Project-specific values (bucket name, domain, etc.) belong in `.env.example` and `ARCHITECTURE.md` setup sections, not as assumed constants in the development guide.

---

## 11. `.mcp.json` Registration

```json
{
  "mcpServers": {
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

**Note on credentials:** The `${VAR}` syntax passes values from the shell environment at MCP server startup. Credentials should be set in your shell profile (e.g. `~/.zshrc`) or a shell-level `.env` loader — not read from `tools/photo-mcp/.env` at runtime, since the MCP process is spawned by the AI assistant, not a shell session. The `tools/photo-mcp/.env` file is used only when running the server directly via `make dev`.

---

## 12. v1.5 Backlog

- `update_metadata(image_id, metadata)` — edit alt text, date_taken, gallery assignment
- Docker container deployment of MCP server
- EXIF extraction at upload time (date\_taken from image metadata)
- Cloudflare Worker API layer for manifest serving with filtering/pagination

**Potential enhancements (post v1.5):**

- **Multi-gallery support** — change `gallery: string` to `galleries: string[]` in the manifest, allowing a photo to appear in multiple curated collections without duplicating the R2 file
- **Tagging** — add `tags: string[]` to manifest entries for cross-cutting descriptive metadata (e.g. `["black-and-white", "golden-hour"]`). Complements galleries rather than replacing them — galleries are editorial collections, tags enable filtering/discovery. Natural input for the future Worker API filtering layer.

---

## 13. Open Questions (resolved)

| Question | Decision |
|----------|----------|
| Local vs remote MCP | Local Python process — needs filesystem access |
| Language | Python + FastMCP |
| Location in repo | `tools/photo-mcp/` — no repo restructure needed |
| Image resizing | Cloudflare Image Resizing via `cdn-cgi/image/` — free tier, on-the-fly |
| Resize variants | Generated by `CloudflareR2GalleryDataService` at fetch time, not stored in manifest |
| Manifest delivery | R2 → custom domain → service fetches directly. No git commit needed. |
| Web UI service | Implement `CloudflareR2GalleryDataService` (existing stub). `StaticManifestGalleryDataService` unchanged. |
| Gallery interface | `IGalleryDataService` unchanged |
| Manifest write strategy | Write-per-photo (partial progress preserved on batch failure) |
| Docs restructure | Add `docs/mcp/` — defer `docs/web/` restructure to later cleanup task |
