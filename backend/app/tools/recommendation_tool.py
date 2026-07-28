import asyncio
from langchain_core.tools import tool
from app.services.recommendation_service import recommendation_service

@tool
def recommend_products_tool(category: str = "", location: str = "") -> str:
    """Tool to get personalized agricultural produce recommendations and active crop listings based on category (FRUITS, VEGETABLES, GRAINS, DAIRY, OTHER) or regional location."""
    try:
        loop = asyncio.get_running_loop()
        recs = loop.run_until_complete(recommendation_service.get_recommendations(location=location, category=category, limit=4))
    except Exception:
        recs = asyncio.run(recommendation_service.get_recommendations(location=location, category=category, limit=4))

    if not recs:
        return "No specific produce matches found for the criteria."

    items_str = []
    for item in recs:
        items_str.append(
            f"• {item['title']} (₹{item['startingBid']}) from {item['farmer_name']} [{item['farmer_location']}] - Reason: {item['recommendation_reason']}"
        )
    return "Recommended Produce Auctions:\n" + "\n".join(items_str)
