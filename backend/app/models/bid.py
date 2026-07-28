import enum
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Status(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class BidId(Base):
    __tablename__ = "BidId"
    __table_args__ = (
        Index("ix_bid_auc_id", "aucId"),
        Index("ix_bid_cid", "cid"),
        Index("ix_bid_fid", "fid"),
        Index("ix_bid_status", "status"),
    )

    bidId: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    aucId: Mapped[int] = mapped_column(ForeignKey("ProductAuction.ProdAucId", ondelete="RESTRICT"))
    cid: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="RESTRICT"))
    fid: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="RESTRICT"))
    bidAmount: Mapped[float] = mapped_column(Float, nullable=False)
    bidTime: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    deliveryDate: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[Status] = mapped_column(Enum(Status, name="Status"), default=Status.PENDING)
    ujoinedAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    user_cid = relationship("User", back_populates="bids_cid", foreign_keys=[cid])
    user_fid = relationship("User", back_populates="bids_fid", foreign_keys=[fid])
    auc_bid = relationship("ProductAuction", back_populates="auc_bid", foreign_keys=[aucId])
