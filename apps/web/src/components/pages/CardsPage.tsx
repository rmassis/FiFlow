
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { CreditCard } from '../../types';
import {
  CreditCard as CardIcon,
  Plus,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Info,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Palette
} from 'lucide-react';

const CardsPage: React.FC = () => {
  const { cards, addCard, updateCard, deleteCard } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const totalInvoices = cards.reduce((acc, curr) => acc + curr.currentInvoice, 0);
  const totalLimit = cards.reduce((acc, curr) => acc + curr.limit, 0);
  const totalUsedLimit = cards.reduce((acc, curr) => acc + curr.usedLimit, 0);

  const handleSaveCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const cardData: Partial<CreditCard> = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as any,
      lastDigits: formData.get('lastDigits') as string,
      limit: Number(formData.get('limit')),
      closingDay: Number(formData.get('closingDay')),
      dueDay: Number(formData.get('dueDay')),
      color: formData.get('color') as string,
    };

    if (editingCard) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard({
        ...cardData as CreditCard,
        usedLimit: 0,
        currentInvoice: 0,
      });
    }

    setIsModalOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cards Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 md:p-8 rounded-[32px] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar size={64} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Faturas Abertas</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              R$ {totalInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl w-fit">
            <AlertCircle size={14} />
            <span>Total a vencer</span>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[32px] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <CardIcon size={64} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Limite Comprometido</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              R$ {totalUsedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl w-fit">
            <Info size={14} />
            <span>{totalLimit > 0 ? Math.round((totalUsedLimit / totalLimit) * 100) : 0}% do total utilizado</span>
          </div>
        </div>

        <div className="relative p-8 rounded-[32px] overflow-hidden shadow-xl shadow-indigo-500/10 flex flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 z-0"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-indigo-200" />
              <h3 className="font-bold tracking-wide">Financial Health</h3>
            </div>
            <p className="text-xs text-indigo-100/80 leading-relaxed font-medium max-w-[80%]">
              Seu score de crédito está protegido. Mantenha o uso do limite abaixo de 30% para otimizar sua pontuação.
            </p>
          </div>
          <button className="relative z-10 mt-4 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all w-fit backdrop-blur-md border border-white/10">
            Ver Análise Completa
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meus Cartões</h2>
        <button
          onClick={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Credit Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map((card) => {
          const limitPercentage = (card.usedLimit / card.limit) * 100;
          return (
            <div key={card.id} className="glass-panel p-0 rounded-[32px] overflow-hidden flex flex-col group/container hover:shadow-2xl transition-all duration-300 border-none bg-white dark:bg-slate-900">
              {/* Card Visualization */}
              <div className="p-6 relative bg-slate-50 dark:bg-slate-800/50">
                <div
                  className="w-full aspect-[1.58/1] rounded-[24px] p-8 text-white relative overflow-hidden shadow-2xl transition-transform transform group-hover/container:scale-[1.02] duration-500 border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                    boxShadow: `0 20px 40px -10px ${card.color}40`
                  }}
                >
                  {/* Noise Texture */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                  {/* Glass Shine */}
                  <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45 opacity-0 group-hover/container:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Nome do Cartão</span>
                      <span className="text-lg font-bold tracking-tight shadow-black/10 drop-shadow-sm">{card.name}</span>
                    </div>
                    <div className="h-8 flex items-center justify-end">
                      {card.brand === 'MASTERCARD' && (
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-rose-500/90 backdrop-blur-sm"></div>
                          <div className="w-8 h-8 rounded-full bg-amber-500/90 -ml-4 backdrop-blur-sm shadow-sm"></div>
                        </div>
                      )}
                      {card.brand === 'VISA' && (
                        <span className="italic font-black text-2xl tracking-tighter text-white/90">VISA</span>
                      )}
                      {/* Add other brands as needed */}
                      {(!['VISA', 'MASTERCARD'].includes(card.brand)) && (
                        <span className="font-bold text-sm tracking-widest bg-white/20 px-2 py-1 rounded backdrop-blur-md">{card.brand}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-7 bg-amber-200/80 rounded-md shadow-inner flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full border border-yellow-600/20 rounded-md flex">
                          <div className="w-1/2 border-r border-yellow-600/20"></div>
                          <div className="w-1/2"></div>
                        </div>
                      </div>
                      <CreditCard size={24} className="opacity-80" />
                    </div>
                    <span className="text-xl font-mono tracking-[0.2em] mt-2 block shadow-black/10 text-shadow">•••• •••• •••• {card.lastDigits}</span>
                  </div>

                  <div className="flex justify-between items-end relative z-10 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase opacity-70 tracking-widest mb-1">Disponível</span>
                      <span className="text-xl font-bold tracking-tight">R$ {(card.limit - card.usedLimit).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>


                  {/* Abstract background detail */}
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mb-20 blur-3xl"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mt-10 blur-2xl"></div>
                </div>

                {/* Management Overlay (Floating Buttons) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/container:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/container:translate-y-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCard(card);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-110 transition-transform shadow-lg border border-slate-200 dark:border-slate-700"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Excluir o cartão ${card.name}?`)) {
                        deleteCard(card.id);
                      }
                    }}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-rose-600 dark:text-rose-400 rounded-xl hover:scale-110 transition-transform shadow-lg border border-slate-200 dark:border-slate-700"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-8 space-y-6 flex-1 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Fatura Atual</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      R$ {card.currentInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 shadow-sm ${limitPercentage > 90 ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                        limitPercentage > 70 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                          'bg-gradient-to-r from-indigo-500 to-violet-600'
                        }`}
                      style={{ width: `${limitPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Limite: R$ {card.limit.toLocaleString('pt-BR')}</span>
                    <span className={`${limitPercentage > 80 ? 'text-rose-500' : ''}`}>{Math.round(limitPercentage)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Fecha</span>
                    </div>
                    <span className="text-xl font-bold text-slate-700 dark:text-slate-200">Dia {card.closingDay}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end text-end">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Vence</span>
                    </div>
                    <span className="text-xl font-bold text-slate-700 dark:text-slate-200">Dia {card.dueDay}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Create Card Placeholder */}
        <button
          onClick={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group min-h-[400px]"
        >
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
            <Plus size={32} />
          </div>
          <p className="font-bold text-lg">Adicionar Cartão</p>
          <p className="text-xs text-slate-400 mt-2 max-w-[200px] text-center">Cadastre seus cartões para controlar limites e faturas.</p>
        </button>
      </div>

      {/* Modern Credit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden bg-white dark:bg-slate-900 border border-white/20">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Dados do Cartão</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 shadow-sm transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Cartão</label>
                  <input
                    name="name"
                    defaultValue={editingCard?.name}
                    placeholder="Ex: Nubank Ultravioleta"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bandeira</label>
                  <select
                    name="brand"
                    defaultValue={editingCard?.brand || 'MASTERCARD'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
                    required
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="AMEX">Amex</option>
                    <option value="ELO">Elo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Últimos 4 Dígitos</label>
                  <input
                    name="lastDigits"
                    defaultValue={editingCard?.lastDigits}
                    maxLength={4}
                    placeholder="8821"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cor do Cartão</label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      name="color"
                      type="color"
                      defaultValue={editingCard?.color || '#6366f1'}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-12 py-1 cursor-pointer focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Limite Total (R$)</label>
                  <input
                    name="limit"
                    type="number"
                    defaultValue={editingCard?.limit}
                    placeholder="15.000,00"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dia de Fechamento</label>
                    <input
                      name="closingDay"
                      type="number"
                      min={1}
                      max={31}
                      defaultValue={editingCard?.closingDay}
                      placeholder="Ex: 25"
                      className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dia de Vencimento</label>
                    <input
                      name="dueDay"
                      type="number"
                      min={1}
                      max={31}
                      defaultValue={editingCard?.dueDay}
                      placeholder="Ex: 02"
                      className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 text-xs"
                >
                  <CheckCircle2 size={18} strokeWidth={3} />
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsPage;
