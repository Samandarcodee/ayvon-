import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from '../types';
import { getExpenses, addExpense, deleteExpense } from '../services/db';
import { sendExpenseNotification } from '../services/telegram';
import { Plus, DollarSign, TrendingUp, PieChart as PieIcon, Trash2, Calendar, Filter, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ExpenseSection: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [newExpense, setNewExpense] = useState<Expense>({
    title: '',
    amount: 0,
    category: 'Mahsulotlar',
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await getExpenses();
    // Sort by date desc
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount <= 0) return;
    await addExpense(newExpense);
    
    // Send Telegram Notification
    sendExpenseNotification(newExpense);

    setIsModalOpen(false);
    setNewExpense({
        title: '',
        amount: 0,
        category: 'Mahsulotlar',
        date: new Date().toISOString().slice(0, 10)
    });
    loadExpenses();
  };

  const handleDelete = async (id: number) => {
    if(confirm("Chiqimni o'chirib tashlaysizmi?")) {
        await deleteExpense(id);
        loadExpenses();
    }
  };

  // Filtered Data Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => exp.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalAmount = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);

  // Group by Date for List View
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filteredExpenses.forEach(exp => {
      const date = exp.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(exp);
    });
    return groups;
  }, [filteredExpenses]);

  // Chart Data
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    return Object.keys(categories).map(key => ({
        name: key,
        value: categories[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const maxCategory = categoryData.length > 0 ? categoryData[0] : null;

  const COLORS = ['#F97316', '#14B8A6', '#8B5CF6', '#F43F5E', '#3B82F6', '#64748B'];

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chiqimlar tahlili</h2>
          <p className="text-gray-500">Moliya holatini kuzatib boring</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-200 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-gray-300 mb-1">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">Jami xarajat (Oy)</span>
                </div>
                <div className="text-3xl font-bold tracking-tight">
                    {totalAmount.toLocaleString()} so'm
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <DollarSign size={120} />
              </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
             <div className="text-gray-500 text-sm font-medium mb-1">Eng ko'p xarajat</div>
             {maxCategory ? (
               <div>
                 <div className="text-xl font-bold text-gray-900">{maxCategory.name}</div>
                 <div className="text-orange-600 font-medium">{maxCategory.value.toLocaleString()} so'm</div>
                 <div className="text-xs text-gray-400 mt-1">Jami xarajatning {((maxCategory.value / totalAmount) * 100).toFixed(1)}%</div>
               </div>
             ) : (
               <div className="text-gray-400 italic">Ma'lumot yo'q</div>
             )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
             <div className="text-gray-500 text-sm font-medium mb-1">Tranzaksiyalar soni</div>
             <div className="text-2xl font-bold text-gray-900">{filteredExpenses.length} ta</div>
             <div className="text-xs text-gray-400 mt-1">Ushbu oyda</div>
          </div>
      </div>

      {/* Charts */}
      {filteredExpenses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <PieIcon size={18} className="text-orange-500" />
                Kategoriyalar ulushi
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                      >
                          {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => value.toLocaleString() + " so'm"} />
                      <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
              </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Detailed List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Xarajatlar ro'yxati</span>
            <span className="text-sm text-gray-500">{selectedMonth}</span>
        </div>
        
        {Object.keys(groupedExpenses).length === 0 ? (
           <div className="p-12 text-center text-gray-400">
             <Filter size={48} className="mx-auto mb-4 opacity-20" />
             <p>Ushbu oy uchun xarajatlar topilmadi</p>
           </div>
        ) : (
          <div className="divide-y divide-gray-100">
             {Object.keys(groupedExpenses).sort((a,b) => b.localeCompare(a)).map(date => (
               <div key={date}>
                 <div className="px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   {new Date(date).toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
                 <div>
                   {groupedExpenses[date].map(exp => (
                     <div key={exp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            exp.category === 'Mahsulotlar' ? 'bg-orange-100 text-orange-600' :
                            exp.category === 'Ish haqi' ? 'bg-green-100 text-green-600' :
                            exp.category === 'Kommunal' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                         }`}>
                            <DollarSign size={20} />
                         </div>
                         <div>
                           <div className="font-medium text-gray-900">{exp.title}</div>
                           <div className="text-sm text-gray-500">{exp.category}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="font-bold text-gray-900">-{exp.amount.toLocaleString()} so'm</span>
                         <button 
                             onClick={() => exp.id && handleDelete(exp.id)}
                             className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                         >
                             <Trash2 size={18} />
                         </button>
                       </div>
                     </div>
                   ))}
                   <div className="px-6 py-2 bg-gray-50/30 flex justify-end text-xs text-gray-500 font-medium">
                     Kunlik jami: {groupedExpenses[date].reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} so'm
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-fade-in-up shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-2xl font-bold text-gray-900">Xarajat qo'shish</h3>
                   <p className="text-gray-500 text-sm mt-1">Yangi chiqim ma'lumotlari</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                  <XCircle size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xarajat nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 5kg Go'sht"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
                  value={newExpense.title}
                  onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Summa (so'm)</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-orange-500 font-medium">UZS</span>
                    <input
                    type="number"
                    required
                    min="0"
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-mono text-lg font-medium text-gray-900"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategoriya</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900 appearance-none"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="Mahsulotlar">🍅 Mahsulotlar (Bozor)</option>
                  <option value="Kommunal">⚡ Kommunal (Svet, Gaz)</option>
                  <option value="Ish haqi">👨‍🍳 Ish haqi</option>
                  <option value="Ijara">🏠 Ijara</option>
                  <option value="Transport">🚕 Transport</option>
                  <option value="Boshqa">📦 Boshqa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sana</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-gray-900"
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all"
                >
                  Saqlash
                </button>
                 <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
