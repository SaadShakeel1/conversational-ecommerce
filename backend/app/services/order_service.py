"""Order status lookup service."""
from __future__ import annotations

from decimal import Decimal
from typing import Optional, Dict

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.inventory import Inventory
from app.services import cart_service, promo_service


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


def create_order_from_cart(
    db: Session,
    *,
    cart_id: Optional[int] = None,
    user_id: Optional[int] = None,
    promo_code: Optional[str] = None,
) -> Dict:
    """
    Create an order from cart items and clear the cart.

    Returns the same dict shape as `get_order_status` for compatibility with existing schemas.
    """
    if cart_id is None:
        if user_id is None:
            raise ValueError("Either cart_id or user_id must be provided")
        cart = cart_service.get_or_create_cart(db, user_id=user_id)
        cart_id = cart.id

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart_id)
        .first()
    )
    if not cart or not cart.items:
        raise ValueError("Cart is empty")

    # ----------------------------
    # Stock validation + compute
    # ----------------------------
    product_ids = [ci.product_id for ci in cart.items]
    inventories = (
        db.query(Inventory)
        .filter(Inventory.product_id.in_(product_ids))
        .all()
    )
    inv_by_pid = {inv.product_id: inv for inv in inventories}
    if len(inv_by_pid) != len(set(product_ids)):
        # If we can't find inventory rows for some products, fail closed.
        missing = sorted(set(product_ids) - set(inv_by_pid.keys()))
        raise ValueError(f"Missing inventory for product ids: {missing}")

    order_total = Decimal("0.00")
    items_to_add: list[tuple[CartItem, Decimal]] = []

    for ci in cart.items:
        inv = inv_by_pid.get(ci.product_id)
        if inv is None:
            raise ValueError(f"Missing inventory for product id {ci.product_id}")

        requested_qty = int(ci.quantity or 0)
        available_qty = int(inv.quantity or 0)
        if requested_qty <= 0:
            # Ignore empty/invalid cart lines.
            continue
        if requested_qty > available_qty:
            raise ValueError(
                f"Insufficient stock for product id {ci.product_id}. "
                f"Requested {requested_qty}, available {available_qty}."
            )

        # Price comes from product price (not inventory).
        if ci.product and ci.product.price is not None:
            unit_price = Decimal(str(ci.product.price))
        else:
            unit_price = Decimal("0.00")
        line_total = unit_price * Decimal(requested_qty)
        order_total += line_total
        items_to_add.append((ci, unit_price))

    if not items_to_add:
        raise ValueError("Cart has no valid items to order")

    # Apply optional promo discount to total only (not per-item price).
    if promo_code:
        promo_result = promo_service.validate_promo(db, promo_code)
        if promo_result.get("valid") and promo_result.get("discount_percent") is not None:
            discount_percent = Decimal(str(promo_result["discount_percent"]))
            discount_amount = (order_total * discount_percent) / Decimal("100")
            order_total = max(order_total - discount_amount, Decimal("0.00"))

    order = Order(user_id=cart.user_id, order_status="confirmed", total=order_total)
    db.add(order)
    db.flush()  # ensure order.id exists before creating items

    for ci, unit_price in items_to_add:
        oi_qty = int(ci.quantity or 0)
        oi = OrderItem(order_id=order.id, product_id=ci.product_id, quantity=oi_qty, price=unit_price)
        db.add(oi)

        # Decrement inventory after creating the order line.
        inv = inv_by_pid.get(ci.product_id)
        if inv is None:
            raise ValueError(f"Missing inventory for product id {ci.product_id}")
        inv.quantity = int(inv.quantity or 0) - oi_qty

    db.commit()

    # Clear cart items after order creation.
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete(synchronize_session=False)
    db.commit()

    # Refresh so server_default timestamps are available.
    db.refresh(order)

    return {
        "order_id": order.id,
        "order_status": order.order_status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "total": float(order.total) if order.total is not None else None,
    }
