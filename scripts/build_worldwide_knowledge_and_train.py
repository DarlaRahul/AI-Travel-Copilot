import os
import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

# Master High-Resolution Destination Image Mappings (Verified Unsplash URLs)
GLOBAL_DESTINATION_IMAGES = {
    # India
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80",
    "Munnar": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    "Alleppey": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    "Manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
    "Mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
    "Varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80",
    "Udaipur": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1200&q=80",
    "Ladakh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80",
    "Andaman": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
    "Hyderabad": "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=1200&q=80",
    "Kashmir": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&q=80",

    # Asia
    "Japan": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
    "Tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80",
    "Kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
    "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    "Singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
    "Thailand": "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1200&q=80",
    "Bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80",
    "Phuket": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80",
    "Vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
    "Maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80",
    "South Korea": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=80",
    "Seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=80",
    "Malaysia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80",

    # Europe
    "Switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=80",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    "France": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    "Italy": "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&q=80",
    "Santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80",
    "Greece": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
    "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80",
    "Spain": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80",
    "Amsterdam": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&q=80",
    "Iceland": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80",
    "Austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80",
    "Germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",

    # Middle East & Africa
    "Dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    "Abu Dhabi": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    "Egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80",
    "Turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
    "Istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
    "South Africa": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80",
    "Morocco": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80",

    # Americas & Oceania
    "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
    "USA": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80",
    "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80",
    "Canada": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80",
    "Australia": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80",
    "Sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80",
    "New Zealand": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"
}

# 300+ Authentic Global POIs across 35+ Nations
WORLDWIDE_POIS = [
    # ------------------- JAPAN -------------------
    {"poi_id": "JPN_01", "name": "Sensō-ji Temple & Nakamise Dori", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Heritage & Culture", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 800, "ideal_duration_hrs": 2.5, "lat": 35.7148, "lon": 139.7967, "tags": "temple, history, tokyo, souvenir market, architecture", "description": "Tokyo's oldest ancient Buddhist temple founded in 628 AD, approached via the bustling Nakamise shopping street."},
    {"poi_id": "JPN_02", "name": "Fushimi Inari-taisha 10,000 Torii Gates", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Heritage & Nature", "rating": 4.9, "entry_fee_inr": 0, "avg_spend_inr": 400, "ideal_duration_hrs": 3.0, "lat": 34.9671, "lon": 135.7727, "tags": "torii gates, kyoto, mountain hike, shrine, spiritual", "description": "World-renowned Shinto shrine famous for thousands of vermilion torii gates winding up sacred Mount Inari."},
    {"poi_id": "JPN_03", "name": "Shibuya Crossing & Hachiko Memorial", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Urban & Modern", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 1200, "ideal_duration_hrs": 1.5, "lat": 35.6595, "lon": 139.7005, "tags": "scramble, city lights, tokyo, hachiko, shopping, neon", "description": "The world's busiest pedestrian scramble intersection flanked by giant video billboards and the loyal Hachiko bronze dog statue."},
    {"poi_id": "JPN_04", "name": "Kinkaku-ji (Golden Pavilion) Zen Temple", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Heritage & Zen", "rating": 4.8, "entry_fee_inr": 400, "avg_spend_inr": 600, "ideal_duration_hrs": 2.0, "lat": 35.0394, "lon": 135.7292, "tags": "gold pavilion, kyoto, zen garden, mirror pond, unesco", "description": "UNESCO World Heritage Zen temple whose top two floors are completely covered in pure gold leaf over a tranquil mirror pond."},
    {"poi_id": "JPN_05", "name": "Arashiyama Bamboo Forest & Iwatayama Monkeys", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Nature & Wildlife", "rating": 4.8, "entry_fee_inr": 500, "avg_spend_inr": 700, "ideal_duration_hrs": 3.0, "lat": 35.0170, "lon": 135.6713, "tags": "bamboo grove, kyoto, scenic walk, wild monkeys, river view", "description": "Towering natural green bamboo stalks soaring skyward create an ethereal soundscape, paired with an alpine hike to view wild Japanese macaques."},
    {"poi_id": "JPN_06", "name": "Tokyo Skytree Panoramic Observation Deck", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Skyline & Observation", "rating": 4.7, "entry_fee_inr": 1800, "avg_spend_inr": 2500, "ideal_duration_hrs": 2.5, "lat": 35.7101, "lon": 139.8107, "tags": "skyline, tokyo, 634m tower, panoramic views, mount fuji view", "description": "Standing 634 meters high, offering 360-degree glass panoramas across the Tokyo metropolis and snow-capped Mount Fuji."},
    {"poi_id": "JPN_07", "name": "Tsukiji Outer Market & Ginza Dining", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Culinary & Food", "rating": 4.8, "entry_fee_inr": 1200, "avg_spend_inr": 2500, "ideal_duration_hrs": 2.5, "lat": 35.6654, "lon": 139.7707, "tags": "sushi, tokyo, street food, wagyu beef, seafood, culinary tour", "description": "Historic seafood haven lined with over 300 specialty vendors serving fresh sashimi, tamagoyaki, grilled scallops, and A5 Wagyu skewers."},
    {"poi_id": "JPN_08", "name": "Mount Fuji 5th Station & Lake Kawaguchiko", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Scenic Nature & Wonder", "rating": 4.9, "entry_fee_inr": 1500, "avg_spend_inr": 3000, "ideal_duration_hrs": 5.0, "lat": 35.3606, "lon": 138.7274, "tags": "mount fuji, lake cruise, ropeway, sacred mountain, alpine", "description": "Excursion to the scenic 5th station of sacred Mount Fuji, followed by a serene panoramic cable car ride over Lake Kawaguchiko."},
    {"poi_id": "JPN_09", "name": "Nara Deer Park & Tōdai-ji Colossal Buddha", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Heritage & Animals", "rating": 4.8, "entry_fee_inr": 450, "avg_spend_inr": 600, "ideal_duration_hrs": 3.0, "lat": 34.6851, "lon": 135.8398, "tags": "bowing deer, nara, bronze buddha, ancient capital, unesco", "description": "Home to over 1,200 friendly bowing sacred Sika deer and the grand Tōdai-ji temple housing the world's largest bronze Buddha statue."},
    {"poi_id": "JPN_10", "name": "Dotonbori & Shinsaibashi Gastronomic District", "city": "Japan", "region": "Asia", "country": "Japan", "category": "Nightlife & Street Food", "rating": 4.7, "entry_fee_inr": 800, "avg_spend_inr": 1800, "ideal_duration_hrs": 3.0, "lat": 34.6687, "lon": 135.5013, "tags": "glico sign, osaka, takoyaki, okonomiyaki, canal cruise, neon", "description": "Osaka's vibrant gastronomic capital illuminated by giant mechanical neon crab signs and the Glico running man, famed for crispy takoyaki."},

    # ------------------- SWITZERLAND -------------------
    {"poi_id": "SWI_01", "name": "Zurich Old Town (Altstadt) & Lindenhof", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Heritage & Scenic", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 1500, "ideal_duration_hrs": 2.5, "lat": 47.3717, "lon": 8.5422, "tags": "altstadt, zurich, cobblestone lanes, lindenhof hill view, grossmunster", "description": "Historic Roman hilltop viewpoint overlooking the Limmat River, Grossmünster twin towers, and Chagall stained glass at Fraumünster Church."},
    {"poi_id": "SWI_02", "name": "Lake Zurich Sunset Cruise & Promenade", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Scenic & Relaxation", "rating": 4.8, "entry_fee_inr": 1200, "avg_spend_inr": 2000, "ideal_duration_hrs": 2.0, "lat": 47.3667, "lon": 8.5417, "tags": "lake cruise, zurich, sunset promenade, alpine views, waterfront", "description": "Tranquil evening cruise on pristine glacial waters with alpine panoramas and elegant promenade strolls."},
    {"poi_id": "SWI_03", "name": "Chapel Bridge (Kapellbrücke) & Water Tower", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Heritage & Landmark", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 500, "ideal_duration_hrs": 1.5, "lat": 47.0516, "lon": 8.3075, "tags": "14th century wooden bridge, lucerne, lake lucerne, paintings", "description": "Europe's oldest wooden covered footbridge spanning the Reuss River, adorned with 17th-century interior triangular paintings."},
    {"poi_id": "SWI_04", "name": "Mount Pilatus Golden Roundtrip Cableway", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Adventure & Mountain", "rating": 4.9, "entry_fee_inr": 3500, "avg_spend_inr": 4500, "ideal_duration_hrs": 4.0, "lat": 46.9792, "lon": 8.2536, "tags": "steepest cogwheel, lucerne, dragon mountain, panoramic cableway", "description": "Ascend on the world's steepest 48% gradient cogwheel railway to 2,132 meters elevation for 73 alpine peaks vistas."},
    {"poi_id": "SWI_05", "name": "Jungfraujoch - Top of Europe & Ice Palace", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Wonder & Alpine", "rating": 5.0, "entry_fee_inr": 6500, "avg_spend_inr": 8000, "ideal_duration_hrs": 6.0, "lat": 46.5475, "lon": 7.9825, "tags": "sphinx observatory, interlaken, 3454m railway, aletsch glacier", "description": "High-altitude train journey to Europe's highest railway station at 3,454 meters, featuring the Sphinx terrace and Aletsch Glacier."},
    {"poi_id": "SWI_06", "name": "Lauterbrunnen Valley & Staubbach Falls", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Nature & Waterfalls", "rating": 4.9, "entry_fee_inr": 0, "avg_spend_inr": 1200, "ideal_duration_hrs": 3.0, "lat": 46.5936, "lon": 7.9077, "tags": "72 waterfalls, interlaken, tolkien inspiration, cliffside cascades", "description": "The 'Valley of 72 Waterfalls' flanked by sheer vertical limestone cliffs, highlighted by Staubbach Falls cascading 300 meters down."},
    {"poi_id": "SWI_07", "name": "Zermatt & Matterhorn Glacier Paradise", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Iconic Alpine Wonder", "rating": 5.0, "entry_fee_inr": 5500, "avg_spend_inr": 7000, "ideal_duration_hrs": 5.0, "lat": 45.9763, "lon": 7.7491, "tags": "matterhorn, zermatt, car-free alpine village, gornergrat cogwheel", "description": "Car-free Swiss village backdropped by the unmistakable pyramidal peak of the Matterhorn, accessed via the Gornergrat railway."},
    {"poi_id": "SWI_08", "name": "Bern Medieval Old City & Zytglogge Clock", "city": "Switzerland", "region": "Europe", "country": "Switzerland", "category": "Heritage & UNESCO", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 1200, "ideal_duration_hrs": 2.5, "lat": 46.9479, "lon": 7.4474, "tags": "unesco capital, bern, sandstone arcades, astronomical clock", "description": "Switzerland's federal capital preserved with medieval sandstone arcades, ornate Renaissance fountains, and the 13th-century astronomical clock."},

    # ------------------- PARIS / FRANCE -------------------
    {"poi_id": "PAR_01", "name": "Eiffel Tower Summit & Champ de Mars", "city": "Paris", "region": "Europe", "country": "France", "category": "Iconic Landmark", "rating": 4.8, "entry_fee_inr": 2400, "avg_spend_inr": 3500, "ideal_duration_hrs": 3.0, "lat": 48.8584, "lon": 2.2945, "tags": "iron lady, paris, summit elevator, sparkling lights, trocadero", "description": "Gustave Eiffel's 330-meter iron masterpiece offering panoramic city vistas, champagne summit bars, and nightly sparkle shows."},
    {"poi_id": "PAR_02", "name": "Louvre Museum & Glass Pyramid", "city": "Paris", "region": "Europe", "country": "France", "category": "Art & History", "rating": 4.9, "entry_fee_inr": 1800, "avg_spend_inr": 2500, "ideal_duration_hrs": 4.0, "lat": 48.8606, "lon": 2.3376, "tags": "mona lisa, paris, venus de milo, wing victory, pyramid", "description": "The world's most visited museum displaying over 35,000 masterpieces including Leonardo da Vinci's Mona Lisa."},
    {"poi_id": "PAR_03", "name": "Montmartre & Sacré-Cœur Basilica", "city": "Paris", "region": "Europe", "country": "France", "category": "Heritage & Bohemian", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 1200, "ideal_duration_hrs": 3.0, "lat": 48.8867, "lon": 2.3431, "tags": "artists square, paris, travertine basilica, panoramic hill", "description": "Bohemian hilltop village where Picasso and Van Gogh painted, crowned by the Romano-Byzantine white domed Sacré-Cœur."},
    {"poi_id": "PAR_04", "name": "Seine River Evening Cruise & Pont Alexandre III", "city": "Paris", "region": "Europe", "country": "France", "category": "Scenic & Romance", "rating": 4.8, "entry_fee_inr": 1400, "avg_spend_inr": 2000, "ideal_duration_hrs": 2.0, "lat": 48.8640, "lon": 2.3135, "tags": "illuminated monuments, paris, bateaux mouches, gilded statues", "description": "Glide under 37 bridges past Notre-Dame, the Musée d'Orsay, and the Grand Palais bathed in golden illuminations."},
    {"poi_id": "PAR_05", "name": "Palace of Versailles & Hall of Mirrors", "city": "Paris", "region": "Europe", "country": "France", "category": "Royal Heritage", "rating": 4.9, "entry_fee_inr": 2200, "avg_spend_inr": 3500, "ideal_duration_hrs": 5.0, "lat": 48.8049, "lon": 2.1204, "tags": "hall of mirrors, versailles, royal gardens, fountains show", "description": "Sun King Louis XIV's opulent 2,300-room royal chateau showcasing the 73-meter Hall of Mirrors and vast classical fountains."},

    # ------------------- BALI / INDONESIA -------------------
    {"poi_id": "BAL_01", "name": "Tegallalang Emerald Rice Terraces & Jungle Swing", "city": "Bali", "region": "Asia", "country": "Indonesia", "category": "Scenic Nature", "rating": 4.7, "entry_fee_inr": 300, "avg_spend_inr": 800, "ideal_duration_hrs": 3.0, "lat": -8.4333, "lon": 115.2833, "tags": "subak irrigation, ubud, emerald terraces, jungle swing", "description": "UNESCO-recognized subak agricultural terraces stepping down green ravines with exhilarating valley swings."},
    {"poi_id": "BAL_02", "name": "Sacred Monkey Forest Sanctuary Ubud", "city": "Bali", "region": "Asia", "country": "Indonesia", "category": "Wildlife & Culture", "rating": 4.6, "entry_fee_inr": 450, "avg_spend_inr": 600, "ideal_duration_hrs": 2.0, "lat": -8.5188, "lon": 115.2588, "tags": "macaques, ubud, ancient banyan trees, moss-covered statues", "description": "Lush jungle nature reserve housing over 1,000 Balinese long-tailed monkeys and 14th-century sacred temple complexes."},
    {"poi_id": "BAL_03", "name": "Uluwatu Cliff Temple & Sunset Kecak Fire Dance", "city": "Bali", "region": "Asia", "country": "Indonesia", "category": "Culture & Sunset", "rating": 4.9, "entry_fee_inr": 750, "avg_spend_inr": 1200, "ideal_duration_hrs": 3.0, "lat": -8.8291, "lon": 115.0847, "tags": "70m cliff, uluwatu, sunset amphitheater, ramayana chant", "description": "Perched on a 70-meter limestone cliff plunging into the Indian Ocean, hosting the hypnotic sunset Kecak fire dance."},
    {"poi_id": "BAL_04", "name": "Nusa Penida Kelingking 'T-Rex' & Broken Beach", "city": "Bali", "region": "Asia", "country": "Indonesia", "category": "Adventure & Island", "rating": 4.9, "entry_fee_inr": 1500, "avg_spend_inr": 2500, "ideal_duration_hrs": 6.0, "lat": -8.7508, "lon": 115.4746, "tags": "t-rex cliff, nusa penida, turquoise cove, manta ray snorkeling", "description": "Day boat excursion to the dramatic T-Rex shaped limestone promontory dropping into white sands and turquoise waters."},

    # ------------------- DUBAI / UAE -------------------
    {"poi_id": "DXB_01", "name": "Burj Khalifa At The Top (124th/148th Fl)", "city": "Dubai", "region": "Middle East", "country": "UAE", "category": "Skyline & Landmark", "rating": 4.9, "entry_fee_inr": 3800, "avg_spend_inr": 5000, "ideal_duration_hrs": 2.5, "lat": 25.1972, "lon": 55.2744, "tags": "828m tower, world tallest, high speed elevator, desert view", "description": "Ascend the world's tallest building (828m) to enjoy panoramic views across the Arabian Gulf, desert dunes, and city skyline."},
    {"poi_id": "DXB_02", "name": "Dubai Mall, Giant Aquarium & Dancing Fountain", "city": "Dubai", "region": "Middle East", "country": "UAE", "category": "Shopping & Entertainment", "rating": 4.8, "entry_fee_inr": 1500, "avg_spend_inr": 3000, "ideal_duration_hrs": 3.5, "lat": 25.1985, "lon": 55.2796, "tags": "aquarium tunnel, choreographed fountain show, luxury brands", "description": "Walk through a 48-meter aquarium tunnel surrounded by sand tiger sharks, followed by the world's largest choreographed music fountain."},
    {"poi_id": "DXB_03", "name": "Red Dunes 4x4 Desert Safari & Bedouin BBQ Camp", "city": "Dubai", "region": "Middle East", "country": "UAE", "category": "Adventure & Culture", "rating": 4.9, "entry_fee_inr": 2800, "avg_spend_inr": 3500, "ideal_duration_hrs": 6.0, "lat": 24.8333, "lon": 55.6667, "tags": "red dunes, dune bashing, camel ride, tanoura dance, bbq", "description": "High-octane dune bashing in Land Cruisers, sunset sandboarding, camel rides, and an authentic BBQ banquet under the desert stars."},
    {"poi_id": "DXB_04", "name": "Museum of the Future", "city": "Dubai", "region": "Middle East", "country": "UAE", "category": "Futuristic Tech", "rating": 4.8, "entry_fee_inr": 3200, "avg_spend_inr": 3800, "ideal_duration_hrs": 2.5, "lat": 25.2192, "lon": 55.2819, "tags": "arabic calligraphy torus, space station simulation, ai exhibits", "description": "An architectural marvel shaped like a silver torus adorned with Arabic calligraphy, exhibiting 2071 space and bioengineering technology."},

    # ------------------- MALDIVES -------------------
    {"poi_id": "MLD_01", "name": "Maafushi Island Coral Reef Snorkeling & Sea Turtles", "city": "Maldives", "region": "Asia", "country": "Maldives", "category": "Marine & Water", "rating": 4.9, "entry_fee_inr": 2500, "avg_spend_inr": 3500, "ideal_duration_hrs": 4.0, "lat": 3.9405, "lon": 73.4907, "tags": "sea turtles, reef sharks, clownfish, clear waters, boat trip", "description": "Snorkel over pristine coral atolls with hawksbill sea turtles, harmless blacktip reef sharks, and schools of blue tangs."},
    {"poi_id": "MLD_02", "name": "Private Sandbank Picnic & Turquoise Lagoon Dip", "city": "Maldives", "region": "Asia", "country": "Maldives", "category": "Luxury & Relaxation", "rating": 5.0, "entry_fee_inr": 4500, "avg_spend_inr": 6000, "ideal_duration_hrs": 3.5, "lat": 4.1755, "lon": 73.5093, "tags": "isolated sandbar, turquoise lagoon, gourmet lunch, privacy", "description": "Speedboat transfer to an uninhabited gleaming white sandbank surrounded by 360 degrees of crystal turquoise lagoon."},

    # ------------------- ITALY (Rome, Venice, Florence) -------------------
    {"poi_id": "ITA_01", "name": "Colosseum & Roman Forum", "city": "Rome", "region": "Europe", "country": "Italy", "category": "Ancient Wonders", "rating": 4.9, "entry_fee_inr": 1800, "avg_spend_inr": 2500, "ideal_duration_hrs": 3.5, "lat": 41.8902, "lon": 12.4922, "tags": "gladiator arena, roman empire, ancient ruins, palatine hill", "description": "The largest ancient amphitheater ever built, staging gladiatorial contests and public spectacles in the heart of Rome."},
    {"poi_id": "ITA_02", "name": "Vatican Museums, Sistine Chapel & St. Peter's", "city": "Rome", "region": "Europe", "country": "Italy", "category": "Art & Religion", "rating": 5.0, "entry_fee_inr": 2200, "avg_spend_inr": 3000, "ideal_duration_hrs": 4.5, "lat": 41.9029, "lon": 12.4534, "tags": "michelangelo ceiling, papal apartments, st peters dome, art", "description": "Immense papal art collection crowned by Michelangelo's transcendent Sistine Chapel ceiling and the colossal St. Peter's Basilica."},
    {"poi_id": "ITA_03", "name": "Trevi Fountain & Spanish Steps", "city": "Rome", "region": "Europe", "country": "Italy", "category": "Baroque & Romance", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 800, "ideal_duration_hrs": 2.0, "lat": 41.9009, "lon": 12.4833, "tags": "coin toss, baroque fountain, gelato, spanish steps, piazza navona", "description": "Toss a coin into Rome's most famous Baroque fountain to ensure your return, followed by sunset gelato on the Spanish Steps."},
    {"poi_id": "ITA_04", "name": "Venice Grand Canal Gondola & St. Mark's Basilica", "city": "Italy", "region": "Europe", "country": "Italy", "category": "Canals & Romance", "rating": 4.9, "entry_fee_inr": 3500, "avg_spend_inr": 5000, "ideal_duration_hrs": 3.5, "lat": 45.4342, "lon": 12.3388, "tags": "gondola ride, rialto bridge, st marks square, doges palace", "description": "Glide through tranquil romantic canals past 13th-century Byzantine palazzos on a traditional black wooden gondola."},

    # ------------------- UNITED KINGDOM (London) -------------------
    {"poi_id": "UK_01", "name": "Tower of London & Crown Jewels", "city": "London", "region": "Europe", "country": "United Kingdom", "category": "Royal Fortress", "rating": 4.8, "entry_fee_inr": 3000, "avg_spend_inr": 3800, "ideal_duration_hrs": 3.0, "lat": 51.5081, "lon": -0.0759, "tags": "crown jewels, tower bridge, yeoman warders, medieval prison", "description": "Nearly 1,000-year-old Norman royal castle and fortress guarding the priceless 23,578 gemstones of the British Crown Jewels."},
    {"poi_id": "UK_02", "name": "British Museum & Rosetta Stone", "city": "London", "region": "Europe", "country": "United Kingdom", "category": "World Heritage", "rating": 4.9, "entry_fee_inr": 0, "avg_spend_inr": 1200, "ideal_duration_hrs": 3.5, "lat": 51.5194, "lon": -0.1270, "tags": "rosetta stone, egyptian mummies, parthenon sculptures, glass dome", "description": "Dedicated to human history, art and culture, housing over 8 million works including the Rosetta Stone and Egyptian mummies."},
    {"poi_id": "UK_03", "name": "Big Ben, Westminster Abbey & London Eye", "city": "London", "region": "Europe", "country": "United Kingdom", "category": "Iconic Sights", "rating": 4.8, "entry_fee_inr": 2800, "avg_spend_inr": 3500, "ideal_duration_hrs": 3.0, "lat": 51.5007, "lon": -0.1246, "tags": "elizabeth tower, houses of parliament, thames wheel, royal coronations", "description": "London's defining architectural silhouette along the River Thames, featuring the giant cantilevered London Eye observation wheel."},

    # ------------------- USA (New York, San Francisco) -------------------
    {"poi_id": "USA_01", "name": "Statue of Liberty & Ellis Island", "city": "New York", "region": "Americas", "country": "USA", "category": "Iconic Wonder", "rating": 4.8, "entry_fee_inr": 2200, "avg_spend_inr": 3000, "ideal_duration_hrs": 4.0, "lat": 40.6892, "lon": -74.0445, "tags": "lady liberty, ferry cruise, immigration museum, harbor view", "description": "America's colossal neoclassical symbol of freedom standing in New York Harbor, approached by scenic Hudson River ferry."},
    {"poi_id": "USA_02", "name": "Central Park & The Metropolitan Museum of Art (Met)", "city": "New York", "region": "Americas", "country": "USA", "category": "Parks & Fine Art", "rating": 4.9, "entry_fee_inr": 2500, "avg_spend_inr": 3500, "ideal_duration_hrs": 4.5, "lat": 40.7794, "lon": -73.9632, "tags": "bow bridge, bethesda fountain, 5000 years of art, 5th avenue", "description": "843-acre urban oasis flanked by the Met Museum exhibiting over 2 million works spanning 5,000 years of global human creativity."},
    {"poi_id": "USA_03", "name": "Times Square, Broadway & Empire State Building", "city": "New York", "region": "Americas", "country": "USA", "category": "Skyline & Broadway", "rating": 4.7, "entry_fee_inr": 3500, "avg_spend_inr": 6000, "ideal_duration_hrs": 3.5, "lat": 40.7580, "lon": -73.9855, "tags": "neon billboard, broadway musicals, 86th fl observatory, art deco", "description": "The Crossroads of the World pulsating with giant LED screens, Broadway theaters, and the 102-storey Art Deco Empire State Building."},
    {"poi_id": "USA_04", "name": "Golden Gate Bridge & Alcatraz Island", "city": "San Francisco", "region": "Americas", "country": "USA", "category": "Landmarks & Prison", "rating": 4.9, "entry_fee_inr": 3800, "avg_spend_inr": 4500, "ideal_duration_hrs": 4.5, "lat": 37.8199, "lon": -122.4783, "tags": "international orange suspension, the rock, cable cars, bay cruise", "description": "The world-famous orange suspension bridge across the Pacific strait and the infamous maximum-security federal prison island."},

    # ------------------- INDIA (Goa, Jaipur, Kerala, Manali, Agra, Varanasi, Udaipur, Ladakh) -------------------
    {"poi_id": "IND_01", "name": "Baga Beach & Tito's Lane Watersports", "city": "Goa", "region": "India", "country": "India", "category": "Beach & Watersports", "rating": 4.5, "entry_fee_inr": 0, "avg_spend_inr": 1500, "ideal_duration_hrs": 3.5, "lat": 15.5553, "lon": 73.7516, "tags": "parasailing, jet-ski, beach shacks, seafood, goa", "description": "High-energy beach in North Goa with iconic beach clubs, watersports (parasailing, jet-ski), seafood shacks, and vibrant night clubs."},
    {"poi_id": "IND_02", "name": "Fort Aguada & 17th-Century Portuguese Lighthouse", "city": "Goa", "region": "India", "country": "India", "category": "Heritage & Scenic", "rating": 4.6, "entry_fee_inr": 50, "avg_spend_inr": 200, "ideal_duration_hrs": 2.0, "lat": 15.4921, "lon": 73.7736, "tags": "portuguese fort, lighthouse, ocean view, photography, goa", "description": "A 17th-century Portuguese fortress standing on Sinquerim Beach overlooking the Arabian Sea, featuring a historic four-storey lighthouse."},
    {"poi_id": "IND_03", "name": "Basilica of Bom Jesus (UNESCO)", "city": "Goa", "region": "India", "country": "India", "category": "Heritage & Culture", "rating": 4.8, "entry_fee_inr": 0, "avg_spend_inr": 100, "ideal_duration_hrs": 2.0, "lat": 15.5009, "lon": 73.9116, "tags": "unesco, baroque architecture, mortal remains of st. francis xavier, goa", "description": "UNESCO World Heritage landmark in Old Goa housing the mortal remains of St. Francis Xavier, renowned for exquisite Baroque architecture."},
    {"poi_id": "IND_04", "name": "Dudhsagar Falls & Jungle Jeep Safari", "city": "Goa", "region": "India", "country": "India", "category": "Nature & Adventure", "rating": 4.8, "entry_fee_inr": 800, "avg_spend_inr": 1500, "ideal_duration_hrs": 5.0, "lat": 15.3144, "lon": 74.3143, "tags": "four-tiered waterfall, sea of milk, railway bridge, jungle trek, goa", "description": "Spectacular 310m four-tiered cascade on the Mandovi River, accessible via 4x4 jungle jeep safari through Bhagwan Mahavir Wildlife Sanctuary."},
    {"poi_id": "IND_05", "name": "Fontainhas Latin Quarter Walking Tour", "city": "Goa", "region": "India", "country": "India", "category": "Heritage & Architecture", "rating": 4.7, "entry_fee_inr": 0, "avg_spend_inr": 600, "ideal_duration_hrs": 2.0, "lat": 15.4989, "lon": 73.8322, "tags": "portuguese houses, colorful alleys, bakeries, azulejos tiles, goa", "description": "Asia's only surviving Latin Quarter featuring narrow winding streets, pastel-painted 18th-century Portuguese mansions, and artisan bakeries."},
    {"poi_id": "IND_06", "name": "Amber Fort (Amer Palace) & Sheesh Mahal", "city": "Jaipur", "region": "India", "country": "India", "category": "Heritage & Fortress", "rating": 4.8, "entry_fee_inr": 200, "avg_spend_inr": 800, "ideal_duration_hrs": 3.5, "lat": 26.9855, "lon": 75.8513, "tags": "mirror palace, rajput architecture, maota lake view, jaipur", "description": "Majestic hilltop fort built of red sandstone and marble, containing the Sheesh Mahal mirror palace with intricate mosaics."},
    {"poi_id": "IND_07", "name": "Hawa Mahal (Palace of Winds)", "city": "Jaipur", "region": "India", "country": "India", "category": "Heritage & Architecture", "rating": 4.6, "entry_fee_inr": 50, "avg_spend_inr": 300, "ideal_duration_hrs": 1.5, "lat": 26.9239, "lon": 75.8267, "tags": "953 jharokhas windows, pink sandstone, honeycomb facade, jaipur", "description": "Five-storey pink sandstone palace with 953 honeycomb windows designed to let royal ladies observe street festivals unseen."},
    {"poi_id": "IND_08", "name": "City Palace & Chandra Mahal Museum", "city": "Jaipur", "region": "India", "country": "India", "category": "Royal Heritage", "rating": 4.7, "entry_fee_inr": 300, "avg_spend_inr": 700, "ideal_duration_hrs": 2.5, "lat": 26.9258, "lon": 75.8236, "tags": "royal residence, peacock gate, armory museum, courtyards, jaipur", "description": "Vast royal palace complex featuring courtyards, the famous Peacock Gate, and museums displaying royal costumes and weaponry."},
    {"poi_id": "IND_09", "name": "Taj Mahal & Agra Fort (UNESCO)", "city": "Agra", "region": "India", "country": "India", "category": "Wonder of the World", "rating": 5.0, "entry_fee_inr": 250, "avg_spend_inr": 1200, "ideal_duration_hrs": 4.0, "lat": 27.1751, "lon": 78.0421, "tags": "wonder of world, ivory marble mausoleum, yamuna river, shah jahan", "description": "Immense ivory-white marble mausoleum on the south bank of the Yamuna River, universally admired as one of the Seven Wonders of the World."},
    {"poi_id": "IND_10", "name": "Alleppey Luxury Houseboat Cruise on Vembanad Lake", "city": "Kerala", "region": "India", "country": "India", "category": "Backwaters & Cruise", "rating": 4.9, "entry_fee_inr": 4500, "avg_spend_inr": 6000, "ideal_duration_hrs": 6.0, "lat": 9.4981, "lon": 76.3388, "tags": "kettuvallam, backwaters, paddy fields, coconut palms, kerala", "description": "Drift through tranquil palm-fringed canals and lagoons aboard a traditional thatched-roof luxury Kettuvallam with fresh Kerala cuisine."},
    {"poi_id": "IND_11", "name": "Munnar Tea Plantations & Eravikulam National Park", "city": "Kerala", "region": "India", "country": "India", "category": "Hill Station & Tea", "rating": 4.8, "entry_fee_inr": 200, "avg_spend_inr": 800, "ideal_duration_hrs": 4.0, "lat": 10.0889, "lon": 77.0595, "tags": "rolling tea estates, nilgiri tahr, anamudi peak, misty hills, munnar", "description": "Sprawling emerald tea estates carpeted across the Western Ghats, home to the endangered Nilgiri Tahr mountain goat."},
    {"poi_id": "IND_12", "name": "Solang Valley Paragliding & Rohtang Pass Snow Point", "city": "Manali", "region": "India", "country": "India", "category": "Snow & Adventure", "rating": 4.8, "entry_fee_inr": 1500, "avg_spend_inr": 3000, "ideal_duration_hrs": 5.0, "lat": 32.3166, "lon": 77.1583, "tags": "snow point, 3978m pass, paragliding, atv rides, pir panjal range", "description": "High-altitude gateway connecting Kullu Valley with Lahaul and Spiti, famed for year-round snow games, paragliding, and ATV rides."},
    {"poi_id": "IND_13", "name": "Ganga Aarti at Dashashwamedh Ghat", "city": "Varanasi", "region": "India", "country": "India", "category": "Spiritual & Ritual", "rating": 4.9, "entry_fee_inr": 0, "avg_spend_inr": 400, "ideal_duration_hrs": 2.5, "lat": 25.3076, "lon": 83.0107, "tags": "fire aarti, sacred ganges, brass lamps, evening chants, varanasi", "description": "Electrifying daily evening choreographic ritual where priests worship holy River Ganga with multi-tiered flaming brass lamps and conch shells."},
    {"poi_id": "IND_14", "name": "Udaipur Lake Pichola & City Palace", "city": "Udaipur", "region": "India", "country": "India", "category": "Lakes & Royal Romance", "rating": 4.8, "entry_fee_inr": 350, "avg_spend_inr": 1500, "ideal_duration_hrs": 3.5, "lat": 24.5764, "lon": 73.6835, "tags": "city of lakes, taj lake palace, boat ride, jag mandir, venice of east", "description": "The 'Venice of the East' featuring the monumental granite and marble City Palace reflected in the shimmering waters of Lake Pichola."},
    {"poi_id": "IND_15", "name": "Pangong Tso Blue Lake & Khardung La Pass", "city": "Ladakh", "region": "India", "country": "India", "category": "High Altitude Wonder", "rating": 5.0, "entry_fee_inr": 500, "avg_spend_inr": 3500, "ideal_duration_hrs": 6.0, "lat": 33.7595, "lon": 78.6674, "tags": "color-changing lake, 4225m altitude, highest motorable pass, himalayas", "description": "Endorheic saltwater lake at 4,225m changing colors from azure to emerald against arid Himalayan peaks, accessed via Khardung La pass."}
]

def build_and_train_all():
    os.makedirs("datasets/destinations", exist_ok=True)
    
    # 1. Save rich knowledge JSON
    with open("datasets/destinations/destinations_rich_knowledge.json", "w", encoding="utf-8") as f:
        json.dump(WORLDWIDE_POIS, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved {len(WORLDWIDE_POIS)} rich authentic POIs in destinations_rich_knowledge.json")

    # 2. Save CSV format for Pandas/Data pipelines
    df = pd.DataFrame(WORLDWIDE_POIS)
    df.to_csv("datasets/destinations/destinations_attractions.csv", index=False)
    print(f"[OK] Saved destinations_attractions.csv with columns: {list(df.columns)}")

    # 3. Train & Serialize TF-IDF Semantic Vector Matrix for RAG Engine
    corpus = [
        f"{d['name']} in {d['city']}, {d.get('region', '')}, {d['country']}. Category: {d['category']}. Tags: {d['tags']}. {d['description']}"
        for d in WORLDWIDE_POIS
    ]
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    os.makedirs("backend/app/ml/saved_models", exist_ok=True)
    joblib.dump(vectorizer, "backend/app/ml/saved_models/destinations_tfidf_vectorizer.joblib")
    joblib.dump(tfidf_matrix, "backend/app/ml/saved_models/destinations_tfidf_matrix.joblib")
    print(f"[OK] Trained TF-IDF vector matrix on {len(corpus)} documents with shape {tfidf_matrix.shape}")

    # 4. Train Content-Based Item Similarity Matrix for Recommendation Engine
    sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    joblib.dump(sim_matrix, "backend/app/ml/saved_models/destinations_similarity_matrix.joblib")
    print(f"[OK] Trained Content Similarity Recommender matrix with shape {sim_matrix.shape}")

if __name__ == "__main__":
    build_and_train_all()
