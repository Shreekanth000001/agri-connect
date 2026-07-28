from fastapi import APIRouter, Query
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
async def get_recommendations(
    user_id: int | None = Query(None, description="Optional user ID"),
    location: str | None = Query(None, description="Optional location or district filter"),
    category: str | None = Query(None, description="Optional category filter (FRUITS, VEGETABLES, GRAINS, DAIRY, OTHER)"),
    limit: int = Query(6, ge=1, le=20, description="Max recommendations count")
):
    """Get personalized agricultural produce recommendations."""
    recs = await recommendation_service.get_recommendations(
        user_id=user_id,
        location=location,
        category=category,
        limit=limit
    )
    return {"items": recs, "total": len(recs)}
