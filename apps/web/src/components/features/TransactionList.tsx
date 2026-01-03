import React, { useState } from 'react';
import { Filter, Download, Plus, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { useFinance } from '../../contexts/FinanceContext';
import TransactionModal from './TransactionModal';

const TransactionList: React.FC = () => {
    const { transactions = [], deleteTransaction, updateTransaction, addTransaction } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<any>(null);

    const handleDelete = (id: string, description: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o lançamento "${description}"?`)) {
            deleteTransaction(id);
        }
    };

    const handleEdit = (transaction: any) => {
        setTransactionToEdit(transaction);
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setTransactionToEdit(null);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (transaction: any) => {
        if (transaction.id && updateTransaction) {
            await updateTransaction(transaction.id, transaction);
        } else if (addTransaction) {
            await addTransaction(transaction);
        }
        setIsEditModalOpen(false);
        setTransactionToEdit(null);
    };

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Lançamentos</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Histórico detalhado de sua movimentação</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="bg-slate-50 border-none text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 w-48 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filtros</span>
                    </button>
                        <Download size={16} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button 
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Novo</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-1">
                                    Dados
                                    <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </th>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Descrição</th>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Categoria</th>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm italic">
                                    Nenhum lançamento encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-8 py-6 text-sm text-slate-500 font-bold tracking-tight whitespace-nowrap">
                                        {t.date}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-800">{t.description}</span>
                                            <span className="text-xs text-slate-400 font-medium">{t.account}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-bold uppercase tracking-wide border border-slate-200/50">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 text-sm font-extrabold text-right whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'
                                        }`}>
                                        {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${t.status === 'PAID'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {t.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button onClick={() => handleEdit(t)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors" title="Editar"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(t.id, t.description)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Exibindo {filteredTransactions.length} resultados</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>Anterior</button>
                    <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">Próxima</button>
                </div>
            </div>

            <TransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
                transactionToEdit={transactionToEdit}
            />
        </div >
    );
};

export default TransactionList;
