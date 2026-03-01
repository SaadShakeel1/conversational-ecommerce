from pydantic import BaseModel
from typing import Optional, Any
from decimal import Decimal


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    color: Optional[str] = None
    size: Optional[str] = None
    category: Optional[str] = None
    specs: Optional[dict] = None
    model_tag: Optional[str] = None

    class Config:
        from_attributes = True


class ProductSearchQuery(BaseModel):
    q: Optional[str] = None
    limit: int = 20
    offset: int = 0
