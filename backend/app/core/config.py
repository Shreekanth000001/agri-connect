from urllib.parse import parse_qs, urlencode
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
        if isinstance(v, str):
            if v.startswith("postgresql://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            
            if "?" in v:
                base_url, query_str = v.split("?", 1)
                params = parse_qs(query_str)
                
                # Convert sslmode to ssl for asyncpg
                if "sslmode" in params:
                    sslmode = params.pop("sslmode")[0]
                    if sslmode in ("require", "verify-ca", "verify-full", "prefer", "true"):
                        params["ssl"] = ["require"]
                
                # Remove params unsupported by asyncpg
                params.pop("channel_binding", None)
                params.pop("connect_timeout", None)
                
                clean_query = urlencode(params, doseq=True)
                return f"{base_url}?{clean_query}" if clean_query else base_url

        return v or ""

settings = Settings()
