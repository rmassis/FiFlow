import React, { useState, useMemo } from 'react';
import {
    Plus, Search, ArrowLeft, MoreHorizontal, Filter,
    TrendingUp, AlertCircle, CheckCircle2, Wallet,
    ArrowRightLeft
} from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { useFinance } from '../../contexts/FinanceContext';

// Tipos locais para facilitar a manipulação
interface CategoryWithBudget {
    id: string;
    name: string;
    icon: string;
    color: string;
    planned: number;
    actual: number;
    percentage: number;
    status: 'good' | 'warning' | 'danger';
}

const CategoriesPage: React.FC = () => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        categories: categoriesList,
        transactions,
        budgets,
        addCategory,
        updateBudget,
        updateTransaction,
        loading
    } = useFinance();

    const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
    const [newCategoryForm, setNewCategoryForm] = useState({
        name: '',
        icon: '🏷️',
        color: '#6366f1',
        budget: '',
    });

    const handleAddCategory = async () => {
        if (!newCategoryForm.name || !newCategoryForm.budget) return;

        const newCat = await addCategory({
            name: newCategoryForm.name,
            icon: newCategoryForm.icon,
            color: newCategoryForm.color
        });

        if (newCat) {
            await updateBudget(newCat.id, parseFloat(newCategoryForm.budget));
        }

        setIsNewCategoryOpen(false);
        setNewCategoryForm({ name: '', icon: '🏷️', color: '#6366f1', budget: '' });
    };

    // Calcula o status do orçamento para cada categoria
    const categoriesData = useMemo(() => {
        return categoriesList.map(cat => {
            const budget = budgets.find(b => b.categoryId === cat.id);
            const actualFromTransactions = transactions
                .filter(t => t.category === cat.name && t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);

            const planned = budget ? budget.planned : 0;
            const actual = actualFromTransactions;

            const percentage = planned > 0 ? (actual / planned) * 100 : 0;

            let status: 'good' | 'warning' | 'danger' = 'good';
            if (percentage >= 100) status = 'danger';
            else if (percentage >= 80) status = 'warning';

            return {
                ...cat,
                planned,
                actual,
                percentage,
                status
            } as CategoryWithBudget;
        }).sort((a, b) => b.percentage - a.percentage);
    }, [transactions, categoriesList, budgets]);

    const handleReclassify = (transactionId: string, newCategoryName: string) => {
        // useFinance updateTransaction should be used here if needed
    };

    const currentCategory = selectedCategoryId ? categoriesData.find(c => c.id === selectedCategoryId) : null;

    const categoryTransactions = useMemo(() => {
        if (!currentCategory) return [];
        return transactions.filter(t =>
            t.category === currentCategory.name &&
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currentCategory, transactions, searchTerm]);

    if (selectedCategoryId && currentCategory) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setSelectedCategoryId(null); setSearchTerm(''); }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="text-3xl">{currentCategory.icon}</span>
                            {currentCategory.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${currentCategory.status === 'good' ? 'bg-emerald-100 text-emerald-700' :
                                currentCategory.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                    'bg-rose-100 text-rose-700'
                                }`}>
                                {currentCategory.status === 'good' ? 'Dentro da Meta' : currentCategory.status === 'warning' ? 'Atenção' : 'Estourado'}
                            </span>
                            <span className="text-sm text-slate-400">•</span>
                            <span className="text-sm text-slate-500 font-medium">
                                Gasto: <strong>R$ {currentCategory.actual.toLocaleString('pt-BR')}</strong> de R$ {currentCategory.planned.toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Buscar em ${currentCategory.name}...`}
                            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100">
                            <Filter size={16} />
                            <span>Filtros</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4">Reclassificar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categoryTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                            Nenhuma transação encontrada nesta categoria.
                                        </td>
                                    </tr>
                                ) : (
                                    categoryTransactions.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.date}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">{t.description}</span>
                                                    <span className="text-xs text-slate-400">{t.account}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative w-48 group">
                                                    <select
                                                        value={t.category}
                                                        onChange={(e) => handleReclassify(t.id, e.target.value)}
                                                        className="appearance-none w-full bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                                    >
                                                        {categoriesList.map(cat => (
                                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    <ArrowRightLeft size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    const NewCategoryModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Nova Categoria</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Assinaturas"
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20"
                            value={newCategoryForm.name}
                            onChange={e => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Ícone</label>
                            <input
                                type="text"
                                placeholder="🏷️"
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-center text-2xl"
                                value={newCategoryForm.icon}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Cor</label>
                            <input
                                type="color"
                                className="w-full h-[52px] bg-slate-50 border-none rounded-xl cursor-pointer p-1"
                                value={newCategoryForm.color}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Orçamento Mensal (Meta)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                            <input
                                type="number"
                                placeholder="0,00"
                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/20"
                                value={newCategoryForm.budget}
                                onChange={e => setNewCategoryForm({ ...newCategoryForm, budget: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={() => setIsNewCategoryOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleAddCategory} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Criar Categoria</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {isNewCategoryOpen && <NewCategoryModal />}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categorias</h2>
                    <p className="text-slate-500 font-medium mt-1">Gerencie seus gastos e acompanhe os orçamentos por área.</p>
                </div>
                <button
                    onClick={() => setIsNewCategoryOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Nova Categoria</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoriesData.map(category => (
                    <div
                        key={category.id}
                        className="group bg-white rounded-[32px] p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => setSelectedCategoryId(category.id)}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${category.status === 'good' ? 'bg-emerald-50 text-emerald-600' :
                                category.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    'bg-rose-50 text-rose-600'
                                }`}>
                                {category.icon}
                            </div>
                            <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-1">{category.name}</h3>

                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Gasto Atual</p>
                                <p className="text-sm font-bold text-slate-700">R$ {category.actual.toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Orçamento</p>
                                <p className="text-sm font-medium text-slate-500">R$ {category.planned.toLocaleString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${category.status === 'good' ? 'bg-emerald-400' :
                                    category.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                                    }`}
                                style={{ width: `${Math.min(category.percentage, 100)}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${category.status === 'good' ? 'bg-emerald-50 text-emerald-600' :
                                category.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                                    'bg-rose-50 text-rose-600'
                                }`}>
                                {category.percentage.toFixed(0)}% da meta
                            </span>
                            <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                Ver Transações <ArrowLeft size={12} className="rotate-180" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;
