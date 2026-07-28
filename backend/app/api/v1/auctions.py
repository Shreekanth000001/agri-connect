from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.api.deps import SessionDep, CurrentUser, FarmerDep
from app.models.auction import ProductAuction, AuctionStatus
from app.schemas.auction import AuctionCreate, Auction, PaginatedAuctions, AuctionSummary
from app.schemas.product import ProductCreate
from app.repositories.product_repository import product_repository

router = APIRouter(prefix="/auctions", tags=["auctions"])

@router.get("", response_model=PaginatedAuctions)
async def get_auctions(
    db: SessionDep,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: str = "OPEN",
    farmer_id: Optional[int] = None,
    fid: Optional[int] = None,
    search: Optional[str] = None,
    q: Optional[str] = None
):
    farmer_target = farmer_id if farmer_id is not None else fid
    search_term = search or q
    if search_term:
        items, total = await product_repository.search(db, q=search_term, page=page, limit=limit, category=category)
    else:
        items, total = await product_repository.get_all(
            db, page=page, limit=limit, category=category, status=status, farmer_id=farmer_target
        )
    
    summaries = [AuctionSummary.model_validate(item) for item in items]
    return PaginatedAuctions(
        items=summaries,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit if limit else 1
    )

@router.get("/search", response_model=PaginatedAuctions)
async def search_auctions(
    db: SessionDep,
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    items, total = await product_repository.search(db, q=q, page=page, limit=limit)
    summaries = [AuctionSummary.model_validate(item) for item in items]
    return PaginatedAuctions(
        items=summaries,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit if limit else 1
    )

@router.get("/{id}", response_model=Auction)
async def get_auction(id: int, db: SessionDep):
    auction = await product_repository.get_by_id(db, id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.post("", response_model=Auction, status_code=201)
async def create_auction(
    auction_in: AuctionCreate,
    db: SessionDep,
    current_farmer: FarmerDep
):
    product_in = ProductCreate(
        title=auction_in.title,
        description=auction_in.description,
        startingBid=auction_in.startingBid,
        startTime=auction_in.startTime,
        endTime=auction_in.endTime,
        category=auction_in.category, # type: ignore
        imageUrl=auction_in.imageUrl
    )
    return await product_repository.create(db, current_farmer.uid, product_in)

@router.patch("/{id}/cancel", response_model=Auction)
@router.patch("/{id}/close", response_model=Auction)
async def cancel_or_close_auction(
    id: int,
    db: SessionDep,
    current_farmer: FarmerDep
):
    auction = await product_repository.get_by_id(db, id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.fid != current_farmer.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    auction.auctionStatus = AuctionStatus.CLOSED
    db.add(auction)
    await db.commit()
    await db.refresh(auction)
    return auction
