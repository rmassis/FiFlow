import React, { useState, useEffect, useMemo } from "react";
import {
    Plus,
    ChevronRight,
    ChevronDown,
    Edit2,
    Trash2,
    Save,
    X,
    Search,
    RefreshCw,
    Tag,
    AlertCircle,
    FileText,
    Calendar,
    History,
    CheckSquare,
    Square,
    Move,
    ArrowDownWideNarrow,
    Layers,
    Info,
    Zap,
    CheckCircle2,
    FolderOpen,
    Folder,
    ChevronUp
} from "lucide-react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { Category, Transaction } from "@/shared/types";

// Default categories seed
const DEFAULT_CATEGORIES = [
    { name: "Moradia", type: "despesa", icon: "🏠", color: "#6366F1" },
    { name: "Alimentação", type: "despesa", icon: "🍱", color: "#10B981" },
    { name: "Transporte", type: "despesa", icon: "🚗", color: "#F59E0B" },
    { name: "Lazer", type: "despesa", icon: "🎨", color: "#EC4899" },
    { name: "Saúde", type: "despesa", icon: "🏥", color: "#EF4444" },
    { name: "Educação", type: "despesa", icon: "📚", color: "#8B5CF6" },
    { name: "Salário", type: "receita", icon: "💰", color: "#059669" },
    { name: "Rendimento", type: "receita", icon: "📈", color: "#14B8A6" },
    { name: "Vendas", type: "receita", icon: "🛍️", color: "#2563EB" },
];

type ViewMode = 'tree' | 'phantom' | 'audit';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<'receita' | 'despesa'>('despesa');
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>('tree');

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showMoveModal, setShowMoveModal] = useState(false);

    // Toast notifications
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            console.log("FiFlow: Iniciando carregamento de categorias e transações...");
            const [catsRes, transRes] = await Promise.all([
                fetch("/api/categories").catch(err => {
                    console.error("Fetch Categories failed:", err);
                    return { ok: false, status: 0, text: () => Promise.resolve(err.message) };
                }),
                fetch("/api/transactions").catch(err => {
                    console.error("Fetch Transactions failed:", err);
                    return { ok: false, status: 0, text: () => Promise.resolve(err.message) };
                })
            ]);

            const processResponse = async (res: any, name: string) => {
                const text = await res.text();
                if (!res.ok) {
                    console.error(`FiFlow [${name}] API Error (${res.status}):`, text);
                    return null;
                }
                try {
                    return JSON.parse(text);
                } catch (e: any) {
                    console.error(`FiFlow [${name}] JSON Parse Error:`, e.message);
                    console.log(`FiFlow [${name}] Raw Body:`, text);
                    return null;
                }
            };

            const catsData = await processResponse(catsRes, "Categories");
            const transData = await processResponse(transRes, "Transactions");

            setCategories(Array.isArray(catsData) ? catsData : []);
            setTransactions(Array.isArray(transData?.transactions) ? transData.transactions : []);

            if (Array.isArray(catsData)) {
                setExpanded(new Set(catsData.filter((c: any) => !c.parent_id).map((c: any) => c.id)));
            }
        } catch (error) {
            console.error("FiFlow: Erro crítico ao carregar dados:", error);
            showToast("Erro ao conectar com o servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpanded(next);
    };

    const handleAddCategory = async (parentId?: string | null, nameOverride?: string, idToApprove?: string) => {
        const name = nameOverride || newCatName;
        if (!name.trim()) return;

        try {
            if (idToApprove) {
                // If we are approving an existing phantom category
                const response = await fetch(`/api/categories/${idToApprove}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_pending: false })
                });
                if (response.ok) {
                    loadData();
                    showToast(`Categoria "${name}" aprovada!`);
                }
                return;
            }

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    type: newCatType,
                    parent_id: parentId,
                    color: "#94A3B8",
                    icon: parentId ? "🔹" : "📁",
                    is_pending: false
                })
            });
            if (response.ok) {
                setNewCatName("");
                loadData();
                showToast(`Categoria "${name}" criada com sucesso!`);
            }
        } catch (error) {
            console.error("Error adding/approving category:", error);
            showToast("Erro ao processar categoria", "error");
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editingName.trim()) return;
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingName })
            });
            if (response.ok) {
                setEditingId(null);
                loadData();
                showToast("Categoria atualizada!");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            showToast("Erro ao atualizar categoria", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria? Subcategorias também serão excluídas.")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            loadData();
            showToast("Categoria excluída");
        } catch (error) {
            console.error("Error deleting category:", error);
            showToast("Erro ao excluir categoria", "error");
        }
    };

    const handleQuickMove = async (transactionIds: string[], targetCategory: Category) => {
        try {
            let category = targetCategory.name;
            let subcategory = "";

            if (targetCategory.parent_id) {
                const parent = categories.find(c => c.id === targetCategory.parent_id);
                if (parent) {
                    category = parent.name;
                    subcategory = targetCategory.name;
                }
            }

            await Promise.all(transactionIds.map(id =>
                fetch(`/api/transactions/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category,
                        subcategory,
                        type: targetCategory.type
                    }),
                })
            ));

            setSelectedIds(new Set());
            setShowMoveModal(false);
            loadData();
            showToast(`${transactionIds.length} lançamento(s) movido(s) com sucesso!`);
        } catch (err) {
            console.error('Error moving transactions:', err);
            showToast("Erro ao mover lançamentos", "error");
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = (transactions: Transaction[]) => {
        const ids = transactions.map(t => t.id!);
        const allSelected = ids.every(id => selectedIds.has(id));

        const next = new Set(selectedIds);
        if (allSelected) {
            ids.forEach(id => next.delete(id));
        } else {
            ids.forEach(id => next.add(id));
        }
        setSelectedIds(next);
    };

    const seedDefaults = async () => {
        if (!confirm("Deseja importar as categorias padrão?")) return;
        setLoading(true);
        try {
            for (const cat of DEFAULT_CATEGORIES) {
                await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...cat, is_pending: false })
                });
            }
            loadData();
            showToast("Categorias padrão importadas!");
        } catch (error) {
            console.error("Error seeding:", error);
            showToast("Erro ao importar categorias", "error");
        } finally {
            setLoading(false);
        }
    };

    const transByCatName = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        transactions.forEach(t => {
            const cat = t.category || "Sem Categoria";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        });
        return groups;
    }, [transactions]);

    const unifiedTree = useMemo(() => {
        const map: Record<string, any> = {};
        const roots: any[] = [];

        // Only show official (is_pending: false) categories in the tree
        const officialCats = categories.filter(c => !c.is_pending);

        officialCats.forEach(cat => {
            map[cat.id] = {
                ...cat,
                children: [],
                transactions: transByCatName[cat.name] || []
            };
        });

        officialCats.forEach(cat => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(map[cat.id]);
            } else if (!cat.parent_id) {
                roots.push(map[cat.id]);
            }
        });

        return roots;
    }, [categories, transByCatName]);

    const phantomCategories = useMemo(() => {
        const phantoms: any[] = [];

        // 1. Phantoms from is_pending: true categories in DB
        categories.filter(c => c.is_pending).forEach(cat => {
            const trans = transByCatName[cat.name] || [];
            phantoms.push({
                ...cat,
                isPhantom: true,
                transactions: trans,
                count: trans.length,
                total: trans.reduce((sum, t) => sum + t.amount, 0)
            });
        });

        // 2. Legacy check: Phantoms from transactions with no official category
        const officialNames = new Set(categories.filter(c => !c.is_pending).map(c => c.name));
        const pendingNamesInDb = new Set(categories.filter(c => c.is_pending).map(c => c.name));

        Object.keys(transByCatName).forEach(catName => {
            if (!officialNames.has(catName) && !pendingNamesInDb.has(catName) && catName !== "Sem Categoria") {
                const trans = transByCatName[catName];
                phantoms.push({
                    id: `phantom-${catName}`,
                    name: catName,
                    type: trans[0]?.type || 'despesa',
                    isOfficial: false,
                    isPhantom: true,
                    icon: "🤖",
                    transactions: trans,
                    count: trans.length,
                    total: trans.reduce((sum, t) => sum + t.amount, 0)
                });
            }
        });

        if (transByCatName["Sem Categoria"]) {
            const trans = transByCatName["Sem Categoria"];
            phantoms.push({
                id: `phantom-uncategorized`,
                name: "Sem Categoria",
                type: 'despesa',
                isOfficial: false,
                isPhantom: true,
                icon: "❓",
                transactions: trans,
                count: trans.length,
                total: trans.reduce((sum, t) => sum + t.amount, 0)
            });
        }

        return phantoms;
    }, [categories, transByCatName]);

    const filteredTree = useMemo(() => {
        if (!searchTerm) return unifiedTree;
        const lowerSearch = searchTerm.toLowerCase();

        const filterNode = (node: any): any => {
            const nameMatch = node.name.toLowerCase().includes(lowerSearch);
            const filteredChildren = node.children.map(filterNode).filter((c: any) => c !== null);
            const hasMatchingTransaction = node.transactions.some((t: Transaction) =>
                t.description.toLowerCase().includes(lowerSearch)
            );

            if (nameMatch || filteredChildren.length > 0 || hasMatchingTransaction) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        return unifiedTree.map(filterNode).filter(n => n !== null);
    }, [unifiedTree, searchTerm]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 pb-32">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Gestão de Categorias
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Organize sua estrutura de categorização e mantenha seus dados limpos
                        </p>
                    </div>

                    {/* View Mode Selector */}
                    <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 gap-1">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'tree'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            Estrutura
                        </button>
                        <button
                            onClick={() => setViewMode('phantom')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${viewMode === 'phantom'
                                ? 'bg-amber-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            Pendências
                            {phantomCategories.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                    {phantomCategories.length}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Search Bar */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar categorias e lançamentos..."
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Content based on view mode */}
                        {viewMode === 'tree' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <Folder className="w-5 h-5 text-indigo-600" />
                                        <h2 className="font-bold text-slate-900">Estrutura de Categorias</h2>
                                    </div>
                                    <button
                                        onClick={seedDefaults}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Importar Padrões
                                    </button>
                                </div>

                                <div className="p-6">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-slate-400 font-medium text-sm">Carregando estrutura...</p>
                                        </div>
                                    ) : filteredTree.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <FolderOpen className="w-16 h-16 text-slate-300" />
                                            <p className="text-slate-400 font-medium">Nenhuma categoria encontrada</p>
                                            <button
                                                onClick={seedDefaults}
                                                className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                                            >
                                                Criar Categorias Padrão
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredTree.map(node => (
                                                <TreeNode
                                                    key={node.id}
                                                    node={node}
                                                    expanded={expanded}
                                                    toggleExpand={toggleExpand}
                                                    onDelete={handleDelete}
                                                    loadData={loadData}
                                                    officialCategories={categories}
                                                    onQuickMove={handleQuickMove}
                                                    selectedIds={selectedIds}
                                                    toggleSelect={toggleSelect}
                                                    toggleSelectAll={toggleSelectAll}
                                                    editingId={editingId}
                                                    setEditingId={setEditingId}
                                                    editingName={editingName}
                                                    setEditingName={setEditingName}
                                                    onUpdateName={handleUpdateCategory}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewMode === 'phantom' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                            <Zap className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="font-bold text-slate-900 mb-1">Categorias Pendentes</h2>
                                            <p className="text-sm text-slate-600">
                                                Estas categorias foram criadas automaticamente pela IA mas ainda não foram oficializadas.
                                                Revise e aprove para manter sua estrutura organizada.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {phantomCategories.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                            <p className="text-slate-600 font-medium">Tudo em ordem!</p>
                                            <p className="text-sm text-slate-400">Não há categorias pendentes no momento</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {phantomCategories.map(phantom => (
                                                <PhantomCategoryCard
                                                    key={phantom.id}
                                                    phantom={phantom}
                                                    onApprove={() => handleAddCategory(null, phantom.name, phantom.id)}
                                                    onQuickMove={handleQuickMove}
                                                    officialCategories={categories}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Quick Creation */}
                    <div className="lg:col-span-1 space-y-4 sticky top-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-xl p-6 text-white">
                            <h3 className="font-bold text-sm uppercase tracking-wider opacity-90 mb-6">
                                Nova Categoria
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold opacity-75 mb-2 block">Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Contas Domésticas"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 focus:border-white/40 rounded-xl outline-none transition-all placeholder:text-white/40 font-medium text-white backdrop-blur-sm"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(null)}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold opacity-75 mb-3 block">Tipo</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/10 rounded-xl">
                                        <button
                                            onClick={() => setNewCatType('despesa')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${newCatType === 'despesa'
                                                ? 'bg-white text-rose-600 shadow-lg'
                                                : 'text-white/60 hover:text-white/90'
                                                }`}
                                        >
                                            Despesa
                                        </button>
                                        <button
                                            onClick={() => setNewCatType('receita')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${newCatType === 'receita'
                                                ? 'bg-white text-emerald-600 shadow-lg'
                                                : 'text-white/60 hover:text-white/90'
                                                }`}
                                        >
                                            Receita
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddCategory(null)}
                                    disabled={!newCatName.trim()}
                                    className="w-full py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Criar Categoria
                                </button>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-900 mb-1">Dica</p>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        Clique no ícone de lápis para editar o nome de uma categoria,
                                        ou no (+) para adicionar subcategorias.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Bar for Selection */}
                {selectedIds.size > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
                        <div className="bg-slate-900 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-6 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                                    {selectedIds.size}
                                </div>
                                <span className="text-sm font-medium">
                                    {selectedIds.size === 1 ? 'lançamento' : 'lançamentos'} selecionado{selectedIds.size > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="h-8 w-px bg-white/20" />

                            <button
                                onClick={() => setShowMoveModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-sm transition-all"
                            >
                                <Move className="w-4 h-4" />
                                Mover
                            </button>

                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Move Modal */}
                {showMoveModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMoveModal(false)}>
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Mover para categoria</h3>
                                <button onClick={() => setShowMoveModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                                {categories.map((cat: Category) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleQuickMove(Array.from(selectedIds), cat)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-4 ${cat.parent_id ? 'ml-6 border-slate-100' : 'border-slate-200'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${cat.type === 'receita' ? 'bg-emerald-50' : 'bg-rose-50'
                                            }`}>
                                            {cat.icon || '📁'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{cat.name}</p>
                                            <p className={`text-xs font-medium mt-0.5 ${cat.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {cat.type === 'receita' ? 'Receita' : 'Despesa'}
                                                {cat.parent_id && ' • Subcategoria'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${toast.type === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                            }`}>
                            {toast.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            <p className="font-bold text-sm">{toast.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

// Tree Node Component
function TreeNode({
    node,
    expanded,
    toggleExpand,
    onDelete,
    loadData,
    officialCategories,
    onQuickMove,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    editingId,
    setEditingId,
    editingName,
    setEditingName,
    onUpdateName
}: any) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const hasTransactions = node.transactions.length > 0;
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");

    const allTransactionIds = node.transactions.map((t: Transaction) => t.id!);
    const allSelected = allTransactionIds.length > 0 && allTransactionIds.every(id => selectedIds.has(id));
    const someSelected = allTransactionIds.some(id => selectedIds.has(id)) && !allSelected;

    const handleCreateSub = async () => {
        if (!newSubName.trim()) return;
        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newSubName,
                    type: node.type,
                    parent_id: node.id,
                    icon: "🔹"
                })
            });
            if (response.ok) {
                setNewSubName("");
                setIsAddingSub(false);
                loadData();
            }
        } catch (e) {
            console.error("Error creating subcategory:", e);
        }
    };

    return (
        <div className="select-none">
            {/* Category Header */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all group ${node.parent_id
                ? 'ml-12 bg-slate-50 border-slate-200 hover:border-slate-300'
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                }`}>
                {/* Expand/Collapse Button */}
                <button
                    onClick={() => (hasChildren || hasTransactions) && toggleExpand(node.id)}
                    disabled={!hasChildren && !hasTransactions}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${hasChildren || hasTransactions
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        : 'bg-slate-50 text-slate-300 cursor-default'
                        }`}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${node.type === 'receita'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                    }`}>
                    {node.icon || (node.parent_id ? '🔹' : '📁')}
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                    {editingId === node.id ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                className="flex-1 px-3 py-1.5 bg-white border-2 border-indigo-500 rounded-lg text-sm font-bold outline-none"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onUpdateName(node.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                            />
                            <button
                                onClick={() => onUpdateName(node.id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{node.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${node.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                    {node.type}
                                </span>
                                {hasTransactions && (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {node.transactions.length} lançamentos
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Total */}
                {hasTransactions && (
                    <div className="text-right mr-4">
                        <p className={`text-sm font-bold ${node.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(node.transactions.reduce((s: number, t: Transaction) => s + t.amount, 0))}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">Total</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {node.isOfficial && (
                        <>
                            <button
                                onClick={() => {
                                    setEditingId(node.id);
                                    setEditingName(node.name);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar nome"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsAddingSub(!isAddingSub)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Adicionar subcategoria"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(node.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Excluir categoria"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Add Subcategory Form */}
            {isAddingSub && (
                <div className="ml-12 mt-2 mb-3 p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <ArrowDownWideNarrow className="w-5 h-5 text-indigo-600" />
                        <input
                            autoFocus
                            placeholder={`Nova subcategoria de ${node.name}...`}
                            className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-400"
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateSub();
                                if (e.key === 'Escape') setIsAddingSub(false);
                            }}
                        />
                        <button
                            onClick={handleCreateSub}
                            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsAddingSub(false)}
                            className="p-2.5 text-slate-400 hover:bg-white rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 space-y-2 ml-6">
                    {/* Children Categories */}
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                            onDelete={onDelete}
                            loadData={loadData}
                            officialCategories={officialCategories}
                            onQuickMove={onQuickMove}
                            selectedIds={selectedIds}
                            toggleSelect={toggleSelect}
                            toggleSelectAll={toggleSelectAll}
                            editingId={editingId}
                            setEditingId={setEditingId}
                            editingName={editingName}
                            setEditingName={setEditingName}
                            onUpdateName={onUpdateName}
                        />
                    ))}

                    {/* Transactions List */}
                    {hasTransactions && (
                        <div className="ml-6 bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
                            {/* Transactions Header */}
                            <div className="p-4 bg-white/60 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleSelectAll(node.transactions)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${allSelected
                                            ? 'bg-indigo-600 text-white'
                                            : someSelected
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-indigo-200'
                                            }`}
                                    >
                                        {allSelected ? (
                                            <CheckSquare className="w-4 h-4" />
                                        ) : someSelected ? (
                                            <Square className="w-4 h-4 fill-current" />
                                        ) : (
                                            <Square className="w-4 h-4" />
                                        )}
                                    </button>
                                    <History className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                                        {node.transactions.length} Lançamentos
                                    </span>
                                </div>
                            </div>

                            {/* Transactions */}
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {node.transactions.map((t: Transaction) => {
                                    const isSelected = selectedIds.has(t.id!);
                                    return (
                                        <div
                                            key={t.id}
                                            className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 transition-all ${isSelected ? 'bg-indigo-50/80' : 'hover:bg-white/60'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleSelect(t.id!)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${isSelected
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-indigo-300'
                                                    }`}
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {t.description}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    {t.account_name && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span className="text-xs text-slate-500 font-medium">
                                                                {t.account_name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <span className={`text-sm font-bold ${t.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(t.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Phantom Category Card Component
function PhantomCategoryCard({ phantom, onApprove, onQuickMove, officialCategories }: any) {
    const [expanded, setExpanded] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const allSelected = phantom.transactions.every((t: Transaction) => selectedIds.has(t.id!));

    return (
        <div className="border-2 border-amber-200 rounded-2xl overflow-hidden bg-amber-50/30">
            {/* Header */}
            <div className="p-5 bg-white/60 flex items-center gap-4">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 transition-colors"
                >
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-amber-700" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-amber-700" />
                    )}
                </button>

                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                    {phantom.icon}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">{phantom.name}</h3>
                        <span className="text-[10px] font-black bg-amber-600 text-white px-2 py-1 rounded-md">
                            PENDENTE
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                        {phantom.count} lançamentos • {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(phantom.total)}
                    </p>
                </div>

                <button
                    onClick={onApprove}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar
                </button>
            </div>

            {/* Expanded Transactions */}
            {expanded && (
                <div className="border-t-2 border-amber-200">
                    <div className="p-4 bg-white/40">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                                Lançamentos nesta categoria
                            </span>
                            {selectedIds.size > 0 && (
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                    {selectedIds.size} selecionados
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {phantom.transactions.map((t: Transaction) => {
                                const isSelected = selectedIds.has(t.id!);
                                return (
                                    <div
                                        key={t.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-white border-2 border-slate-100'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleSelect(t.id!)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {t.description}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>

                                        <span className={`text-sm font-bold ${t.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(t.amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                                <p className="text-xs font-bold text-indigo-900 mb-3">
                                    Mover {selectedIds.size} lançamento(s) para:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {officialCategories.slice(0, 6).map((cat: Category) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                onQuickMove(Array.from(selectedIds), cat);
                                                setSelectedIds(new Set());
                                            }}
                                            className="px-4 py-2 bg-white hover:bg-indigo-600 hover:text-white border-2 border-slate-200 hover:border-indigo-600 rounded-xl text-xs font-bold transition-all"
                                        >
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}