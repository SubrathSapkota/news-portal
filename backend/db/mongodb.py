import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import settings

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tlsCAFile=certifi.where(),
    )
    db = client[settings.DB_NAME]

    try:
        await _ensure_indexes()
    except Exception as e:
        logger.warning("Index creation skipped: %s", e)


async def _ensure_indexes():
    """Create indexes for the articles collection on first startup."""
    articles = db["articles"]
    await articles.create_index("category")
    await articles.create_index([("created_at", -1)])


async def close_db():
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    return db
