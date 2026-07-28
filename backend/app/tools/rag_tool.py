import asyncio
from langchain_core.tools import tool
from app.services.ai.rag_service import rag_service

@tool
def search_agricultural_knowledge(query: str) -> str:
    """Tool to search Indian agricultural knowledge, crop advisories, soil suitability, disease remedies, and APMC market listings."""
    try:
        loop = asyncio.get_running_loop()
        docs = loop.run_until_complete(rag_service.search_knowledge(query, limit=3))
    except Exception:
        docs = asyncio.run(rag_service.search_knowledge(query, limit=3))

    if not docs:
        return "No specific agricultural knowledge articles found for this topic."

    formatted = []
    for doc in docs:
        formatted.append(f"[{doc['type'].upper()}] {doc['title']}: {doc['content']}")
    return "\n\n".join(formatted)
