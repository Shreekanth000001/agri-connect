from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.base_class import Base

class ProductKnowledge(Base):
    __tablename__ = "ProductKnowledge"
    __table_args__ = (
        Index("ix_knowledge_category", "category"),
        Index("ix_knowledge_topic", "topic"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

