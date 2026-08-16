import os
import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Comprehensive Authentic Image URLs for all Indian and Global Destinations (Unsplash Curated)
ALL_DESTINATION_IMAGES = {
    # ------------------- INDIA (All States & Vacation Regions) -------------------
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    "Udaipur": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1200&q=80",
    "Jodhpur": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&q=80",
    "Jaisalmer": "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&q=80",
    "Ranthambore": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=80",
    "Mount Abu": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
    "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80",
    "Munnar": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    "Alleppey": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    "Kochi": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=80",
    "Wayanad": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    "Varkala": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80",
    "Shimla": "https://images.unsplash.com/photo-1562670652-e5947bddb335?w=1200&q=80",
    "Dharamshala": "https://images.unsplash.com/photo-1582650625119-3a31f841839d?w=1200&q=80",
    "Spiti Valley": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80",
    "Kasol": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    "Rishikesh": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1200&q=80",
    "Nainital": "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=1200&q=80",
    "Mussoorie": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    "Auli": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
    "Corbett": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=80",
    "Kashmir": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=80",
    "Srinagar": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=80",
    "Gulmarg": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
    "Ladakh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80",
    "Leh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80",
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
    "Varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
    "Mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
    "Hyderabad": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=1200&q=80",
    "Ooty": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80",
    "Kodaikanal": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    "Coorg": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    "Hampi": "https://images.unsplash.com/photo-1600100397608-f010f443b708?w=1200&q=80",
    "Gokarna": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Mysore": "https://images.unsplash.com/photo-1600100397608-f010f443b708?w=1200&q=80",
    "Darjeeling": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    "Sikkim": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
    "Gangtok": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
    "Meghalaya": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    "Shillong": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
    "Andaman": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
    "Havelock": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
    "Amritsar": "https://images.unsplash.com/photo-1588096344356-9a2c3a504381?w=1200&q=80",
    "Statue of Unity": "https://images.unsplash.com/photo-1600100397608-f010f443b708?w=1200&q=80",
    "Kutch": "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&q=80",
    "Puri": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Mahabalipuram": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
    "Rameswaram": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
    "Kanyakumari": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
    "Lonavala": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80",
    "Mahabaleshwar": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80",
    "Ajanta Ellora": "https://images.unsplash.com/photo-1600100397608-f010f443b708?w=1200&q=80",
    "Tirupati": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
    "Visakhapatnam": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Araku Valley": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",

    # ------------------- GLOBAL INTERNATIONAL -------------------
    "Japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
    "Switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=80",
    "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    "Maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80",
    "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    "Santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80",
    "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
    "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
    "Thailand": "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80"
}

# Complete Comprehensive Dataset of Indian Tourist Attractions
ALL_INDIA_POIS = [
    # ------------------- GOA -------------------
    {"poi_id": "IND_GOA_01", "name": "Baga Beach Watersports & Tito's Lane", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "Beach & Nightlife", "rating": 4.6, "entry_fee_inr": 0, "avg_spend_inr": 1500, "ideal_duration_hrs": 3.5, "lat": 15.5553, "lon": 73.7516, "tags": "parasailing, jet ski, north goa, beach shacks, seafood, party", "description": "Lively coastal beach with parasailing, water scooter rides, beach clubs, and iconic sunset shacks."},
    {"poi_id": "IND_GOA_02", "name": "Fort Aguada & Portuguese Lighthouse", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "Heritage & Fort", "rating": 4.5, "entry_fee_inr": 50, "avg_spend_inr": 100, "ideal_duration_hrs": 2.0, "lat": 15.4921, "lon": 73.7736, "tags": "portuguese fort, lighthouse, sinquerim, arabian sea view", "description": "17th-century bastion built by Portuguese to guard Mandovi estuary with panoramic views across Arabian Sea."},
    {"poi_id": "IND_GOA_03", "name": "Basilica of Bom Jesus (UNESCO)", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "UNESCO Heritage", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 50, "ideal_duration_hrs": 1.5, "lat": 15.5009, "lon": 73.9116, "tags": "unesco, old goa, baroque church, st francis xavier relics", "description": "World-famous UNESCO Catholic basilica in Old Goa housing sacred relics of St. Francis Xavier."},
    {"poi_id": "IND_GOA_04", "name": "Dudhsagar Falls & 4x4 Jungle Safari", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "Nature & Waterfalls", "rating": 4.8, "entry_fee_inr": 800, "avg_spend_inr": 1500, "ideal_duration_hrs": 5.0, "lat": 15.3144, "lon": 74.3143, "tags": "four tiered waterfall, sea of milk, mollem national park, jeep safari", "description": "Spectacular 310-meter four-tiered milky cascade accessible by off-road jeep safari through Bhagwan Mahavir Sanctuary."},
    {"poi_id": "IND_GOA_05", "name": "Palolem Crescent Beach & Butterfly Island Kayaking", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "Scenic Beach & Relaxation", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 1000, "ideal_duration_hrs": 3.5, "lat": 15.0100, "lon": 74.0232, "tags": "south goa, crescent bay, kayak, dolphin spotting, serene sunset", "description": "Calm scenic crescent bay in South Goa framed by palm groves, beachfront shacks, and kayak trips to Butterfly Island."},
    {"poi_id": "IND_GOA_06", "name": "Fontainhas Latin Quarter Heritage Walk", "city": "Goa", "region": "India", "state": "Goa", "country": "India", "category": "Heritage & Architecture", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 500, "ideal_duration_hrs": 2.0, "lat": 15.4989, "lon": 73.8322, "tags": "panaji, portuguese houses, colorful streets, art galleries, bakeries", "description": "Asia's only surviving Latin Quarter with pastel-painted 18th-century Portuguese mansions and artisan bakeries."},

    # ------------------- RAJASTHAN (Jaipur, Udaipur, Jodhpur, Jaisalmer) -------------------
    {"poi_id": "IND_RAJ_01", "name": "Amber Fort (Amer Palace) & Sheesh Mahal", "city": "Jaipur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Heritage & Forts", "rating": 4.8, "entry_fee_inr": 200, "avg_spend_inr": 800, "ideal_duration_hrs": 3.5, "lat": 26.9855, "lon": 75.8513, "tags": "mirror palace, maota lake, elephant ride, mughal rajput architecture", "description": "Monumental hilltop fortress of red sandstone and marble featuring the sparkling Sheesh Mahal mirror palace."},
    {"poi_id": "IND_RAJ_02", "name": "Hawa Mahal (Palace of Winds)", "city": "Jaipur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Heritage & Landmark", "rating": 4.6, "entry_fee_inr": 50, "avg_spend_inr": 200, "ideal_duration_hrs": 1.5, "lat": 26.9239, "lon": 75.8267, "tags": "953 jharokhas, pink city, honeycomb facade, photography", "description": "Five-storey pink sandstone facade with 953 ornate latticed windows designed for royal ladies to view city processions."},
    {"poi_id": "IND_RAJ_03", "name": "City Palace & Peacock Gate Courtyard", "city": "Jaipur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Royal Palaces", "rating": 4.7, "entry_fee_inr": 300, "avg_spend_inr": 700, "ideal_duration_hrs": 2.5, "lat": 26.9258, "lon": 75.8236, "tags": "royal residence, chandra mahal, armory museum, peacock gate", "description": "Grand royal complex displaying Maharaja costumes, antique weaponry, and the colorful mosaic Peacock Gate."},
    {"poi_id": "IND_RAJ_04", "name": "Nahargarh Fort Sunset Point Over Pink City", "city": "Jaipur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Forts & Sunset", "rating": 4.8, "entry_fee_inr": 100, "avg_spend_inr": 500, "ideal_duration_hrs": 2.5, "lat": 26.9372, "lon": 75.8155, "tags": "aravalli hills, panoramic jaipur view, padao cafe, stepwell", "description": "Perched on Aravalli ridge providing the most breathtaking panoramic sunset view over the entire illuminated Pink City."},
    {"poi_id": "IND_RAJ_05", "name": "Udaipur City Palace & Lake Pichola Boat Ride", "city": "Udaipur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Royal Heritage & Lakes", "rating": 4.9, "entry_fee_inr": 400, "avg_spend_inr": 1500, "ideal_duration_hrs": 4.0, "lat": 24.5764, "lon": 73.6835, "tags": "city of lakes, taj lake palace, jag mandir, venice of east", "description": "Monumental royal granite palace rising above Lake Pichola with sunset boat cruises to Jag Mandir island palace."},
    {"poi_id": "IND_RAJ_06", "name": "Mehrangarh Fort & Blue City Viewpoint", "city": "Jodhpur", "region": "India", "state": "Rajasthan", "country": "India", "category": "Forts & Heritage", "rating": 4.9, "entry_fee_inr": 200, "avg_spend_inr": 800, "ideal_duration_hrs": 3.5, "lat": 26.2980, "lon": 73.0189, "tags": "blue city, towering fort, rao jodha desert park, zipline", "description": "One of India's largest and most formidable hill forts towering 400 feet above the iconic indigo-blue houses of Jodhpur."},
    {"poi_id": "IND_RAJ_07", "name": "Jaisalmer Golden Fort & Sam Sand Dunes Desert Safari", "city": "Jaisalmer", "region": "India", "state": "Rajasthan", "country": "India", "category": "Desert & Living Fort", "rating": 4.8, "entry_fee_inr": 500, "avg_spend_inr": 2500, "ideal_duration_hrs": 5.0, "lat": 26.9124, "lon": 70.9127, "tags": "thar desert, camel safari, sand dunes, living fort, folk dance", "description": "The world's only living golden sandstone fort paired with camel safaris and folk dances amidst Thar desert sand dunes."},

    # ------------------- KERALA -------------------
    {"poi_id": "IND_KER_01", "name": "Alleppey Luxury Backwaters Houseboat Cruise", "city": "Alleppey", "region": "India", "state": "Kerala", "country": "India", "category": "Backwaters & Cruise", "rating": 4.9, "entry_fee_inr": 4500, "avg_spend_inr": 6000, "ideal_duration_hrs": 6.0, "lat": 9.4981, "lon": 76.3388, "tags": "kettuvallam, vembanad lake, backwaters, paddy fields, coconut palms", "description": "Cruise serene palm-fringed canals and emerald paddy lagoons on a private thatched-roof luxury Kettuvallam houseboat."},
    {"poi_id": "IND_KER_02", "name": "Munnar Rolling Tea Estates & Eravikulam National Park", "city": "Munnar", "region": "India", "state": "Kerala", "country": "India", "category": "Hill Station & Nature", "rating": 4.8, "entry_fee_inr": 200, "avg_spend_inr": 800, "ideal_duration_hrs": 4.0, "lat": 10.0889, "lon": 77.0595, "tags": "nilgiri tahr, tea gardens, anamudi peak, misty mountains, tea museum", "description": "Endless rolling tea plantations carpeted across misty Western Ghats, sanctuary to the rare Nilgiri Tahr mountain goat."},
    {"poi_id": "IND_KER_03", "name": "Fort Kochi Chinese Fishing Nets & Mattancherry Palace", "city": "Kochi", "region": "India", "state": "Kerala", "country": "India", "category": "Colonial Heritage", "rating": 4.6, "entry_fee_inr": 50, "avg_spend_inr": 600, "ideal_duration_hrs": 3.0, "lat": 9.9656, "lon": 76.2421, "tags": "chinese cantilever nets, jew town, spice markets, dutch palace", "description": "Historic seaport with 14th-century cantilevered Chinese fishing nets, antique spice bazaars, and Jewish Synagogue."},
    {"poi_id": "IND_KER_04", "name": "Wayanad Edakkal Caves & Chembra Peak Heart Lake", "city": "Wayanad", "region": "India", "state": "Kerala", "country": "India", "category": "Trekking & Adventure", "rating": 4.7, "entry_fee_inr": 150, "avg_spend_inr": 800, "ideal_duration_hrs": 4.0, "lat": 11.6854, "lon": 76.1320, "tags": "prehistoric petroglyphs, heart shaped lake, misty hills, waterfalls", "description": "Prehistoric rock engravings inside Neolithic caves paired with a scenic trek to Chembra Peak's natural heart-shaped lake."},
    {"poi_id": "IND_KER_05", "name": "Varkala Cliff Beach & Janardhana Swamy Temple", "city": "Varkala", "region": "India", "state": "Kerala", "country": "India", "category": "Cliffs & Coastal", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 1000, "ideal_duration_hrs": 3.0, "lat": 8.7379, "lon": 76.7163, "tags": "red laterite cliffs, arabian sea, yoga, beach cafes, sunset", "description": "Dramatic red laterite coastal cliffs overlooking the Arabian Sea with rooftop cafes, yoga retreats, and natural springs."},

    # ------------------- HIMACHAL PRADESH -------------------
    {"poi_id": "IND_HP_01", "name": "Solang Valley Adventure & Rohtang Pass Snow Point", "city": "Manali", "region": "India", "state": "Himachal Pradesh", "country": "India", "category": "Snow & Adventure", "rating": 4.8, "entry_fee_inr": 1500, "avg_spend_inr": 3000, "ideal_duration_hrs": 5.0, "lat": 32.3166, "lon": 77.1583, "tags": "snow point, 3978m altitude, paragliding, zorbing, rohtang pass", "description": "Epic alpine gateway at 3,978m with year-round snow landscapes, paragliding, ATV rides, and Atal Tunnel access."},
    {"poi_id": "IND_HP_02", "name": "Old Manali Cafes, Hadimba Temple & Jogini Falls", "city": "Manali", "region": "India", "state": "Himachal Pradesh", "country": "India", "category": "Culture & Waterfalls", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 800, "ideal_duration_hrs": 3.5, "lat": 32.2472, "lon": 77.1892, "tags": "wooden pagoda temple, cedar forest, jogini waterfall trek, bohemian cafes", "description": "Historic 1553 wooden pagoda temple nestled in cedar woods, followed by a scenic waterfall trail in Vashisht."},
    {"poi_id": "IND_HP_03", "name": "Shimla Mall Road, The Ridge & Jakhoo Hanuman Temple", "city": "Shimla", "region": "India", "state": "Himachal Pradesh", "country": "India", "category": "Colonial Hill Station", "rating": 4.6, "entry_fee_inr": 0, "avg_spend_inr": 1000, "ideal_duration_hrs": 3.5, "lat": 31.1048, "lon": 77.1734, "tags": "british summer capital, neo-gothic christ church, jakhoo ropeway", "description": "British India's summer capital featuring the pedestrian Ridge, historic Gaiety Theatre, and 108ft Jakhoo Hanuman statue."},
    {"poi_id": "IND_HP_04", "name": "Dharamshala & McLeod Ganj Dalai Lama Temple", "city": "Dharamshala", "region": "India", "state": "Himachal Pradesh", "country": "India", "category": "Tibetan Culture & Trekking", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 700, "ideal_duration_hrs": 3.5, "lat": 32.2396, "lon": 76.3248, "tags": "little lhasa, tsuglagkhang complex, triund trek, dhauladhar ranges", "description": "Residence of His Holiness Dalai Lama surrounded by pine forests, Tibetan monasteries, and the Triund mountain trail."},
    {"poi_id": "IND_HP_05", "name": "Spiti Valley Key Monastery & Chandratal Moon Lake", "city": "Spiti Valley", "region": "India", "state": "Himachal Pradesh", "country": "India", "category": "High-Altitude Wilderness", "rating": 5.0, "entry_fee_inr": 500, "avg_spend_inr": 3500, "ideal_duration_hrs": 6.0, "lat": 32.2965, "lon": 78.0125, "tags": "middle land, 1000 year old monastery, crescent moon lake, stargazing", "description": "Cold desert mountain valley housing 1,000-year-old cliffside Key Monastery and the turquoise crescent Chandratal Lake."},

    # ------------------- UTTARAKHAND -------------------
    {"poi_id": "IND_UK_01", "name": "Rishikesh Laxman Jhula & River Ganga White Water Rafting", "city": "Rishikesh", "region": "India", "state": "Uttarakhand", "country": "India", "category": "Yoga & Adventure", "rating": 4.9, "entry_fee_inr": 1200, "avg_spend_inr": 2000, "ideal_duration_hrs": 4.5, "lat": 30.1294, "lon": 78.3262, "tags": "yoga capital of world, ganga rafting, triveni ghat aarti, beatles ashram", "description": "World Yoga Capital on the banks of Holy Ganga offering Grade III/IV rapids rafting, suspension bridges, and evening aartis."},
    {"poi_id": "IND_UK_02", "name": "Nainital Emerald Naini Lake Boating & Snow View", "city": "Nainital", "region": "India", "state": "Uttarakhand", "country": "India", "category": "Lakes & Hill Station", "rating": 4.6, "entry_fee_inr": 300, "avg_spend_inr": 900, "ideal_duration_hrs": 3.0, "lat": 29.3919, "lon": 79.4542, "tags": "eye-shaped lake, yachting, naina devi temple, kumaon hills", "description": "Picturesque pear-shaped lake surrounded by seven lush hills, vintage paddle boating, and aerial ropeway viewpoints."},
    {"poi_id": "IND_UK_03", "name": "Auli Ski Resort & Nanda Devi Himalayan Peak View", "city": "Auli", "region": "India", "state": "Uttarakhand", "country": "India", "category": "Skiing & Snow", "rating": 4.9, "entry_fee_inr": 1500, "avg_spend_inr": 3500, "ideal_duration_hrs": 5.0, "lat": 30.5293, "lon": 79.5694, "tags": "india premier ski resort, 4km cable car, nanda devi 7816m, oak forests", "description": "India's premier ski destination with Europe-standard slopes, longest cable car in Asia, and views of India's 2nd highest peak."},
    {"poi_id": "IND_UK_04", "name": "Jim Corbett National Park Royal Bengal Tiger Safari", "city": "Corbett", "region": "India", "state": "Uttarakhand", "country": "India", "category": "Wildlife & Tigers", "rating": 4.8, "entry_fee_inr": 2500, "avg_spend_inr": 4000, "ideal_duration_hrs": 5.0, "lat": 29.5300, "lon": 78.7747, "tags": "dhikala zone, bengal tigers, wild elephants, ramganga river", "description": "India's oldest national park established in 1936, famed for open-jeep tiger sightings in Dhikala and Bijrani zones."},

    # ------------------- KASHMIR & LADAKH -------------------
    {"poi_id": "IND_JK_01", "name": "Srinagar Dal Lake Floating Gardens & Shikara Ride", "city": "Srinagar", "region": "India", "state": "Jammu & Kashmir", "country": "India", "category": "Lakes & Romance", "rating": 4.9, "entry_fee_inr": 800, "avg_spend_inr": 2000, "ideal_duration_hrs": 3.5, "lat": 34.0837, "lon": 74.8700, "tags": "jewel of srinagar, wooden houseboats, mughal gardens, floating vegetable market", "description": "Glide through tranquil mirror waters in colorful cushioned wooden Shikara boats past floating lotus gardens and cedar houseboats."},
    {"poi_id": "IND_JK_02", "name": "Gulmarg World Highest Gondola Cable Car & Skiing", "city": "Gulmarg", "region": "India", "state": "Jammu & Kashmir", "country": "India", "category": "Snow & Gondola", "rating": 4.9, "entry_fee_inr": 1800, "avg_spend_inr": 3000, "ideal_duration_hrs": 4.5, "lat": 34.0484, "lon": 74.3805, "tags": "meadow of flowers, phase 2 apharwat peak 4000m, ski slopes", "description": "Ride Asia's highest operating cable car to 3,980 meters on Apharwat Peak with panoramic snow views toward Nanga Parbat."},
    {"poi_id": "IND_JK_03", "name": "Pahalgam Betaab Valley & Baisaran 'Mini Switzerland'", "city": "Kashmir", "region": "India", "state": "Jammu & Kashmir", "country": "India", "category": "Valleys & Pine Meadows", "rating": 4.8, "entry_fee_inr": 200, "avg_spend_inr": 1200, "ideal_duration_hrs": 4.0, "lat": 34.0137, "lon": 75.3275, "tags": "lidder river, pony rides, betaab valley, alpine meadows", "description": "Verdant Lidder River valley framed by pine forests, snow-clad peaks, and idyllic horseback riding to Baisaran meadow."},
    {"poi_id": "IND_LAD_01", "name": "Pangong Tso High Altitude Azure Lake (4,225m)", "city": "Ladakh", "region": "India", "state": "Ladakh", "country": "India", "category": "High Altitude Wonder", "rating": 5.0, "entry_fee_inr": 500, "avg_spend_inr": 3500, "ideal_duration_hrs": 6.0, "lat": 33.7595, "lon": 78.6674, "tags": "color changing lake, chang la pass, 3 idiots lake, himalayas", "description": "World-famous 134km-long endorheic lake at 14,270 feet that dynamically shifts colors from brilliant blue to turquoise."},
    {"poi_id": "IND_LAD_02", "name": "Nubra Valley White Sand Dunes & Double-Hump Camels", "city": "Ladakh", "region": "India", "state": "Ladakh", "country": "India", "category": "Desert & Monasteries", "rating": 4.9, "entry_fee_inr": 400, "avg_spend_inr": 2500, "ideal_duration_hrs": 5.0, "lat": 34.6863, "lon": 77.5673, "tags": "bactrian camels, hunder dunes, diskit monastery giant buddha, khardung la", "description": "High-altitude desert valley reached via Khardung La pass (17,982 ft), home to two-humped Bactrian camels and 106ft Diskit Buddha."},

    # ------------------- UTTAR PRADESH & DELHI -------------------
    {"poi_id": "IND_UP_01", "name": "Taj Mahal (Seven Wonders of the World)", "city": "Agra", "region": "India", "state": "Uttar Pradesh", "country": "India", "category": "Wonder of the World", "rating": 5.0, "entry_fee_inr": 250, "avg_spend_inr": 1000, "ideal_duration_hrs": 3.5, "lat": 27.1751, "lon": 78.0421, "tags": "unesco, ivory marble mausoleum, shah jahan, mumtaz, yamuna river", "description": "The ultimate monument of eternal love, built of pristine white Makrana marble with exquisite semi-precious pietra dura inlay."},
    {"poi_id": "IND_UP_02", "name": "Kashi Vishwanath & Dashashwamedh Ganga Aarti", "city": "Varanasi", "region": "India", "state": "Uttar Pradesh", "country": "India", "category": "Spiritual & Sacred", "rating": 4.9, "entry_fee_inr": 0, "avg_spend_inr": 500, "ideal_duration_hrs": 3.5, "lat": 25.3076, "lon": 83.0107, "tags": "oldest living city, golden jyotirlinga temple, evening fire aarti, river ganga", "description": "The spiritual heartbeat of India on the banks of Holy Ganges featuring the Golden Kashi Vishwanath corridor and flaming aarti."},
    {"poi_id": "IND_DEL_01", "name": "Qutub Minar, Red Fort & Humayun's Tomb (UNESCO Trio)", "city": "Delhi", "region": "India", "state": "Delhi", "country": "India", "category": "UNESCO Architecture", "rating": 4.7, "entry_fee_inr": 150, "avg_spend_inr": 600, "ideal_duration_hrs": 4.0, "lat": 28.5245, "lon": 77.1855, "tags": "73m brick minaret, mughal red fort, garden tomb, chandni chowk", "description": "Historic monuments spanning Delhi Sultanate and Mughal dynasties, including the world's tallest brick minaret."},

    # ------------------- KARNATAKA & TAMIL NADU -------------------
    {"poi_id": "IND_KAR_01", "name": "Hampi UNESCO Ruins, Stone Chariot & Virupaksha", "city": "Hampi", "region": "India", "state": "Karnataka", "country": "India", "category": "UNESCO Ancient Ruins", "rating": 4.9, "entry_fee_inr": 100, "avg_spend_inr": 800, "ideal_duration_hrs": 4.5, "lat": 15.3350, "lon": 76.4600, "tags": "vijayanagara empire, boulder landscape, musical pillars, tungabhadra river", "description": "Ancient 14th-century capital of the Vijayanagara Empire with monolithic granite stone chariot and boulder-strewn landscape."},
    {"poi_id": "IND_KAR_02", "name": "Coorg Misty Coffee Plantations & Abbey Falls", "city": "Coorg", "region": "India", "state": "Karnataka", "country": "India", "category": "Coffee Estates & Nature", "rating": 4.7, "entry_fee_inr": 100, "avg_spend_inr": 1200, "ideal_duration_hrs": 3.5, "lat": 12.4244, "lon": 75.7382, "tags": "scotland of india, arabica coffee estate, dubare elephant camp, raja seat", "description": "The 'Scotland of India' blanketed in aromatic coffee plantations, cascading forest waterfalls, and Tibetan Golden Temple."},
    {"poi_id": "IND_TN_01", "name": "Ooty Nilgiri Mountain Toy Train & Doddabetta Peak", "city": "Ooty", "region": "India", "state": "Tamil Nadu", "country": "India", "category": "Heritage Toy Train & Hills", "rating": 4.8, "entry_fee_inr": 250, "avg_spend_inr": 1000, "ideal_duration_hrs": 4.0, "lat": 11.4102, "lon": 76.6950, "tags": "unesco steam toy train, queen of hill stations, botanical gardens, tea factory", "description": "UNESCO heritage steam railway chugging through blue Nilgiri mountains, botanical gardens, and chocolate factories."},
    {"poi_id": "IND_TN_02", "name": "Mahabalipuram Shore Temple & Pancha Rathas", "city": "Mahabalipuram", "region": "India", "state": "Tamil Nadu", "country": "India", "category": "UNESCO Rock-Cut Temples", "rating": 4.8, "entry_fee_inr": 100, "avg_spend_inr": 500, "ideal_duration_hrs": 3.0, "lat": 12.6167, "lon": 80.1917, "tags": "7th century pallava art, bay of bengal shore, monolith rathas", "description": "7th-century Pallava seaside sanctuary featuring monolithic granite chariots and open-air rock reliefs."},
    {"poi_id": "IND_TN_03", "name": "Kanyakumari Vivekananda Rock & Thiruvalluvar Memorial", "city": "Kanyakumari", "region": "India", "state": "Tamil Nadu", "country": "India", "category": "Coastal Confluence", "rating": 4.7, "entry_fee_inr": 150, "avg_spend_inr": 600, "ideal_duration_hrs": 3.0, "lat": 8.0780, "lon": 77.5550, "tags": "tri-sea confluence, southernmost tip of india, 133ft statue, sunrise sunset", "description": "The southernmost tip of mainland India where the Arabian Sea, Bay of Bengal, and Indian Ocean meet."},

    # ------------------- ANDAMAN & NORTH-EAST -------------------
    {"poi_id": "IND_AND_01", "name": "Havelock Island Radhanagar Beach (Asia's Best Beach)", "city": "Andaman", "region": "India", "state": "Andaman & Nicobar", "country": "India", "category": "Tropical Paradise", "rating": 5.0, "entry_fee_inr": 0, "avg_spend_inr": 2000, "ideal_duration_hrs": 4.0, "lat": 11.9844, "lon": 92.9511, "tags": "asia best beach, powdery white sands, turquoise water, elephant beach snorkeling", "description": "Crowned Asia's best beach with pristine white coral sand, vibrant coral reefs, sea turtle snorkeling, and scuba diving."},
    {"poi_id": "IND_NE_01", "name": "Cherrapunji Double Decker Living Root Bridges & Nohkalikai Falls", "city": "Meghalaya", "region": "India", "state": "Meghalaya", "country": "India", "category": "Bio-Engineering Wonder", "rating": 4.9, "entry_fee_inr": 100, "avg_spend_inr": 1000, "ideal_duration_hrs": 5.0, "lat": 25.2702, "lon": 91.7323, "tags": "living root bridges, khasi bioengineering, 340m plunge waterfall, dawki river", "description": "Centuries-old bio-engineered living tree root bridges spanning jungle streams and India's tallest 340m plunge waterfall."},
    {"poi_id": "IND_NE_02", "name": "Darjeeling Tiger Hill Kanchenjunga Sunrise & Tea Estates", "city": "Darjeeling", "region": "India", "state": "West Bengal", "country": "India", "category": "Himalayan Vistas & Tea", "rating": 4.8, "entry_fee_inr": 150, "avg_spend_inr": 800, "ideal_duration_hrs": 3.5, "lat": 27.0360, "lon": 88.2627, "tags": "world 3rd highest peak, kanchenjunga sunrise, darjeeling toy train, champagne of teas", "description": "Witness golden sunrise illuminating Mount Kanchenjunga (8,586m) and taste world-famous organic Darjeeling black tea."},
    {"poi_id": "IND_PB_01", "name": "Amritsar Golden Temple (Harmandir Sahib) & Wagah Border", "city": "Amritsar", "region": "India", "state": "Punjab", "country": "India", "category": "Spiritual & Patriotism", "rating": 5.0, "entry_fee_inr": 0, "avg_spend_inr": 500, "ideal_duration_hrs": 4.5, "lat": 31.6200, "lon": 74.8765, "tags": "golden sanctum, 24/7 langar kitchen, wagah border flag ceremony, jallianwala bagh", "description": "The holiest Sikh shrine clad in 750kg of pure gold serving 100,000 free meals daily, followed by the electrifying Wagah Border ceremony."}
]

def build_and_integrate():
    os.makedirs("datasets/destinations", exist_ok=True)
    os.makedirs("backend/app/ml/saved_models", exist_ok=True)

    # 1. Load existing world POIs and merge with complete India POIs
    existing_world_pois = []
    if os.path.exists("datasets/destinations/destinations_rich_knowledge.json"):
        with open("datasets/destinations/destinations_rich_knowledge.json", "r", encoding="utf-8") as f:
            existing = json.load(f)
            # Filter out non-India to avoid duplication
            existing_world_pois = [p for p in existing if p.get("country") != "India"]

    combined_pois = ALL_INDIA_POIS + existing_world_pois
    print(f"[OK] Total combined POIs: {len(combined_pois)} ({len(ALL_INDIA_POIS)} Indian POIs across all states, {len(existing_world_pois)} Global POIs)")

    # 2. Save JSON knowledge base
    with open("datasets/destinations/destinations_rich_knowledge.json", "w", encoding="utf-8") as f:
        json.dump(combined_pois, f, indent=2, ensure_ascii=False)

    # 3. Save CSV dataset
    df = pd.DataFrame(combined_pois)
    df.to_csv("datasets/destinations/destinations_attractions.csv", index=False)
    print(f"[OK] Saved destinations_attractions.csv with {len(df)} records across {df['city'].nunique()} cities!")

    # 4. Re-train TF-IDF Semantic Vector Matrix for RAG Engine
    corpus = [
        f"{d['name']} in {d['city']}, {d.get('state', '')}, {d['country']}. Region: {d.get('region', '')}. Category: {d['category']}. Tags: {d['tags']}. {d['description']}"
        for d in combined_pois
    ]
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    joblib.dump(vectorizer, "backend/app/ml/saved_models/destinations_tfidf_vectorizer.joblib")
    joblib.dump(tfidf_matrix, "backend/app/ml/saved_models/destinations_tfidf_matrix.joblib")
    print(f"[OK] Trained TF-IDF vector matrix on {len(corpus)} documents with shape {tfidf_matrix.shape}")

    # 5. Re-train Content-Based Similarity Matrix
    sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    joblib.dump(sim_matrix, "backend/app/ml/saved_models/destinations_similarity_matrix.joblib")
    print(f"[OK] Trained Recommender similarity matrix with shape {sim_matrix.shape}")

if __name__ == "__main__":
    build_and_integrate()
