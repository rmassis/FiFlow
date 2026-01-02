
import React from 'react';
import { MOCK_CARDS } from '../../constants.tsx';
import { CreditCard as CardIcon, Plus, Calendar, ShieldCheck, AlertCircle, Info, MoreHorizontal } from 'lucide-react';

const CardsPage: React.FC = () => {
  const totalInvoices = MOCK_CARDS.reduce((acc, curr) => acc + curr.currentInvoice, 0);
  const totalLimit = MOCK_CARDS.reduce((acc, curr) => acc + curr.limit, 0);
  const totalUsedLimit = MOCK_CARDS.reduce((acc, curr) => acc + curr.usedLimit, 0);

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
            <span>Próximo vencimento em 4 dias</span>
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
            <span>{Math.round((totalUsedLimit / totalLimit) * 100)}% do limite utilizado</span>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h3 className="font-bold">IA Security</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Não detectamos compras suspeitas em seus cartões nos últimos 30 dias. Sua saúde financeira com cartões está estável.
            </p>
          </div>
          <button className="mt-4 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
            Relatório de Segurança
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Cartões</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Plus size={20} />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Credit Cards Horizontal Scroll or Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {MOCK_CARDS.map((card) => {
          const limitPercentage = (card.usedLimit / card.limit) * 100;
          return (
            <div key={card.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              {/* Card Visualization */}
              <div className="p-6">
                <div
                  className="w-full aspect-[1.58/1] rounded-[24px] p-8 text-white relative overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer"
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
        <button className="border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-500 transition-all group min-h-[400px]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            <Plus size={32} />
          </div>
          <p className="font-bold">Adicionar Cartão</p>
          <p className="text-xs text-slate-400 mt-1">Conecte seus cartões via Open Finance</p>
        </button>
      </div>
    </div>
  );
};

export default CardsPage;
