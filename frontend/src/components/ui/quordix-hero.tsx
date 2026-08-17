import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Plane, Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { LiquidGlass } from './liquid-glass';
import { NormalMap, MapPlace } from './normal-map';
import { normalizeTravelLocation, TravelLocation } from '../../utils/location';
import { travelApi } from '../../services/api';

interface TravelHeroProps {
  onSearch: (destination: string, location?: TravelLocation) => void;
  onPlanTrip: (destination: string) => void;
  initialDestination?: string;
  initialQuery?: string;
  className?: string;
}

export const QuordixHero: React.FC<TravelHeroProps> = ({
  onSearch,
  onPlanTrip,
  initialDestination,
  initialQuery,
  className
}) => {
  const initialVal = initialDestination || initialQuery || 'Dubai';
  const [searchInput, setSearchInput] = useState(initialVal);
  const [currentLocation, setCurrentLocation] = useState<TravelLocation>({
    displayName: initialVal,
    name: initialVal,
    country: 'Global Destination',
    latitude: 25.2048,
    longitude: 55.2708
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<MapPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync if initialDestination changes from parent
  useEffect(() => {
    if (initialDestination && initialDestination !== currentLocation.name) {
      resolveDestination(initialDestination);
    }
  }, [initialDestination]);

  // Resolve location into canonical English TravelLocation and fetch top POIs
  const resolveDestination = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      // 1. Resolve English location metadata via API
      const locRes = await travelApi.resolveDestination(query.trim());
      const normalized = normalizeTravelLocation(locRes.data, query);
      setCurrentLocation(normalized);
      setSearchInput(normalized.name); // Ensure input shows clean English name (e.g. "Tokyo", not "東京都")

      // 2. Fetch top nearby attractions for the map
      try {
        const placesRes = await travelApi.getPlaces(normalized.name, 0, 4);
        const placesList: MapPlace[] = (placesRes.data.results || []).map((p: any) => ({
          name: p.name,
          lat: p.lat || normalized.latitude,
          lon: p.lon || normalized.longitude,
          category: p.category || "Attraction",
          description: p.description,
          rating: p.rating,
          image: p.image_url
        }));
        setNearbyPlaces(placesList);
      } catch (err) {
        setNearbyPlaces([]);
      }

      onSearch(normalized.name, normalized);
    } catch (err: any) {
      console.warn("Destination resolve error:", err);
      setSearchError("We couldn't find that destination. Try a city, country, or landmark.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      resolveDestination(searchInput.trim());
    }
  };

  const handlePillClick = (dest: string) => {
    setSearchInput(dest);
    resolveDestination(dest);
  };

  return (
    <section className={`relative w-full rounded-3xl bg-[#fffefb] border border-[#e3d6c1] shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 space-y-8 ${className || ''}`}>
      {/* Decorative Warm Paper Topography Accent */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#221c17_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#faeee7] border border-[#c25e38]/20 text-[#c25e38] text-xs font-semibold font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#c88842]" />
          <span>Explore Anywhere in the World</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221c17] tracking-tight leading-[1.12] font-serif">
          Travel anywhere. <br className="hidden sm:inline" />
          Plan <span className="text-[#c25e38]">everything</span>.
        </h1>

        {/* Short Supporting Text */}
        <p className="text-sm sm:text-base text-[#695e52] max-w-xl mx-auto leading-relaxed font-sans">
          Explore destinations worldwide, discover places to stay, find the best ways to get there, and build your trip around your budget.
        </p>

        {/* Prominent Search Bar */}
        <div className="pt-2 max-w-2xl mx-auto">
          <LiquidGlass variant="dock" className="p-2 bg-[#fffefb] border border-[#e3d6c1] shadow-md">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-3">
              <div className="pl-3 text-[#998c7e] shrink-0">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-[#c25e38] animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-[#c25e38]" />
                )}
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Where do you want to go? (e.g. Tokyo, Paris, Dubai...)"
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#221c17] placeholder:text-[#998c7e] font-medium font-sans min-w-0"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 sm:px-6 py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0 font-serif cursor-pointer"
              >
                <span>{isSearching ? "Locating..." : "Explore"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </LiquidGlass>

          {searchError && (
            <p className="text-xs text-red-600 font-medium pt-2">{searchError}</p>
          )}
        </div>

        {/* Primary CTA + Secondary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onPlanTrip(currentLocation.name)}
            className="px-5 py-2 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white font-bold text-xs shadow-xs transition flex items-center gap-2 font-serif cursor-pointer"
          >
            <Plane className="w-3.5 h-3.5 -rotate-45 text-amber-300" />
            <span>Plan a Trip to {currentLocation.name}</span>
          </button>

          {/* Quick Popular Destination Chips */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs">
            {['Tokyo', 'Paris', 'Dubai', 'Hyderabad', 'London', 'Bali'].map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => handlePillClick(dest)}
                className={`px-3 py-1 rounded-full text-xs font-serif transition border cursor-pointer ${
                  currentLocation.name.toLowerCase() === dest.toLowerCase()
                    ? 'bg-[#faeee7] border-[#c25e38] text-[#c25e38] font-bold'
                    : 'bg-[#f5eee2]/60 border-[#e3d6c1] text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Embedded Normal Map (Clean, Geographic, Location-Aware) */}
      <div className="max-w-4xl mx-auto w-full pt-4">
        <NormalMap
          center={[currentLocation.latitude, currentLocation.longitude]}
          zoom={12}
          destinationName={currentLocation.displayName}
          places={nearbyPlaces}
          className="h-[300px] sm:h-[360px]"
        />
      </div>

      {/* Subtle Scroll Cue */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#998c7e] font-mono">
          <span>Scroll to discover stays, flights & itineraries</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#c25e38]" />
        </div>
      </div>
    </section>
  );
};
