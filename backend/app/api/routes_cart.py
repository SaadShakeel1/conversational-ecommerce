"""Cart management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.api.routes_auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.cart import CartSummaryOut, CartItemOut
from app.services import cart_service

router = APIRouter()


@router.get("/summary", response_model=CartSummaryOut)
def cart_summary(
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id is not None and int(user_id) != int(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    effective_user_id = int(current_user.id)
    cart = cart_service.get_or_create_cart(db, user_id=effective_user_id)
    result = cart_service.get_cart_summary(db, cart.id)
    return CartSummaryOut(
        items=[CartItemOut(**item) for item in result["items"]],
        text_summary=result["text_summary"],
    )


@router.post("/items")
def cart_add_item(
    product_id: int,
    quantity: int = 1,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id is not None and int(user_id) != int(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    effective_user_id = int(current_user.id)
    cart = cart_service.get_or_create_cart(db, user_id=effective_user_id)
    cart_service.add_item(db, cart.id, product_id, quantity)
    return {"ok": True}


@router.delete("/items/{product_id}")
def cart_remove_item(
    product_id: int,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id is not None and int(user_id) != int(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    effective_user_id = int(current_user.id)
    cart = cart_service.get_or_create_cart(db, user_id=effective_user_id)
    removed = cart_service.remove_item(db, cart.id, product_id)
    return {"ok": removed}
