# ✈️ AI Travel Copilot

**Developed & Customized by Darla Rahul**

> **Explore anywhere in the world, plan smarter, find the right way to get there, choose a stay that fits your trip, and continue to booking.**

AI Travel Copilot is a full-stack AI travel planning platform that brings destination discovery, conversational trip planning, itinerary generation, budget optimization, live flight and hotel discovery, multilingual assistance, and personalized recommendations into one experience.

## 🌍 What the Platform Does

- 🤖 **Conversational AI Travel Consultant** — understands natural requests such as “I want to travel from Hyderabad to Dubai for 5 days with my wife on a ₹70,000 budget,” asks for missing details, checks feasibility, and keeps the conversation context.
- 🌎 **Worldwide Destination Discovery** — resolves cities, landmarks, islands, and other travel destinations globally rather than relying on a small hardcoded destination list.
- 🏛️ **Tourist-Focused Place Discovery** — prioritizes genuine attractions, landmarks, museums, heritage sites, viewpoints, parks, and other travel-relevant places while filtering irrelevant commercial POIs.
- ✈️ **Live Flight Discovery** — searches available flight options, ranks them as Best Overall, Cheapest, Fastest, Fewest Stops, and Best Value, and provides legitimate booking handoffs.
- 🏨 **Hotel & Room Discovery** — finds stays near the searched destination or selected place, shows prices and distance where available, and scopes room information to the selected hotel.
- 🗺️ **Smart Itinerary Planning** — creates realistic day-by-day schedules using real places, geographic grouping, travel time, opening hours where available, budget constraints, interests, and travel style.
- 💎 **Luxury Mode** — automatically adjusts spending guidance, accommodation preference, and recommendations when Luxury is selected.
- 💰 **Budget Intelligence** — supports trip budgets, daily spending, budget optimization, affordability checks, expense tracking, and explainable trade-offs.
- 🌦️ **Weather-Aware Planning** — uses current forecast information to help place outdoor activities more intelligently when conditions warrant changes.
- 🌐 **Multilingual Travel Assistant** — supports conversational travel planning across English, Hindi, Telugu, Tamil, Spanish, French, Arabic, Japanese, and other supported languages while preserving trip context.
- 🔄 **Trip Optimization** — can improve route order, activity balance, budget fit, hotel convenience, and other planning factors without replacing the user's whole trip.
- 🏙️ **Multi-City Planning** — supports itineraries spanning multiple destinations with per-city activities, accommodation, transport, dates, and budget allocation.
- 🚨 **Travel Disruption Support** — identifies affected trip components and helps suggest alternatives when supported disruption information is available.
- 👤 **Personalized Travel Profiles** — stores travel preferences such as style, currency, interests, accommodation preferences, and other supported personalization settings.
- 📊 **Trip Health & Readiness** — provides planning quality indicators based on explainable factors such as budget fit, travel efficiency, schedule density, bookings, and readiness items.
- 🧳 **Packing & Travel Preparation** — generates destination- and weather-aware packing guidance and readiness checklists.
- 🔔 **Price Alerts** — lets users create price thresholds for supported flights and hotels.
- 🔍 **Flight & Hotel Comparisons** — compare multiple options side by side before making a decision.
- 📅 **Saved Trips, Export & Sharing** — save, edit, duplicate, share, print/export, and continue working on trips.

## 🧠 Intelligent Planning Approach

The platform separates **destination relevance** from simple proximity:

```text
User Request
    ↓
Destination Resolution
    ↓
Verified Travel Candidates
    ↓
Tourist Relevance + User Preferences
    ↓
Geographic Grouping + Travel Time
    ↓
Opening Hours + Weather + Budget
    ↓
Itinerary Optimization
    ↓
Flights + Hotels + Rooms
    ↓
Explainable Recommendations
```

Hotels are independently evaluated against the searched location and, when applicable, the actual itinerary rather than being selected only because a provider returned them nearby.

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Responsive UI components
- Leaflet-based maps

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Modular travel and optimization services

### Data & Travel Services
- Supabase PostgreSQL and Authentication
- `trvl` travel provider for live flight/hotel discovery where supported
- OpenStreetMap / Nominatim
- Overpass API
- Open-Meteo
- Wikimedia Commons / related open image sources

## 🔐 Supabase & Data Security

Supabase is used for authentication and persistent user data. User-owned data is protected using authenticated-user ownership rules and Row Level Security where configured.

The Demo flow uses real Supabase anonymous authentication rather than a shared hardcoded demo identity.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API:

`http://localhost:8000`

Swagger:

`http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

### Environment

Copy `.env.example` to your local environment file and configure the values required for your deployment. Never commit private keys, database passwords, service-role keys, or other secrets.

The project is designed to use open travel data sources without requiring a paid key for every destination-discovery function. Live provider availability can still depend on the current provider and its access conditions.

## 🧪 Testing

Run the backend tests:

```bash
python -m pytest backend/tests/test_api.py -v
```

Run the frontend checks:

```bash
cd frontend
npm run build
npm run lint
```

Additional project verification scripts are available under `scratch/` where applicable.

## 📁 Repository Structure

```text
AI-Travel-Copilot/
├── backend/
├── frontend/
├── supabase/
├── bin/
├── data/
├── datasets/
├── models/
├── scripts/
├── scratch/
├── .env.example
├── TRVL_ATTRIBUTION.md
├── requirements.txt
└── README.md
```

## 📜 Attribution & Licensing

This repository contains a customized and extended implementation based on an existing AI Travel Copilot codebase. Original open-source licensing and applicable attribution are retained in the repository's `LICENSE` file.

The `trvl` provider is separately attributed in `TRVL_ATTRIBUTION.md` and is subject to its own license terms.

## 👨‍💻 Project

**AI Travel Copilot**

**Developed & Customized by Darla Rahul**
