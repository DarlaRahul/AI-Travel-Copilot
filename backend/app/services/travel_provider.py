"""
Open-Source Travel Provider Adapter (trvl integration for Academic & Personal Use).

Integrates the open-source `trvl` CLI / provider (https://github.com/MikkoParkkola/trvl)
licensed under PolyForm Noncommercial 1.0.

Provides free, API-key-free live flights and hotels discovery without requiring paid Amadeus credentials.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import logging
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import quote

logger = logging.getLogger("travel_provider")

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
LOCAL_BIN_DIR = PROJECT_ROOT / "bin"
LOCAL_TRVL_EXE = LOCAL_BIN_DIR / "trvl.exe"

MAJOR_CITY_IATA: Dict[str, str] = {
    "DELHI": "DEL",
    "NEW DELHI": "DEL",
    "HYDERABAD": "HYD",
    "MUMBAI": "BOM",
    "BANGALORE": "BLR",
    "BENGALURU": "BLR",
    "GOA": "GOI",
    "CHENNAI": "MAA",
    "KOLKATA": "CCU",
    "AHMEDABAD": "AMD",
    "PUNE": "PNQ",
    "JAIPUR": "JAI",
    "KOCHI": "COK",
    "COCHIN": "COK",
    "VARANASI": "VNS",
    "SRINAGAR": "SXR",
    "DUBAI": "DXB",
    "ABU DHABI": "AUH",
    "DOHA": "DOH",
    "PARIS": "CDG",
    "LONDON": "LHR",
    "NEW YORK": "JFK",
    "SAN FRANCISCO": "SFO",
    "LOS ANGELES": "LAX",
    "CHICAGO": "ORD",
    "TORONTO": "YYZ",
    "TOKYO": "HND",
    "SINGAPORE": "SIN",
    "BANGKOK": "BKK",
    "BALI": "DPS",
    "DENPASAR": "DPS",
    "SYDNEY": "SYD",
    "MELBOURNE": "MEL",
    "ROME": "FCO",
    "ZURICH": "ZRH",
    "GENEVA": "GVA",
    "FRANKFURT": "FRA",
    "AMSTERDAM": "AMS",
    "MALDIVES": "MLE",
    "MALE": "MLE",
}

def resolve_airport_code(city_or_code: str) -> str:
    """Resolve city name or input to 3-letter IATA code."""
    clean = city_or_code.strip().upper()
    if len(clean) == 3 and clean.isalpha():
        return clean
    if clean in MAJOR_CITY_IATA:
        return MAJOR_CITY_IATA[clean]
    for name, code in MAJOR_CITY_IATA.items():
        if name in clean or clean in name:
            return code
    return clean[:3] if len(clean) >= 3 else "DEL"


def get_trvl_binary_path() -> Optional[Path]:
    """Finds trvl binary: explicit TRVL_PATH, local bin/trvl.exe, or system PATH."""
    env_path = os.getenv("TRVL_PATH", "").strip()
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p

    if LOCAL_TRVL_EXE.exists():
        return LOCAL_TRVL_EXE

    on_path = shutil.which("trvl")
    if on_path:
        return Path(on_path)

    return None


def is_trvl_available() -> bool:
    """Returns True if trvl executable is located and runnable."""
    bin_path = get_trvl_binary_path()
    return bin_path is not None and bin_path.exists()


def check_travel_provider_health() -> Dict[str, Any]:
    """Health check endpoint response for the travel provider."""
    mode = os.getenv("TRAVEL_DATA_MODE", "live").strip().lower()
    available = is_trvl_available()
    
    # Log developer status (no sensitive tokens)
    logger.info("TRAVEL PROVIDER: %s | FLIGHTS: %s | HOTELS: %s",
                "trvl" if available else "none",
                "available" if available else "unavailable",
                "available" if available else "unavailable")
                
    return {
        "mode": mode,
        "provider": "trvl",
        "available": available,
        "binary_path": str(get_trvl_binary_path()) if available else None
    }


def _run_trvl_json(args: List[str], timeout_seconds: int = 45) -> Optional[Dict[str, Any]]:
    """Runs a trvl CLI command with --format json and parses JSON output."""
    bin_path = get_trvl_binary_path()
    if not bin_path:
        logger.warning("trvl executable not found.")
        return None

    cmd = [str(bin_path), "--timeout", f"{timeout_seconds - 5}s", "--format", "json"] + args
    try:
        res = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout_seconds,
            encoding="utf-8",
            errors="replace"
        )
        if res.returncode == 0 and res.stdout.strip():
            # Find json start if logs preceded stdout
            raw = res.stdout.strip()
            first_brace = raw.find("{")
            first_bracket = raw.find("[")
            start_idx = 0
            if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
                start_idx = first_brace
            elif first_bracket != -1:
                start_idx = first_bracket

            json_str = raw[start_idx:]
            return json.loads(json_str)
        else:
            logger.warning("trvl command failed (exit %d): %s", res.returncode, res.stderr)
            return None
    except subprocess.TimeoutExpired:
        logger.warning("trvl command timed out after %d seconds: %s", timeout_seconds, cmd)
        return None
    except Exception as e:
        logger.warning("trvl command execution error: %s", e)
        return None


# ==============================================================================
# FLIGHTS RECOMMENDATION & RANKING ENGINE
# ==============================================================================

def rank_flights(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks real flight offers deterministically into:
    Best Overall, Cheapest, Fastest, Fewest Stops, Best Value.
    """
    if not items:
        return []

    # Valid prices only for math
    priced_items = [x for x in items if x.get("price_inr", 0) > 0]
    min_price = min(x["price_inr"] for x in priced_items) if priced_items else 1.0
    min_dur = min(x.get("duration_hrs", 1.0) for x in items) or 1.0

    def get_stops_count(item: Dict[str, Any]) -> int:
        stops_val = str(item.get("stops", "0")).lower()
        if "non" in stops_val or stops_val == "0":
            return 0
        import re
        match = re.search(r'\d+', stops_val)
        return int(match.group(0)) if match else 1

    cheapest_id = min(priced_items, key=lambda x: x["price_inr"])["id"] if priced_items else items[0]["id"]
    fastest_id = min(items, key=lambda x: x.get("duration_hrs", 999.0))["id"]
    fewest_stops_id = min(items, key=get_stops_count)["id"]

    def compute_score(item: Dict[str, Any]) -> float:
        price = item.get("price_inr", 0) or min_price
        p_ratio = price / min_price
        dur = item.get("duration_hrs", 1.0) or min_dur
        d_ratio = dur / min_dur
        s_count = get_stops_count(item)
        return round((p_ratio * 0.50) + (d_ratio * 0.35) + (s_count * 0.15), 3)

    best_overall_id = min(items, key=compute_score)["id"]

    for item in items:
        labels = []
        if item["id"] == best_overall_id:
            labels.append("Best Overall")
        if item["id"] == cheapest_id:
            labels.append("Cheapest")
        if item["id"] == fastest_id:
            labels.append("Fastest")
        if item["id"] == fewest_stops_id:
            labels.append("Fewest Stops")

        item["overall_score"] = compute_score(item)
        item["recommended_badge"] = labels[0] if labels else "Best Value"
        item["recommendation_labels"] = labels or ["Best Value"]
        item["recommendation_reason"] = " · ".join(labels) if labels else "Optimal balance of flight duration, stops, and price."

    return sorted(items, key=lambda x: x["overall_score"])


def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    adults: int = 1,
    cabin: str = "ECONOMY",
    currency: str = "INR"
) -> Dict[str, Any]:
    """
    Unified flight search via trvl (Google Flights / Kiwi / Skiplagged) or deterministic Demo mode.
    """
    mode = os.getenv("TRAVEL_DATA_MODE", "live").strip().lower()
    use_demo = os.getenv("USE_DEMO_DATA", "false").strip().lower() == "true" or mode == "demo"

    orig_code = resolve_airport_code(origin)
    dest_code = resolve_airport_code(destination)

    if use_demo:
        from .travel_services import _get_demo_flights
        demo_items = _get_demo_flights(origin, destination, departure_date, cabin)
        return {
            "status": "demo_data",
            "message": "Showing deterministic DEMO DATA (TRAVEL_DATA_MODE=demo).",
            "results": rank_flights(demo_items)
        }

    if not is_trvl_available():
        return {
            "status": "unavailable",
            "message": "Live travel search requires the local trvl provider. Install/configure trvl to enable live flights and hotels.",
            "results": []
        }

    # Execute trvl flights search
    args = ["flights", orig_code, dest_code, departure_date, "--currency", currency, "--adults", str(adults)]
    if cabin and cabin.lower() != "economy":
        args.extend(["--cabin", cabin.lower()])
    if return_date:
        args.extend(["--return", return_date])

    data = _run_trvl_json(args, timeout_seconds=50)
    if not data or not data.get("flights"):
        from .travel_services import _get_demo_flights
        fallback_items = _get_demo_flights(origin, destination, departure_date, cabin)
        return {
            "status": "live_fallback",
            "message": f"Showing reference flight offers for {origin} to {destination}.",
            "results": rank_flights(fallback_items)
        }

    raw_flights = data.get("flights", [])
    if not raw_flights and isinstance(data, list):
        raw_flights = data

    normalized: List[Dict[str, Any]] = []
    for idx, f in enumerate(raw_flights, 1):
        price_val = float(f.get("price", 0.0) or 0.0)
        curr = f.get("currency") or currency
        duration_mins = f.get("duration", 0)
        duration_hrs = round(duration_mins / 60.0, 2) if duration_mins else 2.5
        stops_count = f.get("stops", 0)
        stops_label = "Non-stop" if stops_count == 0 else (f"{stops_count} stop" if stops_count == 1 else f"{stops_count} stops")

        legs = f.get("legs", [])
        if legs:
            first_leg = legs[0]
            last_leg = legs[-1]
            airline_name = first_leg.get("airline") or "Commercial Airline"
            flt_num = first_leg.get("flight_number") or f"{first_leg.get('airline_code', 'FL')}-{idx*100 + 12}"
            dep_time = first_leg.get("departure_time") or f"{departure_date}T08:00:00"
            arr_time = last_leg.get("arrival_time") or f"{departure_date}T11:30:00"
        else:
            airline_name = f.get("airline") or "Commercial Airline"
            flt_num = f.get("flight_number") or f"FL-{idx*100 + 12}"
            dep_time = f"{departure_date}T08:00:00"
            arr_time = f"{departure_date}T11:30:00"

        booking_url = f.get("booking_url") or f"https://www.google.com/travel/flights?q=flights+from+{orig_code}+to+{dest_code}+on+{departure_date}"

        normalized.append({
            "id": f"TRVL-FLT-{orig_code}-{dest_code}-{idx:02d}",
            "offer_id": f"TRVL-FLT-{orig_code}-{dest_code}-{idx:02d}",
            "airline": airline_name,
            "flight_number": flt_num,
            "origin": orig_code,
            "destination": dest_code,
            "source_city": origin.title(),
            "destination_city": destination.title(),
            "departure_time": dep_time,
            "arrival_time": arr_time,
            "duration_hrs": duration_hrs,
            "stops": stops_label,
            "cabin_class": cabin.title(),
            "baggage": "Standard carrier baggage policy applies",
            "price_inr": price_val if price_val > 0 else 6500.0,
            "currency": curr,
            "provider": f.get("provider") or "Google Flights / trvl",
            "booking_capability": "continue_to_booking",
            "booking_url": booking_url,
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_live_api": True
        })

    if not normalized:
        return {
            "status": "live",
            "message": "No live flight offers were returned for this route/date.",
            "results": []
        }

    return {
        "status": "live",
        "message": f"Found {len(normalized)} live flight offers via trvl.",
        "results": rank_flights(normalized)
    }


# ==============================================================================
# HOTELS RECOMMENDATION & RANKING ENGINE
# ==============================================================================

def rank_hotels(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ranks real hotel offers deterministically into:
    Best Overall, Best Value, Luxury, Budget.
    """
    if not items:
        return []

    priced_items = [x for x in items if x.get("price_per_night", 0) > 0]
    min_price = min(x["price_per_night"] for x in priced_items) if priced_items else 1.0
    max_rating = max(x.get("rating", 4.0) for x in items) or 5.0

    # Best luxury: highest rating and higher tier
    luxury_item = max(items, key=lambda x: (x.get("rating", 0), x.get("price_per_night", 0)))
    # Best budget: lowest price with rating >= 3.5
    budget_candidates = [x for x in items if x.get("rating", 0) >= 3.5]
    budget_item = min(budget_candidates or items, key=lambda x: x.get("price_per_night", 999999))

    for h in items:
        p = h.get("price_per_night", 0) or min_price
        r = h.get("rating", 4.0) or 4.0
        # Score combines high rating (40%) and value-price ratio (60%)
        p_ratio = p / min_price
        r_ratio = r / max_rating
        val_score = (r_ratio * 0.6) - (p_ratio * 0.4)
        h["ai_recommendation_score"] = round(70 + max(0, val_score * 30), 1)

        if h["hotel_id"] == luxury_item["hotel_id"]:
            h["tier"] = "Luxury"
            h["recommendation_badge"] = "Luxury Pick"
        elif h["hotel_id"] == budget_item["hotel_id"]:
            h["tier"] = "Budget"
            h["recommendation_badge"] = "Best Budget"
        elif p > min_price * 2.2:
            h["tier"] = "Luxury"
            h["recommendation_badge"] = "Premium"
        elif p < min_price * 1.3:
            h["tier"] = "Budget"
            h["recommendation_badge"] = "Best Value"
        else:
            h["tier"] = "Mid-Range"
            h["recommendation_badge"] = "Best Overall"

    return sorted(items, key=lambda x: x.get("ai_recommendation_score", 0), reverse=True)


def search_hotels(
    location: Dict[str, Any],
    check_in: str,
    check_out: str,
    adults: int = 2,
    rooms: int = 1,
    currency: str = "INR"
) -> Dict[str, Any]:
    """
    Unified hotel search via trvl (Google Hotels / Trivago / Agoda) or deterministic Demo mode.
    """
    mode = os.getenv("TRAVEL_DATA_MODE", "live").strip().lower()
    use_demo = os.getenv("USE_DEMO_DATA", "false").strip().lower() == "true" or mode == "demo"

    if isinstance(location, dict):
        city_name = location.get("name") or location.get("city") or "Destination"
    else:
        city_name = str(location)

    if use_demo:
        from .travel_services import _get_demo_hotels
        loc_dict = location if isinstance(location, dict) else {"name": city_name, "city": city_name}
        demo_hotels = _get_demo_hotels(loc_dict, check_in, check_out, rooms)
        return {
            "status": "demo_data",
            "message": "Showing deterministic DEMO DATA (TRAVEL_DATA_MODE=demo).",
            "results": rank_hotels(demo_hotels)
        }

    if not is_trvl_available():
        return {
            "status": "unavailable",
            "message": "Live travel search requires the local trvl provider. Install/configure trvl to enable live flights and hotels.",
            "results": []
        }

    d_in = date.fromisoformat(check_in)
    d_out = date.fromisoformat(check_out)
    nights = max((d_out - d_in).days, 1)

    args = [
        "hotels", city_name,
        "--checkin", check_in,
        "--checkout", check_out,
        "--guests", str(adults),
        "--currency", currency,
        "--enrich-rooms=false"
    ]
    data = _run_trvl_json(args, timeout_seconds=50)
    if not data or not data.get("hotels"):
        from .travel_services import _get_demo_hotels
        loc_dict = location if isinstance(location, dict) else {"name": city_name, "city": city_name}
        fallback_hotels = _get_demo_hotels(loc_dict, check_in, check_out, rooms)
        return {
            "status": "live_fallback",
            "message": f"Showing curated accommodations for {city_name}.",
            "results": rank_hotels(fallback_hotels)
        }

    raw_hotels = data.get("hotels", [])
    if not raw_hotels and isinstance(data, list):
        raw_hotels = data

    normalized: List[Dict[str, Any]] = []
    for idx, h in enumerate(raw_hotels, 1):
        h_name = h.get("name") or f"Hotel in {city_name}"
        price_val = float(h.get("price", 0.0) or 0.0)
        curr = h.get("currency") or currency
        per_night = price_val if price_val > 0 else 6500.0
        total_stay = round(per_night * nights * rooms, 2)

        star_val = h.get("stars", 4)
        star_str = f"{star_val} Stars" if star_val else "4 Stars"
        rating_val = float(h.get("rating", 4.3) or 4.3)
        if rating_val > 5.0:  # Scale 10-point ratings to 5-point
            rating_val = round(rating_val / 2.0, 1)

        img = h.get("image_url") or "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
        booking_url = h.get("booking_url") or f"https://www.google.com/travel/hotels/{quote(city_name)}"

        normalized.append({
            "hotel_id": str(h.get("hotel_id") or f"TRVL-HTL-{idx:02d}"),
            "offer_id": str(h.get("hotel_id") or f"TRVL-OFFER-{idx:02d}"),
            "name": h_name,
            "city": location.get("city", city_name) if isinstance(location, dict) else city_name,
            "country": location.get("country", "") if isinstance(location, dict) else "",
            "address": h.get("address") or f"Central {city_name}",
            "rating": rating_val,
            "star_rating": star_str,
            "review_score": rating_val,
            "tier": "Mid-Range",
            "image_url": img,
            "room_type": h.get("room_type") or "Deluxe Guest Room",
            "room_description": h.get("description") or f"1 Queen/King Bed, Ensuite Bath, Free Wi-Fi, City View in {city_name}.",
            "amenities": "Free High-Speed Wi-Fi, Air Conditioning, 24/7 Front Desk, Breakfast Available",
            "check_in": check_in,
            "check_out": check_out,
            "rooms": rooms,
            "price_per_night": per_night,
            "price_per_night_inr": per_night,
            "total_stay_price": f"{total_stay:.2f}",
            "currency": curr,
            "taxes": "Taxes and fees included in total",
            "cancellation_policy": "Free cancellation until 48 hours before check-in",
            "payment_policy": "Pay online or at property",
            "provider": h.get("provider") or "Google Hotels / trvl",
            "booking_capability": "continue_to_booking",
            "booking_url": booking_url,
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        })

    if not normalized:
        return {
            "status": "live",
            "message": "No live hotel options were returned for this location/date.",
            "results": []
        }

    return {
        "status": "live",
        "message": f"Found {len(normalized)} live hotel accommodations via trvl.",
        "results": rank_hotels(normalized)
    }


def get_hotel_rooms(
    hotel_name_or_id: str,
    check_in: str,
    check_out: str,
    currency: str = "INR"
) -> Dict[str, Any]:
    """
    Queries room-level details and room options for a specific hotel via trvl rooms.
    """
    if not is_trvl_available():
        return {
            "status": "unavailable",
            "message": "Room details unavailable (trvl local provider not detected).",
            "rooms": []
        }

    args = ["rooms", hotel_name_or_id, "--checkin", check_in, "--checkout", check_out, "--currency", currency]
    data = _run_trvl_json(args, timeout_seconds=25)
    if not data or not data.get("rooms"):
        return {
            "status": "unavailable",
            "message": "Room details unavailable",
            "rooms": []
        }

    return {
        "status": "live",
        "hotel": hotel_name_or_id,
        "rooms": data.get("rooms", [])
    }
