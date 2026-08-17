import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, 
  Compass, 
  Building2, 
  Landmark, 
  Route as RouteIcon, 
  MapPin, 
  Sparkles,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { LiquidGlass } from './ui/liquid-glass';
import { travelApi } from '../services/api';

// Create custom SVG Leaflet Icons for Vintage Paper theme
const createMarkerIcon = (color: string, iconSymbol: string, isBig = false) => {
  const size = isBig ? 38 : 30;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${size}" height="${size * 1.33}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#221c17" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="11" r="7" fill="#fffefb"/>
      <text x="12" y="14" font-size="8" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle">${iconSymbol}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [size, size * 1.33],
    iconAnchor: [size / 2, size * 1.33],
    popupAnchor: [0, -(size * 1.1)]
  });
};

const destinationIcon = createMarkerIcon('#c25e38', '★', true);
const attractionIcon = createMarkerIcon('#c88842', '🏛', false);
const hotelIcon = createMarkerIcon('#2a475e', '🏨', false);

export interface ExplorerPoint {
  id?: string | number;
  name: string;
  lat: number;
  lon: number;
  category?: string;
  description?: string;
  rating?: number;
  cost?: string | number;
  image?: string;
  address?: string;
  type?: 'destination' | 'attraction' | 'hotel';
}

interface WorldExplorerMapProps {
  initialDestination?: string;
  center?: [number, number];
  zoom?: number;
  onDestinationChange?: (destination: string, coordinates: [number, number]) => void;
  onSelectPlace?: (place: ExplorerPoint) => void;
  className?: string;
  showSearch?: boolean;
  activeRoute?: [number, number][];
}

// Controller component to smoothly fly/pan map on coordinate changes
const MapFlyToController: React.FC<{ center: [number, number]; zoom: number; points: ExplorerPoint[] }> = ({
  center,
  zoom,
  points
}) => {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 1) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2, maxZoom: 13 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, points, map]);

  return null;
};

export const WorldExplorerMap: React.FC<WorldExplorerMapProps> = ({
  initialDestination = 'Dubai',
  center = [25.2048, 55.2708],
  zoom = 12,
  onDestinationChange,
  onSelectPlace,
  className,
  showSearch = true,
  activeRoute
}) => {
  const [currentDestination, setCurrentDestination] = useState(initialDestination);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapMode, setMapMode] = useState<'explore' | 'attractions' | 'hotels' | 'route'>('explore');
  const [attractions, setAttractions] = useState<ExplorerPoint[]>([]);
  const [hotels, setHotels] = useState<ExplorerPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync with initial destination changes from props
  useEffect(() => {
    if (initialDestination && initialDestination !== currentDestination) {
      setCurrentDestination(initialDestination);
      resolveLocation(initialDestination);
    }
  }, [initialDestination]);

  // Load POIs and hotels when destination changes
  useEffect(() => {
    if (currentDestination) {
      // 1. Fetch live attractions / places from Overpass API / Travel API
      travelApi.getPlaces(currentDestination, 0, 15)
        .then((res: any) => {
          const list = (res.data.results || []).map((a: any, i: number) => ({
            id: a.id || `att-${i}`,
            name: a.name,
            lat: a.lat || (mapCenter[0] + (i * 0.005 - 0.01)),
            lon: a.lon || (mapCenter[1] + (i * 0.006 - 0.01)),
            category: a.category || "Attraction",
            description: a.description || "Famous landmark and cultural highlight",
            rating: a.rating || 4.7,
            cost: a.entry_cost_inr ? `₹${a.entry_cost_inr.toLocaleString('en-IN')}` : "Free Entry",
            image: a.image_url,
            type: 'attraction' as const
          }));
          setAttractions(list);
        })
        .catch(() => {
          // Graceful fallback points around center
          setAttractions([
            { id: '1', name: `${currentDestination} Heritage Center`, lat: mapCenter[0] + 0.012, lon: mapCenter[1] + 0.01, category: "Heritage", description: "Historic cultural landmark", rating: 4.8, cost: "Free Entry", type: 'attraction' },
            { id: '2', name: `${currentDestination} Promenade`, lat: mapCenter[0] - 0.008, lon: mapCenter[1] - 0.012, category: "Scenic", description: "Waterfront observation district", rating: 4.9, cost: "Free Entry", type: 'attraction' },
            { id: '3', name: `${currentDestination} Grand Plaza`, lat: mapCenter[0] + 0.005, lon: mapCenter[1] - 0.015, category: "Plaza", description: "Bustling central public space", rating: 4.7, cost: "Free Entry", type: 'attraction' }
          ]);
        });

      // 2. Fetch live hotels for destination
      const today = new Date().toISOString().slice(0, 10);
      const checkout = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      travelApi.getHotels({ city: currentDestination, check_in: today, check_out: checkout })
        .then(res => {
          const list = (res.data.results || []).map((h: any, i: number) => ({
            id: h.hotel_id || `hotel-${i}`,
            name: h.name,
            lat: h.lat || (mapCenter[0] + (i * 0.006 - 0.01)),
            lon: h.lon || (mapCenter[1] + (i * 0.007 - 0.01)),
            category: h.tier || "Curated Stay",
            description: h.room_type || "Deluxe Suite with city views",
            rating: h.star_rating || 4.8,
            cost: `₹${(h.price_per_night_inr || 5800).toLocaleString('en-IN')}/night`,
            image: h.image_url,
            type: 'hotel' as const
          }));
          setHotels(list);
        })
        .catch(() => {});
    }
  }, [currentDestination, mapCenter[0], mapCenter[1]]);

  // Resolve arbitrary worldwide destination via Nominatim / dynamic geocoding
  const resolveLocation = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      // Use OpenStreetMap Nominatim for accurate worldwide geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const resolvedName = data[0].display_name.split(',')[0] || query;
        const newCoords: [number, number] = [lat, lon];
        setMapCenter(newCoords);
        setCurrentDestination(resolvedName);
        if (onDestinationChange) {
          onDestinationChange(resolvedName, newCoords);
        }
      }
    } catch (e) {
      console.warn("Geocoding fetch error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      resolveLocation(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // Filter markers based on active map mode
  const visiblePoints: ExplorerPoint[] = React.useMemo(() => {
    const destPoint: ExplorerPoint = {
      name: `${currentDestination} Center`,
      lat: mapCenter[0],
      lon: mapCenter[1],
      category: "Destination",
      description: `Central hub of ${currentDestination}`,
      type: 'destination'
    };

    if (mapMode === 'attractions') {
      return [destPoint, ...attractions];
    }
    if (mapMode === 'hotels') {
      return [destPoint, ...hotels];
    }
    if (mapMode === 'route') {
      return [destPoint];
    }
    // 'explore' mode shows both highlights
    return [destPoint, ...attractions.slice(0, 6), ...hotels.slice(0, 4)];
  }, [mapMode, currentDestination, mapCenter, attractions, hotels]);

  return (
    <div className={`relative w-full rounded-3xl bg-[#fffefb] border border-[#e3d6c1] shadow-sm overflow-hidden flex flex-col ${className || ''}`}>
      {/* Header Bar with Title, Destination info & Liquid Glass Controls */}
      <div className="p-4 sm:p-6 pb-4 border-b border-[#e3d6c1]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffefb]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] bg-[#faeee7] px-2.5 py-0.5 rounded-full font-mono border border-[#c25e38]/20">
              World Explorer
            </span>
            <span className="text-xs text-[#998c7e] font-serif italic">Location Discovery</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#221c17] font-serif mt-1">
            Explore {currentDestination}
          </h3>
          <p className="text-xs text-[#695e52]">
            Discover places, stays and experiences anywhere on Earth.
          </p>
        </div>

        {/* Liquid Glass Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#f5eee2] border border-[#e3d6c1] self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setMapMode('explore')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-serif ${
              mapMode === 'explore'
                ? 'bg-[#c25e38] text-white shadow-xs'
                : 'text-[#695e52] hover:text-[#221c17]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setMapMode('attractions')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-serif ${
              mapMode === 'attractions'
                ? 'bg-[#c25e38] text-white shadow-xs'
                : 'text-[#695e52] hover:text-[#221c17]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Attractions ({attractions.length})</span>
          </button>

          <button
            onClick={() => setMapMode('hotels')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-serif ${
              mapMode === 'hotels'
                ? 'bg-[#c25e38] text-white shadow-xs'
                : 'text-[#695e52] hover:text-[#221c17]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hotels ({hotels.length})</span>
          </button>

          {activeRoute && activeRoute.length > 1 && (
            <button
              onClick={() => setMapMode('route')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-serif ${
                mapMode === 'route'
                  ? 'bg-[#c25e38] text-white shadow-xs'
                  : 'text-[#695e52] hover:text-[#221c17]'
              }`}
            >
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Route</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Map Container */}
      <div className="relative w-full h-[420px] sm:h-[480px] bg-[#f5eee2]">
        {/* Floating Map Search Bar */}
        {showSearch && (
          <div className="absolute top-4 left-4 right-4 z-[400] max-w-md">
            <LiquidGlass variant="dock" className="p-1.5 bg-[#fffefb]/95 border border-[#e3d6c1] shadow-md">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="pl-2 text-[#998c7e]">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-[#c25e38] animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-[#c25e38]" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search any place in the world...`}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-[#221c17] placeholder:text-[#998c7e] font-medium font-sans"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3.5 py-1.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-2xs transition font-serif cursor-pointer"
                >
                  Locate
                </button>
              </form>
            </LiquidGlass>
          </div>
        )}

        {/* Leaflet Map Stage */}
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapFlyToController center={mapCenter} zoom={zoom} points={visiblePoints} />

          {/* Render Location & POI Markers */}
          {visiblePoints.map((pt, idx) => {
            const isDest = pt.type === 'destination';
            const isHotel = pt.type === 'hotel';
            const icon = isDest ? destinationIcon : isHotel ? hotelIcon : attractionIcon;

            return (
              <Marker
                key={`${pt.name}-${pt.lat}-${pt.lon}-${idx}`}
                position={[pt.lat, pt.lon]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectPlace) onSelectPlace(pt);
                  }
                }}
              >
                <Popup className="vintage-leaflet-popup">
                  <div className="p-2 max-w-[240px] space-y-1.5 bg-[#fffefb] text-[#221c17] rounded-2xl font-sans">
                    {pt.image && (
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-1.5 bg-[#f5eee2]">
                        <img src={pt.image} alt={pt.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#c25e38] bg-[#faeee7] px-2 py-0.5 rounded-full font-mono">
                        {pt.category || (isDest ? "Destination" : isHotel ? "Stay" : "Sight")}
                      </span>
                      {pt.rating && (
                        <span className="text-[10px] font-bold text-[#221c17] flex items-center gap-0.5 font-mono">
                          <Star className="w-3 h-3 fill-[#c88842] text-[#c88842]" />
                          {pt.rating}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-[#221c17] leading-tight font-serif pt-0.5">
                      {pt.name}
                    </h4>

                    {pt.description && (
                      <p className="text-[11px] text-[#695e52] leading-tight line-clamp-2">
                        {pt.description}
                      </p>
                    )}

                    {pt.cost && (
                      <p className="text-[11px] font-extrabold text-[#c25e38] pt-1 font-mono">
                        {pt.cost}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Genuine Route Polyline (only rendered when route mode or route active) */}
          {(mapMode === 'route' || activeRoute) && activeRoute && activeRoute.length > 1 && (
            <Polyline
              positions={activeRoute}
              color="#c25e38"
              weight={4}
              dashArray="6, 8"
            />
          )}
        </MapContainer>
      </div>

      {/* Footer Info Strip */}
      <div className="p-3 sm:px-6 bg-[#fffefb] border-t border-[#e3d6c1]/60 flex flex-wrap items-center justify-between text-xs text-[#695e52] gap-2">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c25e38]" />
            <span>Destination Center</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c88842]" />
            <span>Attractions ({attractions.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a475e]" />
            <span>Hotels ({hotels.length})</span>
          </span>
        </div>

        <span className="text-[11px] font-serif italic text-[#998c7e]">
          Interactive Geographic Discovery Map
        </span>
      </div>
    </div>
  );
};
