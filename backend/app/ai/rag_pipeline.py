"""RAG orchestration: vector search + DB lookups + prompt building. Ground all answers in catalog."""
from __future__ import annotations
from typing import List, Dict, Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.ai.vector_store import VectorStore
    from app.ai.embeddings_client import EmbeddingsClient

# Dependencies injected by app (llm_client, vector_store, db session)
# TODO: wire to conversational_agent and routes_chat


def retrieve_context(query: str, vector_store: VectorStore, embeddings_client: EmbeddingsClient, top_k: int = 5) -> List[Dict[str, Any]]:
    """Semantic search over product/FAQ embeddings. Returns list of {id, score, metadata}."""
    q_embedding = embeddings_client.embed_query(query)
    return vector_store.search(q_embedding, top_k=top_k)


def build_grounded_prompt(query: str, context_docs: List[Dict[str, Any]], system_instruction: str = "") -> str:
    """Build prompt with retrieved context so LLM only uses catalog data (zero hallucination)."""
    ctx = "\n".join(str(d.get("metadata", d)) for d in context_docs)
    return f"{system_instruction}\n\nContext from catalog:\n{ctx}\n\nUser: {query}\nAssistant:"
