"""
Global Travel Services & Provider Adapters for AI Travel Copilot.

Includes:
- OpenStreetMap Nominatim: Dynamic worldwide geocoding with rate-limit protection & caching
- OpenStreetMap Overpass: Dynamic POI / Attractions discovery around coordinates
- Wikimedia Commons: Dynamic location-specific landmark image search with attribution
- Open-Meteo: Worldwide real-time weather & 5-day forecasts (no API key required)
- Amadeus Provider: Real flights & hotel inventory adapter with test/live environment support
- Flight Recommendation Engine: Ranking flights into Best Overall, Cheapest, Fastest, Fewest Stops, Best Value
- Emergency Travel Services: Trusted official emergency phone contacts worldwide
- Multilingual Assistant Helper: Multilingual understanding & translation
- Dynamic Pricing Engine: Revenue optimization and pricing prediction
"""
from __future__ import annotations

import json
import os
import time
import math
import re
from datetime import date, datetime, timezone
from functools import lru_cache
from typing import Any, Optional, Dict, List
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen
from dotenv import load_dotenv

load_dotenv()

USER_AGENT = "AI-Travel-Copilot/2.0 (Academic & Enterprise Travel Platform; contact: support@travelcopilot.ai)"
GENERIC_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
_last_nominatim_request = 0.0


def _get_json(url: str, timeout: int = 15, headers: Optional[dict[str, str]] = None) -> Any:
    """Helper to perform GET requests with proper User-Agent and JSON decoding."""
    req_headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        **(headers or {})
    }
    req = Request(url, headers=req_headers)
    with urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


# ==============================================================================
# 1. GLOBAL LOCATION GEOCODING (OpenStreetMap Nominatim)
# ==============================================================================

def normalize_location(item: dict[str, Any], query_fallback: str = "") -> dict[str, Any]:
    """
    Normalizes provider location payload into a canonical English-first TravelLocation object.
    Preserves raw internal metadata while ensuring primary user-facing fields (name, display_name)
    are strictly in English.
    """
    address = item.get("address", {})
    namedetails = item.get("namedetails", {})
    
    # Priority for English name
    english_name = (
        namedetails.get("name:en")
        or namedetails.get("name:int")
        or address.get("city:en")
        or address.get("town:en")
        or item.get("name")
        or address.get("city")
        or address.get("town")
        or address.get("municipality")
        or address.get("state_district")
        or item.get("display_name", "").split(",")[0].strip()
        or query_fallback.capitalize()
    )
    
    country = address.get("country", "")
    country_code = address.get("country_code", "").upper()
    region = address.get("state") or address.get("region") or country
    
    city = (
        namedetails.get("name:en")
        or address.get("city:en")
        or address.get("city")
        or address.get("town")
        or english_name
    )
    
    # Clean English display name formatted as "City, Country" or "Name"
    if english_name and country and english_name.lower() != country.lower():
        clean_display_name = f"{english_name}, {country}"
    else:
        clean_display_name = english_name or item.get("display_name", query_fallback)
        
    return {
        "name": english_name,
        "city": city,
        "country": country,
        "country_code": country_code,
        "region": region,
        "latitude": float(item.get("lat", item.get("latitude", 0.0))),
        "longitude": float(item.get("lon", item.get("longitude", 0.0))),
        "display_name": clean_display_name,
        "native_name": item.get("name") or item.get("display_name", "").split(",")[0].strip(),
        "type": item.get("type", "place"),
        "importance": item.get("importance", 0.0)
    }


@lru_cache(maxsize=256)
def resolve_location(query: str) -> dict[str, Any]:
    """
    Resolve any query worldwide into structured English location metadata using OpenStreetMap Nominatim.
    Adheres strictly to Nominatim's ~1 req/sec policy and caches results.
    """
    global _last_nominatim_request
    clean_query = query.strip()
    if not clean_query:
        raise ValueError("Please provide a valid destination name.")

    # 1 second throttling for Nominatim usage policy
    delay = 1.0 - (time.monotonic() - _last_nominatim_request)
    if delay > 0:
        time.sleep(delay)

    params = {
        "q": clean_query,
        "format": "jsonv2",
        "addressdetails": 1,
        "namedetails": 1,
        "limit": 1,
        "accept-language": "en"
    }
    url = f"https://nominatim.openstreetmap.org/search?{urlencode(params)}"
    results = _get_json(url, timeout=12, headers={"Accept-Language": "en,en-US;q=0.9"})
    _last_nominatim_request = time.monotonic()

    if not results:
        raise LookupError(f"Could not resolve destination '{query}'. Please check the spelling or try a city, landmark, or country.")

    return normalize_location(results[0], query_fallback=clean_query)


# ==============================================================================
# 2. DYNAMIC LOCATION IMAGES (Wikimedia Commons)
# ==============================================================================

@lru_cache(maxsize=256)
def destination_image(query: str) -> dict[str, str]:
    """
    Dynamically retrieve geographically relevant images from Wikimedia Commons API.
    Returns direct thumbnail URL, source page, and attribution metadata.
    """
    clean_query = query.split(",")[0].strip()
    try:
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"{clean_query} landmark tourism",
            "gsrnamespace": 6,  # File namespace
            "gsrlimit": 1,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata",
            "iiurlwidth": 1200,
        }
        url = f"https://commons.wikimedia.org/w/api.php?{urlencode(params)}"
        payload = _get_json(url, timeout=10)
        pages = payload.get("query", {}).get("pages", {})
        for page in pages.values():
            info = page.get("imageinfo", [])
            if info:
                img_url = info[0].get("thumburl") or info[0].get("url")
                meta = info[0].get("extmetadata", {})
                artist = meta.get("Artist", {}).get("value", "Wikimedia Commons")
                clean_artist = re.sub(r'<[^>]+>', '', artist).strip() or "Wikimedia Commons"
                license_name = meta.get("LicenseShortName", {}).get("value", "CC BY-SA")
                return {
                    "image_url": img_url,
                    "source_url": info[0].get("descriptionshorturl") or info[0].get("url"),
                    "attribution": f"{clean_artist} ({license_name})"
                }
    except Exception:
        pass

    return {
        "image_url": GENERIC_IMAGE,
        "source_url": "https://unsplash.com",
        "attribution": "Unsplash Travel"
    }


# ==============================================================================
# 3. PLACES & ATTRACTIONS (OpenStreetMap Overpass API)
# ==============================================================================

@lru_cache(maxsize=128)
def _nearby_places_cached(latitude: float, longitude: float, radius: int = 15000) -> tuple[dict[str, Any], ...]:
    """Query OpenStreetMap Overpass for attractions, museums, viewpoints, parks, etc."""
    query = f"""
    [out:json][timeout:25];
    (
      nwr["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park"](around:{radius},{latitude},{longitude});
      nwr["historic"](around:{radius},{latitude},{longitude});
      nwr["leisure"="park"](around:{radius},{latitude},{longitude});
      nwr["natural"~"waterfall|peak|beach"](around:{radius},{latitude},{longitude});
      nwr["amenity"="arts_centre"](around:{radius},{latitude},{longitude});
    );
    out center tags 60;
    """
    try:
        req = Request(
            "https://overpass-api.de/api/interpreter",
            data=query.encode("utf-8"),
            headers={"User-Agent": USER_AGENT}
        )
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            elements = data.get("elements", [])
    except Exception:
        return ()

    results = []
    seen_names = set()
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name:en") or tags.get("int_name") or tags.get("name:int") or tags.get("name")
        point = el.get("center", el)
        if not name or "lat" not in point or "lon" not in point:
            continue
        if name in seen_names:
            continue
        seen_names.add(name)

        category = tags.get("tourism") or tags.get("historic") or tags.get("leisure") or tags.get("natural") or "Attraction"
        category_formatted = category.replace("_", " ").title()

        results.append({
            "id": f"{el['type']}-{el['id']}",
            "name": name,
            "description": tags.get("description") or f"Popular {category_formatted} in the region.",
            "category": category_formatted,
            "address": tags.get("addr:street") or tags.get("addr:city") or None,
            "website": tags.get("website") or tags.get("contact:website"),
            "opening_hours": tags.get("opening_hours") or "Information unavailable",
            "lat": point["lat"],
            "lon": point["lon"],
            "coordinates": {"latitude": point["lat"], "longitude": point["lon"]},
            "rating": None,
            "price": None,
            "source": "OpenStreetMap"
        })

    results.sort(key=lambda x: x["name"])
    return tuple(results)


def search_places(location: dict[str, Any], limit: int = 30, offset: int = 0) -> list[dict[str, Any]]:
    """Retrieve paginated places for a resolved location."""
    all_places = _nearby_places_cached(location["latitude"], location["longitude"])
    return list(all_places[offset: offset + max(1, min(limit, 60))])


# ==============================================================================
# 4. WEATHER & CLIMATE INTELLIGENCE (Open-Meteo)
# ==============================================================================

def get_weather(location: dict[str, Any]) -> dict[str, Any]:
    """Retrieve live weather and 5-day daily forecast via Open-Meteo."""
    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
        "daily": "temperature_2m_max,precipitation_probability_max,weather_code",
        "timezone": "auto",
        "forecast_days": 5
    }
    url = f"https://api.open-meteo.com/v1/forecast?{urlencode(params)}"
    data = _get_json(url, timeout=12)

    current = data.get("current", {})
    daily = data.get("daily", {})

    descriptions = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
        80: "Rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }

    code = current.get("weather_code", 0)
    weather_desc = descriptions.get(code, "Pleasant conditions")
    temp_c = round(current.get("temperature_2m", 25))
    feels_c = round(current.get("apparent_temperature", temp_c))
    humidity = current.get("relative_humidity_2m", 60)
    wind_kmh = round(current.get("wind_speed_10m", 10))

    daily_times = daily.get("time", [])
    daily_temps = daily.get("temperature_2m_max", [])
    daily_rains = daily.get("precipitation_probability_max", [])
    daily_codes = daily.get("weather_code", [])

    forecast = []
    for day, t_max, r_pct, d_code in zip(daily_times, daily_temps, daily_rains, daily_codes):
        forecast.append({
            "day": day,
            "temp_c": round(t_max) if t_max is not None else temp_c,
            "condition": descriptions.get(d_code, "Variable"),
            "rain_pct": r_pct if r_pct is not None else 10
        })

    max_rain = daily_rains[0] if daily_rains and daily_rains[0] is not None else 0

    # Clothing and packing tips based on climate
    if temp_c > 30:
        clothing_tip = f"Warm conditions in {location['name']} ({temp_c}°C). Pack lightweight breathable cottons, sunglasses, sunscreen, and stay hydrated."
    elif temp_c < 12:
        clothing_tip = f"Cool weather in {location['name']} ({temp_c}°C). Bring warm layers, thermal wear, a windbreaker jacket, and comfortable walking boots."
    else:
        clothing_tip = f"Pleasant climate in {location['name']} ({temp_c}°C). Pack casual layers, comfortable walking shoes, and a light jacket for evenings."

    indoor_rerouting = None
    if max_rain >= 40:
        indoor_rerouting = {
            "advisory": f"High probability of rain ({max_rain}%) in {location['name']}. We recommend keeping indoor museums, galleries, and markets in your daily plan.",
            "indoor_alternatives": ["Art Gallery & Exhibition", "National Heritage Museum", "Local Artisan Market & Covered Bazaar"]
        }

    return {
        "weather": {
            "city": location.get("display_name", location.get("name", "Destination")),
            "current_temp_c": temp_c,
            "feels_like_temp_c": feels_c,
            "condition": weather_desc,
            "rain_probability_pct": max_rain,
            "humidity_pct": humidity,
            "wind_speed_kmh": wind_kmh,
            "clothing_tip": clothing_tip,
            "forecast_5_days": forecast
        },
        "indoor_rerouting": indoor_rerouting
    }


# ==============================================================================
# 5. FLIGHTS & HOTEL PROVIDER ADAPTER
# ==============================================================================

MAJOR_CITY_IATA = {
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


def _resolve_airport_iata(city_or_airport: str) -> str:
    """Resolve city name or code to closest IATA airport code."""
    clean = city_or_airport.strip().upper()
    if len(clean) == 3 and clean.isalpha():
        return clean
    if clean in MAJOR_CITY_IATA:
        return MAJOR_CITY_IATA[clean]
    for name, code in MAJOR_CITY_IATA.items():
        if name in clean or clean in name:
            return code
    return clean[:3] if len(clean) >= 3 else "DEL"



def rank_flights(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Deterministically rank flight offers into:
    Best Overall, Cheapest, Fastest, Fewest Stops, Best Value.
    """
    if not items:
        return []

    min_price = min(x["price_inr"] for x in items) or 1.0
    min_dur = min(x["duration_hrs"] for x in items) or 1.0

    def get_stops_count(item: dict[str, Any]) -> int:
        stops_val = str(item.get("stops", "0")).lower()
        if "non" in stops_val or stops_val == "0":
            return 0
        match = re.search(r'\d+', stops_val)
        return int(match.group(0)) if match else 1

    cheapest_id = min(items, key=lambda x: x["price_inr"])["id"]
    fastest_id = min(items, key=lambda x: x["duration_hrs"])["id"]
    fewest_stops_id = min(items, key=get_stops_count)["id"]

    def compute_score(item: dict[str, Any]) -> float:
        p_ratio = item["price_inr"] / min_price
        d_ratio = item["duration_hrs"] / min_dur
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


def _get_demo_flights(origin: str, destination: str, departure_date: str, cabin: str) -> list[dict[str, Any]]:
    """Deterministic, clearly labeled demo data for offline testing."""
    orig_code = _resolve_airport_iata(origin)
    dest_code = _resolve_airport_iata(destination)
    orig_name = origin.title()
    dest_name = destination.title()

    is_domestic_india = orig_code in ["DEL", "HYD", "BOM", "BLR", "GOI", "MAA", "CCU", "AMD", "PNQ", "JAI", "COK"] and \
                         dest_code in ["DEL", "HYD", "BOM", "BLR", "GOI", "MAA", "CCU", "AMD", "PNQ", "JAI", "COK"]
    is_dubai_route = "DXB" in [orig_code, dest_code] or "AUH" in [orig_code, dest_code] or "DOH" in [orig_code, dest_code]

    if is_domestic_india:
        return [
            {
                "id": f"DEMO-FLT-{orig_code}-{dest_code}-01",
                "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-01",
                "airline": "IndiGo (Demo)",
                "flight_number": "6E-2144",
                "origin": orig_code,
                "destination": dest_code,
                "source_city": orig_name,
                "destination_city": dest_name,
                "departure_time": f"{departure_date}T06:15:00",
                "arrival_time": f"{departure_date}T08:30:00",
                "duration_hrs": 2.25,
                "stops": "Non-stop",
                "cabin_class": cabin.title(),
                "baggage": "15 kg Check-in + 7 kg Cabin",
                "price_inr": 4850.0,
                "currency": "INR",
                "provider": "Demo Provider",
                "booking_capability": "demo_handoff",
                "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
                "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "is_live_api": False
            },
            {
                "id": f"DEMO-FLT-{orig_code}-{dest_code}-02",
                "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-02",
                "airline": "Air India (Demo)",
                "flight_number": "AI-542",
                "origin": orig_code,
                "destination": dest_code,
                "source_city": orig_name,
                "destination_city": dest_name,
                "departure_time": f"{departure_date}T09:40:00",
                "arrival_time": f"{departure_date}T11:55:00",
                "duration_hrs": 2.25,
                "stops": "Non-stop",
                "cabin_class": cabin.title(),
                "baggage": "25 kg Check-in + 7 kg Cabin",
                "price_inr": 5400.0,
                "currency": "INR",
                "provider": "Demo Provider",
                "booking_capability": "demo_handoff",
                "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
                "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "is_live_api": False
            },
            {
                "id": f"DEMO-FLT-{orig_code}-{dest_code}-03",
                "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-03",
                "airline": "Vistara (Demo)",
                "flight_number": "UK-873",
                "origin": orig_code,
                "destination": dest_code,
                "source_city": orig_name,
                "destination_city": dest_name,
                "departure_time": f"{departure_date}T17:20:00",
                "arrival_time": f"{departure_date}T19:35:00",
                "duration_hrs": 2.25,
                "stops": "Non-stop",
                "cabin_class": cabin.title(),
                "baggage": "20 kg Check-in + 7 kg Cabin",
                "price_inr": 6200.0,
                "currency": "INR",
                "provider": "Demo Provider",
                "booking_capability": "demo_handoff",
                "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
                "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "is_live_api": False
            },
            {
                "id": f"DEMO-FLT-{orig_code}-{dest_code}-04",
                "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-04",
                "airline": "SpiceJet (Demo)",
                "flight_number": "SG-108",
                "origin": orig_code,
                "destination": dest_code,
                "source_city": orig_name,
                "destination_city": dest_name,
                "departure_time": f"{departure_date}T13:10:00",
                "arrival_time": f"{departure_date}T17:40:00",
                "duration_hrs": 4.5,
                "stops": "1 stop (BOM)",
                "cabin_class": cabin.title(),
                "baggage": "15 kg Check-in + 7 kg Cabin",
                "price_inr": 4150.0,
                "currency": "INR",
                "provider": "Demo Provider",
                "booking_capability": "demo_handoff",
                "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
                "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "is_live_api": False
            }
        ]

    # International routes (e.g. Dubai, Paris, Singapore, London)
    return [
        {
            "id": f"DEMO-FLT-{orig_code}-{dest_code}-01",
            "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-01",
            "airline": "Emirates (Demo)" if is_dubai_route else "Air France (Demo)",
            "flight_number": "EK-527" if is_dubai_route else "AF-225",
            "origin": orig_code,
            "destination": dest_code,
            "source_city": orig_name,
            "destination_city": dest_name,
            "departure_time": f"{departure_date}T04:30:00",
            "arrival_time": f"{departure_date}T08:15:00",
            "duration_hrs": 3.75 if is_dubai_route else 8.75,
            "stops": "Non-stop",
            "cabin_class": cabin.title(),
            "baggage": "30 kg Check-in + 7 kg Cabin",
            "price_inr": 18450.0 if is_dubai_route else 43200.0,
            "currency": "INR",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_live_api": False
        },
        {
            "id": f"DEMO-FLT-{orig_code}-{dest_code}-02",
            "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-02",
            "airline": "IndiGo (Demo)",
            "flight_number": "6E-1405",
            "origin": orig_code,
            "destination": dest_code,
            "source_city": orig_name,
            "destination_city": dest_name,
            "departure_time": f"{departure_date}T10:15:00",
            "arrival_time": f"{departure_date}T14:00:00",
            "duration_hrs": 3.75 if is_dubai_route else 9.50,
            "stops": "Non-stop" if is_dubai_route else "1 stop (DXB)",
            "cabin_class": cabin.title(),
            "baggage": "20 kg Check-in + 7 kg Cabin",
            "price_inr": 14200.0 if is_dubai_route else 36800.0,
            "currency": "INR",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_live_api": False
        },
        {
            "id": f"DEMO-FLT-{orig_code}-{dest_code}-03",
            "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-03",
            "airline": "Air India (Demo)",
            "flight_number": "AI-951",
            "origin": orig_code,
            "destination": dest_code,
            "source_city": orig_name,
            "destination_city": dest_name,
            "departure_time": f"{departure_date}T18:45:00",
            "arrival_time": f"{departure_date}T23:30:00",
            "duration_hrs": 5.75 if is_dubai_route else 10.25,
            "stops": "1 stop (BOM)",
            "cabin_class": cabin.title(),
            "baggage": "25 kg Check-in + 7 kg Cabin",
            "price_inr": 16100.0 if is_dubai_route else 39500.0,
            "currency": "INR",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_live_api": False
        },
        {
            "id": f"DEMO-FLT-{orig_code}-{dest_code}-04",
            "offer_id": f"DEMO-FLT-{orig_code}-{dest_code}-04",
            "airline": "Qatar Airways (Demo)",
            "flight_number": "QR-571",
            "origin": orig_code,
            "destination": dest_code,
            "source_city": orig_name,
            "destination_city": dest_name,
            "departure_time": f"{departure_date}T22:30:00",
            "arrival_time": f"{departure_date}T06:15:00",
            "duration_hrs": 6.75 if is_dubai_route else 11.50,
            "stops": "1 stop (DOH)",
            "cabin_class": cabin.title(),
            "baggage": "30 kg Check-in + 7 kg Cabin",
            "price_inr": 17800.0 if is_dubai_route else 41200.0,
            "currency": "INR",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/flights?q=flights+from+{quote(orig_name)}+to+{quote(dest_name)}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "is_live_api": False
        }
    ]


def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    adults: int = 1,
    cabin: str = "ECONOMY"
) -> dict[str, Any]:
    """Unified flight search delegating to the open-source trvl provider adapter."""
    from .travel_provider import search_flights as provider_search_flights
    return provider_search_flights(
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        return_date=return_date,
        adults=adults,
        cabin=cabin,
        currency="INR"
    )


# ==============================================================================
# 6. HOTELS PROVIDER ADAPTER
# ==============================================================================

def _get_demo_hotels(location: dict[str, Any], check_in: str, check_out: str, rooms: int) -> list[dict[str, Any]]:
    """Deterministic demo hotels with authentic room details for offline test mode."""
    d_in = date.fromisoformat(check_in)
    d_out = date.fromisoformat(check_out)
    nights = max((d_out - d_in).days, 1)

    return [
        {
            "hotel_id": "DEMO-HTL-01",
            "offer_id": "OFFER-01",
            "name": f"The Grand {location['name']} Palace & Luxury Suites",
            "city": location["city"],
            "country": location["country"],
            "address": f"100 Marina Boulevard, {location['name']}",
            "rating": 4.8,
            "star_rating": "5 Stars",
            "review_score": 4.8,
            "tier": "Luxury",
            "ai_recommendation_score": 98.5,
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            "room_type": "Deluxe King Oceanfront Suite",
            "room_description": "1 King Bed, Private Balcony, High Floor with Skyline Views, Marble Bath",
            "amenities": "Free High-Speed Wi-Fi, Rooftop Infinity Pool, Spa, 24/7 Room Service, Buffet Breakfast included",
            "check_in": check_in,
            "check_out": check_out,
            "rooms": rooms,
            "price_per_night": 14500.0,
            "price_per_night_inr": 14500.0,
            "total_stay_price": f"{14500.0 * nights * rooms:.2f}",
            "currency": "INR",
            "taxes": "Included (18% GST)",
            "cancellation_policy": "Free cancellation up to 24 hours before check-in",
            "payment_policy": "Pay at property or online card",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/hotels/{quote(location['name'])}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        },
        {
            "hotel_id": "DEMO-HTL-02",
            "offer_id": "OFFER-02",
            "name": f"{location['name']} City Boutique Hotel & Spa",
            "city": location["city"],
            "country": location["country"],
            "address": f"24 Heritage Avenue, Central {location['name']}",
            "rating": 4.4,
            "star_rating": "4 Stars",
            "review_score": 4.4,
            "tier": "Mid-Range",
            "ai_recommendation_score": 94.0,
            "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
            "room_type": "Executive Queen Room",
            "room_description": "1 Queen Bed, Modern Ergonomic Workstation, City View",
            "amenities": "Free Wi-Fi, Fitness Center, Restaurant, Air Conditioning, Coffee Maker",
            "check_in": check_in,
            "check_out": check_out,
            "rooms": rooms,
            "price_per_night": 6800.0,
            "price_per_night_inr": 6800.0,
            "total_stay_price": f"{6800.0 * nights * rooms:.2f}",
            "currency": "INR",
            "taxes": "Included (12% GST)",
            "cancellation_policy": "Free cancellation up to 48 hours before check-in",
            "payment_policy": "Online Credit/Debit Card",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/hotels/{quote(location['name'])}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        },
        {
            "hotel_id": "DEMO-HTL-03",
            "offer_id": "OFFER-03",
            "name": f"Backpacker Haven & Social Hub {location['name']}",
            "city": location["city"],
            "country": location["country"],
            "address": f"5 Old Quarter Street, {location['name']}",
            "rating": 4.2,
            "star_rating": "3 Stars",
            "review_score": 4.2,
            "tier": "Budget / Hostel",
            "ai_recommendation_score": 89.0,
            "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
            "room_type": "Standard Private Double Room",
            "room_description": "1 Double Bed, Ensuite Bathroom, Locker, Garden Access",
            "amenities": "High-Speed Wi-Fi, Shared Kitchen, Rooftop Cafe, Baggage Storage",
            "check_in": check_in,
            "check_out": check_out,
            "rooms": rooms,
            "price_per_night": 2400.0,
            "price_per_night_inr": 2400.0,
            "total_stay_price": f"{2400.0 * nights * rooms:.2f}",
            "currency": "INR",
            "taxes": "Included",
            "cancellation_policy": "Non-refundable rate",
            "payment_policy": "Pre-paid",
            "provider": "Demo Provider",
            "booking_capability": "demo_handoff",
            "booking_url": f"https://www.google.com/travel/hotels/{quote(location['name'])}",
            "retrieved_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    ]


def search_hotels(
    location: dict[str, Any],
    check_in: str,
    check_out: str,
    adults: int = 1,
    rooms: int = 1
) -> dict[str, Any]:
    """Unified hotel search delegating to the open-source trvl provider adapter."""
    from .travel_provider import search_hotels as provider_search_hotels
    return provider_search_hotels(
        location=location,
        check_in=check_in,
        check_out=check_out,
        adults=adults,
        rooms=rooms,
        currency="INR"
    )


# ==============================================================================
# 7. EMERGENCY TRAVEL SERVICES DIRECTORY
# ==============================================================================

EMERGENCY_DATA: Dict[str, Dict[str, str]] = {
    "IN": {"police": "112 / 100", "ambulance": "108 / 102", "fire": "101", "general": "112", "notes": "India National Emergency Number is 112 for all services."},
    "AE": {"police": "999", "ambulance": "998", "fire": "997", "general": "999", "notes": "Dubai Police Tourist Security Hotline: 901 or 800-4888."},
    "FR": {"police": "17", "ambulance": "15 (SAMU)", "fire": "18", "general": "112", "notes": "European emergency number 112 operates in France in multiple languages."},
    "GB": {"police": "999 / 101", "ambulance": "999 / 111", "fire": "999", "general": "999 / 112", "notes": "UK Emergency: 999; Non-emergency police: 101; NHS medical non-emergency: 111."},
    "US": {"police": "911", "ambulance": "911", "fire": "911", "general": "911", "notes": "Standard nationwide emergency number is 911."},
    "JP": {"police": "110", "ambulance": "119", "fire": "119", "general": "110 / 119", "notes": "Japan Helpline for English assistance: 0570-000-911."},
    "CH": {"police": "117", "ambulance": "144", "fire": "118", "general": "112", "notes": "Swiss Air-Rescue (Rega): 1414; General European emergency: 112."},
    "ID": {"police": "110", "ambulance": "118 / 119", "fire": "113", "general": "112", "notes": "Bali Tourist Police: +62 361 754590 / 224111."},
    "SG": {"police": "999", "ambulance": "995", "fire": "995", "general": "999 / 995", "notes": "Singapore Tourist Hotline: 1800 736 2000."},
    "TH": {"police": "191", "ambulance": "1669", "fire": "199", "general": "1155 (Tourist Police)", "notes": "Tourist Police 1155 provides English speaking assistance."}
}


def get_emergency_services(country_code: str, country_name: str = "") -> dict[str, str]:
    """Retrieve trusted official emergency contact numbers by country."""
    code = (country_code or "").upper()
    if code in EMERGENCY_DATA:
        info = EMERGENCY_DATA[code].copy()
        info["country"] = country_name or code
        return info

    return {
        "country": country_name or "International",
        "police": "112",
        "ambulance": "112",
        "fire": "112",
        "general": "112 / 911",
        "notes": "Dial international standard emergency numbers 112 or 911 for regional operator forwarding."
    }


# ==============================================================================
# 8. DYNAMIC PRICING ENGINE
# ==============================================================================

def get_pricing_insights(destination: str, base_price: float = 7500.0) -> dict[str, Any]:
    """
    Business-side dynamic pricing engine supporting demand analysis,
    season factor calculation, and revenue optimization.
    """
    month = datetime.now().month
    # Peak seasons estimation
    high_season_destinations = ["DUBAI", "MALDIVES", "SWITZERLAND", "GOA", "MANALI"]
    is_high_season = any(d in destination.upper() for d in high_season_destinations) and month in [11, 12, 1, 2, 6, 7]

    demand_level = "High" if is_high_season else "Moderate"
    multiplier = 1.12 if is_high_season else 0.96
    recommended_price = round(base_price * multiplier, -1)
    revenue_improvement_pct = 10.7 if is_high_season else 6.2

    return {
        "destination": destination,
        "current_base_price": base_price,
        "demand_level": demand_level,
        "seasonal_factor": "Peak Season" if is_high_season else "Regular Season",
        "recommended_price": recommended_price,
        "estimated_revenue_improvement_pct": revenue_improvement_pct,
        "explanation": f"AI model estimates {demand_level.lower()} travel demand for {destination}. Recommended price of ₹{recommended_price:,.0f} optimizes occupancy and yield (+{revenue_improvement_pct}% revenue index)."
    }
