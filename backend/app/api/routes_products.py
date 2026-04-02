"""Product listing, details, comparison."""
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Any, Optional, List
from decimal import Decimal

from app.core.rate_limiter import limiter
from app.db.session import get_db
from app.schemas.product import ProductOut
from app.services import search_service, comparison_service
from app.services import related_service
from app.services import bundling_service

router = APIRouter()


@router.get("/search", response_model=list[ProductOut])
@limiter.limit("60/minute")
def product_search(
    request: Request,
    q: str | None = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    color: Optional[str] = Query(None),
    size: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    spec_key: Optional[str] = Query(None, description="JSONB specs key to filter by"),
    spec_value: Optional[str] = Query(None, description="JSONB specs value substring (requires spec_key)"),
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
        spec_key=spec_key,
        spec_value=spec_value,
        tags=tag_list,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )
    return products


@router.get("/compare", response_model=dict[str, list[ProductOut]])
def product_compare(
    ids: str = Query(..., description="Comma-separated product ids"),
    db: Session = Depends(get_db),
):
    id_list = [int(i.strip()) for i in ids.split(",") if i.strip()]
    products = comparison_service.compare_products(db, id_list)
    return {"products": list(products)}


@router.get("/{product_id}", response_model=ProductOut | None)
def product_detail(product_id: int, db: Session = Depends(get_db)):
    product = search_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}/specs", response_model=dict[str, Any])
def product_specs(
    product_id: int,
    keys: Optional[str] = Query(None, description="Comma-separated spec keys to extract"),
    db: Session = Depends(get_db),
):
    product = search_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    specs = getattr(product, "specs", None) or {}
    if not isinstance(specs, dict):
        return {"specs": {}}

    if not keys:
        return {"specs": specs}

    wanted = [k.strip() for k in keys.split(",") if k.strip()]
    extracted = {k: specs.get(k) for k in wanted}
    return {"specs": extracted}


@router.get("/{product_id}/related", response_model=list[ProductOut])
@limiter.limit("60/minute")
def product_related(
    request: Request,
    product_id: int,
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    products = related_service.get_related_products(db, product_id, limit=limit)
    return list(products)


@router.get("/{product_id}/bundle", response_model=list[ProductOut])
@limiter.limit("60/minute")
def product_bundle(
    request: Request,
    product_id: int,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    products = bundling_service.suggest_bundle(db, product_id, limit=limit)
    return list(products)
