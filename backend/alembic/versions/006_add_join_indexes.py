"""Add join/performance indexes.

Revision ID: 006
Revises: 005
Create Date: 2026-04-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # product_tag lookups by tag_id/product_id
    op.create_index("ix_product_tag_tag_id", "product_tag", ["tag_id"], unique=False)
    op.create_index("ix_product_tag_product_id", "product_tag", ["product_id"], unique=False)

    # cart_items lookups by cart_id/product_id
    op.create_index("ix_cart_items_cart_id", "cart_items", ["cart_id"], unique=False)
    op.create_index("ix_cart_items_product_id", "cart_items", ["product_id"], unique=False)

    # order_items lookups by order_id/product_id
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"], unique=False)
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"], unique=False)

    # reviews lookups by product_id (avg rating, etc.)
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"], unique=False)

    # inventory lookups by product_id (stock checks)
    op.create_index("ix_inventory_product_id", "inventory", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_inventory_product_id", table_name="inventory")
    op.drop_index("ix_reviews_product_id", table_name="reviews")
    op.drop_index("ix_order_items_product_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_index("ix_cart_items_product_id", table_name="cart_items")
    op.drop_index("ix_cart_items_cart_id", table_name="cart_items")
    op.drop_index("ix_product_tag_product_id", table_name="product_tag")
    op.drop_index("ix_product_tag_tag_id", table_name="product_tag")

