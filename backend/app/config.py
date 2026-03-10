"""App settings using Pydantic and environment variables only."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # All of these are expected to come from real env vars / .env.
    # No production secrets are hard-coded in this file.
    database_url: str
    vector_db_api_key: str | None = None
    llm_api_key: str | None = None

    # JWT auth settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    class Config:
        env_prefix = ""
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()  # type: ignore[arg-type]
