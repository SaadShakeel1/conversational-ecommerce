"""LLM provider abstraction - swap OpenAI/other without touching core logic."""
from abc import ABC, abstractmethod
from typing import AsyncIterator

from app.config import settings


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


class GroqLLMClient(LLMClient):
    """Groq chat model via LangChain."""

    def __init__(self) -> None:
        self._llm = None

    def _get_llm(self):
        if self._llm is None:
            import os
            from langchain_groq import ChatGroq

            self._llm = ChatGroq(
                groq_api_key=os.environ.get("GROQ_API_KEY"),
                model_name="llama3-70b-8192"
            )
        return self._llm

    async def complete(self, prompt: str, **kwargs) -> str:
        resp = await self._get_llm().ainvoke(prompt)
        return getattr(resp, "content", str(resp))

    async def stream(self, prompt: str, **kwargs) -> AsyncIterator[str]:
        async for chunk in self._get_llm().astream(prompt):
            content = getattr(chunk, "content", None)
            if content:
                yield content


def get_llm_client() -> LLMClient:
    import os
    if not os.environ.get("GROQ_API_KEY"):
        return StubLLMClient()
    return GroqLLMClient()
