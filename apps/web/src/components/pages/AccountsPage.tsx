
import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { BankAccount } from '../../types';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft, // Keep imported but unused if necessary? No, I'll use it in the UI.
  ShieldCheck,
  Landmark,
  PiggyBank,
  Briefcase,
  ChevronRight,
  TrendingUp,
  X,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';

const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bankName: '',
    type: 'CHECKING' as 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CASH',
    balance: '',
    color: '#6366f1'
  });

  const [loading, setLoading] = useState(false);
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
      case 'CASH': return 'Carteira Física';
      default: return 'Outros';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bankName: '',
      type: 'CHECKING',
      balance: '',
      color: '#6366f1'
    });
    setEditingAccount(null);
  };

  const openNewAccount = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bankName: account.bankName,
      type: account.type,
      balance: account.balance.toString(),
      color: account.color
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.balance) return;

    setLoading(true);
    try {
      const balanceValue = parseFloat(
        formData.balance.toString().replace('R$', '').replace(/\./g, '').replace(',', '.')
      );

      if (editingAccount) {
        // Update
        await updateAccount(editingAccount.id, {
          name: formData.name,
          bankName: formData.bankName || 'Banco',
          type: formData.type,
          balance: balanceValue,
          color: formData.color
        });
      } else {
        // Create
        await addAccount({
          name: formData.name,
          bankName: formData.bankName || 'Banco',
          type: formData.type,
          balance: balanceValue,
          accountNumber: '****', // Placeholder
          color: formData.color
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a conta "${name}"? Todo o histórico associado poderá ser afetado.`)) {
      await deleteAccount(id);
    }
  };

  // Delete from modal
  const handleDeleteFromModal = async () => {
    if (editingAccount) {
      if (confirm(`Tem certeza que deseja excluir a conta "${editingAccount.name}"?`)) {
        await deleteAccount(editingAccount.id);
        setIsModalOpen(false);
        resetForm();
      }
    }
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
              onClick={openNewAccount}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
              <Plus size={20} />
              <span>Nova Conta</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              <Plus size={20} />
              <span>Conectar Banco</span>
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[32px] border border-slate-100">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Landmark size={32} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-600">Nenhuma conta conectada</p>
                <p className="text-sm text-slate-400 mt-1">Adicione suas contas bancárias para começar.</p>
              </div>
            </div>
          )}
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/20 transition-all group overflow-hidden relative">
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

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 bg-white/80 backdrop-blur-sm rounded-xl p-1">
                    <button
                      onClick={() => openEditAccount(account)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar Conta"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id, account.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir Conta"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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

              <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100 group-hover:bg-slate-50 transition-colors cursor-pointer">
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

          {/* AI Recommendation Card (Keeping it as is) */}
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
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Modal - Shared for Create and Edit */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                </h3>
                <div className="flex items-center gap-2">
                  {editingAccount && (
                    <button
                      onClick={handleDeleteFromModal}
                      className="p-2 text-rose-400 hover:bg-rose-50 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Conta</label>
                  <input
                    autoFocus
                    placeholder="Ex: Conta Principal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Instituição</label>
                    <input
                      placeholder="Ex: Nubank"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="CHECKING">Corrente</option>
                      <option value="SAVINGS">Poupança</option>
                      <option value="INVESTMENT">Investimento</option>
                      <option value="CASH">Carteira</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Saldo Atual</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.balance}
                      onChange={e => setFormData({ ...formData, balance: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cor do Card</label>
                  <div className="flex gap-2 flex-wrap bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'].map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {formData.color === color && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.name || !formData.balance}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
                >
                  {loading ? 'Salvando...' : (editingAccount ? 'Salvar Alterações' : 'Criar Conta')}
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
