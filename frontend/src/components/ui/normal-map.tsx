import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Compass, MapPin, Star, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// Standard clean Leaflet map markers
const createPinIcon = (color: string, symbol: string, isBig = false) => {
  const size = isBig ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${size}" height="${size * 1.33}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#221c17" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="11" r="6" fill="#fffefb"/>
      <text x="12" y="14" font-size="7" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle">${symbol}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'normal-map-pin',
    iconSize: [size, size * 1.33],
    iconAnchor: [size / 2, size * 1.33],
    popupAnchor: [0, -(size * 1.1)]
  });
};

const destinationIcon = createPinIcon('#c25e38', '★', true);
const attractionIcon = createPinIcon('#c88842', '🏛', false);

export interface MapPlace {
  id?: string | number;
  name: string;
  lat: number;
  lon: number;
  category?: string;
  description?: string;
  rating?: number;
  cost?: string | number;
  image?: string;
}

interface NormalMapProps {
  center?: [number, number];
  zoom?: number;
  destinationName?: string;
  places?: MapPlace[];
  onSelectPlace?: (place: MapPlace) => void;
  className?: string;
  interactive?: boolean;
}

// Controller for smooth map transitions
const MapController: React.FC<{ center: [number, number]; zoom: number; places: MapPlace[] }> = ({
  center,
  zoom,
  places
}) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.4 });
    }
  }, [center, zoom, map]);

  return null;
};

// Custom minimal zoom controls
const ZoomControls: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5 bg-[#fffefb] p-1 rounded-2xl border border-[#e3d6c1] shadow-md">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="w-8 h-8 rounded-xl bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] flex items-center justify-center transition cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-full h-[1px] bg-[#e3d6c1]/60" />
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="w-8 h-8 rounded-xl bg-[#fffefb] hover:bg-[#f5eee2] text-[#221c17] flex items-center justify-center transition cursor-pointer"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NormalMap: React.FC<NormalMapProps> = ({
  center = [25.2048, 55.2708],
  zoom = 12,
  destinationName = 'Dubai',
  places = [],
  onSelectPlace,
  className,
  interactive = true
}) => {
  return (
    <div className={cn(
      "relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-[#f5eee2] border border-[#e3d6c1] shadow-sm",
      className
    )}>
      {/* Top Location Info Badge */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-[#fffefb]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#e3d6c1] shadow-xs">
        <MapPin className="w-3.5 h-3.5 text-[#c25e38]" />
        <span className="text-xs font-bold text-[#221c17] font-serif">
          {destinationName ? destinationName : 'Explore the World'}
        </span>
        {places.length > 0 && (
          <span className="text-[10px] bg-[#faeee7] text-[#c25e38] px-2 py-0.5 rounded-full font-mono font-bold">
            {places.length} Places
          </span>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="w-full h-full"
      >
        {/* Clean, standard neutral geographic tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} zoom={zoom} places={places} />
        <ZoomControls />

        {/* Destination Focal Marker */}
        {center && center[0] && (
          <Marker position={center} icon={destinationIcon}>
            <Popup className="vintage-leaflet-popup">
              <div className="p-2 max-w-[200px] text-[#221c17] font-sans">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#c25e38] bg-[#faeee7] px-2 py-0.5 rounded-full font-mono">
                  Destination
                </span>
                <h4 className="font-bold text-xs font-serif mt-1">{destinationName}</h4>
                <p className="text-[11px] text-[#695e52] mt-0.5">Explore sights, hotels and travel options here.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Attractions */}
        {places.map((place, idx) => (
          <Marker
            key={`${place.name}-${idx}`}
            position={[place.lat, place.lon]}
            icon={attractionIcon}
            eventHandlers={{
              click: () => {
                if (onSelectPlace) onSelectPlace(place);
              }
            }}
          >
            <Popup className="vintage-leaflet-popup">
              <div className="p-2 max-w-[220px] text-[#221c17] font-sans space-y-1">
                {place.image && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-1">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#c88842] bg-[#fef6eb] px-2 py-0.5 rounded-full font-mono">
                    {place.category || "Attraction"}
                  </span>
                  {place.rating && (
                    <span className="text-[10px] font-bold text-[#221c17] flex items-center gap-0.5 font-mono">
                      <Star className="w-3 h-3 fill-[#c88842] text-[#c88842]" />
                      {place.rating}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs font-serif leading-tight">{place.name}</h4>
                {place.description && (
                  <p className="text-[11px] text-[#695e52] line-clamp-2">{place.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
