
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Cards Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Calendar size={64} className="text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Faturas Abertas</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              R$ {totalInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-xl w-fit">
            <AlertCircle size={14} />
            <span>Total a vencer</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <CardIcon size={64} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Limite Comprometido</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              R$ {totalUsedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-xl w-fit">
            <Info size={14} />
            <span>{totalLimit > 0 ? Math.round((totalUsedLimit / totalLimit) * 100) : 0}% do total utilizado</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] shadow-xl shadow-indigo-200 text-white flex flex-col justify-between relative overflow-hidden">

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={20} className="text-indigo-200" />
              <h3 className="font-bold tracking-wide">Saúde Financeira</h3>
            </div>
            <p className="text-xs text-indigo-100/90 leading-relaxed font-medium max-w-[90%]">
              Seu score de crédito está protegido. Mantenha o uso do limite abaixo de 30% para otimizar sua pontuação.
            </p>
          </div>
          {/* Abstract Circle */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Cartões</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie seus cartões de crédito</p>
        </div>

        <button
          onClick={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Credit Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-slate-100">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CardIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Nenhum cartão cadastrado</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Adicione seus cartões para controlar faturas e limites.</p>
          </div>
        )}

        {cards.map((card) => {
          const limitPercentage = card.limit > 0 ? (card.usedLimit / card.limit) * 100 : 0;
          return (
            <div key={card.id} className="group bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-300">

              {/* Card Visual */}
              <div
                className="w-full aspect-[1.58/1] rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02] duration-500 mb-6"
                style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}
              >
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                {/* Glass Shine */}
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Nome do Cartão</p>
                    <p className="font-bold text-lg shadow-black/10 drop-shadow-sm">{card.name}</p>
                  </div>
                  {card.brand === 'MASTERCARD' && (
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md"></div>
                      <div className="w-8 h-8 rounded-full bg-white/30 -ml-4 backdrop-blur-md"></div>
                    </div>
                  )}
                  {card.brand === 'VISA' && <span className="font-black italic text-xl">VISA</span>}
                </div>

                <div className="mt-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-amber-200/40 rounded flex overflow-hidden border border-white/30 backdrop-blur-sm">
                      <div className="w-1/2 border-r border-white/20"></div>
                    </div>
                    <span className="font-mono text-lg tracking-widest shadow-black/10 text-shadow">•••• {card.lastDigits}</span>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 z-10 text-right">
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Limite Disponível</p>
                  <p className="font-bold text-xl">R$ {(card.limit - card.usedLimit).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {/* Card Info & Actions */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fatura Atual</p>
                  <p className="text-2xl font-bold text-slate-900">R$ {card.currentInvoice.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o cartão ${card.name}?`)) {
                        deleteCard(card.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Uso do Limite</span>
                  <span className={limitPercentage > 80 ? 'text-rose-500' : 'text-indigo-500'}>{Math.round(limitPercentage)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${limitPercentage > 90 ? 'bg-rose-500' :
                        limitPercentage > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                    style={{ width: `${Math.min(limitPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Fechamento
                  </p>
                  <p className="text-sm font-bold text-slate-700">Dia {card.closingDay}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                    <Calendar size={12} /> Vencimento
                  </p>
                  <p className="text-sm font-bold text-slate-700">Dia {card.dueDay}</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal matching "Novo Cartão" Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-300/90 backdrop-blur-xl w-full max-w-lg rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-white/20">
            {/* Header */}
            <div className="px-8 py-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Dados do Cartão</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="px-8 pb-8 space-y-5">

              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Cartão</label>
                  <input
                    name="name"
                    defaultValue={editingCard?.name}
                    placeholder="Inter Gold"
                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Bandeira</label>
                  <select
                    name="brand"
                    defaultValue={editingCard?.brand || 'MASTERCARD'}
                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    required
                  >
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="VISA">Visa</option>
                    <option value="AMEX">Amex</option>
                    <option value="ELO">Elo</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Últimos 4 Dígitos</label>
                  <input
                    name="lastDigits"
                    defaultValue={editingCard?.lastDigits}
                    maxLength={4}
                    placeholder="1345"
                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cor do Cartão</label>
                  <div className="relative bg-white rounded-xl shadow-sm flex items-center pr-2">
                    <div className="pl-3 text-slate-400">
                      <Palette size={16} />
                    </div>
                    <input
                      name="color"
                      type="color"
                      defaultValue={editingCard?.color || '#ffd700'}
                      className="w-full h-11 bg-transparent border-none cursor-pointer rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* White Container for Details */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Limite Total (R$)</label>
                  <input
                    name="limit"
                    type="number"
                    defaultValue={editingCard?.limit}
                    placeholder="15000"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dia de Fechamento</label>
                    <input
                      name="closingDay"
                      type="number"
                      min="1" max="31"
                      defaultValue={editingCard?.closingDay}
                      placeholder="04"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dia de Vencimento</label>
                    <input
                      name="dueDay"
                      type="number"
                      min="1" max="31"
                      defaultValue={editingCard?.dueDay}
                      placeholder="10"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
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
