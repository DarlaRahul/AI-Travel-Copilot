import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { DisruptionAlert } from '../types';
import { FloatingDock } from '../components/ui/floating-dock';

export const DisruptionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDest = searchParams.get('destination') || localStorage.getItem('travel_copilot_active_destination') || 'All';

  const [destination, setDestination] = useState(initialDest);
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>([]);
  const [rebookingStatus, setRebookingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cityOptions = ['All', 'Dubai', 'Paris', 'Goa', 'Switzerland', 'Jaipur', 'Manali', 'Ladakh', 'Kerala', 'Japan', 'Bali'];

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
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Disruption & Rebooking Radar" 
        subtitle="Real-time flight delays, route impacts and autonomous itinerary rescheduling" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 pb-36">
        {/* Active Filter Notice */}
        {destination && destination !== 'All' && (
          <div className="p-4 rounded-3xl bg-[#fef6eb] border border-[#c88842]/30 text-[#221c17] text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c88842] shrink-0" />
              <span>Monitoring live disruption feeds & transit alerts for <strong>{destination}</strong></span>
            </div>
            <button 
              onClick={() => handleSelectCity('All')}
              className="text-xs text-[#c25e38] underline font-bold hover:text-[#a84c29] font-mono"
            >
              View Global Feeds
            </button>
          </div>
        )}

        {/* City Selection Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-[#998c7e] uppercase tracking-wider font-mono shrink-0">Filter:</span>
          <div className="flex gap-1.5 flex-nowrap">
            {cityOptions.map((c) => (
              <button
                key={c}
                onClick={() => handleSelectCity(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                  destination.toLowerCase() === c.toLowerCase()
                    ? 'bg-[#c25e38] text-white shadow-xs'
                    : 'bg-[#fffefb] border border-[#e3d6c1] text-[#695e52] hover:bg-[#f5eee2]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Active Status Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#c25e38] via-[#c88842] to-[#8c4320] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#e3d6c1]/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif text-[#fffefb]">
                {destination !== 'All' ? `${destination} Transit & Weather Radar Active` : 'Global Disruption Engine Enabled'}
              </h3>
              <p className="text-xs text-[#f5eee2]">Autonomous engine continuously monitors airline delay feeds, terminal changes, and weather gates.</p>
            </div>
          </div>

          <button
            onClick={() => fetchDisruptions(destination)}
            className="px-5 py-2.5 rounded-full bg-[#fffefb] text-[#221c17] font-bold text-xs shadow-sm hover:bg-[#f5eee2] transition flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Radar</span>
          </button>
        </div>

        {/* Rebooking Success Alert */}
        {rebookingStatus && (
          <div className="p-4 rounded-3xl bg-[#eef7f2] border border-[#3b7a57]/30 text-[#3b7a57] text-xs font-semibold flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#3b7a57] shrink-0" />
            <div>
              <p className="font-bold font-serif text-sm">Itinerary Successfully Rescheduled!</p>
              <p className="text-xs text-[#3b7a57]/90 font-normal">{rebookingStatus}</p>
            </div>
          </div>
        )}

        {/* Disruptions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#998c7e] font-mono">Live Feeds</span>
              <h3 className="font-bold text-[#221c17] text-lg font-serif">
                Detected Travel Events ({disruptions.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disruptions.map((disr, idx) => (
              <div 
                key={disr.disruption_id || disr.event_id || idx}
                className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#c25e38]/50 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#221c17] text-white text-[10px] font-bold font-mono">
                      {disr.city || destination} • {disr.type || 'Advisory'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      disr.severity === 'Critical' ? 'bg-[#faeee7] text-[#c25e38]' : (disr.severity === 'Medium' ? 'bg-[#fef6eb] text-[#c88842]' : 'bg-[#eef7f2] text-[#3b7a57]')
                    }`}>
                      {disr.severity || 'Low'} Severity
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#221c17] text-base font-serif">{disr.title || disr.route}</h4>
                    <p className="text-xs text-[#695e52] font-medium mt-1 leading-relaxed">{disr.description || disr.delay_reason}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1] space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#998c7e] uppercase font-mono">Itinerary Impact</span>
                    <p className="text-[#221c17] font-medium">{disr.impact}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#faeee7]/60 border border-[#c25e38]/20 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#c25e38] uppercase font-mono">AI Recommendation</span>
                    <p className="text-[#221c17] font-medium">
                      {disr.rebooking_action || "Standard operations preserved. AI monitoring alternate routes."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulateRebooking(disr.flight_number || '6E-204')}
                  className="w-full py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Apply Autonomous Rebooking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
