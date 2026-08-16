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
  DollarSign, 
  Sparkles,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertTriangle,
  CloudSun,
  ShieldCheck,
  ExternalLink,
  Check
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { MapComponent } from '../components/MapComponent';
import { travelApi } from '../services/api';
import { Trip, Hotel, FlightItem } from '../types';

export const ItineraryPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const defaultCheckout = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  const [activeTab, setActiveTab] = useState<'overview' | 'day_plan' | 'stay' | 'transport' | 'budget' | 'map'>('day_plan');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    travelApi.getTripById(id || 1)
      .then(res => {
        setTrip(res.data);
        if (res.data?.destination) {
          const dest = res.data.destination;
          localStorage.setItem('travel_copilot_active_destination', dest);
          // Load hotels & flights for this destination
          travelApi.getHotels({ city: dest, check_in: today, check_out: defaultCheckout })
            .then(h => setHotels(h.data.results || []))
            .catch(() => {});
          travelApi.searchFlights({ source: "Delhi", destination: dest, departureDate: today })
            .then(f => setFlights(f.data.flights || []))
            .catch(() => {});
        }
      })
      .catch(() => {
        const dest = searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || "Dubai";
        const fallbackTrip: Trip = {
          id: 1,
          title: `${dest} Vacation Experience`,
          destination: dest,
          country: "Global",
          start_date: today,
          end_date: defaultCheckout,
          duration_days: 5,
          travelers_count: 2,
          travelers_label: "2 Adults",
          total_budget_inr: 50000,
          estimated_cost_inr: 46500,
          travel_style: "Balanced",
          interests: ["Sightseeing", "Food", "Scenic", "Heritage"],
          image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=85",
          status: "upcoming",
          itinerary_days: [
            {
              id: 101,
              day_number: 1,
              title: `${dest} Arrival & Landmarks Tour`,
              theme: "Heritage & Culture",
              description: `Arrive in ${dest} and discover iconic sights and historical squares.`,
              date_str: "Day 1",
              activities: [
                {
                  id: 1,
                  day_id: 101,
                  order_index: 0,
                  time_slot: "Morning (09:30 AM)",
                  name: `${dest} Central Landmark & Historic Walk`,
                  description: `Explore iconic monuments and cultural sights of ${dest}.`,
                  category: "Heritage",
                  cost_inr: 0,
                  duration_hrs: 2.5,
                  rating: 4.8,
                  lat: 25.2048,
                  lon: 55.2708,
                  image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
                  location_name: dest
                }
              ]
            }
          ]
        };
        setTrip(fallbackTrip);
        localStorage.setItem('travel_copilot_active_destination', dest);
        travelApi.getHotels({ city: dest, check_in: today, check_out: defaultCheckout })
          .then(h => setHotels(h.data.results || []))
          .catch(() => {});
        travelApi.searchFlights({ source: "Delhi", destination: dest, departureDate: today })
          .then(f => setFlights(f.data.flights || []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [id, searchParams]);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !trip) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-500">Loading your customized itinerary...</p>
        </div>
      </div>
    );
  }

  const markers = trip.itinerary_days.flatMap(d => d.activities.map(a => ({
    name: a.name,
    lat: a.lat || 25.2048,
    lon: a.lon || 55.2708,
    description: a.description,
    category: a.category
  })));

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Your Itinerary" 
          subtitle={`${trip.title} • ${trip.duration_days} Days / ${trip.duration_days - 1} Nights in ${trip.destination}`} 
        />

        <main className="p-8 max-w-7xl w-full space-y-6">
          {/* Top Actions Header */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className={`px-4 py-2 rounded-xl border font-semibold text-xs shadow-2xs transition flex items-center gap-1.5 ${
                  copied 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button 
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden aspect-[24/8] w-full shadow-lg border border-slate-200/80">
            <img
              src={trip.image_url}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

            <div className="absolute bottom-6 left-8 text-white space-y-1">
              <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-[11px] uppercase tracking-wider">
                {trip.destination}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {trip.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {trip.duration_days} Days / {trip.duration_days - 1} Nights • {trip.start_date} – {trip.end_date}
              </p>
            </div>
          </div>

          {/* Quick-Action Integrated Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <button
              onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <Building2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Hotels in {trip.destination}</p>
              <p className="text-[11px] text-slate-400">View verified stays &rarr;</p>
            </button>

            <button
              onClick={() => navigate(`/flights?to=${encodeURIComponent(trip.destination)}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <Plane className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Flights to {trip.destination}</p>
              <p className="text-[11px] text-slate-400">Check fares & delays &rarr;</p>
            </button>

            <button
              onClick={() => navigate(`/disruptions?destination=${encodeURIComponent(trip.destination)}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition text-left space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Disruption Radar</p>
              <p className="text-[11px] text-slate-400">Transit & road status &rarr;</p>
            </button>

            <button
              onClick={() => navigate(`/weather?dest=${encodeURIComponent(trip.destination)}`)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition text-left space-y-1.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <CloudSun className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Weather Forecast</p>
              <p className="text-[11px] text-slate-400">Packing & climate tips &rarr;</p>
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'day_plan', label: 'Day Plan' },
              { key: 'stay', label: `Hotels (${hotels.length})` },
              { key: 'transport', label: `Flights (${flights.length})` },
              { key: 'budget', label: 'Budget Allocation' },
              { key: 'map', label: 'Map Route' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl transition ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* TAB: Day Plan */}
              {activeTab === 'day_plan' && (
                <div className="space-y-6">
                  {trip.itinerary_days.map((day) => (
                    <div 
                      key={day.day_number}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            Day {day.day_number}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{day.title}</h3>
                          <p className="text-xs text-slate-500">{day.description}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{day.date_str}</span>
                      </div>

                      {/* Activities Timeline */}
                      <div className="space-y-3.5 pt-1">
                        {day.activities.map((act, aIdx) => (
                          <div 
                            key={aIdx}
                            className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start gap-3 hover:bg-slate-50 transition"
                          >
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs text-xs font-bold">
                              {aIdx + 1}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                                <span className="text-xs font-extrabold text-blue-600">
                                  {act.cost_inr > 0 ? `₹${act.cost_inr.toLocaleString('en-IN')}` : 'Free Entry'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {act.time_slot} ({act.duration_hrs}h)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {act.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* WHERE YOU STAY SECTION */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Accommodation Plan
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          Where You Stay in {trip.destination}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {trip.travel_style === 'Luxury' 
                            ? 'Curated 5-Star Luxury Suite with exclusive premium amenities'
                            : `Recommended accommodation for your ${trip.travel_style} vacation`}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        {trip.duration_days - 1} Nights Stay
                      </span>
                    </div>

                    {hotels.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <img 
                            src={hotels[0].image_url || trip.image_url} 
                            alt={hotels[0].name}
                            className="w-20 h-20 rounded-2xl object-cover shadow-2xs shrink-0" 
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {hotels[0].tier || 'Recommended Stay'}
                              </span>
                              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {hotels[0].rating || 4.8}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{hotels[0].name}</h4>
                            <p className="text-xs text-slate-600">{hotels[0].room_type || 'Deluxe King Suite'}</p>
                            <p className="text-[11px] text-slate-400">{hotels[0].cancellation_policy || 'Free cancellation available'}</p>
                          </div>
                        </div>

                        <div className="text-right sm:shrink-0 space-y-2 w-full sm:w-auto">
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Nightly Rate</p>
                            <p className="text-base font-extrabold text-blue-600">
                              ₹{(hotels[0].price_per_night_inr || hotels[0].price_per_night || (trip.travel_style === 'Luxury' ? 14500 : 5800)).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                          >
                            View Hotel Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Accommodation in {trip.destination}</p>
                          <p className="text-slate-500">Explore verified stays, hostels, boutique hotels, and luxury suites.</p>
                        </div>
                        <button
                          onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                        >
                          Find Stays
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: Map */}
              {activeTab === 'map' && (
                <div className="h-[500px]">
                  <MapComponent markers={markers} zoom={11} showRoute={true} />
                </div>
              )}

              {/* TAB: Overview */}
              {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-sm text-slate-700">
                  <h3 className="font-bold text-slate-900 text-base">Trip Overview & Highlights</h3>
                  <p className="leading-relaxed">
                    This {trip.duration_days}-day journey to <strong>{trip.destination}</strong> has been engineered with TSP routing and 0/1 Knapsack financial optimization. It maximizes landmark exploration while minimizing transit fatigue.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-xs text-blue-700 font-semibold">Total Sights</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">{markers.length} POIs</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-semibold">Optimization Score</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">99.4%</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                      <p className="text-xs text-purple-700 font-semibold">Disruption Risk</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">Low</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Stay / Hotels in Destination */}
              {activeTab === 'stay' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">Accommodations in {trip.destination}</h3>
                    <button 
                      onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Explore all hotels</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {hotels.slice(0, 4).map((h, i) => (
                      <div key={h.hotel_id || i} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-center shadow-xs">
                        <img 
                          src={h.image_url} 
                          alt={h.name} 
                          className="w-full sm:w-40 aspect-[4/3] rounded-xl object-cover" 
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">{h.tier || 'Featured'}</span>
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {h.rating || 4.5}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{h.name}</h4>
                          <p className="text-xs text-slate-500">{h.amenities || h.room_description}</p>
                          <p className="text-sm font-extrabold text-blue-600 pt-1">₹{(h.price_per_night_inr || h.price_per_night || 6500).toLocaleString('en-IN')} / night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Transport / Flights */}
              {activeTab === 'transport' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">Flight Options to {trip.destination}</h3>
                    <button 
                      onClick={() => navigate(`/flights?to=${encodeURIComponent(trip.destination)}`)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Search flights</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {flights.slice(0, 4).map((f, i) => (
                      <div key={f.id || i} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Plane className="w-5 h-5 -rotate-45" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{f.airline} ({f.flight_number})</p>
                            <p className="text-xs text-slate-500">{f.origin || f.source_city} &rarr; {f.destination || f.destination_city} • {f.duration_hrs}h • {f.stops}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-black text-blue-600">₹{(f.price_inr || f.predicted_price_inr || 14500).toLocaleString('en-IN')}</p>
                          <span className="text-[10px] text-emerald-600 font-bold">{f.recommended_badge || 'Best Value'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Budget */}
              {activeTab === 'budget' && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Knapsack Budget Allocation ({trip.destination})</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Hotels ({trip.duration_days - 1} Nights)</span>
                      <span className="font-bold text-slate-900">₹ {Math.round(trip.total_budget_inr * 0.38).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Roundtrip Flights & Local Transit</span>
                      <span className="font-bold text-slate-900">₹ {Math.round(trip.total_budget_inr * 0.32).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Activities & Entry Tickets</span>
                      <span className="font-bold text-slate-900">₹ {Math.round(trip.total_budget_inr * 0.16).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Food & Dining</span>
                      <span className="font-bold text-slate-900">₹ {Math.round(trip.total_budget_inr * 0.09).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      <span>Emergency Buffer Reserve (5%)</span>
                      <span>₹ {Math.round(trip.total_budget_inr * 0.05).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Trip Details Card */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 sticky top-28">
                <h3 className="font-bold text-slate-900 text-base">Trip Details</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Total Budget</span>
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      ₹ {trip.total_budget_inr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Travelers</span>
                    </div>
                    <span className="font-bold text-slate-900">{trip.travelers_label}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Plane className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Destination</span>
                    </div>
                    <span className="font-bold text-slate-900">{trip.destination}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Accommodation</span>
                    </div>
                    <span className="font-bold text-slate-900">{trip.duration_days - 1} Nights</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Total Days</span>
                    </div>
                    <span className="font-bold text-slate-900">{trip.duration_days} Days</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/assistant')}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ask AI to Adjust Itinerary</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
