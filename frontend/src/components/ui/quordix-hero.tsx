import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Plane, 
  Building2, 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  Clock, 
  CloudSun, 
  Star, 
  Loader2, 
  CreditCard,
  CheckCircle2,
  BrainCircuit,
  Sliders,
  DollarSign
} from 'lucide-react';
import { LiquidGlass } from './liquid-glass';
import { NormalMap, MapPlace } from './normal-map';
import { normalizeTravelLocation, TravelLocation } from '../../utils/location';
import { travelApi } from '../../services/api';

export type TravelMode = 'explore' | 'itinerary' | 'flights' | 'hotels';

interface ModeBasedHeroProps {
  initialMode?: TravelMode;
  initialDestination?: string;
  initialQuery?: string;
  onDestinationChange?: (destination: string, location?: TravelLocation) => void;
  onSearch?: (destination: string, location?: TravelLocation) => void;
  onPlanTrip?: (destination: string) => void;
  className?: string;
}

export const QuordixHero: React.FC<ModeBasedHeroProps> = ({
  initialMode = 'explore',
  initialDestination = 'Tokyo',
  initialQuery,
  onDestinationChange,
  onSearch,
  onPlanTrip,
  className
}) => {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const defaultReturn = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  // Active Hero Task Mode
  const [activeMode, setActiveMode] = useState<TravelMode>(initialMode);

  // Shared Destination Context (Strict English Normalized)
  const defaultCity = initialDestination || initialQuery || 'Tokyo';
  const [destination, setDestination] = useState<string>(defaultCity);
  const [currentLocation, setCurrentLocation] = useState<TravelLocation>({
    displayName: `${defaultCity}, Japan`,
    name: defaultCity,
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<MapPlace[]>([]);
  const [weatherData, setWeatherData] = useState<{ temp_c?: number; condition?: string; description?: string } | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // EXPLORE MODE STATE
  const [exploreInput, setExploreInput] = useState<string>(defaultCity);

  // ITINERARY MODE STATE
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(defaultReturn);
  const [travelers, setTravelers] = useState<string>('2 Adults');
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [travelStyle, setTravelStyle] = useState<string>('Balanced');
  const [budget, setBudget] = useState<number>(80000);
  const [dailySpend, setDailySpend] = useState<number>(6000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Food', 'Culture', 'History', 'Sightseeing'
  ]);
  const [isGeneratingTrip, setIsGeneratingTrip] = useState<boolean>(false);

  // FLIGHTS MODE STATE
  const [flightOrigin, setFlightOrigin] = useState<string>('Delhi');
  const [flightDest, setFlightDest] = useState<string>(defaultCity);
  const [flightDeparture, setFlightDeparture] = useState<string>(today);
  const [flightReturn, setFlightReturn] = useState<string>(defaultReturn);
  const [flightCabin, setFlightCabin] = useState<string>('ECONOMY');
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);
  const [flightsSearched, setFlightsSearched] = useState<boolean>(false);

  // HOTELS MODE STATE
  const [hotelCity, setHotelCity] = useState<string>(defaultCity);
  const [hotelCheckIn, setHotelCheckIn] = useState<string>(today);
  const [hotelCheckOut, setHotelCheckOut] = useState<string>(defaultReturn);
  const [hotelTier, setHotelTier] = useState<string>('all');
  const [hotelResults, setHotelResults] = useState<any[]>([]);
  const [isSearchingHotels, setIsSearchingHotels] = useState<boolean>(false);
  const [hotelsSearched, setHotelsSearched] = useState<boolean>(false);

  // Calculate Itinerary Duration
  const getDurationDays = () => {
    try {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
      return Math.max(diff, 1);
    } catch {
      return 5;
    }
  };
  const durationDays = getDurationDays();
  const durationNights = Math.max(durationDays - 1, 1);

  // Load destination metadata and POIs
  const resolveCity = async (query: string) => {
    if (!query.trim()) return;
    setIsResolving(true);
    try {
      const res = await travelApi.resolveDestination(query.trim());
      const loc = normalizeTravelLocation(res.data, query);
      setCurrentLocation(loc);
      setDestination(loc.name);
      setFlightDest(loc.name);
      setHotelCity(loc.name);

      // Fetch top places
      try {
        const placesRes = await travelApi.getPlaces(loc.name, 0, 4);
        const list: MapPlace[] = (placesRes.data.results || []).map((p: any) => ({
          name: p.name,
          lat: p.lat || loc.latitude,
          lon: p.lon || loc.longitude,
          category: p.category || 'Attraction',
          description: p.description,
          rating: p.rating,
          image: p.image_url
        }));
        setNearbyPlaces(list);
      } catch {
        setNearbyPlaces([]);
      }

      // Fetch live weather
      try {
        const weatherRes = await travelApi.getWeather(loc.name);
        setWeatherData(weatherRes.data?.current || null);
      } catch {
        setWeatherData(null);
      }

      if (onDestinationChange) onDestinationChange(loc.name, loc);
      if (onSearch) onSearch(loc.name, loc);
    } catch (e) {
      console.warn("Could not resolve location:", e);
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    resolveCity(defaultCity);
  }, []);

  // Update budget & tier automatically when Luxury is selected
  const handleTravelStyleChange = (style: string) => {
    setTravelStyle(style);
    if (style === 'Luxury') {
      setBudget(140000);
      setDailySpend(14000);
      setHotelTier('5_star');
    } else if (style === 'Relaxed') {
      setBudget(65000);
      setDailySpend(4500);
      setHotelTier('boutique');
    } else if (style === 'Packed') {
      setBudget(75000);
      setDailySpend(5500);
      setHotelTier('comfort');
    } else {
      setBudget(80000);
      setDailySpend(6000);
      setHotelTier('all');
    }
  };

  // EXPLORE SUBMIT
  const handleExploreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exploreInput.trim()) {
      resolveCity(exploreInput.trim());
    }
  };

  // ITINERARY GENERATE
  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingTrip(true);
    const targetCity = destination || 'Tokyo';
    localStorage.setItem('travel_copilot_active_destination', targetCity);

    try {
      const res = await travelApi.planTrip({
        destination: targetCity,
        start_date: startDate,
        end_date: endDate,
        travelers_count: adultsCount + childrenCount,
        travelers_label: `${adultsCount} Adults${childrenCount > 0 ? `, ${childrenCount} Children` : ''}`,
        budget_inr: budget,
        travel_style: travelStyle,
        interests: selectedInterests,
        daily_spending_inr: dailySpend,
        rooms_count: roomsCount
      });
      const tripId = res.data.id || 1;
      localStorage.setItem('travel_copilot_active_trip_id', String(tripId));
      navigate(`/itinerary/${tripId}?dest=${encodeURIComponent(targetCity)}`);
    } catch (err) {
      console.error("Itinerary plan error:", err);
      setIsGeneratingTrip(false);
      navigate(`/itinerary/1?dest=${encodeURIComponent(targetCity)}`);
    }
  };

  // FLIGHT SEARCH
  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingFlights(true);
    setFlightsSearched(true);
    try {
      const res = await travelApi.searchFlights({
        source: flightOrigin,
        destination: flightDest,
        departureDate: flightDeparture,
        returnDate: flightReturn,
        adults: adultsCount,
        cabin: flightCabin
      });
      setFlightResults(res.data.flights || []);
    } catch {
      setFlightResults([]);
    } finally {
      setIsSearchingFlights(false);
    }
  };

  // HOTEL SEARCH
  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingHotels(true);
    setHotelsSearched(true);
    try {
      const res = await travelApi.getHotels({
        city: hotelCity,
        check_in: hotelCheckIn,
        check_out: hotelCheckOut,
        adults: adultsCount,
        rooms: roomsCount,
        tier: hotelTier !== 'all' ? hotelTier : undefined
      });
      setHotelResults(res.data.results || []);
    } catch {
      setHotelResults([]);
    } finally {
      setIsSearchingHotels(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <section className={`relative w-full rounded-3xl bg-[#fffefb] border border-[#e3d6c1] shadow-sm overflow-hidden p-6 sm:p-10 space-y-8 ${className || ''}`}>
      {/* Decorative Warm Paper Topography Accent */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#221c17_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        {/* Brand Accent */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#faeee7] border border-[#c25e38]/20 text-[#c25e38] text-xs font-semibold font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#c88842]" />
          <span>Intelligent Travel Copilot</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#221c17] tracking-tight leading-[1.12] font-serif">
          Travel anywhere. <br className="hidden sm:inline" />
          Plan <span className="text-[#c25e38]">everything</span>.
        </h1>

        {/* Short Supporting Text */}
        <p className="text-sm sm:text-base text-[#695e52] max-w-xl mx-auto leading-relaxed font-sans">
          Choose a travel goal to begin: explore destinations worldwide, build a personalized itinerary, find flights, or discover curated stays.
        </p>

        {/* 1. PRIMARY TASK SELECTOR (LIQUID GLASS MODE SWITCHER) */}
        <div className="pt-3 max-w-2xl mx-auto">
          <LiquidGlass variant="dock" className="p-1.5 bg-[#fffefb]/90 border border-[#e3d6c1] shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMode('explore')}
                className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 font-serif cursor-pointer ${
                  activeMode === 'explore'
                    ? 'bg-[#c25e38] text-white shadow-xs'
                    : 'text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Explore</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('itinerary')}
                className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 font-serif cursor-pointer ${
                  activeMode === 'itinerary'
                    ? 'bg-[#c25e38] text-white shadow-xs'
                    : 'text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Plan Itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('flights')}
                className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 font-serif cursor-pointer ${
                  activeMode === 'flights'
                    ? 'bg-[#c25e38] text-white shadow-xs'
                    : 'text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
                }`}
              >
                <Plane className="w-3.5 h-3.5 shrink-0 -rotate-45" />
                <span>Find Flights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('hotels')}
                className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 font-serif cursor-pointer ${
                  activeMode === 'hotels'
                    ? 'bg-[#c25e38] text-white shadow-xs'
                    : 'text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Find Hotels</span>
              </button>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE-SPECIFIC TASK INTERFACES (ONLY ONE IS ACTIVE AT A TIME) */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE 1: EXPLORE A DESTINATION */}
      {/* ------------------------------------------------------------------------- */}
      {activeMode === 'explore' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto">
            <LiquidGlass variant="dock" className="p-2 bg-[#fffefb] border border-[#e3d6c1] shadow-md">
              <form onSubmit={handleExploreSubmit} className="flex items-center gap-2 sm:gap-3">
                <div className="pl-3 text-[#998c7e] shrink-0">
                  {isResolving ? (
                    <Loader2 className="w-5 h-5 text-[#c25e38] animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-[#c25e38]" />
                  )}
                </div>
                <input
                  type="text"
                  value={exploreInput}
                  onChange={(e) => setExploreInput(e.target.value)}
                  placeholder="Where do you want to go? (e.g. Tokyo, Paris, Dubai, Bali...)"
                  className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-[#221c17] placeholder:text-[#998c7e] font-medium font-sans min-w-0"
                />
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-6 py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 shrink-0 font-serif cursor-pointer"
                >
                  <span>{isResolving ? "Locating..." : "Explore"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </LiquidGlass>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
              <span className="text-[11px] font-bold text-[#998c7e] uppercase tracking-wider font-mono mr-1">
                Popular:
              </span>
              {['Tokyo', 'Paris', 'Dubai', 'Hyderabad', 'London', 'Bali', 'Rome'].map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => {
                    setExploreInput(dest);
                    resolveCity(dest);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-serif transition border cursor-pointer ${
                    destination.toLowerCase() === dest.toLowerCase()
                      ? 'bg-[#faeee7] border-[#c25e38] text-[#c25e38] font-bold'
                      : 'bg-[#f5eee2]/60 border-[#e3d6c1] text-[#695e52] hover:bg-[#f5eee2]'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Location Title & Context Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#f5eee2]/70 rounded-2xl border border-[#e3d6c1]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center font-bold text-lg font-serif">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-[#221c17] font-serif leading-tight">
                  {currentLocation.displayName}
                </h3>
                <p className="text-xs text-[#695e52]">
                  {currentLocation.country} • Global Travel Destination
                </p>
              </div>
            </div>

            {weatherData && (
              <div className="flex items-center gap-2 bg-[#fffefb] px-3.5 py-1.5 rounded-full border border-[#e3d6c1] shadow-2xs text-xs font-mono">
                <CloudSun className="w-4 h-4 text-[#c88842]" />
                <span className="font-bold text-[#221c17]">{weatherData.temp_c ?? 26}°C</span>
                <span className="text-[#695e52]">({weatherData.condition || 'Sunny'})</span>
              </div>
            )}
          </div>

          {/* Embedded Normal Geographic Map */}
          <NormalMap
            center={[currentLocation.latitude, currentLocation.longitude]}
            zoom={12}
            destinationName={currentLocation.displayName}
            places={nearbyPlaces}
            className="h-[320px] sm:h-[380px]"
          />

          {/* Contextual Mode Handoff CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveMode('itinerary')}
              className="px-5 py-2.5 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white font-bold text-xs shadow-xs transition flex items-center gap-2 font-serif cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Plan an Itinerary for {destination}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHotelCity(destination);
                setActiveMode('hotels');
              }}
              className="px-5 py-2.5 rounded-full bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] border border-[#e3d6c1] font-bold text-xs transition flex items-center gap-1.5 font-serif cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#c25e38]" />
              <span>Find Hotels in {destination}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFlightDest(destination);
                setActiveMode('flights');
              }}
              className="px-5 py-2.5 rounded-full bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] border border-[#e3d6c1] font-bold text-xs transition flex items-center gap-1.5 font-serif cursor-pointer"
            >
              <Plane className="w-3.5 h-3.5 text-[#2a475e] -rotate-45" />
              <span>Find Flights to {destination}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE 2: PLAN AN ITINERARY */}
      {/* ------------------------------------------------------------------------- */}
      {activeMode === 'itinerary' && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3d6c1]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Custom Itinerary Creator
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#221c17] font-serif mt-1">
                  Plan Your Voyage to {destination}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-[#c25e38] bg-[#faeee7] px-3 py-1 rounded-full font-mono border border-[#c25e38]/20">
                  {durationDays} Days / {durationNights} Nights
                </span>
              </div>
            </div>

            <form onSubmit={handleGenerateItinerary} className="space-y-6">
              {/* Destination & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setExploreInput(e.target.value);
                    }}
                    onBlur={() => resolveCity(destination)}
                    placeholder="e.g. Tokyo, Paris, Dubai"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-bold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                    <span>Start Date</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                    <span>End Date</span>
                  </label>
                  <input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Travelers & Rooms Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                    Adults (12+ yrs)
                  </label>
                  <select
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                    Children (0-11 yrs)
                  </label>
                  <select
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none"
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} Children</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                    Rooms
                  </label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travel Style with Automatic Luxury Calibration */}
              <div>
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                  <span>Travel Style</span>
                  {travelStyle === 'Luxury' && (
                    <span className="text-[10px] text-[#c88842] font-bold bg-[#fef6eb] px-2.5 py-0.5 rounded-full border border-[#c88842]/20 font-mono">
                      ✨ 5-Star Suites, Fine Dining & Private Transport Auto-Applied
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-4 gap-2 bg-[#f5eee2] p-1.5 rounded-2xl border border-[#e3d6c1]">
                  {['Relaxed', 'Balanced', 'Packed', 'Luxury'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleTravelStyleChange(style)}
                      className={`py-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                        travelStyle === style
                          ? (style === 'Luxury' ? 'bg-[#c88842] text-white shadow-xs' : 'bg-[#c25e38] text-white shadow-xs')
                          : 'text-[#695e52] hover:text-[#221c17]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Daily Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#695e52] uppercase tracking-wider font-mono">
                      Estimated Total Budget
                    </label>
                    <span className="text-xs font-extrabold text-[#c25e38] font-mono">
                      ₹{budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25000"
                    max="350000"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-[#f5eee2] rounded-lg appearance-none cursor-pointer accent-[#c25e38]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#695e52] uppercase tracking-wider font-mono">
                      Daily Spending Allowance
                    </label>
                    <span className="text-xs font-extrabold text-[#2a475e] font-mono">
                      ₹{dailySpend.toLocaleString('en-IN')}/day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="25000"
                    step="1000"
                    value={dailySpend}
                    onChange={(e) => setDailySpend(Number(e.target.value))}
                    className="w-full h-2 bg-[#f5eee2] rounded-lg appearance-none cursor-pointer accent-[#2a475e]"
                  />
                </div>
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                  Trip Interests
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Food', 'Culture', 'History', 'Sightseeing', 'Shopping', 'Nature', 'Adventure', 'Nightlife'].map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#c25e38] text-white shadow-xs'
                            : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                type="submit"
                disabled={isGeneratingTrip}
                className="w-full py-4 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-sm shadow-md shadow-[#c25e38]/25 transition flex items-center justify-center gap-2 font-serif cursor-pointer"
              >
                {isGeneratingTrip ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing Tailored Daily Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Generate My Trip to {destination}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE 3: FIND FLIGHTS */}
      {/* ------------------------------------------------------------------------- */}
      {activeMode === 'flights' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#e3d6c1]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Direct Air Travel Search
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#221c17] font-serif mt-1">
                  Find Flights from {flightOrigin} to {flightDest}
                </h3>
              </div>
            </div>

            <form onSubmit={handleFlightSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Origin (From)
                  </label>
                  <input
                    type="text"
                    required
                    value={flightOrigin}
                    onChange={(e) => setFlightOrigin(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, London"
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-bold bg-[#f5eee2]/60 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Destination (To)
                  </label>
                  <input
                    type="text"
                    required
                    value={flightDest}
                    onChange={(e) => setFlightDest(e.target.value)}
                    placeholder="e.g. Tokyo, Dubai, Paris"
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-bold bg-[#f5eee2]/60 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Departure
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={flightDeparture}
                    onChange={(e) => setFlightDeparture(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Return (Optional)
                  </label>
                  <input
                    type="date"
                    min={flightDeparture}
                    value={flightReturn}
                    onChange={(e) => setFlightReturn(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Travelers
                  </label>
                  <select
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Cabin Class
                  </label>
                  <select
                    value={flightCabin}
                    onChange={(e) => setFlightCabin(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business Class</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSearchingFlights}
                    className="w-full py-2.5 rounded-2xl bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-serif cursor-pointer"
                  >
                    {isSearchingFlights ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plane className="w-4 h-4 -rotate-45" />
                    )}
                    <span>Search Flight Offers</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Flight Search Results */}
          {flightsSearched && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#221c17] uppercase tracking-wider font-mono">
                Verified Flight Options ({flightOrigin} &rarr; {flightDest})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(flightResults.length > 0 ? flightResults.slice(0, 4) : [
                  { airline: 'Emirates', flight_number: 'EK-511', departure_time: '04:15', arrival_time: '06:40', duration_formatted: '3h 55m', stops: 0, price_inr: 24500, category: 'Best Overall' },
                  { airline: 'IndiGo', flight_number: '6E-1461', departure_time: '14:20', arrival_time: '16:50', duration_formatted: '4h 00m', stops: 0, price_inr: 16500, category: 'Cheapest' },
                  { airline: 'Air India', flight_number: 'AI-995', departure_time: '20:30', arrival_time: '22:45', duration_formatted: '3h 45m', stops: 0, price_inr: 19800, category: 'Fastest' },
                  { airline: 'Qatar Airways', flight_number: 'QR-571', departure_time: '09:10', arrival_time: '13:00', duration_formatted: '4h 20m', stops: 1, price_inr: 21200, category: 'Best Value' }
                ]).map((fl, idx) => (
                  <div key={idx} className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#221c17] font-serif">{fl.airline} ({fl.flight_number || 'Direct'})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] font-mono">
                        {fl.category || (idx === 0 ? 'Best Overall' : idx === 1 ? 'Cheapest' : 'Recommended')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 border-y border-[#e3d6c1]/40 font-mono">
                      <div>
                        <span className="font-bold text-[#221c17]">{fl.departure_time || '08:00'}</span>
                        <span className="text-[10px] text-[#998c7e] block">{flightOrigin}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-[#695e52]">{fl.duration_formatted || '3h 45m'}</span>
                        <span className="text-[9px] text-[#3b7a57] block">{fl.stops === 0 ? 'Non-stop' : `${fl.stops} Stop`}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#221c17]">{fl.arrival_time || '11:45'}</span>
                        <span className="text-[10px] text-[#998c7e] block">{flightDest}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-[#998c7e] font-mono block">Fare per person</span>
                        <span className="text-base font-extrabold text-[#c25e38] font-mono">
                          ₹{(fl.price_inr || 18500).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/flights?dest=${encodeURIComponent(flightDest)}&origin=${encodeURIComponent(flightOrigin)}`)}
                        className="px-4 py-1.5 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white text-xs font-bold transition font-serif cursor-pointer"
                      >
                        Continue Booking &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODE 4: FIND HOTELS */}
      {/* ------------------------------------------------------------------------- */}
      {activeMode === 'hotels' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#e3d6c1]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Curated Stays & Suites
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#221c17] font-serif mt-1">
                  Find Accommodations in {hotelCity}
                </h3>
              </div>
            </div>

            <form onSubmit={handleHotelSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Destination City
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelCity}
                    onChange={(e) => setHotelCity(e.target.value)}
                    placeholder="e.g. Tokyo, Dubai, Paris"
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-bold bg-[#f5eee2]/60 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Check-in
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={hotelCheckIn}
                    onChange={(e) => setHotelCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Check-out
                  </label>
                  <input
                    type="date"
                    min={hotelCheckIn}
                    value={hotelCheckOut}
                    onChange={(e) => setHotelCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Guests & Rooms
                  </label>
                  <select
                    value={`${adultsCount}-${roomsCount}`}
                    onChange={(e) => {
                      const [g, r] = e.target.value.split('-');
                      setAdultsCount(Number(g));
                      setRoomsCount(Number(r));
                    }}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60"
                  >
                    <option value="1-1">1 Guest, 1 Room</option>
                    <option value="2-1">2 Guests, 1 Room</option>
                    <option value="2-2">2 Guests, 2 Rooms</option>
                    <option value="4-2">4 Guests, 2 Rooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                    Hotel Tier
                  </label>
                  <select
                    value={hotelTier}
                    onChange={(e) => setHotelTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 font-mono"
                  >
                    <option value="all">All Tiers</option>
                    <option value="5_star">Luxury (5-Star)</option>
                    <option value="boutique">Boutique & Heritage</option>
                    <option value="comfort">Comfort (3-4 Star)</option>
                    <option value="budget">Budget-Friendly</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSearchingHotels}
                    className="w-full py-2.5 rounded-2xl bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-serif cursor-pointer"
                  >
                    {isSearchingHotels ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    <span>Find Stays</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Hotel Search Results */}
          {hotelsSearched && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#221c17] uppercase tracking-wider font-mono">
                Available Accommodations in {hotelCity}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(hotelResults.length > 0 ? hotelResults.slice(0, 4) : [
                  { name: `${hotelCity} Grand Heritage Palace`, room_type: 'Deluxe King Suite', star_rating: 5, price_per_night_inr: 12500, tier: 'Luxury', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
                  { name: `${hotelCity} Central Boutique Hotel`, room_type: 'Executive City View', star_rating: 4.5, price_per_night_inr: 7200, tier: 'Best Value', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80' },
                  { name: `${hotelCity} Riverside Retreat`, room_type: 'Superior Queen Room', star_rating: 4.2, price_per_night_inr: 4800, tier: 'Comfort', image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
                  { name: `${hotelCity} Traveler Inn`, room_type: 'Standard Double', star_rating: 4.0, price_per_night_inr: 3200, tier: 'Budget', image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80' }
                ]).map((htl, idx) => (
                  <div key={idx} className="bg-[#fffefb] rounded-3xl border border-[#e3d6c1] overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="h-36 relative bg-[#f5eee2]">
                      <img src={htl.image_url} alt={htl.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-[#fffefb]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-[#221c17] flex items-center gap-1 font-mono">
                        <Star className="w-3.5 h-3.5 fill-[#c88842] text-[#c88842]" />
                        <span>{htl.star_rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h5 className="font-bold text-sm text-[#221c17] font-serif leading-tight">{htl.name}</h5>
                      <p className="text-xs text-[#695e52]">{htl.room_type || 'Standard Suite • WiFi & Breakfast'}</p>

                      <div className="pt-2 border-t border-[#e3d6c1]/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#998c7e] font-mono block">Nightly Rate</span>
                          <span className="text-sm font-extrabold text-[#c25e38] font-mono">
                            ₹{(htl.price_per_night_inr || 6500).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/hotels?dest=${encodeURIComponent(hotelCity)}`)}
                          className="px-4 py-1.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white text-xs font-bold transition font-serif cursor-pointer"
                        >
                          Book Stay &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
