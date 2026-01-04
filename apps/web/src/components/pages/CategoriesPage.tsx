
import React, { useState, useMemo } from 'react';
import {
    Plus, Search, ArrowLeft, MoreHorizontal, Filter,
    TrendingUp, AlertCircle, CheckCircle2, Wallet,
    ArrowRightLeft, Pencil, Trash2, ChevronDown, ChevronUp,
    LayoutGrid, List
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Category } from '../../types';

// Tipos locais para facilitar a manipulação
interface SubcategoryData {
    name: string;
    actual: number;
    count: number;
}

interface CategoryWithBudget {
    id: string;
    name: string;
    icon: string;
    color: string;
    planned: number;
    actual: number;
    percentage: number;
    status: 'good' | 'warning' | 'danger';
    subcategories: SubcategoryData[];
}

const CategoriesPage: React.FC = () => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const {
        categories: categoriesList = [],
        transactions = [],
        budgets = [],
        addCategory,
        updateCategory, // Now available
        deleteCategory, // Now available
        updateBudget,
        loading
    } = useFinance();

    const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
    const [editCategoryOpen, setEditCategoryOpen] = useState<CategoryWithBudget | null>(null);

    // Form state
    const [formState, setFormState] = useState({
        name: '',
        icon: '🏷️',
        color: '#6366f1',
        budget: '',
    });

    // Helper to reset form
    const resetForm = () => setFormState({ name: '', icon: '🏷️', color: '#6366f1', budget: '' });

    // Open Edit Modal
    const handleEditClick = (cat: CategoryWithBudget, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditCategoryOpen(cat);
        setFormState({
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            budget: cat.planned.toString()
        });
    };

    const handleSaveCategory = async () => {
        if (!formState.name) return;

        if (editCategoryOpen) {
            // Edit
            await updateCategory(editCategoryOpen.id, {
                name: formState.name,
                icon: formState.icon,
                color: formState.color
            });
            if (formState.budget) {
                await updateBudget(editCategoryOpen.id, parseFloat(formState.budget));
            }
            setEditCategoryOpen(null);
        } else {
            // Create
            const newCat = await addCategory({
                name: formState.name,
                icon: formState.icon,
                color: formState.color
            });
            if (newCat && formState.budget) {
                await updateBudget(newCat.id, parseFloat(formState.budget));
            }
            setIsNewCategoryOpen(false);
        }
        resetForm();
    };

    const handleDeleteCategory = async () => {
        if (editCategoryOpen) {
            if (confirm(`Tem certeza que deseja excluir a categoria "${editCategoryOpen.name}"? Isso não apaga as transações, mas elas ficarão sem categoria.`)) {
                await deleteCategory(editCategoryOpen.id);
                setEditCategoryOpen(null);
                resetForm();
            }
        }
    };


    // Calcula os dados agregados das categorias
    const categoriesData = useMemo(() => {
        // Group transactions by category name AND subcategory

        return categoriesList.map(cat => {
            const budget = budgets.find(b => b.categoryId === cat.id);

            // Filter transactions for this category
            const catTransactions = transactions.filter(t => t.category === cat.name && t.type === 'EXPENSE');

            const actual = catTransactions.reduce((sum, t) => sum + t.amount, 0);
            const planned = budget ? budget.planned : 0;
            const percentage = planned > 0 ? (actual / planned) * 100 : 0;

            let status: 'good' | 'warning' | 'danger' = 'good';
            if (percentage >= 100) status = 'danger';
            else if (percentage >= 85) status = 'warning';

            // Calculate Subcategories
            const subMap = new Map<string, number>();
            const subCountMap = new Map<string, number>();

            catTransactions.forEach(t => {
                const subName = t.subcategory || 'Geral';
                subMap.set(subName, (subMap.get(subName) || 0) + t.amount);
                subCountMap.set(subName, (subCountMap.get(subName) || 0) + 1);
            });

            const subcategories: SubcategoryData[] = Array.from(subMap.entries()).map(([name, val]) => ({
                name,
                actual: val,
                count: subCountMap.get(name) || 0
            })).sort((a, b) => b.actual - a.actual); // Sort by highest spend

            return {
                ...cat,
                planned,
                actual,
                percentage,
                status,
                subcategories
            } as CategoryWithBudget;
        }).sort((a, b) => b.percentage - a.percentage); // Sort by highest utilization
    }, [transactions, categoriesList, budgets]);


    // Modal Component (Shared for Create/Edit)
    const CategoryModal = ({ isEdit = false, onClose }: { isEdit?: boolean; onClose: () => void }) => (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                    {isEdit && (
                        <button
                            onClick={handleDeleteCategory}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Excluir Categoria"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Categoria</label>
                        <input
                            type="text"
                            placeholder="Ex: Assinaturas"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={formState.name}
                            onChange={e => setFormState({ ...formState, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Ícone</label>
                            <input
                                type="text"
                                placeholder="🏷️"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                value={formState.icon}
                                onChange={e => setFormState({ ...formState, icon: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cor</label>
                            <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                <input
                                    type="color"
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent flex-shrink-0"
                                    value={formState.color}
                                    onChange={e => setFormState({ ...formState, color: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0"
                                    value={formState.color}
                                    onChange={e => setFormState({ ...formState, color: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Orçamento Mensal (Meta)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">R$</span>
                            <input
                                type="number"
                                placeholder="0,00"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={formState.budget}
                                onChange={e => setFormState({ ...formState, budget: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleSaveCategory} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                        {isEdit ? 'Salvar Alterações' : 'Criar Categoria'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-20">
            {(isNewCategoryOpen || editCategoryOpen) && (
                <CategoryModal
                    isEdit={!!editCategoryOpen}
                    onClose={() => { setIsNewCategoryOpen(false); setEditCategoryOpen(null); resetForm(); }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categorias</h2>
                    <p className="text-slate-500 font-medium mt-1">Gerencie seus orçamentos e acompanhe gastos detalhados.</p>
                </div>
                <div className="flex gap-3">
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsNewCategoryOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Nova Categoria</span>
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'} gap-6`}>
                {categoriesData.map(category => (
                    <div
                        key={category.id}
                        className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 group"
                    >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 ${category.status === 'good' ? 'bg-emerald-50 text-emerald-600' :
                                    category.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                                        'bg-rose-50 text-rose-600'
                                    }`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{category.name}</h3>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${category.status === 'good' ? 'bg-emerald-100 text-emerald-700' :
                                            category.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                        }`}>
                                        {category.percentage.toFixed(0)}% da meta
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleEditClick(category, e)}
                                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                title="Editar Categoria"
                            >
                                <Pencil size={18} />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Executor</p>
                                    <p className="text-lg font-bold text-slate-800">R$ {category.actual.toLocaleString('pt-BR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Meta</p>
                                    <p className="text-lg font-medium text-slate-500">R$ {category.planned.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${category.status === 'good' ? 'bg-emerald-400' :
                                        category.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                                        }`}
                                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Subcategories (Dynamic) */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Principais Gastos</p>

                            {category.subcategories.length > 0 ? (
                                <div className="space-y-2">
                                    {category.subcategories.slice(0, 4).map((sub, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-default">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${category.status === 'danger' ? 'bg-rose-400' : 'bg-indigo-400'}`}></div>
                                                <span className="text-slate-600 font-medium truncate">{sub.name}</span>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{sub.count}</span>
                                            </div>
                                            <span className="font-bold text-slate-700">R$ {sub.actual.toLocaleString('pt-BR')}</span>
                                        </div>
                                    ))}
                                    {category.subcategories.length > 4 && (
                                        <div className="text-center pt-1">
                                            <span className="text-xs font-bold text-indigo-500 cursor-pointer hover:underline">
                                                + {category.subcategories.length - 4} outros itens
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <span className="text-xs font-medium text-slate-400">Nenhuma subcategoria registrada</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Empty State if no categories */}
                {categoriesData.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Nenhuma categoria encontrada</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comece criando categorias para organizar melhor suas finanças.</p>
                        <button
                            onClick={() => setIsNewCategoryOpen(true)}
                            className="mt-6 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Criar minha primeira categoria
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
