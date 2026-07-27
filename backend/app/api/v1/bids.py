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

from app.models.chat import Conversation, ConversationStatus
from app.repositories.chat_repository import chat_repository
from app.schemas.chat import ConversationResponse

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
    if auction:
        auction.auctionStatus = AuctionStatus.CLOSED
    
    # Reject other pending bids for this auction
    await db.execute(
        update(BidId)
        .where(BidId.aucId == bid.aucId, BidId.bidId != id, BidId.status == Status.PENDING)
        .values(status=Status.REJECTED)
    )
    
    # Link to existing conversation (or create one if it doesn't exist yet)
    conversation = await chat_repository.find_existing_conversation(
        db, farmer_id=bid.fid, consumer_id=bid.cid, product_id=bid.aucId
    )
    if not conversation:
        conversation = await chat_repository.create_conversation(
            db, farmer_id=bid.fid, consumer_id=bid.cid, product_id=bid.aucId
        )

    conversation.accepted_bid_id = bid.bidId
    conversation.status = ConversationStatus.NEGOTIATING
    db.add(conversation)

    await db.commit()
    await db.refresh(bid)
    
    # Reload conversation details
    updated_conversation = await chat_repository.get_conversation(db, conversation.id, current_farmer.uid)
    conv_response = ConversationResponse.model_validate(updated_conversation)

    return {
        "bid": bid,
        "auction_status": auction.auctionStatus if auction else "CLOSED",
        "conversation": conv_response
    }

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

@router.get("/bids/my-bids", response_model=list[Bid])
async def get_my_bids(
    db: SessionDep,
    current_user: CurrentUser
):
    stmt = select(BidId).where(
        (BidId.cid == current_user.uid) | (BidId.fid == current_user.uid)
    ).order_by(BidId.bidTime.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())
