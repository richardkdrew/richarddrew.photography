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
