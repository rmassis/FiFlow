
import { useState, useEffect } from "react";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import { BRAZILIAN_BANKS, ACCOUNT_ICONS, ACCOUNT_COLORS } from "@/shared/types";
import type { BankAccount } from "@/shared/types";
import { X, Save, Check } from "lucide-react";

interface BankAccountFormProps {
    initialData?: BankAccount;
    onClose: () => void;
    onSuccess: () => void;
}

export function BankAccountForm({ initialData, onClose, onSuccess }: BankAccountFormProps) {
    const { addBankAccount, updateBankAccount } = useFinanceStore();
    const [formData, setFormData] = useState<Partial<BankAccount>>({
        name: "",
        type: "corrente",
        bank: "",
        balance: 0,
        agency: "",
        number: "",
        currency: "BRL",
        color: ACCOUNT_COLORS[0],
        icon: "wallet",
        isPrimary: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData) {
            updateBankAccount(initialData.id, formData);
        } else {
            addBankAccount({
                ...formData,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date()
            } as BankAccount);
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in mx-auto overflow-y-auto max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? "Editar Conta" : "Nova Conta Bancária"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Nome da Conta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            placeholder="Ex: Conta Principal"
                        />
                    </div>

                    {/* Banco */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                        <select
                            value={formData.bank}
                            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all bg-white"
                        >
                            <option value="">Selecione um banco</option>
                            {BRAZILIAN_BANKS.map(bank => (
                                <option key={bank.code} value={bank.name}>
                                    {bank.name}
                                </option>
                            ))}
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all bg-white"
                            >
                                <option value="corrente">Corrente</option>
                                <option value="poupanca">Poupança</option>
                                <option value="investimento">Investimento</option>
                                <option value="salario">Salário</option>
                                <option value="pagamento">Pagamento</option>
                                <option value="carteira">Carteira Física</option>
                            </select>
                        </div>

                        {/* Saldo Inicial */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Atual</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Agência */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Agência (Opcional)</label>
                            <input
                                type="text"
                                value={formData.agency}
                                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                placeholder="0000"
                            />
                        </div>
                        {/* Conta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número (Opcional)</label>
                            <input
                                type="text"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                placeholder="00000-0"
                            />
                        </div>
                    </div>

                    {/* Cor e ícone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aparência</label>
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2 items-center flex-wrap">
                                {ACCOUNT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Conta Principal */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isPrimary ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                            {formData.isPrimary && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Conta Principal</p>
                            <p className="text-xs text-gray-500">Usar esta conta como padrão para transações</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Conta
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
