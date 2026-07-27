import abc
import logging
from typing import Dict, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

logger = logging.getLogger(__name__)

class BaseMemoryInterface(abc.ABC):
    @abc.abstractmethod
    async def get_history(self, thread_id: str) -> List[BaseMessage]:
        """Retrieve conversation history for a given thread_id."""
        pass

    @abc.abstractmethod
    async def save_messages(self, thread_id: str, messages: List[BaseMessage]) -> None:
        """Append messages to the conversation history for a given thread_id."""
        pass

    @abc.abstractmethod
    async def clear_history(self, thread_id: str) -> None:
        """Clear conversation history for a given thread_id."""
        pass

class InMemorySaver(BaseMemoryInterface):
    """Simple in-memory conversation history store for development & testing."""

    def __init__(self):
        self._store: Dict[str, List[BaseMessage]] = {}

    async def get_history(self, thread_id: str) -> List[BaseMessage]:
        return list(self._store.get(thread_id, []))

    async def save_messages(self, thread_id: str, messages: List[BaseMessage]) -> None:
        if thread_id not in self._store:
            self._store[thread_id] = []
        self._store[thread_id].extend(messages)

    async def clear_history(self, thread_id: str) -> None:
        if thread_id in self._store:
            del self._store[thread_id]

class RedisMemorySaver(BaseMemoryInterface):
    """
    Stubbed Redis memory saver for future Redis integration.
    Currently logs operations and falls back to in-memory store until Redis URL is configured.
    """

    def __init__(self, redis_url: str | None = None):
        self.redis_url = redis_url
        self._fallback = InMemorySaver()
        logger.info(f"Initialized RedisMemorySaver (redis_url={redis_url or 'Stubbed/In-Memory'})")

    async def get_history(self, thread_id: str) -> List[BaseMessage]:
        logger.debug(f"[RedisMemorySaver Stub] Reading history for thread_id={thread_id}")
        return await self._fallback.get_history(thread_id)

    async def save_messages(self, thread_id: str, messages: List[BaseMessage]) -> None:
        logger.debug(f"[RedisMemorySaver Stub] Saving {len(messages)} messages for thread_id={thread_id}")
        await self._fallback.save_messages(thread_id, messages)

    async def clear_history(self, thread_id: str) -> None:
        logger.debug(f"[RedisMemorySaver Stub] Clearing history for thread_id={thread_id}")
        await self._fallback.clear_history(thread_id)

# Default global memory saver instance
memory_store = InMemorySaver()
