import logging
from typing import Any, List, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from langchain_core.outputs import ChatResult, ChatGeneration
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from langchain_ollama import ChatOllama
from app.core.ai_config import ai_settings

logger = logging.getLogger(__name__)

class ContextAwareMockLLM(BaseChatModel):
    """
    Progressive Context-Aware LLM provider for local offline testing and mock fallback.
    Reads full conversation history (thread memory) to provide progressive,
    topic-aware follow-up responses for queries like 'and?', 'how?', 'what else?'.
    """

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        full_text = " ".join([str(m.content) for m in messages]).lower()
        human_msgs = [m for m in messages if isinstance(m, HumanMessage)]
        turn_count = len(human_msgs)
        last_msg = str(messages[-1].content) if messages else ""

        # Progressive topic resolution from conversation history
        if "tomato" in full_text:
            if turn_count <= 1:
                res = (
                    "Welcome to AgriConnect AI Tomato Advice! Tomatoes require 6-8 hours of direct sunlight daily, "
                    "well-draining soil with a pH of 6.0-6.8, and consistent deep watering at the roots."
                )
            elif turn_count == 2:
                res = (
                    "Regarding tomatoes (Pruning & Fertilization): In addition to sunlight and watering, ensure regular pruning of lower suckers "
                    "every 7-10 days, apply calcium-rich organic fertilizer to prevent blossom-end rot, and space plants at least 45 cm apart."
                )
            elif turn_count == 3:
                res = (
                    "Regarding tomatoes (Pest & Disease Control): Monitor for early blight and hornworms. "
                    "Spray neem oil (5 ml/L) weekly as a natural pest repellent and apply organic straw mulching to conserve root moisture."
                )
            elif turn_count == 4:
                res = (
                    "Regarding tomatoes (Harvesting & Post-Harvest): Harvest when fruits are firm and 85-90% colored. "
                    "Store at 13-15°C with 85-90% relative humidity. Avoid refrigeration for unripened tomatoes to preserve full flavor."
                )
            else:
                res = (
                    f"Regarding tomatoes (Turn {turn_count} - Market Pricing): Check current APMC mandi tomato benchmark rates "
                    "on AgriConnect. Highlight organic grade and transport readiness to negotiate premium pricing."
                )

        elif "wheat" in full_text:
            if turn_count <= 1:
                res = (
                    "AgriConnect Wheat Insights: Sow seeds at 2-3 cm depth during early winter (November). "
                    "Ensure initial soil moisture is adequate for uniform germination."
                )
            elif turn_count == 2:
                res = (
                    "Regarding wheat (Irrigation & Fertilization): Irrigate at Crown Root Initiation (21 days post-sowing) "
                    "and apply N-P-K in a 120:60:40 kg/ha ratio."
                )
            else:
                res = (
                    f"Regarding wheat (Turn {turn_count} - Disease & Selling): Inspect leaves for yellow rust. "
                    "List your crop on AgriConnect with moisture content <12% for top buyer offers."
                )

        elif "rice" in full_text or "paddy" in full_text:
            if turn_count <= 1:
                res = (
                    "AgriConnect Rice Advice: Maintain 2-5 cm standing water during tillering, apply neem-coated urea in split doses, "
                    "and monitor for stem borer pests."
                )
            else:
                res = (
                    f"Regarding rice (Turn {turn_count}): Drain field 10 days before harvest when 80-85% of panicles turn golden yellow."
                )

        elif "price" in full_text or "market" in full_text or "negotiat" in full_text:
            res = (
                f"AgriConnect Negotiation Guide (Turn {turn_count}): Compare local APMC mandi prices on the marketplace. "
                "Specify quality parameters (grade, moisture, packaging) when submitting counter-proposals."
            )
        else:
            if turn_count <= 1:
                res = (
                    f"AgriConnect AI Assistant: Regarding '{last_msg}', we recommend checking soil moisture, "
                    "monitoring pest alerts, and consulting local market rates."
                )
            elif turn_count == 2:
                res = (
                    f"Continuing on '{last_msg}': Beyond initial steps, check soil N-P-K nutrient levels, "
                    "apply organic compost, and ensure proper field drainage."
                )
            else:
                res = (
                    f"Further details for '{last_msg}' (Turn {turn_count}): Consider crop rotation with legumes to improve soil nitrogen naturally "
                    "and check AgriConnect buyer listings for direct sales."
                )

        gen = ChatGeneration(message=AIMessage(content=res))
        return ChatResult(generations=[gen])

    @property
    def _llm_type(self) -> str:
        return "context-aware-mock"

def create_mock_llm() -> BaseChatModel:
    logger.info("Initializing Progressive ContextAwareMockLLM provider")
    return ContextAwareMockLLM()

def create_ollama_llm(base_url: str | None = None, model: str | None = None) -> BaseChatModel:
    url = base_url or ai_settings.OLLAMA_BASE_URL
    model_name = model or ai_settings.OLLAMA_MODEL
    logger.info(f"Initializing Ollama LLM model={model_name} at {url}")
    return ChatOllama(
        base_url=url,
        model=model_name,
        temperature=0.7,
    )

def create_openai_llm(api_key: str | None = None, model: str | None = None) -> BaseChatModel:
    key = api_key or ai_settings.OPENAI_API_KEY or "dummy-key-for-initialization"
    model_name = model or ai_settings.OPENAI_MODEL
    logger.info(f"Initializing OpenAI LLM model={model_name}")
    return ChatOpenAI(
        api_key=key,
        model=model_name,
        temperature=0.7,
    )

def create_azure_openai_llm(
    api_key: str | None = None,
    endpoint: str | None = None,
    deployment: str | None = None,
    api_version: str | None = None,
) -> BaseChatModel:
    key = api_key or ai_settings.AZURE_OPENAI_API_KEY or "dummy-key"
    ep = endpoint or ai_settings.AZURE_OPENAI_ENDPOINT or "https://dummy.openai.azure.com/"
    dep = deployment or ai_settings.AZURE_OPENAI_DEPLOYMENT_NAME or "gpt-4o"
    ver = api_version or ai_settings.AZURE_OPENAI_API_VERSION
    logger.info(f"Initializing Azure OpenAI LLM deployment={dep} at {ep}")
    return AzureChatOpenAI(
        api_key=key,
        azure_endpoint=ep,
        azure_deployment=dep,
        api_version=ver,
        temperature=0.7,
    )

def get_llm_provider(provider_name: str) -> BaseChatModel:
    name = (provider_name or "").lower().strip()
    if name == "ollama":
        return create_ollama_llm()
    elif name == "openai":
        return create_openai_llm()
    elif name == "azure":
        return create_azure_openai_llm()
    elif name in ("mock", "demo", "fake"):
        return create_mock_llm()
    else:
        logger.warning(f"Unknown provider '{provider_name}', defaulting to Ollama")
        return create_ollama_llm()

def get_resilient_llm() -> BaseChatModel:
    """
    Returns the primary LLM model configured via environment variables.
    Attaches fallback providers using .with_fallbacks().
    Appends ContextAwareMockLLM as final safety net for local offline testing.
    """
    primary_name = ai_settings.AI_PRIMARY_PROVIDER
    fallback_name = ai_settings.AI_FALLBACK_PROVIDER

    primary_llm = get_llm_provider(primary_name)
    fallbacks: list[BaseChatModel] = []

    if fallback_name and fallback_name.lower().strip() != primary_name.lower().strip():
        try:
            fallbacks.append(get_llm_provider(fallback_name))
        except Exception as e:
            logger.error(f"Failed to load fallback LLM '{fallback_name}': {e}")

    # Always append ContextAwareMockLLM as ultimate fallback for offline local verification
    fallbacks.append(create_mock_llm())

    logger.info(f"Configuring LLM chain: primary={primary_name} with {len(fallbacks)} fallbacks")
    return primary_llm.with_fallbacks(fallbacks)
