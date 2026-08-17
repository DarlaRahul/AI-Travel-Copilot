import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2
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
      content: "Greetings! I am your **Global AI Travel Copilot** 🌍\n\nI can help you explore worldwide destinations, recommend curated hotel stays, compare live flight routes, optimize budgets using 0/1 Knapsack theory, provide multilingual translations, and coordinate itinerary adjustments.\n\nWhere shall we venture next?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "Plan a 5-day trip to Dubai under ₹80,000",
    "Find flights from Delhi to Paris",
    "Show luxury hotel stays in Dubai",
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
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="AI Conversational Travel Copilot" 
        subtitle="Autonomous travel agent, multilingual dispatch & real-time reasoning" 
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-[calc(100vh-140px)] pb-36">
        {/* Chat Messages Container */}
        <div className="flex-1 bg-[#fffefb] rounded-3xl border border-[#e3d6c1] shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[420px]">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center shrink-0 mt-0.5 border border-[#c25e38]/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-[#c25e38] text-white rounded-tr-none font-medium shadow-2xs' 
                        : 'bg-[#f5eee2]/70 border border-[#e3d6c1] text-[#221c17] rounded-tl-none whitespace-pre-line shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Embedded Flight Card */}
                  {msg.embedded_type === 'flight_card' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-4 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#221c17] font-serif">{msg.embedded_data.airline} ({msg.embedded_data.flight_number})</span>
                        <span className="text-[#c25e38] font-extrabold font-mono">₹ {msg.embedded_data.price_inr?.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[#695e52] text-xs font-mono">
                        {msg.embedded_data.origin} → {msg.embedded_data.destination} • {msg.embedded_data.duration_hrs}h • {msg.embedded_data.stops}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/flights?from=${msg.embedded_data.origin}&to=${msg.embedded_data.destination}`)}
                        className="w-full py-2 bg-[#faeee7] text-[#c25e38] hover:bg-[#faeee7]/80 rounded-full font-bold text-xs transition"
                      >
                        View in Flight Search →
                      </button>
                    </div>
                  )}

                  {/* Embedded Hotel Card */}
                  {msg.embedded_type === 'hotel_card' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-4 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#221c17] font-serif">{msg.embedded_data.name}</span>
                        <span className="text-[#c25e38] font-mono">₹ {msg.embedded_data.price_per_night_inr?.toLocaleString('en-IN')}/night</span>
                      </div>
                      <p className="text-[#695e52] text-xs">
                        {msg.embedded_data.room_type || 'Executive Room'} • {msg.embedded_data.star_rating}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/hotels?city=${encodeURIComponent(msg.embedded_data.city || 'Dubai')}`)}
                        className="w-full py-2 bg-[#faeee7] text-[#c25e38] hover:bg-[#faeee7]/80 rounded-full font-bold text-xs transition"
                      >
                        View Hotel Offers →
                      </button>
                    </div>
                  )}

                  {/* Embedded Itinerary Card */}
                  {msg.embedded_type === 'itinerary' && msg.embedded_data && (
                    <div className="bg-[#fffefb] p-4 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-2 text-xs">
                      <h4 className="font-bold text-[#221c17] font-serif">{msg.embedded_data.title}</h4>
                      <p className="text-[#695e52] text-xs">
                        {msg.embedded_data.duration_days} Days Planned • Estimated Cost: {msg.embedded_data.estimated_cost_inr}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/planner?dest=${encodeURIComponent(msg.embedded_data.destination || 'Dubai')}`)}
                        className="w-full py-2 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full font-bold text-xs shadow-xs transition"
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
              <div className="w-8 h-8 rounded-2xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#f5eee2]/70 border border-[#e3d6c1] p-3.5 rounded-3xl rounded-tl-none flex items-center gap-2 text-xs text-[#695e52]">
                <Loader2 className="w-4 h-4 animate-spin text-[#c25e38]" />
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
              className="px-3.5 py-1.5 bg-[#fffefb] border border-[#e3d6c1] hover:border-[#c25e38] text-[#695e52] hover:text-[#c25e38] rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs transition"
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
            placeholder="Ask anything (e.g. Plan a 5-day Dubai trip, find flights, emergency numbers, translate)..."
            className="flex-1 px-5 py-3.5 bg-[#fffefb] border border-[#e3d6c1] rounded-full text-xs font-semibold text-[#221c17] shadow-xs outline-none focus:border-[#c25e38] placeholder:text-[#998c7e] transition"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-3.5 bg-[#c25e38] hover:bg-[#a84c29] disabled:bg-[#e3d6c1] text-white rounded-full font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0"
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
