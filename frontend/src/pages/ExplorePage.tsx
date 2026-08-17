import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Loader2,
  Globe2,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { DestinationCard } from '../components/DestinationCard';
import { WorldExplorerMap } from '../components/WorldExplorerMap';
import { travelApi } from '../services/api';
import { Carousel07 } from '../components/ui/carousel-07';
import { FloatingDock } from '../components/ui/floating-dock';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeDestination, setActiveDestination] = useState(searchParams.get('dest') || 'Dubai');
  const [destinationMeta, setDestinationMeta] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [featuredCards, setFeaturedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = ['All', 'India', 'Middle East', 'Europe', 'Asia', 'Americas'];

  // Load featured destinations and initial active destination
  useEffect(() => {
    loadFeatured();
    const initialQuery = searchParams.get('search') || searchParams.get('dest') || activeDestination;
    loadDestinationDetails(initialQuery);
  }, [searchParams]);

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return card.name.toLowerCase().includes(q) || card.country.toLowerCase().includes(q);
    }
    return true;
  });

  const mapMarkers = places.map(p => ({
    name: p.name,
    lat: p.lat || destinationMeta?.lat || 25.2048,
    lon: p.lon || destinationMeta?.lon || 55.2708,
    description: p.description,
    category: p.category
  }));

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Explore Worldwide Destinations" 
        subtitle="Discover authentic sights, local landmarks, and verified POIs anywhere across the world" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-36">
        {/* Global Search Bar (Liquid Glass Pill) */}
        <section className="bg-[#fffefb] p-4 sm:p-5 rounded-3xl border border-[#e3d6c1] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#998c7e] absolute left-3.5 top-3.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any world city, island, or region (e.g. Dubai, Tokyo, Hyderabad, Paris, Bali, Munnar)"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f5eee2]/70 border border-[#e3d6c1] text-xs font-semibold text-[#221c17] placeholder:text-[#998c7e] outline-none focus:border-[#c25e38] transition"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-[#fffefb] rounded-full text-xs font-bold shadow-xs transition shrink-0"
            >
              Search
            </button>
          </form>
        </section>

        {/* Dynamic Active Destination Hero Banner */}
        {destinationMeta && (
          <section className="relative rounded-3xl overflow-hidden shadow-md border border-[#e3d6c1] h-80 group">
            <img 
              src={destinationMeta.image_url} 
              alt={destinationMeta.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#221c17]/90 via-[#221c17]/35 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="text-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#c25e38] px-3 py-0.5 rounded-full font-mono">
                    {destinationMeta.country || 'Global Destination'}
                  </span>
                  {destinationMeta.image_attribution && (
                    <span className="text-[10px] text-[#eae0cf] font-light">
                      📷 {destinationMeta.image_attribution}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#fffefb] font-serif">{destinationMeta.name}</h2>
                <p className="text-xs text-[#eae0cf] max-w-2xl line-clamp-2">
                  {destinationMeta.display_name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePlanTrip(destinationMeta.name)}
                  className="px-6 py-3 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full text-xs font-bold shadow-md flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Plan {destinationMeta.name} Itinerary</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Location-Aware Interactive World Explorer Map */}
        {destinationMeta && (
          <section className="space-y-4">
            <WorldExplorerMap
              initialDestination={activeDestination}
              center={[destinationMeta.lat || 25.2048, destinationMeta.lon || 55.2708]}
              zoom={12}
              onDestinationChange={(dest, coords) => {
                setActiveDestination(dest);
                loadDestinationDetails(dest);
              }}
            />
          </section>
        )}

        {/* Sights & Attractions Around Active Destination */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
                Attractions
              </span>
              <h3 className="text-xl font-bold text-[#221c17] font-serif">
                Verified Sights in {activeDestination}
              </h3>
              <p className="text-xs text-[#695e52]">OpenStreetMap Overpass verified historical, scenic & cultural POIs</p>
            </div>

            <button
              type="button"
              onClick={() => handlePlanTrip(activeDestination)}
              className="text-xs font-bold text-[#c25e38] hover:text-[#a84c29] flex items-center gap-1 font-serif"
            >
              <span>Build trip itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center">
              <Loader2 className="w-6 h-6 text-[#c25e38] animate-spin mx-auto" />
              <p className="text-xs text-[#695e52] mt-2 font-medium">Discovering nearby attractions...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="bg-[#fffefb] p-8 rounded-3xl border border-[#e3d6c1] text-center text-xs text-[#695e52]">
              No attraction records found for this immediate radius.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {places.map((place, idx) => (
                <div 
                  key={place.id || idx}
                  className="bg-[#fffefb] p-4 rounded-3xl border border-[#e3d6c1] shadow-xs hover:border-[#c25e38]/50 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#c25e38] bg-[#faeee7] px-2 py-0.5 rounded-md inline-block font-mono">
                      {place.category || 'Sightseeing'}
                    </span>
                    <h4 className="font-bold text-[#221c17] text-sm leading-snug line-clamp-1 font-serif">{place.name}</h4>
                    <p className="text-xs text-[#695e52] line-clamp-2 leading-relaxed">{place.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#e3d6c1]/60 flex items-center justify-between text-[11px] text-[#998c7e]">
                    <span className="font-mono">{place.source || 'OpenStreetMap'}</span>
                    <button
                      type="button"
                      onClick={() => handlePlanTrip(activeDestination)}
                      className="font-bold text-[#c25e38] hover:underline"
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
                className="px-6 py-2.5 bg-[#f5eee2] hover:bg-[#eae0cf] text-[#221c17] rounded-full text-xs font-bold border border-[#e3d6c1] transition"
              >
                {loadingPlaces ? 'Loading more sights...' : 'Load More Places'}
              </button>
            </div>
          )}
        </section>

        {/* Featured Curated Destinations Section (Carousel 07) */}
        <section className="space-y-4 pt-4 border-t border-[#e3d6c1]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
                Collection
              </span>
              <h3 className="text-xl font-bold text-[#221c17] font-serif">Featured Worldwide Getaways</h3>
              <p className="text-xs text-[#695e52]">Curated getaways across India, Middle East, Europe, and Asia</p>
            </div>

            {/* Region Filters */}
            <div className="flex flex-wrap gap-1.5">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                    selectedRegion === region 
                      ? 'bg-[#c25e38] text-white shadow-xs' 
                      : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFeatured.map((card) => (
              <div key={card.id} className="cursor-pointer" onClick={() => loadDestinationDetails(card.name)}>
                <DestinationCard destination={card} />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
