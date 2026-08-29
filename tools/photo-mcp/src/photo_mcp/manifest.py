import json
import logging
from datetime import UTC, datetime

from botocore.exceptions import ClientError

from photo_mcp.config import settings
from photo_mcp.r2 import get_r2_client
from photo_mcp.types import Manifest

logger = logging.getLogger(__name__)


def load_manifest() -> Manifest:
    """Load manifest from R2. Returns empty manifest if not found."""
    client = get_r2_client()
    try:
        response = client.get_object(
            Bucket=settings.r2_bucket_name,
            Key=settings.manifest_path,
        )
        data = json.loads(response["Body"].read().decode("utf-8"))
        return Manifest.model_validate(data)
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            logger.info("Manifest not found in R2 — creating empty manifest")
            return Manifest(
                generated=datetime.now(UTC),
                base_url=settings.r2_base_url,
            )
        raise


def save_manifest(manifest: Manifest) -> None:
    """Write manifest to R2 as JSON."""
    client = get_r2_client()
    manifest.generated = datetime.now(UTC)
    body = manifest.model_dump_json(indent=2).encode("utf-8")
    client.put_object(
        Bucket=settings.r2_bucket_name,
        Key=settings.manifest_path,
        Body=body,
        ContentType="application/json",
    )
    logger.info(f"Manifest saved to R2: {settings.manifest_path}")
