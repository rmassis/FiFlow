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
    PlusCircle,
    Tag,
    AlertCircle,
    ArrowRight,
    FileText,
    Calendar,
    ArrowUpRight,
    History,
    MoreVertical,
    CheckCircle2
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

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<'receita' | 'despesa'>('despesa');
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'manage' | 'reclassify'>('manage');

    // Reclassification state
    const [oldCategoryText, setOldCategoryText] = useState("");
    const [newCategoryId, setNewCategoryId] = useState("");
    const [reclassifying, setReclassifying] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catsRes, transRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/transactions") // Fetch all for grouping
            ]);

            const catsData = await catsRes.json();
            const transData = await transRes.json();

            setCategories(Array.isArray(catsData) ? catsData : []);
            setTransactions(Array.isArray(transData.transactions) ? transData.transactions : []);

            // Auto expand items that have transactions
            if (Array.isArray(catsData)) {
                setExpanded(new Set(catsData.filter((c: any) => !c.parent_id).map((c: any) => c.id)));
            }
        } catch (error) {
            console.error("Error loading data:", error);
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

    const handleAddCategory = async (parentId?: string | null, nameOverride?: string) => {
        const name = nameOverride || newCatName;
        if (!name.trim()) return;

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    type: newCatType,
                    parent_id: parentId,
                    color: "#94A3B8",
                    icon: parentId ? "🔹" : "📁"
                })
            });
            if (response.ok) {
                setNewCatName("");
                loadData();
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria? Subcategorias também serão excluídas.")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            loadData();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const handleQuickMove = async (transactionId: string, newCategoryName: string, type: string) => {
        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newCategoryName, type }),
            });
            if (response.ok) {
                loadData();
            }
        } catch (err) {
            console.error('Error moving transaction:', err);
        }
    };

    const handleBulkReclassify = async () => {
        if (!oldCategoryText || !newCategoryId) return;
        const targetCat = categories.find(c => c.id === newCategoryId);
        if (!targetCat) return;

        setReclassifying(true);
        try {
            const response = await fetch("/api/categories/reclassify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldCategory: oldCategoryText,
                    newCategory: targetCat.name,
                    type: targetCat.type
                })
            });
            if (response.ok) {
                const result = await response.json();
                alert(`${result.count} transações foram reclassificadas com sucesso!`);
                setOldCategoryText("");
                setNewCategoryId("");
                loadData();
            }
        } catch (error) {
            console.error("Error reclassifying:", error);
        } finally {
            setReclassifying(false);
        }
    };

    const seedDefaults = async () => {
        if (!confirm("Deseja importar as categorias padrão?")) return;
        setLoading(true);
        try {
            for (const cat of DEFAULT_CATEGORIES) {
                await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cat)
                });
            }
            loadData();
        } catch (error) {
            console.error("Error seeding:", error);
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by category name
    const transByCatName = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        transactions.forEach(t => {
            const cat = t.category || "Sem Categoria";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(t);
        });
        return groups;
    }, [transactions]);

    // Build unified tree (Official Categories + Phantom Categories found in Transactions)
    const unifiedTree = useMemo(() => {
        const map: Record<string, any> = {};
        const roots: any[] = [];

        // 1. Add Official Categories
        categories.forEach(cat => {
            map[cat.id] = {
                ...cat,
                isOfficial: true,
                children: [],
                transactions: transByCatName[cat.name] || []
            };
        });

        categories.forEach(cat => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(map[cat.id]);
            } else if (!cat.parent_id) {
                roots.push(map[cat.id]);
            }
        });

        // 2. Identify and Add "Phantom" Categories (from transactions but not in official table)
        const officialNames = new Set(categories.map(c => c.name));
        const phantoms: any[] = [];

        Object.keys(transByCatName).forEach(catName => {
            if (!officialNames.has(catName) && catName !== "Sem Categoria") {
                const trans = transByCatName[catName];
                // Infer type from first transaction
                const type = trans[0]?.type || 'despesa';
                phantoms.push({
                    id: `phantom-${catName}`,
                    name: catName,
                    type,
                    isOfficial: false,
                    isPhantom: true,
                    icon: "🤖",
                    children: [],
                    transactions: trans
                });
            }
        });

        // Add special "Uncategorized" group
        if (transByCatName["Sem Categoria"]) {
            phantoms.push({
                id: `phantom-uncategorized`,
                name: "Sem Categoria",
                type: 'despesa',
                isOfficial: false,
                isPhantom: true,
                icon: "❓",
                children: [],
                transactions: transByCatName["Sem Categoria"]
            });
        }

        return [...roots, ...phantoms];
    }, [categories, transByCatName]);

    const filteredTree = useMemo(() => {
        if (!searchTerm) return unifiedTree;
        const lowerSearch = searchTerm.toLowerCase();

        const filterNode = (node: any) => {
            const nameMatch = node.name.toLowerCase().includes(lowerSearch);
            const filteredChildren = node.children.map(filterNode).filter((c: any) => c !== null);

            if (nameMatch || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        return unifiedTree.map(filterNode).filter(n => n !== null);
    }, [unifiedTree, searchTerm]);

    const distinctTransactionCategories = useMemo(() => {
        return Object.keys(transByCatName).sort();
    }, [transByCatName]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestão de Categorias</h1>
                        <p className="text-slate-500 font-medium">Audite transações e normalize sua árvore financeira.</p>
                    </div>

                    <div className="flex bg-slate-100 rounded-2xl p-1.5 self-start shadow-inner border border-slate-200">
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${activeTab === 'manage' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Árvore e Transações
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('reclassify')}
                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${activeTab === 'reclassify' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Reclassificação em Massa
                            </div>
                        </button>
                    </div>
                </header>

                {activeTab === 'manage' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        {/* Tree View */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar na árvore..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all shadow-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={seedDefaults}
                                        className="flex items-center gap-2 px-4 py-2.5 text-indigo-600 hover:bg-white hover:shadow-md border border-transparent hover:border-indigo-100 rounded-2xl text-sm font-bold transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Sugestão da IA
                                    </button>
                                </div>

                                <div className="p-4">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 font-medium">Sincronizando dados...</p>
                                        </div>
                                    ) : filteredTree.length === 0 ? (
                                        <div className="text-center py-24">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <Tag className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold text-lg">Nada por aqui</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                                                Sua árvore está vazia. Adicione categorias ou importe transações para começar.
                                            </p>
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
                                                    onRegisterPhantom={handleAddCategory}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Add Form */}
                        <div className="lg:col-span-1 sticky top-6">
                            <div className="bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                <h3 className="font-extrabold text-xl mb-6 flex items-center gap-3">
                                    <PlusCircle className="w-6 h-6 text-indigo-200" />
                                    Categoria Raiz
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-3 ml-1">Nome Identificador</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Projetos"
                                            className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 focus:bg-white focus:text-slate-900 focus:ring-0 outline-none transition-all placeholder:text-indigo-300 font-bold"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-3 ml-1">Natureza</label>
                                        <div className="flex p-1.5 bg-black/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                            <button
                                                onClick={() => setNewCatType('despesa')}
                                                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${newCatType === 'despesa' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-100 hover:bg-white/5'}`}
                                            >
                                                DESPESA
                                            </button>
                                            <button
                                                onClick={() => setNewCatType('receita')}
                                                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${newCatType === 'receita' ? 'bg-white text-emerald-600 shadow-lg' : 'text-indigo-100 hover:bg-white/5'}`}
                                            >
                                                RECEITA
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAddCategory(null)}
                                        disabled={!newCatName}
                                        className="w-full h-14 bg-white text-indigo-600 font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                                    >
                                        EFETIVAR CRIAÇÃO
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-6 bg-amber-50 rounded-[2rem] border border-amber-100/50 shadow-sm relative overflow-hidden">
                                <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-200/20 rotate-12" />
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 mb-1 leading-tight">Sugestão Profissional</p>
                                        <p className="text-[11px] text-amber-800/80 leading-relaxed font-medium">
                                            Mantenha no máximo 10 categorias raiz para uma visualização clara nos relatórios de performance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Massive Reclassification View */
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12 max-w-4xl mx-auto w-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="flex items-center gap-6 mb-12 relative z-10">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                <RefreshCw className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Processamento em Massa</h3>
                                <p className="text-slate-500 font-medium">Troque a identidade de milhares de transações em um clique.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-12 relative z-10">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black text-slate-700 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    ORIGEM (CONTEÚDO DO EXTRATO)
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none appearance-none font-bold text-slate-700 transition-all shadow-sm"
                                        value={oldCategoryText}
                                        onChange={(e) => setOldCategoryText(e.target.value)}
                                    >
                                        <option value="">Selecione o alvo...</option>
                                        {distinctTransactionCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="hidden md:flex justify-center pb-6">
                                <div className="p-3 rounded-full bg-indigo-50 text-indigo-400">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="md:col-start-2 space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black text-slate-700 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    DESTINO (SISTEMA FIFLOW)
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-indigo-100 bg-indigo-50/30 focus:bg-white focus:border-indigo-500 outline-none appearance-none font-bold text-indigo-700 transition-all shadow-sm"
                                        value={newCategoryId}
                                        onChange={(e) => setNewCategoryId(e.target.value)}
                                    >
                                        <option value="">Selecione o destino...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.parent_id ? "  ↳ " : ""}{cat.type === 'receita' ? "⬆️ " : "⬇️ "}{cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBulkReclassify}
                            disabled={!oldCategoryText || !newCategoryId || reclassifying}
                            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black rounded-3xl shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 text-lg relative z-10"
                        >
                            {reclassifying ? (
                                <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-6 h-6" />
                            )}
                            EXECUTAR NORMALIZAÇÃO GLOBAL
                        </button>

                        <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-200/50 flex gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle className="w-7 h-7 text-amber-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-black text-amber-900 leading-tight">Protocolo de Reclassificação</p>
                                <p className="text-sm text-amber-800/80 leading-relaxed font-bold">
                                    Mover transações de "{oldCategoryText || '???'}" impactará permanentemente o histórico.
                                    Certifique-se que o saldo das categorias faça sentido após a operação.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function TreeNode({ node, expanded, toggleExpand, onDelete, loadData, officialCategories, onQuickMove, onRegisterPhantom }: any) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const hasTransactions = node.transactions.length > 0;
    const hasAnyAction = hasChildren || hasTransactions;

    const [isAdding, setIsAdding] = useState(false);
    const [subName, setSubName] = useState("");
    const [showTransactions, setShowTransactions] = useState(false);

    const handleCreateSub = async () => {
        if (!subName.trim()) return;
        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: subName,
                    type: node.type,
                    parent_id: node.id,
                    icon: "↳"
                })
            });
            if (response.ok) {
                setSubName("");
                setIsAdding(false);
                loadData();
            }
        } catch (e) { }
    };

    const formatBRL = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="select-none mb-1">
            <div
                className={`group flex items-center justify-between p-3 rounded-2xl transition-all ${node.parent_id
                        ? 'ml-8 border-l-2 border-slate-100 pl-6'
                        : node.isPhantom
                            ? 'bg-amber-50/50 border border-amber-100 shadow-sm'
                            : 'bg-slate-50/50 border border-transparent hover:border-slate-200'
                    } hover:bg-white hover:shadow-lg hover:shadow-slate-200/50`}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => hasAnyAction && toggleExpand(node.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-indigo-200 ${!hasAnyAction && 'opacity-0 cursor-default'}`}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                    </button>

                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner ${node.type === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {node.icon || (node.parent_id ? '↳' : '📁')}
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-900">{node.name}</span>
                            {node.isPhantom && (
                                <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1">
                                    IA / PENDENTE
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${node.type === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {node.type}
                            </span>
                            {hasTransactions && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <History className="w-3 h-3" />
                                    {node.transactions.length} transações
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${node.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatBRL(node.transactions.reduce((s: any, t: any) => s + t.amount, 0))}
                    </span>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all ml-4">
                        {node.isPhantom && (
                            <button
                                onClick={() => onRegisterPhantom(null, node.name)}
                                className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                title="Efetivar esta categoria na árvore oficial"
                            >
                                EFETIVAR
                            </button>
                        )}
                        {!node.parent_id && node.isOfficial && (
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="p-2 text-indigo-600 bg-white hover:shadow-md rounded-xl border border-slate-100 transition-all"
                                title="Nova Subcategoria"
                            >
                                <PlusCircle className="w-4 h-4" />
                            </button>
                        )}
                        {node.isOfficial && (
                            <button
                                onClick={() => onDelete(node.id)}
                                className="p-2 text-rose-500 bg-white hover:shadow-md rounded-xl border border-slate-100 transition-all hover:bg-rose-50"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline Add Child */}
            {isAdding && (
                <div className="ml-16 mt-2 mb-3 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-inner">
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 font-bold text-indigo-900 placeholder:text-indigo-300"
                        placeholder="Nome da subcategoria..."
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSub()}
                    />
                    <button onClick={handleCreateSub} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-90"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl border border-slate-100"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Expanded Content (Children + Transactions) */}
            {isExpanded && (
                <div className="mt-2 space-y-2">
                    {/* Subcategories */}
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                            onDelete={onDelete}
                            loadData={loadData}
                            onQuickMove={onQuickMove}
                            officialCategories={officialCategories}
                            onRegisterPhantom={onRegisterPhantom}
                        />
                    ))}

                    {/* Transactions list under this category */}
                    {hasTransactions && (
                        <div className={`ml-12 mr-2 p-4 bg-slate-50/30 rounded-3xl border border-slate-100/50 ${node.children.length > 0 ? 'mt-4' : ''}`}>
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <History className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transações Recentes</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {node.transactions.map((t: Transaction) => (
                                    <div key={t.id} className="group/item flex items-center justify-between p-3 bg-white border border-slate-50 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-none">{t.description}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 font-black">
                                                        {t.account_name || 'Carteira'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className={`text-sm font-black ${t.type === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {formatBRL(t.amount)}
                                            </span>

                                            <div className="relative group/pop">
                                                <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>

                                                {/* Tooltip Quick Move Selection */}
                                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 opacity-0 group-hover/pop:opacity-100 pointer-events-none group-hover/pop:pointer-events-auto transition-all z-20 scale-95 group-hover/pop:scale-100 origin-top-right">
                                                    <p className="text-[10px] font-black text-slate-400 px-3 mb-2 uppercase tracking-tight">Mover para:</p>
                                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                        {officialCategories.map((oc: Category) => (
                                                            <button
                                                                key={oc.id}
                                                                onClick={() => onQuickMove(t.id, oc.name, oc.type)}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-2"
                                                            >
                                                                <div className="w-5 h-5 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] group-hover:bg-indigo-100 transition-colors">
                                                                    {oc.icon || '📁'}
                                                                </div>
                                                                {oc.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
