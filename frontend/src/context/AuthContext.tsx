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
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const authUser = data.session.user;
          const isAnon = Boolean(authUser.is_anonymous || !authUser.email);
          setIsAnonymous(isAnon);
          setToken(data.session.access_token);
          
          // Map to local application User model
          const mappedUser: User = {
            id: typeof authUser.id === 'string' ? 1 : authUser.id,
            name: authUser.user_metadata?.display_name || (isAnon ? 'Traveler' : (authUser.email?.split('@')[0] || 'Traveler')),
            email: authUser.email || 'traveler@travelcopilot.ai',
            travel_style: authUser.user_metadata?.travel_style || APP_CONFIG.defaultTravelStyle,
            preferred_currency: authUser.user_metadata?.preferred_currency || APP_CONFIG.defaultCurrency,
            created_at: authUser.created_at || new Date().toISOString()
          };

          setUser(mappedUser);
          localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
          localStorage.setItem('travel_copilot_token', data.session.access_token);
          localStorage.setItem('travel_copilot_is_anon', String(isAnon));
        }
      } catch (err) {
        console.error('Supabase session load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const authUser = session.user;
        const isAnon = Boolean(authUser.is_anonymous || !authUser.email);
        setIsAnonymous(isAnon);
        setToken(session.access_token);

        const mappedUser: User = {
          id: 1,
          name: authUser.user_metadata?.display_name || (isAnon ? 'Traveler' : (authUser.email?.split('@')[0] || 'Traveler')),
          email: authUser.email || 'traveler@travelcopilot.ai',
          travel_style: authUser.user_metadata?.travel_style || APP_CONFIG.defaultTravelStyle,
          preferred_currency: authUser.user_metadata?.preferred_currency || APP_CONFIG.defaultCurrency,
          created_at: authUser.created_at || new Date().toISOString()
        };

        setUser(mappedUser);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', session.access_token);
        localStorage.setItem('travel_copilot_is_anon', String(isAnon));
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Standard Supabase Email Login
  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const mappedUser: User = {
          id: 1,
          name: data.user.user_metadata?.display_name || email.split('@')[0],
          email: data.user.email || email,
          travel_style: data.user.user_metadata?.travel_style || 'Balanced',
          preferred_currency: 'INR',
          created_at: data.user.created_at || new Date().toISOString()
        };
        setUser(mappedUser);
        setToken(data.session?.access_token || 'token');
        setIsAnonymous(false);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', data.session?.access_token || 'token');
        localStorage.setItem('travel_copilot_is_anon', 'false');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Supabase Sign Up
  const register = async (name: string, email: string, password = 'password123', travel_style = "Balanced") => {
    setIsLoading(true);
    try {
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
          id: 1,
          name: name,
          email: email,
          travel_style: travel_style,
          preferred_currency: 'INR',
          created_at: data.user.created_at || new Date().toISOString()
        };
        setUser(mappedUser);
        setToken(data.session?.access_token || 'token');
        setIsAnonymous(false);
        localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
        localStorage.setItem('travel_copilot_token', data.session?.access_token || 'token');
        localStorage.setItem('travel_copilot_is_anon', 'false');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Anonymous Demo Authentication (Enters Real App Instantly)
  const signInDemo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Anonymous auth note (fallback applied):', error.message);
      }

      const anonUser = data?.user || {
        id: `anon_${Date.now()}`,
        email: null,
        is_anonymous: true,
        user_metadata: { display_name: 'Traveler', travel_style: 'Balanced', preferred_currency: 'INR' }
      };

      const mappedUser: User = {
        id: 1,
        name: 'Traveler',
        email: 'traveler@travelcopilot.ai',
        travel_style: 'Balanced',
        preferred_currency: 'INR',
        created_at: new Date().toISOString()
      };

      setUser(mappedUser);
      setToken(data?.session?.access_token || 'anon_session_token');
      setIsAnonymous(true);
      localStorage.setItem('travel_copilot_user', JSON.stringify(mappedUser));
      localStorage.setItem('travel_copilot_token', data?.session?.access_token || 'anon_session_token');
      localStorage.setItem('travel_copilot_is_anon', 'true');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
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

      // Sync with Supabase profile table if configured
      try {
        if (isSupabaseConfigured) {
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
