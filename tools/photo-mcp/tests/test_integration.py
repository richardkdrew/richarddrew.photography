import os
import pytest


@pytest.mark.skipif(
    not os.getenv("RUN_INTEGRATION_TESTS"),
    reason="Set RUN_INTEGRATION_TESTS=1 to run integration tests against real R2",
)
class TestR2Integration:
    def test_manifest_round_trip(self):
        """Upload manifest to real R2 and read it back."""
        from datetime import datetime, timezone
        from photo_mcp.manifest import load_manifest, save_manifest
        from photo_mcp.types import Manifest

        manifest = Manifest(
            generated=datetime.now(timezone.utc),
            base_url=os.environ["R2_BASE_URL"],
        )
        save_manifest(manifest)
        loaded = load_manifest()
        assert loaded.base_url == manifest.base_url

    def test_server_tools_are_registered(self):
        """All four v1 tools are registered on the FastMCP server."""
        import asyncio
        from photo_mcp.server import mcp

        tools = asyncio.run(mcp.list_tools())
        tool_names = {tool.name for tool in tools}
        assert "create_gallery" in tool_names
        assert "list_galleries" in tool_names
        assert "upload_photo" in tool_names
        assert "batch_upload" in tool_names
