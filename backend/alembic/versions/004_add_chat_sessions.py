"""Add chat_sessions table.

Revision ID: 004
Revises: 003
Create Date: 2026-04-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_sessions",
        sa.Column("session_id", sa.String(length=128), nullable=False),
        sa.Column("cart_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"]),
        sa.PrimaryKeyConstraint("session_id"),
    )
    op.create_index(op.f("ix_chat_sessions_cart_id"), "chat_sessions", ["cart_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_chat_sessions_cart_id"), table_name="chat_sessions")
    op.drop_table("chat_sessions")

