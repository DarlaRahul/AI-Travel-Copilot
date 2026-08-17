import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2,
  Calendar,
  MapPin,
  Plane,
  Building2,
  CreditCard,
  ArrowRight,
  Star,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { FloatingDock } from '../components/ui/floating-dock';

export const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **AI Travel Copilot & Consultant** 🌍\n\nI can help you plan personalized trips, check real travel feasibility, find verified flights & stays, and optimize budgets.\n\nTell me what you have in mind naturally — for example: *\"I want to go to Paris\"* or *\"I live in Hyderabad and want to explore Hyderabad for 5 days\"*."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "I want to go to Paris",
    "I live in Hyderabad and want to explore Hyderabad for 5 days",
    "I want to go to Dubai for 4 days with ₹60,000",
    "Find flights from Hyderabad to Dubai",
    "What is the weather in Tokyo this weekend?",
    "నాకు హైదరాబాద్ నుంచి పారిస్ వెళ్లాలి (Telugu)",
    "मुझे 3 दिन के लिए पेरिस का प्लान बताओ (Hindi)"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const activeDest = localStorage.getItem('travel_copilot_active_destination') || '';
      const res = await travelApi.sendMessage(query, { destination: activeDest });
      setMessages([...newMessages, res.data]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I am having trouble accessing the live travel service right now. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionButtonClick = (btn: any) => {
    if (!btn) return;
    if (btn.action === 'open_itinerary') {
      const dest = btn.params?.dest || 'Dubai';
      localStorage.setItem('travel_copilot_active_destination', dest);
      navigate(`/itinerary/1?dest=${encodeURIComponent(dest)}`);
    } else if (btn.action === 'open_flights') {
      const from = btn.params?.from || 'Delhi';
      const to = btn.params?.to || 'Dubai';
      navigate(`/flights?origin=${encodeURIComponent(from)}&dest=${encodeURIComponent(to)}`);
    } else if (btn.action === 'open_hotels') {
      const city = btn.params?.city || 'Dubai';
      navigate(`/hotels?dest=${encodeURIComponent(city)}`);
    } else if (btn.action === 'open_explore') {
      navigate('/explore');
    } else if (btn.action === 'set_budget') {
      handleSendMessage(`Make the budget ₹${Math.round(btn.params?.budget || 80000).toLocaleString('en-IN')}`);
    } else if (btn.action === 'set_stay') {
      handleSendMessage(`${btn.params?.stay} hotel accommodation`);
    } else if (btn.action === 'set_destination') {
      handleSendMessage(`Plan a local 5-day trip in ${btn.params?.destination || 'Hyderabad'}`);
    } else {
      handleSendMessage(btn.label);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col selection:bg-[#c25e38] selection:text-white">
      <Navbar 
        title="AI Travel Copilot & Consultant" 
        subtitle="Human-like travel reasoning, feasibility checks, live provider tools & multilingual planning" 
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-[calc(100vh-140px)] pb-36 space-y-4">
        {/* Chat Messages Container */}
        <div className="flex-1 bg-[#fffefb] rounded-3xl border border-[#e3d6c1] shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[460px]">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isUnrealistic = msg.feasibility_status === 'Unrealistic';
            const isComfortable = msg.feasibility_status === 'Comfortable' || msg.feasibility_status === 'Possible';

            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border shadow-xs font-bold text-xs ${
                    isUnrealistic ? 'bg-[#fef2f2] text-[#dc2626] border-[#fca5a5]' : 'bg-[#faeee7] text-[#c25e38] border-[#c25e38]/20'
                  }`}>
                    {isUnrealistic ? (
                      <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#c88842]" />
                    )}
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-[#c25e38] text-white rounded-tr-none font-medium shadow-2xs font-sans' 
                        : isUnrealistic 
                          ? 'bg-[#fff5f5] border border-[#fed7d7] text-[#742a2a] rounded-tl-none whitespace-pre-line shadow-2xs font-sans'
                          : 'bg-[#f5eee2]/70 border border-[#e3d6c1] text-[#221c17] rounded-tl-none whitespace-pre-line shadow-2xs font-sans'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Embedded Action Buttons */}
                  {msg.action_buttons && msg.action_buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.action_buttons.map((btn: any, bIdx: number) => (
                        <button
                          key={bIdx}
                          type="button"
                          onClick={() => handleActionButtonClick(btn)}
                          className="px-4 py-2 bg-[#fffefb] hover:bg-[#faeee7] border border-[#c25e38]/40 hover:border-[#c25e38] text-[#c25e38] rounded-full text-xs font-bold shadow-2xs transition flex items-center gap-1.5 font-serif cursor-pointer"
                        >
                          <span>{btn.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Embedded Itinerary Card */}
                  {msg.embedded_type === 'itinerary' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faeee7] text-[#c25e38] px-2.5 py-0.5 rounded-full font-mono">
                          Verified Trip Plan
                        </span>
                        <span className="text-xs font-extrabold text-[#c25e38] font-mono">
                          {msg.embedded_data.estimated_cost_inr}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-[#221c17] font-serif">{msg.embedded_data.title}</h4>
                        <p className="text-xs text-[#695e52]">
                          {msg.embedded_data.duration_days} Days Scheduled • {msg.embedded_data.destination}
                        </p>
                      </div>

                      {msg.embedded_data.itinerary_days && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {msg.embedded_data.itinerary_days.slice(0, 4).map((d: any, dIdx: number) => (
                            <div key={dIdx} className="p-2.5 rounded-xl bg-[#f5eee2]/50 border border-[#e3d6c1] text-xs space-y-0.5">
                              <span className="font-bold text-[#c25e38] font-mono block">Day {d.day_number}: {d.theme || d.title}</span>
                              <span className="text-[11px] text-[#695e52] line-clamp-1">
                                {d.activities?.map((a: any) => a.name).join(' • ') || d.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(`/itinerary/1?dest=${encodeURIComponent(msg.embedded_data.destination || 'Dubai')}`)}
                        className="w-full py-2.5 rounded-full bg-[#c25e38] hover:bg-[#a84c29] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 font-serif cursor-pointer"
                      >
                        <span>Open & Customize Full Itinerary</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Embedded Flight Card */}
                  {msg.embedded_type === 'flight_card' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#221c17] font-serif text-sm">{msg.embedded_data.airline} ({msg.embedded_data.flight_number || 'Direct'})</span>
                        <span className="text-[#c25e38] font-extrabold text-sm font-mono">₹ {msg.embedded_data.price_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[#695e52] text-xs font-mono">
                        {msg.embedded_data.origin} &rarr; {msg.embedded_data.destination} • {msg.embedded_data.duration_hrs}h • {msg.embedded_data.stops}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/flights?dest=${encodeURIComponent(msg.embedded_data.destination || 'Dubai')}&origin=${encodeURIComponent(msg.embedded_data.origin || 'Delhi')}`)}
                        className="w-full py-2 bg-[#221c17] text-white hover:bg-[#3a2e24] rounded-full font-bold text-xs transition font-serif cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>View in Flight Search</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Embedded Hotel Card */}
                  {msg.embedded_type === 'hotel_card' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-5 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#221c17] font-serif text-sm">{msg.embedded_data.name}</span>
                        <span className="text-[#c25e38] font-mono text-sm font-extrabold">₹ {msg.embedded_data.price_per_night_inr?.toLocaleString('en-IN')}/night</span>
                      </div>
                      <p className="text-[#695e52] text-xs">
                        {msg.embedded_data.room_type || 'Deluxe Room'} • {msg.embedded_data.star_rating} ⭐
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/hotels?dest=${encodeURIComponent(msg.embedded_data.city || 'Dubai')}`)}
                        className="w-full py-2 bg-[#c25e38] text-white hover:bg-[#a84c29] rounded-full font-bold text-xs transition font-serif cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>View Accommodations</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-[#c25e38]" />
              </div>
              <div className="bg-[#f5eee2]/70 border border-[#e3d6c1] p-3.5 rounded-3xl rounded-tl-none flex items-center gap-2 text-xs text-[#695e52]">
                <Sparkles className="w-4 h-4 text-[#c88842] animate-pulse" />
                <span>AI Travel Consultant is evaluating feasibility and travel data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Suggestions */}
        <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="px-3.5 py-1.5 bg-[#fffefb] border border-[#e3d6c1] hover:border-[#c25e38] text-[#695e52] hover:text-[#c25e38] rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs transition font-serif cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tell me where you want to go or what you want to explore..."
            className="flex-1 px-5 py-3.5 bg-[#fffefb] border border-[#e3d6c1] rounded-full text-xs sm:text-sm font-medium text-[#221c17] shadow-xs outline-none focus:border-[#c25e38] placeholder:text-[#998c7e] transition font-sans"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3.5 bg-[#c25e38] hover:bg-[#a84c29] disabled:bg-[#e3d6c1] text-white rounded-full font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0 font-serif cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
