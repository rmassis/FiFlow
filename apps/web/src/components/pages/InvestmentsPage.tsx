
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { InvestmentAsset } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  Layers,
  Cpu,
  Building2,
  Landmark,
  CircleDollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  History
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const InvestmentsPage: React.FC = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvestments = investments.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredInvestments.reduce((acc, curr) => acc + curr.value, 0);
  const totalDailyChange = filteredInvestments.reduce((acc, curr) => acc + (curr.value * (curr.change24h / 100)), 0);

  // Professional Metrics
  const totalInvested = filteredInvestments.reduce((acc, curr) => acc + curr.entryValue, 0);
  const totalProfit = totalValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const allocationData = [
    { name: 'Renda Fixa', value: filteredInvestments.filter(i => i.type === 'FIXED_INCOME').reduce((acc, curr) => acc + curr.value, 0), color: '#6366f1' },
    { name: 'Ações', value: filteredInvestments.filter(i => i.type === 'STOCK').reduce((acc, curr) => acc + curr.value, 0), color: '#10b981' },
    { name: 'Cripto', value: filteredInvestments.filter(i => i.type === 'CRYPTO').reduce((acc, curr) => acc + curr.value, 0), color: '#f59e0b' },
    { name: 'FIIs', value: filteredInvestments.filter(i => i.type === 'REIT').reduce((acc, curr) => acc + curr.value, 0), color: '#ec4899' },
  ].filter(d => d.value > 0);

  const performanceData = [
    { month: 'Out', value: totalValue * 0.85 },
    { month: 'Nov', value: totalValue * 0.92 },
    { month: 'Dez', value: totalValue * 0.95 },
    { month: 'Jan', value: totalValue },
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'FIXED_INCOME': return <Landmark size={20} />;
      case 'STOCK': return <TrendingUp size={20} />;
      case 'CRYPTO': return <Cpu size={20} />;
      case 'REIT': return <Building2 size={20} />;
      default: return <CircleDollarSign size={20} />;
    }
  };

  const handleSaveAsset = (assetData: Partial<InvestmentAsset>) => {
    if (editingAsset) {
      updateInvestment(editingAsset.id, assetData);
    } else {
      addInvestment({
        ...assetData as InvestmentAsset,
        change24h: 0,
        allocation: 0
      });
    }
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-40 transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patrimônio Atual</p>
            <h2 className="text-2xl font-black text-slate-900">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1.5 font-bold ${totalDailyChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} w-fit px-3 py-1 rounded-xl text-[10px]`}>
            {totalDailyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>R$ {Math.abs(totalDailyChange).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (24h)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-40 transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Investido</p>
            <h2 className="text-2xl font-black text-slate-900">
              R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400">Preço Médio Acumulado</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-40 transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lucro/Prejuízo Total</p>
            <h2 className={`text-2xl font-black ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalProfit >= 0 ? '+' : ''}R$ {Math.abs(totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className={`flex items-center gap-1.5 font-bold ${totalProfit >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} w-fit px-3 py-1 rounded-xl text-[10px]`}>
            {totalProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{totalProfitPercent.toFixed(2)}% de Rendimento</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-40">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-1 text-sm">
              <PieChartIcon size={16} />
              AI Insights
            </h3>
            <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
              Sua rentabilidade este mês superou 95% dos perfis similares. Ótima gestão de risco!
            </p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all">
            Ver Detalhes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Evolução do Patrimônio</h3>
            <div className="flex gap-2">
              {['1M', '6M', '1Y', 'ALL'].map(t => (
                <button key={t} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${t === '1M' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                  itemStyle={{ fontWeight: 800, color: '#6366f1' }}
                  labelStyle={{ fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Alocação</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {allocationData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-800 text-sm">
                    {Math.round((item.value / totalValue) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-6 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Meus Ativos</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase">{investments.length} Ativos</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                placeholder="Buscar ativo, ticket ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-72"
              />
            </div>
            <button className="p-3 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all hover:border-slate-200">
              <Filter size={22} />
            </button>
            <button
              onClick={() => {
                setEditingAsset(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Gestão do Ativo</th>
                <th className="px-10 py-6">Entrada / Saída</th>
                <th className="px-10 py-6 text-right">Avaliação Atual</th>
                <th className="px-10 py-6 text-right">Rentabilidade Bruta</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvestments.map((asset) => {
                const profit = asset.value - asset.entryValue;
                const profitPercent = (profit / asset.entryValue) * 100;

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 rounded-[22px] flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-md transition-all scale-100 group-hover:scale-110">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-black text-slate-800">{asset.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md uppercase tracking-tighter">
                              {asset.type.replace('_', ' ')}
                            </span>
                            {asset.symbol && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{asset.symbol}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-xs font-black text-slate-700">R$ {asset.entryValue.toLocaleString('pt-BR')}</span>
                          <span className="text-[10px] font-bold text-slate-400">em {new Date(asset.entryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {asset.exitValue ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                            <span className="text-xs font-black text-slate-700">R$ {asset.exitValue.toLocaleString('pt-BR')}</span>
                            <span className="text-[10px] font-bold text-slate-400">em {new Date(asset.exitDate!).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 opacity-30">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <span className="text-[10px] font-black text-slate-400 italic">Posição Aberta</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-black text-slate-900">R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <div className={`flex items-center gap-1 text-[10px] font-black ${asset.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {asset.change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          <span>{Math.abs(asset.change24h)}% (24h)</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-base font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {profit >= 0 ? '+' : ''}R$ {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {profitPercent.toFixed(2)}% ROI
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsModalOpen(true);
                          }}
                          className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all"
                          title="Editar Lote"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja liquidar/excluir o ativo ${asset.name}?`)) {
                              deleteInvestment(asset.id);
                            }
                          }}
                          className="p-3 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all"
                          title="Excluir Lote"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Info Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-900 p-10 rounded-[40px] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <TrendingUp size={160} />
          </div>
          <div className="relative z-10">
            <h4 className="text-2xl font-black mb-4 tracking-tight">Estratégia Profissional</h4>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-md font-medium">
              A FiFlow utiliza modelos de marcação a mercado para garantir que seu patrimônio reflita o valor real de liquidação. O cálculo de ROI considera o reinvestimento de dividendos e taxas de custódia.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">CDI + 2.4%</div>
              <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">IPCA + 5.1%</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-2 border-slate-100 p-10 rounded-[40px] flex gap-8">
          <div className="w-16 h-16 bg-white shadow-xl shadow-slate-200 rounded-3xl flex items-center justify-center shrink-0">
            <History className="text-indigo-600" size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Histórico de Liquidação</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold">
              Aqui você tem o controle total sobre o ciclo de vida dos seus ativos. Acompanhe a janela temporal entre o aporte e a saída para otimizar ganhos de capital e tributação (GCAP).
            </p>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingAsset ? 'Editar Posição' : 'Novo Lote de Ativo'}
                </h3>
                <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">Controle Profissional de Carteira</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 shadow-sm transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveAsset({
                  name: formData.get('name') as string,
                  symbol: formData.get('symbol') as string,
                  type: formData.get('type') as any,
                  entryValue: Number(formData.get('entryValue')),
                  entryDate: formData.get('entryDate') as string,
                  value: Number(formData.get('value')),
                  exitValue: formData.get('exitValue') ? Number(formData.get('exitValue')) : undefined,
                  exitDate: formData.get('exitDate') ? formData.get('exitDate') as string : undefined,
                });
              }} className="space-y-8">

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Ativo</label>
                    <input
                      name="name"
                      defaultValue={editingAsset?.name}
                      placeholder="Ex: Tesouro Direto Selic"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket / Símbolo</label>
                    <input
                      name="symbol"
                      defaultValue={editingAsset?.symbol}
                      placeholder="Ex: BTC ou ITUB4"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe de Ativo</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'STOCK', label: 'Ações', icon: <TrendingUp size={16} /> },
                      { id: 'FIXED_INCOME', label: 'Renda Fixa', icon: <Landmark size={16} /> },
                      { id: 'CRYPTO', label: 'Cripto', icon: <Cpu size={16} /> },
                      { id: 'REIT', label: 'FIIs', icon: <Building2 size={16} /> }
                    ].map(type => (
                      <label key={type.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type.id}
                          defaultChecked={editingAsset?.type === type.id}
                          className="peer hidden"
                          required
                        />
                        <div className="flex flex-col items-center gap-2 p-4 rounded-3xl border-2 border-slate-100 bg-white peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all text-slate-400 peer-checked:text-indigo-600">
                          {type.icon}
                          <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Dados de Aporte (Entrada)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor de Entrada (R$)</label>
                      <input
                        name="entryValue"
                        type="number"
                        step="0.01"
                        defaultValue={editingAsset?.entryValue}
                        placeholder="0,00"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data da Compra</label>
                      <input
                        name="entryDate"
                        type="date"
                        defaultValue={editingAsset?.entryDate}
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign size={18} className="text-indigo-600" />
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Mercado Atual</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Atual (Mark-to-Market)</label>
                      <input
                        name="value"
                        type="number"
                        step="0.01"
                        defaultValue={editingAsset?.value}
                        placeholder="0,00"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6 border-l border-slate-100 pl-8">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight size={18} className="text-slate-400" />
                      <h4 className="font-black text-slate-400 text-sm uppercase tracking-tight italic">Dados de Saída (Opcional)</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Valor de Venda</label>
                        <input
                          name="exitValue"
                          type="number"
                          step="0.01"
                          defaultValue={editingAsset?.exitValue}
                          placeholder="0,00"
                          className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:border-rose-400 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Data da Venda</label>
                        <input
                          name="exitDate"
                          type="date"
                          defaultValue={editingAsset?.exitDate}
                          className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:border-rose-400 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 text-slate-400 font-black uppercase tracking-widest hover:bg-slate-50 rounded-[28px] transition-all text-xs"
                  >
                    Descartar Alterações
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-[28px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 text-xs"
                  >
                    <CheckCircle2 size={24} strokeWidth={3} />
                    Confirmar Gestão
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
