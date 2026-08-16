import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CloudSun, 
  Search, 
  Droplets, 
  Wind, 
  Thermometer, 
  Shirt, 
  Calendar,
  AlertTriangle,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';

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
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Weather & Climate Radar 🌤️" 
          subtitle="Real-time global weather, rain probability, packing tips & 5-day forecasts via Open-Meteo" 
        />

        <main className="p-8 max-w-7xl w-full space-y-8">
          {/* Destination Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search live weather for any world city (Current: ${destination})...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition shrink-0"
              >
                Get Forecast
              </button>
            </form>
          </div>

          {/* Current Weather Big Card */}
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Retrieving Open-Meteo meteorological radar data...</p>
            </div>
          ) : weatherData ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-md">
                        Open-Meteo Live Satellite
                      </span>
                      <span className="text-xs font-bold text-blue-200">
                        {weatherData.city}
                      </span>
                    </div>

                    <h2 className="text-4xl font-black">{weatherData.current_temp_c}°C</h2>
                    <p className="text-base font-bold text-blue-100">{weatherData.condition}</p>
                    <p className="text-xs text-blue-200 font-medium">
                      Feels like {weatherData.feels_like_temp_c}°C • Wind: {weatherData.wind_speed_kmh} km/h • Humidity: {weatherData.humidity_pct}%
                    </p>
                  </div>

                  {/* Weather Stats Badges */}
                  <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-5 h-5 text-blue-300" />
                      <div>
                        <span className="text-[10px] text-blue-200 block font-semibold">Precipitation</span>
                        <span className="text-xs font-black">{weatherData.rain_probability_pct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Wind className="w-5 h-5 text-blue-300" />
                      <div>
                        <span className="text-[10px] text-blue-200 block font-semibold">Wind Speed</span>
                        <span className="text-xs font-black">{weatherData.wind_speed_kmh} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rain Advisory / Indoor Rerouting Card */}
              {indoorAdvisory && (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>AI Weather Advisory & Indoor Rerouting</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{indoorAdvisory.advisory}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {indoorAdvisory.indoor_alternatives?.map((alt: string, i: number) => (
                      <span key={i} className="text-[11px] font-semibold bg-amber-100/70 text-amber-900 px-3 py-1 rounded-xl">
                        🏛️ {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clothing & Packing Advisory */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Shirt className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">Packing & Attire Intelligence</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{weatherData.clothing_tip}</p>
                </div>
              </div>

              {/* 5-Day Forecast Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  5-Day Meteorological Outlook
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {weatherData.forecast_5_days?.map((day: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2"
                    >
                      <span className="text-xs font-bold text-slate-500 block">
                        {new Date(day.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg font-black text-slate-900 block">{day.temp_c}°C</span>
                        <span className="text-[10px] font-semibold text-slate-500 block line-clamp-1">{day.condition}</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                        🌧️ {day.rain_pct}% Rain
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              Enter a destination above to retrieve live climate forecasts.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
