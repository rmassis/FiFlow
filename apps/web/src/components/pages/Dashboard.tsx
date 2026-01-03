
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

const Dashboard: React.FC = () => {
  const {
    transactions = [],
    budgets = [],
    categories = [],
    accounts = [],
    investments = []
  } = useFinance();

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpenses;

  const totalAssets = accounts.reduce((acc, curr) => acc + curr.balance, 0) +
    investments.reduce((acc, curr) => acc + curr.value, 0);

  // Mock previous month data for delta calculation
  const prevMonthTotalIncome = totalIncome * 0.9;
  const prevMonthTotalExpenses = totalExpenses * 0.95;

  const chartData = [
    { name: 'Jan', income: totalIncome * 0.8, expenses: totalExpenses * 0.9 },
    { name: 'Fev', income: totalIncome * 0.9, expenses: totalExpenses * 0.8 },
    { name: 'Mar', income: totalIncome * 1.1, expenses: totalExpenses * 1.2 },
    { name: 'Abr', income: totalIncome * 1.0, expenses: totalExpenses * 1.0 },
    { name: 'Mai', income: totalIncome * 0.95, expenses: totalExpenses * 0.9 },
    { name: 'Jun', income: totalIncome, expenses: totalExpenses },
  ];

  const pieData = budgets.map(b => {
    const cat = categories.find(c => b.categoryId === c.id);
    const actual = transactions
      .filter(t => t.category === cat?.name && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return { name: cat?.name || 'Outros', value: actual, color: cat?.color || '#cbd5e1' };
  }).filter(d => d.value > 0);

  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <div className="p-12 text-center text-slate-400 animate-pulse">Carregando seus dados...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Assets Card */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={80} />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Wallet size={20} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Patrimônio</span>
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              R$ {totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 mt-2 bg-emerald-500/5 py-1 px-2 rounded-lg w-fit">
              <Activity size={12} />
              <span>+12.5% este mês</span>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} className="text-emerald-500" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Receitas</span>
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 mt-2">
              <ArrowUpRight size={14} />
              <span>+8.2% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown size={80} className="text-rose-500" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600">
                <TrendingDown size={20} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Despesas</span>
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-rose-500 mt-2">
              <ArrowDownRight size={14} />
              <span>+2.4% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign size={20} />
              </div>
              <span className="text-sm font-semibold text-indigo-100">Saldo Disponível</span>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-xs text-indigo-200 mt-2 font-medium">
              Disponível para investir
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fluxo de Caixa</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Entradas e saídas dos últimos 6 meses</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <option>Últimos 6 meses</option>
              <option>2025 COMPLETO</option>
            </select>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px'
                  }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Gastos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Distribuição por categoria</p>

          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {pieData.length}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[200px]">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-indigo-600 transition-colors">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                  R$ {item.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
            {pieData.length === 0 && (
              <div className="text-center text-slate-400 py-4 text-sm">
                Nenhum gasto registrado este mês.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
