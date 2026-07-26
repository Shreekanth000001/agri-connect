import enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base_class import Base

class MessageStatus(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"
    RESOLVED = "RESOLVED"

class ContactMessage(Base):
    __tablename__ = "ContactMessage"

    msgId: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[MessageStatus] = mapped_column(default=MessageStatus.UNREAD)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=func.now())
