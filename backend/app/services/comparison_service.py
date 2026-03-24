"""Product comparison service."""
from __future__ import annotations

from typing import List, Sequence

from sqlalchemy.orm import Session, joinedload

from app.models.product import Product


def compare_products(db: Session, product_ids: List[int]) -> Sequence[Product]:
    """Fetch multiple products by IDs for side-by-side comparison."""
    return (
        db.query(Product)
        .options(joinedload(Product.inventory), joinedload(Product.tags))
        .filter(Product.id.in_(product_ids))
        .all()
    )
