"""Order status lookup service."""
from __future__ import annotations

from typing import Optional, Dict

from sqlalchemy.orm import Session

from app.models.order import Order


def get_order_status(db: Session, order_id: int) -> Optional[Dict]:
    """Look up an order by ID and return tracking info."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    return {
        "order_id": order.id,
        "order_status": order.order_status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "total": float(order.total) if order.total else None,
    }
