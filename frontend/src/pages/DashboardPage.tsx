import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  Building2, 
  Compass, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { QuordixHero } from '../components/ui/quordix-hero';
import { CoverflowCarousel, CoverflowItem } from '../components/ui/coverflow-carousel';
import { WorldExplorerMap } from '../components/WorldExplorerMap';
import { FloatingDock } from '../components/ui/floating-dock';
import { travelApi } from '../services/api';
import { DestinationCard as IDestinationCard } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [featuredDestinations, setFeaturedDestinations] = useState<IDestinationCard[]>([]);
  const [activeDestination, setActiveDestination] = useState<string>('Dubai');
  const [activeCoords, setActiveCoords] = useState<[number, number]>([25.2048, 55.2708]);
  const [recommendedHotels, setRecommendedHotels] = useState<any[]>([]);
  const [recommendedFlights, setRecommendedFlights] = useState<any[]>([]);
  const [activeCoverflowIndex, setActiveCoverflowIndex] = useState(0);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  // Fetch initial featured destinations
  useEffect(() => {
    travelApi.getFeaturedDestinations()
      .then(res => {
        const dests = res.data || [];
        setFeaturedDestinations(dests);
        if (dests.length > 0 && !activeDestination) {
          setActiveDestination(dests[0].name);
        }
      })
      .catch(err => console.error("Error fetching destinations:", err));
  }, []);

  // Fetch hotels & flights whenever activeDestination changes
  useEffect(() => {
    if (activeDestination) {
      const today = new Date().toISOString().slice(0, 10);
      const checkout = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

      // Fetch hotels
      travelApi.getHotels({ city: activeDestination, check_in: today, check_out: checkout })
        .then(res => setRecommendedHotels(res.data.results || []))
        .catch(() => setRecommendedHotels([]));

      // Fetch flights
      travelApi.searchFlights({ source: 'Delhi', destination: activeDestination, departureDate: today })
        .then(res => setRecommendedFlights(res.data.flights || []))
        .catch(() => setRecommendedFlights([]));
    }
  }, [activeDestination]);

  // Transform featured destinations for 3D Coverflow
  const destinationCoverflowItems: CoverflowItem[] = (
    featuredDestinations.length > 0 ? featuredDestinations : [
      { id: '1', name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', rating: 4.9, avg_cost_inr: '₹48,000 avg', ai_score: 96, tags: ['Luxury', 'Architecture'] },
      { id: '2', name: 'Paris', country: 'France', region: 'Europe', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', rating: 4.8, avg_cost_inr: '₹55,000 avg', ai_score: 94, tags: ['Heritage', 'Art'] },
      { id: '3', name: 'Tokyo', country: 'Japan', region: 'Asia', image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80', rating: 4.9, avg_cost_inr: '₹62,000 avg', ai_score: 98, tags: ['Culture', 'Gastronomy'] },
      { id: '4', name: 'Hyderabad', country: 'India', region: 'Asia', image_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&q=80', rating: 4.7, avg_cost_inr: '₹22,000 avg', ai_score: 91, tags: ['Historic', 'Biryani'] },
      { id: '5', name: 'Bali', country: 'Indonesia', region: 'Asia', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', rating: 4.8, avg_cost_inr: '₹35,000 avg', ai_score: 93, tags: ['Nature', 'Beaches'] }
    ]
  ).map((dest, idx) => ({
    id: dest.id || idx,
    title: dest.name,
    subtitle: dest.tags?.join(' • ') || `${dest.region} • World Destination`,
    country: dest.country,
    image: dest.image_url,
    rating: dest.rating || 4.8,
    badge: dest.tags?.[0] || 'Featured',
    cost: dest.avg_cost_inr || '₹45,000 avg',
    data: dest
  }));

  // Handle Coverflow destination selection
  const handleCoverflowSelect = (item: CoverflowItem, index: number) => {
    setActiveCoverflowIndex(index);
    setActiveDestination(item.title);
  };

  // Handle Search from Hero or Map
  const handleDestinationSearch = (destName: string) => {
    setActiveDestination(destName);
    // Find if destination is in coverflow items
    const matchIdx = destinationCoverflowItems.findIndex(
      item => item.title.toLowerCase() === destName.toLowerCase()
    );
    if (matchIdx !== -1) {
      setActiveCoverflowIndex(matchIdx);
    }
  };

  const handlePlanTrip = (dest?: string) => {
    const target = dest || activeDestination;
    navigate(`/planner?dest=${encodeURIComponent(target)}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col selection:bg-[#c25e38] selection:text-white">
      {/* Top Header Navigation */}
      <Navbar 
        title={`Hello, ${displayName}`} 
        subtitle="Global travel discovery and intelligent route planning" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-12 pb-36">
        {/* 1. 21st.dev Quordix-Inspired Travel Hero */}
        <QuordixHero
          initialQuery={activeDestination}
          onSearch={handleDestinationSearch}
          onPlanTrip={() => handlePlanTrip()}
        />

        {/* 2. DISCOVER YOUR NEXT DESTINATION — 3D Coverflow Carousel */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#e3d6c1]/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Global Discovery
                </span>
                <span className="text-xs text-[#998c7e] font-serif italic">Interactive Perspective View</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221c17] tracking-tight font-serif mt-1">
                Discover Your Next Destination
              </h2>
              <p className="text-xs sm:text-sm text-[#695e52]">
                Swipe or select any destination to focus the World Explorer and update live travel options.
              </p>
            </div>

            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-bold text-[#c25e38] hover:text-[#a84c29] flex items-center gap-1 font-serif shrink-0 cursor-pointer"
            >
              <span>Explore all places</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <CoverflowCarousel
            items={destinationCoverflowItems}
            activeIndex={activeCoverflowIndex}
            onSelect={handleCoverflowSelect}
          />
        </section>

        {/* 3. WORLD EXPLORER — Interactive Location Discovery Map */}
        <section className="space-y-4">
          <WorldExplorerMap
            initialDestination={activeDestination}
            center={activeCoords}
            zoom={12}
            onDestinationChange={(dest, coords) => {
              setActiveDestination(dest);
              setActiveCoords(coords);
            }}
            onSelectPlace={(place) => {
              console.log("Selected POI:", place);
            }}
          />
        </section>

        {/* 4. STAY SOMEWHERE SPECIAL — Curated Hotel Stays */}
        {recommendedHotels.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#e3d6c1]/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#edf3f7] text-[#2a475e] px-2.5 py-0.5 rounded-full font-mono">
                    Verified Accommodations
                  </span>
                  <span className="text-xs text-[#998c7e] font-serif italic">Live Pricing & Amenities</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#221c17] tracking-tight font-serif mt-1">
                  Stay Somewhere Special in {activeDestination}
                </h2>
                <p className="text-xs text-[#695e52]">
                  Handpicked luxury suites, heritage hotels, and boutique stays.
                </p>
              </div>

              <button
                onClick={() => navigate(`/hotels?dest=${encodeURIComponent(activeDestination)}`)}
                className="text-xs font-bold text-[#c25e38] hover:text-[#a84c29] flex items-center gap-1 font-serif shrink-0 cursor-pointer"
              >
                <span>View all hotels in {activeDestination}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedHotels.slice(0, 3).map((hotel, idx) => (
                <div
                  key={hotel.hotel_id || idx}
                  onClick={() => navigate(`/hotels?dest=${encodeURIComponent(activeDestination)}`)}
                  className="bg-[#fffefb] rounded-3xl border border-[#e3d6c1] overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f5eee2]">
                    <img
                      src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-[#fffefb]/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-[#221c17] flex items-center gap-1 shadow-xs font-mono">
                      <Star className="w-3.5 h-3.5 fill-[#c88842] text-[#c88842]" />
                      <span>{hotel.star_rating || hotel.rating || 4.8}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#221c17]/70 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#fffefb] uppercase tracking-wider font-mono">
                      {hotel.tier || "Curated Stay"}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-[#221c17] font-serif leading-snug group-hover:text-[#c25e38] transition">
                        {hotel.name}
                      </h4>
                      <p className="text-xs text-[#695e52] mt-1 line-clamp-1">
                        {hotel.room_type || "Deluxe King Suite • City View"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e3d6c1]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#998c7e] block font-mono">Nightly Rate</span>
                        <span className="text-sm font-extrabold text-[#c25e38] font-mono">
                          ₹{(hotel.price_per_night_inr || 5800).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button className="px-3.5 py-1.5 rounded-full bg-[#f5eee2] group-hover:bg-[#c25e38] group-hover:text-white text-[#221c17] text-xs font-bold transition flex items-center gap-1 font-serif cursor-pointer">
                        <span>View Stay</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. BEST WAYS TO GET THERE — Recommended Flight Offers */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#e3d6c1]/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
                  Air Travel Options
                </span>
                <span className="text-xs text-[#998c7e] font-serif italic">Amadeus & Reference Fares</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#221c17] tracking-tight font-serif mt-1">
                Best Ways to Get to {activeDestination}
              </h2>
              <p className="text-xs text-[#695e52]">
                Real-time route pricing, duration comparison, and ML price predictions.
              </p>
            </div>

            <button
              onClick={() => navigate(`/flights?dest=${encodeURIComponent(activeDestination)}`)}
              className="text-xs font-bold text-[#c25e38] hover:text-[#a84c29] flex items-center gap-1 font-serif shrink-0 cursor-pointer"
            >
              <span>Search all flight offers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recommendedFlights.length > 0 ? recommendedFlights.slice(0, 3) : [
              { flight_id: 'fl-1', airline: 'Emirates', flight_number: 'EK-511', departure_time: '04:15', arrival_time: '06:40', duration_formatted: '3h 55m', stops: 0, price_inr: 24500, cabin_class: 'Economy', origin: 'DEL', destination: 'DXB' },
              { flight_id: 'fl-2', airline: 'Air India', flight_number: 'AI-995', departure_time: '20:30', arrival_time: '22:45', duration_formatted: '3h 45m', stops: 0, price_inr: 19800, cabin_class: 'Economy', origin: 'DEL', destination: 'DXB' },
              { flight_id: 'fl-3', airline: 'IndiGo', flight_number: '6E-1461', departure_time: '14:20', arrival_time: '16:50', duration_formatted: '4h 00m', stops: 0, price_inr: 16500, cabin_class: 'Economy', origin: 'DEL', destination: 'DXB' }
            ]).map((flight, idx) => (
              <div
                key={flight.flight_id || idx}
                onClick={() => navigate(`/flights?dest=${encodeURIComponent(activeDestination)}`)}
                className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center font-bold text-xs font-serif">
                      <Plane className="w-4 h-4 -rotate-45" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#221c17] leading-tight font-serif">{flight.airline}</h4>
                      <p className="text-[10px] text-[#998c7e] font-mono">{flight.flight_number || "Direct Service"}</p>
                    </div>
                  </div>

                  {idx === 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eef7f2] text-[#3b7a57] px-2.5 py-0.5 rounded-full font-mono border border-[#3b7a57]/20">
                      Best Overall
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-y border-[#e3d6c1]/40 text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-[#221c17] font-mono">{flight.departure_time || "08:00"}</span>
                    <span className="text-[10px] text-[#998c7e] block font-mono">DEL</span>
                  </div>

                  <div className="flex flex-col items-center px-3">
                    <span className="text-[10px] font-bold text-[#695e52] font-mono">{flight.duration_formatted || "3h 45m"}</span>
                    <div className="w-16 h-[2px] bg-[#e3d6c1] relative my-1">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#c25e38]" />
                    </div>
                    <span className="text-[9px] text-[#3b7a57] font-mono">
                      {flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop`}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-[#221c17] font-mono">{flight.arrival_time || "11:45"}</span>
                    <span className="text-[10px] text-[#998c7e] block font-mono">DXB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-[#998c7e] block font-mono">Total Fare</span>
                    <span className="text-base font-extrabold text-[#c25e38] font-mono">
                      ₹{(flight.price_inr || 18500).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#221c17] group-hover:text-[#c25e38] transition flex items-center gap-1 font-serif">
                    Book &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. PLAN YOUR TRIP CTA — Seamless conversion into the Trip Planner */}
        <section className="bg-gradient-to-r from-[#fffefb] via-[#fdfbf6] to-[#faeee7] p-8 sm:p-10 rounded-3xl border border-[#e3d6c1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
              Ready to embark?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#221c17] font-serif tracking-tight">
              Create a custom itinerary for {activeDestination}
            </h3>
            <p className="text-xs sm:text-sm text-[#695e52]">
              Set your dates, travel style, and budget to get a mathematically optimized daily schedule with verified POIs and accommodations.
            </p>
          </div>

          <button
            onClick={() => handlePlanTrip(activeDestination)}
            className="px-7 py-3.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-sm shadow-md shadow-[#c25e38]/25 transition flex items-center gap-2 font-serif shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Launch Trip Planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
