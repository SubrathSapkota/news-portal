from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from db.mongodb import get_db
from models.ad import AdSize, AdResponse, AdInDB
from services.cloudinary_service import upload_image

router = APIRouter()


def _to_response(doc_obj: AdInDB) -> AdResponse:
    return AdResponse(
        id=doc_obj.mongo_id,
        size=doc_obj.size,
        image_url=doc_obj.image_url,
        overlay_text=doc_obj.overlay_text,
        link_url=doc_obj.link_url,
        is_active=doc_obj.is_active,
        created_at=doc_obj.created_at,
    )


@router.post("/", response_model=AdResponse)
async def create_ad(
    size: AdSize = Form(...),
    overlay_text: str = Form(""),
    link_url: str = Form(""),
    image: UploadFile = File(...),
):
    """Create a new ad: upload image to Cloudinary and save metadata to DB."""
    file_bytes = await image.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Image file is required")

    image_url = await upload_image(file_bytes, folder="ads")

    doc = AdInDB(
        size=size,
        image_url=image_url,
        overlay_text=overlay_text,
        link_url=link_url,
    )

    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    result = await db["ads"].insert_one(doc.to_mongo())
    doc.mongo_id = str(result.inserted_id)
    return _to_response(doc)


@router.get("/", response_model=list[AdResponse])
async def list_ads(size: AdSize | None = None, active_only: bool = False):
    """List all ads, optionally filtered by size and active status."""
    db = get_db()
    if db is None:
        return []

    query = {}
    if size:
        query["size"] = size.value
    if active_only:
        query["is_active"] = True

    cursor = db["ads"].find(query).sort("created_at", -1)
    ads = []
    async for doc in cursor:
        ads.append(_to_response(AdInDB.from_mongo(doc)))
    return ads


@router.put("/{ad_id}", response_model=AdResponse)
async def update_ad(
    ad_id: str,
    overlay_text: str = Form(None),
    link_url: str = Form(None),
    is_active: bool = Form(None),
    image: UploadFile | None = File(None),
):
    """Update an existing ad's fields and/or image."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        oid = ObjectId(ad_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid ad ID") from exc

    existing = await db["ads"].find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Ad not found")

    updates = {"updated_at": __import__("datetime").datetime.utcnow()}

    if overlay_text is not None:
        updates["overlay_text"] = overlay_text
    if link_url is not None:
        updates["link_url"] = link_url
    if is_active is not None:
        updates["is_active"] = is_active

    if image and image.size and image.size > 0:
        file_bytes = await image.read()
        if len(file_bytes) > 0:
            updates["image_url"] = await upload_image(file_bytes, folder="ads")

    await db["ads"].update_one({"_id": oid}, {"$set": updates})

    doc = await db["ads"].find_one({"_id": oid})
    return _to_response(AdInDB.from_mongo(doc))


@router.delete("/{ad_id}")
async def delete_ad(ad_id: str):
    """Delete an ad."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        oid = ObjectId(ad_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid ad ID") from exc

    result = await db["ads"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ad not found")

    return {"detail": "Ad deleted"}
