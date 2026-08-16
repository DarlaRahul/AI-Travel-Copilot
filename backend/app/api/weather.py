from fastapi import APIRouter, HTTPException
from ..services.travel_services import resolve_location, get_weather

router = APIRouter(prefix="/weather", tags=["Weather & Alerts"])

@router.get("")
def get_destination_weather(destination: str = "Dubai"):
    try:
        location = resolve_location(destination)
        return get_weather(location)
    except (LookupError, ValueError) as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Live weather data temporarily unavailable: {str(exc)}")
