import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plane, Compass, Sparkles, Users, Award, Headphones, Star, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handlePlanClick = (destinationName?: string) => {
    const dest = destinationName || searchQuery || 'Goa';
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/plan-trip?dest=${encodeURIComponent(dest)}`)}`);
    } else {
      navigate(`/plan-trip?dest=${encodeURIComponent(dest)}`);
    }
  };

  const handleNavClick = (path: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      navigate(path);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">AI Travel</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Copilot</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button onClick={() => handleNavClick('/dashboard')} className="hover:text-blue-600 transition">Home</button>
          <button onClick={() => handleNavClick('/plan-trip')} className="hover:text-blue-600 transition">Plan Trip</button>
          <button onClick={() => handleNavClick('/explore')} className="hover:text-blue-600 transition">Destinations</button>
          <button onClick={() => handleNavClick('/itinerary/1')} className="hover:text-blue-600 transition">Itinerary</button>
          <button onClick={() => handleNavClick('/hotels')} className="hover:text-blue-600 transition">Bookings</button>
          <button onClick={() => handleNavClick('/assistant')} className="hover:text-blue-600 transition">AI Assistant</button>
        </nav>

        <div>
          {isAuthenticated && user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-md transition flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                {userInitial}
              </div>
              <span>{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/25 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading, Search & Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next-Gen Autonomous Travel Planning</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Your <span className="text-blue-600">AI-Powered</span><br />
            Travel Companion
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            Plan smarter, travel better. Get personalized itineraries, real-time updates, and intelligent recommendations in one place.
          </p>

          {/* Search Box (Matching Original Reference UI) */}
          <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex items-center gap-3 max-w-lg">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlanClick()}
              placeholder="Where do you want to go?"
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => handlePlanClick()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition flex items-center gap-2"
            >
              <span>Plan My Trip</span>
              <Plane className="w-4 h-4 -rotate-45" />
            </button>
          </div>

          {/* Popular Searches */}
          <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-500 flex-wrap">
            <span className="font-medium">Popular Searches:</span>
            {['Goa', 'Bali', 'Switzerland', 'Manali', 'Paris', 'Japan'].map((dest) => (
              <button
                key={dest}
                onClick={() => handlePlanClick(dest)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition shadow-2xs font-medium"
              >
                {dest}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">100+</p>
                <p className="text-[11px] text-slate-500 font-medium">Destinations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">10K+</p>
                <p className="text-[11px] text-slate-500 font-medium">Happy Travelers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">98%</p>
                <p className="text-[11px] text-slate-500 font-medium">Satisfaction</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">24/7</p>
                <p className="text-[11px] text-slate-500 font-medium">AI Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Original Overlapping/Crossed Floating Collage (Matching Reference UI) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[460px] aspect-[4/5]">
            {/* Top Large Card (Santorini Greece Caldera Sunset) */}
            <div 
              onClick={() => handlePlanClick('Santorini')}
              className="absolute top-0 right-0 w-4/5 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500 cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80"
                alt="Santorini Greece"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white text-xs font-bold">Santorini, Greece • Plan Trip &rarr;</p>
              </div>
            </div>

            {/* Middle Left Card (Alpine Swiss Mountain Lake) - Crossed Layer */}
            <div 
              onClick={() => handlePlanClick('Switzerland')}
              className="absolute top-1/3 left-0 w-3/5 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white -rotate-3 hover:rotate-0 transition duration-500 z-10 cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80"
                alt="Swiss Alps"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white text-xs font-bold">Swiss Alps • Plan Trip &rarr;</p>
              </div>
            </div>

            {/* Bottom Right Card (Maldives Tropical Overwater Bungalows) - Crossed Layer */}
            <div 
              onClick={() => handlePlanClick('Maldives')}
              className="absolute bottom-2 right-4 w-3/5 aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition duration-500 z-20 cursor-pointer group"
            >
              <img
                src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80"
                alt="Maldives Tropical"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white text-xs font-bold">Maldives • Plan Trip &rarr;</p>
              </div>
            </div>

            {/* Floating Glass Rating Pill */}
            <div className="absolute top-1/2 right-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 z-30 flex items-center gap-2 pointer-events-none">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">4.9 / 5.0 Rating</p>
                <p className="text-[10px] text-slate-400">10,000+ AI Trips Planned</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
        <p>© 2026 AI Travel Copilot Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button onClick={() => handleNavClick('/dashboard')} className="hover:text-blue-600 font-medium">Dashboard</button>
          <button onClick={() => handleNavClick('/assistant')} className="hover:text-blue-600 font-medium">AI Chatbot</button>
          <button onClick={() => handleNavClick('/flights')} className="hover:text-blue-600 font-medium">Flight Fares</button>
        </div>
      </footer>
    </div>
  );
};
