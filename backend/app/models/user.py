"""User model (minimal for reviews/cart)."""
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    carts = relationship("Cart", back_populates="user", lazy="select")
    orders = relationship("Order", back_populates="user", lazy="select")
    reviews = relationship("Review", back_populates="user", lazy="select")
