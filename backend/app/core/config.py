from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agri Connect V2 Backend"
    VERSION: str = "0.1.0"
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/agriconnect"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def assemble_db_connection(cls, v: str | None) -> str:
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v or ""

settings = Settings()
