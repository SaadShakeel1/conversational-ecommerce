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


class OpenAILLMClient(LLMClient):
    """OpenAI chat model via LangChain."""

    def __init__(self, *, api_key: str, model: str, temperature: float) -> None:
        self._api_key = api_key
        self._model = model
        self._temperature = temperature
        self._llm = None

    def _get_llm(self):
        if self._llm is None:
            from langchain_openai import ChatOpenAI

            self._llm = ChatOpenAI(
                api_key=self._api_key,
                model=self._model,
                temperature=self._temperature,
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
    if not settings.llm_api_key:
        return StubLLMClient()
    return OpenAILLMClient(
        api_key=settings.llm_api_key,
        model=settings.llm_model,
        temperature=settings.llm_temperature,
    )
