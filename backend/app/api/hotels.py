from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ..services.travel_services import resolve_location, search_hotels

router = APIRouter(prefix="/hotels", tags=["Hotels & Accommodations"])

@router.get("")
def get_hotels(
    city: str,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    adults: int = Query(1, ge=1, le=9),
    rooms: int = Query(1, ge=1, le=9)
):
    """
    Search worldwide hotel accommodations with room details, nightly rates, total prices, and policies.
    """
    today_val = date.today()
    d_in = check_in if check_in and check_in >= today_val else today_val
    d_out = check_out if check_out and check_out > d_in else (d_in + timedelta(days=3))

    try:
        location = resolve_location(city)
    except (LookupError, ValueError) as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Location service temporarily unavailable: {str(exc)}")

    result = search_hotels(
        location=location,
        check_in=d_in.isoformat(),
        check_out=d_out.isoformat(),
        adults=adults,
        rooms=rooms
    )

    return {
        "data_status": result.get("status", "unavailable"),
        "message": result.get("message"),
        "location": location,
        "results": result.get("results", [])
    }
