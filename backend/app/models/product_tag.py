"""Product–Tag association."""
from sqlalchemy import Column, Integer, ForeignKey, Table

from app.db.base import Base

product_tag = Table(
    "product_tag",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)
