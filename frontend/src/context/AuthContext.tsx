import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { travelApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, travel_style?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('travel_copilot_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('travel_copilot_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists, fetch active profile
    if (token) {
      travelApi.getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('travel_copilot_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await travelApi.login({ email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('travel_copilot_token', access_token);
    localStorage.setItem('travel_copilot_user', JSON.stringify(loggedUser));
  };

  const register = async (name: string, email: string, password: string, travel_style = "Balanced") => {
    const res = await travelApi.register({ name, email, password, travel_style });
    const { access_token, user: registeredUser } = res.data;
    setToken(access_token);
    setUser(registeredUser);
    localStorage.setItem('travel_copilot_token', access_token);
    localStorage.setItem('travel_copilot_user', JSON.stringify(registeredUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('travel_copilot_token');
    localStorage.removeItem('travel_copilot_user');
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem('travel_copilot_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
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
