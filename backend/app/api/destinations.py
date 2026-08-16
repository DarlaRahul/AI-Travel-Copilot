import os
import json
import pandas as pd
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..services.travel_services import (
    resolve_location,
    destination_image,
    search_places,
    get_emergency_services,
    get_pricing_insights
)

router = APIRouter(prefix="/destinations", tags=["Destinations"])

@router.get("/resolve")
def resolve_destination(query: str):
    """Dynamically geocode any location in the world using OpenStreetMap Nominatim and Wikimedia images."""
    try:
        location = resolve_location(query)
        img_info = destination_image(location["display_name"])
        location["image_url"] = img_info["image_url"]
        location["image_source"] = img_info.get("source_url")
        location["image_attribution"] = img_info.get("attribution")
        return location
    except (LookupError, ValueError) as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Location service temporarily unavailable: {str(exc)}")

@router.get("/places")
def get_nearby_places(query: str, limit: int = Query(30, ge=1, le=60), offset: int = Query(0, ge=0)):
    """Retrieve verified POIs and attractions around any destination using OpenStreetMap Overpass."""
    try:
        location = resolve_location(query)
        places_list = search_places(location, limit=limit, offset=offset)
        return {
            "location": location,
            "results": places_list,
            "count": len(places_list),
            "next_offset": offset + len(places_list)
        }
    except (LookupError, ValueError) as error:
        raise HTTPException(status_code=404, detail=str(error))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Places service temporarily unavailable: {str(exc)}")

@router.get("/emergency")
def get_destination_emergency_contacts(query: str):
    """Retrieve country-specific official emergency contact numbers."""
    try:
        location = resolve_location(query)
        return get_emergency_services(location.get("country_code", ""), location.get("country", ""))
    except Exception:
        return get_emergency_services("INTERNATIONAL", query)

@router.get("/pricing-insights")
def get_destination_pricing_insights(destination: str, base_price: float = 7500.0):
    """Retrieve dynamic pricing analysis and yield recommendations."""
    return get_pricing_insights(destination, base_price)

# Global curated destination cards for discovery
FEATURED_GLOBAL_CARDS = [
    {
        "id": "DEST_DUBAI",
        "name": "Dubai",
        "country": "UAE",
        "region": "Middle East",
        "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        "rating": 4.8,
        "avg_cost_inr": "₹80,000",
        "ai_score": 98.0,
        "tags": ["Burj Khalifa", "Desert Safari", "Luxury", "Skyline"]
    },
    {
        "id": "DEST_PARIS",
        "name": "Paris",
        "country": "France",
        "region": "Europe",
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
        "rating": 4.9,
        "avg_cost_inr": "₹1,50,000",
        "ai_score": 98.8,
        "tags": ["Eiffel Tower", "Art & Louvre", "Romance", "Pastries"]
    },
    {
        "id": "DEST_JAPAN",
        "name": "Tokyo",
        "country": "Japan",
        "region": "Asia",
        "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        "rating": 4.9,
        "avg_cost_inr": "₹1,40,000",
        "ai_score": 98.4,
        "tags": ["Culture", "Food", "Cherry Blossoms", "Tech"]
    },
    {
        "id": "DEST_SWISS",
        "name": "Switzerland",
        "country": "Switzerland",
        "region": "Europe",
        "image_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
        "rating": 4.9,
        "avg_cost_inr": "₹1,80,000",
        "ai_score": 99.2,
        "tags": ["Alps", "Lakes", "Glaciers", "Scenic Trains"]
    },
    {
        "id": "DEST_BALI",
        "name": "Bali",
        "country": "Indonesia",
        "region": "Asia",
        "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        "rating": 4.8,
        "avg_cost_inr": "₹45,000",
        "ai_score": 97.5,
        "tags": ["Beaches", "Temples", "Rice Terraces", "Sunsets"]
    },
    {
        "id": "DEST_MALDIVES",
        "name": "Maldives",
        "country": "Maldives",
        "region": "Asia",
        "image_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
        "rating": 4.9,
        "avg_cost_inr": "₹1,20,000",
        "ai_score": 96.8,
        "tags": ["Overwater Villas", "Snorkeling", "Luxury", "Sandbanks"]
    },
    {
        "id": "DEST_HYD",
        "name": "Hyderabad",
        "country": "India",
        "region": "India",
        "image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&q=80",
        "rating": 4.7,
        "avg_cost_inr": "₹28,000",
        "ai_score": 96.5,
        "tags": ["Charminar", "Golconda", "Biryani", "Heritage"]
    },
    {
        "id": "DEST_GOA",
        "name": "Goa",
        "country": "India",
        "region": "India",
        "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
        "rating": 4.7,
        "avg_cost_inr": "₹25,000",
        "ai_score": 96.0,
        "tags": ["Beaches", "Watersports", "Portuguese Heritage", "Nightlife"]
    },
    {
        "id": "DEST_JAIPUR",
        "name": "Jaipur",
        "country": "India",
        "region": "India",
        "image_url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
        "rating": 4.8,
        "avg_cost_inr": "₹20,000",
        "ai_score": 95.4,
        "tags": ["Amber Fort", "Pink City", "Palaces", "Bazaars"]
    },
    {
        "id": "DEST_ROME",
        "name": "Rome",
        "country": "Italy",
        "region": "Europe",
        "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
        "rating": 4.9,
        "avg_cost_inr": "₹1,60,000",
        "ai_score": 98.1,
        "tags": ["Colosseum", "Vatican", "Pasta", "Ancient Ruins"]
    },
    {
        "id": "DEST_LONDON",
        "name": "London",
        "country": "United Kingdom",
        "region": "Europe",
        "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        "rating": 4.8,
        "avg_cost_inr": "₹1,75,000",
        "ai_score": 97.6,
        "tags": ["Big Ben", "Tower Bridge", "Museums", "Royalty"]
    },
    {
        "id": "DEST_NYC",
        "name": "New York",
        "country": "USA",
        "region": "Americas",
        "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
        "rating": 4.8,
        "avg_cost_inr": "₹2,10,000",
        "ai_score": 98.0,
        "tags": ["Statue of Liberty", "Broadway", "Central Park", "Skyscrapers"]
    }
]

@router.get("/featured")
def get_featured_cards():
    """Retrieve featured worldwide destination discovery cards."""
    return FEATURED_GLOBAL_CARDS

@router.get("")
def get_destinations(
    query: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    city: Optional[str] = None
):
    """Retrieve destinations matching filters."""
    results = FEATURED_GLOBAL_CARDS.copy()
    if query:
        q = query.lower()
        results = [r for r in results if q in r["name"].lower() or q in r["country"].lower() or any(q in t.lower() for t in r["tags"])]
    if region and region != "All":
        results = [r for r in results if r["region"].lower() == region.lower()]
    if category and category != "All":
        results = [r for r in results if any(category.lower() in t.lower() for t in r["tags"])]
    if city:
        results = [r for r in results if r["name"].lower() == city.lower()]
    return results
