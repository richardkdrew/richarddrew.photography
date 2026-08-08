import logging
import re
import unicodedata
from datetime import UTC, datetime
from pathlib import Path

from PIL import Image

from photo_mcp.config import settings
from photo_mcp.manifest import load_manifest, save_manifest
from photo_mcp.r2 import get_r2_client
from photo_mcp.types import ImageDimensions, ManifestImage

logger = logging.getLogger(__name__)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
_CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def derive_id(file_path: str) -> str:
    """Derive a URL-safe ID from a filename stem."""
    stem = Path(file_path).stem
    # NFD normalisation strips combining accents (e.g. é → e)
    slug = unicodedata.normalize("NFD", stem.lower()).encode("ascii", "ignore").decode("ascii")
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
        raise ValueError(
            f"Gallery '{gallery}' does not exist. Create it first with create_gallery()."
        )

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
        uploaded=datetime.now(UTC),
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


def _upload_single(file_path: str, gallery: str, alt: str = "", date_taken: str = "") -> dict:
    """Internal single-upload used by batch_upload — enables clean mocking in tests."""
    return upload_photo(file_path, gallery, alt=alt, date_taken=date_taken)


def batch_upload(
    folder_path: str, gallery: str, alt_prefix: str = "", date_taken: str = ""
) -> dict:
    """Upload all valid images from a folder to a gallery."""
    folder = Path(folder_path)

    if not folder.exists() or not folder.is_dir():
        raise ValueError(f"Folder not found: {folder_path}")

    manifest = load_manifest()
    if gallery not in manifest.galleries:
        raise ValueError(
            f"Gallery '{gallery}' does not exist. Create it first with create_gallery()."
        )

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
            results.append(
                {
                    "id": file.name,
                    "path": "",
                    "gallery": gallery,
                    "skipped": False,
                    "message": f"Failed: {e}",
                }
            )

    summary = f"{uploaded} uploaded, {skipped} skipped, {failed} failed"
    logger.info(f"Batch complete: {summary}")
    return {
        "uploaded": uploaded,
        "skipped": skipped,
        "failed": failed,
        "results": results,
        "summary": summary,
    }
