
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Target, Plus, TrendingUp, Calendar, ChevronRight, MoreVertical, Star, X, Trash2, ArrowUpCircle, Edit2 } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.current, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleSaveGoal = (goalData: any) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal({
        ...goalData,
        current: 0
      });
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleContribution = (amount: number) => {
    if (selectedGoal) {
      updateGoal(selectedGoal.id, { current: selectedGoal.current + amount });
      setIsContributionModalOpen(false);
      setSelectedGoal(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star size={20} className="text-amber-300 fill-amber-300" />
              Progresso das Suas Conquistas
            </h2>
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-8">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Acumulado</p>
                <p className="text-4xl font-extrabold">R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-10 w-px bg-white/20 hidden md:block mb-1"></div>
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Meta Global</p>
                <p className="text-xl font-bold opacity-90">R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>{Math.round(overallProgress)}% Concluído</span>
                <span className="opacity-80">R$ {Math.max(0, totalTarget - totalSaved).toLocaleString('pt-BR')} restantes</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Poupador Master</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Deseja alocar saldo extra em uma de suas metas para acelerar sua conquista?
            </p>
          </div>
          <button className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            Alocar Saldo
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Suas Metas Ativas</h2>
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <Plus size={20} className="text-indigo-600" />
          <span>Nova Meta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          return (
            <div key={goal.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Target size={28} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir esta meta?')) deleteGoal(goal.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-bold text-slate-800 mb-1">{goal.name}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Objetivo Financeiro</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Acumulado</span>
                    <span className="text-lg font-extrabold text-slate-900">R$ {goal.current.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Meta</span>
                    <p className="text-sm font-bold text-slate-600">R$ {goal.target.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {Math.round(progress)}%
                  </span>
                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">Até: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedGoal(goal);
                  setIsContributionModalOpen(true);
                }}
                className="mt-6 w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 font-bold text-xs rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ArrowUpCircle size={16} />
                Fazer Aporte
              </button>
            </div>
          );
        })}

        {/* Create Goal Placeholder */}
        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Plus size={32} />
          </div>
          <p className="font-bold">Adicionar Novo Objetivo</p>
          <p className="text-xs text-slate-400 mt-1">Defina seus sonhos e comece a poupar</p>
        </button>
      </div>

      {/* Goal Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveGoal({
                  name: formData.get('name'),
                  target: Number(formData.get('target')),
                  deadline: formData.get('deadline'),
                });
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Objetivo</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingGoal?.name || ''}
                    placeholder="Ex: Viagem, Carro Novo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor Alvo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input
                      name="target"
                      type="number"
                      step="0.01"
                      defaultValue={editingGoal?.target || ''}
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prazo (Opcional)</label>
                  <input
                    name="deadline"
                    type="date"
                    defaultValue={editingGoal?.deadline || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Salvar Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {isContributionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Fazer Aporte</h3>
                <button
                  onClick={() => setIsContributionModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-500">Adicione um valor à sua meta:</p>
                <p className="font-bold text-lg text-slate-800">{selectedGoal?.name}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleContribution(Number(formData.get('amount')));
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor do Aporte</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsContributionModalOpen(false)}
                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Confirmar Aporte
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

export default GoalsPage;
