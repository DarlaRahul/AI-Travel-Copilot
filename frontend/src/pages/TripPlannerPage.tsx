import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Compass, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  BrainCircuit,
  Navigation,
  CreditCard
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { MapComponent, MapPoint } from '../components/MapComponent';
import { travelApi } from '../services/api';

export const TripPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  const [destination, setDestination] = useState(
    searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || 'Dubai'
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [travelers, setTravelers] = useState('2 Adults');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [budget, setBudget] = useState<number>(50000);
  const [dailySpend, setDailySpend] = useState<number>(4000);
  const [isCustomDaily, setIsCustomDaily] = useState(false);
  const [customDailyInput, setCustomDailyInput] = useState('');
  const [mapData, setMapData] = useState<{ center: [number, number]; zoom: number; markers: MapPoint[] }>({
    center: [25.2048, 55.2708],
    zoom: 11,
    markers: []
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Sightseeing', 'Food', 'Heritage', 'Beaches', 'Adventure'
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const popularIndianPlaces = [
    'Hyderabad', 'Goa', 'Jaipur', 'Munnar', 'Manali', 'Kerala', 'Ladakh', 'Varanasi', 'Ooty', 'Rishikesh'
  ];

  const popularGlobalPlaces = [
    'Dubai', 'Paris', 'Switzerland', 'Tokyo', 'Singapore', 'Bali', 'Maldives', 'London', 'New York'
  ];

  const interestOptions = [
    'Sightseeing', 'Food', 'Heritage', 'Adventure', 'Beaches', 'Nature', 'Nightlife', 'Shopping'
  ];

  const travelStyleOptions = ['Relaxed', 'Balanced', 'Packed', 'Luxury'];

  const aiSteps = [
    "Understanding your travel persona and constraints...",
    "Resolving worldwide destination coordinates via OpenStreetMap...",
    "Retrieving verified POIs & historical landmarks via Overpass API...",
    "Solving Knapsack budget allocation across hotels, flights, and daily spend...",
    "Optimizing daily visiting sequence with TSP routing...",
    "Checking live weather forecasts & disruption risks via Open-Meteo...",
    "Finalizing structured non-repeating itinerary schema..."
  ];

  // Calculate duration in days
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

  // Destination baseline budget calculator
  const getBaselineForDest = (destName: string, style: string) => {
    const d = destName.toLowerCase();
    const isDomestic = ['goa', 'jaipur', 'munnar', 'manali', 'varanasi', 'ooty', 'rishikesh', 'udaipur', 'agra', 'kerala', 'hyderabad', 'delhi', 'mumbai', 'bangalore', 'ladakh'].some(k => d.includes(k));
    const isHighEnd = ['switzerland', 'paris', 'tokyo', 'london', 'new york', 'maldives'].some(k => d.includes(k));

    let base = isDomestic ? 35000 : (isHighEnd ? 120000 : 75000);

    const styleMultipliers: Record<string, { multiplier: number; daily: number }> = {
      Relaxed: { multiplier: 0.85, daily: isDomestic ? 2000 : 4000 },
      Balanced: { multiplier: 1.00, daily: isDomestic ? 3000 : 6000 },
      Packed: { multiplier: 1.15, daily: isDomestic ? 4500 : 8000 },
      Luxury: { multiplier: 1.80, daily: isDomestic ? 10000 : 18000 }
    };

    const conf = styleMultipliers[style] || styleMultipliers.Balanced;
    return {
      budget: Math.round(base * conf.multiplier),
      daily: conf.daily
    };
  };

  // Load destination dynamic preview on mount or param change
  useEffect(() => {
    const dest = searchParams.get('dest');
    if (dest) {
      setDestination(dest);
      updateLocationData(dest, travelStyle);
    } else {
      updateLocationData(destination, travelStyle);
    }
  }, [searchParams]);

  const updateLocationData = async (targetDest: string, currentStyle: string) => {
    const cleanDest = targetDest.split(',')[0].trim();
    if (!cleanDest) return;

    const preset = getBaselineForDest(cleanDest, currentStyle);
    setBudget(preset.budget);
    setDailySpend(preset.daily);

    try {
      const locRes = await travelApi.resolveDestination(cleanDest);
      const loc = locRes.data;
      const placesRes = await travelApi.getPlaces(cleanDest, 0, 15);
      const places = placesRes.data.results || [];

      setMapData({
        center: [loc.latitude, loc.longitude],
        zoom: 11,
        markers: places.map((p: any) => ({
          name: p.name,
          lat: p.lat,
          lon: p.lon,
          category: p.category,
          description: p.description
        }))
      });
    } catch (e) {
      // Graceful fallback
    }
  };

  const handleSelectPopular = (place: string) => {
    setDestination(place);
    updateLocationData(place, travelStyle);
  };

  // Core Requirement: Luxury Button automatically changes budget, hotel tier, daily spend, and recommendations
  const selectTravelStyle = (style: string) => {
    setTravelStyle(style);
    const preset = getBaselineForDest(destination, style);
    setBudget(preset.budget);
    setDailySpend(preset.daily);
    setIsCustomDaily(false);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleCustomDailySubmit = () => {
    const val = parseFloat(customDailyInput);
    if (val > 0) {
      setDailySpend(val);
      setIsCustomDaily(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCurrentStep(0);

    const targetCity = destination.split(',')[0].trim();
    if (!targetCity || endDate <= startDate) {
      setIsGenerating(false);
      return;
    }
    localStorage.setItem('travel_copilot_active_destination', targetCity);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < aiSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    try {
      const travelersCount = parseInt(travelers.split(' ')[0]) || 2;
      const res = await travelApi.planTrip({
        destination: targetCity,
        start_date: startDate,
        end_date: endDate,
        travelers_count: travelersCount,
        travelers_label: travelers,
        budget_inr: budget,
        travel_style: travelStyle,
        interests: selectedInterests,
        daily_spending_inr: dailySpend
      });

      clearInterval(interval);
      const tripId = res.data.id || 1;
      localStorage.setItem('travel_copilot_active_trip_id', String(tripId));
      setTimeout(() => {
        navigate(`/itinerary/${tripId}?dest=${encodeURIComponent(targetCity)}`);
      }, 400);
    } catch (err) {
      console.error("Trip planning error:", err);
      clearInterval(interval);
      setIsGenerating(false);
      navigate(`/itinerary/1?dest=${encodeURIComponent(targetCity)}`);
    }
  };

  const totalDailyAllowance = dailySpend * durationDays;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Plan Your Dream Vacation ✈️" 
          subtitle="Generate tailored AI itineraries with live interactive map routing across India & worldwide" 
        />

        <main className="p-8 max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Card with Synchronized Controls */}
            <div className="lg:col-span-6 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              {/* Destination Search Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onBlur={() => updateLocationData(destination, travelStyle)}
                    placeholder="Where to? (e.g. Hyderabad, Dubai, Paris, Tokyo, Bali, Switzerland)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-900 bg-slate-50/50 outline-none transition"
                  />
                </div>
              </div>

              {/* Popular Destination Quick Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick destination shortcuts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...popularGlobalPlaces.slice(0, 5), ...popularIndianPlaces.slice(0, 4)].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPopular(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        destination.toLowerCase() === p.toLowerCase()
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4 pt-1">
                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Start Date</span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>End Date</span>
                    </label>
                    <input
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Travelers Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Travelers</span>
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                  >
                    <option>1 Solo Traveler</option>
                    <option>2 Adults</option>
                    <option>2 Adults, 1 Child</option>
                    <option>Family (4 People)</option>
                    <option>Group (5+ People)</option>
                  </select>
                </div>

                {/* Travel Style Segmented Pills with Luxury Auto-Sync */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>Travel Style</span>
                    </span>
                    {travelStyle === 'Luxury' && (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        ✨ 5-Star Stays & Premium Allowance Auto-Selected
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    {travelStyleOptions.map((style) => {
                      const isSelected = travelStyle === style;
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => selectTravelStyle(style)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition text-center ${
                            isSelected
                              ? (style === 'Luxury' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs' : 'bg-white text-blue-600 shadow-xs')
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Slider with Right-Aligned Live Value */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Total Estimated Budget</span>
                    </label>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                      ₹ {budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="350000"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                    <span>₹15,000</span>
                    <span>₹1,75,000</span>
                    <span>₹3,50,000</span>
                  </div>
                </div>

                {/* Daily Spending Option */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Daily Spending Allowance</span>
                    </label>
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                      ₹ {dailySpend.toLocaleString('en-IN')}/day (₹ {totalDailyAllowance.toLocaleString('en-IN')} for {durationDays}d)
                    </span>
                  </div>

                  {!isCustomDaily ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      {[2000, 3000, 5000, 10000].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setDailySpend(rate)}
                          className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                            dailySpend === rate
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          ₹{rate.toLocaleString('en-IN')}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setIsCustomDaily(true)}
                        className="py-1.5 rounded-xl text-xs font-semibold border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        Custom
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Enter ₹ amount per day"
                        value={customDailyInput}
                        onChange={(e) => setCustomDailyInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCustomDailySubmit}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Set
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomDaily(false)}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Interest Tags */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Interest Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {interestOptions.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Itinerary</span>
                </button>
              </form>
            </div>

            {/* Right Column: Dynamic Interactive Map & Frosted Vacation Summary Card */}
            <div className="lg:col-span-6 relative flex flex-col space-y-4">
              {/* Map Container with Live Dynamic POIs */}
              <div className="h-[540px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 relative">
                <MapComponent 
                  center={mapData.center} 
                  zoom={mapData.zoom} 
                  markers={mapData.markers}
                  showRoute={true}
                />

                {/* Map Active Header Pill */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md z-20 flex items-center gap-2 pointer-events-none">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">
                    Live Route: {destination.toUpperCase()} ({mapData.markers.length} Sights)
                  </span>
                </div>

                {/* Floating Frosted Glass Vacation Summary Card */}
                <div className="absolute bottom-4 right-4 max-w-[300px] w-full p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/90 z-20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Vacation Summary
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {travelStyle} Tier
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{destination} Vacation</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{durationDays} Days | {Math.max(durationDays - 1, 1)} Nights Planned</p>
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span className="font-medium text-[11px]">Travelers</span>
                      <span className="font-bold text-slate-900">{travelers}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span className="font-medium text-[11px]">Daily Allowance</span>
                      <span className="font-bold text-indigo-600">₹ {totalDailyAllowance.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-slate-100/60">
                      <span className="font-medium text-[11px] text-slate-600">Total Budget</span>
                      <span className="font-black text-sm text-emerald-600">₹ {budget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Animated AI Planning Reasoning Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <BrainCircuit className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">AI Copilot is Planning</h3>
              <p className="text-xs text-slate-500 mt-1">Generating unique attractions and optimizing budget for {destination}</p>
            </div>

            <div className="space-y-3 text-left">
              {aiSteps.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                      isPassed ? 'text-emerald-600 font-medium' : isCurrent ? 'text-blue-600 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
