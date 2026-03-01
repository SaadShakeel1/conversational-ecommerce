"""Orders and promo codes."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.order import OrderTrackOut, PromoValidateOut

router = APIRouter()


@router.get("/track", response_model=OrderTrackOut | None)
def order_track(order_id: int = Query(..., alias="orderId"), db: Session = Depends(get_db)):
    # TODO: order_service lookup by id
    return None


@router.get("/promo/validate", response_model=PromoValidateOut)
def promo_validate(code: str = Query(...), db: Session = Depends(get_db)):
    # TODO: promo_service
    return PromoValidateOut(valid=False, message="Not implemented")
