from datetime import datetime
from pydantic import BaseModel
from app.models.bid import Status
from app.schemas.user import User

class BidBase(BaseModel):
    bidAmount: float
    deliveryDate: datetime | None = None

class BidCreate(BidBase):
    pass

class BidUpdate(BaseModel):
    status: Status

class BidInDBBase(BidBase):
    bidId: int
    aucId: int
    cid: int
    fid: int
    bidTime: datetime
    status: Status
    ujoinedAt: datetime

    model_config = {"from_attributes": True}

class Bid(BidInDBBase):
    user_cid: User | None = None
