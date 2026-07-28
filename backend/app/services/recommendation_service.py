import logging
from typing import Any
from sqlalchemy import select, func, desc, or_, cast, String
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.models.auction import ProductAuction, AuctionStatus
from app.models.bid import BidId
from app.models.user import User, Role

logger = logging.getLogger(__name__)

class RecommendationService:
    async def get_recommendations(
        self,
        user_id: int | None = None,
        location: str | None = None,
        category: str | None = None,
        limit: int = 6
    ) -> list[dict[str, Any]]:
        """Generates hybrid agricultural marketplace recommendations."""
        async with AsyncSessionLocal() as db:
            query = select(ProductAuction).options(selectinload(ProductAuction.user_fid)).where(
                ProductAuction.auctionStatus == AuctionStatus.OPEN
            )

            # Filter by Category if provided
            if category and category.upper() != "ALL":
                query = query.where(func.upper(cast(ProductAuction.category, String)) == category.upper())

            # Filter or rank by location if provided
            if location:
                loc_clean = location.strip().lower()
                query = query.outerjoin(User, ProductAuction.fid == User.uid).order_by(
                    desc(User.ugeo.ilike(f"%{loc_clean}%")),
                    desc(ProductAuction.CreatedAt)
                )
            else:
                query = query.order_by(desc(ProductAuction.CreatedAt))

            query = query.limit(limit * 2)
            results = (await db.execute(query)).scalars().all()

            # Rank and format recommendation objects
            recommendations = []
            for p in results:
                farmer = p.user_fid
                # Calculate match score based on attributes
                score = 0.85
                match_reasons = []

                if category and p.category and p.category.upper() == category.upper():
                    score += 0.10
                    match_reasons.append(f"Matches requested category '{p.category}'")
                
                if location and farmer and farmer.ugeo and location.lower() in farmer.ugeo.lower():
                    score += 0.15
                    match_reasons.append(f"Located near {farmer.ugeo.split('-')[0].strip()}")
                
                if "Export" in p.title or "GI-tagged" in p.description or "Grade A" in p.title:
                    score += 0.05
                    match_reasons.append("Premium Export/GI-tagged Grade A produce")

                if not match_reasons:
                    match_reasons.append("Popular active produce auction in your region")

                recommendations.append({
                    "id": p.ProdAucId,
                    "title": p.title,
                    "description": p.description,
                    "startingBid": p.startingBid,
                    "category": p.category,
                    "imageUrl": p.imageUrl[0] if p.imageUrl else "/agri-conn-logo.png",
                    "farmer_name": farmer.uname if farmer else "Local Farmer",
                    "farmer_location": farmer.ugeo if farmer else "India",
                    "match_score": min(round(score, 2), 0.99),
                    "recommendation_reason": " • ".join(match_reasons)
                })

            # Sort by match score
            recommendations.sort(key=lambda x: x["match_score"], reverse=True)
            return recommendations[:limit]

recommendation_service = RecommendationService()
