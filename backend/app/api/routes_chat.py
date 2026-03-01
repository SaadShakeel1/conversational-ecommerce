"""Multi-turn chat API."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat_post(body: ChatRequest, db: Session = Depends(get_db)):
    # TODO: use conversational_agent + RAG pipeline
    return ChatResponse(
        reply="Chat is connected. Configure RAG pipeline for natural language search.",
        product_ids=[],
        follow_up_prompts=[],
    )
