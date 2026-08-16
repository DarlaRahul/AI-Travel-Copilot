import os
import sys
import json
import shutil
import urllib.request
import pandas as pd

# Fix windows console unicode printing
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Define base directory
BASE_DIR = "datasets"
subdirs = ["destinations", "hotels", "flights", "disruptions", "budgets", "conversational", "geo"]
for s in subdirs:
    os.makedirs(os.path.join(BASE_DIR, s), exist_ok=True)

print("Step 1: Downloading / Copying large raw datasets...")

# 1. Flight Prices Dataset (~24MB, 300k rows)
flight_csv_path = os.path.join(BASE_DIR, "flights", "flight_prices_india.csv")
raw_flight_source = os.path.join("data", "raw", "flight_prices.csv")

if os.path.exists(raw_flight_source) and os.path.getsize(raw_flight_source) > 1000:
    print(f"Copying existing raw flight dataset from {raw_flight_source}...")
    shutil.copy(raw_flight_source, flight_csv_path)
    print(f"Saved flight_prices_india.csv ({os.path.getsize(flight_csv_path)/(1024*1024):.2f} MB)")
elif not os.path.exists(flight_csv_path) or os.path.getsize(flight_csv_path) < 1000:
    print("Downloading flight_prices_india.csv...")
    try:
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/rishuranjan74/Flight_Price_Prediction/main/Clean_Dataset.csv",
            flight_csv_path
        )
        print(f"Downloaded flight_prices_india.csv ({os.path.getsize(flight_csv_path)/(1024*1024):.2f} MB)")
    except Exception as e:
        print(f"Error downloading flights: {e}")

# 2. Hotel Reviews & Sentiment Dataset (~15MB, 20k reviews)
hotel_reviews_path = os.path.join(BASE_DIR, "hotels", "tripadvisor_hotel_reviews.csv")
raw_hotel_source = os.path.join("data", "raw", "hotel_reviews.csv")

if os.path.exists(raw_hotel_source) and os.path.getsize(raw_hotel_source) > 1000:
    print(f"Copying existing hotel reviews from {raw_hotel_source}...")
    shutil.copy(raw_hotel_source, hotel_reviews_path)
    print(f"Saved tripadvisor_hotel_reviews.csv ({os.path.getsize(hotel_reviews_path)/(1024*1024):.2f} MB)")
elif not os.path.exists(hotel_reviews_path) or os.path.getsize(hotel_reviews_path) < 1000:
    print("Downloading tripadvisor_hotel_reviews.csv...")
    try:
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/MainakRepositor/Datasets-/master/tripadvisor_hotel_reviews.csv",
            hotel_reviews_path
        )
        print(f"Downloaded tripadvisor_hotel_reviews.csv ({os.path.getsize(hotel_reviews_path)/(1024*1024):.2f} MB)")
    except Exception as e:
        print(f"Error downloading hotel reviews: {e}")

# 3. World Cities Geolocation Dataset (~1.3MB, 43k+ cities)
world_cities_path = os.path.join(BASE_DIR, "geo", "world_cities.csv")
raw_cities_source = os.path.join("data", "raw", "world_cities.csv")

if os.path.exists(raw_cities_source) and os.path.getsize(raw_cities_source) > 1000:
    print(f"Copying existing world cities from {raw_cities_source}...")
    shutil.copy(raw_cities_source, world_cities_path)
    print(f"Saved world_cities.csv ({os.path.getsize(world_cities_path)/(1024*1024):.2f} MB)")
elif not os.path.exists(world_cities_path) or os.path.getsize(world_cities_path) < 1000:
    print("Downloading world_cities.csv...")
    try:
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/datasets/world-cities/master/data/world-cities.csv",
            world_cities_path
        )
        print(f"Downloaded world_cities.csv ({os.path.getsize(world_cities_path)/(1024*1024):.2f} MB)")
    except Exception as e:
        print(f"Error downloading world cities: {e}")

print("\nStep 2: Creating rich Destination & POI Knowledge Base for Itinerary & RAG Engine...")

destinations = [
    # GOA
    {"poi_id": "GOA_01", "name": "Baga Beach & Tito's Lane", "city": "Goa", "state": "Goa", "country": "India", 
     "category": "Beach & Nightlife", "rating": 4.5, "entry_fee_inr": 0, "avg_spend_inr": 1500, "ideal_duration_hrs": 3.5, 
     "best_time_of_day": "Evening/Night", "best_season": "Oct-Mar", "lat": 15.5553, "lon": 73.7516,
     "tags": "beach, nightlife, watersports, party, seafood, sunset",
     "description": "High-energy beach in North Goa with iconic beach clubs, watersports (parasailing, jet-ski), seafood shacks, and vibrant night clubs."},
    
    {"poi_id": "GOA_02", "name": "Fort Aguada & Lighthouse", "city": "Goa", "state": "Goa", "country": "India", 
     "category": "Heritage & Scenic", "rating": 4.4, "entry_fee_inr": 50, "avg_spend_inr": 100, "ideal_duration_hrs": 2.0, 
     "best_time_of_day": "Morning/Afternoon", "best_season": "Oct-Apr", "lat": 15.4921, "lon": 73.7736,
     "tags": "heritage, portuguese fort, lighthouse, ocean view, photography",
     "description": "A 17th-century Portuguese fortress standing on Sinquerim Beach overlooking the Arabian Sea, featuring a historic four-storey lighthouse."},
    
    {"poi_id": "GOA_03", "name": "Basilica of Bom Jesus", "city": "Goa", "state": "Goa", "country": "India", 
     "category": "Heritage & Culture", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 50, "ideal_duration_hrs": 1.5, 
     "best_time_of_day": "Morning", "best_season": "All Year", "lat": 15.5009, "lon": 73.9116,
     "tags": "unesco, architecture, church, history, spiritual, old goa",
     "description": "UNESCO World Heritage landmark in Old Goa housing the mortal remains of St. Francis Xavier, renowned for exquisite Baroque architecture."},
    
    {"poi_id": "GOA_04", "name": "Dudhsagar Falls Safari", "city": "Goa", "state": "Goa", "country": "India", 
     "category": "Nature & Adventure", "rating": 4.8, "entry_fee_inr": 500, "avg_spend_inr": 1800, "ideal_duration_hrs": 5.0, 
     "best_time_of_day": "Morning", "best_season": "Jul-Dec", "lat": 15.3144, "lon": 74.3143,
     "tags": "waterfalls, 4x4 jeep safari, trekking, jungle, nature",
     "description": "Spectacular 4-tiered cascading waterfall plunging 310 meters on the Mandovi river amidst the lush Bhagwan Mahaveer Sanctuary."},
    
    {"poi_id": "GOA_05", "name": "Palolem Beach & Butterfly Beach", "city": "Goa", "state": "Goa", "country": "India", 
     "category": "Relaxation & Nature", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 800, "ideal_duration_hrs": 4.0, 
     "best_time_of_day": "Afternoon/Sunset", "best_season": "Nov-Mar", "lat": 15.0100, "lon": 74.0232,
     "tags": "peaceful, kayaking, dolphin boat ride, silent party, palm trees",
     "description": "Scenic semi-circular crescent beach in South Goa known for peaceful beach huts, sea kayaking, dolphin boat trips, and scenic sunsets."},

    # JAIPUR
    {"poi_id": "JPR_01", "name": "Amber Fort & Sheesh Mahal", "city": "Jaipur", "state": "Rajasthan", "country": "India", 
     "category": "Heritage & Architecture", "rating": 4.7, "entry_fee_inr": 100, "avg_spend_inr": 500, "ideal_duration_hrs": 3.0, 
     "best_time_of_day": "Morning", "best_season": "Oct-Mar", "lat": 26.9855, "lon": 75.8513,
     "tags": "royal fort, mirror palace, unesco, elephant ride, history, rajput",
     "description": "Hilltop fort in Amer showcasing red sandstone and marble palaces, elaborate courtyards, and the glittering Sheesh Mahal mirror palace."},
    
    {"poi_id": "JPR_02", "name": "Hawa Mahal (Palace of Winds)", "city": "Jaipur", "state": "Rajasthan", "country": "India", 
     "category": "Heritage & Architecture", "rating": 4.5, "entry_fee_inr": 50, "avg_spend_inr": 150, "ideal_duration_hrs": 1.5, 
     "best_time_of_day": "Morning", "best_season": "Oct-Mar", "lat": 26.9239, "lon": 75.8267,
     "tags": "pink city landmark, 953 jharokhas, photography, street shopping",
     "description": "Pyramidal 5-storey pink sandstone façade with 953 honeycomb windows designed to allow royal ladies to watch street festivals unseen."},
    
    {"poi_id": "JPR_03", "name": "City Palace & Jantar Mantar", "city": "Jaipur", "state": "Rajasthan", "country": "India", 
     "category": "Heritage & Science", "rating": 4.6, "entry_fee_inr": 200, "avg_spend_inr": 400, "ideal_duration_hrs": 2.5, 
     "best_time_of_day": "Afternoon", "best_season": "Oct-Mar", "lat": 26.9258, "lon": 75.8237,
     "tags": "royal museum, astronomical observatory, unesco, sundial",
     "description": "Grand palace complex of the Maharaja of Jaipur alongside the world's largest stone astronomical observatory with 19 architectural instruments."},
    
    {"poi_id": "JPR_04", "name": "Chokhi Dhani Cultural Resort", "city": "Jaipur", "state": "Rajasthan", "country": "India", 
     "category": "Culture & Dining", "rating": 4.5, "entry_fee_inr": 900, "avg_spend_inr": 1200, "ideal_duration_hrs": 4.0, 
     "best_time_of_day": "Evening", "best_season": "All Year", "lat": 26.7663, "lon": 75.8362,
     "tags": "rajasthani thali, folk dance, camel ride, puppet show, cultural dinner",
     "description": "Renowned ethnic village offering vibrant Rajasthani cultural heritage, folk performances, traditional games, and authentic royal thali feast."},

    # KERALA / MUNNAR / KOCHI
    {"poi_id": "KER_01", "name": "Munnar Tea Estates & Mattupetty", "city": "Munnar", "state": "Kerala", "country": "India", 
     "category": "Nature & Hill Station", "rating": 4.8, "entry_fee_inr": 150, "avg_spend_inr": 500, "ideal_duration_hrs": 4.0, 
     "best_time_of_day": "Morning", "best_season": "Sep-May", "lat": 10.0889, "lon": 77.0595,
     "tags": "tea plantation, hills, boating, mist, photography, trekking",
     "description": "Emerald carpeted tea hills, speedboating at Mattupetty dam, echo point, and cool mountain breezes at 5,200 ft elevation."},
    
    {"poi_id": "KER_02", "name": "Alleppey Houseboat Backwater Cruise", "city": "Alleppey", "state": "Kerala", "country": "India", 
     "category": "Scenic & Leisure", "rating": 4.9, "entry_fee_inr": 3500, "avg_spend_inr": 4500, "ideal_duration_hrs": 6.0, 
     "best_time_of_day": "All Day", "best_season": "Oct-Mar", "lat": 9.4981, "lon": 76.3388,
     "tags": "backwaters, luxury houseboat, kerala meals, serene, paddy fields",
     "description": "Cruising through the labyrinth of palm-fringed canals, lagoons, and backwater villages in a traditional thatched wooden houseboat with cooked meals."},

    # MANALI
    {"poi_id": "MNL_01", "name": "Solang Valley Snow & Adventure Park", "city": "Manali", "state": "Himachal Pradesh", "country": "India", 
     "category": "Adventure & Snow", "rating": 4.6, "entry_fee_inr": 800, "avg_spend_inr": 2500, "ideal_duration_hrs": 4.5, 
     "best_time_of_day": "Morning/Afternoon", "best_season": "Oct-Jun", "lat": 32.3166, "lon": 77.1578,
     "tags": "snow sports, paragliding, skiing, zorbing, ropeway, himalayan views",
     "description": "Adventure hub 14 km from Manali offering paragliding, ATV rides, zorbing, winter skiing, and ropeway rides with alpine views."},

    # DUBAI
    {"poi_id": "DXB_01", "name": "Burj Khalifa Observation Deck (At The Top)", "city": "Dubai", "state": "Dubai", "country": "UAE", 
     "category": "Modern Architecture & Luxury", "rating": 4.8, "entry_fee_inr": 3800, "avg_spend_inr": 5000, "ideal_duration_hrs": 3.0, 
     "best_time_of_day": "Sunset/Evening", "best_season": "Nov-Mar", "lat": 25.1972, "lon": 55.2744,
     "tags": "skyscraper, world tallest building, 360 observation deck, fountain show",
     "description": "Ascend to level 124/125/148 of the world's tallest building for sweeping panoramic views across Dubai, paired with the Dubai Fountain show."}
]

df_dest = pd.DataFrame(destinations)
df_dest.to_csv(os.path.join(BASE_DIR, "destinations", "destinations_attractions.csv"), index=False)
with open(os.path.join(BASE_DIR, "destinations", "destinations_rich_knowledge.json"), "w", encoding="utf-8") as f:
    json.dump(destinations, f, indent=2, ensure_ascii=False)
print(f"Saved {len(destinations)} destination POIs to datasets/destinations/")

print("\nStep 3: Creating comprehensive Hotels & Accommodations catalog...")

hotels = [
    # GOA
    {"hotel_id": "HTL_GOA_01", "name": "Taj Fort Aguada Resort & Spa", "city": "Goa", "tier": "Luxury", 
     "price_per_night_inr": 18500, "star_rating": 5.0, "review_score": 4.8, "total_reviews": 3240,
     "amenities": "Beachfront, Infinity Pool, Ayurvedic Spa, Free Breakfast, Ocean View, Kids Club", "lat": 15.4940, "lon": 73.7745},
    {"hotel_id": "HTL_GOA_02", "name": "BloomSuites Calangute", "city": "Goa", "tier": "Mid-Range", 
     "price_per_night_inr": 4200, "star_rating": 4.0, "review_score": 4.3, "total_reviews": 1820,
     "amenities": "Swimming Pool, Wi-Fi, Restaurant, Bar, AC, 500m to Beach, Parking", "lat": 15.5410, "lon": 73.7620},
    {"hotel_id": "HTL_GOA_03", "name": "Zostel Goa Morjim", "city": "Goa", "tier": "Budget / Hostel", 
     "price_per_night_inr": 1100, "star_rating": 3.5, "review_score": 4.6, "total_reviews": 2450,
     "amenities": "Dorms & Private Rooms, High-speed Wi-Fi, Co-working, Rooftop Cafe, Social Events", "lat": 15.6110, "lon": 73.7380},
    {"hotel_id": "HTL_GOA_04", "name": "Hard Rock Hotel Goa (Calangute)", "city": "Goa", "tier": "Premium", 
     "price_per_night_inr": 8500, "star_rating": 4.5, "review_score": 4.5, "total_reviews": 1600,
     "amenities": "Poolside Bar, Live Music, Rock Spa, Gym, Gourmet Dining", "lat": 15.5390, "lon": 73.7710},

    # JAIPUR
    {"hotel_id": "HTL_JPR_01", "name": "Rambagh Palace (Taj Heritage)", "city": "Jaipur", "tier": "Luxury", 
     "price_per_night_inr": 38000, "star_rating": 5.0, "review_score": 4.9, "total_reviews": 4100,
     "amenities": "Heritage Royal Palace, Peacock Lawns, Butler Service, Fine Dining, Jiva Spa", "lat": 26.8979, "lon": 75.8080},
    {"hotel_id": "HTL_JPR_02", "name": "Umaid Bhawan Heritage House Hotel", "city": "Jaipur", "tier": "Mid-Range", 
     "price_per_night_inr": 3600, "star_rating": 4.0, "review_score": 4.4, "total_reviews": 1950,
     "amenities": "Rajput Architecture, Swimming Pool, Rooftop Restaurant, Antique Furnishings", "lat": 26.9320, "lon": 75.7950},
    {"hotel_id": "HTL_JPR_03", "name": "Moustache Hostel Jaipur", "city": "Jaipur", "tier": "Budget / Hostel", 
     "price_per_night_inr": 850, "star_rating": 3.5, "review_score": 4.5, "total_reviews": 3100,
     "amenities": "Air-Conditioned Dorms, Rooftop Pool & Lounge, Free City Walking Tours", "lat": 26.9180, "lon": 75.7990},

    # KERALA / MUNNAR / KOCHI
    {"hotel_id": "HTL_KER_01", "name": "Kumarakom Lake Resort", "city": "Alleppey", "tier": "Luxury", 
     "price_per_night_inr": 23000, "star_rating": 5.0, "review_score": 4.8, "total_reviews": 2890,
     "amenities": "Meandering Pool, Ayurvedic Treatment, Traditional Heritage Villas, Houseboat Docks", "lat": 9.6178, "lon": 76.4282},
    {"hotel_id": "HTL_KER_02", "name": "Grand Hyatt Kochi Bolgatty", "city": "Kochi", "tier": "Luxury", 
     "price_per_night_inr": 12000, "star_rating": 5.0, "review_score": 4.7, "total_reviews": 2300,
     "amenities": "Waterfront, Marina View, Helipad, Luxury Spa, Multiple Cuisines", "lat": 9.9880, "lon": 76.2670},
    {"hotel_id": "HTL_KER_03", "name": "Tea Valley Resort Munnar", "city": "Munnar", "tier": "Mid-Range", 
     "price_per_night_inr": 3800, "star_rating": 4.0, "review_score": 4.2, "total_reviews": 1400,
     "amenities": "Tea Plantation Balcony, Campfire, Restaurant, Mountain Trekking Guide", "lat": 10.0520, "lon": 77.0620}
]

df_hotels = pd.DataFrame(hotels)
df_hotels.to_csv(os.path.join(BASE_DIR, "hotels", "hotels_catalog.csv"), index=False)
print(f"Saved {len(hotels)} hotels to datasets/hotels/hotels_catalog.csv")

print("\nStep 4: Creating Travel Disruptions & Rebooking Dataset (Delays, Weather, Flight Status)...")

disruptions = [
    {"event_id": "DISR_001", "flight_number": "6E-204", "airline": "IndiGo", "route": "DEL -> GOI", 
     "scheduled_departure": "2026-09-10 08:30", "status": "Delayed by 3h 45m", "delay_reason": "Heavy Monsoons / Low Visibility in Goa",
     "severity": "High", "impact": "Misses 11:30 AM airport pickup and South Goa Day 1 tour",
     "rebooking_action": "Auto-reschedule hotel check-in time to 1:30 PM; Shift Fort Aguada visit to Day 2 morning."},
    
    {"event_id": "DISR_002", "flight_number": "UK-811", "airline": "Vistara", "route": "BOM -> JAI", 
     "scheduled_departure": "2026-09-12 14:15", "status": "Cancelled", "delay_reason": "Technical Aircraft Glitch",
     "severity": "Critical", "impact": "Stranded at Mumbai Airport for scheduled Jaipur trip",
     "rebooking_action": "Auto-recommend alternative Air India flight AI-612 at 16:30 (INR 4,200) or IndiGo 6E-455 at 17:15."},
    
    {"event_id": "DISR_003", "flight_number": "AI-505", "airline": "Air India", "route": "BLR -> COK", 
     "scheduled_departure": "2026-09-15 10:00", "status": "Gate Change & 45m Delay", "delay_reason": "Inbound aircraft late arrival",
     "severity": "Low", "impact": "Minor 45m delay, no itinerary clash",
     "rebooking_action": "Send instant notification to user with updated Gate 14B and estimated arrival at 11:45 AM."}
]

df_disruptions = pd.DataFrame(disruptions)
df_disruptions.to_csv(os.path.join(BASE_DIR, "disruptions", "travel_disruptions.csv"), index=False)
print(f"Saved {len(disruptions)} disruption scenarios to datasets/disruptions/travel_disruptions.csv")

print("\nStep 5: Creating Budget Allocation & Optimization Benchmark Models...")

budget_rules = {
    "budget_split_rules": {
        "Budget_Backpacker": {"stay_pct": 25, "transport_pct": 35, "activities_pct": 20, "food_pct": 15, "buffer_pct": 5},
        "Mid_Range_Explorer": {"stay_pct": 35, "transport_pct": 25, "activities_pct": 20, "food_pct": 15, "buffer_pct": 5},
        "Luxury_Leisure": {"stay_pct": 50, "transport_pct": 20, "activities_pct": 15, "food_pct": 10, "buffer_pct": 5}
    },
    "city_daily_living_cost_estimates_inr": {
        "Goa": {"budget_per_day": 2000, "mid_per_day": 5000, "luxury_per_day": 15000},
        "Jaipur": {"budget_per_day": 1800, "mid_per_day": 4500, "luxury_per_day": 20000},
        "Munnar_Kochi": {"budget_per_day": 2200, "mid_per_day": 5500, "luxury_per_day": 18000},
        "Manali": {"budget_per_day": 2000, "mid_per_day": 4800, "luxury_per_day": 14000},
        "Dubai": {"budget_per_day": 8000, "mid_per_day": 18000, "luxury_per_day": 45000}
    }
}

with open(os.path.join(BASE_DIR, "budgets", "budget_benchmarks.json"), "w", encoding="utf-8") as f:
    json.dump(budget_rules, f, indent=2)
print("Saved budget optimization models to datasets/budgets/budget_benchmarks.json")

print("\nStep 6: Creating Conversational AI & Multilingual Intent Dataset...")

dialogue_intents = [
    {
        "intent": "plan_trip",
        "sample_queries": [
            "Plan a 5-day trip to Goa for 2 people with a ₹40,000 budget.",
            "I want to visit Jaipur for 3 days next weekend under 20k rupees.",
            "Can you make a honeymoon itinerary for Kerala for 6 days?",
            "गोआ के लिए 5 दिन की ट्रिप प्लान करो 40,000 के बजट में।"
        ],
        "extracted_entities": {
            "destination": "Goa",
            "duration_days": 5,
            "travelers_count": 2,
            "budget_inr": 40000,
            "persona": "Couples / Leisure"
        }
    },
    {
        "intent": "flight_status_check",
        "sample_queries": [
            "Is my flight 6E-204 to Goa on time?",
            "Check delay status for IndiGo flight 204.",
            "क्या मेरी गोआ जाने वाली फ्लाइट लेट है?"
        ],
        "extracted_entities": {
            "flight_number": "6E-204",
            "action": "check_disruption"
        }
    },
    {
        "intent": "rebook_disruption",
        "sample_queries": [
            "My flight got cancelled, suggest alternative flights to Jaipur immediately.",
            "Find nearest available hotels in Goa because our flight was delayed till tomorrow.",
            "फ्लाइट कैंसिल हो गई, दूसरी फ्लाइट बताओ।"
        ],
        "extracted_entities": {
            "action": "rebook_assistance",
            "priority": "urgent"
        }
    },
    {
        "intent": "budget_optimization",
        "sample_queries": [
            "How can I reduce my Goa trip cost from 50k to 35k without missing beaches?",
            "Show me cheap hostel alternatives in Jaipur.",
            "बजट कैसे कम करें?"
        ],
        "extracted_entities": {
            "action": "knapsack_budget_prune",
            "target_saving_pct": 30
        }
    }
]

with open(os.path.join(BASE_DIR, "conversational", "conversational_intents.json"), "w", encoding="utf-8") as f:
    json.dump(dialogue_intents, f, indent=2, ensure_ascii=False)
print("Saved Conversational NLP datasets to datasets/conversational/conversational_intents.json")

print("\nALL DATASETS HAVE BEEN SUCCESSFULLY CREATED IN `datasets/` DIRECTORY!")
