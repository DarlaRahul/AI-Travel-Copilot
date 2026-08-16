import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .models.entities import User, Trip, ItineraryDay, Activity, Expense, DisruptionEvent, Booking

# Import API routers
from .api.auth import router as auth_router
from .api.trips import router as trips_router
from .api.destinations import router as destinations_router
from .api.recommendations import router as recommendations_router
from .api.hotels import router as hotels_router
from .api.flights import router as flights_router
from .api.budget import router as budget_router
from .api.disruptions import router as disruptions_router
from .api.chat import router as chat_router
from .api.weather import router as weather_router
from .api.bookings import router as bookings_router
from .api.dashboard import router as dashboard_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Travel Copilot API for end-to-end trip planning, recommendations, ML pricing, RAG retrieval, and disruption management."
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(trips_router, prefix=settings.API_V1_STR)
app.include_router(destinations_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(hotels_router, prefix=settings.API_V1_STR)
app.include_router(flights_router, prefix=settings.API_V1_STR)
app.include_router(budget_router, prefix=settings.API_V1_STR)
app.include_router(disruptions_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
