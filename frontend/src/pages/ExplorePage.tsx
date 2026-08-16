import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Compass, 
  ExternalLink,
  Loader2,
  Clock
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { DestinationCard } from '../components/DestinationCard';
import { travelApi } from '../services/api';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState('Dubai');
  const [destinationMeta, setDestinationMeta] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [featuredCards, setFeaturedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const categories = ['All', 'Luxury', 'Heritage', 'Beaches', 'Adventure', 'Food', 'Nature'];
  const regions = ['All', 'India', 'Middle East', 'Europe', 'Asia', 'Americas'];

  // Load featured destinations and initial active destination
  useEffect(() => {
    loadFeatured();
    loadDestinationDetails(activeDestination);
  }, []);

  const loadFeatured = async () => {
    try {
      const res = await travelApi.getFeaturedDestinations();
      setFeaturedCards(res.data || []);
    } catch (e) {
      // Graceful fallback
    }
  };

  const loadDestinationDetails = async (cityName: string) => {
    setLoading(true);
    setLoadingPlaces(true);
    setOffset(0);
    try {
      const locRes = await travelApi.resolveDestination(cityName);
      setDestinationMeta(locRes.data);
      setActiveDestination(locRes.data.name);

      const placesRes = await travelApi.getPlaces(cityName, 0, 12);
      const items = placesRes.data.results || [];
      setPlaces(items);
      setOffset(items.length);
      setHasMorePlaces(items.length >= 12);
    } catch (err) {
      console.error("Explore load error:", err);
    } finally {
      setLoading(false);
      setLoadingPlaces(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadDestinationDetails(searchQuery.trim());
    }
  };

  const handleLoadMorePlaces = async () => {
    if (loadingPlaces) return;
    setLoadingPlaces(true);
    try {
      const res = await travelApi.getPlaces(activeDestination, offset, 12);
      const newItems = res.data.results || [];
      setPlaces(prev => [...prev, ...newItems]);
      setOffset(prev => prev + newItems.length);
      setHasMorePlaces(newItems.length >= 12);
    } catch (err) {
      setHasMorePlaces(false);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handlePlanTrip = (destName: string) => {
    navigate(`/planner?dest=${encodeURIComponent(destName)}`);
  };

  const filteredFeatured = featuredCards.filter(card => {
    if (selectedRegion !== 'All' && card.region !== selectedRegion) return false;
    if (selectedCategory !== 'All' && !card.tags?.some((t: string) => t.toLowerCase().includes(selectedCategory.toLowerCase()))) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return card.name.toLowerCase().includes(q) || card.country.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Explore Global Destinations 🌍" 
          subtitle="Discover authentic sights, local landmarks, and verified POIs anywhere across the world" 
        />

        <main className="p-8 max-w-7xl w-full space-y-8">
          {/* Global Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any world city, island, or region (e.g. Dubai, Tokyo, Hyderabad, Paris, Bali, Munnar)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition"
                />
              </div>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Dynamic Active Destination Hero Banner */}
          {destinationMeta && (
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 h-72">
              <img 
                src={destinationMeta.image_url} 
                alt={destinationMeta.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 px-2.5 py-0.5 rounded-md">
                      {destinationMeta.country || 'Global Destination'}
                    </span>
                    {destinationMeta.image_attribution && (
                      <span className="text-[10px] text-slate-300 font-light">
                        📷 {destinationMeta.image_attribution}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-white">{destinationMeta.name}</h2>
                  <p className="text-xs text-slate-200 max-w-xl truncate">
                    {destinationMeta.display_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlanTrip(destinationMeta.name)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Plan {destinationMeta.name} Trip</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sights & Attractions Around Active Destination */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Verified Sights & Attractions in {activeDestination}
                </h3>
                <p className="text-xs text-slate-500">Live points of interest via OpenStreetMap Overpass</p>
              </div>

              <button
                type="button"
                onClick={() => handlePlanTrip(activeDestination)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Generate Full Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Discovering nearby attractions...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                No attraction records found for this immediate radius.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {places.map((place, idx) => (
                  <div 
                    key={place.id || idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                        {place.category || 'Sightseeing'}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-1">{place.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{place.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{place.source || 'OpenStreetMap'}</span>
                      <button
                        type="button"
                        onClick={() => handlePlanTrip(activeDestination)}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Add to Plan +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMorePlaces && places.length > 0 && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadMorePlaces}
                  disabled={loadingPlaces}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  {loadingPlaces ? 'Loading more sights...' : 'Load More Places'}
                </button>
              </div>
            )}
          </div>

          {/* Featured Curated Destinations Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Featured Worldwide Destinations</h3>
                <p className="text-xs text-slate-500">Popular curated getaways across India and international hubs</p>
              </div>

              {/* Region Filters */}
              <div className="flex flex-wrap gap-1.5">
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      selectedRegion === region ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredFeatured.map((card) => (
                <div key={card.id} className="cursor-pointer" onClick={() => loadDestinationDetails(card.name)}>
                  <DestinationCard destination={card} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
