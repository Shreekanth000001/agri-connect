from typing import Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.auction import AuctionStatus, Category
from app.schemas.user import User

from pydantic import BaseModel, Field, AliasChoices, ConfigDict

class AuctionBase(BaseModel):
    title: str
    description: str
    startingBid: float = Field(..., validation_alias=AliasChoices("startingBid", "starting_bid", "price"))
    category: Category = Field(default=Category.OTHER, validation_alias=AliasChoices("category", "category_name"))
    imageUrl: list[str] = Field(default=[], validation_alias=AliasChoices("imageUrl", "image_url", "images"))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True, extra="ignore")

class AuctionCreate(AuctionBase):
    startTime: datetime = Field(default_factory=datetime.utcnow, validation_alias=AliasChoices("startTime", "start_time"))
    endTime: datetime = Field(..., validation_alias=AliasChoices("endTime", "end_time"))

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
    farmer: User | None = Field(default=None, validation_alias=AliasChoices("farmer", "user_fid"))
    bid_count: int | None = None
    highest_bid: float | None = None

from pydantic import BaseModel, Field, model_validator

from app.schemas.bid import Bid as BidSchema

class AuctionSummary(BaseModel):
    ProdAucId: int
    title: str
    startingBid: float
    category: Category
    auctionStatus: AuctionStatus
    imageUrl: list[str] = []
    thumbnail: str | None = None
    startTime: datetime
    endTime: datetime
    farmer: User | None = Field(default=None, validation_alias=AliasChoices("farmer", "user_fid"))
    auc_bid: list[BidSchema] = Field(default=[], validation_alias=AliasChoices("auc_bid", "bids"))

    @model_validator(mode="before")
    @classmethod
    def handle_unloaded_relationships(cls, data: Any) -> Any:
        if hasattr(data, "__dict__"):
            d = dict(data.__dict__)
            # Remove un-instantiated inspectable states to prevent lazy-load triggers
            d.pop("_sa_instance_state", None)
            if "auc_bid" not in d:
                d["auc_bid"] = []
            return d
        return data

    @model_validator(mode="after")
    def set_thumbnail(self) -> "AuctionSummary":
        if self.imageUrl and len(self.imageUrl) > 0:
            self.thumbnail = self.imageUrl[0]
        return self

    model_config = {"from_attributes": True}

class PaginatedAuctions(BaseModel):
    items: list[AuctionSummary]
    total: int
    page: int
    pages: int
