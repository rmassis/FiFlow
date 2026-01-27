
import { useState } from "react";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import { Plus, CreditCard as CardIcon, Wallet, Building2, Trash2, Edit2 } from "lucide-react";
import { BankAccountForm } from "./BankAccountForm";
import { CreditCardForm } from "./CreditCardForm";
import type { BankAccount, CreditCard } from "@/shared/types";
import { formatCurrency } from "@/lib/utils"; // Assuming you have this or use Intl directly

// Helper formatting locally if needed or reuse
const formatMoney = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function AccountsManager() {
    const {
        bankAccounts,
        creditCards,
        deleteBankAccount,
        deleteCreditCard
    } = useFinanceStore();

    const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);

    const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>(undefined);
    const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);

    const handleEditAccount = (account: BankAccount) => {
        setEditingAccount(account);
        setIsBankAccountModalOpen(true);
    };

    const handleEditCard = (card: CreditCard) => {
        setEditingCard(card);
        setIsCreditCardModalOpen(true);
    };

    const closeModals = () => {
        setIsBankAccountModalOpen(false);
        setIsCreditCardModalOpen(false);
        setEditingAccount(undefined);
        setEditingCard(undefined);
    };

    return (
        <div className="space-y-8">

            {/* SECTION: BANK ACCOUNTS */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 border-l-4 border-indigo-500 pl-3">Contas Bancárias</h2>
                    <button
                        onClick={() => setIsBankAccountModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Conta
                    </button>
                </div>

                {bankAccounts.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Nenhuma conta cadastrada</p>
                        <button
                            onClick={() => setIsBankAccountModalOpen(true)}
                            className="text-indigo-600 text-sm mt-2 hover:underline"
                        >
                            Adicionar minha primeira conta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bankAccounts.map(account => (
                            <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                            style={{ backgroundColor: account.color || '#6366f1' }}
                                        >
                                            <Building2 className="w-5 h-5 text-white/90" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{account.name}</h3>
                                            <p className="text-xs text-gray-500">{account.bank}</p>
                                        </div>
                                    </div>
                                    {account.isPrimary && (
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Principal</span>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Saldo Atual</p>
                                    <p className="text-xl font-bold text-gray-900">{formatMoney(account.balance)}</p>
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={() => handleEditAccount(account)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 bg-white shadow-sm border rounded-lg"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteBankAccount(account.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 bg-white shadow-sm border rounded-lg"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION: CREDIT CARDS */}
            <div>
                <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-500 pl-3">Cartões de Crédito</h2>
                    <button
                        onClick={() => setIsCreditCardModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cartão
                    </button>
                </div>

                {creditCards.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Nenhum cartão cadastrado</p>
                        <button
                            onClick={() => setIsCreditCardModalOpen(true)}
                            className="text-purple-600 text-sm mt-2 hover:underline"
                        >
                            Adicionar cartão de crédito
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {creditCards.map(card => (
                            <div key={card.id} className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-6 relative group overflow-hidden">
                                {/* Background Decoration */}
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div>
                                        <h3 className="font-bold text-base">{card.name}</h3>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">{card.network}</p>
                                    </div>
                                    <CardIcon className="w-6 h-6 text-white/80" />
                                </div>

                                <div className="mb-4 relative z-10">
                                    <p className="text-2xl font-mono tracking-wider text-gray-200">
                                        **** **** **** {card.lastFourDigits}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase">Limite Disponível</p>
                                        <p className="text-sm font-bold text-emerald-400">{formatMoney(Math.max(0, card.limit - card.usedLimit))}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase">Fatura Atual</p>
                                        <p className="text-lg font-bold">{formatMoney(card.usedLimit)}</p>
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                                    <button
                                        onClick={() => handleEditCard(card)}
                                        className="p-1.5 text-white/70 hover:text-white bg-white/10 backdrop-blur-md rounded-lg"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteCreditCard(card.id)}
                                        className="p-1.5 text-white/70 hover:text-red-400 bg-white/10 backdrop-blur-md rounded-lg"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isBankAccountModalOpen && (
                <BankAccountForm
                    initialData={editingAccount}
                    onClose={closeModals}
                    onSuccess={() => { }}
                />
            )}

            {isCreditCardModalOpen && (
                <CreditCardForm
                    initialData={editingCard}
                    onClose={closeModals}
                    onSuccess={() => { }}
                />
            )}

        </div>
    );
}
