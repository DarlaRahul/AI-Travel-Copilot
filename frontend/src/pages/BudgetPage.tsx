import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Lightbulb, 
  CreditCard, 
  Building2, 
  Plane, 
  Utensils, 
  Camera, 
  Layers 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';
import { FloatingDock } from '../components/ui/floating-dock';
import { ProgressBar } from '../components/ui/progress-bar';

export const BudgetPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number>(50000);
  const [dailySpending, setDailySpending] = useState<number>(4000);
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [optimization, setOptimization] = useState<any>(null);

  // New Expense Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('Food');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await travelApi.getExpenses();
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Expenses load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimization = async () => {
    try {
      const res = await travelApi.optimizeBudget({
        total_budget_inr: totalBudget,
        travel_style: travelStyle,
        duration_days: 5,
        travelers_count: 2,
        daily_spending_inr: dailySpending
      });
      setOptimization(res.data);
    } catch (err) {
      console.error("Optimization error:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchOptimization();
  }, [totalBudget, travelStyle, dailySpending]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || parseFloat(amount) <= 0) return;

    try {
      const res = await travelApi.addExpense({
        category,
        title,
        amount_inr: parseFloat(amount),
        date_str: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        notes
      });

      setExpenses([res.data, ...expenses]);
      setTitle('');
      setAmount('');
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      console.error("Add expense error:", err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await travelApi.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error("Delete expense error:", err);
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount_inr || 0), 0);
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);

  const categoryIcons: Record<string, any> = {
    Stay: Building2,
    Flight: Plane,
    Food: Utensils,
    Activities: Camera,
    Transport: CreditCard,
    Misc: Layers
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#221c17] flex flex-col">
      <Navbar 
        title="Budget Tracker & Knapsack Optimizer" 
        subtitle="Real-time expense tracking, category breakdowns & AI budget allocation" 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-36">
        {/* Top Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs">
            <span className="text-xs font-bold text-[#998c7e] uppercase tracking-wider block font-mono">Total Trip Budget</span>
            <span className="text-2xl font-extrabold text-[#221c17] mt-1 block font-mono">
              ₹ {totalBudget.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold text-[#695e52]">Style: {travelStyle}</span>
            </div>
          </div>

          <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs">
            <span className="text-xs font-bold text-[#998c7e] uppercase tracking-wider block font-mono">Total Logged Spend</span>
            <span className="text-2xl font-extrabold text-[#c25e38] mt-1 block font-mono">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[#695e52] mt-2 block font-mono">
              {expenses.length} Logged Items
            </span>
          </div>

          <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs">
            <span className="text-xs font-bold text-[#998c7e] uppercase tracking-wider block font-mono">Remaining Buffer</span>
            <span className="text-2xl font-extrabold text-[#3b7a57] mt-1 block font-mono">
              ₹ {remainingBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[#3b7a57] mt-2 block font-mono">
              ₹ {remainingBudget.toLocaleString('en-IN')} Available
            </span>
          </div>

          <div className="bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs">
            <span className="text-xs font-bold text-[#998c7e] uppercase tracking-wider block font-mono">Daily Target</span>
            <span className="text-2xl font-extrabold text-[#2a475e] mt-1 block font-mono">
              ₹ {dailySpending.toLocaleString('en-IN')}/day
            </span>
            <span className="text-xs font-semibold text-[#2a475e] mt-2 block font-mono">
              ₹ {(dailySpending * 5).toLocaleString('en-IN')} for 5 Days
            </span>
          </div>
        </section>

        {/* Budget Allocation vs Expense Log Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Knapsack Optimal Allocation */}
          <div className="lg:col-span-5 bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c25e38] font-mono">
                  Benchmark
                </span>
                <h3 className="font-bold text-[#221c17] text-base font-serif mt-0.5">Knapsack Budget Allocation</h3>
              </div>

              <div className="flex gap-1">
                {['Relaxed', 'Balanced', 'Luxury'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTravelStyle(s)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      travelStyle === s 
                        ? 'bg-[#c25e38] text-white shadow-xs' 
                        : 'bg-[#f5eee2] text-[#695e52] hover:bg-[#eae0cf] border border-[#e3d6c1]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar Component */}
            <div className="pt-1">
              <ProgressBar
                value={totalSpent}
                max={totalBudget}
                label="Overall Budget Utilization"
                sublabel={`₹${totalSpent.toLocaleString('en-IN')} / ₹${totalBudget.toLocaleString('en-IN')}`}
                color="terracotta"
              />
            </div>

            {/* Category Breakdown Cards */}
            <div className="space-y-3">
              {optimization?.categories?.map((cat: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-[#221c17]">{cat.category}</span>
                    <span className="text-[#c25e38]">₹ {cat.allocated_inr?.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                  </div>
                  <p className="text-xs text-[#695e52]">{cat.description}</p>
                </div>
              ))}
            </div>

            {/* Optimization Suggestions */}
            {optimization?.optimization_suggestions && (
              <div className="bg-[#fef6eb] border border-[#c88842]/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#c88842]">
                  <Lightbulb className="w-4 h-4 text-[#c88842]" />
                  <span>Cost-Saving Optimization Tips</span>
                </div>
                <ul className="space-y-1 text-xs text-[#695e52] list-disc list-inside">
                  {optimization.optimization_suggestions.map((sug: string, i: number) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Expenses Tracker */}
          <div className="lg:col-span-7 bg-[#fffefb] p-6 rounded-3xl border border-[#e3d6c1] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a475e] font-mono">
                  Expenses Log
                </span>
                <h3 className="font-bold text-[#221c17] text-base font-serif mt-0.5">Recorded Expenses ({expenses.length})</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-5 py-2 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Close' : 'Add Expense'}</span>
              </button>
            </div>

            {/* Add Expense Form Modal/Inline */}
            {showAddForm && (
              <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-[#f5eee2]/60 border border-[#e3d6c1] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#695e52] uppercase mb-1 font-mono">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3d6c1] text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Stay">Stay & Hotel</option>
                      <option value="Flight">Flight & Transit</option>
                      <option value="Food">Food & Dining</option>
                      <option value="Activities">Activities & Sights</option>
                      <option value="Transport">Local Transport</option>
                      <option value="Misc">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#695e52] uppercase mb-1 font-mono">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Seafood Dinner"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3d6c1] text-xs font-semibold bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#695e52] uppercase mb-1 font-mono">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 2400"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3d6c1] text-xs font-semibold bg-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e3d6c1] text-xs font-medium bg-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#c25e38] hover:bg-[#a84c29] text-white rounded-xl text-xs font-bold transition"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            )}

            {/* Expenses List */}
            {expenses.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#e3d6c1] rounded-2xl space-y-2">
                <CreditCard className="w-8 h-8 text-[#998c7e] mx-auto" />
                <p className="text-xs font-bold text-[#221c17]">No expenses logged yet.</p>
                <p className="text-xs text-[#695e52]">Click 'Add Expense' or book flights/hotels to log items.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {expenses.map((item) => {
                  const IconComponent = categoryIcons[item.category] || Layers;
                  return (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-[#e3d6c1] bg-[#fffefb] hover:border-[#c25e38]/50 transition flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#faeee7] text-[#c25e38] flex items-center justify-center shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#221c17] text-xs leading-snug font-serif">{item.title}</h4>
                          <p className="text-[10px] text-[#998c7e] font-mono">
                            {item.category} • {item.date_str} {item.notes && `• ${item.notes}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xs text-[#221c17] font-mono">
                          ₹ {item.amount_inr?.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(item.id)}
                          className="p-1.5 text-[#998c7e] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Centered Floating Liquid Glass Navigation Dock */}
      <FloatingDock />
    </div>
  );
};
