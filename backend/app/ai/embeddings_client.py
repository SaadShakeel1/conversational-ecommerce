"""Embedding generator for product/FAQ vectors."""
from abc import ABC, abstractmethod
from typing import List

from app.config import settings


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

    # Keep this aligned with the stub shape for development.
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [[0.0] * 384 for _ in texts]

    def embed_query(self, text: str) -> List[float]:
        return [0.0] * 384


class HuggingFaceEmbeddingsClient(EmbeddingsClient):
    """HuggingFace embeddings via LangChain."""

    def __init__(self, *, model: str, expected_dimension: int) -> None:
        self._model = model
        self._expected_dimension = expected_dimension
        self._embeddings = None
        self._validated_dimension = False

    def _get_client(self):
        if self._embeddings is None:
            # Lazy import so the module can still be imported without optional deps at dev-time.
            from langchain_huggingface import HuggingFaceEmbeddings

            self._embeddings = HuggingFaceEmbeddings(
                model_name=self._model
            )
        return self._embeddings

    def _validate_dimension(self, vector: List[float]) -> None:
        if self._validated_dimension:
            return
        if len(vector) != self._expected_dimension:
            raise ValueError(
                f"Embedding dimension mismatch: expected {self._expected_dimension}, got {len(vector)}. "
                f"Check EMBEDDING_DIMENSION vs {self._model}."
            )
        self._validated_dimension = True

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self._get_client().embed_documents(texts)
        if embeddings:
            self._validate_dimension(embeddings[0])
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        vector = self._get_client().embed_query(text)
        self._validate_dimension(vector)
        return vector


def get_embeddings_client() -> EmbeddingsClient:
    """
    Factory using configured settings.
    Raises if EMBEDDINGS/Vector DB prerequisites are missing.
    """
    # We no longer need an API key for local HuggingFace embeddings
    return HuggingFaceEmbeddingsClient(
        model=settings.embedding_model,
        expected_dimension=settings.embedding_dimension,
    )
