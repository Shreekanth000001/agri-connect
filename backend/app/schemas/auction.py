from datetime import datetime
from pydantic import BaseModel, Field
from app.models.auction import AuctionStatus, Category
from app.schemas.user import User

class AuctionBase(BaseModel):
    title: str
    description: str
    startingBid: float
    category: Category = Category.OTHER
    imageUrl: list[str] = []

class AuctionCreate(AuctionBase):
    startTime: datetime = Field(default_factory=datetime.utcnow)
    endTime: datetime

class AuctionUpdate(BaseModel):
    auctionStatus: AuctionStatus | None = None

class AuctionInDBBase(AuctionBase):
    ProdAucId: int
    fid: int
    startTime: datetime
    endTime: datetime
    auctionStatus: AuctionStatus
    CreatedAt: datetime
    
    model_config = {"from_attributes": True}

class Auction(AuctionInDBBase):
    farmer: User | None = None
    bid_count: int | None = None
    highest_bid: float | None = None

class AuctionSummary(BaseModel):
    ProdAucId: int
    title: str
    startingBid: float
    category: Category
    auctionStatus: AuctionStatus
    thumbnail: str | None = None
    startTime: datetime
    endTime: datetime
    farmer: User | None = None
    
    model_config = {"from_attributes": True}

class PaginatedAuctions(BaseModel):
    items: list[AuctionSummary]
    total: int
    page: int
    pages: int
