"""Orders and promo codes."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.api.routes_auth import get_current_user
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderTrackOut, PromoValidateOut
from app.services import order_service, promo_service

router = APIRouter()


@router.get("/track", response_model=OrderTrackOut)
def order_track(
    order_id: int = Query(..., alias="orderId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure callers can only view their own orders.
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id is None or int(order.user_id) != int(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = order_service.get_order_status(db, order_id)
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderTrackOut(**result)


@router.get("/promo/validate", response_model=PromoValidateOut)
def promo_validate(code: str = Query(...), db: Session = Depends(get_db)):
    result = promo_service.validate_promo(db, code)
    return PromoValidateOut(**result)


@router.post("/checkout", response_model=OrderTrackOut)
def order_checkout(
    cart_id: int | None = Query(None),
    user_id: int | None = Query(None),
    promo_code: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create an order from the cart and clear the cart.

    If `cart_id` is not provided, uses (or creates) the user's cart via `user_id`.
    """
    if user_id is not None and int(user_id) != int(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    # If cart_id isn't provided, default to the authenticated user's cart.
    effective_user_id = int(current_user.id) if cart_id is None else (int(user_id) if user_id is not None else None)

    try:
        result = order_service.create_order_from_cart(
            db,
            cart_id=cart_id,
            user_id=effective_user_id,
            promo_code=promo_code,
        )
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) from e

    return OrderTrackOut(**result)
