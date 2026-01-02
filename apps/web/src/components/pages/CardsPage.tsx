
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
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Faturas Atuais</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              R$ {totalInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-xl w-fit">
            <AlertCircle size={14} />
            <span>Próximo vencimento em breve</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Limite Total</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-xl w-fit">
            <Info size={14} />
            <span>{totalLimit > 0 ? Math.round((totalUsedLimit / totalLimit) * 100) : 0}% do limite utilizado</span>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h3 className="font-bold">IA Security</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saúde financeira estável. Use conscientemente o limite de seus cartões para manter um bom score.
            </p>
          </div>
          <button className="mt-4 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
            Relatório de Segurança
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Cartões</h2>
        <button
          onClick={() => {
            setEditingCard(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
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
            <div key={card.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group/container hover:shadow-xl transition-all duration-300">
              {/* Card Visualization */}
              <div className="p-6 relative">
                <div
                  className="w-full aspect-[1.58/1] rounded-[24px] p-8 text-white relative overflow-hidden shadow-2xl transition-transform cursor-default"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                    boxShadow: `0 20px 40px -10px ${card.color}44`
                  }}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium opacity-70">Nome do Cartão</span>
                      <span className="text-lg font-bold tracking-tight">{card.name}</span>
                    </div>
                    <div className="w-12 h-8 flex items-center justify-end">
                      {card.brand === 'MASTERCARD' && (
                        <div className="flex">
                          <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90"></div>
                          <div className="w-6 h-6 rounded-full bg-amber-500 -ml-3 opacity-90"></div>
                        </div>
                      )}
                      {card.brand === 'VISA' && (
                        <span className="italic font-black text-2xl tracking-tighter">VISA</span>
                      )}
                      {card.brand === 'AMEX' && (
                        <span className="font-bold text-sm tracking-widest bg-blue-500/30 px-2 rounded">AMEX</span>
                      )}
                      {card.brand === 'ELO' && (
                        <span className="font-bold text-lg italic bg-white/20 px-2 rounded">ELO</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 mb-2 relative z-10">
                    <span className="text-xl font-mono tracking-[0.2em]">•••• •••• •••• {card.lastDigits}</span>
                  </div>

                  <div className="flex justify-between items-end relative z-10 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase opacity-60">Limite Disponível</span>
                      <span className="text-lg font-bold">R$ {(card.limit - card.usedLimit).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                      <CardIcon size={20} />
                    </div>
                  </div>

                  {/* Management Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover/container:opacity-100 transition-all flex items-center justify-center gap-4 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCard(card);
                        setIsModalOpen(true);
                      }}
                      className="p-4 bg-white text-indigo-600 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                      title="Editar Configurações"
                    >
                      <Edit2 size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir o cartão ${card.name}? Esta ação não pode ser desfeita.`)) {
                          deleteCard(card.id);
                        }
                      }}
                      className="p-4 bg-white text-rose-600 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                      title="Excluir Cartão"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>

                  {/* Abstract background detail */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-8 space-y-6 flex-1 bg-slate-50/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Resumo da Fatura</h4>
                  <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline">
                    Ver Detalhes
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-500">Gasto Atual</span>
                    <span className="text-lg font-extrabold text-slate-900">R$ {card.currentInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${limitPercentage > 90 ? 'bg-rose-500' : limitPercentage > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                      style={{ width: `${limitPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Limite: R$ {card.limit.toLocaleString('pt-BR')}</span>
                    <span>{Math.round(limitPercentage)}% Usado</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Fechamento</p>
                      <p className="text-sm font-bold text-slate-800">Dia {card.closingDay}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Vencimento</p>
                      <p className="text-sm font-bold text-slate-800">Dia {card.dueDay}</p>
                    </div>
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
          className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all group min-h-[400px]"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            <Plus size={32} />
          </div>
          <p className="font-bold">Adicionar Cartão</p>
          <p className="text-xs text-slate-400 mt-1">Configure o ciclo do seu cartão manualmente</p>
        </button>
      </div>

      {/* Modern Credit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Configuração de Faturamento</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl text-slate-400 shadow-sm transition-all"
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
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bandeira</label>
                  <select
                    name="brand"
                    defaultValue={editingCard?.brand || 'MASTERCARD'}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
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
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
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
                      className="w-full h-11 bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-1 cursor-pointer focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Limite Total (R$)</label>
                  <input
                    name="limit"
                    type="number"
                    defaultValue={editingCard?.limit}
                    placeholder="15.000,00"
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
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
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
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
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 text-xs"
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
