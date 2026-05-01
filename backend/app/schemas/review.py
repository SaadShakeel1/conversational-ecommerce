from pydantic import BaseModel
from decimal import Decimal

class ReviewOut(BaseModel):
    id: int
    product_id: int
    rating: Decimal
    text: str | None = None

    class Config:
        from_attributes = True
