from fastapi import APIRouter
from typing import Dict, Any
from ..agents.supervisor_agent import supervisor_agent
from ..agents.planner_agent import planner_agent
from ..agents.disruption_agent import disruption_agent
from ..services.travel_services import (
    resolve_location,
    get_weather,
    search_flights,
    search_hotels,
    get_emergency_services,
    destination_image
)
from ..schemas.all_schemas import ChatRequest, ChatMessage

router = APIRouter(prefix="/chat", tags=["AI Conversational Copilot"])

@router.post("", response_model=ChatMessage)
def chat_with_copilot(req: ChatRequest):
    msg = req.message.strip()
    lower_msg = msg.lower()
    parsed = supervisor_agent.parse_user_request(msg)
    lang = parsed.get("language", "en")

    # 1. Emergency support query
    if any(k in lower_msg for k in ["emergency", "police", "ambulance", "hospital", "embassy", "fire", "आपातकालीन", "సహాయం", "urgencia", "secours", "notfall", "緊急"]):
        try:
            loc = resolve_location(parsed["destination"])
            emg = get_emergency_services(loc.get("country_code", ""), loc.get("country", ""))
        except Exception:
            emg = get_emergency_services("INTERNATIONAL", parsed["destination"])

        if lang == "hi":
            content = f"🚨 **{emg.get('country', parsed['destination'])} के लिए आपातकालीन संपर्क**:\n• **पुलिस**: {emg.get('police')}\n• **एम्बुलेंस**: {emg.get('ambulance')}\n• **अग्निशमन**: {emg.get('fire')}\n• **सामान्य आपातकाल**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        elif lang == "te":
            content = f"🚨 **{emg.get('country', parsed['destination'])} అత్యవసర సహాయ సంఖ్యలు**:\n• **పోలీస్**: {emg.get('police')}\n• **అంబులెన్స్**: {emg.get('ambulance')}\n• **అగ్నిమాపక**: {emg.get('fire')}\n• **జాతీయ అత్యవసర**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        elif lang == "es":
            content = f"🚨 **Contactos de emergencia para {emg.get('country', parsed['destination'])}**:\n• **Policía**: {emg.get('police')}\n• **Ambulancia**: {emg.get('ambulance')}\n• **Bomberos**: {emg.get('fire')}\n• **Emergencia general**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        elif lang == "fr":
            content = f"🚨 **Numéros d'urgence pour {emg.get('country', parsed['destination'])}**:\n• **Police**: {emg.get('police')}\n• **Ambulance**: {emg.get('ambulance')}\n• **Pompiers**: {emg.get('fire')}\n• **Numéro d'urgence général**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        elif lang == "de":
            content = f"🚨 **Notfallnummern für {emg.get('country', parsed['destination'])}**:\n• **Polizei**: {emg.get('police')}\n• **Rettungsdienst**: {emg.get('ambulance')}\n• **Feuerwehr**: {emg.get('fire')}\n• **Allgemeiner Notruf**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        elif lang == "ja":
            content = f"🚨 **{emg.get('country', parsed['destination'])} の緊急連絡先**:\n• **警察**: {emg.get('police')}\n• **救急車**: {emg.get('ambulance')}\n• **消防**: {emg.get('fire')}\n• **総合緊急ダイヤル**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"
        else:
            content = f"🚨 **Official Emergency Contacts for {emg.get('country', parsed['destination'])}**:\n• **Police**: {emg.get('police')}\n• **Ambulance / Medical**: {emg.get('ambulance')}\n• **Fire Department**: {emg.get('fire')}\n• **General Emergency**: {emg.get('general')}\n\nℹ️ *{emg.get('notes')}*"

        return ChatMessage(role="assistant", content=content)

    # 2. Flight search / status query
    if any(k in lower_msg for k in ["flight", "flights", "fly", "airfare", "6e-204", "विमान", "फ्लाइट", "vuelo", "vol", "flug", "フライト"]):
        if any(k in lower_msg for k in ["delay", "status", "cancel", "लेट", "delayed"]):
            disr_check = disruption_agent.check_flight("6E-204")
            return ChatMessage(
                role="assistant",
                content="⚠️ **Flight Disruption Radar Active**:\nFlight **IndiGo 6E-204** is currently monitored.\n\nAutomated rebooking adjustments prepared:",
                embedded_type="disruption_alert",
                embedded_data={
                    "flight_number": "6E-204",
                    "delay": "3h 45m",
                    "impact": "Airport pickup and day 1 morning activity rescheduled",
                    "rebooking_action": "Hotel check-in shifted; day 1 activities moved to day 2.",
                    "cost_inr": 0
                }
            )
        
        # Flight search
        origin = parsed.get("origin", "Delhi")
        destination = parsed.get("destination", "Dubai")
        flight_data = search_flights(origin, destination, departure_date="", cabin=parsed.get("travel_style", "ECONOMY"))
        flight_results = flight_data.get("results", [])

        if flight_results:
            top_flight = flight_results[0]
            return ChatMessage(
                role="assistant",
                content=f"✈️ Here is the recommended flight offer from **{origin}** to **{destination}**:\n\n• **Airline**: {top_flight['airline']} ({top_flight['flight_number']})\n• **Price**: ₹{top_flight['price_inr']:,.0f} ({top_flight['currency']})\n• **Duration**: {top_flight['duration_hrs']}h ({top_flight['stops']})\n• **Badge**: {top_flight.get('recommended_badge', 'Best Value')}\n\nClick below or visit the Flights page for full provider options.",
                embedded_type="flight_card",
                embedded_data=top_flight
            )
        else:
            return ChatMessage(
                role="assistant",
                content=f"✈️ To search live flight availability from **{origin}** to **{destination}**, head to the Flights tab or configure Amadeus credentials in `.env`."
            )

    # 3. Hotel query
    if any(k in lower_msg for k in ["hotel", "hotels", "stay", "resort", "होटल", "alojamiento", "hébergement", "unterkunft", "ホテル"]):
        dest = parsed.get("destination", "Dubai")
        try:
            loc = resolve_location(dest)
            hotel_data = search_hotels(loc, check_in="", check_out="", adults=parsed.get("travelers_count", 2))
            hotel_results = hotel_data.get("results", [])
            if hotel_results:
                top_h = hotel_results[0]
                return ChatMessage(
                    role="assistant",
                    content=f"🏨 Top recommended accommodation in **{dest}**:\n\n• **{top_h['name']}** ({top_h['star_rating']})\n• **Room**: {top_h.get('room_type', 'Deluxe Room')}\n• **Rate**: ₹{top_h['price_per_night_inr']:,.0f} / night\n• **Amenities**: {top_h.get('amenities', 'Wi-Fi, Pool, Restaurant')}",
                    embedded_type="hotel_card",
                    embedded_data=top_h
                )
        except Exception:
            pass

        return ChatMessage(
            role="assistant",
            content=f"🏨 I can search verified accommodations in **{dest}**. You can filter by Luxury, Mid-Range, or Budget under the Bookings/Hotels tab."
        )

    # 4. Weather query
    if any(k in lower_msg for k in ["weather", "temperature", "forecast", "rain", "climate", "मौसम", "వాతావరణం", "clima", "météo", "wetter", "天気"]):
        dest = parsed.get("destination", "Dubai")
        try:
            loc = resolve_location(dest)
            w_data = get_weather(loc)["weather"]
            return ChatMessage(
                role="assistant",
                content=f"🌤️ **Current Weather in {w_data['city']}**:\n• **Temperature**: {w_data['current_temp_c']}°C (Feels like {w_data['feels_like_temp_c']}°C)\n• **Condition**: {w_data['condition']}\n• **Rain Probability**: {w_data['rain_probability_pct']}%\n• **Wind**: {w_data['wind_speed_kmh']} km/h\n\n💡 **Tip**: {w_data['clothing_tip']}"
            )
        except Exception:
            return ChatMessage(
                role="assistant",
                content=f"🌤️ Weather intelligence for **{dest}** is available on the Weather tab via Open-Meteo."
            )

    # 5. Trip planning query
    if any(k in lower_msg for k in ["plan", "trip", "suggest", "itinerary", "दिन", "ट्रिप", "itinerario", "reisen", "旅行"]):
        dest = parsed["destination"]
        duration = parsed["duration_days"]
        budget = parsed["budget_inr"]
        style = parsed["travel_style"]

        itinerary = planner_agent.generate_itinerary(
            destination=dest,
            duration_days=duration,
            budget_inr=budget,
            travelers_count=parsed["travelers_count"],
            travel_style=style,
            interests=parsed["interests"]
        )

        if lang == "hi":
            intro = f"बढ़िया पसंद! यह रहा आपका **{duration}-दिवसीय {dest} यात्रा कार्यक्रम** (बजट: ₹{budget:,.0f}, शैली: {style})।"
        elif lang == "te":
            intro = f"మంచి ఎంపిక! మీ **{duration} రోజుల {dest} ప్రయాణ ప్రణాళిక** సిద్ధంగా ఉంది (బడ్జెట్: ₹{budget:,.0f}, శైలి: {style})."
        elif lang == "es":
            intro = f"¡Excelente elección! Aquí tienes un **itinerario de {duration} días para {dest}** (Presupuesto: ₹{budget:,.0f}, Estilo: {style})."
        elif lang == "fr":
            intro = f"Excellent choix ! Voici votre **itinéraire de {duration} jours pour {dest}** (Budget : ₹{budget:,.0f}, Style : {style})."
        elif lang == "de":
            intro = f"Tolle Wahl! Hier ist Ihr **{duration}-Tage-Reiseplan für {dest}** (Budget: ₹{budget:,.0f}, Stil: {style})."
        elif lang == "ja":
            intro = f"素晴らしい選択です！こちらが **{dest} の {duration} 日間旅程** です (予算: ₹{budget:,.0f}、スタイル: {style})。"
        else:
            intro = f"Great choice! Here's a tailored **{duration}-Day {dest} Itinerary** configured for ₹{budget:,.0f} ({style} style, {', '.join(parsed['interests'])})."

        return ChatMessage(
            role="assistant",
            content=intro,
            embedded_type="itinerary",
            embedded_data={
                "title": f"{dest} {duration}-Day Itinerary",
                "destination": dest,
                "route_summary": f"Highlights of {dest}",
                "estimated_cost_inr": f"₹ {budget:,.0f} (Estimated)",
                "image_url": itinerary["image_url"],
                "duration_days": duration,
                "itinerary_days": itinerary["itinerary_days"]
            }
        )

    # 6. Budget optimization query
    if any(k in lower_msg for k in ["budget", "reduce", "cost", "save", "बजट", "ahorrar", "économiser", "sparen", "節約"]):
        return ChatMessage(
            role="assistant",
            content="💡 **Knapsack Budget Optimization Insights**:\n1. **Accommodations**: Choosing verified 4-star boutique stays over luxury resorts saves ~25–30%.\n2. **Transportation**: Booking flights 14–21 days in advance typically saves up to 18% on airfares.\n3. **Activities**: Pre-booking combo sightseeing passes reduces on-site ticketing fees.\n4. **Daily Spending**: Setting a fixed daily allowance of ₹3,000–₹5,000 ensures smooth budgeting without overspending.",
            embedded_type="budget_summary",
            embedded_data={
                "target_saving": "₹12,500 (25%)",
                "recommended_stay_inr": 14000,
                "recommended_food_inr": 6000
            }
        )

    # 7. Conversational fallback
    return ChatMessage(
        role="assistant",
        content="I am your **Global AI Travel Copilot**! 🌍\n\nI can assist you with worldwide travel:\n• *'Plan a 5-day trip to Dubai under ₹80,000'* (or Paris, Tokyo, Hyderabad, Bali)\n• *'Find flights from Hyderabad to Dubai'* \n• *'Show luxury hotels in Singapore'* \n• *'What are the emergency numbers in Japan?'* \n• *'What is the weather in Paris?'*\n• *'Translate travel tips into Hindi / Spanish / Telugu / Japanese'*"
    )
