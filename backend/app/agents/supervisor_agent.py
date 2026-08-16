import re
from typing import Dict, Any, List

class SupervisorAgent:
    def parse_user_request(self, user_text: str) -> Dict[str, Any]:
        text = user_text.strip()
        lower = text.lower()

        # 1. Detect Destination dynamically
        dest_match = re.search(r'(?:to|visit|in|explore|for)\s+([A-Za-z\s]+?)(?:\s+(?:for|from|under|with|on|in|\d+|underneath|budget)|[,\.\?!]|$)', text, re.IGNORECASE)
        if dest_match:
            candidate = dest_match.group(1).strip()
            # Clean common words
            stop_words = ["a", "an", "the", "my", "our", "trip", "vacation", "tour", "days", "day", "few", "luxury", "budget"]
            candidate_tokens = [t for t in candidate.split() if t.lower() not in stop_words]
            destination = " ".join(candidate_tokens).title() if candidate_tokens else "Dubai"
        else:
            destination = "Dubai"

        # 2. Detect Origin (e.g., "from Hyderabad to Dubai")
        origin_match = re.search(r'from\s+([A-Za-z\s]+?)(?:\s+to|\s+for|\s+under|[,\.\?!]|$)', text, re.IGNORECASE)
        origin = origin_match.group(1).strip().title() if origin_match else "Delhi"

        # 3. Detect Duration (e.g. "5 day", "5-day", "3 days", "7 days")
        duration = 5
        duration_match = re.search(r'(\d+)\s*(?:-|\s*)(?:day|days|night|nights)', lower)
        if duration_match:
            duration = int(duration_match.group(1))

        # 4. Detect Budget (prioritize explicit currency symbol, lakh, k, under/budget keywords)
        budget = 50000.0
        if "lakh" in lower:
            lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*lakh', lower)
            if lakh_match:
                budget = float(lakh_match.group(1)) * 100000.0
        elif re.search(r'\b\d+\s*k\b', lower):
            k_match = re.search(r'(\d+)\s*k', lower)
            if k_match:
                budget = float(k_match.group(1)) * 1000.0
        else:
            # Look for ₹ symbol or under/budget prefix
            curr_match = re.search(r'(?:₹|rs\.?|inr|budget|under)\s*([\d,]+)', text, re.IGNORECASE)
            if curr_match:
                try:
                    val = float(curr_match.group(1).replace(",", ""))
                    if val > 500:
                        budget = val
                except Exception:
                    pass
            else:
                # Look for any large numbers (>= 1000)
                all_nums = re.findall(r'([\d,]+)', text)
                for num_str in all_nums:
                    try:
                        v = float(num_str.replace(",", ""))
                        if v >= 5000:
                            budget = v
                            break
                    except Exception:
                        pass

        # 5. Detect Travelers
        travelers = 2
        travelers_match = re.search(r'(\d+)\s*(?:people|person|persons|travelers|traveler|adults|adult|family)', lower)
        if travelers_match:
            travelers = int(travelers_match.group(1))
        elif "solo" in lower:
            travelers = 1

        # 6. Detect Travel Style
        travel_style = "Balanced"
        if "lux" in lower or "5 star" in lower or "5-star" in lower:
            travel_style = "Luxury"
        elif "budget" in lower or "cheap" in lower or "backpacker" in lower or "low cost" in lower:
            travel_style = "Relaxed"
        elif "packed" in lower or "adventure" in lower or "fast" in lower:
            travel_style = "Packed"

        # 7. Detect Interests
        interests = []
        if any(w in lower for w in ["beach", "sea", "ocean", "island", "coast"]): interests.append("Beaches")
        if any(w in lower for w in ["food", "restaurant", "dining", "cuisine", "eat", "culinary"]): interests.append("Food")
        if any(w in lower for w in ["history", "heritage", "museum", "temple", "monument", "palace", "fort"]): interests.append("Heritage")
        if any(w in lower for w in ["adventure", "trek", "safari", "scuba", "rafting", "ski"]): interests.append("Adventure")
        if any(w in lower for w in ["nature", "mountain", "lake", "waterfall", "park"]): interests.append("Nature")
        if any(w in lower for w in ["nightlife", "party", "club", "bar"]): interests.append("Nightlife")
        if any(w in lower for w in ["shop", "mall", "market", "bazaar"]): interests.append("Shopping")

        if not interests:
            interests = ["Sightseeing", "Food", "Heritage"]

        # 8. Detect Language
        lang = "en"
        if any(re.search(r'[\u0900-\u097F]', text) or w in lower for w in ["नमस्ते", "दिन", "ट्रिप", "बजट", "होटल", "फ्लाइट"]):
            lang = "hi"
        elif any(re.search(r'[\u0C00-\u0C7F]', text) or w in lower for w in ["నమస్కారం", "హైదరాబాద్", "ప్రయాణం", "విమానం"]):
            lang = "te"
        elif any(w in lower for w in ["hola", "viaje", "vuelo", "hotel", "itinerario"]):
            lang = "es"
        elif any(w in lower for w in ["bonjour", "voyage", "vol", "itinéraire"]):
            lang = "fr"
        elif any(w in lower for w in ["hallo", "guten tag", "reise", "flug"]):
            lang = "de"
        elif any(re.search(r'[\u3040-\u30FF\u4E00-\u9FAF]', text) or w in lower for w in ["こんにちは", "旅行", "ホテル", "フライト"]):
            lang = "ja"

        return {
            "destination": destination,
            "origin": origin,
            "duration_days": duration,
            "budget_inr": budget,
            "travelers_count": travelers,
            "travelers_label": f"{travelers} Adults" if travelers > 1 else "1 Solo Traveler",
            "travel_style": travel_style,
            "interests": interests,
            "language": lang
        }

supervisor_agent = SupervisorAgent()
