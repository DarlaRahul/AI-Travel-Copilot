import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Travel Copilot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-travel-copilot-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./travel_copilot.db")
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    # Optional APIs
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    AMADEUS_CLIENT_ID: str = os.getenv("AMADEUS_CLIENT_ID", "")
    AMADEUS_CLIENT_SECRET: str = os.getenv("AMADEUS_CLIENT_SECRET", "")
    AMADEUS_ENVIRONMENT: str = os.getenv("AMADEUS_ENVIRONMENT", "test")
    UNSPLASH_ACCESS_KEY: str = os.getenv("UNSPLASH_ACCESS_KEY", "")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    HOTEL_PROVIDER_API_KEY: str = os.getenv("HOTEL_PROVIDER_API_KEY", "")
    USE_DEMO_DATA: bool = os.getenv("USE_DEMO_DATA", "false").lower() == "true"

    class Config:
        case_sensitive = True

settings = Settings()
