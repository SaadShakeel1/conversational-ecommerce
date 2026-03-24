"""Cart CRUD and feature summary service."""
from __future__ import annotations

from typing import Dict, List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product


def get_or_create_cart(db: Session, user_id: Optional[int] = None) -> Cart:
    """Find existing cart for user or create a new one."""
    if user_id:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if cart:
            return cart
    cart = Cart(user_id=user_id)
    db.add(cart)
    db.commit()
    db.refresh(cart)
    return cart


def add_item(db: Session, cart_id: int, product_id: int, quantity: int = 1) -> CartItem:
    """Add item to cart, or increase quantity if already there."""
    existing = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        .first()
    )
    if existing:
        existing.quantity += quantity
        db.commit()
        db.refresh(existing)
        return existing

    item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_item(db: Session, cart_id: int, product_id: int) -> bool:
    """Remove item from cart. Returns True if item was found and removed."""
    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def get_cart_summary(db: Session, cart_id: int) -> Dict:
    """Return cart items with product details and a text summary."""
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart_id)
        .first()
    )
    if not cart or not cart.items:
        return {"items": [], "text_summary": "Your cart is empty."}

    items_out: List[Dict] = []
    lines: List[str] = []
    total = 0
    for ci in cart.items:
        price = float(ci.product.price) if ci.product else 0
        subtotal = price * ci.quantity
        total += subtotal
        items_out.append({
            "product_id": ci.product_id,
            "quantity": ci.quantity,
            "price": price,
        })
        name = ci.product.name if ci.product else f"Product #{ci.product_id}"
        lines.append(f"  • {name} × {ci.quantity} — ${subtotal:.2f}")

    summary = f"Cart ({len(cart.items)} item{'s' if len(cart.items) != 1 else ''}):\n"
    summary += "\n".join(lines)
    summary += f"\n  Total: ${total:.2f}"

    return {"items": items_out, "text_summary": summary}
