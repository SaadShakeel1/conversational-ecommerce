"""Tag model (e.g. professional, waterproof)."""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False)

    # Relationships
    products = relationship("Product", secondary="product_tag", back_populates="tags", lazy="select")
