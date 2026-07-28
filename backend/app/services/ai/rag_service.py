import logging
from typing import Any
from sqlalchemy import select, func
from app.db.session import AsyncSessionLocal
from app.models.knowledge import ProductKnowledge
from app.models.auction import ProductAuction
from app.services.ai.embeddings import embedding_service

logger = logging.getLogger(__name__)

# Essential Indian Agronomic Knowledge Articles
INDIAN_AGRI_KNOWLEDGE = [
    {
        "title": "Tomato Cultivation & Disease Control in India",
        "category": "VEGETABLES",
        "topic": "Soil, Diseases, Pruning",
        "content": (
            "Tomatoes require well-draining loamy soil with optimal pH 6.0-6.8 and 6-8 hours of direct sunlight. "
            "To prevent Blossom End Rot, apply calcium nitrate or organic compost. Regular pruning of lower suckers "
            "every 7-10 days improves airflow. Common pests include Yellow Leaf Curl Virus (transmitted by whiteflies); "
            "apply neem oil spray (5ml/L) or sticky yellow traps for organic pest management."
        )
    },
    {
        "title": "Alphonso Mango Orchard Management (Ratnagiri/Konkan)",
        "category": "FRUITS",
        "topic": "Flowering, Spongy Tissue, Harvest",
        "content": (
            "Devgad & Ratnagiri Alphonso mangoes require deep laterite red soil. Avoid excessive nitrogen fertilizer during flowering stage. "
            "To prevent Spongy Tissue disease, harvest fruits at 85% maturity when color changes from dark green to olive. "
            "Soil drenching with Paclobutrazol in September promotes uniform flowering in coastal Maharashtra."
        )
    },
    {
        "title": "Sharbati & Basmati Grain Harvesting Guidelines",
        "category": "GRAINS",
        "topic": "Moisture, Storage, Mandi Pricing",
        "content": (
            "Harvest Punjab Sharbati Wheat and 1121 Basmati Rice when grain moisture content drops to 14-16%. "
            "Sun dry grains on clean tarpaulins before storage. Store in airtight HDPE jute bags treated with neem leaves to prevent rice weevil attacks."
        )
    },
    {
        "title": "Spices Farming: Guntur Chillies, Coorg Pepper & Kashmiri Saffron",
        "category": "OTHER",
        "topic": "Spices, GI Tags, Capsaicin",
        "content": (
            "Guntur S4 Red Chillies require well-aerated black cotton soil; maintain dry weather during pods drying for peak ASTA color rating. "
            "Coorg Tellicherry Black Pepper thrives on live shade trees (Silver Oak). Kashmiri Saffron requires cold winter climate and well-drained karewa soils."
        )
    }
]

class RAGService:
    async def seed_knowledge_base_if_empty(self):
        """Ensures knowledge base articles are present with vector embeddings."""
        async with AsyncSessionLocal() as db:
            count = (await db.execute(select(func.count(ProductKnowledge.id)))).scalar() or 0
            if count == 0:
                logger.info("Seeding Indian Agricultural Knowledge Base with pgvector embeddings...")
                for item in INDIAN_AGRI_KNOWLEDGE:
                    text_for_embedding = f"{item['title']} {item['topic']} {item['category']} {item['content']}"
                    vec = await embedding_service.get_embedding(text_for_embedding)
                    pk = ProductKnowledge(
                        title=item['title'],
                        category=item['category'],
                        topic=item['topic'],
                        content=item['content'],
                        embedding=vec
                    )
                    db.add(pk)
                await db.commit()
            else:
                unembedded = (await db.execute(select(ProductKnowledge).where(ProductKnowledge.embedding.is_(None)))).scalars().all()
                if unembedded:
                    for pk in unembedded:
                        text_for_embedding = f"{pk.title} {pk.topic} {pk.category} {pk.content}"
                        pk.embedding = await embedding_service.get_embedding(text_for_embedding)
                        db.add(pk)
                    await db.commit()

    async def search_knowledge(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        """
        Executes pgvector dense vector similarity retrieval.
        Keyword-only retrieval has been completely removed.
        Returns Top-K nearest neighbor documents with similarity metadata.
        """
        await self.seed_knowledge_base_if_empty()
        
        query_vector = await embedding_service.get_embedding(query)

        async with AsyncSessionLocal() as db:
            stmt = (
                select(
                    ProductKnowledge,
                    ProductKnowledge.embedding.l2_distance(query_vector).label("distance")
                )
                .order_by(ProductKnowledge.embedding.l2_distance(query_vector))
                .limit(limit)
            )

            result = await db.execute(stmt)
            rows = result.all()

            knowledge_docs = []
            for pk, dist in rows:
                distance_val = float(dist or 0.0)
                # Cosine/L2 similarity score metric
                score = round(1.0 / (1.0 + distance_val), 4)
                knowledge_docs.append({
                    "id": pk.id,
                    "title": pk.title,
                    "category": pk.category,
                    "topic": pk.topic,
                    "content": pk.content,
                    "type": "agronomic_advisory",
                    "similarity_score": score,
                    "retrieval_method": "pgvector_l2_similarity"
                })

            return knowledge_docs[:limit]

rag_service = RAGService()
