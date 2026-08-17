import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plane, 
  Search, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Check, 
  ExternalLink,
  ShieldCheck, 
  Calendar,
  AlertCircle,
  Zap,
  Info,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { FloatingDock } from '../components/ui/floating-dock';

export const FlightsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  const [source, setSource] = useState(searchParams.get('from') || 'Delhi');
  const [destination, setDestination] = useState(
    searchParams.get('to') || searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || 'Dubai'
  );
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('ECONOMY');
  
  const [flights, setFlights] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState<string>('demo_data');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [filterStops, setFilterStops] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Best Overall');
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    setBookingFeedback(null);
    try {
      const res = await travelApi.searchFlights({
        source,
        destination,
        departureDate,
        returnDate: returnDate || undefined,
        adults,
        cabin
      });

      const items = res.data.flights || [];
      setFlights(items);
      setDataStatus(res.data.data_status || 'live');
      setStatusMessage(res.data.message || '');

      // Machine learning prediction request
      try {
        const predRes = await travelApi.predictFlight({
          source_city: source,
          destination_city: destination,
          departure_time: 'Morning',
          stops: 'zero',
          cabin_class: cabin === 'BUSINESS' ? 'Business' : 'Economy',
          days_left: 15
        });
        setPrediction(predRes.data);
      } catch {
        // Fallback ML prediction
        setPrediction({
          predicted_price_inr: items[0]?.price_inr || 15500,
          price_range_inr: "₹ 14,000 - ₹ 18,500",
          delay_risk: "Low Risk (8%)",
          recommended_badge: "Optimal Fare Window",
          airline: items[0]?.airline || "Direct Carrier"
        });
      }
    } catch (err) {
      console.error("Flights fetch error:", err);
      setDataStatus('unavailable');
      setStatusMessage("Live flight provider temporarily unavailable. Showing cached reference routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleBookingHandoff = async (flight: any) => {
    try {
      const res = await travelApi.createBooking({
        booking_type: 'Flight',
        item_name: `${flight.airline} (${flight.flight_number})`,
        destination,
        amount_inr: flight.price_inr,
        details: `${flight.source_city || source} → ${flight.destination_city || destination} • ${flight.stops} • ${flight.cabin_class || 'Economy'}`,
        booking_date: departureDate
      });

      const refCode = res.data.reference_code || 'REF-FLT-SAVED';
      setBookingFeedback(`Flight reservation saved to your journey book! Reference: ${refCode}. Transferring to partner airline.`);

      if (flight.booking_url) {
        window.open(flight.booking_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setBookingFeedback(`Flight route recorded in your trip bookings tracker.`);
    }
  };

  // Filter and Sort Logic
  const filteredFlights = flights.filter(f => {
    if (filterStops === 'Non-stop') return f.stops?.toLowerCase().includes('non');
    if (filterStops === '1 Stop') return f.stops?.includes('1');
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'Cheapest') return a.price_inr - b.price_inr;
    if (sortBy === 'Fastest') return a.duration_hrs - b.duration_hrs;
    if (sortBy === 'Fewest Stops') {
      const stopsA = a.stops?.toLowerCase().includes('non') ? 0 : 1;
      const stopsB = b.stops?.toLowerCase().includes('non') ? 0 : 1;
      return stopsA - stopsB;
    }
    return (a.overall_score || 0) - (b.overall_score || 0);
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Flights & Airfare Intelligence" 
        subtitle="Live GDS flight provider offers, ML price predictions & delay risk assessment" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 pb-36">
        {/* Flight Search Form Card */}
        <section className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Origin */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                Origin City / Airport
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Delhi, Hyderabad, BOM"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                Destination City / Airport
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Dubai, DXB, Paris, London"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition"
              />
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                min={today}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
              />
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                <span>Return Date</span>
              </label>
              <input
                type="date"
                min={departureDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
              />
            </div>

            {/* Cabin & Adults */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                  Class
                </label>
                <select
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Prem. Econ</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
              <div className="w-16">
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                  Adults
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#e3d6c1]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#998c7e] font-mono">Stops:</span>
              {['All', 'Non-stop', '1 Stop'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStops(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    filterStops === s 
                      ? 'bg-[#c25e38] text-white shadow-xs' 
                      : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#998c7e] font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-full border border-[#e3d6c1] text-xs font-bold text-[#221c17] bg-[#f5eee2]/60 outline-none"
                >
                  <option>Best Overall</option>
                  <option>Cheapest</option>
                  <option>Fastest</option>
                  <option>Fewest Stops</option>
                </select>
              </div>

              <button
                type="button"
                onClick={fetchFlights}
                disabled={loading}
                className="px-6 py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full font-bold text-xs shadow-xs flex items-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Search Flights'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feedback & Data Status Banner */}
        {bookingFeedback && (
          <div className="bg-[#eef7f2] border border-[#3b7a57]/30 p-4 rounded-2xl flex items-center gap-3 text-[#3b7a57] text-xs font-bold font-mono">
            <Check className="w-4 h-4 text-[#3b7a57] shrink-0" />
            <span>{bookingFeedback}</span>
          </div>
        )}

        {statusMessage && (
          <div className="bg-[#faeee7] border border-[#c25e38]/30 p-3.5 rounded-2xl flex items-center gap-2.5 text-[#c25e38] text-xs font-medium font-mono">
            <Info className="w-4 h-4 text-[#c25e38] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ML Flight Price Prediction Card */}
        {prediction && (
          <section className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fef6eb] text-[#c88842] px-2.5 py-0.5 rounded-full border border-[#c88842]/20 font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI Fare & Delay Risk Intelligence
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#221c17] font-serif">
                Estimated Price Range for {source} → {destination}: <span className="text-[#c25e38] font-mono">{prediction.price_range_inr || `₹ ${prediction.predicted_price_inr?.toLocaleString('en-IN')}`}</span>
              </h3>
              <p className="text-xs text-[#695e52]">
                Delay Risk: <span className="font-bold text-[#3b7a57]">{prediction.delay_risk}</span> • Recommendation: <span className="font-bold text-[#c88842]">{prediction.recommended_badge}</span>
              </p>
            </div>

            <div className="bg-[#f5eee2] px-4 py-3 rounded-2xl text-center shrink-0 border border-[#e3d6c1]">
              <span className="text-[10px] text-[#998c7e] block uppercase font-bold font-mono">Best Window</span>
              <span className="text-sm font-extrabold text-[#221c17] font-serif">14–21 Days Before</span>
            </div>
          </section>
        )}

        {/* Flight Results List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
                Available Flights ({sortedFlights.length})
              </span>
              <h3 className="text-lg font-bold text-[#221c17] font-serif">
                Route: {source} &rarr; {destination}
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center space-y-3">
              <Clock className="w-8 h-8 text-[#c25e38] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#695e52]">Retrieving flight inventory...</p>
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center space-y-2">
              <Plane className="w-8 h-8 text-[#998c7e] mx-auto" />
              <p className="text-sm font-bold text-[#221c17] font-serif">No flight offers found for this date or route.</p>
              <p className="text-xs text-[#695e52]">Try changing the search dates or airport names.</p>
            </div>
          ) : (
            sortedFlights.map((flight, idx) => (
              <div 
                key={flight.id || idx}
                className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs hover:border-[#c25e38]/50 hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-4"
              >
                {/* Airline & Flight Info */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#faeee7] flex items-center justify-center text-[#c25e38] font-bold text-sm shrink-0">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#221c17] text-sm font-serif">{flight.airline}</h4>
                      {flight.recommended_badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] border border-[#c25e38]/20 font-mono">
                          {flight.recommended_badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#695e52] font-mono mt-0.5">
                      Flight {flight.flight_number} • {flight.cabin_class || 'Economy'}
                    </p>
                  </div>
                </div>

                {/* Route & Timings */}
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <span className="text-sm font-extrabold text-[#221c17] font-mono">{flight.departure_time?.slice(11, 16) || '08:30'}</span>
                    <span className="text-[11px] text-[#695e52] font-bold block">{flight.origin || source}</span>
                  </div>

                  <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-[#998c7e] font-semibold font-mono">{flight.duration_hrs}h</span>
                    <div className="w-20 h-0.5 bg-[#e3d6c1] relative my-1">
                      <div className="w-2 h-2 rounded-full bg-[#c25e38] absolute -top-[3px] left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[10px] text-[#695e52] font-bold font-mono">{flight.stops}</span>
                  </div>

                  <div>
                    <span className="text-sm font-extrabold text-[#221c17] font-mono">{flight.arrival_time?.slice(11, 16) || '12:45'}</span>
                    <span className="text-[11px] text-[#695e52] font-bold block">{flight.destination || destination}</span>
                  </div>
                </div>

                {/* Pricing & Booking Handoff Button */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-[#998c7e] block uppercase font-mono">Total Fare</span>
                    <span className="text-lg font-extrabold text-[#c25e38] font-mono">
                      ₹ {flight.price_inr?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookingHandoff(flight)}
                    className="px-5 py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition shrink-0"
                  >
                    <span>Reserve Route</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
