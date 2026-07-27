import logging
from typing import Annotated, TypedDict, Sequence
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from app.services.ai.providers import get_resilient_llm

logger = logging.getLogger(__name__)

# 1. State Definition
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    thread_id: str
    system_prompt: str

# 2. Chat Node Function
async def chat_node(state: AgentState) -> dict:
    """
    Executes the resilient LLM node for the chat workflow.
    Appends system prompt if provided and not yet present in history.
    """
    messages = list(state.get("messages", []))
    system_prompt = state.get("system_prompt", "")

    # Ensure system prompt is at top if provided
    if system_prompt and (not messages or not isinstance(messages[0], SystemMessage)):
        messages = [SystemMessage(content=system_prompt)] + messages

    llm = get_resilient_llm()
    response = await llm.ainvoke(messages)
    return {"messages": [response]}

# 3. Build & Compile LangGraph Workflow
def create_agri_chat_graph():
    """
    Constructs and compiles the AgriConnect AI LangGraph chat workflow.
    """
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("chat", chat_node)
    
    # Set edges
    workflow.add_edge(START, "chat")
    workflow.add_edge("chat", END)

    app = workflow.compile()
    return app

# Singleton compiled graph
agri_chat_graph = create_agri_chat_graph()
