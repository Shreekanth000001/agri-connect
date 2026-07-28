import asyncio
import logging
from datetime import datetime
from sqlalchemy import select, update
from app.db.session import AsyncSessionLocal
from app.models.auction import ProductAuction, AuctionStatus

logger = logging.getLogger(__name__)

async def auto_close_expired_auctions():
    """Background task to transition past auctions to CLOSED status."""
    try:
        async with AsyncSessionLocal() as db:
            now = datetime.now()
            stmt = (
                update(ProductAuction)
                .where(
                    ProductAuction.auctionStatus == AuctionStatus.OPEN,
                    ProductAuction.endTime <= now
                )
                .values(auctionStatus=AuctionStatus.CLOSED)
            )
            result = await db.execute(stmt)
            await db.commit()
            if result.rowcount > 0:
                logger.info(f"[AuctionWorker] Auto-closed {result.rowcount} expired produce auctions.")
    except Exception as e:
        logger.error(f"[AuctionWorker] Error closing expired auctions: {e}")

async def start_background_auction_worker(interval_seconds: int = 60):
    """Loop runner for background auction processing worker."""
    logger.info(f"[AuctionWorker] Started background worker (polling every {interval_seconds}s)...")
    while True:
        await auto_close_expired_auctions()
        await asyncio.sleep(interval_seconds)
