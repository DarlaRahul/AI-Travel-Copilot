import React, { useState } from 'react';
import { Bell, Search, LogOut, UserCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const displayName = user ? user.name.split(' ')[0] : 'Guest';
  const headerTitle = title || (isAuthenticated && user ? `Hello, ${displayName} 👋` : "Welcome to Travel Copilot 👋");
  const headerSubtitle = subtitle || "Where would you like to explore today?";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{headerTitle}</h2>
        <p className="text-xs font-medium text-slate-500">{headerSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div 
          onClick={() => navigate('/explore')}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/80 hover:bg-slate-100 rounded-xl text-xs text-slate-500 cursor-pointer transition w-56 font-medium"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search destinations...</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/disruptions')}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative"
          title="Disruption Radar & Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2.5 right-2.5 animate-pulse" />
        </button>

        {/* User Profile / Auth State */}
        {isAuthenticated && user ? (
          <div className="relative">
            <div 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-2 cursor-pointer group"
            >
              {/* Clean Professional Monogram Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-blue-500/20 transition">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-400 font-medium">{user.travel_style || "Explorer"}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <UserCircle2 className="w-4 h-4 text-slate-400" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-slate-100"
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
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
