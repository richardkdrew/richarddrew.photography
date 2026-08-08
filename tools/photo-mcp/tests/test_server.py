import asyncio

# --- delegation tests ---


def test_create_gallery_delegates_args(mocker):
    mock = mocker.patch("photo_mcp.server._create_gallery", return_value={"slug": "s"})
    from photo_mcp.server import create_gallery

    create_gallery(name="Test", description="desc")
    mock.assert_called_once_with("Test", "desc")


def test_list_galleries_delegates(mocker):
    mock = mocker.patch("photo_mcp.server._list_galleries", return_value=[])
    from photo_mcp.server import list_galleries

    list_galleries()
    mock.assert_called_once_with()


def test_upload_photo_delegates_args(mocker):
    mock = mocker.patch("photo_mcp.server._upload_photo", return_value={"id": "x"})
    from photo_mcp.server import upload_photo

    upload_photo(file_path="/p/f.jpg", gallery="g", alt="A", date_taken="2025-01-01")
    mock.assert_called_once_with("/p/f.jpg", "g", alt="A", date_taken="2025-01-01")


def test_batch_upload_delegates_args(mocker):
    mock = mocker.patch("photo_mcp.server._batch_upload", return_value={"uploaded": 0})
    from photo_mcp.server import batch_upload

    batch_upload(folder_path="/p", gallery="g", alt_prefix="A", date_taken="2025-01-01")
    mock.assert_called_once_with("/p", "g", alt_prefix="A", date_taken="2025-01-01")


# --- registration tests ---


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
