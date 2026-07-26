from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1 import auth, auctions, bids, users, contact, dashboard, upload, chat, chat_ws

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI backend for Agri Connect V2",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
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

