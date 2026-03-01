"""Product listing, details, comparison."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductOut

router = APIRouter()


@router.get("/search", response_model=list[ProductOut])
def product_search(
    q: str | None = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    # TODO: search_service + vector/RAG
    return []


@router.get("/compare")
def product_compare(
    ids: str = Query(..., description="Comma-separated product ids"),
    db: Session = Depends(get_db),
):
    # TODO: comparison_service
    return {"products": []}


@router.get("/{product_id}", response_model=ProductOut | None)
def product_detail(product_id: int, db: Session = Depends(get_db)):
    # TODO: fetch product by id
    return None
