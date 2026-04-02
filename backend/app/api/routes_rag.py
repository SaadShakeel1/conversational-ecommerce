"""RAG operational endpoints (status/health)."""

from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("/status", response_model=dict)
def rag_status():
    """
    Lightweight RAG readiness check.

    - Does not require LLM key (we just report config + vector count if reachable).
    """
    out = {
        "pinecone_configured": bool(settings.vector_db_api_key and settings.pinecone_index_name and settings.pinecone_host),
        "llm_configured": bool(settings.llm_api_key),
        "vector_count": None,
        "error": None,
    }

    if not out["pinecone_configured"]:
        return out

    try:
        from app.ai.vector_store import get_vector_store

        vs = get_vector_store()
        stats = vs.describe_stats() or {}
        out["vector_count"] = int(stats.get("total_vector_count") or 0)
        return out
    except Exception as e:
        out["error"] = str(e)
        return out

