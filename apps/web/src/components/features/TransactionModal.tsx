import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../../constants';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: any) => void;
    transactionToEdit?: any;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        status: 'PAID' as 'PAID' | 'PENDING'
    });

    useEffect(() => {
        if (transactionToEdit) {
            setFormData({
                description: transactionToEdit.description,
                amount: String(transactionToEdit.amount),
                date: transactionToEdit.date,
                category: transactionToEdit.category,
                type: transactionToEdit.type,
                status: transactionToEdit.status
            });
        } else {
            setFormData({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: '',
                type: 'EXPENSE',
                status: 'PAID'
            });
        }
    }, [transactionToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            amount: parseFloat(formData.amount),
            id: transactionToEdit?.id
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {transactionToEdit ? (
                            <>
                                <FileText className="text-indigo-500" size={24} />
                                Editar Lançamento
                            </>
                        ) : (
                            <>
                                <DollarSign className="text-emerald-500" size={24} />
                                Novo Lançamento
                            </>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Tipo de Transação */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'INCOME'
                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'EXPENSE'
                                    ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            Despesa
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                                    placeholder="0,00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Supermercado, Salário..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                required
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Selecione uma categoria</option>
                                {Object.keys(CATEGORIES).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        {transactionToEdit ? 'Salvar Alterações' : 'Adicionar Lançamento'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
