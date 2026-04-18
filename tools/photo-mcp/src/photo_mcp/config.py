from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    r2_account_id: str = Field(..., description="Cloudflare account ID")
    r2_access_key_id: str = Field(..., description="R2 access key ID")
    r2_secret_access_key: str = Field(..., description="R2 secret access key")
    r2_bucket_name: str = Field(default="portfolio-photos", description="R2 bucket name")
    r2_base_url: str = Field(..., description="Base URL for photos CDN")
    manifest_path: str = Field(default="manifest.json", description="Path to manifest in R2")
    log_level: str = Field(default="INFO", description="Logging level")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow",
    )


settings = Settings()
