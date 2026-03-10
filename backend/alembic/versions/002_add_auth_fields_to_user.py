"""Add auth fields to users table.

Revision ID: 002
Revises: 001
Create Date: 2026-03-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # In Neon, "is_active" may already exist; ensure at least "hashed_password".
    op.add_column(
        "users",
        sa.Column("hashed_password", sa.String(length=255), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("users", "is_active")
    op.drop_column("users", "hashed_password")

