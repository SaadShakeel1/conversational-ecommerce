"""App settings from environment."""
import os


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/conversational_ecommerce")
    vector_db_api_key: str = os.getenv("VECTOR_DB_API_KEY", "")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")


settings = Settings()
