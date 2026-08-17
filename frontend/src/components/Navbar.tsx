import React, { useState } from 'react';
import { Bell, Search, LogOut, UserCircle2, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAnonymous, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const displayName = user ? user.name.split(' ')[0] : 'Traveler';
  const headerTitle = title || (isAuthenticated && user ? `Hello, ${displayName}` : `Welcome to ${APP_CONFIG.shortName}`);
  const headerSubtitle = subtitle || APP_CONFIG.tagline;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'T';

  return (
    <header className="h-20 bg-[#fffefb]/80 backdrop-blur-xl border-b border-[#e3d6c1]/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Brand & Page Info */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#c25e38] text-[#fffefb] flex items-center justify-center shadow-md shadow-[#c25e38]/20 group-hover:scale-105 transition">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden lg:block">
            <span className="font-extrabold text-sm text-[#221c17] tracking-tight block font-serif leading-none">
              {APP_CONFIG.name}
            </span>
            <span className="text-[10px] text-[#998c7e] font-semibold tracking-wider uppercase font-mono">
              Travel Copilot
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#e3d6c1] hidden lg:block mx-1" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#221c17] tracking-tight font-serif">
              {headerTitle}
            </h1>
            {isAnonymous && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#faeee7] text-[#c25e38] text-[10px] font-bold border border-[#c25e38]/20">
                <Sparkles className="w-3 h-3 text-[#c25e38]" />
                Demo Session
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-[#695e52] line-clamp-1">{headerSubtitle}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Liquid Glass Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#998c7e] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search world destinations..."
              className="pl-9 pr-4 py-2 w-64 rounded-full liquid-glass-pill text-xs font-semibold text-[#221c17] placeholder:text-[#998c7e] outline-none focus:ring-2 focus:ring-[#c25e38]/30 transition"
            />
          </div>
        </form>

        {/* Disruptions & Radar */}
        <button 
          onClick={() => navigate('/disruptions')}
          className="w-10 h-10 rounded-full border border-[#e3d6c1] bg-[#fffefb]/90 flex items-center justify-center text-[#695e52] hover:text-[#221c17] hover:bg-[#f5eee2] transition relative shadow-xs"
          title="Disruption Radar & Alerts"
          aria-label="Disruption Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#c25e38] absolute top-2.5 right-2.5 animate-pulse" />
        </button>

        {/* User Profile */}
        {isAuthenticated && user ? (
          <div className="relative">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 pl-1 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c25e38] to-[#c88842] text-white font-bold text-sm flex items-center justify-center shadow-sm group-hover:ring-2 group-hover:ring-[#c25e38]/40 transition">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#221c17] leading-tight font-serif">{user.name}</p>
                <p className="text-[10px] text-[#998c7e] font-semibold">{user.travel_style || "Explorer"}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-[#fffefb] rounded-2xl border border-[#e3d6c1] shadow-2xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2.5 border-b border-[#e3d6c1]/60">
                  <p className="font-bold text-[#221c17] truncate font-serif">{user.name}</p>
                  <p className="text-[#998c7e] truncate text-[11px]">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="w-full px-4 py-2 text-left text-[#695e52] hover:bg-[#f5eee2] hover:text-[#221c17] flex items-center gap-2.5 font-medium transition"
                >
                  <UserCircle2 className="w-4 h-4 text-[#998c7e]" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[#c2410c] hover:bg-[#faeee7] flex items-center gap-2.5 font-medium border-t border-[#e3d6c1]/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
