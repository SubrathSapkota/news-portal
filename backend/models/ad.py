from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class AdSize(str, Enum):
    LEADERBOARD = "leaderboard"
    SIDEBAR = "sidebar"


AD_DIMENSIONS = {
    AdSize.LEADERBOARD: {"width": 728, "height": 90},
    AdSize.SIDEBAR: {"width": 300, "height": 250},
}


class AdResponse(BaseModel):
    id: str = ""
    size: AdSize
    image_url: str
    overlay_text: str = ""
    link_url: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AdInDB(BaseModel):
    mongo_id: str = ""
    size: AdSize
    image_url: str
    overlay_text: str = ""
    link_url: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_mongo(self) -> dict:
        data = self.model_dump()
        data.pop("mongo_id", None)
        return data

    @classmethod
    def from_mongo(cls, doc: dict) -> "AdInDB":
        ad_id = str(doc.pop("_id", ""))
        return cls(mongo_id=ad_id, **doc)
