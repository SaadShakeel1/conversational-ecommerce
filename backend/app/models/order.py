"""Order model."""
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    order_status = Column(String(64), default="pending")
    total = Column(Numeric(10, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
