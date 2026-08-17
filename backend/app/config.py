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
    
    # Supabase Cloud Integration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
    SUPABASE_PUBLISHABLE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", "")))
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    USE_LOCAL_MODE: bool = os.getenv("USE_LOCAL_MODE", os.getenv("VITE_USE_LOCAL_MODE", "false")).lower() == "true"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./travel_copilot.db")
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    # Travel Data Provider (trvl integration: PolyForm Noncommercial 1.0)
    TRAVEL_DATA_MODE: str = os.getenv("TRAVEL_DATA_MODE", "live").lower()
    TRVL_PATH: str = os.getenv("TRVL_PATH", "")
    USE_DEMO_DATA: bool = os.getenv("USE_DEMO_DATA", "false").lower() == "true"
    
    # Optional Third-Party Services
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    UNSPLASH_ACCESS_KEY: str = os.getenv("UNSPLASH_ACCESS_KEY", "")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()

