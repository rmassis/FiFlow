
import React, { useState, useMemo } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Edit2, Plus, Info, AlertCircle, CheckCircle2, X, Trash2, Wallet, Search } from 'lucide-react';
import { Category } from '../../types';

const BudgetPage: React.FC = () => {
  const { budgets, transactions, categories, updateBudget, deleteBudget, addCategory } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the modal form
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string; planned: number } | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate budget data (keeping logic consistent with context)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Unique Categories for the Dropdown (Handle duplicates by name)
  const uniqueCategories = useMemo(() => {
    const unique = new Map();
    categories.forEach(c => {
      if (!unique.has(c.name)) {
        unique.set(c.name, c);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const budgetData = useMemo(() => {
    // We iterate through UNIQUE category NAMES to calculate budgets
    // This handles cases where multiple category rows exist with same name
    return uniqueCategories.map(cat => {
      // Find budget by ID (first matching category ID with budget)
      // Or find budget that matches any category with this name? 
      // Current system links Budget -> CategoryID.
      // If we have duplicate categories, budget might be on one ID, transactions on another (if referenced by ID).
      // But transactions reference by NAME in current logic.

      // To be safe: Find budget for THIS specific category ID.
      const budgetEntry = budgets.find(b => b.categoryId === cat.id);
      const planned = budgetEntry?.planned || 0;

      // Transações: Filter by Category NAME (aggregates all "Alimentação")
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
        planned, // Only shows if budget exists for THIS ID
        actual,
        percent,
        remaining: planned - actual
      };
    }).filter(item => item.planned > 0);
  }, [uniqueCategories, budgets, transactions, currentMonth, currentYear]);

  const totalPlanned = budgets.reduce((acc, curr) => acc + curr.planned, 0);
  const totalActual = budgetData.reduce((acc, curr) => acc + curr.actual, 0);
  const totalRemaining = totalPlanned - totalActual;
  const overallProgress = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    let categoryId = formData.get('categoryId') as string;
    const planned = parseFloat(formData.get('planned') as string);

    if (isCreatingCategory && newCategoryName) {
      // Create new category first
      const newCat = await addCategory({
        name: newCategoryName,
        icon: '🆕', // Default icon for new ones
        color: '#6366f1'
      });
      if (newCat) {
        categoryId = newCat.id;
      } else {
        return; // Error creating
      }
    }

    if (categoryId && !isNaN(planned)) {
      await updateBudget(categoryId, planned);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header / Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
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

          <div className="flex-1 grid grid-cols-2 gap-8 w-full">
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
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Saldo Total</p>
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

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-indigo-100">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Monitoramento</h3>
            <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
              Acompanhe se seus gastos reais estão dentro do planejado. O cálculo considera todas as despesas do mês atual.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Orçamentos Ativos</h2>
            <p className="text-sm text-slate-400 mt-1">Gerencie limites para cada categoria</p>
          </div>
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsCreatingCategory(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus size={20} />
            <span>Novo Orçamento</span>
          </button>
        </div>

        <div className="p-8">
          {budgetData.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Nenhum orçamento definido</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comece definindo limites para suas categorias e assuma o controle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetData.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.percent > 100 ? 'bg-rose-100 text-rose-600' :
                              item.percent > 85 ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-emerald-600'
                            }`}>
                            {item.percent > 100 ? 'Estourado' : item.percent > 85 ? 'Alerta' : 'No Controle'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => {
                          setEditingBudget({ categoryId: item.id, planned: item.planned });
                          setIsDevelopingCategory(false);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o orçamento de ${item.name}?`)) {
                            deleteBudget(item.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Gasto</p>
                      <p className="text-lg font-bold text-slate-700">R$ {item.actual.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Limite</p>
                      <p className="text-lg font-bold text-slate-900">R$ {item.planned.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${item.percent > 100 ? 'bg-rose-500' : item.percent > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">
                      {Math.round(item.percent)}% utilizado
                    </span>
                    <span className={`text-xs font-bold ${item.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.remaining >= 0 ? `Restam R$ ${item.remaining.toLocaleString('pt-BR')}` : `Excedido em R$ ${Math.abs(item.remaining).toLocaleString('pt-BR')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">Defina seus limites mensais</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-6">
              {!editingBudget && (
                <div className="bg-indigo-50/50 p-1 rounded-xl flex mb-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(false)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isCreatingCategory ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                  >
                    Existente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isCreatingCategory ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                  >
                    Nova Categoria
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                {isCreatingCategory ? (
                  <input
                    type="text"
                    placeholder="Nome da nova categoria..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    required
                  />
                ) : (
                  <div className="relative">
                    <select
                      name="categoryId"
                      defaultValue={editingBudget?.categoryId || ''}
                      disabled={!!editingBudget}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="" disabled>Selecione uma categoria...</option>
                      {uniqueCategories
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))
                      }
                    </select>
                    {!editingBudget && <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Limite Mensal</label>
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
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
