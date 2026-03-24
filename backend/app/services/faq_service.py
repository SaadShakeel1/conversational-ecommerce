"""Text-based FAQ retrieval service."""
from __future__ import annotations

from typing import Sequence

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.faq import FAQ


def search_faqs(db: Session, query: str, limit: int = 10) -> Sequence[FAQ]:
    """Case-insensitive search across FAQ question and answer fields."""
    pattern = f"%{query}%"
    return (
        db.query(FAQ)
        .filter(
            or_(
                FAQ.question.ilike(pattern),
                FAQ.answer.ilike(pattern),
            )
        )
        .limit(limit)
        .all()
    )
