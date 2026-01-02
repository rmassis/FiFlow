
import React, { useState } from 'react';
import { MOCK_INVESTMENTS } from '../constants';
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
  Calendar,
  Wallet,
  X,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const InvestmentsPage: React.FC = () => {
  // State for Modals
  const [isNewInvestmentOpen, setIsNewInvestmentOpen] = useState(false);
  const [isCloseInvestmentOpen, setIsCloseInvestmentOpen] = useState(false);

  // State for Form/Actions
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Form States
  const [assetName, setAssetName] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetType, setAssetType] = useState('STOCK');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState(''); // Initial value for new asset
  const [entryDate, setEntryDate] = useState('');

  // Close Investment States
  const [exitDate, setExitDate] = useState('');
  const [exitAmount, setExitAmount] = useState('');

  const handleSaveInvestment = () => {
    console.log('Saving investment:', {
      name: assetName,
      symbol: assetSymbol,
      type: assetType,
      investedAmount: Number(investedAmount),
      value: Number(currentValue),
      entryDate
    });
    setIsNewInvestmentOpen(false);
    resetForm();
  };

  const handleCloseInvestment = () => {
    console.log('Closing investment:', {
      id: selectedAssetId,
      exitDate,
      exitAmount: Number(exitAmount)
    });
    setIsCloseInvestmentOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAssetName('');
    setAssetSymbol('');
    setAssetType('STOCK');
    setInvestedAmount('');
    setCurrentValue('');
    setEntryDate('');
    setExitDate('');
    setExitAmount('');
    setSelectedAssetId(null);
    setMenuOpenId(null);
  };

  const activeInvestments = MOCK_INVESTMENTS.filter(i => i.status === 'ACTIVE');
  const totalValue = activeInvestments.reduce((acc, curr) => acc + curr.value, 0);
  const totalInvested = activeInvestments.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const totalDailyChange = activeInvestments.reduce((acc, curr) => acc + (curr.value * (curr.change24h / 100)), 0);

  const allocationData = [
    { name: 'Renda Fixa', value: activeInvestments.filter(i => i.type === 'FIXED_INCOME').reduce((acc, curr) => acc + curr.value, 0), color: '#6366f1' },
    { name: 'Ações', value: activeInvestments.filter(i => i.type === 'STOCK').reduce((acc, curr) => acc + curr.value, 0), color: '#10b981' },
    { name: 'Cripto', value: activeInvestments.filter(i => i.type === 'CRYPTO').reduce((acc, curr) => acc + curr.value, 0), color: '#f59e0b' },
    { name: 'FIIs', value: activeInvestments.filter(i => i.type === 'REIT').reduce((acc, curr) => acc + curr.value, 0), color: '#ec4899' },
  ];

  const performanceData = [
    { month: 'Out', value: 85000 },
    { month: 'Nov', value: 88500 },
    { month: 'Dez', value: 92000 },
    { month: 'Jan', value: 95400 },
    { month: 'Fev', value: 98000 },
    { month: 'Mar', value: totalValue },
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-48">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Valor do Patrimônio</p>
            <h2 className="text-3xl font-extrabold text-slate-900">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 w-fit px-3 py-1 rounded-xl text-sm">
            <TrendingUp size={16} />
            <span>+R$ {totalDailyChange.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (hoje)</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-48">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Rentabilidade Mensal</p>
            <h2 className="text-3xl font-extrabold text-slate-900">2.45%</h2>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 w-fit px-3 py-1 rounded-xl text-sm">
            <span>Superando o CDI em 12%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-48">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <PieChartIcon size={20} />
              AI Insights
            </h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Sua exposição em Cripto aumentou. Considere rebalancear sua carteira para manter seu perfil conservador.
            </p>
          </div>
          <button className="text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all">
            Ver Recomendações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Evolução da Carteira</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">1M</button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">6M</button>
              <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">1Y</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} hide />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Alocação por Classe</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {allocationData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">
                  {Math.round((item.value / totalValue) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-800">Meus Ativos</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Filtrar ativos..."
                className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 w-48"
              />
            </div>
            <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter size={20} />
            </button>
            <button
              onClick={() => setIsNewInvestmentOpen(true)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Ativo</th>
                <th className="px-8 py-4">Classe</th>
                <th className="px-8 py-4 text-right">Custo Total</th>
                <th className="px-8 py-4 text-right">Saldo Atual</th>
                <th className="px-8 py-4 text-right">Rentabilidade</th>
                <th className="px-8 py-4 text-right">Alocação</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeInvestments.map((asset) => {
                const gain = asset.value - asset.investedAmount;
                const gainPercent = (gain / asset.investedAmount) * 100;

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{asset.name}</span>
                          {asset.symbol && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.symbol}</span>}
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {new Date(asset.entryDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                        {asset.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500 text-right">
                      R$ {asset.investedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-sm font-extrabold text-slate-800 text-right">
                      R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-8 py-5 text-sm font-bold text-right ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          {gain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {gainPercent.toFixed(2)}%
                        </div>
                        <span className="text-[10px] opacity-80">
                          {gain >= 0 ? '+' : ''}R$ {gain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-slate-500">{asset.allocation}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${asset.allocation}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === asset.id ? null : asset.id)}
                          className={`p-2 rounded-lg transition-all ${menuOpenId === asset.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuOpenId === asset.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                              <button
                                onClick={() => {
                                  console.log('Edit asset:', asset.name);
                                  setAssetName(asset.name);
                                  setAssetSymbol(asset.symbol || '');
                                  setInvestedAmount(String(asset.investedAmount));
                                  setCurrentValue(String(asset.value));
                                  setEntryDate(asset.entryDate);
                                  setIsNewInvestmentOpen(true);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                              >
                                <Edit2 size={16} />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAssetId(asset.id);
                                  setIsCloseInvestmentOpen(true);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors border-t border-slate-50"
                              >
                                <CheckCircle2 size={16} />
                                Encerrar Posição
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Investment Modal */}
      {isNewInvestmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedAssetId ? 'Editar Ativo' : 'Novo Ativo'}
                </h2>
                <button onClick={() => setIsNewInvestmentOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Ativo</label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Ex: Tesouro Selic, Apple, Bitcoin"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Código (Opcional)</label>
                    <input
                      type="text"
                      value={assetSymbol}
                      onChange={(e) => setAssetSymbol(e.target.value)}
                      placeholder="Ex: AAPL"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 bg-white"
                    >
                      <option value="STOCK">Ações</option>
                      <option value="FIXED_INCOME">Renda Fixa</option>
                      <option value="CRYPTO">Criptomoedas</option>
                      <option value="REIT">FIIs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Investido</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input
                        type="number"
                        value={investedAmount}
                        onChange={(e) => setInvestedAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Atual</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Entrada</label>
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsNewInvestmentOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveInvestment}
                    disabled={!assetName || !investedAmount}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Investment Modal */}
      {isCloseInvestmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Encerrar Posição</h2>
                <button onClick={() => setIsCloseInvestmentOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl mb-6">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Ao encerrar esta posição, o lucro/prejuízo será realizado e o ativo deixará de compor seu patrimônio atual.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Saída</label>
                  <input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor Total de Venda</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={exitAmount}
                      onChange={(e) => setExitAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsCloseInvestmentOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCloseInvestment}
                    disabled={!exitDate || !exitAmount}
                    className="flex-1 h-12 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
