from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from typing import Optional
from app.api.deps import SessionDep, CurrentUser, FarmerDep
from app.models.auction import ProductAuction, AuctionStatus
from app.schemas.auction import AuctionCreate, Auction, PaginatedAuctions, AuctionSummary

router = APIRouter(prefix="/auctions", tags=["auctions"])

from sqlalchemy import select, func, cast, String, or_

from app.models.user import User

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
    query = select(ProductAuction).outerjoin(User, ProductAuction.fid == User.uid)
    farmer_target = farmer_id if farmer_id is not None else fid
    if farmer_target is not None:
        query = query.where(ProductAuction.fid == farmer_target)
    if status and status.upper() != "ALL":
        query = query.where(cast(ProductAuction.auctionStatus, String) == status)
    if category and category.upper() != "ALL":
        query = query.where(func.upper(cast(ProductAuction.category, String)) == category.upper())
    
    search_term = search or q
    if search_term:
        search_pattern = f"%{search_term}%"
        query = query.where(
            or_(
                ProductAuction.title.ilike(search_pattern),
                ProductAuction.description.ilike(search_pattern),
                User.uname.ilike(search_pattern)
            )
        )
        
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
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
    search_pattern = f"%{q}%"
    query = select(ProductAuction).outerjoin(User, ProductAuction.fid == User.uid).where(
        or_(
            ProductAuction.title.ilike(search_pattern),
            ProductAuction.description.ilike(search_pattern),
            User.uname.ilike(search_pattern)
        )
    )
    
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar() or 0
    
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    summaries = [AuctionSummary.model_validate(item) for item in items]
        
    return PaginatedAuctions(
        items=summaries,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit if limit else 1
    )

@router.get("/{id}", response_model=Auction)
async def get_auction(id: int, db: SessionDep):
    auction = await db.get(ProductAuction, id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.post("", response_model=Auction, status_code=201)
async def create_auction(
    auction_in: AuctionCreate,
    db: SessionDep,
    current_farmer: FarmerDep
):
    db_auction = ProductAuction(
        fid=current_farmer.uid,
        title=auction_in.title,
        description=auction_in.description,
        startingBid=auction_in.startingBid,
        startTime=auction_in.startTime,
        endTime=auction_in.endTime,
        category=auction_in.category,
        imageUrl=auction_in.imageUrl
    )
    db.add(db_auction)
    await db.commit()
    await db.refresh(db_auction)
    return db_auction

@router.patch("/{id}/cancel", response_model=Auction)
async def cancel_auction(
    id: int,
    db: SessionDep,
    current_farmer: FarmerDep
):
    auction = await db.get(ProductAuction, id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.fid != current_farmer.uid:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    auction.auctionStatus = AuctionStatus.CANCELLED
    await db.commit()
    await db.refresh(auction)
    return auction
