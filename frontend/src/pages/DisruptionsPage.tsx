import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Plane, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  CheckCircle2,
  Bell,
  Sparkles,
  MapPin,
  Search
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { DisruptionAlert } from '../types';

export const DisruptionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDest = searchParams.get('destination') || localStorage.getItem('travel_copilot_active_destination') || 'All';

  const [destination, setDestination] = useState(initialDest);
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>([]);
  const [rebookingStatus, setRebookingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cityOptions = ['All', 'Manali', 'Goa', 'Paris', 'Switzerland', 'Jaipur', 'Ladakh', 'Kerala', 'Japan', 'Bali', 'Dubai'];

  const fetchDisruptions = (destQuery?: string) => {
    setLoading(true);
    const d = destQuery !== undefined ? destQuery : destination;
    travelApi.getDisruptions(d === 'All' ? undefined : d)
      .then(res => setDisruptions(res.data))
      .catch(err => console.error("Disruptions fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisruptions(destination);
  }, [destination]);

  const handleSelectCity = (c: string) => {
    setDestination(c);
    setSearchParams(c === 'All' ? {} : { destination: c });
    localStorage.setItem('travel_copilot_active_destination', c === 'All' ? '' : c);
  };

  const handleSimulateRebooking = async (fn: string) => {
    try {
      const res = await travelApi.simulateRebooking(fn, destination);
      setRebookingStatus(res.data.rebooking_action_taken);
      setTimeout(() => setRebookingStatus(null), 6000);
    } catch (err) {
      console.error("Rebooking error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Travel Disruption & Rebooking Center" 
          subtitle="Real-time flight delays, weather clash detection, and autonomous itinerary rescheduling" 
        />

        <main className="p-8 max-w-7xl w-full space-y-6">
          {/* Active Filter Notice */}
          {destination && destination !== 'All' && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Monitoring live disruption radar & transit feeds for <strong>{destination}</strong></span>
              </div>
              <button 
                onClick={() => handleSelectCity('All')}
                className="text-[11px] text-blue-700 underline font-bold hover:text-blue-900"
              >
                View Global Feeds (All)
              </button>
            </div>
          )}

          {/* City Selection Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Destination:</span>
            <div className="flex gap-1.5 flex-nowrap">
              {cityOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelectCity(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                    destination.toLowerCase() === c.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">
                  {destination !== 'All' ? `${destination} Transit & Weather Radar Active` : 'Global Disruption Engine Enabled'}
                </h3>
                <p className="text-xs text-white/90">Autonomous agents continuously monitor airline feeds, gate changes, and weather radars.</p>
              </div>
            </div>

            <button
              onClick={() => fetchDisruptions(destination)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm hover:bg-white/90 transition flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Radar</span>
            </button>
          </div>

          {/* Rebooking Success Alert */}
          {rebookingStatus && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-3 shadow-xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Itinerary Successfully Rescheduled!</p>
                <p className="text-[11px] text-emerald-700 font-normal">{rebookingStatus}</p>
              </div>
            </div>
          )}

          {/* Disruptions List */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              Live Disruption Feeds ({disruptions.length} Events Detected)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disruptions.map((disr, idx) => (
                <div 
                  key={disr.disruption_id || disr.event_id || idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                        {disr.city || destination} • {disr.type || 'Advisory'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        disr.severity === 'Critical' ? 'bg-red-100 text-red-700' : (disr.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {disr.severity || 'Low'} Severity
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{disr.title || disr.route}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{disr.description || disr.delay_reason}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Itinerary Impact</span>
                      <p className="text-slate-700 font-medium">{disr.impact}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">AI Rebooking Recommendation</span>
                      <p className="text-blue-900 font-medium">
                        {disr.rebooking_action || "Standard operations preserved. AI monitoring alternate routes."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulateRebooking(disr.flight_number || '6E-204')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Autonomous Rebooking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
