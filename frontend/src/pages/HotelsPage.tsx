import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Star, 
  MapPin, 
  Check, 
  ExternalLink,
  Calendar,
  Clock
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { FloatingDock } from '../components/ui/floating-dock';

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
      setBookingFeedback(`Hotel reservation saved to your journey journal! Reference: ${refCode}. Forwarding to property portal.`);

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
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Hotels & Verified Stays" 
        subtitle="Explore worldwide accommodations, curated boutique rooms, nightly rates & flexible policies" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 pb-36">
        {/* Search Form Card */}
        <section className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Destination City */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                Destination City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#c25e38] absolute left-3 top-3" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dubai, Paris, Goa, Tokyo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition"
                />
              </div>
            </div>

            {/* Check-In */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                <span>Check-in Date</span>
              </label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#c25e38]" />
                <span>Check-out Date</span>
              </label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
              />
            </div>

            {/* Adults & Rooms */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                  Guests
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="block text-[11px] font-bold text-[#695e52] uppercase tracking-wider mb-1 font-mono">
                  Rooms
                </label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full px-2 py-2.5 rounded-2xl border border-[#e3d6c1] text-xs font-semibold text-[#221c17] bg-[#f5eee2]/60 outline-none focus:border-[#c25e38] transition font-mono"
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
                className="w-full py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Find Stays'}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#e3d6c1]/60 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#998c7e] font-mono">Tier:</span>
              {['All', 'Luxury', 'Mid-Range', 'Budget'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setTierFilter(tier)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    tierFilter === tier 
                      ? 'bg-[#c25e38] text-white shadow-xs' 
                      : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#998c7e] font-mono">Rating:</span>
              {['All', '4.5+', '4.0+'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRatingFilter(r)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    ratingFilter === r 
                      ? 'bg-[#c25e38] text-white shadow-xs' 
                      : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Banner */}
        {bookingFeedback && (
          <div className="bg-[#eef7f2] border border-[#3b7a57]/30 p-4 rounded-2xl flex items-center gap-3 text-[#3b7a57] text-xs font-bold font-mono">
            <Check className="w-4 h-4 text-[#3b7a57] shrink-0" />
            <span>{bookingFeedback}</span>
          </div>
        )}

        {statusMessage && (
          <div className="bg-[#faeee7] border border-[#c25e38]/30 p-3.5 rounded-2xl flex items-center gap-2.5 text-[#c25e38] text-xs font-medium font-mono">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Hotel Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a475e] font-mono">
                Accommodations ({filteredHotels.length})
              </span>
              <h3 className="text-lg font-bold text-[#221c17] font-serif">
                Verified Stays in {city}
              </h3>
            </div>
            <span className="text-xs font-medium text-[#695e52] font-mono">
              {checkIn} to {checkOut} • {adults} Guests, {rooms} Room
            </span>
          </div>

          {loading ? (
            <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center space-y-3">
              <Clock className="w-8 h-8 text-[#c25e38] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#695e52]">Retrieving hotel rates and room offers...</p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center space-y-2">
              <Building2 className="w-8 h-8 text-[#998c7e] mx-auto" />
              <p className="text-sm font-bold text-[#221c17] font-serif">No partner accommodations found for this query.</p>
              <p className="text-xs text-[#695e52]">Try adjusting your filters or destination name.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel, idx) => (
                <div 
                  key={hotel.hotel_id || idx}
                  className="bg-[#fffefb] rounded-3xl border border-[#e3d6c1] overflow-hidden shadow-xs hover:border-[#c25e38]/50 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="h-48 w-full relative overflow-hidden bg-[#f5eee2]">
                      <img 
                        src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                        alt={hotel.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#fffefb]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#221c17] shadow-xs font-mono">
                        {hotel.tier || 'Curated Stay'}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#221c17]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#c88842] flex items-center gap-1 font-mono">
                        <Star className="w-3 h-3 fill-[#c88842] text-[#c88842]" />
                        <span>{hotel.rating || 4.5}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div>
                        <h4 className="font-bold text-[#221c17] text-base font-serif leading-snug">{hotel.name}</h4>
                        <p className="text-xs text-[#695e52] font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#998c7e] shrink-0" />
                          <span className="truncate">{hotel.address || hotel.city}</span>
                        </p>
                      </div>

                      {/* Room Info */}
                      <div className="bg-[#f5eee2]/60 p-3 rounded-2xl border border-[#e3d6c1]/60 space-y-1">
                        <span className="text-[10px] font-bold text-[#2a475e] uppercase tracking-wider block font-mono">
                          {hotel.room_type || 'Deluxe Room'}
                        </span>
                        <p className="text-xs text-[#695e52] leading-tight">
                          {hotel.room_description || 'Air-conditioned room with modern amenities.'}
                        </p>
                      </div>

                      {/* Amenities */}
                      <p className="text-xs text-[#695e52]">
                        <span className="font-bold text-[#221c17]">Amenities: </span>
                        {hotel.amenities}
                      </p>

                      {/* Policies */}
                      {hotel.cancellation_policy && (
                        <p className="text-[11px] text-[#3b7a57] font-medium bg-[#eef7f2] px-2.5 py-1 rounded-lg">
                          ✓ {hotel.cancellation_policy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Booking Footer */}
                  <div className="p-5 border-t border-[#e3d6c1]/60 flex items-center justify-between bg-[#f5eee2]/30">
                    <div>
                      <span className="text-[10px] text-[#998c7e] font-bold uppercase block font-mono">Per Night</span>
                      <span className="text-base font-extrabold text-[#c25e38] font-mono">
                        ₹ {(hotel.price_per_night_inr || hotel.price_per_night || 6500).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookingHandoff(hotel)}
                      className="px-5 py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                    >
                      <span>Reserve Stay</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
