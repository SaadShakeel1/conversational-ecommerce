"""App settings using Pydantic."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Neon Postgres connection string (can be overridden via env var)
    database_url: str = (
        "postgresql://neondb_owner:npg_Grg2UqDMkR9a@ep-calm-voice-ae8c990k-pooler.c-2.us-east-2.aws.neon.tech/"
        "neondb?sslmode=require&channel_binding=require"
    )
    vector_db_api_key: str = ""
    llm_api_key: str = ""

    # JWT auth settings
    jwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"  # override via env in production
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    class Config:
        env_prefix = ""
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore[arg-type]
