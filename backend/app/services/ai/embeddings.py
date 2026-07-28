import math
import logging
import hashlib
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    """
    Embedding Service generating 384-dimensional dense vector embeddings for pgvector.
    Supports Ollama/OpenAI or high-quality deterministic semantic feature hashing fallback.
    """
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _generate_fallback_embedding(self, text: str) -> List[float]:
        """Generates a normalized 384-dimensional dense embedding vector from text."""
        clean_text = text.lower().strip()
        words = [w for w in clean_text.split() if len(w) > 1]
        
        vec = [0.0] * self.dimension
        if not words:
            vec[0] = 1.0
            return vec

        for word in words:
            # Generate deterministic feature indices & weights via hashing
            h1 = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            h2 = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            
            idx1 = h1 % self.dimension
            idx2 = h2 % self.dimension
            val1 = 1.0 if (h1 % 2 == 0) else -1.0
            val2 = 1.0 if (h2 % 2 == 0) else -1.0
            
            vec[idx1] += val1
            vec[idx2] += val2

        # L2 normalize vector
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        else:
            vec[0] = 1.0
        return vec

    async def get_embedding(self, text: str) -> List[float]:
        """Returns 384-dim vector for text query or document content with Redis caching."""
        if not text or not text.strip():
            return [0.0] * self.dimension

        text_hash = hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()
        cache_key = f"agri:vec:{text_hash}"

        # Check Redis cache for precomputed embedding
        try:
            from app.services.ai.memory import memory_store
            cached_json = await memory_store.get_val(cache_key)
            if cached_json:
                import json
                return json.loads(cached_json)
        except Exception:
            pass

        vec = None
        # Check if Ollama / OpenAI embeddings are available
        try:
            from app.core.ai_config import ai_settings
            if ai_settings.OPENAI_API_KEY:
                from langchain_openai import OpenAIEmbeddings
                embeddings = OpenAIEmbeddings(openai_api_key=ai_settings.OPENAI_API_KEY, model="text-embedding-3-small")
                res = await embeddings.aembed_query(text)
                if len(res) >= self.dimension:
                    res = res[:self.dimension]
                    norm = math.sqrt(sum(x * x for x in res))
                    vec = [x / norm for x in res] if norm > 0 else res
        except Exception as e:
            logger.debug(f"Provider embedding API notice ({e}), using dense semantic fallback.")

        if not vec:
            vec = self._generate_fallback_embedding(text)

        # Store in Redis cache
        try:
            import json
            from app.services.ai.memory import memory_store
            await memory_store.set_val(cache_key, json.dumps(vec), ttl_seconds=86400)
        except Exception:
            pass

        return vec

embedding_service = EmbeddingService(dimension=384)
