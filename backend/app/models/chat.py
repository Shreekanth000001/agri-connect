import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ConversationStatus(str, enum.Enum):
    OPEN = "OPEN"
    NEGOTIATING = "NEGOTIATING"
    CLOSED = "CLOSED"
    ACCEPTED = "ACCEPTED"
    CANCELLED = "CANCELLED"

class Conversation(Base):
    __tablename__ = "Conversation"
    __table_args__ = (
        UniqueConstraint("product_id", "farmer_id", "consumer_id", name="uq_conversation_product_farmer_consumer"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("ProductAuction.ProdAucId", ondelete="SET NULL"), nullable=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="CASCADE"), nullable=False)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="CASCADE"), nullable=False)
    status: Mapped[ConversationStatus] = mapped_column(default=ConversationStatus.OPEN, nullable=False)
    accepted_bid_id: Mapped[int | None] = mapped_column(ForeignKey("BidId.bidId", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    product = relationship("ProductAuction")
    farmer = relationship("User", foreign_keys=[farmer_id])
    consumer = relationship("User", foreign_keys=[consumer_id])
    accepted_bid = relationship("BidId", foreign_keys=[accepted_bid_id])
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class ConversationParticipant(Base):
    __tablename__ = "ConversationParticipant"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("Conversation.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="CASCADE"), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User")


from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, UniqueConstraint, JSON

class Message(Base):
    __tablename__ = "Message"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("Conversation.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[int] = mapped_column(ForeignKey("User.uid", ondelete="CASCADE"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    offer: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")
