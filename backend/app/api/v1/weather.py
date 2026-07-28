from fastapi import APIRouter, Query
from app.tools.weather_tool import fetch_weather_forecast_data

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
async def get_weather(location: str = Query("Ratnagiri", description="City, district, or coordinates (lat,lon)")):
    """Get real-time agricultural weather forecast and crop advisories for a location."""
    return await fetch_weather_forecast_data(location)
