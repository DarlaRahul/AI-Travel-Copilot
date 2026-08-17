import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Shirt, 
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { FloatingDock } from '../components/ui/floating-dock';

export const WeatherPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(
    searchParams.get('dest') || localStorage.getItem('travel_copilot_active_destination') || 'Dubai'
  );
  const [weatherData, setWeatherData] = useState<any>(null);
  const [indoorAdvisory, setIndoorAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWeather = async (targetDest: string) => {
    setLoading(true);
    try {
      const res = await travelApi.getWeather(targetDest);
      setWeatherData(res.data.weather);
      setIndoorAdvisory(res.data.indoor_rerouting);
      setDestination(targetDest);
    } catch (err) {
      console.error("Weather fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(destination);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Weather & Climate Radar" 
        subtitle="Real-time meteorological forecasts, precipitation probability & packing intelligence" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-36">
        {/* Destination Search Bar */}
        <section className="bg-[#fffefb] p-3 sm:p-4 rounded-3xl border border-[#e3d6c1] shadow-xs flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-[#c25e38] absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search weather for any destination (Current: ${destination})...`}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#f5eee2]/60 border border-[#e3d6c1] text-xs font-bold text-[#221c17] placeholder:text-[#998c7e] outline-none focus:border-[#c25e38] transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full text-xs font-bold shadow-xs transition shrink-0"
            >
              Get Forecast
            </button>
          </form>
        </section>

        {/* Current Weather Big Card */}
        {loading ? (
          <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center space-y-3">
            <Clock className="w-8 h-8 text-[#c25e38] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#695e52]">Retrieving Open-Meteo meteorological radar data...</p>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">
            {/* Editorial Hero Weather Banner */}
            <div className="bg-gradient-to-r from-[#221c17] via-[#3a2e24] to-[#2a475e] p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden border border-[#e3d6c1]/20">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#c25e38] text-white px-2.5 py-0.5 rounded-full font-mono">
                      Live Satellite Radar
                    </span>
                    <span className="text-xs font-bold text-[#e3d6c1] font-serif">
                      {weatherData.city}
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-extrabold font-serif text-[#fffefb]">{weatherData.current_temp_c}°C</h2>
                  <p className="text-base font-bold text-[#f5eee2] font-serif">{weatherData.condition}</p>
                  <p className="text-xs text-[#eae0cf] font-mono">
                    Feels like {weatherData.feels_like_temp_c}°C • Wind: {weatherData.wind_speed_kmh} km/h • Humidity: {weatherData.humidity_pct}%
                  </p>
                </div>

                {/* Weather Stats Badges */}
                <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-5 h-5 text-amber-300" />
                    <div>
                      <span className="text-[10px] text-[#e3d6c1] block font-mono">Precipitation</span>
                      <span className="text-xs font-extrabold text-white font-mono">{weatherData.rain_probability_pct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Wind className="w-5 h-5 text-sky-300" />
                    <div>
                      <span className="text-[10px] text-[#e3d6c1] block font-mono">Wind Speed</span>
                      <span className="text-xs font-extrabold text-white font-mono">{weatherData.wind_speed_kmh} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rain Advisory / Indoor Rerouting Card */}
            {indoorAdvisory && (
              <div className="bg-[#fef6eb] border border-[#c88842]/30 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-[#c88842] font-bold text-xs font-serif">
                  <AlertTriangle className="w-4 h-4 text-[#c88842]" />
                  <span>AI Weather Advisory & Indoor Rerouting</span>
                </div>
                <p className="text-xs text-[#695e52] leading-relaxed">{indoorAdvisory.advisory}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {indoorAdvisory.indoor_alternatives?.map((alt: string, i: number) => (
                    <span key={i} className="text-xs font-semibold bg-[#fffefb] border border-[#e3d6c1] text-[#221c17] px-3 py-1 rounded-full shadow-2xs font-mono">
                      🏛️ {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clothing & Packing Advisory */}
            <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center shrink-0">
                <Shirt className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
                  Smart Recommendation
                </span>
                <h4 className="font-bold text-[#221c17] text-sm font-serif">Packing & Attire Intelligence</h4>
                <p className="text-xs text-[#695e52] leading-relaxed">{weatherData.clothing_tip}</p>
              </div>
            </div>

            {/* 5-Day Forecast Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#998c7e] font-mono block">
                Meteorological Outlook
              </span>
              <h3 className="text-base font-bold text-[#221c17] font-serif">
                5-Day Extended Weather Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {weatherData.forecast_5_days?.map((day: any, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-[#fffefb] p-4 rounded-3xl border border-[#e3d6c1] shadow-xs text-center space-y-2 hover:border-[#c25e38]/50 transition"
                  >
                    <span className="text-xs font-bold text-[#998c7e] block font-mono">
                      {new Date(day.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center mx-auto font-bold">
                      <CloudSun className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-lg font-extrabold text-[#221c17] block font-serif">{day.temp_c}°C</span>
                      <span className="text-xs font-semibold text-[#695e52] block line-clamp-1">{day.condition}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#2a475e] bg-[#edf3f7] px-2.5 py-0.5 rounded-full inline-block font-mono">
                      🌧️ {day.rain_pct}% Rain
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#fffefb] p-12 rounded-3xl border border-[#e3d6c1] text-center text-xs text-[#695e52]">
            Enter a destination above to retrieve live climate forecasts.
          </div>
        )}
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
