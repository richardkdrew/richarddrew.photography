import logging
import re
import unicodedata
from datetime import datetime, timezone

from photo_mcp.manifest import load_manifest, save_manifest
from photo_mcp.types import ManifestGallery

logger = logging.getLogger(__name__)


def derive_slug(name: str) -> str:
    """Convert a display name to a URL-safe slug."""
    # Normalise to NFD and drop combining characters (strips accents)
    slug = unicodedata.normalize("NFD", name.lower())
    slug = slug.encode("ascii", "ignore").decode("ascii")
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
