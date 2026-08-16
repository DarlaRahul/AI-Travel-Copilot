# ✈️ AI Travel Copilot — Enterprise Full-Stack Autonomous Travel Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_|_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Scikit-Learn](https://img.shields.io/badge/Machine_Learning-Scikit--Learn-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Explore Anywhere in the World, Find the Best Way to Get There, Find a Place to Stay, and Continue to Booking."**  
> An intelligent, truthful full-stack travel platform powered by Multi-Agent AI, Global Open APIs, Live Flight & Hotel Adapters (Amadeus), 0/1 Knapsack Budget Optimization with Dynamic Daily Spending, and TSP Geographic Route Scheduling.

---

## 🌟 Key Platform Capabilities

- 🌍 **Worldwide Location Resolution & Discovery**: Location-driven (not dataset-driven). Seamlessly resolves any city, landmark, or island across the globe using OpenStreetMap Nominatim with rate-limit protection and caching.
- 🏛️ **Live Attractions & POIs Discovery**: Dynamically retrieves verified tourist attractions, museums, viewpoints, and parks via OpenStreetMap Overpass API with authentic GPS coordinates and non-repeating daily itineraries.
- 🖼️ **Dynamic Destination Images**: Real-time landmark images retrieved directly from Wikimedia Commons API with proper creative commons attribution and fallback.
- 🌤️ **Live Global Meteorological Radar**: Integrated with Open-Meteo for real-time temperatures, apparent conditions, rain probabilities, wind speeds, clothing recommendations, and 5-day daily forecasts without API keys.
- ✈️ **Live Flight Search & Ranking Engine**: Amadeus GDS adapter supporting test and production environments. Ranks flights deterministically into **Best Overall, Cheapest, Fastest, Fewest Stops, Best Value**. Includes legitimate provider booking handoff.
- 🏨 **Hotel Inventory & Room Offers (V3)**: Amadeus Hotel Search V3 adapter displaying authentic room types, nightly prices, total stay rates, taxes, cancellation policies, and verified amenities.
- 💎 **Trip Planner Luxury Synchronization**: Clicking "Luxury" automatically updates recommended budget, hotel tier (4-5 star luxury), activities, and daily spending allowance.
- 💳 **Dynamic Daily Spending Control**: Customize daily allowance (₹2,000, ₹3,000, ₹5,000, ₹10,000, or Custom) synchronized with total trip duration and budget breakdown.
- 🤖 **Multilingual Conversational Copilot**: Multi-turn AI assistant capable of conversational trip planning, flight searches, hotel queries, and multilingual support in **English, Hindi (हिंदी), Telugu (తెలుగు), Spanish (Español), French (Français), German (Deutsch), and Japanese (日本語)**.
- 🚨 **Global Emergency Services Directory**: Built-in directory of official police, ambulance, fire, and tourist security contacts across major countries worldwide.
- 📈 **Dynamic Pricing & Revenue Engine**: Analyzes travel demand, seasonality factors, and recommended pricing to optimize booking yield.
- 💰 **0/1 Knapsack Budget Tracker**: Real-time expense logging, category breakdown, and contingency buffer tracking.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │       React 19 + TypeScript Frontend   │
                                  │   (Vite + Tailwind CSS + Leaflet Maps) │
                                  └───────────────────┬────────────────────┘
                                                      │ REST APIs & Auth JWT
                                                      ▼
                                  ┌────────────────────────────────────────┐
                                  │         FastAPI High-Speed Backend     │
                                  └─┬───────────────┬────────────────┬─────┘
                                    │               │                │
             ┌──────────────────────┴──────┐ ┌──────┴──────┐ ┌───────┴───────────────────────┐
             │      Multi-Agent System     │ │  Live APIs  │ │      Data & Optimization      │
             ├─────────────────────────────┤ ├─────────────┤ ├───────────────────────────────┤
             │ • Planner Agent             │ │ • Nominatim │ │ • SQLite Relational DB        │
             │ • Supervisor Agent (NLP)    │ │ • Overpass  │ │ • 0/1 Knapsack Optimizer      │
             │ • Disruption Radar Agent    │ │ • Open-Meteo│ │ • TSP Route Optimizer         │
             │ • Dynamic Pricing Engine    │ │ • Wikimedia │ │ • Amadeus Flights & Hotels    │
             └─────────────────────────────┘ └─────────────┘ └───────────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & **npm**

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `AMADEUS_CLIENT_ID` | Amadeus API Key (Flights & Hotels) | *Optional* |
| `AMADEUS_CLIENT_SECRET` | Amadeus API Secret | *Optional* |
| `AMADEUS_ENVIRONMENT` | `test` or `production` | `test` |
| `USE_DEMO_DATA` | Enables deterministic labeled demo data when live provider is unconfigured | `false` |
| `DATABASE_URL` | SQLite database URI | `sqlite:///./travel_copilot.db` |
| `JWT_SECRET` | JWT authentication signing secret | *Auto-configured* |

> [!NOTE]
> OpenStreetMap Nominatim, Overpass POIs, Open-Meteo Weather, and Wikimedia Commons work globally without requiring any API keys.

---

### 3. Backend Setup
```bash
# In project root:
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend API: **`http://localhost:8000`**
* Interactive Swagger API Docs: **`http://localhost:8000/docs`**

---

### 4. Frontend Setup
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
* Frontend application: **`http://localhost:5173`**

---

## 🧪 Automated Testing

Run the full automated test suite:
```bash
python -m pytest backend/tests/test_api.py -v
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
