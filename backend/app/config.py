"""App settings using Pydantic."""
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Neon Postgres connection string (can be overridden via env var)
    database_url: str = (
        "postgresql://neondb_owner:npg_Grg2UqDMkR9a@ep-calm-voice-ae8c990k-pooler.c-2.us-east-2.aws.neon.tech/"
        "neondb?sslmode=require&channel_binding=require"
    )
    llm_api_key: str = ""
    groq_api_key: str = ""
    
    # Chroma Vector DB configuration
    chroma_persist_dir: str = "./chroma_db"

    # Embeddings configuration (must match Pinecone index dimension)
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # JWT auth settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    # LLM configuration (used for grounded RAG responses)
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.0

    # Basic API hardening
    chat_max_message_length: int = 2000
    cors_allow_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_prefix = ""
        # Make env loading deterministic regardless of where uvicorn/alembic is launched from.
        # This resolves to: backend/.env (since this file lives in backend/app/).
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore[arg-type]
