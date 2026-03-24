"""FAQ retrieval."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.faq import FAQOut
from app.services import faq_service

router = APIRouter()


@router.get("/search", response_model=list[FAQOut])
def faq_search(q: str = Query(...), db: Session = Depends(get_db)):
    faqs = faq_service.search_faqs(db, query=q)
    return faqs
