import os
import asyncio
from typing import Any
from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.rate_limiter import RateLimiterMiddleware
from app.db.base import Base
from app.db.session import engine
from app.workers.auction_worker import start_background_auction_worker

from app.api.v1 import (
    auth, auctions, products, bids, users, contact,
    dashboard, upload, chat, chat_ws, ai, weather, recommendations
)

setup_logging("INFO")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AgriConnect V2 Backend starting up...")
    async with engine.begin() as conn:
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            logger.warning(f"Metadata table creation notice: {e}")
        
        # Safely migrate existing table schemas
        await conn.execute(text('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES "ProductAuction"("ProdAucId") ON DELETE SET NULL;'))
        await conn.execute(text('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS farmer_id INTEGER REFERENCES "User"("uid") ON DELETE CASCADE;'))
        await conn.execute(text('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS consumer_id INTEGER REFERENCES "User"("uid") ON DELETE CASCADE;'))
        await conn.execute(text('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT \'OPEN\';'))
        await conn.execute(text('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS accepted_bid_id INTEGER REFERENCES "BidId"("bidId") ON DELETE SET NULL;'))
        await conn.execute(text('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS offer JSONB;'))

    # Launch background auction worker
    worker_task = asyncio.create_task(start_background_auction_worker(interval_seconds=60))
    
    yield
    
    logger.info("🛑 AgriConnect V2 Backend shutting down...")
    worker_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Production Backend for Agri Connect V2",
    lifespan=lifespan,
)

# Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Server Exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Add Rate Limiter Middleware
app.add_middleware(RateLimiterMiddleware)

# Ensure project-relative uploads directory exists and mount static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Secure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",

         # Production
        "https://agriconnect.shreek.me",
        "https://agri-connect-it.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(auctions.router)
api_router.include_router(bids.router)
api_router.include_router(users.router)
api_router.include_router(contact.router)
api_router.include_router(dashboard.router)
api_router.include_router(upload.router)
api_router.include_router(chat.router)
api_router.include_router(chat_ws.router)
api_router.include_router(ai.router)
api_router.include_router(weather.router)
api_router.include_router(recommendations.router)

app.include_router(api_router)

@app.get("/api/v1/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/api/v1/health/db")
async def health_db() -> dict[str, Any]:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "PostgreSQL"}
    except Exception as e:
        return {"status": "unhealthy", "database": "PostgreSQL", "error": str(e)}

@app.get("/api/v1/health/redis")
async def health_redis() -> dict[str, Any]:
    from app.services.ai.memory import memory_store
    return {"status": "healthy", "memory_store": memory_store.__class__.__name__}

@app.get("/api/v1/health/ai")
async def health_ai() -> dict[str, Any]:
    from app.services.ai.providers import get_provider_status
    return {"status": "healthy", "providers": get_provider_status()}
