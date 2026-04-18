def test_settings_loads_from_environment():
    from photo_mcp.config import settings
    assert settings.r2_account_id == "test-account-id"
    assert settings.r2_access_key_id == "test-access-key"
    assert settings.r2_bucket_name == "test-bucket"
    assert settings.r2_base_url == "https://photos.test.com"
    assert settings.manifest_path == "manifest.json"


def test_settings_has_default_log_level():
    from photo_mcp.config import settings
    assert settings.log_level.upper() in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")


def test_settings_has_default_manifest_path():
    from photo_mcp.config import settings
    assert settings.manifest_path == "manifest.json"
