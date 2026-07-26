import os
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings

from app.api.v1 import auth, auctions, bids, users, contact, dashboard, upload, chat, chat_ws

from contextlib import asynccontextmanager
from app.db.base import Base
from app.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create missing database tables (Conversation, Message, etc.) on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI backend for Agri Connect V2",
    lifespan=lifespan,
)

# Ensure uploads directory exists and mount static files
UPLOAD_DIR = "/home/critic-coder/project/AI_Assisted_Projects/agri-connect-v2/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(auctions.router)
api_router.include_router(bids.router)
api_router.include_router(users.router)
api_router.include_router(contact.router)
api_router.include_router(dashboard.router)
api_router.include_router(upload.router)
api_router.include_router(chat.router)
api_router.include_router(chat_ws.router)

app.include_router(api_router)

@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

