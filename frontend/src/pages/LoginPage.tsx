import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signInDemo } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error("Login error:", err);
      const detail = err.message || err.response?.data?.detail || "Invalid email or password. Please check your credentials.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInDemo();
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Demo authentication failed. Please try again.");
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
          New to {APP_CONFIG.shortName}?{' '}
          <Link to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-[#c25e38] font-bold hover:underline font-serif">
            Create an account
          </Link>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fffefb] rounded-3xl border border-[#e3d6c1] shadow-xl shadow-[#221c17]/5 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faeee7] text-[#c25e38] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#c88842]" />
              <span>Supabase Cloud Auth</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#221c17] tracking-tight font-serif">Sign In to Continue</h2>
            <p className="text-xs text-[#695e52] font-medium">
              Access your personalized travel journals, live flight updates, and hotel stays.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-[#695e52] uppercase tracking-wider font-mono">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#998c7e]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e3d6c1] focus:border-[#c25e38] text-[#221c17] font-medium bg-[#f5eee2]/40 outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#998c7e] hover:text-[#221c17]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c25e38] border-[#e3d6c1] focus:ring-[#c25e38]"
                />
                <span className="text-[#695e52] font-medium">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#c25e38] hover:bg-[#a84c29] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#c25e38]/25 transition flex items-center justify-center gap-2 font-serif"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#e3d6c1]"></div>
            <span className="flex-shrink mx-3 text-[#998c7e] text-[10px] font-bold uppercase tracking-wider font-mono">Or</span>
            <div className="flex-grow border-t border-[#e3d6c1]"></div>
          </div>

          {/* 1-Click Anonymous Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-full border border-[#3b7a57]/30 bg-[#eef7f2] hover:bg-[#e2f2e9] text-[#3b7a57] font-bold text-xs shadow-2xs transition flex items-center justify-center gap-2 font-mono"
          >
            <Play className="w-3.5 h-3.5 fill-[#3b7a57] text-[#3b7a57]" />
            <span>1-Click Instant Demo Experience (Traveler)</span>
          </button>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-[#695e52] font-medium">
            Don't have an account?{' '}
            <Link to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-[#c25e38] font-bold hover:underline font-serif">
              Sign up for free
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
