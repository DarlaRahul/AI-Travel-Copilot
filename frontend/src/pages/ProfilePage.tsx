import React, { useState, useEffect } from 'react';
import { 
  Save, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { FloatingDock } from '../components/ui/floating-dock';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isAnonymous } = useAuth();

  const [name, setName] = useState(user?.name || 'Traveler');
  const [email, setEmail] = useState(user?.email || '');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name,
      travel_style: travelStyle,
      preferred_currency: currency
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'T';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Voyager Passport & Profile" 
        subtitle="Customize AI planner behavior, currency preferences, and personal travel persona" 
      />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6 pb-36">
        <div className="bg-[#fffefb] p-6 sm:p-8 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
          <div className="flex items-center gap-5 border-b border-[#e3d6c1]/60 pb-6">
            {/* Monogram Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#c25e38] to-[#c88842] text-white font-extrabold text-2xl flex items-center justify-center shadow-md font-serif">
              {userInitial}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#221c17] font-serif">{name}</h3>
              <p className="text-xs text-[#695e52] font-medium font-mono">
                {isAnonymous ? 'Anonymous Demo Session' : email} • Active Voyager
              </p>
              <div className={`flex items-center gap-1.5 text-xs font-bold mt-1 font-mono ${isSupabaseConfigured ? 'text-[#3b7a57]' : 'text-[#8b7355]'}`}>
                <ShieldCheck className="w-4 h-4" />
                <span>{isSupabaseConfigured ? 'Supabase Cloud Session' : 'Local Workspace Session'}</span>
              </div>
            </div>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-[#eef7f2] border border-[#3b7a57]/30 text-[#3b7a57] text-xs font-bold flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Travel Preferences Successfully Saved!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#695e52] uppercase mb-1.5 font-mono">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e3d6c1] bg-[#f5eee2]/50 text-[#221c17] font-medium outline-none focus:border-[#c25e38] transition font-serif text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-[#695e52] uppercase mb-1.5 font-mono">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 rounded-2xl border border-[#e3d6c1] bg-[#f5eee2]/30 text-[#998c7e] font-mono cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#695e52] uppercase mb-1.5 font-mono">Primary Travel Style</label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#e3d6c1] bg-[#f5eee2]/50 text-[#221c17] font-medium outline-none focus:border-[#c25e38] transition"
                >
                  <option value="Balanced">Balanced (Mix of Sights & Rest)</option>
                  <option value="Relaxed">Relaxed (Leisure / Slow Travel)</option>
                  <option value="Packed">Packed (High-Energy Itinerary)</option>
                  <option value="Luxury">Luxury (5-Star Heritage & Suites)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#695e52] uppercase mb-1.5 font-mono">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#e3d6c1] bg-[#f5eee2]/50 text-[#221c17] font-medium outline-none focus:border-[#c25e38] transition"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-3 px-8 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold shadow-md shadow-[#c25e38]/20 transition flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
