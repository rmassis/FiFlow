
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

const Dashboard: React.FC = () => {
  const { transactions, budgets, categories, accounts, investments } = useFinance();

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpenses;

  const totalAssets = accounts.reduce((acc, curr) => acc + curr.balance, 0) +
    investments.reduce((acc, curr) => acc + curr.value, 0);

  const prevMonthTotalIncome = 0; // Ideally calculate from past transactions
  const prevMonthTotalExpenses = 0;

  const chartData = [
    { name: 'Anterior', income: prevMonthTotalIncome, expenses: prevMonthTotalExpenses },
    { name: 'Atual', income: totalIncome, expenses: totalExpenses },
  ];

  const pieData = budgets.map(b => {
    const cat = categories.find(c => b.categoryId === c.id);
    // Calcular actual baseado em transactions, pois budget pode estar desatualizado
    const actual = transactions
      .filter(t => t.category === cat?.name && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return { name: cat?.name || 'Outros', value: actual, color: cat?.color || '#cbd5e1' };
  }).filter(d => d.value > 0); // Mostrar apenas categorias com gastos

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-2">
            <Wallet size={24} />
          </div>
          <span className="text-sm text-slate-500 font-medium">Patrimônio Total</span>
          <span className="text-2xl font-bold text-slate-800">R$ {totalAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <div className="text-xs text-indigo-600 font-medium">Calculado em tempo real</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2">
            <TrendingUp size={24} />
          </div>
          <span className="text-sm text-slate-500 font-medium">Total de Receitas</span>
          <span className="text-2xl font-bold text-emerald-600">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <div className="text-xs text-slate-400">Acompanhamento mensal</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-2">
            <TrendingDown size={24} />
          </div>
          <span className="text-sm text-slate-500 font-medium">Total de Despesas</span>
          <span className="text-2xl font-bold text-rose-600">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <div className="text-xs text-rose-600 font-medium">Controle de gastos ativo</div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <DollarSign size={24} />
          </div>
          <span className="text-sm text-slate-500 font-medium">Saldo Disponível</span>
          <span className="text-2xl font-bold text-slate-800">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <div className="text-xs text-blue-600 font-medium">{balance >= 0 ? 'Saldo positivo' : 'Atenção ao saldo'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa Mensal</h3>
            <select className="bg-slate-50 border-none text-sm font-medium rounded-lg px-3 py-1 text-slate-500 focus:ring-0">
              <option>Últimos 6 meses</option>
              <option>2025</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Gastos por Categoria</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  R$ {item.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
