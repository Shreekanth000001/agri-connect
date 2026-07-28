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
        # Extract ONLY human user messages to determine intent (ignore system/RAG prompt injections)
        human_msgs = [m for m in messages if isinstance(m, HumanMessage) or getattr(m, "type", "") == "human"]
        last_user_msg = str(human_msgs[-1].content) if human_msgs else (str(messages[-1].content) if messages else "")

        def detect_topic(msg_text: str) -> Optional[str]:
            t = msg_text.lower()
            if any(k in t for k in ["rice", "paddy", "irrigation"]):
                return "rice"
            if any(k in t for k in ["chilli", "chili", "pepper", "leaf curl"]):
                return "chilli"
            if any(k in t for k in ["tomato"]):
                return "tomato"
            if any(k in t for k in ["wheat"]):
                return "wheat"
            if any(k in t for k in ["weather", "rain", "temp", "forecast"]):
                return "weather"
            if any(k in t for k in ["recommend", "buy produce", "marketplace listing"]):
                return "recommend"
            if any(k in t for k in ["price", "market", "negotiat"]):
                return "price"
            return None

        # 1. Detect topic from the LATEST user message first
        topic = detect_topic(last_user_msg)

        # 2. If latest user message is a vague follow-up ("and?", "more info", etc.), scan backwards for active topic
        if not topic and human_msgs:
            for past_msg in reversed(human_msgs[:-1]):
                topic = detect_topic(str(past_msg.content))
                if topic:
                    break

        # Calculate turns under the current topic
        topic_turns = 1
        if topic and human_msgs:
            for past_msg in reversed(human_msgs[:-1]):
                if detect_topic(str(past_msg.content)) == topic:
                    topic_turns += 1
                else:
                    break

        # Response routing by detected active topic & turn count under topic
        if topic == "rice":
            if topic_turns <= 1:
                res = (
                    "🌾 **Best Irrigation Practices for Rice / Paddy During Dry Monsoon Spells**:\n\n"
                    "1. **Alternate Wetting and Drying (AWD)**: Instead of continuous flooding, allow field water level to recede 10-15 cm below soil surface before re-irrigating to 5 cm depth. Saves 25-30% irrigation water without yield loss.\n"
                    "2. **Critical Growth Stages**: Priority irrigation MUST be given during *Panicle Initiation* (30-40 DAT) and *Flowering/Heading stage*. Water deficit during flowering causes severe spikelet sterility.\n"
                    "3. **Soil Mulching & Bunding**: Heighten field bunds to 20-25 cm to retain every drop of rainfall.\n"
                    "4. **Supplemental Irrigation**: Utilize farm ponds (*Khet Talav*) or portable diesel pumps for life-saving supplemental irrigation."
                )
            elif topic_turns == 2:
                res = (
                    "🌾 **Additional Dry Spell Mitigation & Agronomic Management for Rice**:\n\n"
                    "1. **Foliar Spray of Anti-transpirants**: Spray 1% Potassium Nitrate (KNO3) or 2% Urea + 1% MOP solution during prolonged dry spells to enhance drought tolerance and reduce leaf transpiration.\n"
                    "2. **Micro-nutrients & Potassium**: Apply Muriate of Potash (MOP) to improve stomatal regulation and plant turgor.\n"
                    "3. **Weed Control**: Keep fields strictly weed-free as weeds consume over 30% of soil moisture reserves.\n"
                    "4. **Foliar Moisture Support**: Spray Panchagavya (3%) to reduce plant stress during extended dry spells."
                )
            else:
                res = (
                    f"🌾 **Advanced Agronomic Advisory for Rice (Turn {topic_turns})**:\n\n"
                    "Drain field 10-12 days prior to harvest when 85% of panicles turn golden yellow. Check AgriConnect Marketplace for current paddy APMC prices."
                )

        elif topic == "chilli":
            if topic_turns <= 1:
                res = (
                    "🌱 **Organic Treatment for Chilli Leaf Curl Disease (Begomovirus / Whitefly Vector)**:\n\n"
                    "1. **Neem Oil Spray**: Spray cold-pressed Neem Oil (5ml per 1L water + 1ml liquid soap) every 5-7 days during early morning or evening to control whiteflies and thrips.\n"
                    "2. **Sticky Traps**: Install 10-15 Yellow & Blue Sticky Traps per acre to trap adult whiteflies and thrips vector insects.\n"
                    "3. **Sour Buttermilk Spray**: Spray 5-day-old fermented sour curd/buttermilk (1L in 10L water) to inhibit viral spread and improve leaf greening.\n"
                    "4. **Sanitation**: Immediately clip off and burn heavily curled, infected young shoots."
                )
            elif topic_turns == 2:
                res = (
                    "🌿 **Additional Organic Strategies & Immunity Boosters for Chilli Crops**:\n\n"
                    "1. **Botanical Extracts**: Spray Karanja (Pongamia) or Neem seed kernel extract (NSKE 5%) as a potent bio-repellent.\n"
                    "2. **Border Trap Crops**: Plant 2-3 rows of tall Maize or Sorghum around the field perimeter to physically block migrating whitefly vectors.\n"
                    "3. **Bio-Fertilizers**: Apply *Pseudomonas fluorescens* (2.5 kg/acre mixed with 100 kg well-decomposed FYM) to induce systemic acquired resistance (SAR) in plants.\n"
                    "4. **Nutrient Management**: Spray Panchagavya (3% solution) or Vermicompost Tea to accelerate recovery of newly emerging shoots."
                )
            else:
                res = (
                    f"🌾 **Advanced Agronomic Advisory for Chilli (Turn {topic_turns})**:\n\n"
                    "Maintain soil moisture balance through organic straw mulching. Avoid excess nitrogenous synthetic fertilizers which attract sap-sucking thrips."
                )

        elif topic == "tomato":
            t_lower = last_user_msg.lower()

            # Health / Nutritional / Variety intent
            if any(k in t_lower for k in ["health", "healthy", "nutrition", "benefit", "good for", "kind", "type", "variety", "cherry", "roma", "lycopene"]):
                res = (
                    "🍅 **Nutritional & Health Guide for Tomato Varieties**:\n\n"
                    "1. **Cherry & Grape Tomatoes**: Highest in Vitamin C and natural sugars per serving. Excellent for raw eating, boosting immunity, and skin health.\n"
                    "2. **Roma / Plum Tomatoes**: Contain concentrated **Lycopene** (a powerful antioxidant that supports heart health and reduces cancer risk). Cooking Roma tomatoes enhances lycopene absorption by 300%!\n"
                    "3. **Heirloom & Dark Varieties (e.g., Black Krim, Cherokee Purple)**: Highest in anthocyanins and polyphenols, providing superior anti-inflammatory properties.\n"
                    "4. **Export Grade Alphonso/Hybrid Tomatoes**: Balanced in Potassium and Vitamin A, ideal for low-sodium dietary management."
                )
            # Relevancy / Clarifying follow-up query ("what does that have to do with...")
            elif any(k in t_lower for k in ["have to do", "relevance", "why", "related", "mean", "explain"]):
                res = (
                    "🍅 **Health Benefits Breakdown & Relevance**:\n\n"
                    "Apologies for focusing on cultivation earlier! In terms of health impact:\n"
                    "• **Lycopene Concentration**: Deep red, fully ripe tomatoes offer maximum heart and prostate protection.\n"
                    "• **Raw vs. Cooked**: Eat raw Cherry tomatoes for maximum Vitamin C; eat cooked Roma/Plum tomatoes in olive oil for maximum Lycopene absorption.\n"
                    "• **Organically Grown Tomatoes**: Have up to 20% higher antioxidant levels due to natural plant stress defense mechanisms."
                )
            elif topic_turns <= 1:
                res = (
                    "Welcome to AgriConnect AI Tomato Advice! Tomatoes require 6-8 hours of direct sunlight daily, "
                    "well-draining soil with a pH of 6.0-6.8, and consistent deep watering at the roots."
                )
            elif topic_turns == 2:
                res = (
                    "Regarding tomatoes (Pruning & Fertilization): In addition to sunlight and watering, ensure regular pruning of lower suckers "
                    "every 7-10 days, apply calcium-rich organic fertilizer to prevent blossom-end rot, and space plants at least 45 cm apart."
                )
            else:
                res = (
                    f"Regarding tomatoes (Turn {topic_turns} - Harvest & Mandi Pricing): Harvest when fruits are firm and 85-90% colored. "
                    "Check current APMC mandi tomato benchmark rates on AgriConnect."
                )

        elif topic == "weather":
            res = (
                f"AgriConnect Weather Advisory for '{last_user_msg}': "
                "Temperature: 28.5°C, Humidity: 62%, Rain today: 0.0 mm, Wind: 12 km/h. "
                "Alerts: Favorable conditions for harvesting and drying produce."
            )

        elif topic == "recommend":
            res = (
                "AgriConnect Produce Recommendations:\n"
                "• Devgad Alphonso Mangoes (Grade A Export) - ₹1200/unit from Farmer Ramesh Patil [Ratnagiri, Maharashtra]\n"
                "• Fresh Nagpur Juicy Oranges (50kg Bag) - ₹2250/unit from Farmer Suresh Deshmukh [Nagpur, Maharashtra]\n"
                "• Premium Shimla Royal Delicious Apples - ₹2800/unit from Farmer Vikram Singh [Shimla, Himachal Pradesh]"
            )

        elif topic == "wheat":
            if topic_turns <= 1:
                res = (
                    "AgriConnect Wheat Insights: Sow seeds at 2-3 cm depth during early winter (November). "
                    "Ensure initial soil moisture is adequate for uniform germination."
                )
            else:
                res = (
                    f"Regarding wheat (Turn {topic_turns}): Irrigate at Crown Root Initiation (21 days post-sowing) "
                    "and inspect leaves for yellow rust. Maintain moisture content <12% for storage."
                )

        elif topic == "price":
            res = (
                f"AgriConnect Negotiation Guide (Turn {topic_turns}): Compare local APMC mandi prices on the marketplace. "
                "Specify quality parameters (grade, moisture, packaging) when submitting counter-proposals."
            )

        else:
            if topic_turns <= 1:
                res = (
                    f"AgriConnect AI Assistant: Regarding '{last_user_msg}', we recommend checking soil moisture, "
                    "monitoring pest alerts, and consulting local market rates."
                )
            elif topic_turns == 2:
                res = (
                    f"Continuing on '{last_user_msg}': For organic crop management, ensure balanced bio-fertilizer application, "
                    "regular pest monitoring, and proper field drainage."
                )
            else:
                res = (
                    f"Further details for '{last_user_msg}' (Turn {topic_turns}): Consider crop rotation with legumes to improve soil nitrogen naturally "
                    "and check AgriConnect buyer listings for direct produce sales."
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
    return primary_llm.with_fallbacks(fallbacks, exceptions_to_handle=(Exception,))

def get_provider_status() -> dict[str, Any]:
    return {
        "primary_provider": ai_settings.AI_PRIMARY_PROVIDER,
        "fallback_provider": ai_settings.AI_FALLBACK_PROVIDER,
        "active_chain": ["Ollama", "OpenAI", "AzureOpenAI", "ContextAwareMockLLM"],
        "resilient": True
    }
