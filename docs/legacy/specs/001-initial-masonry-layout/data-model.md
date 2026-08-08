# Data Model: Initial Masonry Layout

**Phase 1 Design** | **Date**: 2025-09-23
**Feature**: Responsive image gallery with column-based masonry layout

## Core Entities

### Image
Represents a single image in the masonry gallery.

**TypeScript Interface**:
```typescript
interface GalleryImage {
  id: string;
  alt: string;
  aspectRatio: number; // width/height for sizing
  sources: ImageSource[];
  placeholder?: string; // base64 blur-up image
}

interface ImageSource {
  format: 'webp' | 'jpeg';
  sizes: ImageSize[];
}

interface ImageSize {
  width: number;
  url: string;
}
```

**Validation Rules**:
- `id` must be unique within gallery
- `aspectRatio` must be positive number
- At least one JPEG source required (fallback)
- WebP sources preferred when available

### Gallery
Represents the masonry layout container and configuration.

**TypeScript Interface**:
```typescript
interface MasonryGallery {
  images: GalleryImage[];
  config: GalleryConfig;
}

interface GalleryConfig {
  breakpoints: ResponsiveBreakpoints;
  loadingStrategy: 'lazy' | 'eager';
  placeholderType: 'blur' | 'skeleton' | 'none';
}

interface ResponsiveBreakpoints {
  mobile: { maxWidth: 767, columns: 1 };
  tablet: { minWidth: 768, maxWidth: 1199, columns: 3 };
  desktop: { minWidth: 1200, columns: 'auto' }; // 4-6 based on width
}
```

### Column
Represents a vertical column in the masonry layout.

**TypeScript Interface**:
```typescript
interface MasonryColumn {
  index: number;
  height: number; // accumulated height for balancing
  images: string[]; // array of image IDs
}
```

**State Transitions**:
- Empty → Loading → Populated → Complete
- Height recalculated on image load completion

## API Interface

### ImageClient
Abstract interface for fetching gallery images.

**TypeScript Interface**:
```typescript
interface ImageClient {
  fetchImages(): Promise<GalleryImage[]>;
  fetchImageById(id: string): Promise<GalleryImage | null>;
}

// Local implementation for testing
class LocalImageClient implements ImageClient {
  constructor(private manifestUrl: string = '/images/manifest.json') {}

  async fetchImages(): Promise<GalleryImage[]> {
    const response = await fetch(this.manifestUrl);
    const manifest = await response.json();
    return manifest.images;
  }

  async fetchImageById(id: string): Promise<GalleryImage | null> {
    const images = await this.fetchImages();
    return images.find(img => img.id === id) || null;
  }
}
```

## Local Testing Data Structure

### Image Manifest Format
```json
{
  "images": [
    {
      "id": "img-001",
      "alt": "Sample landscape image",
      "aspectRatio": 1.5,
      "sources": [
        {
          "format": "webp",
          "sizes": [
            { "width": 200, "url": "/images/img-001-200.webp" },
            { "width": 250, "url": "/images/img-001-250.webp" },
            { "width": 300, "url": "/images/img-001-300.webp" },
            { "width": 500, "url": "/images/img-001-500.webp" }
          ]
        },
        {
          "format": "jpeg",
          "sizes": [
            { "width": 200, "url": "/images/img-001-200.jpg" },
            { "width": 250, "url": "/images/img-001-250.jpg" },
            { "width": 300, "url": "/images/img-001-300.jpg" },
            { "width": 500, "url": "/images/img-001-500.jpg" }
          ]
        }
      ],
      "placeholder": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    }
  ]
}
```

## Relationships

```
MasonryGallery
  ├── GalleryConfig (1:1)
  ├── GalleryImage[] (1:many)
  └── MasonryColumn[] (1:many)

GalleryImage
  ├── ImageSource[] (1:many)
  └── placeholder (0:1)

ImageSource
  └── ImageSize[] (1:many)

MasonryColumn
  └── images: string[] (references GalleryImage.id)
```

## Validation & Constraints

- Maximum 6 columns on desktop
- Minimum aspect ratio: 0.5 (tall images)
- Maximum aspect ratio: 3.0 (wide images)
- Image sizes must include 200w, 250w, 300w, 500w
- JPEG fallback required for all images
- Placeholder images should be <2KB base64