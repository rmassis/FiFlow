
import React, { useState } from 'react';
import { CATEGORIES, MOCK_BUDGET, MOCK_TRANSACTIONS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Edit2, Plus, Info, AlertCircle, CheckCircle2, X, MoreHorizontal, Trash2 } from 'lucide-react';

const BudgetPage: React.FC = () => {
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleSaveBudget = () => {
    console.log('Saving budget:', { category: selectedCategory, amount: Number(amount) });
    setIsNewBudgetOpen(false);
    setSelectedCategory('');
    setAmount('');
  };

  const totalPlanned = MOCK_BUDGET.reduce((acc, curr) => acc + curr.planned, 0);
  const totalActual = MOCK_BUDGET.reduce((acc, curr) => acc + curr.actual, 0);
  const totalRemaining = totalPlanned - totalActual;
  const overallProgress = (totalActual / totalPlanned) * 100;

  const budgetData = CATEGORIES.map(cat => {
    const budgetEntry = MOCK_BUDGET.find(b => b.categoryId === cat.id);
    const planned = budgetEntry?.planned || 0;

    // Calculate actual spend based on transactions
    const actual = MOCK_TRANSACTIONS
      .filter(t => t.type === 'EXPENSE' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = planned > 0 ? (actual / planned) * 100 : 0;

    return {
      ...cat,
      planned,
      actual,
      percent,
      remaining: planned - actual
    };
  }).filter(item => item.planned > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Gasto', value: totalActual },
                    { name: 'Disponível', value: Math.max(0, totalRemaining) }
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{Math.round(overallProgress)}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Utilizado</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Planejado</p>
              <p className="text-2xl font-bold text-slate-900">R$ {totalPlanned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Gasto</p>
              <p className="text-2xl font-bold text-slate-900">R$ {totalActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="col-span-2 p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Saldo do Orçamento</p>
                <p className={`text-lg font-bold ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-2 rounded-xl ${totalRemaining >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {totalRemaining >= 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-indigo-100">
          <div>
            <h3 className="text-lg font-bold mb-2">Dica da IA ✨</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Você já atingiu 85% do seu orçamento de Lazer. Considere reduzir pequenos gastos extras nesta semana para fechar o mês no azul!
            </p>
          </div>
          <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-sm transition-all">
            Ver Análise Completa
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Orçamento por Categoria</h2>
          <button
            onClick={() => setIsNewBudgetOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <Plus size={18} />
            <span>Novo Orçamento</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {budgetData.map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-50" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      R$ {item.actual.toLocaleString('pt-BR')} de R$ {item.planned.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${item.remaining >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                      {item.remaining >= 0 ? 'R$ ' + item.remaining.toLocaleString('pt-BR') : 'Excedido'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Restante</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                      className={`p-2 rounded-lg transition-all ${menuOpenId === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {menuOpenId === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                          <button
                            onClick={() => {
                              console.log('Edit budget:', item.name);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              console.log('Delete budget:', item.name);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-50"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${item.percent > 100 ? 'bg-rose-500' : item.percent > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>0%</span>
                <span>{Math.round(item.percent)}% utilizado</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-[24px] flex gap-4">
        <div className="text-indigo-600 mt-1">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-1 text-sm">Como funciona o Orçamento?</h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            O Orçamento ajuda você a controlar seus limites de gastos mensais. Os valores "Gastos" são atualizados automaticamente com base nos seus lançamentos. Categorias sem orçamento planejado não aparecem nesta lista.
          </p>
        </div>
      </div>

      {isNewBudgetOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Novo Orçamento</h2>
                <button onClick={() => setIsNewBudgetOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white text-slate-800 font-medium appearance-none"
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor Planejado</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsNewBudgetOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveBudget}
                    disabled={!selectedCategory || !amount}
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
    </div>
  );
};

export default BudgetPage;
