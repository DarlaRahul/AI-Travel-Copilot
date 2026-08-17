export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar_url?: string;
  travel_style: string;
  preferred_currency: string;
  created_at?: string;
  supabase_uid?: string;
}

export interface Activity {
  id: number;
  day_id: number;
  order_index: number;
  time_slot: string;
  name: string;
  description: string;
  category: string;
  cost_inr: number;
  duration_hrs: number;
  rating: number;
  lat: number;
  lon: number;
  image_url: string;
  location_name: string;
}

export interface ItineraryDay {
  id: number;
  day_number: number;
  title: string;
  theme: string;
  description: string;
  date_str: string;
  activities: Activity[];
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  travelers_count: number;
  travelers_label: string;
  total_budget_inr: number;
  estimated_cost_inr: number;
  travel_style: string;
  interests: string[];
  image_url: string;
  status: string;
  itinerary_days: ItineraryDay[];
}

export interface DestinationCard {
  id: string;
  name: string;
  country: string;
  region: string;
  image_url: string;
  rating: number;
  avg_cost_inr: string;
  ai_score: number;
  tags: string[];
}

export interface Hotel {
  hotel_id: string;
  name: string;
  city: string;
  country?: string;
  tier: string;
  price_per_night_inr: number;
  star_rating: number;
  review_score: number;
  total_reviews?: number;
  amenities: string;
  address?: string;
  lat?: number;
  lon?: number;
  image_url: string;
  ai_recommendation_score: number;
  sentiment_summary?: {
    sentiment: string;
    confidence: number;
    aspects: {
      cleanliness: number;
      service: number;
      location: number;
      value_for_money: number;
      noise_level: string;
    };
  };
  booking_url?: string | null;
}

export interface FlightItem {
  id?: string;
  predicted_price_inr?: number;
  price_range_inr?: string;
  airline: string;
  source_city: string;
  destination_city: string;
  destination_airport?: string;
  flight_number?: string;
  departure_time: string;
  duration_hrs: number;
  stops: string;
  cabin_class: string;
  delay_risk?: string;
  delay_probability_pct?: number;
  recommended_badge?: string;
  is_live_api?: boolean;
  price_inr?: number;
  currency?: string;
  arrival_time?: string;
  booking_url?: string | null;
  recommendation_reason?: string;
}

export interface Expense {
  id: number;
  category: string;
  title: string;
  amount_inr: number;
  date_str: string;
  notes: string;
}

export interface DisruptionAlert {
  event_id?: string;
  disruption_id?: string;
  flight_number?: string;
  airline?: string;
  route?: string;
  city?: string;
  type?: string;
  title?: string;
  description?: string;
  scheduled_departure?: string;
  status: string;
  severity: string;
  delay_reason?: string;
  impact: string;
  rebooking_action?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  embedded_type?: string;
  embedded_data?: any;
}
