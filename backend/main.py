from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.mongodb import connect_db, close_db
from routes.article import router as article_router
from routes.ads import router as ads_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI News Platform API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(article_router, prefix="/articles", tags=["articles"])
app.include_router(ads_router, prefix="/ads", tags=["ads"])


@app.get("/health")
async def health():
    return {"status": "ok"}
