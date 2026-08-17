import pytest
from backend.app.services import travel_services
from backend.app.optimization.budget_optimizer import budget_optimizer
from backend.app.agents.supervisor_agent import supervisor_agent
from backend.app.agents.planner_agent import planner_agent


def test_location_normalizes_geocoder_response(monkeypatch):
    monkeypatch.setattr(travel_services, "_get_json", lambda *_args, **_kwargs: [{
        "display_name": "Dubai, United Arab Emirates",
        "lat": "25.2048",
        "lon": "55.2708",
        "type": "city",
        "address": {"city": "Dubai", "country": "United Arab Emirates", "country_code": "ae", "state": "Dubai"},
    }])
    travel_services.resolve_location.cache_clear()
    location = travel_services.resolve_location("Dubai")
    assert location["city"] == "Dubai"
    assert location["country_code"] == "AE"
    assert location["latitude"] == 25.2048
    assert location["longitude"] == 55.2708


def test_unknown_location_raises_lookup_error(monkeypatch):
    monkeypatch.setattr(travel_services, "_get_json", lambda *_args, **_kwargs: [])
    travel_services.resolve_location.cache_clear()
    with pytest.raises(LookupError):
        travel_services.resolve_location("not-a-real-place-12345")


def test_flights_with_demo_mode(monkeypatch):
    monkeypatch.setenv("TRAVEL_DATA_MODE", "demo")
    monkeypatch.setenv("USE_DEMO_DATA", "true")
    result = travel_services.search_flights("Hyderabad", "Dubai", "2026-10-01")
    assert result["status"] == "demo_data"
    assert len(result["results"]) > 0



def test_flight_ranking_is_deterministic():
    items = [
        {"id": "F1", "price_inr": 12000.0, "duration_hrs": 8.0, "stops": "1 stop"},
        {"id": "F2", "price_inr": 18000.0, "duration_hrs": 3.5, "stops": "Non-stop"},
        {"id": "F3", "price_inr": 14000.0, "duration_hrs": 4.5, "stops": "Non-stop"},
    ]
    ranked = travel_services.rank_flights(items)
    assert len(ranked) == 3

    labels = {label for item in ranked for label in item.get("recommendation_labels", [])}
    assert "Cheapest" in labels
    assert "Fastest" in labels
    assert "Fewest Stops" in labels

    cheapest_item = next(x for x in ranked if "Cheapest" in x.get("recommendation_labels", []))
    assert cheapest_item["id"] == "F1"

    fastest_item = next(x for x in ranked if "Fastest" in x.get("recommendation_labels", []))
    assert fastest_item["id"] == "F2"


def test_demo_mode_returns_labeled_data(monkeypatch):
    monkeypatch.delenv("AMADEUS_CLIENT_ID", raising=False)
    monkeypatch.delenv("AMADEUS_CLIENT_SECRET", raising=False)
    monkeypatch.setenv("USE_DEMO_DATA", "true")

    flt_res = travel_services.search_flights("DEL", "DXB", "2026-10-01")
    assert flt_res["status"] == "demo_data"
    assert len(flt_res["results"]) > 0
    assert flt_res["results"][0]["provider"] == "Demo Provider"

    mock_loc = {
        "name": "Dubai", "city": "Dubai", "country": "UAE",
        "latitude": 25.2048, "longitude": 55.2708, "display_name": "Dubai"
    }
    htl_res = travel_services.search_hotels(mock_loc, "2026-10-01", "2026-10-05")
    assert htl_res["status"] == "demo_data"
    assert len(htl_res["results"]) > 0
    assert "total_stay_price" in htl_res["results"][0]


def test_budget_optimizer_allocations_and_daily_spending():
    # Test Balanced
    res_balanced = budget_optimizer.optimize_budget(
        total_budget_inr=50000.0,
        travel_style="Balanced",
        duration_days=5,
        travelers_count=2,
        daily_spending_inr=4000.0
    )
    assert res_balanced["travel_style"] == "Balanced"
    assert res_balanced["daily_spending_inr"] == 4000.0
    assert res_balanced["daily_allowance_total_inr"] == 20000.0
    assert len(res_balanced["categories"]) == 5

    # Test Luxury multiplier
    res_luxury = budget_optimizer.optimize_budget(
        total_budget_inr=120000.0,
        travel_style="Luxury",
        duration_days=5,
        travelers_count=2,
        daily_spending_inr=10000.0
    )
    assert res_luxury["travel_style"] == "Luxury"
    stay_cat = next(c for c in res_luxury["categories"] if "Hotel" in c["category"])
    assert stay_cat["percentage"] in [48, 50]


def test_supervisor_agent_parses_natural_requests():
    req1 = supervisor_agent.parse_user_request("Plan a 5-day luxury trip to Dubai for 2 adults under ₹1,20,000")
    assert req1["destination"] == "Dubai"
    assert req1["duration_days"] == 5
    assert req1["travel_style"] == "Luxury"
    assert req1["travelers_count"] == 2
    assert req1["budget_inr"] == 120000.0

    req2 = supervisor_agent.parse_user_request("Find flights from Hyderabad to Paris for 7 days under 1.5 lakh")
    assert req2["origin"] == "Hyderabad"
    assert req2["destination"] == "Paris"
    assert req2["duration_days"] == 7
    assert req2["budget_inr"] == 150000.0


def test_emergency_services_directory():
    emg_in = travel_services.get_emergency_services("IN", "India")
    assert emg_in["police"] == "112 / 100"
    assert emg_in["ambulance"] == "108 / 102"

    emg_ae = travel_services.get_emergency_services("AE", "UAE")
    assert emg_ae["police"] == "999"

    emg_jp = travel_services.get_emergency_services("JP", "Japan")
    assert emg_jp["police"] == "110"


def test_dynamic_pricing_engine():
    insights = travel_services.get_pricing_insights("Dubai", base_price=8000.0)
    assert "recommended_price" in insights
    assert "estimated_revenue_improvement_pct" in insights
    assert insights["recommended_price"] > 0
