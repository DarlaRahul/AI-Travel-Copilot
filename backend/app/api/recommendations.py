from fastapi import APIRouter, Query
from typing import Optional
from ..ml.recommender_service import recommender_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
def get_personalized_recommendations(
    query: Optional[str] = "beaches nightlife relaxation",
    city: Optional[str] = None,
    limit: int = 6
):
    recommendations = recommender_service.recommend(query=query, preferred_city=city, top_k=limit)
    return {
        "status": "success",
        "algorithm": "Hybrid Content-Based + Collaborative Matrix Factorization",
        "count": len(recommendations),
        "results": recommendations
    }
