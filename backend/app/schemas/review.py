from pydantic import BaseModel, Field, field_validator
from decimal import Decimal


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5")
    text: str | None = Field(None, max_length=2000, description="Optional review text")

    @field_validator("rating")
    @classmethod
    def rating_must_be_valid(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_id: int | None = None
    rating: Decimal
    text: str | None = None

    class Config:
        from_attributes = True
