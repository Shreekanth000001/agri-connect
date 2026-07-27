import enum
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class AuctionStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"

class Category(str, enum.Enum):
    VEGETABLES = "VEGETABLES"
    FRUITS = "FRUITS"
    GRAINS = "GRAINS"
    DAIRY = "DAIRY"
    MEAT = "MEAT"
    FISH = "FISH"
    OTHER = "OTHER"

class ProductAuction(Base):
    __tablename__ = "ProductAuction"

    ProdAucId: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fid: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="RESTRICT"))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    startingBid: Mapped[float] = mapped_column(Float, nullable=False)
    startTime: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    endTime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    auctionStatus: Mapped[AuctionStatus] = mapped_column(
        Enum(AuctionStatus, name="AuctionStatus"), default=AuctionStatus.OPEN
    )
    category: Mapped[Category] = mapped_column(
        Enum(Category, name="Category"), default=Category.OTHER
    )
    imageUrl: Mapped[list[str]] = mapped_column(ARRAY(String), default=[])
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user_fid = relationship("User", back_populates="prod_fid", foreign_keys=[fid])
    auc_bid = relationship("BidId", back_populates="auc_bid", foreign_keys="BidId.aucId")
