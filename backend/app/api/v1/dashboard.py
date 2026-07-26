from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep, FarmerDep, BuyerDep
from app.models.auction import ProductAuction, AuctionStatus
from app.models.bid import BidId, Status
from app.schemas.auction import AuctionSummary
from app.schemas.bid import Bid as BidSchema

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/farmer", response_model=dict)
async def get_farmer_dashboard(db: SessionDep, current_farmer: FarmerDep):
    auctions_res = await db.execute(
        select(ProductAuction)
        .where(ProductAuction.fid == current_farmer.uid)
        .order_by(ProductAuction.CreatedAt.desc())
    )
    auctions = list(auctions_res.scalars().all())
    
    bids_res = await db.execute(
        select(BidId)
        .where(BidId.fid == current_farmer.uid)
        .order_by(BidId.bidTime.desc())
    )
    bids = list(bids_res.scalars().all())
    
    serialized_auctions = [AuctionSummary.model_validate(a).model_dump(mode="json") for a in auctions]
    
    return {
        "auctions": serialized_auctions,
        "stats": {
            "total_auctions": len(auctions),
            "open_auctions": sum(1 for a in auctions if a.auctionStatus == AuctionStatus.OPEN),
            "total_bids_received": len(bids),
            "accepted_bids": sum(1 for b in bids if b.status == Status.ACCEPTED)
        }
    }

@router.get("/buyer", response_model=dict)
async def get_buyer_dashboard(db: SessionDep, current_buyer: BuyerDep):
    bids_res = await db.execute(
        select(BidId)
        .where(BidId.cid == current_buyer.uid)
        .options(selectinload(BidId.user_cid))
        .order_by(BidId.bidTime.desc())
    )
    bids = list(bids_res.scalars().all())
    
    serialized_bids = [BidSchema.model_validate(b).model_dump(mode="json") for b in bids]
    
    return {
        "bids": serialized_bids,
        "stats": {
            "total_bids": len(bids),
            "pending": sum(1 for b in bids if b.status == Status.PENDING),
            "accepted": sum(1 for b in bids if b.status == Status.ACCEPTED),
            "rejected": sum(1 for b in bids if b.status == Status.REJECTED)
        }
    }
