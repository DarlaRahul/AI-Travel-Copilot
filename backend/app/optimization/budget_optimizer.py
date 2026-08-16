import json
import os
from typing import Dict, Any, Optional

BENCHMARK_PATH = "datasets/budgets/budget_benchmarks.json"

DEFAULT_SPLIT_RULES = {
    "Relaxed": {"stay_pct": 30, "transport_pct": 30, "activities_pct": 20, "food_pct": 15, "buffer_pct": 5},
    "Balanced": {"stay_pct": 35, "transport_pct": 25, "activities_pct": 20, "food_pct": 15, "buffer_pct": 5},
    "Packed": {"stay_pct": 30, "transport_pct": 28, "activities_pct": 25, "food_pct": 12, "buffer_pct": 5},
    "Luxury": {"stay_pct": 48, "transport_pct": 22, "activities_pct": 16, "food_pct": 10, "buffer_pct": 4}
}

class BudgetOptimizer:
    def __init__(self):
        self.benchmarks = self._load_benchmarks()

    def _load_benchmarks(self):
        if os.path.exists(BENCHMARK_PATH):
            try:
                with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    rules = data.get("budget_split_rules", {})
                    # Map legacy benchmark keys if present
                    if "Budget_Backpacker" in rules and "Relaxed" not in rules:
                        rules["Relaxed"] = rules["Budget_Backpacker"]
                    if "Mid_Range_Explorer" in rules and "Balanced" not in rules:
                        rules["Balanced"] = rules["Mid_Range_Explorer"]
                    if "Luxury_Leisure" in rules and "Luxury" not in rules:
                        rules["Luxury"] = rules["Luxury_Leisure"]
                    return {"budget_split_rules": {**DEFAULT_SPLIT_RULES, **rules}}
            except Exception as e:
                print(f"Error loading budget benchmarks: {e}")
        return {"budget_split_rules": DEFAULT_SPLIT_RULES}

    def optimize_budget(
        self,
        total_budget_inr: float,
        travel_style: str = "Balanced",
        duration_days: int = 5,
        travelers_count: int = 2,
        daily_spending_inr: Optional[float] = None
    ) -> Dict[str, Any]:
        style_clean = "Balanced"
        s_lower = travel_style.lower()
        if "lux" in s_lower:
            style_clean = "Luxury"
        elif "pack" in s_lower:
            style_clean = "Packed"
        elif "relax" in s_lower or "budget" in s_lower:
            style_clean = "Relaxed"

        rules = self.benchmarks["budget_split_rules"]
        splits = rules.get(style_clean) or rules.get("Balanced") or DEFAULT_SPLIT_RULES["Balanced"]

        stay_alloc = round(total_budget_inr * (splits.get("stay_pct", 35) / 100.0), 2)
        transport_alloc = round(total_budget_inr * (splits.get("transport_pct", 25) / 100.0), 2)
        activities_alloc = round(total_budget_inr * (splits.get("activities_pct", 20) / 100.0), 2)
        food_alloc = round(total_budget_inr * (splits.get("food_pct", 15) / 100.0), 2)
        buffer_alloc = round(total_budget_inr * (splits.get("buffer_pct", 5) / 100.0), 2)

        total_estimated = stay_alloc + transport_alloc + activities_alloc + food_alloc
        remaining = buffer_alloc

        # Daily spending calculations
        daily_rate = daily_spending_inr if daily_spending_inr else round((activities_alloc + food_alloc) / max(duration_days, 1), 0)
        daily_allowance_total = round(daily_rate * duration_days, 2)

        categories = [
            {
                "category": "Hotels & Stays",
                "allocated_inr": stay_alloc,
                "percentage": splits.get("stay_pct", 35),
                "description": f"₹{int(stay_alloc / max(duration_days - 1, 1)):,}/night for {max(duration_days - 1, 1)} nights ({travelers_count} guests)"
            },
            {
                "category": "Flights & Transport",
                "allocated_inr": transport_alloc,
                "percentage": splits.get("transport_pct", 25),
                "description": "Roundtrip flights + airport transfers & local cabs"
            },
            {
                "category": "Activities & Sights",
                "allocated_inr": activities_alloc,
                "percentage": splits.get("activities_pct", 20),
                "description": "Entry tickets, water sports, guided excursions"
            },
            {
                "category": "Food & Dining",
                "allocated_inr": food_alloc,
                "percentage": splits.get("food_pct", 15),
                "description": f"₹{int(food_alloc / max(duration_days, 1)):,}/day for breakfast, lunch, and specialty dining"
            },
            {
                "category": "Emergency Reserve",
                "allocated_inr": buffer_alloc,
                "percentage": splits.get("buffer_pct", 5),
                "description": "Contingency reserve for spontaneous plans & local taxes"
            }
        ]

        suggestions = [
            f"Allocating {splits.get('stay_pct', 35)}% (₹{stay_alloc:,.0f}) to accommodations provides access to verified {style_clean} hotels.",
            f"Daily spending allowance of ₹{daily_rate:,.0f}/day covers curated sights, local cafes, and experiences.",
            f"Booking flights 14–21 days in advance typically reduces airfare expenses by ~15%."
        ]

        return {
            "total_budget_inr": total_budget_inr,
            "total_estimated_inr": total_estimated,
            "remaining_buffer_inr": remaining,
            "daily_spending_inr": daily_rate,
            "daily_allowance_total_inr": daily_allowance_total,
            "travel_style": style_clean,
            "status": "Optimal",
            "categories": categories,
            "optimization_suggestions": suggestions
        }

budget_optimizer = BudgetOptimizer()
