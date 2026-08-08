import logging

from fastmcp import FastMCP

from photo_mcp.config import settings
from photo_mcp.tools.gallery import create_gallery as _create_gallery
from photo_mcp.tools.gallery import list_galleries as _list_galleries
from photo_mcp.tools.upload import batch_upload as _batch_upload
from photo_mcp.tools.upload import upload_photo as _upload_photo

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

mcp = FastMCP("photo-mcp")


@mcp.tool()
def create_gallery(name: str, description: str = "") -> dict:
    """Create a new photo gallery. Returns the gallery slug and photo count.

    Args:
        name: Display name for the gallery (e.g. "Summer Adventures 2024")
        description: Optional description
    """
    return _create_gallery(name, description)


@mcp.tool()
def list_galleries() -> list[dict]:
    """List all galleries with their photo counts."""
    return _list_galleries()


@mcp.tool()
def upload_photo(file_path: str, gallery: str, alt: str = "", date_taken: str = "") -> dict:
    """Upload a single photo to a gallery in R2.

    Args:
        file_path: Absolute local path to the image file
        gallery: Gallery slug (must already exist — use create_gallery first)
        alt: Alt text for the image (defaults to humanised filename)
        date_taken: Date photo was taken, ISO format YYYY-MM-DD (optional)
    """
    return _upload_photo(file_path, gallery, alt=alt, date_taken=date_taken)


@mcp.tool()
def batch_upload(
    folder_path: str, gallery: str, alt_prefix: str = "", date_taken: str = ""
) -> dict:
    """Upload all images from a local folder to a gallery.

    Skips duplicates and continues on individual failures.

    Args:
        folder_path: Absolute local path to folder of images
        gallery: Gallery slug (must already exist)
        alt_prefix: Alt text prefix for all images (defaults to humanised filename per image)
        date_taken: Shared date taken for all images, ISO format YYYY-MM-DD (optional)
    """
    return _batch_upload(folder_path, gallery, alt_prefix=alt_prefix, date_taken=date_taken)
