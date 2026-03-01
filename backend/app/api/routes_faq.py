"""FAQ retrieval."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.faq import FAQOut

router = APIRouter()


@router.get("/search", response_model=list[FAQOut])
def faq_search(q: str = Query(...), db: Session = Depends(get_db)):
    # TODO: faq_service text retrieval
    return []
