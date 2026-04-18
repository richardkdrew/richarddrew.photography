import asyncio

import pytest


def test_server_instance_has_expected_name():
    """The FastMCP instance is named 'photo-mcp'."""
    from photo_mcp.server import mcp

    assert mcp.name == "photo-mcp"


def test_all_four_tools_are_registered():
    """All four v1 tools are registered on the FastMCP server."""
    from photo_mcp.server import mcp

    tools = asyncio.run(mcp.list_tools())
    tool_names = {tool.name for tool in tools}
    assert "create_gallery" in tool_names
    assert "list_galleries" in tool_names
    assert "upload_photo" in tool_names
    assert "batch_upload" in tool_names


def test_tool_count_is_exactly_four():
    """No extra tools are registered beyond the four expected ones."""
    from photo_mcp.server import mcp

    tools = asyncio.run(mcp.list_tools())
    assert len(tools) == 4
