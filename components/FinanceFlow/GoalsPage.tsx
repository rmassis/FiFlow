
import React, { useState } from 'react';
import { MOCK_GOALS } from '../constants';
import { Target, Plus, TrendingUp, Calendar, ChevronRight, MoreVertical, Star, X, Trash2, DollarSign } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // New state for improvements
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleSaveGoal = () => {
    console.log('Saving goal:', {
      name: goalName,
      target: Number(targetAmount),
      current: Number(currentAmount),
      deadline
    });
    setIsNewGoalOpen(false);
    // Reset form
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
  };

  const handleAddFunds = () => {
    console.log(`Adding R$ ${fundAmount} to goal ${selectedGoalId}`);
    setIsAddFundsOpen(false);
    setFundAmount('');
    setSelectedGoalId(null);
  };

  const handleDeleteGoal = (id: string) => {
    console.log(`Deleting goal ${id}`);
    setMenuOpenId(null);
  };

  const totalTarget = MOCK_GOALS.reduce((acc, curr) => acc + curr.target, 0);
  const totalSaved = MOCK_GOALS.reduce((acc, curr) => acc + curr.current, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

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
                <span className="opacity-80">R$ {(totalTarget - totalSaved).toLocaleString('pt-BR')} restantes</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Abstract background shapes */}
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
              Você economizou R$ 3.200,00 a mais que o planejado neste mês. Deseja aplicar esse valor em uma de suas metas?
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
          onClick={() => setIsNewGoalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <Plus size={20} className="text-indigo-600" />
          <span>Nova Meta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GOALS.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  <Target size={28} />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === goal.id ? null : goal.id)}
                    className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {menuOpenId === goal.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 size={16} />
                          Excluir Meta
                        </button>
                      </div>
                    </>
                  )}
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
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {Math.round(progress)}%
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">Previsão: Dez 2025</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setIsAddFundsOpen(true);
                }}
                className="mt-6 w-full py-2 border-2 border-slate-50 text-slate-400 font-bold text-xs rounded-xl hover:border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest"
              >
                Adicionar Fundo
              </button>
            </div>
          );
        })}

        {/* Create Goal Placeholder */}
        <button
          onClick={() => setIsNewGoalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Plus size={32} />
          </div>
          <p className="font-bold">Adicionar Novo Objetivo</p>
          <p className="text-xs text-slate-400 mt-1">Defina seus sonhos e comece a poupar</p>
        </button>
      </div>

      {isNewGoalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nova Meta</h2>
                <button onClick={() => setIsNewGoalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Objetivo</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Ex: Viagem para Disney, Carro Novo..."
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-medium placeholder:font-normal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Valor Alvo</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Já Tenho</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                      <input
                        type="number"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prazo Estimado</label>
                  <input
                    type="month"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsNewGoalOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveGoal}
                    disabled={!goalName || !targetAmount}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                  >
                    Salvar Meta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Adicionar Fundo</h2>
                <button
                  onClick={() => setIsAddFundsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor a Adicionar</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 font-bold"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsAddFundsOpen(false)}
                    className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddFunds}
                    disabled={!fundAmount}
                    className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                  >
                    Adicionar
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

export default GoalsPage;
