"""Chat session mapping model (session_id -> cart_id)."""

from sqlalchemy import Column, ForeignKey, Integer, String

from app.db.base import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    # Using session_id as PK makes lookup cheap and enforces uniqueness.
    session_id = Column(String(length=128), primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False, index=True)

