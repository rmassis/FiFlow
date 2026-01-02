
import React from 'react';
import { Filter, Download, MoreHorizontal } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../constants.tsx';

const TransactionList: React.FC = () => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Lançamentos</h2>
                    <p className="text-sm text-slate-500">Histórico detalhado de sua movimentação</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-8 py-4">Data</th>
                            <th className="px-8 py-4">Descrição</th>
                            <th className="px-8 py-4">Categoria</th>
                            <th className="px-8 py-4 text-right">Valor</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_TRANSACTIONS.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-5 text-sm text-slate-500 font-medium">{t.date}</td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{t.description}</span>
                                        <span className="text-xs text-slate-400 font-medium">{t.account}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-tight">
                                        {t.category}
                                    </span>
                                </td>
                                <td className={`px-8 py-5 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${t.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList;
