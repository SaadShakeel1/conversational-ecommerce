"""Compatibility check service (e.g. phone + case share same model_tag)."""
from __future__ import annotations

from typing import Dict

from sqlalchemy.orm import Session

from app.models.product import Product


def check_compatibility(db: Session, product_id_a: int, product_id_b: int) -> Dict:
    """Check if two products are compatible by comparing model_tag."""
    a = db.query(Product).filter(Product.id == product_id_a).first()
    b = db.query(Product).filter(Product.id == product_id_b).first()

    if not a or not b:
        return {"compatible": False, "reason": "One or both products not found."}

    if not a.model_tag or not b.model_tag:
        return {"compatible": False, "reason": "Compatibility info not available for these products."}

    compatible = a.model_tag.lower() == b.model_tag.lower()
    return {
        "compatible": compatible,
        "product_a": {"id": a.id, "name": a.name, "model_tag": a.model_tag},
        "product_b": {"id": b.id, "name": b.name, "model_tag": b.model_tag},
        "reason": "Same model tag — compatible!" if compatible else f"Different model tags: {a.model_tag} vs {b.model_tag}.",
    }
