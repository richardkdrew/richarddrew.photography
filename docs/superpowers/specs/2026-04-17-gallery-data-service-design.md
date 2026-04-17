# Gallery Data Service Abstraction — Design

**Date:** 2026-04-17
**Branch:** 014-gallery-data-service
**Status:** Approved

## Goal

Decouple the gallery component from its data source so that the static JSON manifest can be replaced with Cloudflare R2 (or any future backend) without touching the gallery component. Establishes the injection point the future MCP will use.

## Context

The gallery currently instantiates `GalleryDataService` directly and calls `loadImages(manifestUrl)`. This works for a static manifest but couples the component to a specific fetch strategy. The existing service class is mostly sound — it needs to be split into an interface, a concrete static implementation, and a factory.

## Architecture

### Service Layer

```
src/services/
├── gallery-data.service.ts                     IGalleryDataService interface + createGalleryDataService() factory
├── static-manifest.gallery-data.service.ts     StaticManifestGalleryDataService
└── cloudflare-r2.gallery-data.service.ts       CloudflareR2GalleryDataService (stub — throws 'not implemented')
```

### Interface

```typescript
export interface IGalleryDataService {
  getImages(): Promise<ResponsiveImage[]>
}
```

Caching, deduplication, retries, and validation are internal implementation details of each concrete service. The gallery knows nothing about them.

### Factory

```typescript
// gallery-data.service.ts
export function createGalleryDataService(config: { manifestUrl: string }): IGalleryDataService {
  if (import.meta.env.VITE_GALLERY_SOURCE === 'r2') {
    return new CloudflareR2GalleryDataService()
  }
  return new StaticManifestGalleryDataService(config.manifestUrl)
}
```

`VITE_GALLERY_SOURCE` defaults to static when absent — no `.env` file required for local dev or current production. Vite tree-shakes the unused implementation from the production bundle.

### Concrete Implementations

**`StaticManifestGalleryDataService`** — fetches `gallery-data.json` from a URL, validates, caches, deduplicates concurrent requests. Contains all current `GalleryDataService` logic. Constructor takes `manifestUrl: string`.

**`CloudflareR2GalleryDataService`** — stub only. Implements `IGalleryDataService`, `getImages()` throws `new Error('CloudflareR2GalleryDataService: not implemented')`. Establishes the class name, file location, and interface compliance ahead of the MCP build.

Unused methods on the current `GalleryDataService` are removed: `preloadImages`, `clearCache`, `getCacheStats`, `isCached`, `isLoading`. Nothing in the codebase calls them.

### Gallery Component Changes

The gallery accepts an injected service via a property setter. It defers initialisation by one event loop tick (`setTimeout(0)`) to allow `main.ts` to inject before the fallback fires. This preserves the Web Component's declarative contract — `<masonry-gallery data-manifest-url="...">` works standalone without any JS wiring.

```typescript
// Injection point
set dataService(service: IGalleryDataService) {
  this._dataService = service
  if (this.isConnected && !this._initialized) {
    this._initialized = true
    this.initialize()
  }
}

// Deferred init — setTimeout(0) fires after deferred module scripts
connectedCallback() {
  setTimeout(() => {
    if (!this._initialized) {
      const url = this.getAttribute('data-manifest-url') || '/gallery-data.json'
      this._dataService = new StaticManifestGalleryDataService(url)
      this._initialized = true
      this.initialize()
    }
  }, 0)
}
```

**Why `setTimeout(0)` not `Promise.resolve()`:** microtasks (Promise) fire before deferred module scripts; macrotasks (`setTimeout`) fire after. `main.ts` is a deferred module script — it must run before the fallback kicks in.

### Wiring in main.ts

```typescript
const gallery = document.querySelector('masonry-gallery') as MasonryGallery
if (gallery) {
  const manifestUrl = gallery.getAttribute('data-manifest-url') || '/gallery-data.json'
  gallery.dataService = createGalleryDataService({ manifestUrl })
}
```

The `data-manifest-url` attribute remains in `index.html` unchanged — it is the declarative source of truth for the static URL and the fallback path.

## Data Flow

```
index.html
  <masonry-gallery data-manifest-url="/gallery-data.json">

main.ts
  reads data-manifest-url
  → createGalleryDataService({ manifestUrl })
  → StaticManifestGalleryDataService('/gallery-data.json')   [or R2 if env var set]
  → gallery.dataService = service

gallery.ts
  dataService setter fires
  → this._initialized = true
  → this.initialize()
  → this._dataService.getImages()
  → ResponsiveImage[]
```

## Environment Variables

| Variable | Values | Purpose |
|---|---|---|
| `VITE_GALLERY_SOURCE` | `'static'` (default, absent = static), `'r2'` | Selects service implementation at build time |

R2 credentials (`VITE_CF_ACCOUNT_ID`, `VITE_CF_BUCKET_NAME`, `VITE_CF_API_TOKEN`) are added when `CloudflareR2GalleryDataService` is implemented. Not needed now.

## Testing

**`StaticManifestGalleryDataService` unit tests** (`tests/services/static-manifest.gallery-data.service.test.ts`):
- Fetches and returns images correctly
- Returns cached result on repeated calls (no second fetch)
- Deduplicates concurrent `getImages()` calls
- Throws on non-OK response
- Throws when images array is missing or empty
- Validates and filters invalid images

**Gallery component tests** — replace global `fetch` mock with injected mock service:
```typescript
const mockService: IGalleryDataService = {
  getImages: vi.fn().mockResolvedValue(mockImages)
}
gallery.dataService = mockService
```
Existing tests continue to pass; mock fetch can be removed from gallery test setup.

**`CloudflareR2GalleryDataService` stub test**:
- `getImages()` throws `'not implemented'`

## What Does Not Change

- `index.html` — `data-manifest-url` attribute stays as-is
- `gallery-data.json` — untouched
- `gallery.types.ts` — untouched
- All existing gallery behaviour — identical from the user's perspective
- E2E tests — no changes needed

## Relationship to Other Features

- **011 (EXIF):** Independent. The service returns `ResponsiveImage[]`. When 011 adds `exif` to `ImageMetadata`, it flows through `StaticManifestGalleryDataService` automatically — no service changes needed.
- **Future MCP:** `main.ts` becomes the injection point. The MCP build creates a service implementation, `main.ts` injects it. Gallery component untouched.
