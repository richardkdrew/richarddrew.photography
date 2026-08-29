from datetime import datetime

from pydantic import BaseModel


class ImageDimensions(BaseModel):
    width: int
    height: int


class ManifestImage(BaseModel):
    id: str
    filename: str
    path: str
    gallery: str
    alt: str
    date_taken: str | None = None
    uploaded: datetime
    dimensions: ImageDimensions


class ManifestGallery(BaseModel):
    title: str
    description: str = ""
    created: datetime


class Manifest(BaseModel):
    version: str = "1.0"
    generated: datetime
    base_url: str
    galleries: dict[str, ManifestGallery] = {}
    images: dict[str, ManifestImage] = {}


class GallerySummary(BaseModel):
    slug: str
    title: str
    description: str
    photo_count: int
