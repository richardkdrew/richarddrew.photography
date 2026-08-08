import os
from datetime import UTC

import pytest


@pytest.mark.skipif(
    not os.getenv("RUN_INTEGRATION_TESTS"),
    reason="Set RUN_INTEGRATION_TESTS=1 to run integration tests against real R2",
)
class TestR2Integration:
    def test_manifest_round_trip(self):
        """Upload manifest to real R2 and read it back."""
        from datetime import datetime

        from photo_mcp.manifest import load_manifest, save_manifest
        from photo_mcp.types import Manifest

        manifest = Manifest(
            generated=datetime.now(UTC),
            base_url=os.environ["R2_BASE_URL"],
        )
        save_manifest(manifest)
        loaded = load_manifest()
        assert loaded.base_url == manifest.base_url
