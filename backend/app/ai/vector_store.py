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


class ChromaVectorStore(VectorStore):
    """Vector store backed by entirely local ChromaDB."""

    def __init__(self, persist_dir: str) -> None:
        self.persist_dir = persist_dir
        self._collection = None

    def _get_collection(self):
        if self._collection is None:
            import chromadb
            # Use persistent client so we don't lose data
            client = chromadb.PersistentClient(path=self.persist_dir)
            self._collection = client.get_or_create_collection(
                name="ecommerce_vectors",
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    def add(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        if len(ids) != len(embeddings):
            raise ValueError("ids and embeddings must have the same length")
            
        metadatas = metadatas or [{} for _ in ids]
        
        self._get_collection().upsert(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
        }
        if filter_dict:
            kwargs["where"] = filter_dict
            
        res = self._get_collection().query(**kwargs)
        
        results = []
        if res and res.get("ids") and res["ids"][0]:
            ids = res["ids"][0]
            scores = res["distances"][0] if res.get("distances") else [0.0]*len(ids)
            metas = res["metadatas"][0] if res.get("metadatas") else [{}]*len(ids)
            
            for i in range(len(ids)):
                results.append({
                    "id": ids[i],
                    "score": 1.0 - scores[i],  # convert distance to score roughly
                    "metadata": metas[i] or {}
                })
        return results

    def describe_stats(self) -> Dict[str, Any]:
        count = self._get_collection().count()
        return {"total_vector_count": count}


def get_vector_store() -> VectorStore:
    """Factory using configured settings for Chroma DB."""
    return ChromaVectorStore(persist_dir=settings.chroma_persist_dir)
