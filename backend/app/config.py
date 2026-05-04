"""App settings using Pydantic."""
from pathlib import Path

from pydantic_settings import BaseSettings

# Resolve .env paths: prefer backend/.env, fall back to project root .env.
# This ensures the app works regardless of which directory uvicorn/alembic is
# launched from.
_this_file = Path(__file__).resolve()          # backend/app/config.py
_backend_dir = _this_file.parents[1]           # backend/
_project_root = _this_file.parents[2]          # project root/

_backend_env = _backend_dir / ".env"
_root_env = _project_root / ".env"

# Build the ordered list of env files that actually exist
_env_files = [str(p) for p in [_backend_env, _root_env] if p.exists()]


class Settings(BaseSettings):
    # Required from environment (.env or process env)
    database_url: str
    groq_api_key: str = ""
    llm_api_key: str = ""
    vector_db_api_key: str = ""

    # Chroma Vector DB configuration
    chroma_persist_dir: str = "./chroma_db"

    # Pinecone vector DB configuration (optional for local/chroma mode)
    pinecone_index_name: str = ""
    pinecone_host: str = ""
    pinecone_namespace: str = "default"

    # Embeddings configuration (must match Pinecone index dimension)
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # JWT auth settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    # LLM configuration (used for grounded RAG responses)
    llm_model: str = "llama-3.3-70b-versatile"
    llm_temperature: float = 0.0

    # Basic API hardening
    chat_max_message_length: int = 2000
    cors_allow_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_prefix = ""
        extra = "ignore"
        # Load backend/.env first (if it exists), then fall back to root .env.
        # Values in the first file take precedence.
        env_file = _env_files if _env_files else None
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore[arg-type]
