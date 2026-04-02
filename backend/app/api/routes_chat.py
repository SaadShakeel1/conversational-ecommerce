"""Multi-turn chat API (thin wrapper around conversational agent)."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.ai.conversational_agent import handle_chat
from app.config import settings
from app.core.rate_limiter import limiter
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_post(request: Request, body: ChatRequest, db: Session = Depends(get_db)):
    msg = (body.message or "").strip()
    if len(msg) > int(settings.chat_max_message_length or 0):
        raise HTTPException(status_code=413, detail="Message too large")
    return await handle_chat(body, db)
