import React, { useState, useEffect, useMemo } from "react";
import {
    Tag,
    Plus,
    Edit2,
    Trash2,
    Search,
    RefreshCw,
    ChevronRight,
    X,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    TrendingDown,
    TrendingUp,
    Filter,
    Layers,
    History,
    MousePointer2,
    Sparkles,
    Check
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { Category, Transaction } from "@/shared/types";
import { supabase } from "@/lib/supabase";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const storeUser = useFinanceStore(state => state.user);
    const createGuestUser = useFinanceStore(state => state.createGuestUser);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user && !storeUser) {
                console.log("No user identified, creating guest session...");
                await createGuestUser();
            }
            loadCategories();
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadTransactions(selectedCategory.name);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            // Priority 1: Supabase Auth
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();

            if (user) {
                setUserId(user.id);
            } else if (storeUser?.id) {
                setUserId(storeUser.id);
            }

            const headers: any = {};
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            const [catsRes, transRes] = await Promise.all([
                fetch("/api/categories", { headers }),
                fetch("/api/transactions", { headers })
            ]);

            const catsData = await catsRes.json();
            const transData = await transRes.json();

            let allCategories: Category[] = Array.isArray(catsData) ? catsData : (catsData.categories || []);
            const allTransactions: Transaction[] = transData.transactions || [];

            // FALLBACK: If categories table is empty, derive from transactions
            if (allCategories.length === 0 && allTransactions.length > 0) {
                console.log("Categories table empty, deriving from transactions...");
                const derivedCats: Category[] = [];
                const rootNames = new Set<string>();

                allTransactions.forEach(t => {
                    if (t.category && !rootNames.has(t.category)) {
                        rootNames.add(t.category);
                        derivedCats.push({
                            id: `temp-root-${t.category}`,
                            name: t.category,
                            type: t.type || 'despesa',
                            user_id: '',
                            is_pending: true,
                            icon: '📁'
                        } as any);
                    }

                    if (t.category && t.subcategory) {
                        const subId = `temp-sub-${t.category}-${t.subcategory}`;
                        if (!derivedCats.find(c => c.id === subId)) {
                            derivedCats.push({
                                id: subId,
                                name: t.subcategory,
                                parent_id: `temp-root-${t.category}`,
                                type: t.type || 'despesa',
                                user_id: '',
                                is_pending: true,
                                icon: '🔹'
                            } as any);
                        }
                    }
                });

                allCategories = derivedCats;
            }

            // Simple aggregation for the MVP
            const processedCategories = allCategories.map(cat => {
                // Find all transactions for this category AND its subcategories
                const subIds = allCategories
                    .filter(c => String(c.parent_id) === String(cat.id))
                    .map(c => c.name);

                const relevantNames = [cat.name, ...subIds];

                const catTrans = allTransactions.filter(t =>
                    relevantNames.includes(t.category) || (t.subcategory && relevantNames.includes(t.subcategory))
                );

                const total = catTrans.reduce((sum, t) => sum + (t.amount || 0), 0);
                const count = catTrans.length;

                return {
                    ...cat,
                    total,
                    transaction_count: count
                };
            });

            // Filter out categories with 0 transactions if derived
            const finalCategories = processedCategories.filter(c => c.transaction_count > 0 || !c.id.toString().startsWith('temp-'));

            setCategories(finalCategories);
        } catch (error) {
            console.error("Error loading categories:", error);
            showToast("Erro ao carregar categorias", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTransactions = async (categoryName: string) => {
        try {
            const response = await fetch(`/api/transactions?category=${encodeURIComponent(categoryName)}`);
            const data = await response.json();
            setTransactions((data.transactions || []).map((t: any) => ({
                ...t,
                date: new Date(t.date),
            })));
        } catch (error) {
            console.error("Error loading transactions:", error);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();

            // Check session, store and state
            const currentUserId = user?.id || storeUser?.id || userId;

            if (!currentUserId) {
                console.warn("No user ID found during category creation. Attempting to get session...");
                if (session?.user?.id) {
                    setUserId(session.user.id);
                } else {
                    showToast("Usuário não identificado. Tente recarregar a página.", "error");
                    return;
                }
            }

            const finalUserId = currentUserId || session?.user?.id;

            // Cleanup parent_id if it's a temp ID
            let parentId = selectedCategory?.id;
            if (parentId && String(parentId).startsWith('temp-')) {
                parentId = undefined;
            }

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
                },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    type: 'despesa',
                    icon: '📁',
                    is_pending: false,
                    user_id: finalUserId,
                    parent_id: parentId
                }),
            });

            if (response.ok) {
                setNewCategoryName("");
                setIsCreating(false);
                loadCategories();
                showToast("Categoria criada!");
            } else {
                const errorData = await response.json();
                console.error("API Error Creating Category:", errorData);
                showToast(errorData.error || errorData.details || "Erro ao criar categoria", "error");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            showToast("Erro ao criar categoria", "error");
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editCategoryName.trim()) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`/api/categories/${editingCategory.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
                },
                body: JSON.stringify({
                    name: editCategoryName.trim(),
                    color: editingCategory.color,
                    icon: editingCategory.icon,
                }),
            });

            if (response.ok) {
                setEditingCategory(null);
                setEditCategoryName("");
                loadCategories();
                showToast("Categoria atualizada!");
                if (selectedCategory?.id === editingCategory.id) {
                    setSelectedCategory(null);
                }
            } else {
                const error = await response.json();
                showToast(error.error || "Erro ao atualizar categoria", "error");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            showToast("Erro ao atualizar categoria", "error");
        }
    };

    const handleApproveCategory = async (id: string) => {
        try {
            const isTemp = id.startsWith('temp-');
            const categoryToApprove = categories.find(c => c.id === id);

            if (isTemp && categoryToApprove) {
                // If it's a virtual category from transactions, we create it in the DB
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch("/api/categories", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
                    },
                    body: JSON.stringify({
                        name: categoryToApprove.name,
                        type: categoryToApprove.type || 'despesa',
                        parent_id: (categoryToApprove.parent_id && !String(categoryToApprove.parent_id).startsWith('temp-')) ? categoryToApprove.parent_id : null,
                        is_pending: false,
                        icon: categoryToApprove.icon || '📁',
                        user_id: user?.id || userId
                    }),
                });

                if (response.ok) {
                    loadCategories();
                    showToast("Categoria sincronizada com o banco!");
                } else {
                    const err = await response.json();
                    showToast(err.details || "Erro ao sincronizar categoria", "error");
                }
                return;
            }

            const response = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_pending: false }),
            });

            if (response.ok) {
                loadCategories();
                showToast("Categoria aprovada!");
            } else {
                showToast("Erro ao aprovar categoria", "error");
            }
        } catch (error) {
            console.error("Error approving category:", error);
            showToast("Erro ao aprovar categoria", "error");
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"? Todas as transações perderão esta categoria.`)) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`/api/categories/${category.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
                }
            });

            if (response.ok) {
                loadCategories();
                showToast("Categoria excluída");
                if (selectedCategory?.id === (category.id as any)) {
                    setSelectedCategory(null);
                }
            } else {
                showToast("Erro ao excluir categoria", "error");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            showToast("Erro ao excluir categoria", "error");
        }
    };

    const handleReclassify = async (transactionIds: string[], newCategory: Category) => {
        try {
            showToast(`Reclassificando ${transactionIds.length} itens...`);
            await Promise.all(transactionIds.map(id =>
                fetch(`/api/transactions/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        category: newCategory.name,
                        type: newCategory.type || 'despesa'
                    }),
                })
            ));

            setSelectedTransactions(new Set());
            loadCategories();
            showToast("Reclassificação concluída!");
            if (selectedCategory) {
                loadTransactions(selectedCategory.name);
            }
        } catch (error) {
            console.error("Error reclassifying transactions:", error);
            showToast("Erro ao reclassificar transações", "error");
        }
    };

    const toggleTransactionSelection = (id: string) => {
        const newSelected = new Set(selectedTransactions);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedTransactions(newSelected);
    };

    const formatBRL = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    // Hierarchy Logic
    const rootCategories = useMemo(() => {
        return categories.filter(c => !c.parent_id);
    }, [categories]);

    const getSubcategories = (parentId: string) => {
        return categories.filter(c => String(c.parent_id) === String(parentId));
    };

    const filteredTransactions = transactions.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && categories.length === 0) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-40 gap-6 animate-in fade-in duration-700">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin shadow-xl" />
                    <div className="text-center">
                        <p className="text-xl font-black text-slate-900 tracking-tight">Sincronizando Estrutura</p>
                        <p className="text-slate-400 font-bold text-sm mt-1">Carregando suas categorias inteligentes...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition-all active:scale-95 group"
                                    title="Voltar para Categorias"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            )}
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                {selectedCategory ? selectedCategory.name : "Lançamentos e Categorias"}
                            </h1>
                        </div>
                        <p className={`text-slate-500 font-medium ${selectedCategory ? 'ml-14' : 'ml-1'}`}>
                            {selectedCategory
                                ? `${selectedCategory.transaction_count} lançamentos vinculados nesta categoria`
                                : "Organize e gerencie sua estrutura financeira de forma inteligente"}
                        </p>
                    </div>

                    {!selectedCategory && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Categoria
                        </button>
                    )}
                </header>

                {/* Main Content Area */}
                {!selectedCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {rootCategories.map((category) => {
                            const subCount = getSubcategories(String(category.id)).length;
                            return (
                                <div
                                    key={category.id}
                                    className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all duration-500 overflow-hidden flex flex-col h-full"
                                >
                                    <div className="p-5 flex-1 flex flex-col min-w-0">
                                        <div className="flex flex-col gap-5 flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 min-w-0">
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <div className="shrink-0 w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                                        <Sparkles className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <h3 className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate">
                                                                {category.name}
                                                            </h3>
                                                            {category.is_pending && (
                                                                <span className="shrink-0 text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">IA</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider truncate">
                                                            {category.transaction_count} itens • {subCount} subs
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    {category.is_pending && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleApproveCategory(String(category.id));
                                                            }}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Aprovar Categoria"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingCategory(category);
                                                            setEditCategoryName(category.name);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(category);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:bg-indigo-50/50 transition-colors mt-auto">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Acumulado</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tight">
                                                    {formatBRL(category.total || 0)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setSelectedCategory(category)}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Ver Detalhes
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {category.is_pending && (
                                            <div className="px-6 py-4 bg-amber-50/30 flex items-center justify-between border-t border-amber-50">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-3 h-3 text-amber-600" />
                                                    <span className="text-[9px] font-bold text-amber-800">Criada pela IA</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {rootCategories.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                                <Layers className="w-16 h-16 text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-400 mb-2">Estrutura Vazia</h3>
                                <p className="text-slate-400 font-bold max-w-xs text-center leading-relaxed">Comece criando sua primeira categoria ou importe dados para ver a inteligência em ação.</p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="mt-8 px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:border-indigo-600 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Criar Categoria
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Transaction Details + Subcategories View */
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        {/* Subcategories Shelf */}
                        <div className="flex flex-col gap-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Subcategorias de {selectedCategory.name}</h2>
                            <div className="flex flex-wrap gap-4">
                                {getSubcategories(String(selectedCategory.id)).map(sub => (
                                    <div
                                        key={sub.id}
                                        className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-400 transition-all group flex items-center gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{sub.icon || "🔹"}</span>
                                            <span className="font-black text-slate-900 text-sm">{sub.name}</span>
                                            {sub.is_pending && (
                                                <span className="text-[7px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">IA</span>
                                            )}
                                        </div>
                                        <div className="h-4 w-px bg-slate-100" />
                                        <span className="text-[10px] font-black text-slate-400">{sub.transaction_count} lançamentos</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">
                                            {sub.is_pending && (
                                                <button onClick={() => handleApproveCategory(String(sub.id))} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteCategory(sub)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        setNewCategoryName("");
                                        setIsCreating(true);
                                        // Potential future: auto-set parentId in state
                                    }}
                                    className="px-6 py-4 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-2xl font-black text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Nova Sub
                                </button>
                            </div>
                        </div>

                        {/* Controls Panel */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8">
                            <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar lançamentos..."
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                                    />
                                </div>

                                {selectedTransactions.size > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-indigo-50 p-3 pr-6 rounded-[1.5rem] border border-indigo-100 animate-in fade-in zoom-in duration-300 w-full lg:w-auto">
                                        <div className="flex items-center gap-3 px-4">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                                                <Layers className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-black text-indigo-900 whitespace-nowrap">
                                                {selectedTransactions.size} selecionados
                                            </span>
                                        </div>
                                        <div className="h-6 w-px bg-indigo-200 hidden sm:block" />
                                        <select
                                            onChange={(e) => {
                                                const catId = e.target.value;
                                                const cat = categories.find(c => String(c.id) === catId);
                                                if (cat) {
                                                    handleReclassify(Array.from(selectedTransactions), cat);
                                                    e.target.value = "";
                                                }
                                            }}
                                            className="w-full sm:w-auto px-6 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                        >
                                            <option value="">RECLASSIFICAR PARA...</option>
                                            {categories
                                                .filter((c) => c.id !== selectedCategory.id)
                                                .map((c) => (
                                                    <option key={c.id} value={String(c.id)}>
                                                        {c.parent_id ? `└ ${c.name}` : c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List Wrapper */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto overflow-y-hidden">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-left w-10">
                                                <button
                                                    onClick={() => {
                                                        if (selectedTransactions.size === filteredTransactions.length) {
                                                            setSelectedTransactions(new Set());
                                                        } else {
                                                            setSelectedTransactions(new Set(filteredTransactions.map(t => String(t.id))));
                                                        }
                                                    }}
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'bg-white border-slate-200 text-transparent'
                                                        }`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            </th>
                                            <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                            <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                            <th className="px-4 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                                            <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategoria</th>
                                            <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações Rápidas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-50">
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <button
                                                        onClick={() => toggleTransactionSelection(String(transaction.id))}
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selectedTransactions.has(String(transaction.id))
                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                            : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-300'
                                                            }`}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-5 whitespace-nowrap font-bold text-slate-500 text-sm">
                                                    {transaction.date.toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <p className="font-black text-slate-900 text-sm mb-0.5">{transaction.description}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCategory.name}</p>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <span className={`text-sm font-black tracking-tight ${transaction.type === "receita" ? "text-emerald-600" : "text-rose-600"
                                                        }`}>
                                                        {transaction.type === "receita" ? "+" : "-"} {formatBRL(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="text-xs font-bold text-slate-500 italic">
                                                        {transaction.subcategory || "-"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <select
                                                        onChange={(e) => {
                                                            const catId = e.target.value;
                                                            const cat = categories.find(c => String(c.id) === catId);
                                                            if (cat) {
                                                                handleReclassify([String(transaction.id)], cat);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer outline-none"
                                                    >
                                                        <option value="">MOVER PARA</option>
                                                        {categories
                                                            .filter((c) => c.id !== selectedCategory.id)
                                                            .map((c) => (
                                                                <option key={c.id} value={String(c.id)}>
                                                                    {c.parent_id ? `└ ${c.name}` : c.name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-20 bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl text-slate-200">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-400 font-bold">
                                        {searchTerm
                                            ? "Nenhum lançamento encontrado para sua busca"
                                            : "Nenhum lançamento vinculado a esta categoria"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Category Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nova Categoria</h2>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewCategoryName("");
                                    }}
                                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome da Categoria</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Ex: Assinaturas de Streaming"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all"
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewCategoryName("");
                                        }}
                                        className="flex-1 py-4 text-slate-400 font-black text-sm hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreateCategory}
                                        disabled={!newCategoryName.trim()}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Criar Categoria
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Category Modal */}
                {editingCategory && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Editar Categoria</h2>
                                <button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setEditCategoryName("");
                                    }}
                                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome da Categoria</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        placeholder="Nome da categoria"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all"
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory()}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setEditCategoryName("");
                                        }}
                                        className="flex-1 py-4 text-slate-400 font-black text-sm hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateCategory}
                                        disabled={!editCategoryName.trim()}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Salvar Alteração
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast System */}
                {toast && (
                    <div className="fixed bottom-10 left-10 z-[100] animate-in slide-in-from-left-8 duration-500">
                        <div className={`px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <span className="font-black text-sm uppercase tracking-tight">{toast.message}</span>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
