from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..agents.disruption_agent import disruption_agent
from ..schemas.all_schemas import DisruptionItem

router = APIRouter(prefix="/disruptions", tags=["Travel Disruptions & Rebooking"])

@router.get("", response_model=List[DisruptionItem])
def get_active_disruptions(destination: Optional[str] = None):
    return disruption_agent.get_all_disruptions(destination=destination)

@router.get("/check-flight")
def check_flight_status(flight_number: str = "6E-204"):
    return disruption_agent.check_flight(flight_number)

@router.post("/rebook-simulation")
def simulate_rebooking(flight_number: str = "6E-204", destination: str = "Goa"):
    check = disruption_agent.check_flight(flight_number)
    return {
        "status": "success",
        "flight_checked": flight_number,
        "destination": destination,
        "disruption_detected": check.get("is_disrupted", False),
        "impact_analysis": f"Day 1 airport transfer in {destination.title()} adjusted for flight arrival.",
        "rebooking_action_taken": f"Automated hotel check-in rescheduled. Morning sight in {destination.title()} shifted with zero cancellation penalty.",
        "savings_inr": 0,
        "new_estimated_arrival": "01:15 PM"
    }
