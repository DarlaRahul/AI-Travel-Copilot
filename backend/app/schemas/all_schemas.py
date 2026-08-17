from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    travel_style: Optional[str] = "Balanced"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str
    travel_style: str
    preferred_currency: str

    class Config:
        from_attributes = True

# --- Activity & Itinerary Schemas ---
class ActivityBase(BaseModel):
    name: str
    description: str = ""
    time_slot: str = "Morning"  # Morning, Afternoon, Evening
    category: str = "Sightseeing"
    cost_inr: float = 0.0
    duration_hrs: float = 2.0
    rating: float = 4.5
    lat: float = 0.0
    lon: float = 0.0
    image_url: str = ""
    location_name: str = ""
    order_index: int = 0

class ActivityResponse(ActivityBase):
    id: int
    day_id: int

    class Config:
        from_attributes = True

class ItineraryDayResponse(BaseModel):
    id: int
    day_number: int
    title: str
    theme: str = ""
    description: str = ""
    date_str: str = ""
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True

class TripCreateRequest(BaseModel):
    destination: str
    starting_location: Optional[str] = None
    start_date: str
    end_date: str
    travelers_count: int = 2
    travelers_label: str = "2 Adults"
    budget_inr: float = 40000.0
    travel_style: str = "Balanced"  # Relaxed, Balanced, Packed, Luxury
    interests: List[str] = ["Sightseeing", "Food", "Beaches"]
    accommodation_preference: Optional[str] = "Mid-Range"
    transport_preference: Optional[str] = "Flights + Cabs"
    daily_spending_inr: Optional[float] = None

class TripResponse(BaseModel):
    id: int
    title: str
    destination: str
    country: str
    start_date: str
    end_date: str
    duration_days: int
    travelers_count: int
    travelers_label: str
    total_budget_inr: float
    estimated_cost_inr: float
    travel_style: str
    interests: List[str]
    image_url: str
    status: str
    itinerary_days: List[ItineraryDayResponse] = []

    class Config:
        from_attributes = True

# --- Hotel Schemas ---
class HotelResponse(BaseModel):
    hotel_id: str
    name: str
    city: str
    tier: str
    price_per_night_inr: float
    star_rating: float
    review_score: float
    total_reviews: int
    amenities: str
    lat: float
    lon: float
    image_url: str
    sentiment_summary: Optional[Dict[str, Any]] = None
    ai_recommendation_score: Optional[float] = 95.0

# --- Flight Schemas ---
class FlightSearchRequest(BaseModel):
    airline: Optional[str] = "IndiGo"
    source_city: str = "Delhi"
    destination_city: str = "Goa"
    departure_time: Optional[str] = "Morning"
    stops: Optional[str] = "zero"
    cabin_class: Optional[str] = "Economy"
    days_left: Optional[int] = 15

class FlightPredictionResponse(BaseModel):
    predicted_price_inr: float
    price_range_inr: str
    airline: str
    source_city: str
    destination_city: str
    departure_time: str
    duration_hrs: float
    stops: str
    cabin_class: str
    delay_risk: str
    delay_probability_pct: float
    recommended_badge: str
    is_live_api: bool = False

# --- Budget & Expenses Schemas ---
class BudgetOptimizationRequest(BaseModel):
    total_budget_inr: float
    destination: Optional[str] = "Global"
    travelers_count: int = 2
    duration_days: int = 5
    travel_style: str = "Balanced"
    daily_spending_inr: Optional[float] = None

class BudgetCategoryAllocation(BaseModel):
    category: str
    allocated_inr: float
    percentage: float
    description: str

class BudgetOptimizationResponse(BaseModel):
    total_budget_inr: float
    total_estimated_inr: float
    remaining_buffer_inr: float
    daily_spending_inr: Optional[float] = None
    daily_allowance_total_inr: Optional[float] = None
    travel_style: Optional[str] = "Balanced"
    status: str  # Optimal, Tight, Exceeded
    categories: List[BudgetCategoryAllocation]
    optimization_suggestions: List[str]

class ExpenseCreate(BaseModel):
    trip_id: Optional[int] = None
    category: str  # Stay, Flight, Food, Activities, Transport, Misc
    title: str
    amount_inr: float
    date_str: Optional[str] = ""
    notes: Optional[str] = ""

class ExpenseResponse(BaseModel):
    id: int
    category: str
    title: str
    amount_inr: float
    date_str: str
    notes: str

    class Config:
        from_attributes = True

# --- Disruption Schemas ---
class DisruptionItem(BaseModel):
    event_id: Optional[str] = "EVT-01"
    disruption_id: Optional[str] = "DIS-01"
    flight_number: Optional[str] = "6E-204"
    airline: Optional[str] = "IndiGo"
    route: Optional[str] = "Transit Route"
    city: Optional[str] = "Global"
    type: Optional[str] = "Advisory"
    title: Optional[str] = "Travel Advisory"
    description: Optional[str] = ""
    scheduled_departure: Optional[str] = "10:30 AM"
    status: Optional[str] = "Active"
    severity: Optional[str] = "Moderate"
    delay_reason: Optional[str] = ""
    impact: Optional[str] = "Standard operations"
    rebooking_action: Optional[str] = "Autonomous AI Monitoring"

# --- Chat Copilot Schemas ---
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    embedded_type: Optional[str] = None  # itinerary, hotel_card, flight_card, disruption_alert, budget_summary, feasibility_card
    embedded_data: Optional[Dict[str, Any]] = None
    action_buttons: Optional[List[Dict[str, Any]]] = None
    feasibility_status: Optional[str] = None  # Comfortable, Possible, Tight, Unrealistic

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    context: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"
