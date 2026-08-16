from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.entities import Expense, User, Trip
from ..schemas.all_schemas import BudgetOptimizationRequest, BudgetOptimizationResponse, ExpenseCreate, ExpenseResponse
from ..optimization.budget_optimizer import budget_optimizer
from ..config import settings

router = APIRouter(prefix="/budget", tags=["Budget & Expenses"])

@router.post("/optimize", response_model=BudgetOptimizationResponse)
def optimize_trip_budget(req: BudgetOptimizationRequest):
    return budget_optimizer.optimize_budget(
        total_budget_inr=req.total_budget_inr,
        travel_style=req.travel_style,
        duration_days=req.duration_days,
        travelers_count=req.travelers_count,
        daily_spending_inr=req.daily_spending_inr
    )

@router.get("/expenses", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).order_by(Expense.id.desc()).all()
    # In live mode (USE_DEMO_DATA=false), empty expenses is truly empty.
    if not expenses and settings.USE_DEMO_DATA:
        demo_expenses = [
            Expense(category="Flight", title="Roundtrip Flight (Demo)", amount_inr=11200.0, date_str="Today", notes="Demo Flight 6E-204"),
            Expense(category="Stay", title="City Center Hotel 4 Nights (Demo)", amount_inr=16800.0, date_str="Today", notes="Deluxe Room"),
            Expense(category="Activities", title="Heritage Excursion Tour Pass (Demo)", amount_inr=3600.0, date_str="Today", notes="Guided tour for 2"),
            Expense(category="Food", title="Specialty Seafood Dinner (Demo)", amount_inr=2400.0, date_str="Today", notes="Local Cuisine Tasting")
        ]
        for e in demo_expenses:
            db.add(e)
        db.commit()
        expenses = db.query(Expense).all()
    return expenses

@router.post("/expenses", response_model=ExpenseResponse)
def add_expense(req: ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = Expense(
        trip_id=req.trip_id,
        category=req.category,
        title=req.title,
        amount_inr=req.amount_inr,
        date_str=req.date_str or "Today",
        notes=req.notes or ""
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense item not found")
    db.delete(exp)
    db.commit()
    return {"message": "Expense item deleted successfully"}
