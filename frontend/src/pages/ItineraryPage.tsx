import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Calendar, 
  Users, 
  Plane, 
  Building2, 
  Clock, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Star,
  AlertTriangle,
  CloudSun,
  Check,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  CreditCard,
  Compass,
  ArrowRight,
  Loader2,
  DollarSign
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { NormalMap, MapPlace } from '../components/ui/normal-map';
import { travelApi } from '../services/api';
import { Trip, Activity, ItineraryDay } from '../types';
import { VintagePaper, VintageJournalHeading } from '../components/ui/vintage-paper';
import { ProgressBar } from '../components/ui/progress-bar';
import { FloatingDock } from '../components/ui/floating-dock';
import { normalizeTravelLocation } from '../utils/location';

export const ItineraryPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const defaultCheckout = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  const [activeTab, setActiveTab] = useState<'day_plan' | 'stay' | 'transport' | 'budget' | 'map'>('day_plan');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Recommendations State
  const [flightOrigin, setFlightOrigin] = useState<string>('Delhi');
  const [recommendedFlights, setRecommendedFlights] = useState<any[]>([]);
  const [recommendedHotels, setRecommendedHotels] = useState<any[]>([]);
  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);
  const [isSearchingHotels, setIsSearchingHotels] = useState<boolean>(false);

  // Add Place Modal / Search State
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState<boolean>(false);
  const [targetAddDay, setTargetAddDay] = useState<number>(1);
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string>('');
  const [candidatePlaces, setCandidatePlaces] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);

  // Load or construct Trip
  useEffect(() => {
    travelApi.getTripById(id || 1)
      .then(res => {
        const loadedTrip: Trip = res.data;
        setTrip(loadedTrip);
        const dest = loadedTrip.destination || 'Tokyo';
        localStorage.setItem('travel_copilot_active_destination', dest);
        fetchFlightRecommendations(dest, flightOrigin, loadedTrip.start_date, loadedTrip.end_date, loadedTrip.travelers_count);
        fetchHotelRecommendations(dest, loadedTrip.start_date, loadedTrip.end_date, loadedTrip.travel_style);
      })
      .catch(() => {
        const dest = searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || "Tokyo";
        const fallbackDays: ItineraryDay[] = [
          {
            id: 101,
            day_number: 1,
            title: `${dest} Iconic Landmarks & Historic Center`,
            theme: "Heritage & Culture",
            description: `Arrive in ${dest}, settle into accommodations, and explore historical squares and panoramic viewpoints.`,
            date_str: "Day 1",
            activities: [
              {
                id: 1,
                day_id: 101,
                order_index: 0,
                time_slot: "09:30 AM – 11:30 AM",
                name: `${dest} Central Landmark & Historic Walk`,
                description: `Explore iconic monuments, heritage districts, and authentic cultural quarters of ${dest}.`,
                category: "Heritage",
                cost_inr: 0,
                duration_hrs: 2.0,
                rating: 4.8,
                lat: 35.6762,
                lon: 139.6503,
                image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80",
                location_name: dest
              },
              {
                id: 2,
                day_id: 101,
                order_index: 1,
                time_slot: "01:00 PM – 03:30 PM",
                name: `${dest} National Cultural Museum & Gardens`,
                description: `Immerse in curated historic collections, serene courtyard gardens, and artisanal craft exhibits.`,
                category: "Culture",
                cost_inr: 1200,
                duration_hrs: 2.5,
                rating: 4.9,
                lat: 35.6800,
                lon: 139.6600,
                image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
                location_name: dest
              },
              {
                id: 3,
                day_id: 101,
                order_index: 2,
                time_slot: "06:00 PM – 08:30 PM",
                name: `${dest} Sunset Observation Deck & Dinner Walk`,
                description: `Experience breathtaking 360° skyline vistas at dusk followed by dinner at a traditional local dining street.`,
                category: "Sightseeing",
                cost_inr: 2500,
                duration_hrs: 2.5,
                rating: 4.9,
                lat: 35.6700,
                lon: 139.6400,
                image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
                location_name: dest
              }
            ]
          },
          {
            id: 102,
            day_number: 2,
            title: `${dest} Scenic Districts, Arts & Gourmet Tour`,
            theme: "Arts & Gastronomy",
            description: `A full day of immersive neighborhoods, local artisan markets, and regional gastronomic specialties.`,
            date_str: "Day 2",
            activities: [
              {
                id: 4,
                day_id: 102,
                order_index: 0,
                time_slot: "10:00 AM – 12:30 PM",
                name: `${dest} Traditional Market & Food Tasting`,
                description: `Sample authentic local delicacies, fresh seasonal produce, and street culinary specialties with local chefs.`,
                category: "Food",
                cost_inr: 1800,
                duration_hrs: 2.5,
                rating: 4.8,
                lat: 35.6720,
                lon: 139.6550,
                image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
                location_name: dest
              },
              {
                id: 5,
                day_id: 102,
                order_index: 1,
                time_slot: "02:30 PM – 05:00 PM",
                name: `${dest} Modern Art & Contemporary Gallery`,
                description: `Explore world-class interactive exhibits, architecture pavilions, and cutting-edge visual art installations.`,
                category: "Art",
                cost_inr: 1500,
                duration_hrs: 2.5,
                rating: 4.7,
                lat: 35.6650,
                lon: 139.6580,
                image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
                location_name: dest
              }
            ]
          },
          {
            id: 103,
            day_number: 3,
            title: `${dest} Waterfront Promenade & Leisure Day`,
            theme: "Scenic & Relaxation",
            description: `Scenic coastal / riverside excursions, leisurely park strolls, and refined evening dining.`,
            date_str: "Day 3",
            activities: [
              {
                id: 6,
                day_id: 103,
                order_index: 0,
                time_slot: "10:30 AM – 01:30 PM",
                name: `${dest} Waterfront Marina & Harbor Cruise`,
                description: `Enjoy a private boat excursion along the bay with panoramic coastal skyline views.`,
                category: "Adventure",
                cost_inr: 3200,
                duration_hrs: 3.0,
                rating: 4.9,
                lat: 35.6600,
                lon: 139.6700,
                image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
                location_name: dest
              },
              {
                id: 7,
                day_id: 103,
                order_index: 1,
                time_slot: "05:00 PM – 08:00 PM",
                name: `${dest} Boutique Promenade & Evening Dining`,
                description: `Stroll through elegant shopping avenues, tea lounges, and world-class Michelin-starred dining.`,
                category: "Sightseeing",
                cost_inr: 2800,
                duration_hrs: 3.0,
                rating: 4.8,
                lat: 35.6750,
                lon: 139.6450,
                image_url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
                location_name: dest
              }
            ]
          }
        ];

        const fallbackTrip: Trip = {
          id: 1,
          title: `${dest} Custom Itinerary`,
          destination: dest,
          country: "Global",
          start_date: today,
          end_date: defaultCheckout,
          duration_days: 3,
          travelers_count: 2,
          travelers_label: "2 Adults",
          total_budget_inr: 80000,
          estimated_cost_inr: 74500,
          travel_style: "Luxury",
          interests: ["Food", "Culture", "History", "Sightseeing"],
          image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&q=85",
          status: "upcoming",
          itinerary_days: fallbackDays
        };

        setTrip(fallbackTrip);
        localStorage.setItem('travel_copilot_active_destination', dest);
        fetchFlightRecommendations(dest, flightOrigin, today, defaultCheckout, 2);
        fetchHotelRecommendations(dest, today, defaultCheckout, "Luxury");
      })
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  // Fetch Recommended Flights
  const fetchFlightRecommendations = async (dest: string, origin: string, dep: string, ret: string, count = 2) => {
    setIsSearchingFlights(true);
    try {
      const res = await travelApi.searchFlights({
        source: origin,
        destination: dest,
        departureDate: dep,
        returnDate: ret,
        adults: count,
        cabin: 'ECONOMY'
      });
      const flights = res.data.flights || [];
      if (flights.length > 0) {
        setRecommendedFlights(flights.slice(0, 4));
      } else {
        setRecommendedFlights(getDefaultFlights(origin, dest));
      }
    } catch {
      setRecommendedFlights(getDefaultFlights(origin, dest));
    } finally {
      setIsSearchingFlights(false);
    }
  };

  // Fetch Recommended Hotels
  const fetchHotelRecommendations = async (dest: string, checkIn: string, checkOut: string, style = 'Balanced') => {
    setIsSearchingHotels(true);
    try {
      const res = await travelApi.getHotels({
        city: dest,
        check_in: checkIn,
        check_out: checkOut,
        tier: style === 'Luxury' ? '5_star' : undefined
      });
      const list = res.data.results || [];
      if (list.length > 0) {
        setRecommendedHotels(list.slice(0, 4));
      } else {
        setRecommendedHotels(getDefaultHotels(dest, style));
      }
    } catch {
      setRecommendedHotels(getDefaultHotels(dest, style));
    } finally {
      setIsSearchingHotels(false);
    }
  };

  const getDefaultFlights = (origin: string, dest: string) => [
    { airline: 'Emirates', flight_number: 'EK-511', departure_time: '04:15', arrival_time: '06:40', duration_formatted: '3h 55m', stops: 0, price_inr: 24500, category: 'Best Overall' },
    { airline: 'IndiGo', flight_number: '6E-1461', departure_time: '14:20', arrival_time: '16:50', duration_formatted: '4h 00m', stops: 0, price_inr: 16500, category: 'Cheapest' },
    { airline: 'Air India', flight_number: 'AI-995', departure_time: '20:30', arrival_time: '22:45', duration_formatted: '3h 45m', stops: 0, price_inr: 19800, category: 'Fastest' },
    { airline: 'Singapore Airlines', flight_number: 'SQ-403', departure_time: '09:10', arrival_time: '13:00', duration_formatted: '4h 20m', stops: 1, price_inr: 21200, category: 'Best Value' }
  ];

  const getDefaultHotels = (dest: string, style: string) => [
    { name: `${dest} Grand Heritage Palace`, room_type: 'Deluxe King Suite • City View', star_rating: 5, price_per_night_inr: 14500, tier: 'Luxury', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', amenities: 'Infinity Pool • Spa • Breakfast • Lounge', cancellation: 'Free cancellation until 48h before check-in' },
    { name: `${dest} Central Boutique Hotel`, room_type: 'Executive Queen Room', star_rating: 4.6, price_per_night_inr: 8200, tier: 'Best Value', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', amenities: 'Free High-speed WiFi • Rooftop Bistro', cancellation: 'Free cancellation until 24h before check-in' },
    { name: `${dest} Riverside Retreat & Suites`, room_type: 'Superior Panoramic Room', star_rating: 4.4, price_per_night_inr: 5800, tier: 'Comfort', image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', amenities: 'River View • Fitness Center', cancellation: 'Non-refundable discount fare' },
    { name: `${dest} Urban Traveler Inn`, room_type: 'Standard Double Room', star_rating: 4.1, price_per_night_inr: 3400, tier: 'Budget', image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', amenities: 'Metro Proximity • 24h Front Desk', cancellation: 'Free cancellation' }
  ];

  // Dynamic Add Place Search
  const handleSearchPlacesForAdd = async (query: string) => {
    if (!query.trim() || !trip) return;
    setIsSearchingPlaces(true);
    try {
      const res = await travelApi.getPlaces(trip.destination, 0, 10);
      const filtered = (res.data.results || []).filter((p: any) => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      );
      setCandidatePlaces(filtered.length > 0 ? filtered : (res.data.results || []).slice(0, 5));
    } catch {
      setCandidatePlaces([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Insert Place into Day
  const handleInsertPlace = (place: any) => {
    if (!trip) return;
    const newAct: Activity = {
      id: Date.now(),
      day_id: 100 + targetAddDay,
      order_index: 99,
      time_slot: "04:00 PM – 05:30 PM",
      name: place.name,
      description: place.description || `Explore ${place.name} in ${trip.destination}.`,
      category: place.category || "Attraction",
      cost_inr: place.cost_inr || 800,
      duration_hrs: 1.5,
      rating: place.rating || 4.7,
      lat: place.lat || 35.6762,
      lon: place.lon || 139.6503,
      image_url: place.image_url || trip.image_url,
      location_name: trip.destination
    };

    const updatedDays = trip.itinerary_days.map(d => {
      if (d.day_number === targetAddDay) {
        return {
          ...d,
          activities: [...d.activities, newAct]
        };
      }
      return d;
    });

    const newEstimated = (trip.estimated_cost_inr || 70000) + (newAct.cost_inr || 800);
    setTrip({
      ...trip,
      itinerary_days: updatedDays,
      estimated_cost_inr: newEstimated
    });
    setIsAddPlaceOpen(false);
    setPlaceSearchQuery('');
  };

  // Remove Place from Day
  const handleRemovePlace = (dayNumber: number, activityId: number) => {
    if (!trip) return;
    let removedCost = 0;
    const updatedDays = trip.itinerary_days.map(d => {
      if (d.day_number === dayNumber) {
        const found = d.activities.find(a => a.id === activityId);
        if (found) removedCost = found.cost_inr || 0;
        return {
          ...d,
          activities: d.activities.filter(a => a.id !== activityId)
        };
      }
      return d;
    });

    setTrip({
      ...trip,
      itinerary_days: updatedDays,
      estimated_cost_inr: Math.max((trip.estimated_cost_inr || 70000) - removedCost, 0)
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!trip) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(trip, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${trip.title.replace(/\s+/g, '_')}_Itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 text-[#c25e38] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#695e52]">Loading your tailored travel plan...</p>
        </div>
      </div>
    );
  }

  // Active day activities & map places
  const currentDay = trip.itinerary_days.find(d => d.day_number === activeDayNumber) || trip.itinerary_days[0];
  const dayMapPlaces: MapPlace[] = (currentDay?.activities || []).map(a => ({
    name: a.name,
    lat: a.lat || 35.6762,
    lon: a.lon || 139.6503,
    category: a.category,
    description: a.description,
    rating: a.rating,
    image: a.image_url
  }));

  // Budget Breakdown Calculations
  const estFlights = recommendedFlights[0]?.price_inr ? recommendedFlights[0].price_inr * (trip.travelers_count || 2) : 28000;
  const estHotels = recommendedHotels[0]?.price_per_night_inr ? recommendedHotels[0].price_per_night_inr * Math.max(trip.duration_days - 1, 1) : 32000;
  const estDailySpend = 6000 * trip.duration_days;
  const estActivities = (trip.itinerary_days || []).flatMap(d => d.activities).reduce((acc, a) => acc + (a.cost_inr || 0), 0) || 7500;
  const estTransport = 4500;
  const grandTotal = estFlights + estHotels + estDailySpend + estActivities + estTransport;
  const userBudget = trip.total_budget_inr || 80000;
  const remainingBudget = userBudget - grandTotal;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col selection:bg-[#c25e38] selection:text-white">
      <Navbar 
        title={`${trip.destination} Travel Journal`} 
        subtitle="Optimized daily schedule, verified attractions, and complete booking recommendations" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-36">
        {/* Top Navigation & Share Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-[#695e52] hover:text-[#c25e38] transition font-serif cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                copied 
                  ? 'bg-[#eef7f2] border-[#3b7a57]/30 text-[#3b7a57]' 
                  : 'border-[#e3d6c1] bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button 
              onClick={handleDownload}
              className="px-4 py-2 rounded-full border border-[#e3d6c1] bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* 1. ITINERARY SUMMARY HEADER */}
        <section className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e3d6c1]/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] font-bold text-[11px] uppercase tracking-wider font-mono border border-[#c25e38]/20">
                  {trip.destination}
                </span>
                <span className="text-xs text-[#998c7e] font-mono">
                  {trip.duration_days} Days / {Math.max(trip.duration_days - 1, 1)} Nights
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#221c17] font-serif mt-1">
                {trip.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#fef6eb] text-[#c88842] font-bold text-xs font-mono border border-[#c88842]/30">
                ✨ {trip.travel_style || 'Luxury'} Tier
              </span>
              <span className="px-3 py-1 rounded-full bg-[#edf3f7] text-[#2a475e] font-bold text-xs font-mono">
                {trip.travelers_label || '2 Adults'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
              <span className="text-[10px] font-bold text-[#998c7e] uppercase font-mono block">Estimated Budget</span>
              <span className="font-extrabold text-sm text-[#c25e38] font-mono">₹{userBudget.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
              <span className="text-[10px] font-bold text-[#998c7e] uppercase font-mono block">Daily Spending</span>
              <span className="font-extrabold text-sm text-[#2a475e] font-mono">₹{estDailySpend.toLocaleString('en-IN')} total</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
              <span className="text-[10px] font-bold text-[#998c7e] uppercase font-mono block">Trip Dates</span>
              <span className="font-bold text-[#221c17] font-mono">{trip.start_date} &rarr; {trip.end_date}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
              <span className="text-[10px] font-bold text-[#998c7e] uppercase font-mono block">Interests</span>
              <span className="font-bold text-[#221c17] truncate block">{trip.interests?.join(' • ') || 'Sightseeing'}</span>
            </div>
          </div>
        </section>

        {/* 2. DAY-BY-DAY SCHEDULE & INTERACTIVE MAP */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3d6c1]/60 pb-3">
            <div>
              <h2 className="text-2xl font-extrabold text-[#221c17] font-serif">
                Day-by-Day Daily Schedule
              </h2>
              <p className="text-xs sm:text-sm text-[#695e52]">
                Realistic chronologically timed visiting order with travel time consideration and verified attractions.
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {trip.itinerary_days.map((day) => (
                <button
                  key={day.day_number}
                  type="button"
                  onClick={() => setActiveDayNumber(day.day_number)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition font-serif cursor-pointer ${
                    activeDayNumber === day.day_number
                      ? 'bg-[#c25e38] text-white shadow-xs'
                      : 'bg-[#fffefb] border border-[#e3d6c1] text-[#695e52] hover:bg-[#f5eee2]'
                  }`}
                >
                  Day {day.day_number}
                </button>
              ))}
            </div>
          </div>

          {/* Active Day Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Chronological Activities Timeline */}
            <div className="lg:col-span-7 space-y-4">
              <VintagePaper 
                variant="journal"
                stampText={`${trip.destination} • Day ${currentDay.day_number}`}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <VintageJournalHeading
                    title={`Day ${currentDay.day_number}: ${currentDay.title}`}
                    subtitle={currentDay.description}
                    badge={currentDay.theme || "Curated Daily Plan"}
                  />

                  {/* Add Place Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAddDay(currentDay.day_number);
                      setIsAddPlaceOpen(true);
                      handleSearchPlacesForAdd(trip.destination);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white font-bold text-xs transition flex items-center gap-1 shrink-0 font-serif cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Place</span>
                  </button>
                </div>

                {/* Structured Chronological Activities */}
                <div className="space-y-3 pt-2">
                  {currentDay.activities.map((act, idx) => (
                    <div 
                      key={act.id || idx}
                      className="p-4 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-2 hover:shadow-xs transition relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#faeee7] text-[#c25e38] flex items-center justify-center text-xs font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#c25e38] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.time_slot}
                          </span>
                          <span className="text-[10px] bg-[#f5eee2] text-[#695e52] px-2 py-0.5 rounded-md font-mono">
                            {act.category || 'Attraction'}
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => handleRemovePlace(currentDay.day_number, act.id)}
                          aria-label="Remove place"
                          className="text-[#998c7e] hover:text-red-600 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#221c17] font-serif">{act.name}</h4>
                        <p className="text-xs text-[#695e52] mt-0.5 leading-relaxed">{act.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#e3d6c1]/40 font-mono text-[#695e52]">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#c88842] text-[#c88842]" />
                          {act.rating || 4.8} Rating
                        </span>
                        <span className="font-bold text-[#221c17]">
                          {act.cost_inr > 0 ? `₹${act.cost_inr.toLocaleString('en-IN')}` : 'Free Entry'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </VintagePaper>
            </div>

            {/* Right Column: Day Map Visualization */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#695e52] uppercase tracking-wider font-mono">
                  Day {currentDay.day_number} Route Visualization
                </span>
                <span className="text-xs text-[#c25e38] font-mono font-bold">
                  {dayMapPlaces.length} Locations
                </span>
              </div>

              <NormalMap
                center={[
                  dayMapPlaces[0]?.lat || 35.6762,
                  dayMapPlaces[0]?.lon || 139.6503
                ]}
                zoom={12}
                destinationName={`${trip.destination} • Day ${currentDay.day_number}`}
                places={dayMapPlaces}
                className="h-[380px] sm:h-[440px]"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 3. COMPLETE YOUR TRIP — END OF ITINERARY SECTION (MANDATORY FLOW) */}
        {/* ------------------------------------------------------------------------- */}
        <section className="space-y-8 pt-8 border-t-2 border-[#e3d6c1]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-3 py-1 rounded-full font-mono border border-[#c25e38]/20">
              Trip Completion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221c17] font-serif mt-1">
              Complete Your Trip to {trip.destination}
            </h2>
            <p className="text-xs sm:text-sm text-[#695e52]">
              Handpicked flight routes, accommodation options, and consolidated budget reconciliation matching your exact trip parameters.
            </p>
          </div>

          {/* 3A. RECOMMENDED FLIGHTS FOR THIS TRIP */}
          <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3d6c1]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#edf3f7] text-[#2a475e] px-2.5 py-0.5 rounded-full font-mono">
                  Flight Recommendations
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#221c17] font-serif mt-1">
                  Flights from {flightOrigin} &rarr; {trip.destination} ({trip.start_date} – {trip.end_date})
                </h3>
              </div>

              {/* Quick Origin Switcher */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-[#998c7e] mr-1">Flying from:</span>
                {['Delhi', 'Mumbai', 'London', 'New York', 'Hyderabad'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setFlightOrigin(city);
                      fetchFlightRecommendations(trip.destination, city, trip.start_date, trip.end_date, trip.travelers_count);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono transition border cursor-pointer ${
                      flightOrigin === city
                        ? 'bg-[#2a475e] text-white border-[#2a475e]'
                        : 'bg-[#f5eee2]/60 text-[#695e52] border-[#e3d6c1] hover:bg-[#eae0cf]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedFlights.map((fl, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#e3d6c1] space-y-3 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center">
                        <Plane className="w-4 h-4 -rotate-45" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#221c17] font-serif block">{fl.airline} ({fl.flight_number || 'Direct'})</span>
                        <span className="text-[10px] text-[#998c7e] font-mono">{fl.cabin_class || 'Economy'}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] font-mono">
                      {fl.category || (idx === 0 ? 'Best Overall' : idx === 1 ? 'Cheapest' : idx === 2 ? 'Fastest' : 'Best Value')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-y border-[#e3d6c1]/40 font-mono">
                    <div>
                      <span className="font-bold text-[#221c17] text-sm">{fl.departure_time || '08:00'}</span>
                      <span className="text-[10px] text-[#998c7e] block">{flightOrigin}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-[#695e52]">{fl.duration_formatted || '3h 45m'}</span>
                      <span className="text-[9px] text-[#3b7a57] block">{fl.stops === 0 ? 'Non-stop' : `${fl.stops} Stop`}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#221c17] text-sm">{fl.arrival_time || '11:45'}</span>
                      <span className="text-[10px] text-[#998c7e] block">{trip.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-[#998c7e] font-mono block">Estimated Fare</span>
                      <span className="text-base font-extrabold text-[#c25e38] font-mono">
                        ₹{(fl.price_inr || 18500).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/flights?dest=${encodeURIComponent(trip.destination)}&origin=${encodeURIComponent(flightOrigin)}`)}
                      className="px-4 py-1.5 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white text-xs font-bold transition font-serif cursor-pointer flex items-center gap-1"
                    >
                      <span>Continue to Flight Booking</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3B. RECOMMENDED HOTELS FOR THIS TRIP */}
          <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3d6c1]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Where You Stay
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#221c17] font-serif mt-1">
                  Accommodations in {trip.destination} ({Math.max(trip.duration_days - 1, 1)} Nights)
                </h3>
              </div>

              <span className="text-xs font-bold text-[#c88842] bg-[#fef6eb] px-3 py-1 rounded-full border border-[#c88842]/20 font-mono">
                {trip.travel_style === 'Luxury' ? '✨ Prioritizing 5-Star Suites' : `${trip.travel_style} Tier`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedHotels.map((htl, idx) => (
                <div 
                  key={idx} 
                  className="rounded-3xl bg-[#fdfbf7] border border-[#e3d6c1] overflow-hidden flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div className="h-40 relative bg-[#f5eee2]">
                    <img src={htl.image_url} alt={htl.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-[#fffefb]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-bold text-[#221c17] flex items-center gap-1 font-mono">
                      <Star className="w-3.5 h-3.5 fill-[#c88842] text-[#c88842]" />
                      <span>{htl.star_rating || 4.8}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#221c17]/80 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white font-mono uppercase">
                      {htl.tier || (idx === 0 ? 'Best Overall' : idx === 1 ? 'Best Value' : idx === 2 ? 'Luxury' : 'Budget')}
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-[#221c17] font-serif">{htl.name}</h4>
                      <p className="text-xs text-[#695e52] mt-0.5">{htl.room_type || 'Deluxe King Suite'}</p>
                      <p className="text-[11px] text-[#998c7e] mt-1">{htl.amenities || 'WiFi • Pool • Breakfast'}</p>
                    </div>

                    <div className="pt-3 border-t border-[#e3d6c1]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#998c7e] font-mono block">Nightly Rate</span>
                        <span className="text-base font-extrabold text-[#c25e38] font-mono">
                          ₹{(htl.price_per_night_inr || 8500).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                        className="px-4 py-2 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white text-xs font-bold transition font-serif cursor-pointer flex items-center gap-1"
                      >
                        <span>Continue to Hotel Booking</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3C. TRIP COST SUMMARY & BUDGET RECONCILIATION */}
          <div className="bg-gradient-to-br from-[#fffefb] via-[#fdfbf6] to-[#faeee7] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e3d6c1]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Financial Reconciliation
                </span>
                <h3 className="text-xl font-bold text-[#221c17] font-serif mt-1">
                  Trip Cost Estimate & Budget Comparison
                </h3>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1 rounded-full font-mono border ${
                  remainingBudget >= 0 
                    ? 'bg-[#eef7f2] text-[#3b7a57] border-[#3b7a57]/30' 
                    : 'bg-[#faeee7] text-[#c25e38] border-[#c25e38]/30'
                }`}>
                  {remainingBudget >= 0 ? `₹${remainingBudget.toLocaleString('en-IN')} Surplus` : `₹${Math.abs(remainingBudget).toLocaleString('en-IN')} Deficit`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-1">
                <span className="text-[10px] text-[#998c7e] uppercase font-mono block">Flights</span>
                <span className="font-bold text-[#221c17] text-sm font-mono">₹{estFlights.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#998c7e] block">Roundtrip for {trip.travelers_count || 2}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-1">
                <span className="text-[10px] text-[#998c7e] uppercase font-mono block">Hotels</span>
                <span className="font-bold text-[#221c17] text-sm font-mono">₹{estHotels.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#998c7e] block">{Math.max(trip.duration_days - 1, 1)} Nights</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-1">
                <span className="text-[10px] text-[#998c7e] uppercase font-mono block">Daily Spending</span>
                <span className="font-bold text-[#221c17] text-sm font-mono">₹{estDailySpend.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#998c7e] block">₹6,000/day</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-1">
                <span className="text-[10px] text-[#998c7e] uppercase font-mono block">Activities</span>
                <span className="font-bold text-[#221c17] text-sm font-mono">₹{estActivities.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#998c7e] block">Entry tickets</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] space-y-1">
                <span className="text-[10px] text-[#998c7e] uppercase font-mono block">Local Transit</span>
                <span className="font-bold text-[#221c17] text-sm font-mono">₹{estTransport.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#998c7e] block">Metro & Cabs</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fffefb] border border-[#e3d6c1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#695e52] font-medium">
                  Grand Estimated Trip Total: <strong className="text-base text-[#221c17] font-mono font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-xs text-[#998c7e] block">
                  Target User Budget: <strong className="text-[#c25e38] font-mono">₹{userBudget.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/flights?dest=${encodeURIComponent(trip.destination)}`)}
                  className="px-5 py-2.5 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white text-xs font-bold transition font-serif cursor-pointer"
                >
                  Book Flights &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                  className="px-5 py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white text-xs font-bold transition font-serif cursor-pointer shadow-xs"
                >
                  Book Hotels &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------------------- */}
      {/* 4. ADD PLACE MODAL */}
      {/* ------------------------------------------------------------------------- */}
      {isAddPlaceOpen && (
        <div className="fixed inset-0 bg-[#221c17]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fffefb] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#e3d6c1] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#e3d6c1]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono">
                  Custom Activity Insertion
                </span>
                <h3 className="text-lg font-bold text-[#221c17] font-serif mt-1">
                  Add Place to Day {targetAddDay}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlaceOpen(false)}
                className="w-7 h-7 rounded-full bg-[#f5eee2] text-[#695e52] hover:text-[#221c17] flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={placeSearchQuery}
                onChange={(e) => {
                  setPlaceSearchQuery(e.target.value);
                  handleSearchPlacesForAdd(e.target.value);
                }}
                placeholder={`Search sights or landmarks in ${trip.destination}...`}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-medium bg-[#f5eee2]/60 outline-none focus:border-[#c25e38]"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#998c7e]">
                {isSearchingPlaces ? <Loader2 className="w-4 h-4 animate-spin text-[#c25e38]" /> : <Search className="w-4 h-4" />}
              </div>
            </div>

            {/* Candidate Places List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {candidatePlaces.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleInsertPlace(p)}
                  className="p-3 rounded-2xl border border-[#e3d6c1] bg-[#fdfbf7] hover:bg-[#faeee7]/50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-[#221c17] font-serif group-hover:text-[#c25e38] transition">{p.name}</h5>
                    <p className="text-[11px] text-[#695e52] line-clamp-1">{p.description || p.category}</p>
                    <span className="text-[10px] text-[#998c7e] font-mono">★ {p.rating || 4.8} • {p.category || 'Attraction'}</span>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1 rounded-full bg-[#c25e38] text-white text-[11px] font-bold shrink-0 font-serif"
                  >
                    + Insert
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
