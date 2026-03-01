"""Embedding generator for product/FAQ vectors."""
from abc import ABC, abstractmethod
from typing import List


class EmbeddingsClient(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts; return list of vectors."""
        ...

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        ...


class StubEmbeddingsClient(EmbeddingsClient):
    """Stub when no embedding API is configured."""

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [[0.0] * 384 for _ in texts]

    def embed_query(self, text: str) -> List[float]:
        return [0.0] * 384
