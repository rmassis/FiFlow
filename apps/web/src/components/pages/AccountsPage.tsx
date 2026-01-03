
import React from 'react';
import { useFinance } from '../../contexts/FinanceContext';
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
  TrendingUp,
  X,
  Check
} from 'lucide-react';

const AccountsPage: React.FC = () => {
  const { accounts, addAccount } = useFinance();
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = React.useState(false);
  const [newAccountData, setNewAccountData] = React.useState({
    name: '',
    bankName: '',
    type: 'CHECKING',
    balance: '',
    color: '#6366f1'
  });
  const [loading, setLoading] = React.useState(false);
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

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

  const handleSaveAccount = async () => {
    if (!newAccountData.name || !newAccountData.balance) return;

    setLoading(true);
    try {
      await addAccount({
        name: newAccountData.name,
        bankName: newAccountData.bankName || 'Banco',
        type: newAccountData.type as any,
        balance: parseFloat(newAccountData.balance.replace('R$', '').replace('.', '').replace(',', '.').trim()),
        accountNumber: '****',
        color: newAccountData.color
      });
      setIsNewAccountModalOpen(false);
      setNewAccountData({
        name: '',
        bankName: '',
        type: 'CHECKING',
        balance: '',
        color: '#6366f1'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <button
              onClick={() => setIsNewAccountModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
              <Plus size={20} />
              <span>Nova Conta</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              <Plus size={20} />
              <span>Conectar Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[32px] border border-slate-100">
              Nenhuma conta conectada ainda.
            </div>
          )}
          {accounts.map((account) => (
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
    </div >
    </div >

  {/* New Account Modal */ }
{
  isNewAccountModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Nova Conta</h3>
          <button
            onClick={() => setIsNewAccountModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Conta</label>
            <input
              autoFocus
              placeholder="Ex: Conta Principal"
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              value={newAccountData.name}
              onChange={e => setNewAccountData({ ...newAccountData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instituição</label>
              <input
                placeholder="Ex: Nubank"
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newAccountData.bankName}
                onChange={e => setNewAccountData({ ...newAccountData, bankName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
              <select
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newAccountData.type}
                onChange={e => setNewAccountData({ ...newAccountData, type: e.target.value })}
              >
                <option value="CHECKING">Corrente</option>
                <option value="SAVINGS">Poupança</option>
                <option value="INVESTMENT">Investimento</option>
                <option value="CASH">Carteira</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saldo Inicial</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                placeholder="0,00"
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newAccountData.balance}
                onChange={e => setNewAccountData({ ...newAccountData, balance: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cor do Card</label>
            <div className="flex gap-2 flex-wrap">
              {['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewAccountData({ ...newAccountData, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${newAccountData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                  style={{ backgroundColor: color }}
                >
                  {newAccountData.color === color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSaveAccount}
            disabled={loading || !newAccountData.name || !newAccountData.balance}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  )
}
    </>
  );
};

export default AccountsPage;
