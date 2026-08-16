import os
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

KNOWLEDGE_PATH = "datasets/destinations/destinations_rich_knowledge.json"

class RAGEngine:
    def __init__(self):
        self.documents = []
        self.vectorizer = None
        self.doc_vectors = None
        self._load_knowledge()

    def _load_knowledge(self):
        if os.path.exists(KNOWLEDGE_PATH):
            try:
                with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                
                # Build rich textual corpus for dense retrieval
                corpus = [
                    f"{d.get('name', '')} in {d.get('city', '')}, {d.get('state', '')}, {d.get('country', '')}. Category: {d.get('category', '')}. Tags: {d.get('tags', '')}. {d.get('description', '')}"
                    for d in self.documents
                ]
                
                if corpus:
                    self.vectorizer = TfidfVectorizer(stop_words='english')
                    self.doc_vectors = self.vectorizer.fit_transform(corpus)
            except Exception as e:
                print(f"Error loading RAG knowledge base: {e}")

    def query(self, search_text: str, city: str = None, top_k: int = 30):
        if not self.documents:
            return []

        city_clean = city.strip().lower() if city else ""
        
        # 1. First prioritize exact city/region/country matches
        if city_clean:
            primary_matches = []
            secondary_matches = []
            
            for doc in self.documents:
                doc_city = doc.get("city", "").lower()
                doc_state = doc.get("state", "").lower()
                doc_country = doc.get("country", "").lower()
                doc_name = doc.get("name", "").lower()
                
                # Primary: The destination is specifically located in this city, state, or country
                if (city_clean == doc_city or city_clean == doc_state or city_clean == doc_country or
                    city_clean in doc_city or doc_city in city_clean or
                    city_clean in doc_state or city_clean in doc_country):
                    primary_matches.append(doc.copy())
                elif city_clean in doc_name:
                    secondary_matches.append(doc.copy())

            if primary_matches:
                return primary_matches

            if secondary_matches:
                return secondary_matches

        # 2. Fallback to TF-IDF semantic vector similarity
        if self.doc_vectors is not None and self.vectorizer is not None:
            query_vec = self.vectorizer.transform([search_text])
            scores = cosine_similarity(query_vec, self.doc_vectors).flatten()

            results = []
            for idx, score in enumerate(scores):
                doc = self.documents[idx].copy()
                doc["similarity_score"] = float(round(score, 4))
                results.append((score, doc))

            results.sort(key=lambda x: x[0], reverse=True)
            return [r[1] for r in results[:top_k]]

        return self.documents[:top_k]

rag_engine = RAGEngine()
