import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix standard Leaflet default marker icons for Webpack/Vite
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface MapPoint {
  name: string;
  lat: number;
  lon: number;
  description?: string;
  category?: string;
  cost?: string | number;
}

interface Props {
  center?: [number, number];
  zoom?: number;
  markers?: MapPoint[];
  showRoute?: boolean;
}

// Controller component to smoothly fly/recenter the map when center or markers change
const MapRecenterController: React.FC<{ center: [number, number]; zoom: number; markers: MapPoint[] }> = ({
  center,
  zoom,
  markers
}) => {
  const map = useMap();

  useEffect(() => {
    if (markers && markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2, maxZoom: 13 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, markers, map]);

  return null;
};

export const MapComponent: React.FC<Props> = ({
  center = [25.2048, 55.2708],
  zoom = 11,
  markers = [],
  showRoute = true
}) => {
  const effectiveCenter = markers.length > 0 ? [markers[0].lat, markers[0].lon] as [number, number] : center;
  const polylinePositions = markers.map(m => [m.lat, m.lon] as [number, number]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-sm border border-[#e3d6c1] relative z-10 bg-[#f5eee2]">
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[420px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenterController center={effectiveCenter} zoom={zoom} markers={markers} />

        {markers.map((point, index) => (
          <Marker 
            key={`${point.name}-${point.lat}-${point.lon}-${index}`} 
            position={[point.lat, point.lon]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 max-w-[220px] space-y-1 bg-[#fffefb] text-[#221c17] rounded-xl font-sans">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] bg-[#faeee7] px-2 py-0.5 rounded-md inline-block">
                  {point.category || "Attraction"}
                </span>
                <h4 className="font-bold text-xs text-[#221c17] leading-tight font-serif pt-1">{point.name}</h4>
                {point.description && (
                  <p className="text-[11px] text-[#695e52] leading-normal">{point.description}</p>
                )}
                {point.cost !== undefined && (
                  <p className="text-[11px] font-extrabold text-[#c25e38] pt-1 font-mono">
                    {typeof point.cost === 'number' ? (point.cost > 0 ? `₹${point.cost.toLocaleString('en-IN')}` : 'Free Entry') : point.cost}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {showRoute && polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            color="#c25e38" 
            weight={3.5} 
            dashArray="8, 8" 
          />
        )}
      </MapContainer>
    </div>
  );
};
