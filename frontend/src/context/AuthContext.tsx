import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { APP_CONFIG } from '../config/appConfig';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string, travel_style?: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('travel_copilot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('travel_copilot_token');
  });
  const [isAnonymous, setIsAnonymous] = useState<boolean>(() => {
    return localStorage.getItem('travel_copilot_is_anon') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and listen for Supabase auth state changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase session load error:', error);
        }

        if (data.session?.user) {
          const authUser = data.session.user;
          const isAnon = Boolean(authUser.is_anonymous || !authUser.email);
          setIsAnonymous(isAnon);
          setToken(data.session.access_token);
          
          const displayName = authUser.user_metadata?.display_name || 
            (isAnon ? 'Guest Traveler' : (authUser.email?.split('@')[0] || 'Traveler'));

          const mappedUser: User = {
            id: authUser.id,
            name: displayName,
            email: authUser.email || (isAnon ? 'anonymous@travelcopilot.ai' : ''),
            travel_style: authUser.user_metadata?.travel_style || APP_CONFIG.defaultTravelStyle,
            preferred_currency: authUser.user_metadata?.preferred_currency || APP_CONFIG.defaultCurrency,
            created_at: authUser.created_at || new Date().toISOString()
          };

          setUser(mappedUser);
          localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
          localStorage.setItem('travel_copilot_token', data.session.access_token);
          localStorage.setItem('travel_copilot_is_anon', String(isAnon));
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('travel_copilot_user');
          localStorage.removeItem('travel_copilot_token');
          localStorage.removeItem('travel_copilot_is_anon');
        }
      } catch (err) {
        console.error('Supabase auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const authUser = session.user;
          const isAnon = Boolean(authUser.is_anonymous || !authUser.email);
          setIsAnonymous(isAnon);
          setToken(session.access_token);

          const displayName = authUser.user_metadata?.display_name || 
            (isAnon ? 'Guest Traveler' : (authUser.email?.split('@')[0] || 'Traveler'));

          const mappedUser: User = {
            id: authUser.id,
            name: displayName,
            email: authUser.email || (isAnon ? 'anonymous@travelcopilot.ai' : ''),
            travel_style: authUser.user_metadata?.travel_style || APP_CONFIG.defaultTravelStyle,
            preferred_currency: authUser.user_metadata?.preferred_currency || APP_CONFIG.defaultCurrency,
            created_at: authUser.created_at || new Date().toISOString()
          };

          setUser(mappedUser);
          localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
          localStorage.setItem('travel_copilot_token', session.access_token);
          localStorage.setItem('travel_copilot_is_anon', String(isAnon));
        } else {
          setUser(null);
          setToken(null);
          setIsAnonymous(false);
          localStorage.removeItem('travel_copilot_user');
          localStorage.removeItem('travel_copilot_token');
          localStorage.removeItem('travel_copilot_is_anon');
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe?.();
      };
    }
  }, []);

  // Standard Email Login
  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        const mappedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.display_name || email.split('@')[0],
          email: data.user.email || email,
          travel_style: data.user.user_metadata?.travel_style || 'Balanced',
          preferred_currency: data.user.user_metadata?.preferred_currency || 'INR',
          created_at: data.user.created_at || new Date().toISOString()
        };
        setUser(mappedUser);
        setToken(data.session.access_token);
        setIsAnonymous(false);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', data.session.access_token);
        localStorage.setItem('travel_copilot_is_anon', 'false');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Sign Up
  const register = async (name: string, email: string, password = 'password123', travel_style = "Balanced") => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            travel_style: travel_style,
            preferred_currency: 'INR'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const mappedUser: User = {
          id: data.user.id,
          name: name,
          email: email,
          travel_style: travel_style,
          preferred_currency: 'INR',
          created_at: data.user.created_at || new Date().toISOString()
        };
        setUser(mappedUser);
        const accessToken = data.session?.access_token || 'pending_confirmation';
        setToken(accessToken);
        setIsAnonymous(false);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', accessToken);
        localStorage.setItem('travel_copilot_is_anon', 'false');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Anonymous Demo Authentication with Real Supabase Anonymous Auth
  const signInDemo = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      }

      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            display_name: 'Guest Traveler',
            travel_style: 'Balanced',
            preferred_currency: 'INR'
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user && data?.session) {
        const mappedUser: User = {
          id: data.user.id,
          name: 'Guest Traveler',
          email: 'anonymous@travelcopilot.ai',
          travel_style: 'Balanced',
          preferred_currency: 'INR',
          created_at: data.user.created_at || new Date().toISOString()
        };

        setUser(mappedUser);
        setToken(data.session.access_token);
        setIsAnonymous(true);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', data.session.access_token);
        localStorage.setItem('travel_copilot_is_anon', 'true');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignored
    }
    setToken(null);
    setUser(null);
    setIsAnonymous(false);
    localStorage.removeItem('travel_copilot_token');
    localStorage.removeItem('travel_copilot_user');
    localStorage.removeItem('travel_copilot_is_anon');
  };

  // Update Profile
  const updateUser = async (updatedUser: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem('travel_copilot_user', JSON.stringify(merged));

      // Sync with Supabase profile table & auth metadata
      try {
        if (isSupabaseConfigured && supabase) {
          await supabase.auth.updateUser({
            data: {
              display_name: merged.name,
              travel_style: merged.travel_style,
              preferred_currency: merged.preferred_currency
            }
          });

          const { data: sess } = await supabase.auth.getSession();
          if (sess.session?.user?.id) {
            await supabase.from('profiles').upsert({
              id: sess.session.user.id,
              display_name: merged.name,
              travel_style: merged.travel_style,
              preferred_currency: merged.preferred_currency,
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.warn('Profile sync note:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAnonymous,
        isLoading,
        login,
        register,
        signInDemo,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
