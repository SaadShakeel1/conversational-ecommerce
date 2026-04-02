"""Related product cross-sell service."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.tag import Tag


def get_related_products(db: Session, product_id: int, *, limit: int = 6) -> Sequence[Product]:
    """
    Return a small set of related products for cross-selling.

    Heuristic:
    - Prefer same category and/or shared tags
    - Exclude the original product
    """
    base = (
        db.query(Product)
        .options(joinedload(Product.inventory), joinedload(Product.tags))
        .filter(Product.id == product_id)
        .first()
    )
    if not base:
        return []

    tag_ids = [t.id for t in (getattr(base, "tags", None) or []) if getattr(t, "id", None) is not None]
    has_category = bool(getattr(base, "category", None))

    query = db.query(Product).options(joinedload(Product.inventory), joinedload(Product.tags)).filter(Product.id != product_id)

    filters = []
    if has_category:
        filters.append(Product.category == base.category)
    if tag_ids:
        # Join tags only when we actually have tags to match.
        query = query.join(Product.tags)
        filters.append(Tag.id.in_(tag_ids))

    if filters:
        query = query.filter(or_(*filters))

    return query.distinct().limit(limit).all()

