from bson import ObjectId
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from db.mongodb import get_db
from models.article import ArticleRequest, ArticleResponse, ArticleInDB
from services.llm_service import generate_article
from services.cloudinary_service import upload_image

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop"

router = APIRouter()


def _to_response(doc_obj: ArticleInDB) -> ArticleResponse:
    return ArticleResponse(
        id=doc_obj.mongo_id,
        title=doc_obj.title,
        summary=doc_obj.summary,
        content=doc_obj.content,
        category=doc_obj.category,
        image_url=doc_obj.image_url,
        created_at=doc_obj.created_at,
    )


@router.post("/generate", response_model=ArticleResponse)
async def generate(request: ArticleRequest):
    """Generate an article via Groq — returns a draft (not yet saved)."""
    article = await generate_article(request.topic)
    return ArticleResponse(
        title=article.title,
        summary=article.summary,
        content=article.content,
        category=article.category,
        image_url=article.image_url or DEFAULT_IMAGE,
    )


@router.post("/publish", response_model=ArticleResponse)
async def publish_article(
    title: str = Form(...),
    summary: str = Form(...),
    content: str = Form(...),
    category: str = Form("General"),
    topic: str = Form(""),
    image: UploadFile | None = File(None),
    existing_image_url: str = Form(""),
):
    """Publish an article: optionally upload image to Cloudinary, then save to DB."""
    image_url = existing_image_url or DEFAULT_IMAGE

    if image and image.size and image.size > 0:
        file_bytes = await image.read()
        if len(file_bytes) > 0:
            image_url = await upload_image(file_bytes, folder="articles")

    doc = ArticleInDB(
        topic=topic,
        title=title,
        summary=summary,
        content=content,
        category=category,
        image_url=image_url,
    )

    db = get_db()
    article_id = ""
    if db is not None:
        result = await db["articles"].insert_one(doc.to_mongo())
        article_id = str(result.inserted_id)

    return ArticleResponse(
        id=article_id,
        title=doc.title,
        summary=doc.summary,
        content=doc.content,
        category=doc.category,
        image_url=doc.image_url,
        created_at=doc.created_at,
    )


@router.post("/upload-image")
async def upload_article_image(image: UploadFile = File(...)):
    """Upload a standalone image to Cloudinary and return the URL."""
    file_bytes = await image.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    url = await upload_image(file_bytes, folder="articles")
    return {"image_url": url}


@router.get("/", response_model=list[ArticleResponse])
async def list_articles(category: str | None = None, limit: int = 20):
    """List recent articles, optionally filtered by category."""
    db = get_db()
    if db is None:
        return []

    query = {"category": category} if category else {}
    cursor = db["articles"].find(query).sort("created_at", -1).limit(limit)
    articles = []
    async for doc in cursor:
        articles.append(_to_response(ArticleInDB.from_mongo(doc)))
    return articles


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    """Fetch a single article by its MongoDB ObjectId."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        oid = ObjectId(article_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid article ID") from exc

    doc = await db["articles"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")

    return _to_response(ArticleInDB.from_mongo(doc))
