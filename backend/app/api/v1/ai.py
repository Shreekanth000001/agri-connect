import logging
from typing import Any
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.ai_config import ai_settings
from app.services.ai.chat_service import ai_chat_service
from app.services.ai.providers import get_llm_provider, get_resilient_llm

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User chat query")
    thread_id: str | None = Field(default=None, description="Optional thread/session ID for conversation memory")
    stream: bool = Field(default=False, description="Set true for Server-Sent Events (SSE) streaming")
    system_prompt: str | None = Field(default=None, description="Optional custom system prompt override")

class AIChatResponse(BaseModel):
    thread_id: str
    response: str
    message: str

@router.post("/chat", response_model=AIChatResponse)
async def chat(req: AIChatRequest):
    """
    AI Chat Endpoint supporting both standard JSON responses and SSE streaming.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if req.stream:
        return StreamingResponse(
            ai_chat_service.stream_chat(
                message=req.message.strip(),
                thread_id=req.thread_id,
                system_prompt=req.system_prompt
            ),
            media_type="text/event-stream"
        )
    else:
        res = await ai_chat_service.invoke_chat(
            message=req.message.strip(),
            thread_id=req.thread_id,
            system_prompt=req.system_prompt
        )
        return res

@router.get("/providers")
async def get_providers():
    """
    Returns configured primary and fallback AI provider information.
    """
    return {
        "primary_provider": ai_settings.AI_PRIMARY_PROVIDER,
        "fallback_provider": ai_settings.AI_FALLBACK_PROVIDER,
        "config": {
            "ollama_base_url": ai_settings.OLLAMA_BASE_URL,
            "ollama_model": ai_settings.OLLAMA_MODEL,
            "openai_model": ai_settings.OPENAI_MODEL,
            "openai_configured": bool(ai_settings.OPENAI_API_KEY),
            "azure_configured": bool(ai_settings.AZURE_OPENAI_API_KEY and ai_settings.AZURE_OPENAI_ENDPOINT),
        }
    }

@router.get("/health")
async def ai_health():
    """
    Health check endpoint verifying the status of configured primary and fallback LLM providers.
    """
    primary_name = ai_settings.AI_PRIMARY_PROVIDER
    fallback_name = ai_settings.AI_FALLBACK_PROVIDER

    health_status: dict[str, Any] = {
        "status": "healthy",
        "primary": {
            "provider": primary_name,
            "reachable": False,
            "error": None
        },
        "fallback": None
    }

    # Test Primary Provider
    try:
        primary_llm = get_llm_provider(primary_name)
        # Attempt minimal invocation test
        await primary_llm.ainvoke("ping")
        health_status["primary"]["reachable"] = True
    except Exception as e:
        logger.warning(f"Health check failed for primary provider '{primary_name}': {e}")
        health_status["primary"]["error"] = str(e)
        health_status["status"] = "degraded"

    # Test Fallback Provider (if configured)
    if fallback_name:
        health_status["fallback"] = {
            "provider": fallback_name,
            "reachable": False,
            "error": None
        }
        try:
            fallback_llm = get_llm_provider(fallback_name)
            await fallback_llm.ainvoke("ping")
            health_status["fallback"]["reachable"] = True
        except Exception as e:
            logger.warning(f"Health check failed for fallback provider '{fallback_name}': {e}")
            health_status["fallback"]["error"] = str(e)
            if not health_status["primary"]["reachable"]:
                health_status["status"] = "unhealthy"

    return health_status
