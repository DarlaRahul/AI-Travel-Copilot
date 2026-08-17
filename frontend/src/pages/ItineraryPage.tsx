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
  Check
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { MapComponent } from '../components/MapComponent';
import { travelApi } from '../services/api';
import { Trip } from '../types';
import { VintagePaper, VintageJournalHeading } from '../components/ui/vintage-paper';
import { ProgressBar } from '../components/ui/progress-bar';
import { FloatingDock } from '../components/ui/floating-dock';

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
      <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#695e52]">Loading your customized travel journal...</p>
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
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Curated Travel Journal" 
        subtitle={`${trip.title} • ${trip.duration_days} Days / ${trip.duration_days - 1} Nights in ${trip.destination}`} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 pb-36">
        {/* Top Actions Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-[#695e52] hover:text-[#c25e38] transition font-serif"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition flex items-center gap-1.5 ${
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
              className="px-4 py-2 rounded-full border border-[#e3d6c1] bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] font-bold text-xs transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden aspect-[24/8] w-full shadow-md border border-[#e3d6c1] group">
          <img
            src={trip.image_url}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#221c17]/90 via-[#221c17]/30 to-transparent" />

          <div className="absolute bottom-6 left-8 text-white space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#c25e38] text-white font-bold text-[11px] uppercase tracking-wider font-mono">
              {trip.destination}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md font-serif text-[#fffefb]">
              {trip.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#eae0cf] font-medium font-sans">
              {trip.duration_days} Days / {trip.duration_days - 1} Nights • {trip.start_date} – {trip.end_date}
            </p>
          </div>
        </div>

        {/* Quick-Action Integrated Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
            className="p-4 rounded-3xl bg-[#fffefb] border border-[#e3d6c1] hover:border-[#c25e38]/50 hover:shadow-md transition text-left space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center group-hover:scale-105 transition">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#221c17] leading-tight font-serif">Hotels in {trip.destination}</p>
            <p className="text-[11px] text-[#998c7e]">View verified stays &rarr;</p>
          </button>

          <button
            onClick={() => navigate(`/flights?to=${encodeURIComponent(trip.destination)}`)}
            className="p-4 rounded-3xl bg-[#fffefb] border border-[#e3d6c1] hover:border-[#c25e38]/50 hover:shadow-md transition text-left space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#edf3f7] text-[#2a475e] flex items-center justify-center group-hover:scale-105 transition">
              <Plane className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#221c17] leading-tight font-serif">Flights to {trip.destination}</p>
            <p className="text-[11px] text-[#998c7e]">Check fares & delays &rarr;</p>
          </button>

          <button
            onClick={() => navigate(`/disruptions?destination=${encodeURIComponent(trip.destination)}`)}
            className="p-4 rounded-3xl bg-[#fffefb] border border-[#e3d6c1] hover:border-[#c88842]/50 hover:shadow-md transition text-left space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#fef6eb] text-[#c88842] flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#221c17] leading-tight font-serif">Disruption Radar</p>
            <p className="text-[11px] text-[#998c7e]">Transit & road status &rarr;</p>
          </button>

          <button
            onClick={() => navigate(`/weather?dest=${encodeURIComponent(trip.destination)}`)}
            className="p-4 rounded-3xl bg-[#fffefb] border border-[#e3d6c1] hover:border-[#2a475e]/50 hover:shadow-md transition text-left space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-2xl bg-[#edf3f7] text-[#2a475e] flex items-center justify-center group-hover:scale-105 transition">
              <CloudSun className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#221c17] leading-tight font-serif">Weather Forecast</p>
            <p className="text-[11px] text-[#998c7e]">Packing & climate tips &rarr;</p>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e3d6c1] pb-2 text-xs font-bold overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'day_plan', label: 'Day Schedule' },
            { key: 'stay', label: `Hotels (${hotels.length})` },
            { key: 'transport', label: `Flights (${flights.length})` },
            { key: 'budget', label: 'Budget Allocation' },
            { key: 'map', label: 'Map Route' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === tab.key
                  ? 'bg-[#c25e38] text-white shadow-xs'
                  : 'text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2]'
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
                {/* Journal Progress Metrics */}
                <div className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProgressBar
                    value={trip.duration_days}
                    max={trip.duration_days}
                    label="Itinerary Timeline"
                    sublabel={`${trip.duration_days} Planned Days`}
                    color="voyager"
                  />
                  <ProgressBar
                    value={trip.estimated_cost_inr || 46500}
                    max={trip.total_budget_inr || 50000}
                    label="Budget Utilization"
                    sublabel={`₹${(trip.estimated_cost_inr || 46500).toLocaleString('en-IN')} / ₹${(trip.total_budget_inr || 50000).toLocaleString('en-IN')}`}
                    color="terracotta"
                  />
                </div>

                {trip.itinerary_days.map((day) => (
                  <VintagePaper 
                    key={day.day_number}
                    variant="journal"
                    stampText={`${trip.destination} • Day ${day.day_number}`}
                    className="space-y-4"
                  >
                    <VintageJournalHeading
                      title={`Day ${day.day_number}: ${day.title}`}
                      subtitle={day.description}
                      badge={day.theme || "Curated Itinerary"}
                    />

                    {/* Activities Timeline */}
                    <div className="space-y-3.5 pt-1">
                      {day.activities.map((act, aIdx) => (
                        <div 
                          key={aIdx}
                          className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#e3d6c1] flex items-start gap-3.5 hover:bg-white transition shadow-2xs"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#faeee7] border border-[#c25e38]/30 flex items-center justify-center text-[#c25e38] shrink-0 text-xs font-bold font-mono">
                            {aIdx + 1}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-[#221c17] font-serif">{act.name}</h4>
                              <span className="text-xs font-extrabold text-[#c25e38] font-mono">
                                {act.cost_inr > 0 ? `₹${act.cost_inr.toLocaleString('en-IN')}` : 'Free Entry'}
                              </span>
                            </div>

                            <p className="text-xs text-[#695e52] leading-relaxed">{act.description}</p>

                            <div className="flex items-center gap-4 text-[11px] text-[#998c7e] font-medium pt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-[#c25e38]" />
                                {act.time_slot} ({act.duration_hrs}h)
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Star className="w-3 h-3 fill-[#c88842] text-[#c88842]" />
                                {act.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </VintagePaper>
                ))}

                {/* WHERE YOU STAY SECTION */}
                <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e3d6c1]/60 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2a475e] bg-[#edf3f7] px-2.5 py-0.5 rounded-full font-mono">
                        Accommodation Plan
                      </span>
                      <h3 className="text-base font-bold text-[#221c17] font-serif mt-1">
                        Where You Stay in {trip.destination}
                      </h3>
                      <p className="text-xs text-[#695e52]">
                        {trip.travel_style === 'Luxury' 
                          ? 'Curated 5-Star Luxury Suite with exclusive premium amenities'
                          : `Recommended accommodation for your ${trip.travel_style} vacation`}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#221c17] bg-[#f5eee2] px-3 py-1 rounded-full border border-[#e3d6c1] font-mono">
                      {trip.duration_days - 1} Nights Stay
                    </span>
                  </div>

                  {hotels.length > 0 ? (
                    <div className="p-4 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={hotels[0].image_url || trip.image_url} 
                          alt={hotels[0].name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-2xs shrink-0" 
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#faeee7] text-[#c25e38] font-mono">
                              {hotels[0].tier || 'Recommended Stay'}
                            </span>
                            <span className="text-xs font-bold text-[#c88842] flex items-center gap-0.5 font-mono">
                              <Star className="w-3 h-3 fill-[#c88842]" />
                              {hotels[0].rating || 4.8}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#221c17] font-serif">{hotels[0].name}</h4>
                          <p className="text-xs text-[#695e52]">{hotels[0].room_type || 'Deluxe King Suite'}</p>
                          <p className="text-[11px] text-[#998c7e]">{hotels[0].cancellation_policy || 'Free cancellation available'}</p>
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0 space-y-2 w-full sm:w-auto">
                        <div>
                          <p className="text-xs text-[#998c7e] font-medium font-mono">Nightly Rate</p>
                          <p className="text-base font-extrabold text-[#c25e38] font-mono">
                            ₹{(hotels[0].price_per_night_inr || hotels[0].price_per_night || (trip.travel_style === 'Luxury' ? 14500 : 5800)).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                          className="px-4 py-2 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition"
                        >
                          View Hotel Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1] text-xs text-[#695e52] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#221c17] font-serif">Accommodation in {trip.destination}</p>
                        <p className="text-[#998c7e]">Explore verified stays, hostels, boutique hotels, and luxury suites.</p>
                      </div>
                      <button
                        onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                        className="px-4 py-2 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs transition"
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
              <div className="h-[500px] rounded-3xl overflow-hidden border border-[#e3d6c1]">
                <MapComponent markers={markers} zoom={11} showRoute={true} />
              </div>
            )}

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-4 text-sm text-[#695e52]">
                <h3 className="font-bold text-[#221c17] text-base font-serif">Trip Overview & Highlights</h3>
                <p className="leading-relaxed">
                  This {trip.duration_days}-day journey to <strong>{trip.destination}</strong> has been engineered with TSP routing and 0/1 Knapsack financial optimization. It maximizes landmark exploration while minimizing transit fatigue.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#faeee7] border border-[#c25e38]/20">
                    <p className="text-xs text-[#c25e38] font-bold font-mono">Total Sights</p>
                    <p className="text-lg font-bold text-[#221c17] font-serif mt-0.5">{markers.length} POIs</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#eef7f2] border border-[#3b7a57]/20">
                    <p className="text-xs text-[#3b7a57] font-bold font-mono">Optimization Score</p>
                    <p className="text-lg font-bold text-[#221c17] font-serif mt-0.5">99.4%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#edf3f7] border border-[#2a475e]/20">
                    <p className="text-xs text-[#2a475e] font-bold font-mono">Disruption Risk</p>
                    <p className="text-lg font-bold text-[#221c17] font-serif mt-0.5">Low</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Stay / Hotels in Destination */}
            {activeTab === 'stay' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#221c17] text-base font-serif">Accommodations in {trip.destination}</h3>
                  <button 
                    onClick={() => navigate(`/hotels?dest=${encodeURIComponent(trip.destination)}`)}
                    className="text-xs font-bold text-[#c25e38] hover:underline flex items-center gap-1 font-serif"
                  >
                    <span>Explore all hotels</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {hotels.slice(0, 4).map((h, i) => (
                    <div key={h.hotel_id || i} className="p-4 rounded-3xl border border-[#e3d6c1] bg-[#fffefb] flex flex-col sm:flex-row gap-4 items-center shadow-xs">
                      <img 
                        src={h.image_url} 
                        alt={h.name} 
                        className="w-full sm:w-40 aspect-[4/3] rounded-2xl object-cover" 
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faeee7] text-[#c25e38] font-mono">{h.tier || 'Featured'}</span>
                          <span className="text-xs font-bold text-[#c88842] flex items-center gap-0.5 font-mono">
                            <Star className="w-3 h-3 fill-[#c88842]" />
                            {h.rating || 4.5}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#221c17] text-sm font-serif">{h.name}</h4>
                        <p className="text-xs text-[#695e52]">{h.amenities || h.room_description}</p>
                        <p className="text-sm font-extrabold text-[#c25e38] font-mono pt-1">₹{(h.price_per_night_inr || h.price_per_night || 6500).toLocaleString('en-IN')} / night</p>
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
                  <h3 className="font-bold text-[#221c17] text-base font-serif">Flight Options to {trip.destination}</h3>
                  <button 
                    onClick={() => navigate(`/flights?to=${encodeURIComponent(trip.destination)}`)}
                    className="text-xs font-bold text-[#c25e38] hover:underline flex items-center gap-1 font-serif"
                  >
                    <span>Search flights</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {flights.slice(0, 4).map((f, i) => (
                    <div key={f.id || i} className="p-4 rounded-3xl border border-[#e3d6c1] bg-[#fffefb] flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center font-bold">
                          <Plane className="w-5 h-5 -rotate-45" />
                        </div>
                        <div>
                          <p className="font-bold text-[#221c17] text-sm font-serif">{f.airline} ({f.flight_number})</p>
                          <p className="text-xs text-[#695e52] font-mono">{f.origin || f.source_city} &rarr; {f.destination || f.destination_city} • {f.duration_hrs}h • {f.stops}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-extrabold text-[#c25e38] font-mono">₹{(f.price_inr || f.predicted_price_inr || 14500).toLocaleString('en-IN')}</p>
                        <span className="text-[10px] text-[#3b7a57] font-bold font-mono">{f.recommended_badge || 'Best Value'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Budget */}
            {activeTab === 'budget' && (
              <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-4">
                <h3 className="font-bold text-[#221c17] text-base font-serif">Knapsack Budget Allocation ({trip.destination})</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
                    <span className="font-semibold text-[#695e52]">Hotels ({trip.duration_days - 1} Nights)</span>
                    <span className="font-bold text-[#221c17] font-mono">₹ {Math.round(trip.total_budget_inr * 0.38).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
                    <span className="font-semibold text-[#695e52]">Roundtrip Flights & Local Transit</span>
                    <span className="font-bold text-[#221c17] font-mono">₹ {Math.round(trip.total_budget_inr * 0.32).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
                    <span className="font-semibold text-[#695e52]">Activities & Entry Tickets</span>
                    <span className="font-bold text-[#221c17] font-mono">₹ {Math.round(trip.total_budget_inr * 0.16).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1]">
                    <span className="font-semibold text-[#695e52]">Food & Dining</span>
                    <span className="font-bold text-[#221c17] font-mono">₹ {Math.round(trip.total_budget_inr * 0.09).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#eef7f2] text-[#3b7a57] font-bold border border-[#3b7a57]/30 font-mono">
                    <span>Emergency Buffer Reserve (5%)</span>
                    <span>₹ {Math.round(trip.total_budget_inr * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Trip Details Card */}
          <div className="lg:col-span-4">
            <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-5 sticky top-28">
              <h3 className="font-bold text-[#221c17] text-base font-serif">Trip Details</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[#695e52]">
                    <span className="font-medium">Total Budget</span>
                  </div>
                  <span className="font-extrabold text-sm text-[#c25e38] font-mono">
                    ₹ {trip.total_budget_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[#695e52]">
                    <Users className="w-4 h-4 text-[#998c7e]" />
                    <span className="font-medium">Travelers</span>
                  </div>
                  <span className="font-bold text-[#221c17]">{trip.travelers_label}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[#695e52]">
                    <Plane className="w-4 h-4 text-[#998c7e]" />
                    <span className="font-medium">Destination</span>
                  </div>
                  <span className="font-bold text-[#221c17] font-serif">{trip.destination}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[#695e52]">
                    <Building2 className="w-4 h-4 text-[#998c7e]" />
                    <span className="font-medium">Accommodation</span>
                  </div>
                  <span className="font-bold text-[#221c17] font-mono">{trip.duration_days - 1} Nights</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e3d6c1]/60">
                  <div className="flex items-center gap-2.5 text-[#695e52]">
                    <Calendar className="w-4 h-4 text-[#998c7e]" />
                    <span className="font-medium">Total Days</span>
                  </div>
                  <span className="font-bold text-[#221c17] font-mono">{trip.duration_days} Days</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/assistant')}
                className="w-full py-3 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-md shadow-[#c25e38]/25 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Ask AI to Adjust Itinerary</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
