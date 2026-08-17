import re
import os
import json
import math
import time
from typing import Dict, Any, List, Optional, Tuple
from ..services.travel_services import (
    resolve_location,
    search_places,
    get_weather,
    search_flights,
    search_hotels,
    get_emergency_services,
    destination_image
)
from ..agents.planner_agent import planner_agent
from ..agents.disruption_agent import disruption_agent
from ..schemas.all_schemas import ChatMessage

# In-memory session store to preserve conversation & trip context per user/session
_SESSION_STORE: Dict[str, Dict[str, Any]] = {}

def get_or_create_session(session_id: str) -> Dict[str, Any]:
    if session_id not in _SESSION_STORE:
        _SESSION_STORE[session_id] = {
            "session_id": session_id,
            "origin": None,
            "destination": None,
            "duration_days": None,
            "travelers_count": None,
            "travelers_description": None,
            "budget_inr": None,
            "budget_scope": "total",
            "travel_style": "Balanced",
            "stay_preference": None,
            "interests": [],
            "dates_flexible": True,
            "specific_dates": None,
            "is_local": False,
            "feasibility_status": None,
            "cost_breakdown": None,
            "current_itinerary": None,
            "last_places": [],
            "language": "en",
            "stage": "collecting_info",
            "history": []
        }
    return _SESSION_STORE[session_id]

# Supported language codes & names
LANG_MAP = {
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "mr": "Marathi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ar": "Arabic",
    "ja": "Japanese",
    "en": "English"
}

def detect_language(text: str, current_lang: str = "en") -> str:
    """Detects message language or explicit language switch request."""
    lower = text.lower()

    if any(k in lower for k in ["telugu lo", "in telugu", "తెలుగులో", "తెలుగు", "tell me this in telugu"]):
        return "te"
    if any(k in lower for k in ["in hindi", "hindi mein", "हिंदी में", "हिंदी", "hindi", "अब हिंदी"]):
        return "hi"
    if any(k in lower for k in ["in tamil", "tamil la", "தமிழில்", "tamil"]):
        return "ta"
    if any(k in lower for k in ["in kannada", "kannada dalli", "ಕನ್ನಡದಲ್ಲಿ", "kannada"]):
        return "kn"
    if any(k in lower for k in ["in malayalam", "malayalam", "മലയാളത്തിൽ"]):
        return "ml"
    if any(k in lower for k in ["in bengali", "bangla", "বাংলায়"]):
        return "bn"
    if any(k in lower for k in ["in marathi", "marathi madhe", "मराठीत"]):
        return "mr"
    if any(k in lower for k in ["in spanish", "en español", "español"]):
        return "es"
    if any(k in lower for k in ["in french", "en français", "français"]):
        return "fr"
    if any(k in lower for k in ["in german", "auf deutsch", "deutsch"]):
        return "de"
    if any(k in lower for k in ["in arabic", "bil arabi", "بالعربية", "عربي"]):
        return "ar"
    if any(k in lower for k in ["in japanese", "nihongo", "日本語で", "日本語"]):
        return "ja"
    if any(k in lower for k in ["in english", "english lo", "english mein", "now english", "reply in english"]):
        return "en"

    # Script-based detection
    if re.search(r'[\u0C00-\u0C7F]', text) or any(w in lower for w in ["naku", "kavali", "cheyyi", "rojulu", "enti", "cheppu", "ekkada", "undi"]):
        return "te"
    if re.search(r'[\u0900-\u097F]', text) or any(w in lower for w in ["mujhe", "ghoomna", "karo", "batao", "chahiye", "kya", "hai", "kahan"]):
        return "hi"
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "ml"
    if re.search(r'[\u0980-\u09FF]', text):
        return "bn"
    if re.search(r'[\u0600-\u06FF]', text):
        return "ar"
    if re.search(r'[\u3040-\u30FF\u4E00-\u9FFF]', text):
        return "ja"

    return current_lang

# Stop words to ignore when detecting destination/origin names
STOP_WORDS = {
    "a", "an", "the", "my", "our", "trip", "days", "day", "few", "luxury", "budget",
    "under", "good", "food", "hotel", "hotels", "flight", "flights", "hindi", "telugu",
    "english", "spanish", "french", "german", "arabic", "japanese", "tamil", "kannada",
    "malayalam", "bengali", "marathi", "balanced", "relaxed", "packed", "adults", "adult",
    "people", "person", "somewhere", "place", "places", "travel", "vacation", "tour"
}

def extract_entities(user_text: str, session: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts travel parameters from natural language.
    Does NOT overwrite previously known session fields unless the user explicitly changes them.
    """
    text = user_text.strip()
    lower = text.lower()
    
    extracted: Dict[str, Any] = {
        "intent": "general_conversation",
        "destination": None,
        "origin": None,
        "duration_days": None,
        "travelers_count": None,
        "travelers_description": None,
        "budget_inr": None,
        "travel_style": None,
        "stay_preference": None,
        "interests": [],
        "is_local": None,
        "specific_day": None,
        "target_place": None
    }

    # 1. Direct one-word or short answers (e.g., "Hyderabad.", "5 days.", "2 adults.", "₹20,000.", "Balanced.")
    clean_tokens = [w.strip(".,!?\"'") for w in text.split()]
    
    # Standalone City detection if length is 1-2 words
    if len(clean_tokens) <= 2 and not any(char.isdigit() for char in text):
        first_word = clean_tokens[0].title()
        if first_word.lower() not in STOP_WORDS and len(first_word) >= 3:
            if session.get("destination") and not session.get("origin"):
                extracted["origin"] = first_word
            elif not session.get("destination"):
                extracted["destination"] = first_word

    # 2. "from Origin to Destination" or "travel from Origin to Destination"
    from_to_m = re.search(r'(?:from|out\s+of)\s+([A-Za-z]+)\s+to\s+([A-Za-z]+)', text, re.IGNORECASE)
    if from_to_m:
        orig_cand = from_to_m.group(1).strip().title()
        dest_cand = from_to_m.group(2).strip().title()
        if orig_cand.lower() not in STOP_WORDS: extracted["origin"] = orig_cand
        if dest_cand.lower() not in STOP_WORDS: extracted["destination"] = dest_cand

    # 3. "go Destination from Origin" (e.g. "go Paris from Hyderabad", "trip to Paris from Delhi")
    go_from_m = re.search(r'(?:go|trip|travel|visit|flying)\s+(?:to\s+)?([A-Za-z]+)\s+(?:from|out\s+of)\s+([A-Za-z]+)', text, re.IGNORECASE)
    if go_from_m:
        dest_cand = go_from_m.group(1).strip().title()
        orig_cand = go_from_m.group(2).strip().title()
        if dest_cand.lower() not in STOP_WORDS: extracted["destination"] = dest_cand
        if orig_cand.lower() not in STOP_WORDS: extracted["origin"] = orig_cand

    # 4. "I live in X" or local exploration detection
    if "live in" in lower or "based in" in lower or "staying in" in lower:
        m = re.search(r'(?:live\s+in|based\s+in|staying\s+in)\s+([A-Za-z]+)', text, re.IGNORECASE)
        if m:
            city = m.group(1).strip().title()
            if city.lower() not in STOP_WORDS:
                extracted["origin"] = city
                if "explore" in lower or "trip" in lower or ("in " + city.lower()) in lower:
                    extracted["destination"] = city
                    extracted["is_local"] = True

    # 5. Destination detection patterns (e.g. "trip to Paris", "explore Dubai")
    if not extracted["destination"]:
        dest_patterns = [
            r'(?:go\s+to|travel\s+to|trip\s+to|visit|explore|vacation\s+in|flying\s+to|plan\s+a\s+trip\s+to)\s+([A-Za-z\s]+?)(?:\s+(?:for|from|under|with|budget|next)|[,\.\?!]|$)',
            r'([A-Za-z]+)\s+(?:lo|mein|dalli)\s+\d+\s*(?:rojulu|din|days)',
            r'(?:make\s+it|change\s+to|actually|destination\s+is)\s+([A-Za-z]+)'
        ]
        for pat in dest_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                cand = m.group(1).strip().title()
                tokens = [t for t in cand.split() if t.lower() not in STOP_WORDS]
                if tokens:
                    clean_dest = " ".join(tokens)
                    extracted["destination"] = clean_dest
                    break

    # 6. Origin detection patterns (e.g. "from Hyderabad", "departing from Delhi")
    if not extracted["origin"]:
        origin_patterns = [
            r'(?:from|departing\s+from|flying\s+from|leaving\s+from|out\s+of)\s+([A-Za-z\s]+?)(?:\s+to|\s+for|\s+under|[,\.\?!]|$)',
            r'(?:origin\s+is|i\s+am\s+in|im\s+in)\s+([A-Za-z]+)'
        ]
        for pat in origin_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                cand = m.group(1).strip().title()
                tokens = [t for t in cand.split() if t.lower() not in STOP_WORDS]
                if tokens:
                    extracted["origin"] = " ".join(tokens)
                    break

    # Check local status
    dest_val = extracted["destination"] or session.get("destination")
    origin_val = extracted["origin"] or session.get("origin")
    if dest_val and origin_val and dest_val.lower() == origin_val.lower():
        extracted["is_local"] = True
    elif dest_val and origin_val and dest_val.lower() != origin_val.lower():
        extracted["is_local"] = False

    # 5. Duration detection
    dur_m = re.search(r'(\d+)\s*(?:-|\s*)(?:day|days|night|nights|rojulu|rojul|din|दिन|రోజులు)', lower)
    if dur_m:
        extracted["duration_days"] = max(int(dur_m.group(1)), 1)
    elif "weekend" in lower:
        extracted["duration_days"] = 2
    elif "week" in lower:
        extracted["duration_days"] = 7
    elif len(clean_tokens) == 1 and clean_tokens[0].isdigit() and int(clean_tokens[0]) <= 30:
        # If user replies with just "4" or "5"
        if session.get("destination") and not session.get("duration_days"):
            extracted["duration_days"] = int(clean_tokens[0])

    # 6. Travelers detection
    if "solo" in lower:
        extracted["travelers_count"] = 1
        extracted["travelers_description"] = "1 adult (Solo)"
    elif "couple" in lower or "with my wife" in lower or "with my husband" in lower or "with my partner" in lower:
        extracted["travelers_count"] = 2
        extracted["travelers_description"] = "2 adults (Couple)"
    elif "family of 4" in lower or "family of four" in lower:
        extracted["travelers_count"] = 4
        extracted["travelers_description"] = "Family of 4"
    else:
        trav_m = re.search(r'(\d+)\s*(?:people|person|persons|travelers|traveler|adults|adult)', lower)
        if trav_m:
            count = int(trav_m.group(1))
            extracted["travelers_count"] = count
            extracted["travelers_description"] = f"{count} adults"
        elif "two people" in lower or "2 people" in lower:
            extracted["travelers_count"] = 2
            extracted["travelers_description"] = "2 adults"
        elif len(clean_tokens) == 1 and clean_tokens[0].isdigit() and int(clean_tokens[0]) <= 10:
            # If user replies with just "2" when asked for travelers
            if session.get("duration_days") and not session.get("travelers_count"):
                extracted["travelers_count"] = int(clean_tokens[0])
                extracted["travelers_description"] = f"{clean_tokens[0]} adults"

    # 7. Budget detection (₹20,000, 20k, 1.5 lakh, 50000 rupees, 60k INR)
    if "lakh" in lower:
        lakh_m = re.search(r'(\d+(?:\.\d+)?)\s*lakh', lower)
        if lakh_m:
            extracted["budget_inr"] = float(lakh_m.group(1)) * 100000.0
    elif re.search(r'\b\d+\s*k\b', lower):
        k_m = re.search(r'(\d+)\s*k', lower)
        if k_m:
            extracted["budget_inr"] = float(k_m.group(1)) * 1000.0
    else:
        curr_m = re.search(r'(?:₹|rs\.?|inr|budget|under|spend|cost)\s*([\d,]+)', text, re.IGNORECASE)
        if curr_m:
            try:
                v = float(curr_m.group(1).replace(",", ""))
                if v >= 500:
                    extracted["budget_inr"] = v
            except Exception:
                pass
        else:
            all_nums = re.findall(r'\b(\d{4,7})\b', text)
            if all_nums:
                try:
                    v = float(all_nums[0])
                    if v >= 2000:
                        extracted["budget_inr"] = v
                except Exception:
                    pass

    # 8. Travel Style detection
    if any(k in lower for k in ["luxury", "lux", "5 star", "5-star", "lavish"]):
        extracted["travel_style"] = "Luxury"
    elif any(k in lower for k in ["relaxed", "chill", "slow", "easy", "light"]):
        extracted["travel_style"] = "Relaxed"
    elif any(k in lower for k in ["packed", "tight", "fast", "active"]):
        extracted["travel_style"] = "Packed"
    elif any(k in lower for k in ["balanced", "moderate", "standard"]):
        extracted["travel_style"] = "Balanced"

    # 9. Stay / Accommodation Preference
    if any(k in lower for k in ["budget stay", "budget hotel", "hostel", "low cost stay", "affordable hotel"]):
        extracted["stay_preference"] = "Budget"
    elif any(k in lower for k in ["comfortable hotel", "comfortable stay", "mid-range hotel", "mid-range stay", "3 star", "4 star"]):
        extracted["stay_preference"] = "Mid-range"
    elif any(k in lower for k in ["luxury hotel", "luxury resort", "5 star hotel", "5-star hotel"]):
        extracted["stay_preference"] = "Luxury"
    elif "comfortable" in lower:
        extracted["stay_preference"] = "Mid-range"

    # 10. Interests
    interests = []
    if any(k in lower for k in ["food", "dining", "biryani", "cuisine", "eat", "restaurants", "खा", "రుచులు"]): interests.append("Food")
    if any(k in lower for k in ["history", "heritage", "historic", "monument", "palace", "fort", "museum", "इतिहास", "చరిత్ర", "historical"]): interests.append("Heritage")
    if any(k in lower for k in ["beach", "sea", "ocean", "coast", "island"]): interests.append("Beaches")
    if any(k in lower for k in ["nature", "mountain", "lake", "greenery", "hills"]): interests.append("Nature")
    if any(k in lower for k in ["adventure", "trek", "safari", "scuba"]): interests.append("Adventure")
    if any(k in lower for k in ["shopping", "mall", "market", "bazaar"]): interests.append("Shopping")
    if any(k in lower for k in ["nightlife", "party", "club", "bars"]): interests.append("Nightlife")
    if any(k in lower for k in ["culture", "art", "temple", "spiritual"]): interests.append("Culture")
    if interests:
        extracted["interests"] = list(set(interests))

    # 11. Specific Day & Place
    day_m = re.search(r'day\s*(\d+)', lower)
    if day_m:
        extracted["specific_day"] = int(day_m.group(1))

    place_m = re.search(r'(?:add|include|visit|put)\s+([A-Za-z\s]+?)(?:\s+to\s+day|\s+in\s+day|\s+on\s+day|[,\.\?!]|$)', text, re.IGNORECASE)
    if place_m:
        place_name = place_m.group(1).strip().title()
        if place_name.lower() not in STOP_WORDS:
            extracted["target_place"] = place_name

    # 12. Intent Classification
    if any(k in lower for k in ["emergency", "police", "ambulance", "hospital", "आपातकालीन", "సహాయం"]):
        extracted["intent"] = "emergency"
    elif any(k in lower for k in ["weather", "temperature", "rain", "forecast", "climate", "मौसम", "వాతావరణం"]):
        extracted["intent"] = "weather"
    elif any(k in lower for k in ["find flight", "search flight", "cheapest flights", "flights from", "flight to"]):
        extracted["intent"] = "direct_flight_search"
    elif any(k in lower for k in ["find hotel", "search hotel", "hotels in", "hotel in", "stays in"]):
        extracted["intent"] = "direct_hotel_search"
    elif any(k in lower for k in ["add ", "remove ", "make day", "relaxed", "packed", "edit itinerary", "change day"]):
        extracted["intent"] = "itinerary_edit"
    elif any(k in lower for k in ["translate", "in hindi", "in telugu", "in japanese", "in spanish", "in french", "हिंदी में", "తెలుగులో"]):
        extracted["intent"] = "language_switch"
    elif any(k in lower for k in ["plan", "trip", "explore", "vacation", "itinerary", "want to go", "going to", "travel to", "ghoomna"]):
        extracted["intent"] = "trip_planning"
    
    return extracted

def calculate_feasibility(
    origin: str,
    destination: str,
    duration_days: int,
    travelers_count: int,
    budget_inr: float,
    stay_preference: Optional[str] = None,
    is_local: bool = False
) -> Dict[str, Any]:
    """
    Calculates realistic cost breakdown and feasibility state (Comfortable, Possible, Tight, Unrealistic).
    Uses distance tiers and standard hospitality / transit models.
    """
    dur = max(duration_days or 5, 1)
    trav = max(travelers_count or 2, 1)
    nights = max(dur - 1, 1)
    rooms = max(1, math.ceil(trav / 2))
    stay_tier = stay_preference or "Mid-range"

    # 1. Local Exploration Trip
    if is_local or origin.lower() == destination.lower():
        flights_cost = 0.0
        # Optional hotel only if user asked
        hotel_cost = 0.0
        daily_food_transit_per_person = 1500.0
        daily_living_cost = daily_food_transit_per_person * dur * trav
        activities_cost = 600.0 * dur * trav
        total_estimated = daily_living_cost + activities_cost
        min_possible = total_estimated * 0.7

        status = "Comfortable"
        if budget_inr < min_possible:
            status = "Tight" if budget_inr >= min_possible * 0.6 else "Unrealistic"
        elif budget_inr >= total_estimated * 1.2:
            status = "Comfortable"
        else:
            status = "Possible"

        return {
            "status": status,
            "is_local": True,
            "flights_cost": flights_cost,
            "hotel_cost": hotel_cost,
            "daily_living_cost": daily_living_cost,
            "activities_cost": activities_cost,
            "total_estimated_inr": total_estimated,
            "min_possible_inr": min_possible,
            "user_budget_inr": budget_inr,
            "suggested_hotel_per_night": 0,
            "suggested_daily_spend": round((budget_inr) / dur)
        }

    # 2. Outstation / International Trip
    dest_lower = destination.lower()
    
    # Destination Distance / Cost Tiers
    # Long-haul / Europe / Americas / Japan
    if any(c in dest_lower for c in ["paris", "london", "france", "uk", "rome", "italy", "switzerland", "zurich", "amsterdam", "new york", "usa", "canada", "tokyo", "japan", "germany", "spain", "sydney", "australia"]):
        flight_per_p = 42000.0
        hotel_night_rates = {"Budget": 7000.0, "Mid-range": 11000.0, "Luxury": 25000.0}
        daily_per_p = 4000.0
        activities_per_p = 2500.0 * dur
    # Regional / Gulf / SE Asia (Dubai, Singapore, Thailand, Bali, Maldives)
    elif any(c in dest_lower for c in ["dubai", "uae", "bangkok", "thailand", "phuket", "singapore", "bali", "indonesia", "maldives", "sri lanka", "vietnam", "malaysia", "kuala lumpur"]):
        flight_per_p = 16000.0
        hotel_night_rates = {"Budget": 4500.0, "Mid-range": 7500.0, "Luxury": 18000.0}
        daily_per_p = 2500.0
        activities_per_p = 1500.0 * dur
    # Domestic India (Goa, Manali, Kerala, Kashmir, Jaipur, Mumbai, Delhi, etc.)
    else:
        flight_per_p = 6500.0
        hotel_night_rates = {"Budget": 2500.0, "Mid-range": 4500.0, "Luxury": 12000.0}
        daily_per_p = 1500.0
        activities_per_p = 800.0 * dur

    flights_cost = flight_per_p * trav
    nightly_rate = hotel_night_rates.get(stay_tier, hotel_night_rates["Mid-range"])
    hotel_cost = nightly_rate * nights * rooms
    daily_living_cost = daily_per_p * dur * trav
    activities_cost = activities_per_p * trav

    total_estimated = flights_cost + hotel_cost + daily_living_cost + activities_cost
    min_possible = (flights_cost * 0.85) + (hotel_night_rates["Budget"] * nights * rooms) + (daily_per_p * 0.75 * dur * trav)

    # Feasibility classification
    if budget_inr < min_possible * 0.75:
        status = "Unrealistic"
    elif budget_inr < min_possible:
        status = "Tight"
    elif budget_inr <= total_estimated * 1.25:
        status = "Possible"
    else:
        status = "Comfortable"

    return {
        "status": status,
        "is_local": False,
        "flights_cost": flights_cost,
        "hotel_cost": hotel_cost,
        "daily_living_cost": daily_living_cost,
        "activities_cost": activities_cost,
        "total_estimated_inr": total_estimated,
        "min_possible_inr": min_possible,
        "user_budget_inr": budget_inr,
        "suggested_hotel_per_night": round(nightly_rate),
        "suggested_daily_spend": round(daily_living_cost / dur)
    }

class AIAssistantEngine:
    def process_chat(self, user_message: str, session_id: str = "default", request_context: Optional[Dict[str, Any]] = None) -> ChatMessage:
        session = get_or_create_session(session_id)
        
        # Merge frontend active context if provided
        if request_context:
            if request_context.get("destination") and not session.get("destination"):
                session["destination"] = request_context["destination"]
            if request_context.get("budget_inr") and not session.get("budget_inr"):
                session["budget_inr"] = float(request_context["budget_inr"])

        # Detect language
        lang = detect_language(user_message, session.get("language", "en"))
        session["language"] = lang

        # Extract entities from incoming message
        entities = extract_entities(user_message, session)

        # Update session memory only when new values are present
        if entities["destination"]: session["destination"] = entities["destination"]
        if entities["origin"]: session["origin"] = entities["origin"]
        if entities["duration_days"]: session["duration_days"] = entities["duration_days"]
        if entities["travelers_count"]: session["travelers_count"] = entities["travelers_count"]
        if entities["travelers_description"]: session["travelers_description"] = entities["travelers_description"]
        if entities["budget_inr"]: session["budget_inr"] = entities["budget_inr"]
        if entities["travel_style"]: session["travel_style"] = entities["travel_style"]
        if entities["stay_preference"]: session["stay_preference"] = entities["stay_preference"]
        if entities["interests"]: session["interests"] = entities["interests"]
        if entities["is_local"] is not None: session["is_local"] = entities["is_local"]

        dest = session["destination"]
        origin = session["origin"]
        dur = session["duration_days"]
        trav = session["travelers_count"]
        budget = session["budget_inr"]
        style = session["travel_style"] or "Balanced"
        stay = session["stay_preference"]
        interests = session["interests"] or ["Food", "Heritage"]
        is_local = session["is_local"]
        intent = entities["intent"]

        # =========================================================================
        # 1. DIRECT SPECIFIC QUERIES (Emergency, Weather, Direct Flight / Hotel)
        # =========================================================================
        if intent == "emergency":
            target_c = dest or "International"
            try:
                loc = resolve_location(target_c)
                emg = get_emergency_services(loc.get("country_code", ""), loc.get("country", ""))
            except Exception:
                emg = get_emergency_services("INTERNATIONAL", target_c)

            content = f"🚨 **Emergency Services for {emg.get('country', target_c)}**:\n• **Police**: {emg.get('police')}\n• **Ambulance / Medical**: {emg.get('ambulance')}\n• **Fire Department**: {emg.get('fire')}\n• **General Emergency**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
            return ChatMessage(role="assistant", content=content)

        if intent == "weather":
            target_city = dest or "Dubai"
            try:
                loc = resolve_location(target_city)
                w = get_weather(loc)["weather"]
                content = f"🌤️ **Current Weather in {w['city']}**:\n• **Temperature**: {w['current_temp_c']}°C (Feels like {w['feels_like_temp_c']}°C)\n• **Conditions**: {w['condition']}\n• **Rain Probability**: {w['rain_probability_pct']}%\n• **Wind**: {w['wind_speed_kmh']} km/h\n\n💡 **Tip**: {w['clothing_tip']}"
                return ChatMessage(role="assistant", content=content)
            except Exception:
                return ChatMessage(role="assistant", content=f"I couldn't retrieve live weather for {target_city} right now.")

        if intent == "direct_flight_search":
            flight_origin = origin or "Delhi"
            flight_dest = dest or "Dubai"
            flight_data = search_flights(flight_origin, flight_dest, departure_date="", cabin=style)
            results = flight_data.get("results", [])
            if results:
                top_f = results[0]
                content = f"✈️ Verified flights from **{flight_origin}** to **{flight_dest}**:\n\n• **Airline**: {top_f['airline']} ({top_f.get('flight_number', 'Direct')})\n• **Fare**: ₹{top_f['price_inr']:,.0f} / person\n• **Duration**: {top_f['duration_hrs']}h ({top_f['stops']})\n• **Badge**: {top_f.get('recommended_badge', 'Best Value')}"
                return ChatMessage(
                    role="assistant",
                    content=content,
                    embedded_type="flight_card",
                    embedded_data=top_f,
                    action_buttons=[
                        {"label": "Compare All Flights", "action": "open_flights", "params": {"from": flight_origin, "to": flight_dest}}
                    ]
                )

        if intent == "direct_hotel_search":
            target_city = dest or "Dubai"
            try:
                loc = resolve_location(target_city)
                hotel_data = search_hotels(loc, check_in="", check_out="", adults=trav or 2)
                results = hotel_data.get("results", [])
                top_h = results[0] if results else None
                if top_h:
                    content = f"🏨 Verified stay options in **{target_city}**:\n\n• **{top_h['name']}** ({top_h['star_rating']} ⭐)\n• **Room**: {top_h.get('room_type', 'Deluxe Room')}\n• **Nightly Rate**: ₹{top_h['price_per_night_inr']:,.0f} / night\n• **Amenities**: {top_h.get('amenities', 'Free Wi-Fi, Breakfast')}"
                    return ChatMessage(
                        role="assistant",
                        content=content,
                        embedded_type="hotel_card",
                        embedded_data=top_h,
                        action_buttons=[
                            {"label": "Compare All Stays", "action": "open_hotels", "params": {"city": target_city}}
                        ]
                    )
            except Exception:
                pass

        # =========================================================================
        # 2. ITINERARY EDIT (Add Place, Relax Day)
        # =========================================================================
        if intent == "itinerary_edit":
            target_place = entities.get("target_place") or "Charminar"
            target_day = entities.get("specific_day") or 2
            
            if not session.get("current_itinerary"):
                session["current_itinerary"] = planner_agent.generate_itinerary(
                    destination=dest or "Hyderabad",
                    duration_days=dur or 5,
                    budget_inr=budget or 20000.0,
                    travel_style=style,
                    interests=interests
                )
            
            itinerary = session["current_itinerary"]
            days = itinerary.get("itinerary_days", [])
            
            if "add" in user_message.lower() or "include" in user_message.lower() or "put" in user_message.lower():
                for d in days:
                    if d.get("day_number") == target_day:
                        new_act = {
                            "name": target_place,
                            "description": f"Visit {target_place}, an iconic attraction in {dest}.",
                            "category": "Heritage",
                            "cost_inr": 150,
                            "duration_hrs": 2.0,
                            "time_slot": "10:30 AM – 12:30 PM",
                            "rating": 4.9,
                            "image_url": itinerary.get("image_url", ""),
                            "location_name": f"{target_place}, {dest}"
                        }
                        d["activities"].insert(0, new_act)
                        break

                content = f"Done — I have added **{target_place}** to **Day {target_day}** and adjusted the schedule and transit times around it."
                return ChatMessage(
                    role="assistant",
                    content=content,
                    embedded_type="itinerary",
                    embedded_data={
                        "title": f"{dest} Updated Itinerary",
                        "destination": dest,
                        "duration_days": dur or 5,
                        "estimated_cost_inr": f"₹ {(budget or 20000):,.0f}",
                        "itinerary_days": days,
                        "image_url": itinerary.get("image_url")
                    }
                )

            if "relaxed" in user_message.lower() or "light" in user_message.lower() or "chill" in user_message.lower():
                for d in days:
                    if d.get("day_number") == target_day:
                        if len(d.get("activities", [])) > 2:
                            d["activities"] = d["activities"][:2]
                        d["description"] = d.get("description", "") + " (Paced with extra leisure and tea pauses)."
                        break

                content = f"Got it — I've updated **Day {target_day}** to a more relaxed pace with longer pauses, fewer rushing stops, and authentic leisure time."
                return ChatMessage(
                    role="assistant",
                    content=content,
                    embedded_type="itinerary",
                    embedded_data={
                        "title": f"{dest} Relaxed Itinerary",
                        "destination": dest,
                        "duration_days": dur or 5,
                        "estimated_cost_inr": f"₹ {(budget or 20000):,.0f}",
                        "itinerary_days": days,
                        "image_url": itinerary.get("image_url")
                    }
                )

        # =========================================================================
        # 3. MISSING PARAMETER DETECTOR (CLARIFY STEP-BY-STEP)
        # =========================================================================
        # Follow the human consultant principle:
        # Ask ONLY the single next most important missing question. Do NOT interrogate with 10 questions.
        
        # Step A: Missing Destination
        if not dest:
            if lang == "hi":
                return ChatMessage(role="assistant", content="ज़रूर! आप कहाँ की यात्रा करने की सोच रहे हैं?")
            elif lang == "te":
                return ChatMessage(role="assistant", content="తప్పకుండా! మీరు ఎక్కడికి ప్రయాణించాలని అనుకుంటున్నారు?")
            elif lang == "ja":
                return ChatMessage(role="assistant", content="承知いたしました。どちらへのご旅行をご検討でしょうか？")
            return ChatMessage(role="assistant", content="Sure! What destination or place are you thinking about exploring?")

        # Step B: Missing Origin (unless it's already identified as a local trip)
        if not origin and not is_local:
            if lang == "hi":
                return ChatMessage(role="assistant", content=f"बिल्कुल। {dest} के लिए आप कहाँ से यात्रा शुरू करेंगे?")
            elif lang == "te":
                return ChatMessage(role="assistant", content=f"తప్పకుండా. {dest} కోసం మీరు ఎక్కడి నుండి బయలుదేరుతున్నారు?")
            elif lang == "ja":
                return ChatMessage(role="assistant", content=f"かしこまりました。{dest} へはどちらからご出発されますか？")
            elif lang == "es":
                return ChatMessage(role="assistant", content=f"Absolutamente. ¿Desde dónde viajarías a {dest}?")
            return ChatMessage(role="assistant", content=f"Absolutely. Where would you be travelling from?")

        # Step C: Missing Duration
        if not dur:
            if lang == "hi":
                return ChatMessage(role="assistant", content=f"बढ़िया। {dest} के लिए आप कितने दिनों की योजना बना रहे हैं?")
            elif lang == "te":
                return ChatMessage(role="assistant", content=f"మంచి ఎంపిక. {dest} కోసం ఎన్ని రోజులు ప్లాన్ చేస్తున్నారు?")
            elif lang == "ja":
                return ChatMessage(role="assistant", content=f"{dest} でのご滞在は何日間をご希望ですか？")
            return ChatMessage(role="assistant", content=f"Nice. How many days are you thinking for {dest}?")

        # Step D: Missing Travelers (Only required for outstation trips; local defaults to 1-2)
        if not trav:
            if is_local:
                trav = 1
                session["travelers_count"] = 1
            else:
                if lang == "hi":
                    return ChatMessage(role="assistant", content="समझ गया। कितने लोग यात्रा कर रहे हैं?")
                elif lang == "te":
                    return ChatMessage(role="assistant", content="అలాగే. ఎంతమంది కలిసి ప్రయాణిస్తున్నారు?")
                elif lang == "ja":
                    return ChatMessage(role="assistant", content="ご旅行される人数は何名様でしょうか？")
                return ChatMessage(role="assistant", content="Got it. How many people are travelling?")

        # Step E: Missing Budget
        if not budget:
            if is_local:
                if lang == "hi":
                    return ChatMessage(role="assistant", content=f"चूंकि आप {dest} में ही रहते हैं, हम फ्लाइट और होटल के खर्च को छोड़ सकते हैं। भोजन, प्रवेश टिकट और स्थानीय यात्रा के लिए आपका अनुमानित बजट क्या रहेगा?")
                elif lang == "te":
                    return ChatMessage(role="assistant", content=f"మీరు {dest} లోనే నివసిస్తున్నారు కాబట్టి, ఫ్లైట్ మరియు హోటల్ అవసరం లేదు. భోజనం, ఎంట్రీ టికెట్లు మరియు స్థానిక ప్రయాణానికి మీ బడ్జెట్ ఎంత?")
                return ChatMessage(role="assistant", content=f"Since you're already based in {dest}, we can skip flights and mandatory hotel stays. Roughly what budget do you want to keep for food, sightseeing, and local transport?")
            else:
                if lang == "hi":
                    return ChatMessage(role="assistant", content=f"और इस {dest} यात्रा के लिए आपका अनुमानित कुल बजट क्या रहेगा?")
                elif lang == "te":
                    return ChatMessage(role="assistant", content=f"మరియు ఈ {dest} ట్రిప్ కోసం మీరు ఎంత బడ్జెట్ కేటాయించాలనుకుంటున్నారు?")
                elif lang == "ja":
                    return ChatMessage(role="assistant", content=f"{dest} へのご旅行の概算ご予算はおいくらくらいでお考えでしょうか？")
                return ChatMessage(role="assistant", content="And roughly what budget do you want to keep for the trip?")

        # =========================================================================
        # 4. FEASIBILITY CHECK & REALISTIC BUDGET REASONING
        # =========================================================================
        feasibility = calculate_feasibility(
            origin=origin or dest,
            destination=dest,
            duration_days=dur,
            travelers_count=trav,
            budget_inr=budget,
            stay_preference=stay,
            is_local=is_local
        )
        session["feasibility_status"] = feasibility["status"]
        session["cost_breakdown"] = feasibility

        # -------------------------------------------------------------------------
        # Case A: Budget is UNREALISTIC
        # -------------------------------------------------------------------------
        if feasibility["status"] == "Unrealistic":
            est_flight = feasibility["flights_cost"]
            est_total = feasibility["total_estimated_inr"]
            
            if lang == "hi":
                content = (
                    f"**₹{budget:,.0f}** का बजट {origin} से {dest} के {dur}-दिवसीय {trav} लोगों के पूरे ट्रिप के लिए व्यावहारिक रूप से बहुत कम है, खासकर जब इसमें फ्लाइट और होटल शामिल हों।\n\n"
                    f"मुख्य खर्च अंतरराष्ट्रीय/घरेलू फ्लाइट्स का है (लगभग ₹{est_flight/trav:,.0f} प्रति व्यक्ति)।\n\n"
                    f"मैं आपकी सहायता 4 तरीकों से कर सकता हूँ:\n"
                    f"1. **बजट बढ़ाएं** (एक आरामदायक यात्रा के लिए लगभग ₹{est_total:,.0f} की आवश्यकता होगी),\n"
                    f"2. **दिनों की संख्या कम करें**,\n"
                    f"3. **सस्ती तारीखों या कम यात्रियों के साथ यात्रा करें**, या\n"
                    f"4. **₹{budget:,.0f} के बजट में आने वाले गंतव्य चुनें** (जैसे {origin} में स्थानीय 5-दिवसीय यात्रा)।\n\n"
                    f"आप किस विकल्प को प्राथमिकता देना चाहेंगे?"
                )
            elif lang == "te":
                content = (
                    f"{origin} నుండి {dest} కి {trav} వ్యక్తులతో {dur} రోజుల ట్రిప్‌కు ఫ్లైట్ మరియు హోటల్ ఖర్చులు కలిపితే **₹{budget:,.0f}** బడ్జెట్ సరిపోదు.\n\n"
                    f"ప్రధాన ఖర్చు ఫ్లైట్ టిక్కెట్లే (సుమారు ₹{est_flight/trav:,.0f} ఒకరికి).\n\n"
                    f"నేను మీకు 4 విధాలుగా సహాయం చేయగలను:\n"
                    f"1. **బడ్జెట్‌ను పెంచడం** (సౌకర్యవంతమైన ట్రిప్ కోసం సుమారు ₹{est_total:,.0f} అవసరం),\n"
                    f"2. **రోజుల సంఖ్యను తగ్గించడం**,\n"
                    f"3. **తక్కువ ధర ఉన్న తేదీలను చూడటం**, లేదా\n"
                    f"4. **₹{budget:,.0f} బడ్జెట్‌కు సరిపోయే ప్రత్యామ్నాయాలు** (ఉదా. {origin} లో 5 రోజుల లోకల్ టూర్).\n\n"
                    f"మీరు ఏది ఎంచుకుంటారు?"
                )
            else:
                content = (
                    f"**₹{budget:,.0f}** won't realistically cover a {dur}-day {dest} trip for {trav} people from {origin} once flights and accommodation are included.\n\n"
                    f"The main cost is airfare (typically around ₹{est_flight/trav:,.0f}+ per person).\n\n"
                    f"I can still help in four ways:\n"
                    f"1. **Increase the budget** (~₹{est_total:,.0f} for a balanced, realistic trip),\n"
                    f"2. **Shorten the trip**,\n"
                    f"3. **Look for cheaper dates or solo travel**, or\n"
                    f"4. **Suggest destinations that fit ₹{budget:,.0f}** (such as a 5-day local exploration in {origin} or nearby road trips).\n\n"
                    f"Which direction would you like to explore?"
                )

            return ChatMessage(
                role="assistant",
                content=content,
                feasibility_status="Unrealistic",
                action_buttons=[
                    {"label": f"Increase Budget to ₹{est_total:,.0f}", "action": "set_budget", "params": {"budget": est_total}},
                    {"label": f"Plan Local {origin} Trip (₹{budget:,.0f})", "action": "set_destination", "params": {"destination": origin, "is_local": True}},
                    {"label": "Explore Budget Destinations", "action": "open_explore", "params": {"budget": budget}}
                ]
            )

        # -------------------------------------------------------------------------
        # Case B: Missing Stay Preference or Travel Style (Before Finalizing Plan)
        # -------------------------------------------------------------------------
        if not stay and not is_local:
            if lang == "hi":
                content = f"यह बजट (**₹{budget:,.0f}**) {dest} के लिए व्यावहारिक लगता है!\n\nआप किस प्रकार का होटल/आवास पसंद करेंगे — **बजट (Budget)**, **आरामदायक/मिड-रेंज (Mid-range)**, या **लक्ज़री (Luxury)**?"
            elif lang == "te":
                content = f"ఈ బడ్జెట్ (**₹{budget:,.0f}**) {dest} ట్రిప్‌కు సరిపోతుంది!\n\nమీరు ఎలాంటి వసతిని కోరుకుంటున్నారు — **బడ్జెట్ (Budget)**, **కంఫర్టబుల్/మిడ్-రేంజ్ (Mid-range)**, లేదా **లగ్జరీ (Luxury)**?"
            else:
                content = f"That budget (**₹{budget:,.0f}**) looks workable for {dest}!\n\nWhat kind of stay do you want — **budget**, **comfortable/mid-range**, or **luxury** accommodation?"

            return ChatMessage(
                role="assistant",
                content=content,
                feasibility_status=feasibility["status"],
                action_buttons=[
                    {"label": "Budget Stay", "action": "set_stay", "params": {"stay": "Budget"}},
                    {"label": "Comfortable (Mid-range)", "action": "set_stay", "params": {"stay": "Mid-range"}},
                    {"label": "Luxury Hotel", "action": "set_stay", "params": {"stay": "Luxury"}}
                ]
            )

        # =========================================================================
        # 5. GENERATE FINAL ITINERARY & RECOMMENDATION
        # =========================================================================
        itinerary = planner_agent.generate_itinerary(
            destination=dest,
            duration_days=dur,
            budget_inr=budget,
            travelers_count=trav,
            travel_style=style,
            interests=interests
        )
        session["current_itinerary"] = itinerary

        # Summarize realistic trip recommendation
        if is_local:
            if lang == "hi":
                summary = (
                    f"**{dest} स्थानीय यात्रा योजना** ({dur} दिन, {trav} यात्री):\n\n"
                    f"चूंकि आप {dest} में ही रहते हैं, हमने फ्लाइट और होटल के खर्च को पूरी तरह हटा दिया है। आपका **₹{budget:,.0f}** का बजट (~₹{feasibility['suggested_daily_spend']:,.0f}/दिन) ऐतिहासिक स्मारकों के प्रवेश शुल्क, प्रसिद्ध भोजन यात्राओं (बिरयानी, ईरानी चाय) और स्थानीय परिवहन के लिए आवंटित किया गया है।\n\n"
                    f"• **दिन 1–2**: पुराने शहर के ऐतिहासिक स्थल (चारमीनार, चौमहल्ला पैलेस, लाड बाजार)\n"
                    f"• **दिन 3–4**: गोलकोंडा किला, कुतुब शाही मकबरे और सालारजंग संग्रहालय\n"
                    f"• **दिन 5**: झील की सैर और प्रसिद्ध भोजन यात्रा"
                )
            elif lang == "te":
                summary = (
                    f"**{dest} స్థానిక ప్రయాణ ప్రణాళిక** ({dur} రోజులు, {trav} వ్యక్తులు):\n\n"
                    f"మీరు {dest} లోనే ఉంటున్నందున ఫ్లైట్ మరియు హోటల్ ఖర్చులు లేకుండా, మీ **₹{budget:,.0f}** బడ్జెట్ మొత్తం (~₹{feasibility['suggested_daily_spend']:,.0f}/రోజు) చారిత్రక ప్రదేశాల ప్రవేశ ఫీజులు, ప్రామాణికమైన ఆహార రుచులు మరియు స్థానిక రవాణాకు కేటాయించబడింది.\n\n"
                    f"• **1–2 రోజులు**: చార్మినార్, చౌమహల్లా ప్యాలెస్, లాడ్ బజార్\n"
                    f"• **3–4 రోజులు**: గోల్కొండ కోట, కుతుబ్ షాహీ సమాధులు, సాలార్ జంగ్ మ్యూజియం\n"
                    f"• **5వ రోజు**: హుస్సేన్ సాగర్ మరియు ప్రత్యేక ఫుడ్ టూర్"
                )
            else:
                summary = (
                    f"**{dest} Local Immersion Plan** ({dur} Days, {trav} Travelers):\n\n"
                    f"Since you are based in {dest}, flight and hotel expenses are excluded. Your **₹{budget:,.0f}** budget (~₹{feasibility['suggested_daily_spend']:,.0f}/day) is dedicated entirely to monument passes, authentic culinary trails, and local transit.\n\n"
                    f"• **Early Days**: Historic quarters (Charminar, Chowmahalla Palace, Laad Bazaar)\n"
                    f"• **Mid Days**: Golconda Fort sound & light exploration, Qutb Shahi Tombs, Salar Jung Museum\n"
                    f"• **Final Days**: Scenic promenades and dedicated gastronomy walks"
                )
        else:
            if lang == "hi":
                summary = (
                    f"**{origin} → {dest} यात्रा कार्यक्रम** ({dur} दिन / {max(dur-1, 1)} रातें, {trav} यात्री):\n\n"
                    f"• **कुल बजट**: ₹{budget:,.0f} ({feasibility['status']})\n"
                    f"• **अनुमानित फ्लाइट**: ₹{feasibility['flights_cost']:,.0f}\n"
                    f"• **होटल ({stay or 'Mid-range'})**: ₹{feasibility['hotel_cost']:,.0f} (~₹{feasibility['suggested_hotel_per_night']:,.0f}/रात)\n"
                    f"• **दैनिक भोजन व स्थानीय यात्रा**: ₹{feasibility['daily_living_cost']:,.0f}\n\n"
                    f"सभी विवरण व्यावहारिक हैं। नीचे दिए गए बटन से आप पूरा यात्रा कार्यक्रम खोल सकते हैं।"
                )
            elif lang == "te":
                summary = (
                    f"**{origin} → {dest} ప్రయాణ షెడ్యూల్** ({dur} రోజులు / {max(dur-1, 1)} రాత్రులు, {trav} వ్యక్తులు):\n\n"
                    f"• **మొత్తం బడ్జెట్**: ₹{budget:,.0f} ({feasibility['status']})\n"
                    f"• **అంచనా ఫ్లైట్**: ₹{feasibility['flights_cost']:,.0f}\n"
                    f"• **హోటల్ ({stay or 'Mid-range'})**: ₹{feasibility['hotel_cost']:,.0f} (~₹{feasibility['suggested_hotel_per_night']:,.0f}/రాత్రికి)\n"
                    f"• **భోజనం & స్థానిక రవాణా**: ₹{feasibility['daily_living_cost']:,.0f}\n\n"
                    f"అన్నీ ప్రాక్టికల్‌గా ఉన్నాయి. పూర్తి షెడ్యూల్ చూడటానికి క్రింది బటన్ క్లిక్ చేయండి."
                )
            else:
                summary = (
                    f"**Trip Summary: {origin} → {dest}** ({dur} Days / {max(dur-1, 1)} Nights, {trav} Travelers):\n\n"
                    f"• **Budget Allocation**: ₹{budget:,.0f} ({feasibility['status']})\n"
                    f"• **Estimated Flights**: ₹{feasibility['flights_cost']:,.0f}\n"
                    f"• **Accommodations ({stay or 'Mid-range'})**: ₹{feasibility['hotel_cost']:,.0f} (~₹{feasibility['suggested_hotel_per_night']:,.0f}/night)\n"
                    f"• **Food & Local Transit**: ₹{feasibility['daily_living_cost']:,.0f}\n\n"
                    f"Everything is structured and workable. Click below to open and customize your full day-by-day plan."
                )

        return ChatMessage(
            role="assistant",
            content=summary,
            embedded_type="itinerary",
            embedded_data={
                "title": f"{dest} {dur}-Day Plan",
                "destination": dest,
                "origin": origin,
                "duration_days": dur,
                "estimated_cost_inr": f"₹ {budget:,.0f}",
                "itinerary_days": itinerary.get("itinerary_days", []),
                "image_url": itinerary.get("image_url")
            },
            action_buttons=[
                {"label": "Open & Customize Itinerary", "action": "open_itinerary", "params": {"dest": dest}},
                {"label": "Compare Real Flights", "action": "open_flights", "params": {"from": origin, "to": dest}},
                {"label": "Compare Verified Stays", "action": "open_hotels", "params": {"city": dest}}
            ]
        )

assistant_engine = AIAssistantEngine()
