import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plane, Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Compass, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setError(null);
    setIsExistingAccount(false);
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, travelStyle);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error("Registration error:", err);
      const detail = err.message || err.response?.data?.detail || "Registration failed. Please try a different email.";
      setError(detail);
      if (typeof detail === 'string' && (detail.toLowerCase().includes("already exists") || detail.toLowerCase().includes("log in") || detail.toLowerCase().includes("sign in"))) {
        setIsExistingAccount(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between text-[#221c17] selection:bg-[#c25e38] selection:text-white">
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c25e38] to-[#c88842] flex items-center justify-center text-white shadow-md shadow-[#c25e38]/20 group-hover:scale-105 transition duration-200">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#221c17] leading-tight font-serif">{APP_CONFIG.name}</h1>
            <p className="text-[10px] font-bold text-[#c25e38] uppercase tracking-wider font-mono">{APP_CONFIG.tagline.split(' ')[0]} Travel</p>
          </div>
        </Link>

        <div className="text-xs font-medium text-[#695e52]">
          Already have an account?{' '}
          <Link to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-[#c25e38] font-bold hover:underline font-serif">
            Sign In
          </Link>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fffefb] rounded-3xl border border-[#e3d6c1] shadow-xl shadow-[#221c17]/5 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faeee7] text-[#c25e38] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#c88842]" />
              <span>Create Your Travel Profile</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#221c17] tracking-tight font-serif">Create an Account</h2>
            <p className="text-xs text-[#695e52] font-medium">
              Start planning smarter with autonomous AI itineraries and budget optimization.
            </p>
          </div>

          {/* Error Message with 1-Click Action */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>

              {isExistingAccount && (
                <button
                  type="button"
                  onClick={() => navigate(`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}
                  className="w-full mt-2 py-2 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-serif"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to Existing Account</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Darla"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition font-serif"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition font-mono"
                />
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 chars"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Travel Style Preference */}
            <div>
              <label className="block font-bold text-[#695e52] uppercase tracking-wider mb-1.5 font-mono">
                Default Travel Style
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                  <Compass className="w-4 h-4" />
                </div>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition"
                >
                  <option value="Balanced">Balanced (Mix of Sights & Relaxation)</option>
                  <option value="Relaxed">Relaxed (Slow Travel / Leisure)</option>
                  <option value="Packed">Packed (High-Energy Sightseeing)</option>
                  <option value="Luxury">Luxury (5-Star Heritage & Fine Dining)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#c25e38] hover:bg-[#a84c29] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#c25e38]/25 transition flex items-center justify-center gap-2 mt-2 font-serif"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-[#695e52] font-medium">
            Already have an account?{' '}
            <Link to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-[#c25e38] font-bold hover:underline font-serif">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-[#998c7e] font-mono">
        © 2026 {APP_CONFIG.name} • Created by {APP_CONFIG.author}
      </footer>
    </div>
  );
};
