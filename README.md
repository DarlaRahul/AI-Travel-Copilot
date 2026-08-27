# AI Travel Copilot

A full-stack travel planning application that brings destination discovery, itinerary planning, flight and hotel search, budgeting, maps, and conversational assistance into one place.

**Built and maintained by Darla Rahul.**

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/DarlaRahul/AI-Travel-Copilot)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Database%20%26%20Auth-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

<p align="center">
  <a href="https://github.com/DarlaRahul/AI-Travel-Copilot">View Repository</a> •
  <a href="https://github.com/DarlaRahul/AI-Travel-Copilot/issues">Report an Issue</a> •
  <a href="https://github.com/DarlaRahul/AI-Travel-Copilot/pulls">Contribute</a>
</p>

---

## About the project

AI Travel Copilot was built to solve a practical problem: travel planning usually means jumping between several websites and keeping track of the information manually.

This project brings those steps together in a single application. A user can explore a destination, find relevant places, build an itinerary, search flights and hotels, review the budget, and save the resulting trip.

The application also includes a conversational assistant that can collect trip requirements and use them while planning.

The emphasis is on **useful travel data, sensible geographic planning, and a clean end-to-end workflow** rather than simply generating a block of AI text.

---

## Main features

### Destination discovery

- Search destinations and locations
- Discover tourist attractions and points of interest
- Rank relevant tourist locations above generic commercial POIs
- Display locations on an interactive map
- Show destination imagery where available
- Support location-based discovery

### Itinerary planning

- Generate multi-day itineraries
- Organise attractions geographically
- Reduce unnecessary backtracking
- Account for travel time between stops
- Add and remove places from a day
- Recalculate the itinerary after changes
- Support different travel styles
- Support local and international trips
- Support multi-city planning

### Flights

- Search flight routes
- Display available flight offers from the configured travel provider
- Compare price, duration and stops
- Highlight useful options such as cheapest, fastest and best overall
- Provide a booking handoff rather than claiming a booking was completed

### Hotels

- Search hotels around a destination or specific searched location
- Calculate distance from the searched location
- Filter geographically irrelevant results
- Display hotel information and available room information
- Compare hotel options
- Keep room results associated with the selected property

### Budget planning

- Set a trip budget
- Estimate spending across major categories
- Check whether a proposed trip is realistic for the supplied budget
- Adjust recommendations based on travel style
- Recalculate budget impact when the itinerary changes

### Conversational assistant

The assistant can collect information progressively instead of requiring every field before the conversation starts.

Typical trip information includes:

- Origin
- Destination
- Dates or duration
- Number of travellers
- Budget
- Interests
- Travel style
- Accommodation preferences

The project also includes multilingual conversation support for English, Telugu, Hindi, Tamil, Spanish, French, Arabic and Japanese.

### Trip management

Depending on the configured features and data source, the application includes:

- Saved trips
- Trip editing
- Trip duplication
- Trip deletion
- Trip sharing / collaboration
- Price alerts
- Packing assistance
- Travel readiness
- Trip health information
- Calendar export
- Itinerary export
- Travel journal / post-trip information

---

## Application flow

```text
Explore a destination
        │
        ▼
Find relevant places
        │
        ▼
Plan the itinerary
        │
        ├──────────────► Search flights
        │
        ├──────────────► Search hotels
        │
        ▼
Review route and budget
        │
        ▼
Save / compare / export
        │
        ▼
Continue to booking
```

---

## Technology stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe frontend development |
| Vite | Development server and production build |
| React Router | Application navigation |
| Tailwind CSS | UI styling |
| Leaflet | Interactive maps |
| React Leaflet | React integration for maps |
| Axios | HTTP requests |
| Framer Motion | UI animation |
| Lucide React | Icons |
| Recharts | Charts and visual data |
| Supabase JS | Authentication and Supabase client |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend development |
| FastAPI | REST API |
| Uvicorn | ASGI server |
| Pydantic / Pydantic Settings | Validation and configuration |
| SQLAlchemy | Database access / ORM |
| PostgreSQL driver | PostgreSQL connectivity |
| python-jose | JWT-related authentication support |
| bcrypt | Password hashing support |
| Pandas | Data processing |
| Scikit-learn | Machine-learning utilities |
| PuLP | Optimisation / planning support |
| Pytest | Backend testing |
| HTTPX | HTTP testing and client requests |

### Data and services

The project is structured to work with external travel and location services through its backend integrations. Provider configuration can vary by environment.

The repository also contains the `trvl` travel-provider integration and its required attribution documentation.

---

## Apps, services and tools used

- **GitHub** — source control and project hosting
- **React** — frontend application
- **Vite** — frontend development and build tooling
- **FastAPI** — backend API
- **Python** — backend and planning logic
- **Supabase** — authentication and PostgreSQL data
- **Leaflet / React Leaflet** — maps
- **Axios** — API communication
- **Tailwind CSS** — styling
- **Framer Motion** — animations
- **Lucide React** — interface icons
- **Recharts** — data visualisation
- **SQLAlchemy** — database layer
- **Pydantic** — request and data validation
- **Pandas / Scikit-learn / PuLP** — data processing and optimisation components
- **Pytest** — automated backend tests
- **`trvl`** — travel search provider integration

---

## Architecture

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │   TypeScript + Vite  │
                         └──────────┬───────────┘
                                    │
                              HTTP / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │        Backend       │
                         └──────────┬───────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   Travel Providers          Planning Services         Supabase
   Flights / Hotels          Itinerary / Budget        Auth / PostgreSQL
   Places / Locations        Optimisation / AI         User Trips
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                                    ▼
                              Trip Results
```

---

## Project structure

```text
AI-Travel-Copilot/
│
├── backend/                 FastAPI application
├── frontend/                React + TypeScript application
├── supabase/                Database migrations
├── bin/                     Travel provider binary
├── data/                    Application data
├── datasets/                Dataset resources
├── models/                  Model / optimisation resources
├── scripts/                 Utility scripts
├── scratch/                 Development and verification utilities
│
├── .env.example             Environment variable template
├── requirements.txt         Python dependencies
├── TRVL_ATTRIBUTION.md      Travel provider attribution
├── LICENSE                  Project license
└── README.md                Project documentation
```

---

## Running locally

### 1. Clone the repository

```bash
git clone https://github.com/DarlaRahul/AI-Travel-Copilot.git
cd AI-Travel-Copilot
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to the appropriate local environment file and add the credentials required by your configuration.

Do not commit API keys, database passwords, Supabase service-role keys or other private credentials.

### 4. Start the backend

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

### 5. Start the frontend

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

---

## Testing

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

Runtime features that depend on external services should be tested with those services configured and available. A source-code review should not be presented as a successful runtime test.

---

## Configuration

The project uses environment-based configuration so that secrets and deployment-specific settings remain outside the source code.

Typical configuration areas include:

- Supabase URL and public client key
- Travel provider configuration
- AI provider configuration where enabled
- Database configuration where applicable
- Frontend API URL

See `.env.example` for the variables expected by the current repository.

---

## Screens / application areas

The application is organised around several major areas:

**Explore** — discover destinations, attractions, maps and related information.

**Plan Itinerary** — create and modify a day-by-day trip.

**Flights** — search and compare flight options.

**Hotels** — search, filter and compare accommodation.

**Assistant** — discuss a trip using natural language.

**My Trips** — manage saved trips and planning information.

---

## Development notes

This repository is intended to be developed as a complete application rather than a static UI prototype. The frontend communicates with the FastAPI backend, and backend services handle travel-data processing, planning logic and persistence integrations.

When adding a new feature, the preferred flow is:

```text
UI → API endpoint → service layer → provider / database → validated response → UI
```

This keeps provider-specific logic out of the frontend and makes the application easier to maintain.

---

## License and attribution

See [`LICENSE`](LICENSE) for the project license and [`TRVL_ATTRIBUTION.md`](TRVL_ATTRIBUTION.md) for the required attribution associated with the travel-provider component.

Third-party libraries and services remain subject to their respective licenses and terms.

---

## Developer

**Darla Rahul**

AI Travel Copilot is a portfolio project focused on full-stack development, conversational interfaces, travel-data integration, geographic planning, optimisation and practical product design.

---

## Repository

[github.com/DarlaRahul/AI-Travel-Copilot](https://github.com/DarlaRahul/AI-Travel-Copilot)
