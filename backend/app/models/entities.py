import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
    travel_style = Column(String(100), default="Balanced")
    preferred_currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    country = Column(String(255), default="India")
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=5)
    travelers_count = Column(Integer, default=2)
    travelers_label = Column(String(50), default="2 Adults")
    total_budget_inr = Column(Float, default=40000.0)
    estimated_cost_inr = Column(Float, default=38000.0)
    travel_style = Column(String(100), default="Balanced")
    interests = Column(JSON, default=list) # e.g. ["Beaches", "Food", "Nightlife"]
    image_url = Column(String(500), default="")
    status = Column(String(50), default="upcoming") # upcoming, completed, planned
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="trips")
    itinerary_days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trip", cascade="all, delete-orphan")

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    theme = Column(String(255), default="")
    description = Column(Text, default="")
    date_str = Column(String(50), default="")
    
    trip = relationship("Trip", back_populates="itinerary_days")
    activities = relationship("Activity", back_populates="itinerary_day", cascade="all, delete-orphan", order_by="Activity.order_index")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("itinerary_days.id"), nullable=False)
    order_index = Column(Integer, default=0)
    time_slot = Column(String(50), default="Morning") # Morning, Afternoon, Evening
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    category = Column(String(100), default="Sightseeing")
    cost_inr = Column(Float, default=0.0)
    duration_hrs = Column(Float, default=2.0)
    rating = Column(Float, default=4.5)
    lat = Column(Float, default=0.0)
    lon = Column(Float, default=0.0)
    image_url = Column(String(500), default="")
    location_name = Column(String(255), default="")
    
    itinerary_day = relationship("ItineraryDay", back_populates="activities")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    category = Column(String(100), nullable=False) # Stay, Flight, Food, Activities, Transport, Misc
    title = Column(String(255), nullable=False)
    amount_inr = Column(Float, nullable=False)
    date_str = Column(String(50), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="expenses")
    trip = relationship("Trip", back_populates="expenses")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    booking_type = Column(String(50), nullable=False) # "Hotel" or "Flight"
    item_name = Column(String(255), nullable=False)
    reference_code = Column(String(100), unique=True, index=True, nullable=False)
    destination = Column(String(100), default="")
    amount_inr = Column(Float, default=0.0)
    status = Column(String(50), default="Confirmed")
    details = Column(String(255), default="")
    booking_date = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    trip = relationship("Trip", back_populates="bookings")

class DisruptionEvent(Base):
    __tablename__ = "disruption_events"
    
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(50), nullable=False)
    airline = Column(String(100), nullable=False)
    route = Column(String(100), nullable=False)
    scheduled_departure = Column(String(100), nullable=False)
    status = Column(String(100), nullable=False)
    severity = Column(String(50), default="Moderate") # Low, Moderate, High, Critical
    delay_reason = Column(String(255), default="")
    impact_summary = Column(Text, default="")
    rebooking_action = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
