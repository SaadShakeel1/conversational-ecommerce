"""Product model with JSONB specs."""
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

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
    specs = Column(JSONB)  # materials, dimensions, etc.
    model_tag = Column(String(128))  # for compatibility e.g. phone model
