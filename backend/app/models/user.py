import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Role(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"

class User(Base):
    __tablename__ = "User"

    uid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uname: Mapped[str] = mapped_column(String, nullable=False)
    uemail: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, default="")
    uphone: Mapped[str] = mapped_column(String, default="")
    ugeo: Mapped[str] = mapped_column(String, nullable=False)
    uloc: Mapped[str] = mapped_column(String, default="")
    role: Mapped[Role] = mapped_column(Enum(Role, name="Role", values_callable=lambda x: [e.value for e in x]), default=Role.FARMER)
    ujoinedAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    prod_fid = relationship("ProductAuction", back_populates="user_fid", foreign_keys="ProductAuction.fid")
    bids_cid = relationship("BidId", back_populates="user_cid", foreign_keys="BidId.cid")
    bids_fid = relationship("BidId", back_populates="user_fid", foreign_keys="BidId.fid")
