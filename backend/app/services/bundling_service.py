"""Feature-based product bundling service."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.tag import Tag


def suggest_bundle(db: Session, product_id: int, *, limit: int = 3) -> Sequence[Product]:
    """
    Suggest a small bundle of complementary items for a given product.

    Minimal heuristic:
    - Score by shared tags (more shared tags => higher score)
    - Prefer different category when possible (to avoid pure "similar items")
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
    base_category = getattr(base, "category", None)

    # If we have no tags, fall back to "different category" products.
    if not tag_ids:
        q = db.query(Product).options(joinedload(Product.inventory), joinedload(Product.tags)).filter(Product.id != product_id)
        if base_category:
            q = q.filter(Product.category != base_category)
        return q.limit(limit).all()

    shared_tag_count = func.count(Tag.id)
    different_category_first = case((Product.category != base_category, 1), else_=0) if base_category else case((True, 0), else_=0)

    q = (
        db.query(Product)
        .options(joinedload(Product.inventory), joinedload(Product.tags))
        .join(Product.tags)
        .filter(Product.id != product_id)
        .filter(Tag.id.in_(tag_ids))
        .group_by(Product.id)
        .order_by(different_category_first.desc(), shared_tag_count.desc(), Product.id.asc())
        .limit(limit)
    )
    return q.all()

