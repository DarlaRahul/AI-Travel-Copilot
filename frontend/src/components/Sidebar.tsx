import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  CalendarDays, 
  Building2, 
  Globe2, 
  Bot, 
  CloudSun, 
  Wallet, 
  UserCircle2, 
  Settings, 
  LogOut,
  Plane,
  AlertTriangle,
  LogIn,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Plan Trip', path: '/plan-trip', icon: Compass },
    { name: 'Itinerary', path: '/itinerary/1', icon: CalendarDays },
    { name: 'Bookings', path: '/hotels', icon: Building2 },
    { name: 'Flights', path: '/flights', icon: Plane },
    { name: 'Explore', path: '/explore', icon: Globe2 },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Disruptions', path: '/disruptions', icon: AlertTriangle },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'Budget', path: '/budget', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
  ];

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between py-6 px-4 shrink-0 shadow-xs">
      <div>
        {/* Brand Logo - Clean Professional Identity */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 mb-8 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">Travel AI</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Copilot</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Professional Clean User Info & Auth Action */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        {isAuthenticated && user ? (
          <>
            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/80 transition"
            >
              {/* Clean Professional Monogram Badge */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-3.5 py-2 w-full rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 w-full rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};
