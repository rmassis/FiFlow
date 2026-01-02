
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Edit2, Plus, Info, AlertCircle, CheckCircle2, X, Trash2 } from 'lucide-react';

const BudgetPage: React.FC = () => {
  const { budgets, transactions, categories, updateBudget, deleteBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string; planned: number } | null>(null);

  // Calcular orçamentos reais baseados nas transações do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const budgetData = categories.map(cat => {
    const budgetEntry = budgets.find(b => b.categoryId === cat.id);
    const planned = budgetEntry?.planned || 0;

    // Calcular o gasto real desta categoria no mês atual
    const actual = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.category === cat.name &&
          t.type === 'EXPENSE' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const percent = planned > 0 ? (actual / planned) * 100 : 0;

    return {
      ...cat,
      planned,
      actual,
      percent,
      remaining: planned - actual
    };
  }).filter(item => item.planned > 0 || (editingBudget && editingBudget.categoryId === item.id));

  const totalPlanned = budgets.reduce((acc, curr) => acc + curr.planned, 0);
  const totalActual = budgetData.reduce((acc, curr) => acc + curr.actual, 0);
  const totalRemaining = totalPlanned - totalActual;
  const overallProgress = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const handleSaveBudget = (categoryId: string, planned: number) => {
    updateBudget(categoryId, planned);
    setIsModalOpen(false);
    setEditingBudget(null);
  };

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
            <h3 className="text-lg font-bold mb-2">Controle Mensal ✨</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Dica: Você está no caminho certo! Lembre-se que o orçamento é reiniciado todo início de mês.
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
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <Plus size={18} />
            <span>Novo Orçamento</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {budgetData.filter(item => item.planned > 0).length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">
              Nenhum orçamento definido para este mês.
            </div>
          )}
          {budgetData.filter(item => item.planned > 0).map((item) => (
            <div key={item.id} className="space-y-3 group animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50 transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      R$ {item.actual.toLocaleString('pt-BR')} de R$ {item.planned.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className={`text-sm font-bold ${item.remaining >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                      {item.remaining >= 0 ? 'R$ ' + item.remaining.toLocaleString('pt-BR') : 'Excedido'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Saldo {item.remaining >= 0 ? 'Restante' : 'Extra'}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingBudget({ categoryId: item.id, planned: item.planned });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o orçamento de ${item.name}?`)) {
                          deleteBudget(item.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${item.percent > 100 ? 'bg-rose-500' : item.percent > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className={item.percent > 100 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full' : ''}>
                  {Math.round(item.percent)}% utilizado
                </span>
                <span>Limite: R$ {item.planned.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex gap-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2">Como os gastos são calculados?</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            Seus gastos são filtrados automaticamente a partir das transações cadastradas para a categoria correspondente dentro do mês e ano atuais. Despesas marcadas como "EXPENSE" alimentam o progresso do seu orçamento.
          </p>
        </div>
      </div>

      {/* Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Defina seu limite de gastos mensal</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveBudget(
                  formData.get('categoryId') as string,
                  Number(formData.get('planned'))
                );
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                  <select
                    name="categoryId"
                    defaultValue={editingBudget?.categoryId || ''}
                    disabled={!!editingBudget}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="" disabled>Escolha uma categoria...</option>
                    {categories
                      .filter(c => !budgets.find(b => b.categoryId === c.id) || c.id === editingBudget?.categoryId)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Limite Mensal Planejado</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">R$</span>
                    <input
                      name="planned"
                      type="number"
                      step="0.01"
                      defaultValue={editingBudget?.planned || ''}
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-slate-300"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Salvar Orçamento
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

export default BudgetPage;
