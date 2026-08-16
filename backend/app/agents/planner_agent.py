import datetime
from typing import Dict, Any, List, Set
from ..rag.rag_engine import rag_engine
from ..optimization.route_optimizer import route_optimizer
from ..optimization.budget_optimizer import budget_optimizer
from ..services.travel_services import resolve_location, search_places, destination_image

# Thematic daily archetypes for multi-day trip sequencing
DAY_THEMES = [
    {
        "theme": "Historic Landmarks & Cultural Heritage",
        "title_suffix": "Heritage, Ancient Quarters & Iconic Sights",
        "morning": ("Historic Old Town & Ancient Landmark", "Walk through historic squares, stone gates, and ancient monuments.", "Heritage & Culture", 150, 2.5),
        "afternoon": ("Grand Palace & National Heritage Museum", "Explore royal halls, historical artifacts, and classical architecture.", "History & Museums", 250, 2.5),
        "evening": ("Heritage Bazaar & Traditional Street Walk", "Stroll through lantern-lit artisan lanes and sample traditional delicacies.", "Culture & Food", 200, 2.0)
    },
    {
        "theme": "Panoramic Horizons & Scenic Vistas",
        "title_suffix": "Skyline Viewpoints, Towers & Scenic Districts",
        "morning": ("Iconic Observation Deck & Cable Car Viewpoint", "Ascend to panoramic observation towers for 360-degree vistas across the region.", "Skyline & Views", 600, 2.5),
        "afternoon": ("Futuristic Design & Contemporary Art Hub", "Discover cutting-edge interactive installations, architectural marvels, and modern galleries.", "Modern Arts & Tech", 400, 2.5),
        "evening": ("Illuminated Promenade & Waterfront Plaza", "Enjoy vibrant evening city lights, waterfront dining, and modern plazas.", "Nightlife & Dining", 300, 2.0)
    },
    {
        "theme": "Nature, Waterfalls & Mountain Landscapes",
        "title_suffix": "Natural Landscapes, Botanical Wonders & Valleys",
        "morning": ("Lush Botanical Gardens & Nature Valley Trail", "Morning trek through tranquil gardens, tea plantations, and scenic nature paths.", "Nature & Scenery", 100, 3.0),
        "afternoon": ("Cascading Waterfalls & Pine Valley Walk", "Witness majestic mountain waterfalls and picturesque suspension bridges.", "Adventure & Nature", 200, 2.5),
        "evening": ("Sunset Hilltop & Valley Overlook", "Watch golden hour across valleys and mountain ridges with artisan snacks.", "Scenic Sunset", 100, 2.0)
    },
    {
        "theme": "Culinary Journey & Local Gastronomy",
        "title_suffix": "Gourmet Markets, Street Food & Culinary Secrets",
        "morning": ("Famous Central Morning Food Market", "Taste fresh local produce, artisan breakfast specialties, and farm cheeses.", "Culinary & Markets", 300, 2.5),
        "afternoon": ("Spice Plantation & Artisan Masterclass", "Learn traditional spice blending and authentic recipe preparation with local experts.", "Culinary & Workshop", 600, 2.5),
        "evening": ("Atmospheric Food Alley & Night Market Crawl", "Sample iconic street delicacies, regional platters, and specialty desserts.", "Food Tour", 400, 2.5)
    },
    {
        "theme": "Lakes, Coastlines & Waterway Adventures",
        "title_suffix": "Waterfront Harbor, Boat Cruises & Coastal Bays",
        "morning": ("Scenic Coastal Bay & Island Ferry", "Cruise along sparkling waters past caves, lighthouse bluffs, and fishing harbors.", "Marine & Scenic", 500, 3.0),
        "afternoon": ("Beachfront Relaxation & Watersport Coves", "Enjoy snorkeling, swimming in calm waters, or paddleboarding along pristine shores.", "Beach & Watersports", 800, 2.5),
        "evening": ("Sunset Boat Cruise & Local Feast", "Sail into the sunset with chilled beverages, live acoustic music, and fresh local dinners.", "Sunset Cruise", 900, 2.5)
    }
]

class PlannerAgent:
    def generate_itinerary(
        self,
        destination: str,
        duration_days: int = 5,
        start_date: str = "",
        budget_inr: float = 40000.0,
        travelers_count: int = 2,
        travel_style: str = "Balanced",
        interests: List[str] = None,
        daily_spending_inr: float = None
    ) -> Dict[str, Any]:
        
        # 1. Resolve destination location
        try:
            loc = resolve_location(destination)
            lat, lon = loc["latitude"], loc["longitude"]
            city_name = loc["name"]
            country_name = loc["country"]
            display_name = loc["display_name"]
        except Exception:
            lat, lon = 0.0, 0.0
            city_name = destination.title()
            country_name = "Global"
            display_name = destination.title()

        # 2. Get dynamic image
        img_info = destination_image(display_name)
        banner_img = img_info["image_url"]

        # 3. Retrieve POIs from Overpass & RAG
        real_pois = search_places(loc, limit=60) if lat != 0.0 else []
        rag_pois = rag_engine.query(f"{city_name} attractions sights", city=city_name, top_k=20)
        
        # Combine real POIs prioritizing Overpass data with real GPS
        all_available_pois = []
        seen_poi_names: Set[str] = set()
        for p in real_pois:
            p_name = p.get("name", "").strip()
            if p_name and p_name not in seen_poi_names:
                seen_poi_names.add(p_name)
                all_available_pois.append({
                    "name": p_name,
                    "description": p.get("description") or f"Famous {p.get('category', 'attraction')} in {city_name}.",
                    "category": p.get("category", "Sightseeing"),
                    "cost_inr": float(p.get("price") or (150 if travel_style != "Luxury" else 500)),
                    "ideal_duration_hrs": 2.5,
                    "rating": 4.8,
                    "lat": float(p.get("lat", lat)),
                    "lon": float(p.get("lon", lon)),
                    "image_url": banner_img,
                    "location_name": p.get("address") or f"{p_name}, {city_name}"
                })

        for p in rag_pois:
            p_name = p.get("name", "").strip()
            if p_name and p_name not in seen_poi_names:
                seen_poi_names.add(p_name)
                all_available_pois.append({
                    "name": p_name,
                    "description": p.get("description") or f"Historical sight in {city_name}.",
                    "category": p.get("category", "Sightseeing"),
                    "cost_inr": float(p.get("cost_inr", 200)),
                    "ideal_duration_hrs": 2.0,
                    "rating": float(p.get("rating", 4.7)),
                    "lat": lat + 0.01,
                    "lon": lon + 0.01,
                    "image_url": banner_img,
                    "location_name": f"{p_name}, {city_name}"
                })

        # 4. Optimize budget with daily spending
        budget_plan = budget_optimizer.optimize_budget(
            total_budget_inr=budget_inr,
            travel_style=travel_style,
            duration_days=duration_days,
            travelers_count=travelers_count,
            daily_spending_inr=daily_spending_inr
        )

        # 5. Assemble Days and Activities with non-repetition
        itinerary_days = []
        used_activity_names: Set[str] = set()
        poi_index = 0

        try:
            current_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        except Exception:
            current_date = datetime.datetime.now() + datetime.timedelta(days=1)

        for day_num in range(1, duration_days + 1):
            day_date_str = current_date.strftime("%d %b %Y")
            current_date += datetime.timedelta(days=1)

            theme_info = DAY_THEMES[(day_num - 1) % len(DAY_THEMES)]
            day_activities = []
            slots = [("Morning", "09:30 AM"), ("Afternoon", "02:00 PM"), ("Evening", "06:30 PM")]

            for slot_idx, (slot_name, slot_time) in enumerate(slots):
                act_item = None
                while poi_index < len(all_available_pois):
                    candidate = all_available_pois[poi_index]
                    poi_index += 1
                    if candidate["name"] not in used_activity_names:
                        act_item = candidate.copy()
                        used_activity_names.add(candidate["name"])
                        break

                if not act_item:
                    tpl = theme_info["morning"] if slot_idx == 0 else (theme_info["afternoon"] if slot_idx == 1 else theme_info["evening"])
                    synth_name = f"{city_name} {tpl[0]}"
                    if synth_name in used_activity_names:
                        synth_name = f"{city_name} {tpl[0]} (Day {day_num})"
                    used_activity_names.add(synth_name)
                    act_item = {
                        "name": synth_name,
                        "description": f"{tpl[1]} Curated for Day {day_num} in {city_name}.",
                        "category": tpl[2],
                        "cost_inr": float(tpl[3] * (1.5 if travel_style == "Luxury" else 1.0)),
                        "duration_hrs": float(tpl[4]),
                        "rating": round(4.7 + (day_num * 0.03) % 0.25, 1),
                        "lat": lat + (day_num * 0.005) + (slot_idx * 0.003),
                        "lon": lon + (day_num * 0.005) + (slot_idx * 0.003),
                        "image_url": banner_img,
                        "location_name": f"{synth_name}, {city_name}"
                    }

                act_item["order_index"] = slot_idx
                act_item["time_slot"] = slot_name
                day_activities.append(act_item)

            # Route optimize with TSP
            optimized_activities = route_optimizer.optimize_daily_sequence(day_activities)
            main_attraction = day_activities[0]["name"].split("&")[0].split("(")[0].strip()

            itinerary_days.append({
                "day_number": day_num,
                "title": f"Day {day_num}: {main_attraction} & {theme_info['title_suffix']}",
                "theme": f"{theme_info['theme']} in {city_name}",
                "description": f"Day {day_num} focuses on {theme_info['theme'].lower()} across {city_name}.",
                "date_str": day_date_str,
                "activities": optimized_activities
            })

        return {
            "title": f"{city_name} {travel_style} Vacation Tour",
            "destination": city_name,
            "country": country_name,
            "start_date": start_date or datetime.date.today().strftime("%Y-%m-%d"),
            "end_date": (current_date - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "duration_days": duration_days,
            "travelers_count": travelers_count,
            "travelers_label": f"{travelers_count} Adults",
            "total_budget_inr": budget_inr,
            "estimated_cost_inr": budget_plan["total_estimated_inr"],
            "travel_style": travel_style,
            "interests": interests or ["Sightseeing", "Food", "Heritage"],
            "image_url": banner_img,
            "status": "upcoming",
            "itinerary_days": itinerary_days,
            "budget_breakdown": budget_plan
        }

planner_agent = PlannerAgent()
