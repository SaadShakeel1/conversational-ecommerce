from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class OrderTrackOut(BaseModel):
    order_id: int
    order_status: str
    created_at: Optional[datetime] = None
    total: Optional[Decimal] = None


class PromoValidateOut(BaseModel):
    valid: bool
    discount_percent: Optional[float] = None
    message: str
