# ✈️ AI Travel Copilot

### A conversational, intelligent travel planning platform built by **Darla Rahul**

> **Tell it where you want to go. It figures out what it needs to know, checks what is realistic, builds the trip, finds places to visit, compares travel and stays, and helps you continue to booking.**

---

## 🌍 Overview

**AI Travel Copilot** is a full-stack travel assistant designed around the way people actually plan trips — through conversation rather than rigid forms.

Instead of forcing a traveler to enter every detail upfront, the assistant can progressively understand a request such as:

> *"I want to go to Paris. I live in Hyderabad. I have 5 days and I'm travelling with my family."*

It can then identify the missing information, ask natural follow-up questions about **budget, travelers, dates, interests, and travel style**, evaluate feasibility, and use the resulting context across the rest of the application.

The platform combines conversational AI with destination discovery, tourist-place relevance scoring, geographic itinerary optimization, live travel search, hotel proximity analysis, budgeting, weather-aware planning, multilingual interaction, and persistent trip management.

---

## ✨ Why This Project Is Different

Most travel planners begin with a large form and return a static list.

AI Travel Copilot is designed as a **planning workflow**:

```text
Natural Language Request
        ↓
Understand Intent & Missing Details
        ↓
Conversational Clarification
        ↓
Budget & Feasibility Analysis
        ↓
Destination & Tourist-Place Discovery
        ↓
Geographic Itinerary Planning
        ↓
Weather / Time / Travel Constraints
        ↓
Flight & Hotel Recommendations
        ↓
Budget Optimization
        ↓
Save / Compare / Export / Continue Booking
```

The goal is not simply to generate text. The goal is to turn an incomplete travel idea into a **usable, explainable trip plan**.

---

# 🧠 AI Travel Consultant

The assistant is built around conversational planning rather than fixed question-and-answer templates.

### Example

**Traveler:**
> I want to go somewhere for a vacation.

**Copilot:**
> Sure — where are you thinking of going?

**Traveler:**
> Paris.

**Copilot:**
> Nice choice. Where will you be travelling from?

The assistant can progressively collect:

- Origin
- Destination
- Travel dates / duration
- Number of travelers
- Adults / children where supported
- Budget
- Travel style
- Interests
- Accommodation preference
- Other trip constraints

It also performs **budget feasibility reasoning** instead of inventing unrealistic deals.

For example, a very low budget for an international multi-day trip can be flagged as unrealistic and followed by practical alternatives rather than fabricated flight or hotel prices.

---

# 🌐 Multilingual Conversations

The Copilot is designed to understand and respond across multiple languages while retaining the trip context.

Supported language flows include:

- 🇬🇧 English
- 🇮🇳 Hindi — हिंदी
- 🇮🇳 Telugu — తెలుగు
- 🇮🇳 Tamil — தமிழ்
- 🇪🇸 Spanish — Español
- 🇫🇷 French — Français
- 🇸🇦 Arabic — العربية
- 🇯🇵 Japanese — 日本語

A traveler can switch languages during a conversation without restarting the planning process.

---

# 🗺️ Intelligent Destination Discovery

The platform does not treat every nearby point as a tourist attraction.

It uses location data and relevance logic to prioritize:

- Major landmarks
- Historical sites
- Museums
- Heritage locations
- Viewpoints
- Parks
- Cultural attractions
- Popular visitor destinations
- Other travel-relevant points of interest

Irrelevant commercial locations such as generic shops, pharmacies, banks, salons, offices, and similar POIs are filtered or deprioritized.

Destination searches are designed to remain globally useful instead of depending on a small hardcoded city list.

---

# 🧭 Smart Itinerary Engine

The itinerary planner focuses on **where places are**, not just what places are called.

It considers factors such as:

- Geographic proximity
- Travel time
- Attraction relevance
- Daily schedule density
- Opening hours where available
- Weather information where available
- Traveler preferences
- Budget constraints
- Travel style
- Existing activities

### Example

Instead of:

```text
Day 1: Attraction A → Attraction B → Attraction C
Day 2: Attraction D → Attraction E
```

with unnecessary cross-city travel, the planner aims to group geographically sensible locations together and reduce backtracking.

### Itinerary controls

- Add a place
- Remove a place
- Recalculate the route
- Recalculate time allocation
- Recalculate budget impact
- Change travel style
- Change accommodation preference
- Generate different trip lengths
- Support local and international trips
- Support multi-city travel

---

# ✈️ Flights

The flight experience is integrated into the overall planning workflow instead of being an isolated search screen.

Flight results can include:

- Airline
- Flight number
- Departure / arrival information
- Duration
- Stops
- Price
- Recommendation ranking
- Booking handoff

Results can be categorized using recommendation labels such as:

**Best Overall · Cheapest · Fastest · Fewest Stops · Best Value**

The application is designed to distinguish live provider data from fallback/demo data rather than presenting fabricated prices as real results.

---

# 🏨 Hotels & Rooms

Hotel recommendations are evaluated against the **actual searched location**.

The system can consider:

- Destination
- Specific landmark / neighborhood search
- Geographic distance
- Price
- Rating
- Hotel category
- Availability information returned by the provider
- Room-level information

If a traveler searches around a particular attraction, hotel recommendations should prioritize properties around that location rather than simply returning arbitrary hotels from the wider region.

Room information is scoped to the selected hotel.

---

# 💰 Budget Intelligence

Travel planning is not complete without understanding whether the trip is affordable.

The project includes budget-oriented functionality for:

- Total trip budget
- Daily spending guidance
- Accommodation allocation
- Transportation allocation
- Activities
- Food / miscellaneous spending
- Contingency planning
- Expense tracking
- Budget optimization
- Affordability analysis

Changing travel style or accommodation preference can influence spending recommendations.

---

# 🌦️ Weather-Aware Planning

Weather information can be incorporated into travel planning to help travelers understand conditions before committing to outdoor-heavy schedules.

The platform can use forecast information for:

- Temperature
- Apparent conditions
- Rain probability
- Wind
- Clothing guidance
- Daily planning decisions

---

# 💎 Travel Styles

The planner supports different planning preferences rather than assuming every traveler wants the same schedule.

Examples include:

- Relaxed
- Balanced
- Packed
- Luxury
- Budget-oriented planning

Luxury planning can increase accommodation and spending recommendations, while relaxed planning can reduce schedule density.

---

# 🏙️ Multi-City Travel

The architecture supports trips involving multiple destinations.

A multi-city plan can account for:

```text
City A
  ↓
Transport
  ↓
City B
  ↓
Transport
  ↓
City C
```

with accommodation, activities, timing, and budget considered across the journey.

---

# 📊 Trip Intelligence & Optimization

The platform includes additional planning intelligence such as:

- Route optimization
- Trip health scoring
- Travel readiness
- Budget optimization
- Hotel-itinerary matching
- Daily spending control
- Travel profile personalization
- Accessibility considerations
- Food planning
- Day-trip planning
- Near-me discovery
- Stopover planning
- Travel disruption support

These features are intended to work together as part of the trip lifecycle rather than as disconnected widgets.

---

# 🔐 Authentication & Persistence

Supabase is used for cloud authentication and persistent user data where configured.

The application supports:

- Authentication
- Anonymous/demo sessions through the configured Supabase flow
- User-specific trip persistence
- Saved trips
- Itinerary persistence
- Budget persistence
- User data isolation through ownership policies / RLS where configured

Private credentials and service-role keys should never be committed to the repository.

---

# 📸 Maps & Destination Photos

The application combines location coordinates with destination imagery to make planning visual as well as conversational.

The implementation includes safeguards for:

- Correct destination context
- Correct attraction coordinates
- Correct hotel coordinates
- Stale image prevention
- Image fallbacks
- Map markers representing actual locations

---

# 🧳 Travel Preparation

Beyond booking, the platform includes tools for preparing for the trip:

- Packing assistance
- Travel readiness
- Document checklist
- Trip health
- Calendar export
- Itinerary export
- Travel journal / post-trip functionality
- Saved and shareable trips

---

# 🔎 Comparison & Decision Support

Travelers can compare options instead of accepting the first result.

### Flight comparison

Compare supported flight attributes such as:

- Price
- Duration
- Stops
- Departure
- Arrival

### Hotel comparison

Compare supported hotel attributes such as:

- Price
- Rating
- Distance
- Amenities
- Cancellation information

---

# 🏗️ Architecture

```text
┌───────────────────────────────────────────────────────────┐
│                    React + TypeScript                     │
│                                                           │
│ Explore │ Assistant │ Planner │ Flights │ Hotels │ Trips │
└───────────────────────────┬───────────────────────────────┘
                            │
                         REST / Auth
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│                         FastAPI                            │
│                                                           │
│ Assistant │ Trips │ Itinerary │ Flights │ Hotels │ Budget │
└───────────────┬──────────────────┬────────────────────────┘
                │                  │
                ▼                  ▼
      ┌─────────────────┐   ┌──────────────────────┐
      │ Travel Providers│   │ Planning / AI Engine │
      │                 │   │                      │
      │ Flights         │   │ Intent & Context     │
      │ Hotels          │   │ Route Optimization   │
      │ Places          │   │ Budget Reasoning     │
      │ Weather         │   │ Itinerary Generation │
      └─────────────────┘   └──────────────────────┘
                │                  │
                └────────┬─────────┘
                         ▼
                ┌─────────────────┐
                │ Supabase / Data │
                │                 │
                │ Auth            │
                │ PostgreSQL      │
                │ User Trips      │
                │ Budgets         │
                └─────────────────┘
```

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| Database / Auth | Supabase PostgreSQL + Authentication |
| Maps | Leaflet / location APIs |
| Tourist Places | OpenStreetMap / Overpass ecosystem |
| Geocoding | Nominatim |
| Weather | Open-Meteo |
| Images | Wikimedia Commons / supported image sources |
| Travel Search | `trvl` provider integration |
| Optimization | Geographic route optimization + budget optimization |

---

# 🚀 Running the Project Locally

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Backend

From the project root:

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Environment

Create your local environment from `.env.example` and configure the values required by your setup.

**Never commit:**

- API secrets
- Supabase secret/service-role keys
- Database passwords
- Private tokens
- Personal credentials

---

# 🧪 Testing

Backend tests:

```bash
python -m pytest backend/tests -v
```

Frontend build:

```bash
cd frontend
npm run build
```

Frontend lint:

```bash
npm run lint
```

Additional verification utilities are available under `scratch/` where included in the repository.

> Test reports should only claim a feature as **PASS** when it has actually been executed and verified. Source-code inspection alone is not a substitute for runtime testing.

---

# 📁 Project Structure

```text
AI-Travel-Copilot/
│
├── backend/              # FastAPI backend and travel services
├── frontend/             # React + TypeScript application
├── supabase/             # Database migrations / Supabase configuration
├── bin/                  # Travel provider binary where applicable
├── data/                 # Project data resources
├── datasets/             # Dataset resources
├── models/               # Model / optimization resources
├── scripts/              # Utility scripts
├── scratch/              # Verification and development utilities
│
├── .env.example
├── requirements.txt
├── TRVL_ATTRIBUTION.md
└── README.md
```

---

# 🎯 Project Goals

The project is built around five core ideas:

### 1. Conversation over forms
Let travelers explain what they want naturally.

### 2. Realistic planning over hallucination
If a budget or plan is unrealistic, explain why and suggest alternatives.

### 3. Relevant places over random POIs
Recommend places people would actually want to visit.

### 4. Geography over arbitrary ordering
Build itineraries that make sense on a map and reduce unnecessary travel.

### 5. One continuous trip workflow
Move from:

**Idea → Conversation → Destination → Itinerary → Flights → Hotels → Budget → Booking → Trip Management**

without forcing the traveler to start over at every step.

---

# 👨‍💻 Developer

## Darla Rahul

**AI Travel Copilot**

A full-stack AI travel planning project focused on conversational AI, travel intelligence, geographic optimization, live travel discovery, personalization, and practical trip execution.

---

# 📜 Licensing & Attribution

This repository is distributed under the license included in `LICENSE`.

Applicable third-party and provider licensing information is documented in the repository, including `TRVL_ATTRIBUTION.md`.

See the repository license and attribution files before redistributing the project or its components.

---

## ⭐ AI Travel Copilot

**Plan less. Understand more. Travel smarter.**
