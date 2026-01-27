
import { useState, useEffect } from "react";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import { ACCOUNT_COLORS } from "@/shared/types";
import type { CreditCard } from "@/shared/types";
import { X, Save, Check, CreditCard as CardIcon } from "lucide-react";

interface CreditCardFormProps {
    initialData?: CreditCard;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreditCardForm({ initialData, onClose, onSuccess }: CreditCardFormProps) {
    const { addCreditCard, updateCreditCard } = useFinanceStore();
    const [formData, setFormData] = useState<Partial<CreditCard>>({
        name: "",
        network: "mastercard",
        lastFourDigits: "",
        limit: 0,
        usedLimit: 0,
        closingDay: 1,
        dueDay: 10,
        color: ACCOUNT_COLORS[1],
        icon: "credit-card",
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
            updateCreditCard(initialData.id, formData);
        } else {
            addCreditCard({
                ...formData,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date()
            } as CreditCard);
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in mx-auto overflow-y-auto max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CardIcon className="w-5 h-5 text-indigo-600" />
                        {initialData ? "Editar Cartão" : "Novo Cartão de Crédito"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Nome do Cartão */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cartão (Apelido)</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            placeholder="Ex: Nubank Platinum"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Bandeira */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bandeira</label>
                            <select
                                value={formData.network}
                                onChange={(e) => setFormData({ ...formData, network: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all bg-white"
                            >
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                                <option value="elo">Elo</option>
                                <option value="amex">American Express</option>
                                <option value="hipercard">Hipercard</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        {/* Últimos 4 dígitos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos</label>
                            <input
                                type="text"
                                maxLength={4}
                                value={formData.lastFourDigits}
                                onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.replace(/\D/g, '') })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                placeholder="1234"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Limite Total */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limite Total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.limit}
                                    onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        {/* Limite Utilizado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Atual</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.usedLimit}
                                    onChange={(e) => setFormData({ ...formData, usedLimit: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Dia Fechamento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dia Fechamento</label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                required
                                value={formData.closingDay}
                                onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            />
                        </div>
                        {/* Dia Vencimento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dia Vencimento</label>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                required
                                value={formData.dueDay}
                                onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 1 })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Cor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Cartão</label>
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

                    {/* Cartão Principal */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isPrimary ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                            {formData.isPrimary && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Cartão Principal</p>
                            <p className="text-xs text-gray-500">Usar este cartão como padrão</p>
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
                            Salvar Cartão
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
