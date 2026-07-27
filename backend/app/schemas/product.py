from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.models.auction import Category, AuctionStatus
from app.schemas.user import User

class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    startingBid: float = Field(..., gt=0)
    category: Category = Category.OTHER
    imageUrl: list[str] = Field(default_factory=list)

class ProductCreate(ProductBase):
    startTime: datetime | None = None
    endTime: datetime

class ProductUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, min_length=1)
    startingBid: float | None = Field(None, gt=0)
    category: Category | None = None
    imageUrl: list[str] | None = None
    endTime: datetime | None = None
    auctionStatus: AuctionStatus | None = None

class ProductResponse(ProductBase):
    ProdAucId: int
    id: int | None = None
    fid: int
    startTime: datetime
    endTime: datetime
    auctionStatus: AuctionStatus
    CreatedAt: datetime
    created_at: datetime | None = None
    user_fid: User | None = None
    user: User | None = None

    @model_validator(mode="after")
    def set_aliases(self) -> "ProductResponse":
        self.id = self.ProdAucId
        self.created_at = self.CreatedAt
        if self.user_fid:
            self.user = self.user_fid
        return self

    model_config = {"from_attributes": True}

class PaginatedProductsResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    pages: int
    limit: int

class CategoryListResponse(BaseModel):
    categories: list[str]
