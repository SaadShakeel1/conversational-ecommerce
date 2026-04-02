"""App settings using Pydantic."""
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Neon Postgres connection string (can be overridden via env var)
    database_url: str = (
        "postgresql://neondb_owner:npg_Grg2UqDMkR9a@ep-calm-voice-ae8c990k-pooler.c-2.us-east-2.aws.neon.tech/"
        "neondb?sslmode=require&channel_binding=require"
    )
    vector_db_api_key: str = ""
    llm_api_key: str = ""
    # Pinecone vector DB configuration
    pinecone_index_name: str = ""
    pinecone_host: str = ""  # e.g. https://<project>-<id>.svc.<region>.pinecone.io
    pinecone_namespace: str = "default"

    # Embeddings configuration (must match Pinecone index dimension)
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # JWT auth settings
    jwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"  # override via env in production
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
<<<<<<< Bilal_Work
        # This resolves to: backend/.env.
=======
        # This resolves to: backend/.env (since this file lives in backend/app/).
>>>>>>> main
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore[arg-type]
