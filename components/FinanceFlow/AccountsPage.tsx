import React from 'react';
import { MOCK_ACCOUNTS } from '../constants.tsx';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  ShieldCheck,
  Landmark,
  PiggyBank,
  Briefcase,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const AccountsPage: React.FC = () => {
  const totalBalance = MOCK_ACCOUNTS.reduce((acc, curr) => acc + curr.balance, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECKING': return <Landmark size={20} />;
      case 'SAVINGS': return <PiggyBank size={20} />;
      case 'INVESTMENT': return <TrendingUp size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CHECKING': return 'Conta Corrente';
      case 'SAVINGS': return 'Poupança / Reserva';
      case 'INVESTMENT': return 'Conta Investimento';
      default: return 'Outros';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Total Balance Summary */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-100">
            <Wallet size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Saldo Total Consolidado</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Segurança</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <ShieldCheck size={18} />
              <span>Proteção Ativa</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
            <Plus size={20} />
            <span>Conectar Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_ACCOUNTS.map((account) => (
          <div key={account.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: account.color }}
                  >
                    {getTypeIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{account.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{account.bankName}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo em conta</p>
                  <p className="text-3xl font-black text-slate-900">
                    R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400 mb-1">{account.accountNumber}</p>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                    {getTypeText(account.type)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100 group-hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                  <ArrowUpRight size={14} />
                  Transferir
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:underline">
                  <ArrowDownLeft size={14} />
                  Extrato
                </button>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}

        {/* AI Recommendation Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[32px] border border-indigo-100 p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sugestão da IA ✨</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Identificamos que você tem R$ 12.000,00 parados na sua conta principal há mais de 20 dias.
              Deseja transferir para sua reserva Itaú que rende 100% do CDI?
            </p>
          </div>
          <button className="relative z-10 w-full py-3 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all text-sm shadow-sm">
            Otimizar Saldo
          </button>

          {/* Abstract BG */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
