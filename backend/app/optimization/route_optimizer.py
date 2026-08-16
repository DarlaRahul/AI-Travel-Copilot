import math

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RouteOptimizer:
    def optimize_daily_sequence(self, activities: list):
        if len(activities) <= 2:
            return activities

        # Nearest neighbor TSP heuristic for daily itinerary sequencing
        unvisited = activities.copy()
        current = unvisited.pop(0)
        ordered = [current]

        while unvisited:
            nearest_idx = 0
            min_dist = float("inf")
            for idx, act in enumerate(unvisited):
                dist = haversine_distance(current.get("lat", 0), current.get("lon", 0), act.get("lat", 0), act.get("lon", 0))
                if dist < min_dist:
                    min_dist = dist
                    nearest_idx = idx
            current = unvisited.pop(nearest_idx)
            ordered.append(current)

        return ordered

route_optimizer = RouteOptimizer()
