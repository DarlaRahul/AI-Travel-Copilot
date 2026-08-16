import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  CreditCard,
  Building2,
  Plane,
  Utensils,
  Camera,
  Layers
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { travelApi } from '../services/api';

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
  const spentPct = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const categoryIcons: Record<string, any> = {
    Stay: Building2,
    Flight: Plane,
    Food: Utensils,
    Activities: Camera,
    Transport: CreditCard,
    Misc: Layers
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          title="Budget Tracker & 0/1 Knapsack Optimizer 💰" 
          subtitle="Real-time expense tracking, category breakdowns & AI budget allocation" 
        />

        <main className="p-8 max-w-7xl w-full space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Trip Budget</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹ {totalBudget.toLocaleString('en-IN')}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] font-semibold text-slate-500">Style: {travelStyle}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Logged Spend</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                ₹ {totalSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
                {expenses.length} Total Expense Item(s)
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Remaining Buffer</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                ₹ {remainingBudget.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-2 block">
                {100 - spentPct}% Budget Available
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Daily Spending Target</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                ₹ {dailySpending.toLocaleString('en-IN')}/day
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 mt-2 block">
                ₹ {(dailySpending * 5).toLocaleString('en-IN')} Total for 5 Days
              </span>
            </div>
          </div>

          {/* Budget Allocation vs Expense Log Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Knapsack Optimal Allocation */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Knapsack AI Budget Allocation</h3>
                  <p className="text-xs text-slate-500">Benchmark distribution for {travelStyle} travel style</p>
                </div>

                <div className="flex gap-1">
                  {['Relaxed', 'Balanced', 'Luxury'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTravelStyle(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        travelStyle === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Spend Progress</span>
                  <span>{spentPct}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${spentPct}%` }}
                  />
                </div>
              </div>

              {/* Category Breakdown Cards */}
              <div className="space-y-3">
                {optimization?.categories?.map((cat: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{cat.category}</span>
                      <span className="text-blue-600">₹ {cat.allocated_inr?.toLocaleString('en-IN')} ({cat.percentage}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{cat.description}</p>
                  </div>
                ))}
              </div>

              {/* Optimization Suggestions */}
              {optimization?.optimization_suggestions && (
                <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Cost-Saving Optimization Tips</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-amber-900 list-disc list-inside">
                    {optimization.optimization_suggestions.map((sug: string, i: number) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Expenses Tracker */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Expenses Log ({expenses.length})</h3>
                  <p className="text-xs text-slate-500">Track and manage individual trip expenses</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Close' : 'Add Expense'}</span>
                </button>
              </div>

              {/* Add Expense Form Modal/Inline */}
              {showAddForm && (
                <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
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
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Seafood Dinner"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2400"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              )}

              {/* Expenses List */}
              {expenses.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No expenses logged yet.</p>
                  <p className="text-[11px] text-slate-400">Click 'Add Expense' or book flights/hotels to log expenses.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {expenses.map((item) => {
                    const IconComponent = categoryIcons[item.category] || Layers;
                    return (
                      <div 
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{item.title}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.category} • {item.date_str} {item.notes && `• ${item.notes}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-xs text-slate-900">
                            ₹ {item.amount_inr?.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
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
          </div>
        </main>
      </div>
    </div>
  );
};
