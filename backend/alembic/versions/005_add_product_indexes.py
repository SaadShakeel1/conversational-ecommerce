"""Add product search indexes.

Revision ID: 005
Revises: 004
Create Date: 2026-04-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # B-tree indexes for common filters/sorts
    op.create_index("ix_products_price", "products", ["price"], unique=False)
    op.create_index("ix_products_category", "products", ["category"], unique=False)
    op.create_index("ix_products_color", "products", ["color"], unique=False)
    op.create_index("ix_products_size", "products", ["size"], unique=False)

    # JSONB GIN index for specs key/value filtering
    op.create_index(
        "ix_products_specs_gin",
        "products",
        ["specs"],
        unique=False,
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_products_specs_gin", table_name="products")
    op.drop_index("ix_products_size", table_name="products")
    op.drop_index("ix_products_color", table_name="products")
    op.drop_index("ix_products_category", table_name="products")
    op.drop_index("ix_products_price", table_name="products")

