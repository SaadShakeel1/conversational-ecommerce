from pydantic import BaseModel
from typing import Optional


class FAQOut(BaseModel):
    id: int
    question: Optional[str] = None
    answer: Optional[str] = None

    class Config:
        from_attributes = True


class FAQSearchQuery(BaseModel):
    q: str
