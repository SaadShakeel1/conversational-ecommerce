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
