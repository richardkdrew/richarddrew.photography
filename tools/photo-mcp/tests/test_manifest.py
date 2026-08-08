import json
from datetime import UTC, datetime
from unittest.mock import MagicMock

from botocore.exceptions import ClientError


def _client_error(code: str) -> ClientError:
    return ClientError({"Error": {"Code": code, "Message": "test"}}, "GetObject")


def test_load_manifest_returns_empty_when_not_found(mocker):
    mock_client = MagicMock()
    mock_client.get_object.side_effect = _client_error("NoSuchKey")
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest

    manifest = load_manifest()

    assert manifest.version == "1.0"
    assert manifest.galleries == {}
    assert manifest.images == {}


def test_load_manifest_parses_existing_manifest(mocker):
    mock_client = MagicMock()
    data = {
        "version": "1.0",
        "generated": "2026-04-18T10:00:00Z",
        "base_url": "https://photos.test.com",
        "galleries": {
            "landscapes": {
                "title": "Landscapes",
                "description": "",
                "created": "2026-04-18T10:00:00Z",
            }
        },
        "images": {},
    }
    mock_client.get_object.return_value = {
        "Body": MagicMock(read=lambda: json.dumps(data).encode())
    }
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest

    manifest = load_manifest()

    assert "landscapes" in manifest.galleries
    assert manifest.galleries["landscapes"].title == "Landscapes"


def test_load_manifest_raises_on_unexpected_r2_error(mocker):
    import pytest

    mock_client = MagicMock()
    mock_client.get_object.side_effect = _client_error("AccessDenied")
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)

    from photo_mcp.manifest import load_manifest

    with pytest.raises(ClientError):
        load_manifest()


def test_save_manifest_writes_json_to_r2(mocker):
    from photo_mcp.types import Manifest

    mock_client = MagicMock()
    mocker.patch("photo_mcp.manifest.get_r2_client", return_value=mock_client)
    mocker.patch("photo_mcp.manifest.settings.r2_bucket_name", "test-bucket")
    mocker.patch("photo_mcp.manifest.settings.manifest_path", "manifest.json")

    from photo_mcp.manifest import save_manifest

    manifest = Manifest(generated=datetime.now(UTC), base_url="https://photos.test.com")
    save_manifest(manifest)

    mock_client.put_object.assert_called_once()
    call_kwargs = mock_client.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "test-bucket"
    assert call_kwargs["Key"] == "manifest.json"
    assert call_kwargs["ContentType"] == "application/json"
    body = json.loads(call_kwargs["Body"].decode())
    assert body["base_url"] == "https://photos.test.com"
