from datetime import datetime
from pydantic import BaseModel
from app.models.bid import Status
from app.schemas.user import User

from pydantic import Field, AliasChoices, ConfigDict

class BidBase(BaseModel):
    bidAmount: float = Field(..., validation_alias=AliasChoices("bidAmount", "amount", "bid_amount"))
    deliveryDate: datetime | None = None
    aucId: int | None = Field(default=None, validation_alias=AliasChoices("aucId", "auction_id", "id"))

    model_config = ConfigDict(populate_by_name=True, from_attributes=True, extra="ignore")

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

from typing import Any
from pydantic import model_validator

class Bid(BidInDBBase):
    user_cid: User | None = Field(default=None, validation_alias=AliasChoices("user_cid", "buyer"))

    @model_validator(mode="before")
    @classmethod
    def handle_unloaded_relationships(cls, data: Any) -> Any:
        if hasattr(data, "__dict__"):
            d = dict(data.__dict__)
            d.pop("_sa_instance_state", None)
            if "user_cid" not in d:
                d["user_cid"] = None
            return d
        return data
