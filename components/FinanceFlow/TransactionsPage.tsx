import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { Filter, Download, Edit2, Trash2, MoreHorizontal } from 'lucide-react';

const TransactionsPage: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const toggleSelectAll = () => {
        if (selectedIds.length === MOCK_TRANSACTIONS.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(MOCK_TRANSACTIONS.map(t => t.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

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
            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 px-8 py-3 border-b border-indigo-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-700">{selectedIds.length} selecionados</span>
                    <div className="flex gap-3">
                        <button className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors">
                            Excluir Selecionados
                        </button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <th className="px-8 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={selectedIds.length === MOCK_TRANSACTIONS.length && MOCK_TRANSACTIONS.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-4">Data</th>
                            <th className="px-8 py-4">Descrição</th>
                            <th className="px-8 py-4">Categoria</th>
                            <th className="px-8 py-4 text-right">Valor</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {MOCK_TRANSACTIONS.map((t) => (
                            <tr key={t.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.includes(t.id) ? 'bg-indigo-50/30' : ''}`}>
                                <td className="px-8 py-5 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedIds.includes(t.id)}
                                        onChange={() => toggleSelect(t.id)}
                                    />
                                </td>
                                <td className="px-4 py-5 text-sm text-slate-500 font-medium">{t.date}</td>
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
                                <td className="px-8 py-5 text-right relative">
                                    <button
                                        onClick={() => setMenuOpenId(menuOpenId === t.id ? null : t.id)}
                                        className={`p-2 rounded-lg transition-all ${menuOpenId === t.id ? 'text-indigo-600 bg-indigo-50 opacity-100' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {menuOpenId === t.id && (
                                        <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                                            <button className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                                                <Edit2 size={16} />
                                                Editar
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-50">
                                                <Trash2 size={16} />
                                                Excluir
                                            </button>
                                        </div>
                                    )}

                                    {/* Overlay to close menu when clicking outside */}
                                    {menuOpenId === t.id && (
                                        <div
                                            className="fixed inset-0 z-0 cursor-default"
                                            onClick={() => setMenuOpenId(null)}
                                        ></div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsPage;
