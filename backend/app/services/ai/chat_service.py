import json
import logging
from typing import AsyncGenerator
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.services.ai.workflow import agri_chat_graph
from app.services.ai.memory import memory_store
from app.services.ai.providers import get_resilient_llm

logger = logging.getLogger(__name__)

DEFAULT_AGRI_SYSTEM_PROMPT = (
    "You are AgriConnect AI, an intelligent agricultural assistant for farmers and produce buyers in India. "
    "Provide clear, professional, practical advice on crop management, produce prices, negotiation tips, "
    "and agricultural best practices. Keep your responses helpful, concise, and friendly."
)

class AIChatService:
    async def invoke_chat(
        self,
        message: str,
        thread_id: str | None = None,
        system_prompt: str | None = None
    ) -> dict:
        """
        Executes non-streaming chat turn via LangGraph and persists history in memory store.
        """
        tid = thread_id or "default-session"
        prompt = system_prompt or DEFAULT_AGRI_SYSTEM_PROMPT

        # 1. Fetch history
        history = await memory_store.get_history(tid)
        user_msg = HumanMessage(content=message)
        input_messages = list(history) + [user_msg]

        # 2. Invoke LangGraph workflow
        initial_state = {
            "messages": input_messages,
            "thread_id": tid,
            "system_prompt": prompt
        }
        
        result = await agri_chat_graph.ainvoke(initial_state)
        output_messages = result.get("messages", [])
        
        last_msg = output_messages[-1] if output_messages else AIMessage(content="No response generated.")
        response_text = str(last_msg.content)

        # 3. Save to memory store
        await memory_store.save_messages(tid, [user_msg, AIMessage(content=response_text)])

        return {
            "thread_id": tid,
            "response": response_text,
            "message": response_text
        }

    async def stream_chat(
        self,
        message: str,
        thread_id: str | None = None,
        system_prompt: str | None = None
    ) -> AsyncGenerator[str, None]:
        """
        Streams chat response tokens as Server-Sent Events (SSE) formatted strings.
        Format: data: {"chunk": "..."}\n\n
        """
        tid = thread_id or "default-session"
        prompt = system_prompt or DEFAULT_AGRI_SYSTEM_PROMPT

        # 1. Fetch history
        history = await memory_store.get_history(tid)
        user_msg = HumanMessage(content=message)
        input_messages = list(history) + [user_msg]

        # Ensure system prompt is leading
        full_messages = [SystemMessage(content=prompt)] + input_messages if prompt else input_messages

        llm = get_resilient_llm()
        full_response_content = ""

        try:
            async for chunk in llm.astream(full_messages):
                content = str(chunk.content or "")
                if content:
                    full_response_content += content
                    payload = json.dumps({"chunk": content, "thread_id": tid})
                    yield f"data: {payload}\n\n"

            # Save completed turn to memory
            await memory_store.save_messages(tid, [user_msg, AIMessage(content=full_response_content)])
            yield f"data: {json.dumps({'done': True, 'thread_id': tid})}\n\n"

        except Exception as e:
            logger.error(f"Streaming chat error: {e}")
            err_payload = json.dumps({"error": str(e), "thread_id": tid})
            yield f"data: {err_payload}\n\n"

ai_chat_service = AIChatService()
