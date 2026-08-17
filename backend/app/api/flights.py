from datetime import date
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.travel_services import search_flights as provider_search_flights
from ..schemas.all_schemas import FlightSearchRequest, FlightPredictionResponse
from ..ml.flight_service import flight_ml_service

router = APIRouter(prefix="/flights", tags=["Flights & Fares"])

@router.get("/search")
def search_flights(
    source_city: Optional[str] = None,
    destination_city: Optional[str] = None,
    source: Optional[str] = None,
    destination: Optional[str] = None,
    departure_date: Optional[date] = None,
    departureDate: Optional[date] = None,
    return_date: Optional[date] = None,
    returnDate: Optional[date] = None,
    adults: int = Query(1, ge=1, le=9),
    cabin: str = "ECONOMY",
    days_left: Optional[int] = None
):
    """
    Search flight inventory via open-source trvl provider adapter or labeled demo mode.
    Returns normalized flights with recommendation ranking badges.
    """
    src = source_city or source or "Delhi"
    dest = destination_city or destination or "Dubai"
    dep_date = departure_date or departureDate
    ret_date = return_date or returnDate
    today_val = date.today()
    dep = dep_date if dep_date and dep_date >= today_val else today_val
    ret = ret_date if ret_date and ret_date >= dep else (dep if ret_date else None)

    dep_str = dep.isoformat()
    ret_str = ret.isoformat() if ret else None

    payload = provider_search_flights(
        origin=src,
        destination=dest,
        departure_date=dep_str,
        return_date=ret_str,
        adults=adults,
        cabin=cabin.upper()
    )

    return {
        "source": src,
        "destination": dest,
        "departure_date": dep_str,
        "return_date": ret_str,
        "results_count": len(payload.get("results", [])),
        "flights": payload.get("results", []),
        "data_status": payload.get("status", "unavailable"),
        "message": payload.get("message")
    }

@router.post("/predict", response_model=FlightPredictionResponse)
def predict_single_flight(req: FlightSearchRequest):
    """Machine learning regression fare prediction (clearly labeled as AI estimation)."""
    return flight_ml_service.predict_flight(
        airline=req.airline or "IndiGo",
        source_city=req.source_city,
        destination_city=req.destination_city,
        departure_time=req.departure_time or "Morning",
        stops=req.stops or "zero",
        cabin_class=req.cabin_class or "Economy",
        days_left=req.days_left or 15
    )
