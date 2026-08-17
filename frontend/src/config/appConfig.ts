/**
 * Central Brand Configuration
 * Single source of truth for application branding and metadata.
 */
export const APP_CONFIG = {
  name: "AI Travel Copilot",
  shortName: "Travel Copilot",
  tagline: "Autonomous Worldwide Travel & Route Intelligence",
  description: "Next-generation AI travel planner with real-time flight and hotel intelligence, interactive TSP day planning, and smart budget optimization.",
  author: "Darla Rahul",
  version: "2.0.0",
  supportEmail: "contact@travelcopilot.ai",
  defaultCurrency: "INR",
  currencySymbol: "₹",
  defaultTravelStyle: "Balanced",
  navItems: [
    { name: 'Home', path: '/dashboard', label: 'Dashboard' },
    { name: 'Plan Trip', path: '/plan-trip', label: 'Planner' },
    { name: 'Itinerary', path: '/itinerary/1', label: 'Itinerary' },
    { name: 'Hotels', path: '/hotels', label: 'Hotels' },
    { name: 'Flights', path: '/flights', label: 'Flights' },
    { name: 'Explore', path: '/explore', label: 'Explore' },
    { name: 'Assistant', path: '/assistant', label: 'AI Assistant' },
    { name: 'Budget', path: '/budget', label: 'Budget' },
    { name: 'Disruptions', path: '/disruptions', label: 'Disruptions' },
    { name: 'Weather', path: '/weather', label: 'Weather' },
    { name: 'Profile', path: '/profile', label: 'Profile' },
  ]
};

export default APP_CONFIG;
