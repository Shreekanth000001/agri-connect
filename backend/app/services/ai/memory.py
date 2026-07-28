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

import os
import json
import redis.asyncio as aioredis
from langchain_core.messages import message_to_dict, messages_from_dict
from app.core.security import security_settings

class RedisMemorySaver(BaseMemoryInterface):
    """
    Production-grade Redis memory checkpointer using redis.asyncio.
    Disables ephemeral InMemorySaver fallback in production mode.
    """

    def __init__(self, redis_url: str | None = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL") or "redis://localhost:6379/0"
        self.is_production = security_settings.ENVIRONMENT.lower() == "production"
        self._fallback = InMemorySaver() if not self.is_production else None
        self._redis = None
        
        try:
            self._redis = aioredis.from_url(self.redis_url, decode_responses=True)
            logger.info(f"Initialized RedisMemorySaver with Redis at {self.redis_url}")
        except Exception as e:
            if self.is_production:
                logger.error(f"CRITICAL: Failed to connect to Redis at {self.redis_url} in production mode: {e}")
            else:
                logger.warning(f"Could not connect to Redis at {self.redis_url}: {e}. Local dev in-memory store active.")

    async def get_history(self, thread_id: str) -> List[BaseMessage]:
        if self._redis:
            try:
                key = f"agri:chat:history:{thread_id}"
                data = await self._redis.get(key)
                if data:
                    raw_dicts = json.loads(data)
                    return messages_from_dict(raw_dicts)
            except Exception as e:
                logger.error(f"Redis get_history error for thread {thread_id}: {e}")
                if self.is_production:
                    return []
        
        if self._fallback:
            return await self._fallback.get_history(thread_id)
        return []

    async def save_messages(self, thread_id: str, messages: List[BaseMessage]) -> None:
        current_history = await self.get_history(thread_id)
        all_msgs = current_history + list(messages)

        if self._redis:
            try:
                key = f"agri:chat:history:{thread_id}"
                msg_dicts = [message_to_dict(m) for m in all_msgs]
                await self._redis.set(key, json.dumps(msg_dicts), ex=86400 * 7) # 7-day TTL
            except Exception as e:
                logger.error(f"Redis save_messages error for thread {thread_id}: {e}")

        if self._fallback:
            await self._fallback.save_messages(thread_id, messages)

    async def clear_history(self, thread_id: str) -> None:
        if self._redis:
            try:
                key = f"agri:chat:history:{thread_id}"
                await self._redis.delete(key)
            except Exception as e:
                logger.error(f"Redis clear_history error for thread {thread_id}: {e}")

    async def get_val(self, key: str) -> str | None:
        if self._redis:
            try:
                return await self._redis.get(key)
            except Exception as e:
                logger.error(f"Redis get_val error for key {key}: {e}")
        if self._fallback and hasattr(self._fallback, "_cache"):
            return self._fallback._cache.get(key)
        return None

    async def set_val(self, key: str, val: str, ttl_seconds: int = 60) -> None:
        if self._redis:
            try:
                await self._redis.set(key, val, ex=ttl_seconds)
            except Exception as e:
                logger.error(f"Redis set_val error for key {key}: {e}")
        if self._fallback:
            if not hasattr(self._fallback, "_cache"):
                self._fallback._cache = {}
            self._fallback._cache[key] = val

# Default global memory saver instance
memory_store = RedisMemorySaver()
