import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Plane, 
  Building2, 
  AlertTriangle, 
  Calendar, 
  Compass, 
  User, 
  Languages,
  ShieldCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';

export const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **Global AI Travel Copilot** 🌍\n\nI can help you explore anywhere in the world, check live flights & hotels, optimize budgets, provide multilingual guidance, and share official emergency contacts.\n\nWhat would you like to plan today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Plan a 5-day trip to Dubai under ₹80,000",
    "Find flights from Hyderabad to Dubai",
    "Show luxury hotels in Singapore",
    "What are the emergency numbers in Japan?",
    "मौसम कैसा है पेरिस में? (Paris weather in Hindi)",
    "హైదరాబాద్ నుండి దుబాయ్ విమానాలు (Flights in Telugu)"
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
      const res = await travelApi.sendMessage(query);
      setMessages([...newMessages, res.data]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I am having trouble connecting to the travel intelligence service right now. Please try again in a few moments."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar 
          title="AI Conversational Travel Copilot 🤖" 
          subtitle="Autonomous multi-agent travel intelligence, itinerary generation & multilingual assistance" 
        />

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto flex flex-col min-h-0">
          {/* Chat Messages Container */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Embedded Flight Card */}
                    {msg.embedded_type === 'flight_card' && msg.embedded_data && (
                      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-blue-700">{msg.embedded_data.airline} ({msg.embedded_data.flight_number})</span>
                          <span className="text-emerald-600 font-extrabold">₹ {msg.embedded_data.price_inr?.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {msg.embedded_data.origin} → {msg.embedded_data.destination} • {msg.embedded_data.duration_hrs}h • {msg.embedded_data.stops}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/flights?from=${msg.embedded_data.origin}&to=${msg.embedded_data.destination}`)}
                          className="w-full py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                        >
                          View in Flight Search →
                        </button>
                      </div>
                    )}

                    {/* Embedded Hotel Card */}
                    {msg.embedded_type === 'hotel_card' && msg.embedded_data && (
                      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{msg.embedded_data.name}</span>
                          <span className="text-blue-600">₹ {msg.embedded_data.price_per_night_inr?.toLocaleString('en-IN')}/night</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {msg.embedded_data.room_type || 'Executive Room'} • {msg.embedded_data.star_rating}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/hotels?city=${encodeURIComponent(msg.embedded_data.city || 'Dubai')}`)}
                          className="w-full py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition"
                        >
                          View Hotel Offers →
                        </button>
                      </div>
                    )}

                    {/* Embedded Itinerary Card */}
                    {msg.embedded_type === 'itinerary' && msg.embedded_data && (
                      <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-2 text-xs">
                        <h4 className="font-extrabold text-slate-900">{msg.embedded_data.title}</h4>
                        <p className="text-slate-500 text-[11px]">
                          {msg.embedded_data.duration_days} Days Planned • Estimated Cost: {msg.embedded_data.estimated_cost_inr}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate(`/planner?dest=${encodeURIComponent(msg.embedded_data.destination || 'Dubai')}`)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                        >
                          Open in Trip Planner & Map →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>AI Copilot is synthesizing travel intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="py-3 flex gap-2 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePromptClick(p)}
                className="px-3 py-1.5 bg-white border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-2xs transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. Plan a 5-day Dubai trip, find flights, emergency numbers, translate to Hindi/Spanish)..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 shadow-xs outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-2xl font-bold text-xs shadow-xs transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};
