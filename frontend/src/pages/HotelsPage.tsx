import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Star, 
  MapPin, 
  Check, 
  ExternalLink,
  ShieldCheck, 
  Calendar,
  Wifi,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';

export const HotelsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);
  const defaultCheckout = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  const [city, setCity] = useState(
    searchParams.get('dest') || searchParams.get('city') || localStorage.getItem('travel_copilot_active_destination') || 'Dubai'
  );
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(defaultCheckout);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tierFilter, setTierFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  const fetchHotels = async () => {
    setLoading(true);
    setBookingFeedback(null);
    try {
      const res = await travelApi.getHotels({
        city,
        check_in: checkIn,
        check_out: checkOut,
        adults,
        rooms
      });

      setHotels(res.data.results || []);
      setStatusMessage(res.data.message || '');
    } catch (err) {
      console.error("Hotels fetch error:", err);
      setStatusMessage("Live hotel inventory unavailable for this query.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleBookingHandoff = async (hotel: any) => {
    try {
      const res = await travelApi.createBooking({
        booking_type: 'Hotel',
        item_name: hotel.name,
        destination: city,
        amount_inr: parseFloat(hotel.total_stay_price) || hotel.price_per_night_inr || 7500,
        details: `${hotel.room_type || 'Standard Room'} • Check-in: ${checkIn} • ${rooms} Room(s)`,
        booking_date: checkIn
      });

      const refCode = res.data.reference_code || 'REF-HTL-SAVED';
      setBookingFeedback(`Hotel reservation handoff recorded! Reference: ${refCode}. Forwarding to property portal.`);

      if (hotel.booking_url) {
        window.open(hotel.booking_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setBookingFeedback(`Hotel recorded in your trip bookings tracker.`);
    }
  };

  const filteredHotels = hotels.filter(h => {
    if (tierFilter !== 'All' && !h.tier?.toLowerCase().includes(tierFilter.toLowerCase())) return false;
    if (ratingFilter === '4.5+' && (h.rating || 0) < 4.5) return false;
    if (ratingFilter === '4.0+' && (h.rating || 0) < 4.0) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Hotels & Verified Stays 🏨" 
          subtitle="Explore worldwide accommodations, room offers, nightly rates & flexible policies" 
        />

        <main className="p-8 max-w-7xl w-full space-y-6">
          {/* Search Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Destination City */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Destination City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dubai, Paris, Goa, Tokyo"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Check-In */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Check-in Date</span>
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                />
              </div>

              {/* Check-Out */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Check-out Date</span>
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                />
              </div>

              {/* Adults & Rooms */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Guests
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rooms
                  </label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50/50 outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Rm</option>)}
                  </select>
                </div>
              </div>

              {/* Search Submit */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchHotels}
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Searching...' : 'Find Stays'}</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Tier:</span>
                {['All', 'Luxury', 'Mid-Range', 'Budget'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTierFilter(tier)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      tierFilter === tier ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Rating:</span>
                {['All', '4.5+', '4.0+'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRatingFilter(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      ratingFilter === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {bookingFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bookingFeedback}</span>
            </div>
          )}

          {statusMessage && (
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-blue-800 text-xs font-medium">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Hotel Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Accommodations in {city} ({filteredHotels.length})
              </h3>
              <span className="text-xs font-medium text-slate-500">
                {checkIn} to {checkOut} ({adults} Guests, {rooms} Room)
              </span>
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Retrieving hotel rates and room offers...</p>
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No partner accommodations found for this query.</p>
                <p className="text-xs text-slate-500">Try adjusting your filters or destination name.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel, idx) => (
                  <div 
                    key={hotel.hotel_id || idx}
                    className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                        <img 
                          src={hotel.image_url} 
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-800 shadow-xs">
                          {hotel.tier || 'Featured'}
                        </div>
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-300 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{hotel.rating || 4.5}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{hotel.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{hotel.address || hotel.city}</span>
                          </p>
                        </div>

                        {/* Room Info */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                            {hotel.room_type || 'Deluxe Room'}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {hotel.room_description || 'Air-conditioned room with modern amenities.'}
                          </p>
                        </div>

                        {/* Amenities */}
                        <p className="text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">Amenities: </span>
                          {hotel.amenities}
                        </p>

                        {/* Policies */}
                        {hotel.cancellation_policy && (
                          <p className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-md">
                            ✓ {hotel.cancellation_policy}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Booking Footer */}
                    <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Per Night</span>
                        <span className="text-base font-black text-slate-900">
                          ₹ {(hotel.price_per_night_inr || hotel.price_per_night || 6500).toLocaleString('en-IN')}
                        </span>
                        {hotel.total_stay_price && (
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Total: ₹ {parseFloat(hotel.total_stay_price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookingHandoff(hotel)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <span>Continue</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
