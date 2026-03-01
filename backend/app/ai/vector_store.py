"""Vector store interface + Pinecone/Chroma implementations."""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class VectorStore(ABC):
    @abstractmethod
    def add(self, ids: List[str], embeddings: List[List[float]], metadatas: Optional[List[Dict[str, Any]]] = None) -> None:
        """Upsert vectors with optional metadata."""
        ...

    @abstractmethod
    def search(self, query_embedding: List[float], top_k: int = 10, filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Return top_k nearest items; each item has id, score, metadata."""
        ...


class StubVectorStore(VectorStore):
    """In-memory stub for development without Pinecone/Chroma."""

    def __init__(self) -> None:
        self._store: List[Dict[str, Any]] = []

    def add(self, ids: List[str], embeddings: List[List[float]], metadatas: Optional[List[Dict[str, Any]]] = None) -> None:
        for i, eid in enumerate(ids):
            meta = (metadatas or [{}])[i] if metadatas else {}
            self._store.append({"id": eid, "embedding": embeddings[i], "metadata": meta})

    def search(self, query_embedding: List[float], top_k: int = 10, filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        return [{"id": s["id"], "score": 0.0, "metadata": s["metadata"]} for s in self._store[:top_k]]
