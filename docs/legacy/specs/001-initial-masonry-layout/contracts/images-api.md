# Images API Contract

**Phase 1 Design** | **Date**: 2025-09-23
**Feature**: Initial Masonry Layout - Image Gallery API

## API Interface Contract

### ImageClient Interface

**Contract**: TypeScript interface for fetching gallery images with multiple implementations.

```typescript
interface ImageClient {
  /**
   * Fetch all available gallery images
   * @returns Promise resolving to array of gallery images
   * @throws Error if fetch fails or invalid response format
   */
  fetchImages(): Promise<GalleryImage[]>;

  /**
   * Fetch specific image by ID
   * @param id - Unique image identifier
   * @returns Promise resolving to image or null if not found
   */
  fetchImageById(id: string): Promise<GalleryImage | null>;
}
```

## Local Implementation Contract

### LocalImageClient

**Purpose**: File-based implementation for development and testing

**Contract Specification**:
- MUST read from `/images/manifest.json` by default
- MUST validate manifest format matches schema
- MUST handle network errors gracefully
- MUST return empty array on manifest not found
- MUST validate image URLs are accessible

### Request/Response Contracts

#### GET /images/manifest.json

**Request**: Standard HTTP GET to static JSON file

**Response Format**:
```json
{
  "images": [
    {
      "id": "string (required, unique)",
      "alt": "string (required, non-empty)",
      "aspectRatio": "number (required, 0.5-3.0)",
      "sources": [
        {
          "format": "webp | jpeg (required)",
          "sizes": [
            {
              "width": "number (required, >0)",
              "url": "string (required, valid URL)"
            }
          ]
        }
      ],
      "placeholder": "string (optional, base64 data URL)"
    }
  ]
}
```

**Error Responses**:
- 404: Manifest file not found → return empty array
- Invalid JSON → throw Error with descriptive message
- Schema validation failure → throw Error with field details

## Contract Tests Required

### ImageClient Interface Tests
1. **fetchImages() returns array**: Test basic functionality
2. **fetchImages() handles errors**: Test network failure scenarios
3. **fetchImageById() finds existing**: Test valid ID lookup
4. **fetchImageById() handles missing**: Test invalid ID returns null
5. **Response format validation**: Test schema compliance

### LocalImageClient Implementation Tests
1. **Reads default manifest path**: Test `/images/manifest.json` loading
2. **Handles custom manifest path**: Test constructor parameter
3. **Validates manifest schema**: Test format validation
4. **Graceful error handling**: Test file not found, invalid JSON
5. **Image URL accessibility**: Test that referenced images exist

### Response Format Tests
1. **Required fields present**: Test all mandatory properties exist
2. **Data type validation**: Test number/string type requirements
3. **Constraint validation**: Test aspectRatio range, unique IDs
4. **Source format validation**: Test WebP/JPEG format requirements
5. **Size requirements**: Test required width variations (200w, 250w, 300w, 500w)

## Implementation Guidelines

### Error Handling
- Network errors: Return empty array with console warning
- Validation errors: Throw Error with specific field information
- Missing images: Log warning, continue with available images

### Performance Considerations
- Cache manifest response for 5 minutes
- Validate image URLs lazily (on first access)
- Batch validation for better performance

### Future API Compatibility
- Interface designed to support HTTP API transition
- Response format compatible with REST/GraphQL endpoints
- Client abstraction allows switching implementations