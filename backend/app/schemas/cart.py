from pydantic import BaseModel
from typing import List
from decimal import Decimal


class CartItemOut(BaseModel):
    product_id: int
    quantity: int
    price: Decimal


class CartSummaryOut(BaseModel):
    items: List[CartItemOut]
    text_summary: str
