from fastapi import APIRouter, Depends
from sqlalchemy import select
from app.api.deps import SessionDep, FarmerDep, BuyerDep, CurrentUser
from app.models.auction import ProductAuction, AuctionStatus
from app.models.bid import BidId, Status

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/farmer", response_model=dict)
async def get_farmer_dashboard(db: SessionDep, current_farmer: FarmerDep):
    auctions_res = await db.execute(select(ProductAuction).where(ProductAuction.fid == current_farmer.uid))
    auctions = auctions_res.scalars().all()
    
    bids_res = await db.execute(select(BidId).where(BidId.fid == current_farmer.uid))
    bids = bids_res.scalars().all()
    
    return {
        "auctions": [], 
        "stats": {
            "total_auctions": len(auctions),
            "open_auctions": sum(1 for a in auctions if a.auctionStatus == AuctionStatus.OPEN),
            "total_bids_received": len(bids),
            "accepted_bids": sum(1 for b in bids if b.status == Status.ACCEPTED)
        }
    }

@router.get("/buyer", response_model=dict)
async def get_buyer_dashboard(db: SessionDep, current_buyer: BuyerDep):
    bids_res = await db.execute(select(BidId).where(BidId.cid == current_buyer.uid))
    bids = bids_res.scalars().all()
    
    return {
        "bids": [], 
        "stats": {
            "total_bids": len(bids),
            "pending": sum(1 for b in bids if b.status == Status.PENDING),
            "accepted": sum(1 for b in bids if b.status == Status.ACCEPTED),
            "rejected": sum(1 for b in bids if b.status == Status.REJECTED)
        }
    }
