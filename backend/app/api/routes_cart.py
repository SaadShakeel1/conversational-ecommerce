"""Cart management."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.cart import CartSummaryOut, CartItemOut

router = APIRouter()


@router.get("/summary", response_model=CartSummaryOut)
def cart_summary(db: Session = Depends(get_db)):
    # TODO: cart_service feature summary
    return CartSummaryOut(items=[], text_summary="Your cart is empty.")


@router.post("/items")
def cart_add_item(product_id: int, quantity: int = 1, db: Session = Depends(get_db)):
    # TODO: cart_service add
    return {"ok": True}


@router.delete("/items/{product_id}")
def cart_remove_item(product_id: int, db: Session = Depends(get_db)):
    # TODO: cart_service remove
    return {"ok": True}
