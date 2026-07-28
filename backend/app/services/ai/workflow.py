import logging
from typing import Annotated, TypedDict, Sequence
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from app.services.ai.providers import get_resilient_llm
from app.tools.weather_tool import get_weather_forecast
from app.tools.recommendation_tool import recommend_products_tool
from app.tools.rag_tool import search_agricultural_knowledge

logger = logging.getLogger(__name__)

# Register Tools
AGRI_TOOLS = [get_weather_forecast, recommend_products_tool, search_agricultural_knowledge]

# 1. State Definition
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    thread_id: str
    system_prompt: str

# 2. Chat Node Function
async def chat_node(state: AgentState) -> dict:
    """
    Executes the resilient LLM node for the chat workflow.
    Binds weather, recommendation, and RAG knowledge tools.
    """
    messages = list(state.get("messages", []))
    system_prompt = state.get("system_prompt", "")

    # Default system prompt if none provided
    if not system_prompt:
        system_prompt = (
            "You are AgriConnect AI, an expert Indian agricultural AI assistant. "
            "You provide specialized advice on crops, soil pH, irrigation, pest control, weather forecasts, "
            "and market produce recommendations across India."
        )

    # Ensure system prompt is at top if provided and not yet present
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=system_prompt)] + messages

    llm = get_resilient_llm()
    
    try:
        response = await llm.ainvoke(messages)
    except Exception as e:
        logger.warning(f"LLM chain execution error ({e}). Invoking ContextAwareMockLLM fallback.")
        from app.services.ai.providers import create_mock_llm
        mock_llm = create_mock_llm()
        response = await mock_llm.ainvoke(messages)

    return {"messages": [response]}

# 3. Build & Compile LangGraph Workflow
def create_agri_chat_graph():
    """
    Constructs and compiles the AgriConnect AI LangGraph chat workflow with tool execution support.
    """
    workflow = StateGraph(AgentState)
    
    tool_node = ToolNode(AGRI_TOOLS)
    
    # Add nodes
    workflow.add_node("chat", chat_node)
    workflow.add_node("tools", tool_node)
    
    # Set edges
    workflow.add_edge(START, "chat")
    workflow.add_conditional_edges("chat", tools_condition)
    workflow.add_edge("tools", "chat")

    app = workflow.compile()
    return app

# Singleton compiled graph
agri_chat_graph = create_agri_chat_graph()
