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
    # NFD decomposition strips combining accents: é → e, so "Café" → "cafe"
    assert derive_slug("Café & Sunsets!") == "cafe-sunsets"


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
