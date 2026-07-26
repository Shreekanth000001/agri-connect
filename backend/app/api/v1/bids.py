from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from app.api.deps import SessionDep, CurrentUser, FarmerDep, BuyerDep
from app.models.auction import ProductAuction, AuctionStatus
from app.models.bid import BidId, Status
from app.schemas.bid import BidCreate, Bid

router = APIRouter(tags=["bids"])

@router.post("/auctions/{id}/bids", response_model=Bid, status_code=status.HTTP_201_CREATED)
async def create_bid(
    id: int,
    bid_in: BidCreate,
    db: SessionDep,
    current_buyer: BuyerDep
):
    auction = await db.get(ProductAuction, id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.auctionStatus != AuctionStatus.OPEN:
        raise HTTPException(status_code=400, detail="Auction is not open")
    if bid_in.bidAmount <= auction.startingBid:
        raise HTTPException(status_code=400, detail="Bid must be higher than starting bid")
        
    existing_bid = await db.execute(
        select(BidId).where(BidId.aucId == id, BidId.cid == current_buyer.uid)
    )
    if existing_bid.scalars().first():
        raise HTTPException(status_code=409, detail="You have already bid on this auction")
        
    db_bid = BidId(
        aucId=id,
        cid=current_buyer.uid,
        fid=auction.fid,
        bidAmount=bid_in.bidAmount,
        deliveryDate=bid_in.deliveryDate
    )
    db.add(db_bid)
    await db.commit()
    await db.refresh(db_bid)
    return db_bid

@router.patch("/bids/{id}/accept", response_model=dict)
async def accept_bid(
    id: int,
    db: SessionDep,
    current_farmer: FarmerDep
):
    bid = await db.get(BidId, id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.fid != current_farmer.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    bid.status = Status.ACCEPTED
    
    auction = await db.get(ProductAuction, bid.aucId)
    auction.auctionStatus = AuctionStatus.CLOSED
    
    await db.execute(
        update(BidId)
        .where(BidId.aucId == bid.aucId, BidId.bidId != id, BidId.status == Status.PENDING)
        .values(status=Status.REJECTED)
    )
    
    await db.commit()
    await db.refresh(bid)
    return {"bid": bid, "auction_status": auction.auctionStatus}

@router.patch("/bids/{id}/reject", response_model=Bid)
async def reject_bid(
    id: int,
    db: SessionDep,
    current_farmer: FarmerDep
):
    bid = await db.get(BidId, id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    if bid.fid != current_farmer.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    bid.status = Status.REJECTED
    await db.commit()
    await db.refresh(bid)
    return bid
