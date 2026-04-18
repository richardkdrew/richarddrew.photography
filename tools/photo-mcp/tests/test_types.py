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
