import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Plus, 
  Sparkles,
  ChevronRight,
  Bot
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { DestinationCard } from '../components/DestinationCard';
import { travelApi } from '../services/api';
import { DestinationCard as IDestinationCard } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featured, setFeatured] = useState<IDestinationCard[]>([]);
  const [stats, setStats] = useState({
    upcoming_trips_count: 2,
    total_bookings_count: 5,
    places_visited_count: 12,
    travel_days_count: 28,
    active_upcoming_trip: null as any
  });

  const userName = user?.name ? user.name.split(' ')[0] : 'Chandu';

  useEffect(() => {
    // Fetch featured destinations
    travelApi.getFeaturedDestinations()
      .then(res => setFeatured(res.data))
      .catch(err => console.error("Error fetching destinations:", err));

    // Fetch dynamic dashboard stats & active upcoming trip
    travelApi.getDashboardStats()
      .then(res => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.error("Error fetching dashboard stats:", err));
  }, []);

  const upcomingTrip = stats.active_upcoming_trip;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title={`Hello, ${userName} 👋`} 
          subtitle="Where would you like to explore today?" 
        />

        <main className="p-8 space-y-8 max-w-7xl w-full">
          {/* 4 Statistics Cards (Matching Reference UI with Dynamic Values) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Upcoming Trips */}
            <div 
              onClick={() => navigate('/itinerary/1')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Upcoming Trip</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">{stats.upcoming_trips_count}</span>
                  <span className="text-xs font-semibold text-slate-500">Trips</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Bookings */}
            <div 
              onClick={() => navigate('/hotels')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total Bookings</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">{stats.total_bookings_count}</span>
                  <span className="text-xs font-semibold text-slate-500">Bookings</span>
                </div>
              </div>
            </div>

            {/* Card 3: Places Visited */}
            <div 
              onClick={() => navigate('/explore')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Places Visited</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">{stats.places_visited_count}</span>
                  <span className="text-xs font-semibold text-slate-500">Destinations</span>
                </div>
              </div>
            </div>

            {/* Card 4: Travel Days */}
            <div 
              onClick={() => navigate('/plan-trip')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Travel Days</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">{stats.travel_days_count}</span>
                  <span className="text-xs font-semibold text-slate-500">Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Trip Hero & Quick Actions Grid (Matching Reference UI) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upcoming Trip Hero Banner */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="p-6 pb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-lg">Upcoming Trip</h3>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Confirmed & Ready
                </span>
              </div>

              {/* Panoramic Banner Card with Dynamic Trip Data */}
              <div className="px-6 pb-6">
                <div className="relative rounded-2xl overflow-hidden aspect-[21/9] w-full shadow-inner">
                  <img
                    src={upcomingTrip?.image_url || "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80"}
                    alt={upcomingTrip?.title || "Upcoming Trip"}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                    <div>
                      <h4 className="font-extrabold text-xl sm:text-2xl drop-shadow-sm">
                        {upcomingTrip?.title || "Greek Island Adventure"}
                      </h4>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        {upcomingTrip 
                          ? `${upcomingTrip.start_date} – ${upcomingTrip.end_date} • ${upcomingTrip.destination}, ${upcomingTrip.country || 'Vacation'}`
                          : "14 – 21 June 2025 • Santorini, Mykonos, Crete"}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(upcomingTrip?.id ? `/itinerary/${upcomingTrip.id}?dest=${encodeURIComponent(upcomingTrip.destination)}` : '/itinerary/1')}
                      className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-md transition shrink-0 backdrop-blur-md flex items-center gap-1.5"
                    >
                      <span>View Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Matching Reference UI) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {/* Action 1: Plan a New Trip */}
                <div
                  onClick={() => navigate('/plan-trip')}
                  className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">Plan a New Trip</p>
                      <p className="text-xs text-slate-500 font-medium">Get AI-powered itinerary</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-blue-600 group-hover:rotate-90 transition-transform" />
                </div>

                {/* Action 2: Explore Destinations */}
                <div
                  onClick={() => navigate('/explore')}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">Explore Destinations</p>
                      <p className="text-xs text-slate-500 font-medium">Discover amazing places</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Action 3: AI Travel Assistant */}
                <div
                  onClick={() => navigate('/assistant')}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">AI Travel Assistant</p>
                      <p className="text-xs text-slate-500 font-medium">Ask anything about travel</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended For You Carousel / Grid (Matching Reference UI) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Recommended For You</h3>
                <p className="text-xs font-medium text-slate-500">Curated with Hybrid Collaborative Filtering & Persona Matching</p>
              </div>

              <button 
                onClick={() => navigate('/explore')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featured.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
