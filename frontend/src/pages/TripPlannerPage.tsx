import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Compass, 
  Loader2, 
  CheckCircle2, 
  CreditCard,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { NormalMap, MapPlace } from '../components/ui/normal-map';
import { ProgressBar } from '../components/ui/progress-bar';
import { FloatingDock } from '../components/ui/floating-dock';
import { travelApi } from '../services/api';
import { normalizeTravelLocation } from '../utils/location';

export const TripPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  const initialDestParam = searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || 'Dubai';

  const [destination, setDestination] = useState(initialDestParam);
  const [normalizedCity, setNormalizedCity] = useState(initialDestParam);
  const [coords, setCoords] = useState<[number, number]>([25.2048, 55.2708]);
  const [nearbyPlaces, setNearbyPlaces] = useState<MapPlace[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [travelers, setTravelers] = useState('2 Adults');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [budget, setBudget] = useState<number>(50000);
  const [dailySpend, setDailySpend] = useState<number>(4000);
  const [isCustomDaily, setIsCustomDaily] = useState(false);
  const [customDailyInput, setCustomDailyInput] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Sightseeing', 'Food', 'Heritage', 'Beaches', 'Adventure'
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const popularPlaces = [
    'Tokyo', 'Paris', 'Dubai', 'Hyderabad', 'London', 'Bali', 'Goa', 'New York', 'Rome', 'Jaipur'
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
    "Checking live weather forecasts & disruption risks...",
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

  // Dynamic progress calculation based on filled form fields
  const calculateFormProgress = () => {
    let score = 0;
    if (destination.trim()) score += 20;
    if (startDate && endDate && endDate > startDate) score += 20;
    if (travelers) score += 15;
    if (travelStyle) score += 15;
    if (budget > 0) score += 15;
    if (selectedInterests.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const formProgress = calculateFormProgress();

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

  // Sync destination when searchParams change or on load
  useEffect(() => {
    const dest = searchParams.get('dest') || destination;
    if (dest) {
      resolveAndSetLocation(dest, travelStyle);
    }
  }, [searchParams]);

  const resolveAndSetLocation = async (targetDest: string, currentStyle: string) => {
    const cleanDest = targetDest.split(',')[0].trim();
    if (!cleanDest) return;

    const preset = getBaselineForDest(cleanDest, currentStyle);
    setBudget(preset.budget);
    setDailySpend(preset.daily);

    try {
      const locRes = await travelApi.resolveDestination(cleanDest);
      const normalized = normalizeTravelLocation(locRes.data, cleanDest);
      setDestination(normalized.name);
      setNormalizedCity(normalized.name);
      setCoords([normalized.latitude, normalized.longitude]);

      const placesRes = await travelApi.getPlaces(normalized.name, 0, 8);
      const places = (placesRes.data.results || []).map((p: any) => ({
        name: p.name,
        lat: p.lat || normalized.latitude,
        lon: p.lon || normalized.longitude,
        category: p.category,
        description: p.description,
        rating: p.rating,
        image: p.image_url
      }));
      setNearbyPlaces(places);
    } catch (e) {
      setDestination(cleanDest);
      setNormalizedCity(cleanDest);
    }
  };

  const handleSelectPopular = (place: string) => {
    setDestination(place);
    resolveAndSetLocation(place, travelStyle);
  };

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

    const targetCity = normalizedCity || destination.split(',')[0].trim() || 'Tokyo';
    localStorage.setItem('travel_copilot_active_destination', targetCity);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < aiSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

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
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col selection:bg-[#c25e38] selection:text-white">
      <Navbar 
        title="Trip Planner" 
        subtitle="Plan and personalize your next voyage with algorithmic intelligence" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Simplified Planner Form */}
          <div className="lg:col-span-6 bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            {/* Header & Dynamic Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                    Itinerary Setup
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#221c17] font-serif mt-1">
                    Plan Your Journey
                  </h2>
                </div>

                <span className="text-xs font-bold text-[#c25e38] font-mono">
                  {formProgress}% Ready
                </span>
              </div>

              <ProgressBar
                value={formProgress}
                max={100}
                color="terracotta"
              />
            </div>

            {/* Destination Search Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#695e52] uppercase tracking-wider font-mono">
                Destination
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                  <MapPin className="w-4 h-4 text-[#c25e38]" />
                </div>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onBlur={() => resolveAndSetLocation(destination, travelStyle)}
                  placeholder="Where do you want to go? (e.g. Tokyo, Paris, Dubai, Hyderabad...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e3d6c1] focus:border-[#c25e38] text-sm font-bold text-[#221c17] bg-[#f5eee2]/60 outline-none transition font-serif"
                />
              </div>

              {/* Quick Destination Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {popularPlaces.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPopular(p)}
                    className={`px-3 py-1 rounded-full text-xs font-serif transition border cursor-pointer ${
                      destination.toLowerCase() === p.toLowerCase()
                        ? 'bg-[#faeee7] border-[#c25e38] text-[#c25e38] font-bold'
                        : 'bg-[#f5eee2]/60 border-[#e3d6c1] text-[#695e52] hover:bg-[#eae0cf]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5 pt-1">
              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] font-mono"
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
                    className="w-full px-3 py-2 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] font-mono"
                  />
                </div>
              </div>

              {/* Travelers Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#2a475e]" />
                  <span>Travelers</span>
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38]"
                >
                  <option>1 Solo Traveler</option>
                  <option>2 Adults</option>
                  <option>2 Adults, 1 Child</option>
                  <option>Family (4 People)</option>
                  <option>Group (5+ People)</option>
                </select>
              </div>

              {/* Travel Style Segmented Pills */}
              <div>
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-[#c25e38]" />
                    <span>Travel Style</span>
                  </span>
                  {travelStyle === 'Luxury' && (
                    <span className="text-[10px] text-[#c88842] font-bold bg-[#fef6eb] px-2.5 py-0.5 rounded-full border border-[#c88842]/20">
                      ✨ 5-Star Suites & Curated Stays
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-[#f5eee2] p-1.5 rounded-2xl border border-[#e3d6c1]">
                  {travelStyleOptions.map((style) => {
                    const isSelected = travelStyle === style;
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => selectTravelStyle(style)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                          isSelected
                            ? (style === 'Luxury' ? 'bg-[#c88842] text-white shadow-xs' : 'bg-[#c25e38] text-white shadow-xs')
                            : 'text-[#695e52] hover:text-[#221c17]'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#695e52] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <span>Total Estimated Budget</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#c25e38] bg-[#faeee7] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
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
                  className="w-full h-2 bg-[#f5eee2] rounded-lg appearance-none cursor-pointer accent-[#c25e38]"
                />
                <div className="flex justify-between text-[10px] font-semibold text-[#998c7e] mt-1 font-mono">
                  <span>₹15,000</span>
                  <span>₹1,75,000</span>
                  <span>₹3,50,000</span>
                </div>
              </div>

              {/* Daily Spending Allowance */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#695e52] uppercase tracking-wider flex items-center gap-1 font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-[#2a475e]" />
                    <span>Daily Spending</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#2a475e] bg-[#edf3f7] px-2.5 py-0.5 rounded-full font-mono">
                    ₹ {dailySpend.toLocaleString('en-IN')}/day (₹ {totalDailyAllowance.toLocaleString('en-IN')} total)
                  </span>
                </div>

                {!isCustomDaily ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2000, 3000, 5000, 10000].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setDailySpend(rate)}
                        className={`py-1.5 rounded-xl text-xs font-semibold border transition font-mono cursor-pointer ${
                          dailySpend === rate
                            ? 'bg-[#2a475e] text-white border-[#2a475e] shadow-2xs'
                            : 'bg-[#f5eee2]/60 border-[#e3d6c1] text-[#695e52] hover:bg-[#eae0cf]'
                        }`}
                      >
                        ₹{rate.toLocaleString('en-IN')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomDaily(true)}
                      className="py-1.5 rounded-xl text-xs font-semibold border bg-[#f5eee2]/60 border-[#e3d6c1] text-[#695e52] hover:bg-[#eae0cf] cursor-pointer"
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
                      className="flex-1 px-3 py-1.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold bg-[#f5eee2]/60 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCustomDailySubmit}
                      className="px-4 py-1.5 bg-[#2a475e] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomDaily(false)}
                      className="px-3 py-1.5 bg-[#f5eee2] text-[#695e52] rounded-xl text-xs font-semibold border border-[#e3d6c1] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                  Interests
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {interestOptions.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
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

              {/* Primary Generation Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-sm shadow-md shadow-[#c25e38]/25 transition flex items-center justify-center gap-2 mt-3 font-serif cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Generate Autonomous Itinerary</span>
              </button>
            </form>
          </div>

          {/* Right Column: Normal Geographic Map & Summary */}
          <div className="lg:col-span-6 space-y-4">
            <NormalMap
              center={coords}
              zoom={11}
              destinationName={normalizedCity}
              places={nearbyPlaces}
              className="h-[400px] sm:h-[460px]"
            />

            {/* Trip Overview Card */}
            <div className="p-6 rounded-3xl bg-[#fffefb] border border-[#e3d6c1] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#998c7e] uppercase tracking-wider block font-mono">
                  Trip Overview
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] border border-[#c25e38]/20 font-mono">
                  {travelStyle} Tier
                </span>
              </div>

              <div>
                <h4 className="font-bold text-[#221c17] text-lg font-serif">{normalizedCity} Journey</h4>
                <p className="text-xs text-[#695e52] mt-0.5">{durationDays} Days • {travelers}</p>
              </div>

              <div className="border-t border-[#e3d6c1]/60 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#998c7e] block font-mono">Daily Allowance</span>
                  <span className="font-bold text-[#2a475e] font-mono">₹ {totalDailyAllowance.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#998c7e] block font-mono">Estimated Total</span>
                  <span className="font-extrabold text-base text-[#c25e38] font-mono">₹ {budget.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reasoning Loading Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-[#221c17]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffefb] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#e3d6c1] text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <BrainCircuit className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#221c17] font-serif">Synthesizing Your Itinerary</h3>
              <p className="text-xs text-[#695e52] mt-1">Generating verified attractions and optimizing routes for {normalizedCity}</p>
            </div>

            <div className="space-y-3 text-left">
              {aiSteps.map((step, idx) => {
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                      isPassed ? 'text-[#3b7a57] font-medium' : isCurrent ? 'text-[#c25e38] font-bold' : 'text-[#998c7e]'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#3b7a57] shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#c25e38] animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#e3d6c1] shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
