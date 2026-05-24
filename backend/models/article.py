from datetime import datetime

from pydantic import BaseModel, Field


class ArticleRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=1000, description="Topic brief for article generation")


class ArticleResponse(BaseModel):
    id: str = ""
    title: str
    summary: str
    content: str
    category: str = "General"
    image_url: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ArticleInDB(BaseModel):
    """Schema that maps directly to the MongoDB articles collection."""
    mongo_id: str = ""
    topic: str
    title: str
    summary: str
    content: str
    category: str = "General"
    image_url: str = ""
    status: str = "published"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_mongo(self) -> dict:
        data = self.model_dump()
        data.pop("mongo_id", None)
        return data

    @classmethod
    def from_mongo(cls, doc: dict) -> "ArticleInDB":
        article_id = str(doc.pop("_id", ""))
        return cls(mongo_id=article_id, **doc)
