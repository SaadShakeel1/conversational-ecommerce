"""Multi-turn chat API (thin wrapper around conversational agent)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.conversational_agent import handle_chat
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat_post(body: ChatRequest, db: Session = Depends(get_db)):
    return await handle_chat(body, db)
