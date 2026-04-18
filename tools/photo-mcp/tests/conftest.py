import os

# Set env vars before any photo_mcp modules are imported.
# pydantic-settings reads env vars at Settings() creation time (module import).
os.environ.setdefault("R2_ACCOUNT_ID", "test-account-id")
os.environ.setdefault("R2_ACCESS_KEY_ID", "test-access-key")
os.environ.setdefault("R2_SECRET_ACCESS_KEY", "test-secret-key")
os.environ.setdefault("R2_BUCKET_NAME", "test-bucket")
os.environ.setdefault("R2_BASE_URL", "https://photos.test.com")
os.environ.setdefault("MANIFEST_PATH", "manifest.json")
os.environ.setdefault("LOG_LEVEL", "WARNING")
