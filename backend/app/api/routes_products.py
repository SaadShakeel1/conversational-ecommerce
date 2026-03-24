"""Product listing, details, comparison."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal

from app.db.session import get_db
from app.schemas.product import ProductOut
from app.services import search_service, comparison_service

router = APIRouter()


@router.get("/search", response_model=list[ProductOut])
def product_search(
    q: str | None = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    color: Optional[str] = Query(None),
    size: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None, description="Comma-separated tag names"),
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, popularity"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    products = search_service.search_products(
        db,
        q=q,
        min_price=min_price,
        max_price=max_price,
        color=color,
        size=size,
        category=category,
        tags=tag_list,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )
    return products


@router.get("/compare", response_model=list[ProductOut])
def product_compare(
    ids: str = Query(..., description="Comma-separated product ids"),
    db: Session = Depends(get_db),
):
    id_list = [int(i.strip()) for i in ids.split(",") if i.strip()]
    products = comparison_service.compare_products(db, id_list)
    return products


@router.get("/{product_id}", response_model=ProductOut | None)
def product_detail(product_id: int, db: Session = Depends(get_db)):
    product = search_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
