import React, { useState, useEffect } from 'react';
import { 
  UserCircle2, 
  Save, 
  Sparkles, 
  Compass, 
  DollarSign, 
  ShieldCheck,
  CheckCircle2,
  User
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || 'Chandu');
  const [email, setEmail] = useState(user?.email || 'chandu@example.com');
  const [travelStyle, setTravelStyle] = useState(user?.travel_style || 'Balanced');
  const [currency, setCurrency] = useState(user?.preferred_currency || 'INR');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setTravelStyle(user.travel_style);
      setCurrency(user.preferred_currency || 'INR');
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      travel_style: travelStyle,
      preferred_currency: currency
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Account Profile & Travel Persona" 
          subtitle="Customize AI planner behavior, currency preferences, and personal style" 
        />

        <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-5">
              {/* Clean Professional Monogram Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {userInitial}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                <p className="text-xs text-slate-500 font-medium">{email} • Verified Account</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Copilot Authenticated Session</span>
                </div>
              </div>
            </div>

            {saved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Travel Preferences Successfully Saved!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Primary Travel Style</label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="Balanced">Balanced (Mix of Sights & Rest)</option>
                    <option value="Relaxed">Relaxed (Leisure / Slow Travel)</option>
                    <option value="Packed">Packed (High-Energy Itinerary)</option>
                    <option value="Luxury">Luxury (5-Star Heritage & Resorts)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
