"""Product search, filtering, and lookup service."""
from __future__ import annotations

from decimal import Decimal
from typing import List, Optional, Sequence

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.tag import Tag
from app.models.review import Review
from app.models.inventory import Inventory


def search_products(
    db: Session,
    *,
    q: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
    sort_by: Optional[str] = None,  # "price_asc", "price_desc", "popularity"
    limit: int = 20,
    offset: int = 0,
) -> Sequence[Product]:
    """Dynamic product search with multiple filter types."""
    query = db.query(Product).options(joinedload(Product.inventory))

    # Text search on name + description (ILIKE for case-insensitive)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            )
        )

    # Price range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Exact match filters
    if color:
        query = query.filter(Product.color.ilike(color))
    if size:
        query = query.filter(Product.size.ilike(size))
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    # Tag filtering
    if tags:
        query = query.join(Product.tags).filter(Tag.name.in_(tags))

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "popularity":
        # Order by average review rating descending
        query = (
            query.outerjoin(Review, Review.product_id == Product.id)
            .group_by(Product.id)
            .order_by(func.coalesce(func.avg(Review.rating), 0).desc())
        )
    else:
        query = query.order_by(Product.id)

    return query.offset(offset).limit(limit).all()


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    """Fetch a single product with inventory and tags."""
    return (
        db.query(Product)
        .options(joinedload(Product.inventory), joinedload(Product.tags))
        .filter(Product.id == product_id)
        .first()
    )
