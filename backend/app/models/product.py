"""Product model with JSONB specs."""
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    color = Column(String(64))
    size = Column(String(64))
    category = Column(String(128))
    # Use JSONB in Postgres; fall back to generic JSON for SQLite (tests).
    specs = Column(JSONB().with_variant(JSON, "sqlite"))  # materials, dimensions, etc.
    model_tag = Column(String(128))  # for compatibility e.g. phone model

    # Relationships
    inventory = relationship("Inventory", back_populates="product", uselist=False, lazy="joined")
    reviews = relationship("Review", back_populates="product", lazy="select")
    tags = relationship("Tag", secondary="product_tag", back_populates="products", lazy="select")
    cart_items = relationship("CartItem", back_populates="product", lazy="select")
    order_items = relationship("OrderItem", back_populates="product", lazy="select")
