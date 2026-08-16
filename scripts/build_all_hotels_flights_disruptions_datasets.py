import os
import pandas as pd
import json

HOTELS_DATA = [
    # ------------------- MANALI -------------------
    {"hotel_id": "HTL_MAN_01", "name": "The Himalayan Luxury Resort & Castle", "city": "Manali", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 12500, "star_rating": 4.9, "review_score": 4.9, "amenities": "Himalayan View, Heated Pool, Fireplace, Spa, Fine Dining, Ski Transfer", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "address": "Hadimba Road, Manali, Himachal Pradesh"},
    {"hotel_id": "HTL_MAN_02", "name": "Span Resort & Spa Riverbank", "city": "Manali", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 14000, "star_rating": 4.8, "review_score": 4.8, "amenities": "Beas River Front, Helipad, Pine Forest Lawn, Outdoor Bar, Spa", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Baragarh Estate, Beas Valley, Manali"},
    {"hotel_id": "HTL_MAN_03", "name": "Apple Country Boutique Resort", "city": "Manali", "country": "India", "tier": "Mid-Range / Comfort", "price_per_night_inr": 4500, "star_rating": 4.6, "review_score": 4.6, "amenities": "Apple Orchard View, Mountain Balcony, Discotheque, Spa, Free Wifi", "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "address": "Log Huts Area, Old Manali"},
    {"hotel_id": "HTL_MAN_04", "name": "The Johnson Lodge & Spa", "city": "Manali", "country": "India", "tier": "Mid-Range / Comfort", "price_per_night_inr": 5500, "star_rating": 4.7, "review_score": 4.7, "amenities": "Wooden Chalets, Famous Italian Cafe, Garden Bar, Trout Fish Kitchen", "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "address": "Circuit House Road, Manali"},
    {"hotel_id": "HTL_MAN_05", "name": "Zostel Manali (Old Manali Vibe)", "city": "Manali", "country": "India", "tier": "Budget / Backpacker", "price_per_night_inr": 1200, "star_rating": 4.5, "review_score": 4.5, "amenities": "Bunk & Private Rooms, Rooftop Cafe, Bonfire, High Speed Wifi, Community Hall", "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", "address": "Manu Temple Road, Old Manali"},

    # ------------------- GOA -------------------
    {"hotel_id": "HTL_GOA_01", "name": "Taj Exotica Resort & Spa Benaulim", "city": "Goa", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 18500, "star_rating": 4.9, "review_score": 4.9, "amenities": "Private Beach, Mediterranean Villa, Golf Course, Jiva Spa, 5 Restaurants", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "address": "Calwaddo, Benaulim, South Goa"},
    {"hotel_id": "HTL_GOA_02", "name": "W Goa Vagator Cliffside", "city": "Goa", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 21000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Rock Pool Bar, Sunset Lounge, Chapora Fort View, AWAY Spa, Beach Access", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Vagator Beach, North Goa"},
    {"hotel_id": "HTL_GOA_03", "name": "Taj Fort Aguada Resort & Spa", "city": "Goa", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 16000, "star_rating": 4.8, "review_score": 4.8, "amenities": "Sea Facing Cottages, Historic Portuguese Ramparts, Infinity Pool, Watersports", "image_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", "address": "Sinquerim, Candolim, North Goa"},
    {"hotel_id": "HTL_GOA_04", "name": "BloomSuites Calangute", "city": "Goa", "country": "India", "tier": "Mid-Range / Comfort", "price_per_night_inr": 3800, "star_rating": 4.5, "review_score": 4.5, "amenities": "Swimming Pool, 500m to Beach, Breakfast Buffet, Free Wifi, Modern Rooms", "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", "address": "Calangute-Candolim Main Road, Goa"},
    {"hotel_id": "HTL_GOA_05", "name": "Zostel Morjim Beach Hostel", "city": "Goa", "country": "India", "tier": "Budget / Backpacker", "price_per_night_inr": 1100, "star_rating": 4.6, "review_score": 4.6, "amenities": "Beach Walkway, Co-Working Space, Rooftop Cafe, Surf Board Rentals", "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", "address": "Morjim Beach Road, Pernem, Goa"},

    # ------------------- PARIS -------------------
    {"hotel_id": "HTL_PAR_01", "name": "Hôtel Plaza Athénée Paris", "city": "Paris", "country": "France", "tier": "Luxury Palace 5-Star", "price_per_night_inr": 48000, "star_rating": 5.0, "review_score": 4.9, "amenities": "Eiffel Tower Balcony View, Dior Spa, Alain Ducasse Dining, Courtyard Ivy", "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "address": "25 Avenue Montaigne, 8th arr., Paris"},
    {"hotel_id": "HTL_PAR_02", "name": "Pullman Paris Tour Eiffel", "city": "Paris", "country": "France", "tier": "Luxury 4-Star Superior", "price_per_night_inr": 26000, "star_rating": 4.7, "review_score": 4.7, "amenities": "Direct Eiffel Tower Views, Frame Rooftop Bar, Fitness Lounge, Metro Access", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "address": "18 Avenue de Suffren, 15th arr., Paris"},
    {"hotel_id": "HTL_PAR_03", "name": "CitizenM Paris Champs-Élysées", "city": "Paris", "country": "France", "tier": "Boutique / Comfort", "price_per_night_inr": 14500, "star_rating": 4.6, "review_score": 4.6, "amenities": "Smart Mood Rooms, Rooftop Cocktail CloudBar, 200m to Arc de Triomphe", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Rue la Boétie, Champs-Élysées, Paris"},
    {"hotel_id": "HTL_PAR_04", "name": "Generator Paris (Canal Saint-Martin)", "city": "Paris", "country": "France", "tier": "Budget / Design Hostel", "price_per_night_inr": 3800, "star_rating": 4.4, "review_score": 4.4, "amenities": "Rooftop Sacré-Cœur View, Underground Bar, En-suite Dorms, Metro Colonel Fabien", "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", "address": "Place du Colonel Fabien, 10th arr., Paris"},

    # ------------------- SWITZERLAND -------------------
    {"hotel_id": "HTL_SWI_01", "name": "The Dolder Grand Zurich", "city": "Switzerland", "country": "Switzerland", "tier": "Luxury 5-Star Deluxe", "price_per_night_inr": 55000, "star_rating": 5.0, "review_score": 4.9, "amenities": "Lake Zurich Panorama, 4000sqm Spa, Michelin Star Dining, Private Art Collection", "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "address": "Kurhausstrasse 65, Zurich"},
    {"hotel_id": "HTL_SWI_02", "name": "Victoria-Jungfrau Grand Hotel & Spa", "city": "Switzerland", "country": "Switzerland", "tier": "Luxury 5-Star Historic", "price_per_night_inr": 42000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Jungfrau Peak Views, Nescens Spa, Belle Époque Architecture, Central Interlaken", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "address": "Höheweg 41, Interlaken"},
    {"hotel_id": "HTL_SWI_03", "name": "Hotel Schweizerhof Luzern", "city": "Switzerland", "country": "Switzerland", "tier": "Mid-Range / 5-Star Heritage", "price_per_night_inr": 24000, "star_rating": 4.8, "review_score": 4.8, "amenities": "Lake Lucerne Promenade, Chapel Bridge 300m, Historic Festival Suites, Sauna", "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "address": "Schweizerhofquai, Lucerne"},
    {"hotel_id": "HTL_SWI_04", "name": "Matterhorn FOCUS Design Hotel Zermatt", "city": "Switzerland", "country": "Switzerland", "tier": "Boutique Alpine / 4-Star", "price_per_night_inr": 28000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Matterhorn Facing Balconies, Heated Outdoor Saltwater Pool, Designer Chalet", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Schluhmattstrasse, Zermatt"},
    {"hotel_id": "HTL_SWI_05", "name": "Balmers Hostel & Tents Interlaken", "city": "Switzerland", "country": "Switzerland", "tier": "Budget / Alpine Hostel", "price_per_night_inr": 4200, "star_rating": 4.5, "review_score": 4.5, "amenities": "Outdoor Hot Tub, Mountain View Garden, Skydiving Bookings, Cozy Swiss Chalet", "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", "address": "Hauptstrasse 23, Matten bei Interlaken"},

    # ------------------- JAIPUR -------------------
    {"hotel_id": "HTL_JAI_01", "name": "Rambagh Palace (The Jewel of Jaipur)", "city": "Jaipur", "country": "India", "tier": "Luxury Palace 5-Star", "price_per_night_inr": 35000, "star_rating": 5.0, "review_score": 5.0, "amenities": "Former Maharaja Residence, Peacocks in Gardens, Polo Bar, Jiva Grand Spa", "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "address": "Bhawani Singh Road, Jaipur"},
    {"hotel_id": "HTL_JAI_02", "name": "Samode Haveli Heritage Hotel", "city": "Jaipur", "country": "India", "tier": "Heritage Boutique", "price_per_night_inr": 12000, "star_rating": 4.8, "review_score": 4.8, "amenities": "Hand-Painted Frescoes, Marble Swimming Pool, Traditional Puppet Shows, Courtyard", "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "address": "Gangapole, Old Pink City, Jaipur"},
    {"hotel_id": "HTL_JAI_03", "name": "Moustache Hostel Jaipur Rooftop", "city": "Jaipur", "country": "India", "tier": "Budget / Backpacker", "price_per_night_inr": 900, "star_rating": 4.6, "review_score": 4.6, "amenities": "Rooftop Pool, Fort View Cafe, Rajasthani Art Dorms, Walking Tours", "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", "address": "MI Road, Near Sindhi Camp, Jaipur"},

    # ------------------- KERALA / MUNNAR -------------------
    {"hotel_id": "HTL_KER_01", "name": "Kumarakom Lake Resort Luxury Houseboat", "city": "Kerala", "country": "India", "tier": "Luxury 5-Star Heritage", "price_per_night_inr": 19000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Backwater Meandering Pool, Ayurmana Ayurvedic Spa, Floating Kettuvallam Dining", "image_url": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80", "address": "Vembanad Lake, Kumarakom, Kerala"},
    {"hotel_id": "HTL_KER_02", "name": "Tea Valley Resort & Mist Villas Munnar", "city": "Munnar", "country": "India", "tier": "Mid-Range / Comfort", "price_per_night_inr": 4800, "star_rating": 4.6, "review_score": 4.6, "amenities": "Inside 25-Acre Tea Estate, Valley Clouds View, Treehouse Trek, Campfire", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Bison Valley Road, Pothamedu, Munnar"},

    # ------------------- JAPAN -------------------
    {"hotel_id": "HTL_JPN_01", "name": "Aman Tokyo Imperial Palace Skyline", "city": "Japan", "country": "Japan", "tier": "Luxury 5-Star", "price_per_night_inr": 62000, "star_rating": 5.0, "review_score": 4.9, "amenities": "Mount Fuji & Tokyo Skyline Views, 30m Black Basalt Pool, Onsen Bathing, Engawa Lounge", "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "address": "The Otemachi Tower, Chiyoda, Tokyo"},
    {"hotel_id": "HTL_JPN_02", "name": "Shinjuku Granbell Hotel", "city": "Japan", "country": "Japan", "tier": "Mid-Range / Design Hotel", "price_per_night_inr": 11500, "star_rating": 4.6, "review_score": 4.6, "amenities": "Rooftop Sky Lounge, Modern Japanese Art, 500m to Shinjuku Station", "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "address": "Kabukicho, Shinjuku, Tokyo"},
    {"hotel_id": "HTL_JPN_03", "name": "UNPLAN Shinjuku Capsule & Hostel", "city": "Japan", "country": "Japan", "tier": "Budget / Boutique Capsule", "price_per_night_inr": 3200, "star_rating": 4.7, "review_score": 4.7, "amenities": "Modern Pods, English Speaking Barista Cafe, Common Lounge, Metro Access", "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", "address": "Shinjuku-ku, Tokyo"},

    # ------------------- BALI -------------------
    {"hotel_id": "HTL_BAL_01", "name": "The Kayon Jungle Resort Ubud", "city": "Bali", "country": "Indonesia", "tier": "Luxury 5-Star Resort", "price_per_night_inr": 24000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Three-Tiered Valley Infinity Pool, Rain Forest Yoga, Serapung Spa, Floating Breakfast", "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", "address": "Bresela, Payangan, Ubud, Bali"},
    {"hotel_id": "HTL_BAL_02", "name": "Kuta Beachfront Boutique Resort", "city": "Bali", "country": "Indonesia", "tier": "Mid-Range / Comfort", "price_per_night_inr": 4200, "star_rating": 4.5, "review_score": 4.5, "amenities": "Beach Access, Sunset Pool Bar, Surfing Lessons, Spa", "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", "address": "Jalan Pantai Kuta, Bali"},

    # ------------------- DUBAI -------------------
    {"hotel_id": "HTL_DUB_01", "name": "Atlantis The Royal Palm Jumeirah", "city": "Dubai", "country": "UAE", "tier": "Ultra Luxury 5-Star", "price_per_night_inr": 52000, "star_rating": 5.0, "review_score": 4.9, "amenities": "Sky Pool 90m in Air, Aquaventure Access, Celebrity Chef Restaurants, Private Beach", "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", "address": "Palm Jumeirah Crescent, Dubai"},
    {"hotel_id": "HTL_DUB_02", "name": "Rove Downtown (Burj Khalifa View)", "city": "Dubai", "country": "UAE", "tier": "Mid-Range / Modern", "price_per_night_inr": 8500, "star_rating": 4.7, "review_score": 4.7, "amenities": "Burj Khalifa Infinity Pool, 24h Gym, 500m to Dubai Mall, Daily Cinema", "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", "address": "Downtown Dubai, UAE"},

    # ------------------- MALDIVES -------------------
    {"hotel_id": "HTL_MLD_01", "name": "Anantara Veli Maldives Luxury Resort", "city": "Maldives", "country": "Maldives", "tier": "Luxury 5-Star Resort", "price_per_night_inr": 68000, "star_rating": 4.9, "review_score": 4.9, "amenities": "Overwater Sunset Bungalows, Turquoise Lagoon, Speedboat Transfer, Coral Reef Diving", "image_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", "address": "South Male Atoll, Maldives"},

    # ------------------- LADAKH -------------------
    {"hotel_id": "HTL_LAD_01", "name": "The Grand Dragon Ladakh (Heated Luxury)", "city": "Ladakh", "country": "India", "tier": "Luxury 5-Star", "price_per_night_inr": 13500, "star_rating": 4.8, "review_score": 4.8, "amenities": "Solar Heated Rooms, Stok Kangri Snow Views, Oxygen Support, Tibetan Dining", "image_url": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80", "address": "Old Road Sheynam, Leh, Ladakh"}
]

DISRUPTIONS_DATA = [
    # Manali
    {"disruption_id": "DIS_MAN_01", "city": "Manali", "type": "Weather Warning", "severity": "Medium", "title": "Rohtang Pass High-Altitude Snow Advisory", "description": "Fresh snowfall above 3,500m on Rohtang Pass. Chains recommended for vehicles. Atal Tunnel route operating normally.", "impact": "Day 2 high snow point activities adjusted with warm weather backup.", "status": "Active", "source": "HP State Disaster Management"},
    {"disruption_id": "DIS_MAN_02", "city": "Manali", "type": "Road Maintenance", "severity": "Low", "title": "Kullu-Manali Left Bank Highway Work", "description": "Routine widening on Naggar stretch. Slight 15-minute slowdowns during evening hours.", "impact": "Route optimizer automatically schedules alternate NH-3 bypass.", "status": "Monitoring", "source": "BRO Road Advisory"},

    # Goa
    {"disruption_id": "DIS_GOA_01", "city": "Goa", "type": "Marine / Tide Advisory", "severity": "Low", "title": "Monsoon High Swell on North Coast", "description": "Deep ocean water-sports temporarily shifted to sheltered Sinquerim Bay. Beach shacks fully operational.", "impact": "Water activity points relocated to calm waters.", "status": "Active", "source": "Indian Meteorological Dept"},
    {"disruption_id": "DIS_GOA_02", "city": "Goa", "type": "Flight Congestion", "severity": "Low", "title": "Goa Dabolim / Mopa Runway Scheduled Check", "description": "Minor 20m gate queues during peak holiday slots. No flight cancellations reported.", "impact": "Airport transfer buffer adjusted to +40 mins.", "status": "Monitoring", "source": "AAI Radar"},

    # Paris
    {"disruption_id": "DIS_PAR_01", "city": "Paris", "type": "Transit Advisory", "severity": "Low", "title": "Paris Metro Line 1 Platform Modernization", "description": "Concorde station undergoing escalator maintenance. Adjacent Tuileries and Franklin D. Roosevelt stations open.", "impact": "Walking route optimized to Tuileries entrance.", "status": "Active", "source": "RATP Paris"},
    {"disruption_id": "DIS_PAR_02", "city": "Paris", "type": "Monument Queue Alert", "severity": "Medium", "title": "Louvre Museum Peak Visitor Flow", "description": "High ticket demand at Pyramid entrance. Advance timed-entry required.", "impact": "AI Planner assigns 09:30 AM priority morning reservation slot.", "status": "Active", "source": "Louvre Operations"},

    # Switzerland
    {"disruption_id": "DIS_SWI_01", "city": "Switzerland", "type": "Alpine Weather", "severity": "Low", "title": "Jungfraujoch Summit Gusts Advisory", "description": "High alpine winds above 3,400m. Eiger Express cableway running on reduced speed.", "impact": "Indoor Ice Palace and Sphinx Observatory prioritized.", "status": "Active", "source": "MeteoSwiss"},
    {"disruption_id": "DIS_SWI_02", "city": "Switzerland", "type": "Train Track Upgrades", "severity": "Low", "title": "GoldenPass Express Panoramic Line Check", "description": "Minor 10-minute maintenance on Spiez connector.", "impact": "Zero disruption to planned itinerary.", "status": "Monitoring", "source": "SBB Swiss Railways"},

    # Jaipur
    {"disruption_id": "DIS_JAI_01", "city": "Jaipur", "type": "Traffic Advisory", "severity": "Low", "title": "Pink City Walled Gate Evening Crowds", "description": "Ajmeri Gate to Bapu Bazaar heavy footfall between 6-8 PM.", "impact": "Evening walk route mapped through pedestrian-friendly artisan corridors.", "status": "Active", "source": "Jaipur City Police"},

    # Global Fallback
    {"disruption_id": "DIS_GEN_01", "city": "General", "type": "Global Transit Alert", "severity": "Low", "title": "International Airport Security Biometric Updates", "description": "Standard international e-gate processing operational across major transit hubs.", "impact": "Smooth standard transit flow.", "status": "Operational", "source": "IATA Radar"}
]

def build():
    os.makedirs("datasets/hotels", exist_ok=True)
    os.makedirs("datasets/disruptions", exist_ok=True)

    # Save Hotels
    df_hotels = pd.DataFrame(HOTELS_DATA)
    df_hotels.to_csv("datasets/hotels/hotels_catalog.csv", index=False)
    print(f"[OK] Saved {len(df_hotels)} hotels across {df_hotels['city'].nunique()} destinations!")

    # Save Disruptions
    df_disruptions = pd.DataFrame(DISRUPTIONS_DATA)
    df_disruptions.to_csv("datasets/disruptions/travel_disruptions.csv", index=False)
    print(f"[OK] Saved {len(df_disruptions)} destination-specific disruptions!")

if __name__ == "__main__":
    build()
