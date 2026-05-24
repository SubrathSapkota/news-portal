import logging
from io import BytesIO

import cloudinary
import cloudinary.uploader

from config import settings

logger = logging.getLogger(__name__)

_configured = False


def _ensure_configured():
    global _configured
    if _configured:
        return
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _configured = True


async def upload_image(file_bytes: bytes, folder: str = "articles") -> str:
    """Upload image bytes to Cloudinary and return the secure URL."""
    _ensure_configured()
    result = cloudinary.uploader.upload(
        BytesIO(file_bytes),
        folder=f"news-ai/{folder}",
        resource_type="image",
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return result["secure_url"]


async def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary by its public_id."""
    _ensure_configured()
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as exc:
        logger.warning("Cloudinary delete failed: %s", exc)
        return False
