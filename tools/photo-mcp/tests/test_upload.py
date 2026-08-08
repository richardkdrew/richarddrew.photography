from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from photo_mcp.types import ImageDimensions, Manifest, ManifestGallery


def _make_manifest_with_gallery(slug: str = "landscapes") -> Manifest:
    return Manifest(
        generated=datetime.now(UTC),
        base_url="https://photos.test.com",
        galleries={slug: ManifestGallery(title=slug.title(), created=datetime.now(UTC))},
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


def test_derive_id_strips_unicode_accents():
    from photo_mcp.tools.upload import derive_id

    assert derive_id("/path/café-sunset.jpg") == "cafe-sunset"


# --- humanise_filename ---


def test_humanise_filename_title_cases_stem():
    from photo_mcp.tools.upload import humanise_filename

    assert humanise_filename("/path/mountain-sunset.jpg") == "Mountain Sunset"


def test_humanise_filename_replaces_underscores():
    from photo_mcp.tools.upload import humanise_filename

    assert humanise_filename("/path/IMG_1234.jpg") == "Img 1234"


# --- _get_dimensions ---


def test_get_dimensions_returns_correct_size(tmp_path):
    from photo_mcp.tools.upload import _get_dimensions

    img_path = _create_test_image(tmp_path)  # creates 100x75 JPEG
    dims = _get_dimensions(str(img_path))
    assert dims.width == 100
    assert dims.height == 75


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
        id="test-photo",
        filename="test-photo.jpg",
        path="landscapes/test-photo.jpg",
        gallery="landscapes",
        alt="Test",
        uploaded=datetime.now(UTC),
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


# --- batch_upload ---


def test_batch_upload_raises_for_missing_folder(mocker):
    from photo_mcp.tools.upload import batch_upload

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=_make_manifest_with_gallery())

    with pytest.raises(ValueError, match="Folder not found"):
        batch_upload("/nonexistent/folder", "landscapes")


def test_batch_upload_raises_for_missing_gallery(mocker, tmp_path):
    from photo_mcp.tools.upload import batch_upload

    manifest = _make_manifest_with_gallery("portraits")
    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)

    with pytest.raises(ValueError, match="Gallery 'landscapes' does not exist"):
        batch_upload(str(tmp_path), "landscapes")


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

    _create_test_image(tmp_path)
    manifest = _make_manifest_with_gallery()
    manifest.images["test-photo"] = ManifestImage(
        id="test-photo",
        filename="test-photo.jpg",
        path="landscapes/test-photo.jpg",
        gallery="landscapes",
        alt="Test",
        uploaded=datetime.now(UTC),
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
        return {
            "id": "photo-b",
            "path": "landscapes/photo-b.jpg",
            "gallery": gallery,
            "skipped": False,
            "message": "OK",
        }

    mocker.patch("photo_mcp.tools.upload.load_manifest", return_value=manifest)
    mocker.patch("photo_mcp.tools.upload._upload_single", side_effect=fail_first)

    result = batch_upload(str(tmp_path), "landscapes")

    assert result["failed"] == 1
    assert result["uploaded"] == 1
    assert "1 failed" in result["summary"]
