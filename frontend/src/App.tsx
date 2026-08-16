import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { ExplorePage } from './pages/ExplorePage';
import { HotelsPage } from './pages/HotelsPage';
import { FlightsPage } from './pages/FlightsPage';
import { BudgetPage } from './pages/BudgetPage';
import { DisruptionsPage } from './pages/DisruptionsPage';
import { WeatherPage } from './pages/WeatherPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Require Sign In / Account) */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
          />
          <Route 
            path="/plan-trip" 
            element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} 
          />
          <Route 
            path="/assistant" 
            element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} 
          />
          <Route 
            path="/itinerary/:id" 
            element={<ProtectedRoute><ItineraryPage /></ProtectedRoute>} 
          />
          <Route 
            path="/explore" 
            element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} 
          />
          <Route 
            path="/hotels" 
            element={<ProtectedRoute><HotelsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/flights" 
            element={<ProtectedRoute><FlightsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/budget" 
            element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} 
          />
          <Route 
            path="/disruptions" 
            element={<ProtectedRoute><DisruptionsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/weather" 
            element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />

          {/* Fallback to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
