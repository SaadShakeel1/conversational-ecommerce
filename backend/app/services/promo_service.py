"""Promo code validation service."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict

from sqlalchemy.orm import Session

from app.models.promo_code import PromoCode


def validate_promo(db: Session, code: str) -> Dict:
    """Validate a promo code and return discount info."""
    promo = db.query(PromoCode).filter(PromoCode.code == code.upper()).first()

    if not promo:
        return {"valid": False, "message": "Promo code not found."}

    if not promo.is_active:
        return {"valid": False, "message": "This promo code is no longer active."}

    if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
        return {"valid": False, "message": "This promo code has expired."}

    return {
        "valid": True,
        "discount_percent": promo.discount_percent,
        "message": f"Success! {promo.discount_percent:.0f}% discount applied.",
    }
