import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import { QuordixHero } from '../components/ui/quordix-hero';
import { CoverflowCarousel, CoverflowItem } from '../components/ui/coverflow-carousel';
import { WorldExplorerMap } from '../components/WorldExplorerMap';

export const LandingPage: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState('Dubai');
  const navigate = useNavigate();
  const { user, isAuthenticated, signInDemo, isLoading } = useAuth();

  const handlePlanClick = (destinationName?: string) => {
    const dest = destinationName || selectedDestination || 'Dubai';
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/planner?dest=${encodeURIComponent(dest)}`)}`);
    } else {
      navigate(`/planner?dest=${encodeURIComponent(dest)}`);
    }
  };

  const handleDemoClick = async () => {
    try {
      await signInDemo();
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    }
  };

  const handleNavClick = (path: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      navigate(path);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

  const destinationItems: CoverflowItem[] = [
    {
      id: '1',
      title: 'Dubai',
      subtitle: 'Luxury Architecture & Desert Safaris',
      country: 'United Arab Emirates',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
      rating: 4.9,
      badge: 'Luxury',
      cost: '₹48,000 avg'
    },
    {
      id: '2',
      title: 'Paris',
      subtitle: 'Art, Heritage & Haute Cuisine',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      rating: 4.8,
      badge: 'Heritage',
      cost: '₹55,000 avg'
    },
    {
      id: '3',
      title: 'Tokyo',
      subtitle: 'Futuristic Metropolises & Ancient Temples',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
      rating: 4.9,
      badge: 'Culture',
      cost: '₹62,000 avg'
    },
    {
      id: '4',
      title: 'Hyderabad',
      subtitle: 'Historic Fortresses, Palaces & Biryani',
      country: 'India',
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&q=80',
      rating: 4.7,
      badge: 'Historic',
      cost: '₹22,000 avg'
    },
    {
      id: '5',
      title: 'Bali',
      subtitle: 'Tropical Beaches, Waterfalls & Spiritual Retreats',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
      rating: 4.8,
      badge: 'Nature',
      cost: '₹35,000 avg'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col justify-between selection:bg-[#c25e38] selection:text-white">
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-20">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c25e38] to-[#c88842] flex items-center justify-center text-white shadow-md shadow-[#c25e38]/20 group-hover:scale-105 transition duration-200">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#221c17] leading-tight font-serif">{APP_CONFIG.name}</h1>
            <p className="text-[10px] font-bold text-[#c25e38] uppercase tracking-wider font-mono">{APP_CONFIG.tagline.split(' ')[0]} Travel</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#695e52]">
          <button onClick={() => handleNavClick('/dashboard')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">Dashboard</button>
          <button onClick={() => handleNavClick('/planner')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">Trip Planner</button>
          <button onClick={() => handleNavClick('/explore')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">Explore</button>
          <button onClick={() => handleNavClick('/flights')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">Flights</button>
          <button onClick={() => handleNavClick('/hotels')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">Hotels</button>
          <button onClick={() => handleNavClick('/assistant')} className="hover:text-[#c25e38] transition font-mono cursor-pointer">AI Copilot</button>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <button
              onClick={handleDemoClick}
              disabled={isLoading}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5eee2] hover:bg-[#eae0cf] text-[#221c17] font-semibold text-xs transition border border-[#e3d6c1] shadow-2xs font-mono cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#c25e38] text-[#c25e38]" />
              <span>Explore Demo</span>
            </button>
          )}

          {isAuthenticated && user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-full bg-[#221c17] hover:bg-[#3a2e24] text-white font-medium text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#c25e38] text-white font-bold text-[10px] flex items-center justify-center font-mono">
                {userInitial}
              </div>
              <span className="font-serif">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-semibold text-xs shadow-md shadow-[#c25e38]/25 transition font-serif cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-12">
        {/* 1. 21st.dev Quordix Travel Hero */}
        <QuordixHero
          initialQuery={selectedDestination}
          onSearch={(dest) => {
            setSelectedDestination(dest);
            navigate(`/dashboard?dest=${encodeURIComponent(dest)}`);
          }}
          onPlanTrip={() => handlePlanClick()}
        />

        {/* 2. DISCOVER DESTINATIONS — 3D Coverflow */}
        <section className="space-y-4">
          <div className="text-center space-y-1 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
              Curated World Getaways
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221c17] font-serif">
              Discover Your Next Destination
            </h2>
            <p className="text-xs sm:text-sm text-[#695e52]">
              Swipe through handpicked destinations and plan your journey with algorithmic route precision.
            </p>
          </div>

          <CoverflowCarousel
            items={destinationItems}
            onSelect={(item) => setSelectedDestination(item.title)}
          />
        </section>

        {/* 3. WORLD EXPLORER MAP PREVIEW */}
        <section className="space-y-4">
          <WorldExplorerMap
            initialDestination={selectedDestination}
            zoom={12}
            onDestinationChange={(dest) => setSelectedDestination(dest)}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-[#e3d6c1]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#695e52] gap-4">
        <p>© 2026 {APP_CONFIG.name}. Created by {APP_CONFIG.author}.</p>
        <div className="flex items-center gap-6 font-mono text-xs">
          <button onClick={() => handleNavClick('/dashboard')} className="hover:text-[#c25e38] font-medium cursor-pointer">Dashboard</button>
          <button onClick={() => handleNavClick('/planner')} className="hover:text-[#c25e38] font-medium cursor-pointer">Trip Planner</button>
          <button onClick={() => handleNavClick('/flights')} className="hover:text-[#c25e38] font-medium cursor-pointer">Flights</button>
          <button onClick={() => handleNavClick('/hotels')} className="hover:text-[#c25e38] font-medium cursor-pointer">Hotels</button>
        </div>
      </footer>
    </div>
  );
};
