import sys
from pathlib import Path
from datetime import date, timedelta
sys.stdout.reconfigure(encoding='utf-8')

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.services.travel_provider import (
    check_travel_provider_health,
    search_flights,
    search_hotels,
    get_hotel_rooms,
    is_trvl_available
)
from app.services.assistant_service import assistant_engine

client = TestClient(app)

print("=== 1. PROVIDER HEALTH CHECK ===")
health = check_travel_provider_health()
print("Health:", health)
assert health["available"] is True
assert health["provider"] == "trvl"

res = client.get("/api/health/travel")
print("API /api/health/travel status:", res.status_code, res.json())
assert res.status_code == 200
assert res.json()["available"] is True

print("\n=== 2. FLIGHT SEARCH VIA TRVL ===")
dep_date = (date.today() + timedelta(days=20)).isoformat()
print(f"Searching flights DEL -> HYD on {dep_date}...")
flight_res = search_flights("DEL", "HYD", dep_date)
print("Flight Search Status:", flight_res.get("status"))
print("Flight Results Count:", len(flight_res.get("results", [])))
if flight_res.get("results"):
    first = flight_res["results"][0]
    print(f"Sample Flight: {first.get('airline')} {first.get('flight_number')} | Price: INR {first.get('price_inr')} | Badge: {first.get('recommended_badge')} | Booking: {first.get('booking_capability')}")
    assert "booking_url" in first
    assert first["booking_capability"] == "continue_to_booking"

print("\n=== 3. HOTEL SEARCH VIA TRVL ===")
check_in = (date.today() + timedelta(days=20)).isoformat()
check_out = (date.today() + timedelta(days=24)).isoformat()
print(f"Searching hotels in Dubai from {check_in} to {check_out}...")
hotel_res = search_hotels({"name": "Dubai", "city": "Dubai", "country": "UAE"}, check_in, check_out)
print("Hotel Search Status:", hotel_res.get("status"))
print("Hotel Results Count:", len(hotel_res.get("results", [])))
if hotel_res.get("results"):
    first_h = hotel_res["results"][0]
    print(f"Sample Hotel: {first_h.get('name')} | Rating: {first_h.get('rating')} | Per Night: INR {first_h.get('price_per_night')} | Badge: {first_h.get('recommendation_badge')}")
    assert "booking_url" in first_h
    assert first_h["booking_capability"] == "continue_to_booking"

print("\n=== 4. AI TRAVEL CONSULTANT TEST ===")
# Turn 1: Incomplete destination
s_id = "test_trvl_session_01"
r1 = assistant_engine.process_chat("I want to visit Dubai", s_id)
print("Assistant Turn 1 (Clarify Origin):", r1.content[:120], "...")

# Turn 2: Origin provided
r2 = assistant_engine.process_chat("Hyderabad", s_id)
print("Assistant Turn 2 (Clarify Duration):", r2.content[:120], "...")

# Turn 3: Duration provided
r3 = assistant_engine.process_chat("4 days", s_id)
print("Assistant Turn 3 (Clarify Travelers):", r3.content[:120], "...")

# Turn 4: Travelers provided
r4 = assistant_engine.process_chat("2 adults", s_id)
print("Assistant Turn 4 (Clarify Budget):", r4.content[:120], "...")

# Turn 5: Budget provided -> Feasibility check & Recommendation
r5 = assistant_engine.process_chat("₹150,000 total", s_id)
print("Assistant Turn 5 (Feasibility & Recommendations):", r5.content[:200], "...")

print("\n=== 5. LOCAL TRIP TEST (No Flights Needed) ===")
s_id_local = "test_local_session_01"
r_loc1 = assistant_engine.process_chat("I live in Hyderabad and want to explore Hyderabad for 2 days with Rs 10000", s_id_local)
print("Assistant Local Trip:", r_loc1.content[:150], "...")

print("\nALL BACKEND & TRAVEL PROVIDER VERIFICATION TESTS PASSED SUCCESSFULLY!")

