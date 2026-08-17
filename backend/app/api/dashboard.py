from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ..database import get_db
from ..models.entities import Trip, Booking
from .auth_deps import get_current_user_optional, AuthenticatedUser

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])

class DashboardStatsResponse(BaseModel):
    upcoming_trips_count: int
    total_bookings_count: int
    places_visited_count: int
    travel_days_count: int
    active_upcoming_trip: Optional[Dict[str, Any]] = None

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)
):
    # 1. Fetch user's trips
    query_trips = db.query(Trip)
    query_bookings = db.query(Booking)
    if current_user:
        query_trips = query_trips.filter(Trip.user_id == current_user.id)
        query_bookings = query_bookings.filter(Booking.user_id == current_user.id)

    trips = query_trips.order_by(Trip.created_at.desc()).all()
    upcoming_trips = [t for t in trips if t.status.lower() == "upcoming"]
    upcoming_count = len(upcoming_trips) if upcoming_trips else len(trips)

    # 2. Fetch bookings count
    bookings = query_bookings.all()
    bookings_count = len(bookings)

    # 3. Calculate unique places visited / planned
    unique_destinations = set([t.destination.title() for t in trips if t.destination])
    places_count = len(unique_destinations)

    # 4. Calculate total travel days
    travel_days = sum([t.duration_days for t in trips if t.duration_days])

    # 5. Get active upcoming trip
    active_trip = None
    if trips:
        top_trip = trips[0]
        active_trip = {
            "id": top_trip.id,
            "title": top_trip.title,
            "destination": top_trip.destination,
            "country": top_trip.country,
            "start_date": top_trip.start_date,
            "end_date": top_trip.end_date,
            "duration_days": top_trip.duration_days,
            "image_url": top_trip.image_url or "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80",
            "travelers_label": top_trip.travelers_label
        }

    return {
        "upcoming_trips_count": upcoming_count,
        "total_bookings_count": bookings_count,
        "places_visited_count": places_count,
        "travel_days_count": travel_days,
        "active_upcoming_trip": active_trip
    }

