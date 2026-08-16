import os
import pandas as pd
import json

# Ensure directories exist
os.makedirs("data/raw", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)

print("--- Generating Curated Destination & Attractions Dataset ---")

destinations_data = [
    # GOA
    {"id": "GOA_001", "name": "Baga Beach", "city": "Goa", "country": "India", "category": "Beach & Nightlife", 
     "rating": 4.5, "cost_inr": 0, "avg_duration_hrs": 3.5, "best_season": "Nov-Feb", 
     "tags": "beach, nightlife, watersports, shacks, seafood", "lat": 15.5553, "lon": 73.7516,
     "description": "Famous beach in North Goa known for vibrant nightlife, beach shacks, watersports like parasailing, and lively evening ambiance."},
    {"id": "GOA_002", "name": "Fort Aguada", "city": "Goa", "country": "India", "category": "Heritage & History", 
     "rating": 4.4, "cost_inr": 50, "avg_duration_hrs": 2.0, "best_season": "Oct-Mar", 
     "tags": "heritage, fort, sea view, lighthouse, photography", "lat": 15.4921, "lon": 73.7736,
     "description": "A well-preserved seventeenth-century Portuguese fort and lighthouse standing on Sinquerim Beach, overlooking the Arabian Sea."},
    {"id": "GOA_003", "name": "Basilica of Bom Jesus", "city": "Goa", "country": "India", "category": "Heritage & Culture", 
     "rating": 4.6, "cost_inr": 0, "avg_duration_hrs": 1.5, "best_season": "All Year", 
     "tags": "unesco, church, architecture, history, peaceful", "lat": 15.5009, "lon": 73.9116,
     "description": "A UNESCO World Heritage site in Old Goa containing the mortal remains of St. Francis Xavier, featuring baroque architecture."},
    {"id": "GOA_004", "name": "Dudhsagar Waterfalls", "city": "Goa", "country": "India", "category": "Nature & Adventure", 
     "rating": 4.7, "cost_inr": 500, "avg_duration_hrs": 5.0, "best_season": "Jun-Nov", 
     "tags": "waterfall, trekking, jeep safari, nature, adventure", "lat": 15.3144, "lon": 74.3143,
     "description": "A four-tiered waterfall on the Mandovi River known as 'Sea of Milk', surrounded by lush deciduous forests and jungle trails."},
    {"id": "GOA_005", "name": "Anjuna Flea Market & Curlies", "city": "Goa", "country": "India", "category": "Shopping & Nightlife", 
     "rating": 4.3, "cost_inr": 0, "avg_duration_hrs": 2.5, "best_season": "Nov-Apr", 
     "tags": "flea market, shopping, live music, beach party, bohemian", "lat": 15.5804, "lon": 73.7423,
     "description": "Famous weekly market and coastal shacks offering handicrafts, bohemian clothes, live trance music, and sunset dining."},
    {"id": "GOA_006", "name": "Palolem Beach", "city": "Goa", "country": "India", "category": "Relaxation & Scenic", 
     "rating": 4.7, "cost_inr": 0, "avg_duration_hrs": 4.0, "best_season": "Nov-Mar", 
     "tags": "scenic, silent noise party, kayaking, dolphins, relaxed", "lat": 15.0100, "lon": 74.0232,
     "description": "Crescent-shaped white sand beach in South Goa lined with coconut palms, ideal for kayaking and relaxed family vacations."},

    # JAIPUR
    {"id": "JPR_001", "name": "Amber Palace (Amer Fort)", "city": "Jaipur", "country": "India", "category": "Heritage & Architecture", 
     "rating": 4.7, "cost_inr": 100, "avg_duration_hrs": 3.0, "best_season": "Oct-Mar", 
     "tags": "unesco, fort, palace, mirror palace, history, royal", "lat": 26.9855, "lon": 75.8513,
     "description": "Majestic hilltop fort featuring red sandstone and marble, with Sheesh Mahal (mirror palace) overlooking Maota Lake."},
    {"id": "JPR_002", "name": "Hawa Mahal (Palace of Winds)", "city": "Jaipur", "country": "India", "category": "Heritage & Architecture", 
     "rating": 4.5, "cost_inr": 50, "avg_duration_hrs": 1.5, "best_season": "Oct-Mar", 
     "tags": "pink city, architecture, photography, landmark, museum", "lat": 26.9239, "lon": 75.8267,
     "description": "Iconic five-story pink sandstone palace with 953 ornate honeycomb windows designed for royal women to observe street festivals."},
    {"id": "JPR_003", "name": "City Palace & Jantar Mantar", "city": "Jaipur", "country": "India", "category": "Heritage & Science", 
     "rating": 4.6, "cost_inr": 200, "avg_duration_hrs": 2.5, "best_season": "Oct-Mar", 
     "tags": "royal residence, unesco, astronomy, artifacts, courtyard", "lat": 26.9258, "lon": 75.8237,
     "description": "Complex blending Rajput and Mughal architecture, paired with the world's largest stone astronomical observatory."},
    {"id": "JPR_004", "name": "Chokhi Dhani Ethnic Village", "city": "Jaipur", "country": "India", "category": "Culture & Dining", 
     "rating": 4.4, "cost_inr": 900, "avg_duration_hrs": 4.0, "best_season": "All Year", 
     "tags": "rajasthani thali, folk dance, camel ride, village experience", "lat": 26.7663, "lon": 75.8362,
     "description": "A cultural village resort offering traditional Rajasthani folk dances, puppet shows, camel rides, and authentic royal dining."},

    # KERALA / KOCHI / MUNNAR
    {"id": "KER_001", "name": "Munnar Tea Gardens & Eravikulam", "city": "Munnar", "country": "India", "category": "Nature & Hill Station", 
     "rating": 4.8, "cost_inr": 200, "avg_duration_hrs": 4.0, "best_season": "Sep-May", 
     "tags": "tea plantation, hills, wildlife, nilgiri tahr, mist, trekking", "lat": 10.0889, "lon": 77.0595,
     "description": "Rolling hills blanketed with verdant tea plantations, rare flora, and habitat for the endangered Nilgiri Tahr."},
    {"id": "KER_002", "name": "Alleppey Houseboat Backwaters", "city": "Alleppey", "country": "India", "category": "Scenic & Leisure", 
     "rating": 4.8, "cost_inr": 3500, "avg_duration_hrs": 6.0, "best_season": "Oct-Mar", 
     "tags": "backwaters, houseboat, cruise, kerala meals, serene, honeymoon", "lat": 9.4981, "lon": 76.3388,
     "description": "Cruising through tranquil palm-fringed canals, lagoons, and paddy fields on a traditional Kettuvallam wooden houseboat."},
    {"id": "KER_003", "name": "Fort Kochi & Chinese Fishing Nets", "city": "Kochi", "country": "India", "category": "Culture & Heritage", 
     "rating": 4.5, "cost_inr": 0, "avg_duration_hrs": 2.5, "best_season": "All Year", 
     "tags": "colonial, art cafes, spice market, sunset, fishing nets", "lat": 9.9658, "lon": 76.2421,
     "description": "Historic seaside neighborhood with European colonial buildings, contemporary art cafes, and iconic cantilevered fishing nets."},

    # MANALI
    {"id": "MNL_001", "name": "Solang Valley Adventure Hub", "city": "Manali", "country": "India", "category": "Adventure & Snow", 
     "rating": 4.6, "cost_inr": 800, "avg_duration_hrs": 4.5, "best_season": "Oct-Jun", 
     "tags": "snow, paragliding, skiing, zorbing, cable car, mountains", "lat": 32.3166, "lon": 77.1578,
     "description": "Premier adventure playground offering paragliding, quad biking, zorbing, and winter skiing with breathtaking Himalayan views."},
    {"id": "MNL_002", "name": "Atal Tunnel & Sissu Valley", "city": "Manali", "country": "India", "category": "Scenic & Roadtrip", 
     "rating": 4.9, "cost_inr": 0, "avg_duration_hrs": 3.5, "best_season": "May-Nov", 
     "tags": "himalayas, tunnel, lahaul valley, waterfall, roadtrip", "lat": 32.4820, "lon": 77.1265,
     "description": "World's longest highway tunnel above 10,000 feet leading into the dramatic snowcapped landscapes of Lahaul and Sissu waterfalls."},

    # DUBAI
    {"id": "DXB_001", "name": "Burj Khalifa & Dubai Mall", "city": "Dubai", "country": "UAE", "category": "Modern Wonder & Luxury", 
     "rating": 4.8, "cost_inr": 3800, "avg_duration_hrs": 4.0, "best_season": "Nov-Mar", 
     "tags": "skyscraper, fountain show, observation deck, shopping, luxury", "lat": 25.1972, "lon": 55.2744,
     "description": "World's tallest building offering panoramic 360-degree observation decks paired with the world's largest luxury mall and musical fountains."},
    {"id": "DXB_002", "name": "Desert Safari with BBQ & Dune Bashing", "city": "Dubai", "country": "UAE", "category": "Adventure & Culture", 
     "rating": 4.7, "cost_inr": 2500, "avg_duration_hrs": 5.5, "best_season": "Oct-Apr", 
     "tags": "dune bashing, sandboarding, camel ride, bbq dinner, belly dance", "lat": 24.8318, "lon": 55.4851,
     "description": "Thrilling 4x4 dune ride across Arabian red dunes followed by sunset photography, camel trekking, shisha, and live entertainment."}
]

df_destinations = pd.DataFrame(destinations_data)
df_destinations.to_csv("data/processed/destinations_and_attractions.csv", index=False)
print(f"Saved {len(df_destinations)} destination POIs to data/processed/destinations_and_attractions.csv")

# --- Curated Hotels Dataset ---
hotels_data = [
    {"hotel_id": "HTL_GOA_01", "name": "Taj Fort Aguada Resort & Spa", "city": "Goa", "tier": "Luxury", 
     "price_per_night_inr": 18000, "star_rating": 5.0, "review_score": 4.8, 
     "amenities": "Beachfront, Infinity Pool, Spa, Free Breakfast, Ocean View", "lat": 15.4940, "lon": 73.7745},
    {"hotel_id": "HTL_GOA_02", "name": "BloomSuites Calangute", "city": "Goa", "tier": "Mid-Range", 
     "price_per_night_inr": 4200, "star_rating": 4.0, "review_score": 4.3, 
     "amenities": "Swimming Pool, Wi-Fi, Restaurant, Bar, AC, Close to Beach", "lat": 15.5410, "lon": 73.7620},
    {"hotel_id": "HTL_GOA_03", "name": "Zostel Goa (Morjim / Anjuna)", "city": "Goa", "tier": "Budget / Hostel", 
     "price_per_night_inr": 1200, "star_rating": 3.5, "review_score": 4.5, 
     "amenities": "Dorm & Private Rooms, Cafe, Co-working space, Rooftop, Games", "lat": 15.6110, "lon": 73.7380},
    
    {"hotel_id": "HTL_JPR_01", "name": "Rambagh Palace", "city": "Jaipur", "tier": "Luxury", 
     "price_per_night_inr": 35000, "star_rating": 5.0, "review_score": 4.9, 
     "amenities": "Heritage Palace, Royal Dining, Peacock Gardens, Butler Service", "lat": 26.8979, "lon": 75.8080},
    {"hotel_id": "HTL_JPR_02", "name": "Umaid Bhawan Heritage Hotel", "city": "Jaipur", "tier": "Mid-Range", 
     "price_per_night_inr": 3800, "star_rating": 4.0, "review_score": 4.4, 
     "amenities": "Traditional Decor, Swimming Pool, Rooftop Restaurant, Wi-Fi", "lat": 26.9320, "lon": 75.7950},
    {"hotel_id": "HTL_JPR_03", "name": "Moustache Hostel Jaipur", "city": "Jaipur", "tier": "Budget / Hostel", 
     "price_per_night_inr": 950, "star_rating": 3.5, "review_score": 4.4, 
     "amenities": "Rooftop Cafe, Dorms, Female-only dorms, Social events, AC", "lat": 26.9180, "lon": 75.7990},

    {"hotel_id": "HTL_KER_01", "name": "Kumarakom Lake Resort", "city": "Alleppey", "tier": "Luxury", 
     "price_per_night_inr": 22000, "star_rating": 5.0, "review_score": 4.8, 
     "amenities": "Meandering Pool, Ayurvedic Spa, Backwater Villa, Traditional Dining", "lat": 9.6178, "lon": 76.4282},
    {"hotel_id": "HTL_KER_02", "name": "Grand Hyatt Kochi Bolgatty", "city": "Kochi", "tier": "Luxury", 
     "price_per_night_inr": 11500, "star_rating": 5.0, "review_score": 4.7, 
     "amenities": "Waterfront, Marina, Spa, Multiple Dining, Helipad, Luxury", "lat": 9.9880, "lon": 76.2670},
    {"hotel_id": "HTL_KER_03", "name": "Tea Valley Resort Munnar", "city": "Munnar", "tier": "Mid-Range", 
     "price_per_night_inr": 3600, "star_rating": 3.8, "review_score": 4.2, 
     "amenities": "Tea garden view, Campfire, Restaurant, Balcony cottages", "lat": 10.0520, "lon": 77.0620}
]

df_hotels = pd.DataFrame(hotels_data)
df_hotels.to_csv("data/processed/hotels_listings.csv", index=False)
print(f"Saved {len(df_hotels)} curated hotels to data/processed/hotels_listings.csv")

print("--- Datasets Ready in data/processed/ ---")
