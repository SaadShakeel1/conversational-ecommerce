"""Orders and promo codes."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.order import OrderTrackOut, PromoValidateOut
from app.services import order_service, promo_service

router = APIRouter()


@router.get("/track", response_model=OrderTrackOut)
def order_track(order_id: int = Query(..., alias="orderId"), db: Session = Depends(get_db)):
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
):
    """
    Create an order from the cart and clear the cart.

    If `cart_id` is not provided, uses (or creates) the user's cart via `user_id`.
    """
    if cart_id is None and user_id is None:
        raise HTTPException(status_code=400, detail="Provide either cart_id or user_id")

    try:
        result = order_service.create_order_from_cart(
            db,
            cart_id=cart_id,
            user_id=user_id,
            promo_code=promo_code,
        )
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) from e

    return OrderTrackOut(**result)
