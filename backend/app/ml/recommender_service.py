import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

RECOMMENDER_PATH = "models/recommender_bundle.joblib"

class HybridRecommenderService:
    def __init__(self):
        self.bundle = None
        self._load_bundle()

    def _load_bundle(self):
        if os.path.exists(RECOMMENDER_PATH):
            try:
                self.bundle = joblib.load(RECOMMENDER_PATH)
            except Exception as e:
                print(f"Error loading recommender bundle: {e}")

    def recommend(self, query="Goa beaches nightlife", preferred_city=None, top_k=6):
        if not self.bundle:
            return []
            
        vectorizer = self.bundle["vectorizer"]
        poi_vectors = self.bundle["poi_vectors"]
        metadata = self.bundle["poi_metadata"]
        
        query_vec = vectorizer.transform([query])
        sim_scores = cosine_similarity(query_vec, poi_vectors).flatten()
        
        scored_items = []
        for idx, score in enumerate(sim_scores):
            item = metadata[idx].copy()
            # Boost score based on rating and city match
            match_boost = 0.0
            if preferred_city and item["city"].lower() == preferred_city.lower():
                match_boost += 0.3
            rating_boost = (item["rating"] / 5.0) * 0.2
            final_score = round(float(score * 0.5 + match_boost + rating_boost) * 100, 1)
            item["ai_recommendation_score"] = min(99.0, max(65.0, final_score))
            scored_items.append((final_score, item))
            
        scored_items.sort(key=lambda x: x[0], reverse=True)
        return [x[1] for x in scored_items[:top_k]]

recommender_service = HybridRecommenderService()
