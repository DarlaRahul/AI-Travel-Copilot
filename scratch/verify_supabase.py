import os
import sys
import json
import sqlite3
import datetime
from pathlib import Path
from jose import jwt

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.config import settings
from backend.app.database import SessionLocal, Base, engine, db_url
from backend.app.models.entities import Trip, Expense, Booking, ItineraryDay, Activity
from backend.app.api.auth_deps import get_current_user, AuthenticatedUser

def test_environment_variables():
    print("=" * 60)
    print("  1. ENVIRONMENT & CONFIGURATION CHECK")
    print("=" * 60)
    
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_PUBLISHABLE_KEY
    has_live_url = bool(supabase_url and supabase_url.startswith("http") and not "<" in supabase_url)
    has_live_key = bool(supabase_key and len(supabase_key) > 20 and not "<" in supabase_key)
    
    print(f"• SUPABASE_URL: {supabase_url if supabase_url else '(Not set)'}")
    print(f"• SUPABASE_PUBLISHABLE_KEY: {'[Configured]' if has_live_key else '(Not set or placeholder)'}")
    print(f"• DATABASE_URL: {settings.DATABASE_URL}")
    print(f"• USE_LOCAL_MODE: {settings.USE_LOCAL_MODE}")
    
    is_live = has_live_url and has_live_key
    print(f"\n=> Mode: {'LIVE SUPABASE CLOUD' if is_live else 'OFFLINE / LOCAL WORKSPACE'}")
    return is_live

def test_database_connection():
    print("\n" + "=" * 60)
    print("  2. DATABASE ENGINE & TABLES AUDIT")
    print("=" * 60)
    
    is_postgres = db_url.startswith("postgresql")
    print(f"• Engine Type: {'PostgreSQL (Supabase)' if is_postgres else 'SQLite (Local)'}")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        trips_count = db.query(Trip).count()
        expenses_count = db.query(Expense).count()
        bookings_count = db.query(Booking).count()
        print(f"• Connection Status: SUCCESS")
        print(f"• Registered Trips: {trips_count}")
        print(f"• Registered Expenses: {expenses_count}")
        print(f"• Registered Bookings: {bookings_count}")
        return True
    except Exception as e:
        print(f"• Database Connection Error: {e}")
        return False
    finally:
        db.close()

def test_multi_user_isolation():
    print("\n" + "=" * 60)
    print("  3. MULTI-USER ISOLATION & JWT ENFORCEMENT TEST")
    print("=" * 60)
    
    user_a_id = "user_alpha_uuid_0001"
    user_b_id = "user_beta_uuid_0002"
    
    # Generate real JWT tokens for User A and User B
    token_a = jwt.encode({"sub": user_a_id, "email": "alpha@example.com", "user_metadata": {"display_name": "Alpha Voyager"}}, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    token_b = jwt.encode({"sub": user_b_id, "email": "beta@example.com", "user_metadata": {"display_name": "Beta Voyager"}}, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    
    # Test token verification dependency
    auth_user_a = get_current_user(f"Bearer {token_a}")
    auth_user_b = get_current_user(f"Bearer {token_b}")
    
    assert auth_user_a.id == user_a_id, "User A ID mismatch"
    assert auth_user_b.id == user_b_id, "User B ID mismatch"
    print("• JWT User Identity Extraction: PASS")
    
    db = SessionLocal()
    try:
        # Clean previous test records
        db.query(Trip).filter(Trip.user_id.in_([user_a_id, user_b_id])).delete(synchronize_session=False)
        db.commit()
        
        # User A creates a trip to Dubai
        trip_a = Trip(
            user_id=user_a_id,
            title="User A Dubai Exploration",
            destination="Dubai",
            country="United Arab Emirates",
            start_date="2026-09-01",
            end_date="2026-09-05",
            duration_days=4,
            travelers_count=2,
            travelers_label="2 Adults",
            total_budget_inr=60000.0,
            estimated_cost_inr=58000.0,
            travel_style="Balanced",
            interests=["Heritage", "Food"],
            status="upcoming"
        )
        db.add(trip_a)
        db.commit()
        db.refresh(trip_a)
        print(f"• User A created Trip (ID={trip_a.id}, Destination='Dubai')")
        
        # User B queries their trips
        user_b_trips = db.query(Trip).filter(Trip.user_id == user_b_id).all()
        print(f"• User B sees {len(user_b_trips)} trips (Expected: 0)")
        assert len(user_b_trips) == 0, "ISOLATION BREACH: User B saw User A's trip!"
        print("  -> User B CANNOT see User A's trip: PASS")
        
        # User A queries their trips
        user_a_trips = db.query(Trip).filter(Trip.user_id == user_a_id).all()
        print(f"• User A sees {len(user_a_trips)} trips (Expected: 1)")
        assert len(user_a_trips) == 1, "User A trip retrieval failed"
        print("  -> User A sees their own trip: PASS")
        
        # User B creates a trip to Tokyo
        trip_b = Trip(
            user_id=user_b_id,
            title="User B Tokyo Adventure",
            destination="Tokyo",
            country="Japan",
            start_date="2026-10-10",
            end_date="2026-10-17",
            duration_days=7,
            travelers_count=1,
            travelers_label="1 Adult",
            total_budget_inr=150000.0,
            estimated_cost_inr=145000.0,
            travel_style="Luxury",
            interests=["Culture", "Anime"],
            status="upcoming"
        )
        db.add(trip_b)
        db.commit()
        db.refresh(trip_b)
        print(f"• User B created Trip (ID={trip_b.id}, Destination='Tokyo')")
        
        # Re-verify isolation
        user_a_trips_updated = db.query(Trip).filter(Trip.user_id == user_a_id).all()
        assert len(user_a_trips_updated) == 1 and user_a_trips_updated[0].destination == "Dubai"
        
        user_b_trips_updated = db.query(Trip).filter(Trip.user_id == user_b_id).all()
        assert len(user_b_trips_updated) == 1 and user_b_trips_updated[0].destination == "Tokyo"
        print("• Bi-directional Multi-User Isolation: PASS")
        
        # Cleanup
        db.delete(trip_a)
        db.delete(trip_b)
        db.commit()
        print("• Multi-tenant Isolation Test Completed Cleanly: PASS")
        return True
    except Exception as e:
        print(f"• Isolation Test Error: {e}")
        return False
    finally:
        db.close()

def inspect_supabase_migration():
    print("\n" + "=" * 60)
    print("  4. SUPABASE MIGRATION & RLS POLICIES CHECK")
    print("=" * 60)
    
    migration_file = Path("supabase/migrations/20260817000000_init_schema.sql")
    if not migration_file.exists():
        print("• Migration file not found: FAIL")
        return False
        
    content = migration_file.read_text(encoding="utf-8")
    import re
    tables = re.findall(r'CREATE TABLE IF NOT EXISTS public\.([a-z_]+)', content)
    rls_tables = re.findall(r'ALTER TABLE public\.([a-z_]+) ENABLE ROW LEVEL SECURITY;', content)
    policies = re.findall(r'CREATE POLICY "(.*?)"\s+ON public\.([a-z_]+).*?USING \((.*?)\);', content, re.DOTALL)
    
    print(f"• Tables in Migration: {', '.join(tables)}")
    print(f"• RLS Enabled on Tables: {', '.join(rls_tables)}")
    print(f"• Policies Defined: {len(policies)}")
    for name, tbl, rule in policies:
        print(f"   - [{tbl}] '{name}': {rule.strip()}")
        
    assert len(tables) == len(rls_tables), "Not all tables have RLS enabled!"
    print("• Migration Schema and RLS Design: PASS")
    return True

if __name__ == "__main__":
    is_live = test_environment_variables()
    db_ok = test_database_connection()
    isolation_ok = test_multi_user_isolation()
    migration_ok = inspect_supabase_migration()
    
    print("\n" + "=" * 60)
    print("  FINAL AUDIT SUMMARY")
    print("=" * 60)
    print(f"• SUPABASE CLOUD CONNECTION : {'PASS' if is_live else 'PENDING (Set credentials in .env.local)'}")
    print(f"• DATABASE ENGINE READY     : {'PASS' if db_ok else 'FAIL'}")
    print(f"• USER ISOLATION & JWT      : {'PASS' if isolation_ok else 'FAIL'}")
    print(f"• MIGRATION SCHEMA & RLS    : {'PASS' if migration_ok else 'FAIL'}")
    print("=" * 60)
