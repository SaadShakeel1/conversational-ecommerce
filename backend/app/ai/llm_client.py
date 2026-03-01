"""LLM provider abstraction - swap OpenAI/other without touching core logic."""
from abc import ABC, abstractmethod
from typing import AsyncIterator


class LLMClient(ABC):
    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> str:
        """Return a single completion for the given prompt."""
        ...

    @abstractmethod
    async def stream(self, prompt: str, **kwargs) -> AsyncIterator[str]:
        """Stream completion chunks."""
        ...


class StubLLMClient(LLMClient):
    """Stub for when no API key is configured."""

    async def complete(self, prompt: str, **kwargs) -> str:
        return "Configure LLM_API_KEY to enable responses."

    async def stream(self, prompt: str, **kwargs) -> AsyncIterator[str]:
        yield await self.complete(prompt, **kwargs)
