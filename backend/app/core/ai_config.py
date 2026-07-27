import os
from pydantic_settings import BaseSettings

class AISettings(BaseSettings):
    # Provider selection: "ollama", "openai", "azure"
    AI_PRIMARY_PROVIDER: str = os.getenv("AI_PRIMARY_PROVIDER", "ollama")
    AI_FALLBACK_PROVIDER: str | None = os.getenv("AI_FALLBACK_PROVIDER", "openai")

    # Ollama settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")

    # OpenAI settings
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Azure OpenAI settings (Future-ready)
    AZURE_OPENAI_API_KEY: str | None = os.getenv("AZURE_OPENAI_API_KEY", None)
    AZURE_OPENAI_ENDPOINT: str | None = os.getenv("AZURE_OPENAI_ENDPOINT", None)
    AZURE_OPENAI_DEPLOYMENT_NAME: str | None = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", None)
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    model_config = {"env_file": ".env", "extra": "ignore"}

ai_settings = AISettings()
