import random
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.entities import Booking, Expense
from ..config import settings
from .auth_deps import get_current_user_optional, AuthenticatedUser

router = APIRouter(prefix="/bookings", tags=["Bookings Management"])

class BookingCreateRequest(BaseModel):
    booking_type: str  # "Hotel" or "Flight"
    item_name: str
    destination: str
    amount_inr: float
    details: Optional[str] = ""
    trip_id: Optional[int] = None
    booking_date: Optional[str] = None
    reference_code: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    booking_type: str
    item_name: str
    reference_code: str
    destination: str
    amount_inr: float
    status: str
    details: str
    booking_date: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)
):
    query = db.query(Booking)
    if current_user:
        query = query.filter(Booking.user_id == current_user.id)
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    # Only initialize demo bookings if explicitly configured in demo mode and unauthenticated
    if not bookings and settings.USE_DEMO_DATA and not current_user:
        demo_bookings = [
            Booking(
                booking_type="Hotel",
                item_name="The Himalayan Luxury Castle & Resort (Demo)",
                reference_code="BKG-HTL-DEMO-7821",
                destination="Manali",
                amount_inr=12500.0,
                status="Demo Record",
                details="4 Nights • Luxury Alpine Suite",
                booking_date=datetime.date.today().strftime("%d %b %Y")
            ),
            Booking(
                booking_type="Flight",
                item_name="IndiGo Flight 6E-204 (Demo DEL -> KUU)",
                reference_code="BKG-FLT-DEMO-941",
                destination="Manali",
                amount_inr=6800.0,
                status="Demo Record",
                details="2 Adults • Morning Direct Non-stop",
                booking_date=datetime.date.today().strftime("%d %b %Y")
            )
        ]
        for b in demo_bookings:
            db.add(b)
        db.commit()
        bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return bookings

@router.post("", response_model=BookingResponse)
def create_booking(
    req: BookingCreateRequest, 
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None

    # Use provider reference or generate a tracked handoff reference
    prefix = "REF-HTL" if req.booking_type.lower() == "hotel" else "REF-FLT"
    dest_code = (req.destination[:3].upper() if req.destination else "GEN")
    rand_id = random.randint(1000, 9999)
    ref_code = req.reference_code or f"{prefix}-{dest_code}-{rand_id}"

    date_val = req.booking_date or datetime.date.today().strftime("%d %b %Y")

    new_booking = Booking(
        user_id=user_id,
        trip_id=req.trip_id,
        booking_type=req.booking_type.title(),
        item_name=req.item_name,
        reference_code=ref_code,
        destination=req.destination.title(),
        amount_inr=req.amount_inr,
        status="Recorded / Provider Handoff",
        details=req.details or f"{req.booking_type} Selection Reference",
        booking_date=date_val
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Automatically log expense in Budget Tracker
    new_expense = Expense(
        user_id=user_id,
        trip_id=req.trip_id,
        category="Stay" if req.booking_type.lower() == "hotel" else "Flight",
        title=f"{req.item_name} ({ref_code})",
        amount_inr=req.amount_inr,
        date_str=date_val,
        notes=f"Auto-logged from booking reference {ref_code}"
    )
    db.add(new_expense)
    db.commit()

    return new_booking

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional)
):
    query = db.query(Booking).filter(Booking.id == booking_id)
    if current_user:
        query = query.filter(Booking.user_id == current_user.id)
    booking = query.first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")
    db.delete(booking)
    db.commit()
    return {"message": "Booking record removed successfully", "id": booking_id}
