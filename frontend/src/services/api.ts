import axios from 'axios';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically obtain latest Supabase session token or stored token and inject into all outgoing requests
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('travel_copilot_token');
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        token = data.session.access_token;
      }
    } catch {
      // Fall back to stored token
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const travelApi = {
  // Auth
  register: (payload: { name: string; email: string; password: string; travel_style?: string }) =>
    api.post('/auth/register', payload),
  login: (payload: { email: string; password: string }) => 
    api.post('/auth/login', payload),
  getProfile: (email?: string) => 
    api.get(email ? `/auth/me?email=${email}` : '/auth/me'),

  // Dashboard Dynamic Metrics
  getDashboardStats: () => api.get('/dashboard/stats'),

  // Bookings Tracker
  getBookings: () => api.get('/bookings'),
  createBooking: (payload: {
    booking_type: string;
    item_name: string;
    destination: string;
    amount_inr: number;
    details?: string;
    trip_id?: number;
    booking_date?: string;
    reference_code?: string;
  }) => api.post('/bookings', payload),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),

  // Trips & Itineraries
  getTrips: () => api.get('/trips'),
  getTripById: (id: number | string) => api.get(`/trips/${id}`),
  planTrip: (payload: any) => api.post('/trips/plan', payload),
  deleteTrip: (id: number) => api.delete(`/trips/${id}`),

  // Destinations & Featured
  getFeaturedDestinations: () => api.get('/destinations/featured'),
  getDestinations: (params?: any) => api.get('/destinations', { params }),
  resolveDestination: (query: string) => api.get('/destinations/resolve', { params: { query } }),
  getPlaces: (query: string, offset = 0, limit = 30) => api.get('/destinations/places', { params: { query, offset, limit } }),
  getEmergencyContacts: (query: string) => api.get('/destinations/emergency', { params: { query } }),
  getPricingInsights: (destination: string, basePrice = 7500) => api.get('/destinations/pricing-insights', { params: { destination, base_price: basePrice } }),
  getRecommendations: (params?: any) => api.get('/recommendations', { params }),

  // Hotels
  getHotels: (params?: any) => api.get('/hotels', { params }),

  // Flights
  searchFlights: (paramsOrSource: { source: string; destination: string; departureDate: string; returnDate?: string; adults?: number; cabin?: string } | string, legacyDestination?: string) => {
    const params = typeof paramsOrSource === 'string'
      ? { source: paramsOrSource, destination: legacyDestination || '', departureDate: new Date().toISOString().slice(0, 10), adults: 1, cabin: 'ECONOMY' }
      : paramsOrSource;
    return api.get('/flights/search', {
      params: {
        source_city: params.source,
        destination_city: params.destination,
        departure_date: params.departureDate,
        return_date: params.returnDate || undefined,
        adults: params.adults || 1,
        cabin: params.cabin || 'ECONOMY'
      }
    });
  },
  predictFlight: (payload: any) => api.post('/flights/predict', payload),

  // Budget & Expenses
  optimizeBudget: (payload: any) => api.post('/budget/optimize', payload),
  getExpenses: () => api.get('/budget/expenses'),
  addExpense: (payload: any) => api.post('/budget/expenses', payload),
  deleteExpense: (id: number) => api.delete(`/budget/expenses/${id}`),

  // Disruptions
  getDisruptions: (destination?: string) => 
    api.get(destination ? `/disruptions?destination=${encodeURIComponent(destination)}` : '/disruptions'),
  checkFlightStatus: (flightNumber: string) => api.get(`/disruptions/check-flight?flight_number=${flightNumber}`),
  simulateRebooking: (flightNumber = "6E-204", destination = "Goa") => 
    api.post(`/disruptions/rebook-simulation?flight_number=${encodeURIComponent(flightNumber)}&destination=${encodeURIComponent(destination)}`),

  // Chat Copilot
  sendMessage: (message: string, context?: any, language?: string) => api.post('/chat', { message, context, language }),

  // Weather
  getWeather: (destination = "Dubai") => api.get(`/weather?destination=${encodeURIComponent(destination)}`),
};
