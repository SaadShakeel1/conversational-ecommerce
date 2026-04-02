"""Vector store interface + Pinecone/Chroma implementations."""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

from app.config import settings


class VectorStore(ABC):
    @abstractmethod
    def add(self, ids: List[str], embeddings: List[List[float]], metadatas: Optional[List[Dict[str, Any]]] = None) -> None:
        """Upsert vectors with optional metadata."""
        ...

    @abstractmethod
    def search(self, query_embedding: List[float], top_k: int = 10, filter_dict: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Return top_k nearest items; each item has id, score, metadata."""
        ...

    @abstractmethod
    def describe_stats(self) -> Dict[str, Any]:
        """Return backend-specific stats including total vector count."""
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

    def describe_stats(self) -> Dict[str, Any]:
        return {"total_vector_count": len(self._store)}


class PineconeVectorStore(VectorStore):
    """Vector store backed by Pinecone."""

    def __init__(
        self,
        *,
        api_key: str,
        index_name: str,
        host: str,
        namespace: str = "default",
    ) -> None:
        self._api_key = api_key
        self._index_name = index_name
        self._host = host
        self._namespace = namespace
        self._pc = None
        self._index = None

    def _get_client(self):
        if self._pc is None:
            # Lazy import so this module remains importable if pinecone isn't installed.
            from pinecone import Pinecone

            self._pc = Pinecone(api_key=self._api_key, host=self._host)
        return self._pc

    def _get_index(self):
        if self._index is None:
            self._index = self._get_client().Index(self._index_name)
        return self._index

    def add(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        if len(ids) != len(embeddings):
            raise ValueError("ids and embeddings must have the same length")
        if metadatas is not None and len(metadatas) != len(ids):
            raise ValueError("metadatas and ids must have the same length")

        vectors = []
        for i, vid in enumerate(ids):
            meta = (metadatas or [{}])[i] if metadatas is not None else None
            # Pinecone expects: (id, vector, metadata)
            if meta is None:
                vectors.append((vid, embeddings[i]))
            else:
                vectors.append((vid, embeddings[i], meta))

        self._get_index().upsert(vectors=vectors, namespace=self._namespace)

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        kwargs: Dict[str, Any] = {
            "vector": query_embedding,
            "top_k": top_k,
            "include_metadata": True,
            "namespace": self._namespace,
        }
        if filter_dict:
            kwargs["filter"] = filter_dict

        res = self._get_index().query(**kwargs)
        matches = res.get("matches") if isinstance(res, dict) else getattr(res, "matches", [])

        results: List[Dict[str, Any]] = []
        for m in matches or []:
            results.append(
                {
                    "id": m.get("id") if isinstance(m, dict) else getattr(m, "id", None),
                    "score": m.get("score") if isinstance(m, dict) else getattr(m, "score", 0.0),
                    "metadata": m.get("metadata") if isinstance(m, dict) else getattr(m, "metadata", {}) or {},
                }
            )
        # Filter out null ids defensively
        return [r for r in results if r["id"] is not None]

    def describe_stats(self) -> Dict[str, Any]:
        # Pinecone returns a dict containing total_vector_count and index properties.
        return self._get_index().describe_index_stats()


def get_vector_store() -> VectorStore:
    """Factory using configured settings (Pinecone). Raises if misconfigured."""
    if not settings.vector_db_api_key:
        raise ValueError("VECTOR_DB_API_KEY is required for Pinecone.")
    if not settings.pinecone_index_name:
        raise ValueError("PINECONE_INDEX_NAME is required for Pinecone vector store.")
    if not settings.pinecone_host:
        raise ValueError("PINECONE_HOST is required for Pinecone vector store (host URL).")

    return PineconeVectorStore(
        api_key=settings.vector_db_api_key,
        index_name=settings.pinecone_index_name,
        host=settings.pinecone_host,
        namespace=settings.pinecone_namespace,
    )
