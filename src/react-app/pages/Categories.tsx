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
    CheckCircle2,
    Filter,
    CheckSquare,
    Square,
    Move,
    ArrowDownWideNarrow,
    Layers
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchMoving, setBatchMoving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catsRes, transRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/transactions")
            ]);

            const catsData = await catsRes.json();
            const transData = await transRes.json();

            setCategories(Array.isArray(catsData) ? catsData : []);
            setTransactions(Array.isArray(transData.transactions) ? transData.transactions : []);

            // Auto expand items with transactions or root items
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
            }
        } catch (error) {
            console.error("Error updating category:", error);
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

    const handleQuickMove = async (transactionIds: string[], targetCategory: Category) => {
        setBatchMoving(true);
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

            // Perform updates sequentially or wrap in a Promise.all if the API supports batch (it doesn't yet)
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
            loadData();
        } catch (err) {
            console.error('Error moving transactions:', err);
        } finally {
            setBatchMoving(false);
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
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

        const officialNames = new Set(categories.map(c => c.name));
        const phantoms: any[] = [];

        Object.keys(transByCatName).forEach(catName => {
            if (!officialNames.has(catName) && catName !== "Sem Categoria") {
                const trans = transByCatName[catName];
                phantoms.push({
                    id: `phantom-${catName}`,
                    name: catName,
                    type: trans[0]?.type || 'despesa',
                    isOfficial: false,
                    isPhantom: true,
                    icon: "🤖",
                    children: [],
                    transactions: trans
                });
            }
        });

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

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 pb-32">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Escritório de Categorias</h1>
                        <p className="text-slate-500 font-medium italic">Gestão unificada, auditoria e limpeza de dados em um só lugar.</p>
                    </div>

                    <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                        <div className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-xl text-sm font-bold">
                            <Layers className="w-4 h-4" />
                            Árvore de Controle
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Main Workspace */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar em toda a estrutura..."
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white shadow-inner focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm transition-all font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={seedDefaults}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-white shadow-sm border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Padrões Inteligentes
                                </button>
                            </div>

                            <div className="p-6">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <Tag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                                        </div>
                                        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Sincronizando Infraestrutura</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
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
                                                selectedIds={selectedIds}
                                                toggleSelect={toggleSelect}
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
                    </div>

                    {/* Quick Creation */}
                    <div className="lg:col-span-1 space-y-4 sticky top-6">
                        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-indigo-400 mb-8 ml-1">Estrutura Raiz</h3>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Nome da Categoria..."
                                        className="w-full px-0 py-4 bg-transparent border-b-2 border-white/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-extrabold text-lg"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NATUREZA DO FLUXO</label>
                                    <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                        <button
                                            onClick={() => setNewCatType('despesa')}
                                            className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${newCatType === 'despesa' ? 'bg-white text-rose-600 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            DESPESA
                                        </button>
                                        <button
                                            onClick={() => setNewCatType('receita')}
                                            className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${newCatType === 'receita' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            RECEITA
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddCategory(null)}
                                    disabled={!newCatName}
                                    className="w-full h-16 bg-indigo-600 text-white font-black text-sm rounded-3xl shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3 mt-4"
                                >
                                    CRIAR AGORA
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 relative group select-none">
                            <div className="flex gap-4">
                                <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-blue-900 mb-1 leading-tight">Configurações de Hierarquia</p>
                                    <p className="text-[11px] text-blue-800/60 leading-relaxed font-bold">
                                        Você pode clicar no nome de qualquer item na árvore ao lado para editá-lo imediatamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Selection Bar */}
                {selectedIds.size > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                        <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-4 pl-8 border border-white/10 flex items-center gap-8 backdrop-blur-xl">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-indigo-400 leading-none">{selectedIds.size}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Selecionados</span>
                            </div>

                            <div className="h-10 w-px bg-white/10" />

                            <div className="flex items-center gap-4">
                                <div className="relative group/batch">
                                    <button
                                        disabled={batchMoving}
                                        className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all active:scale-95"
                                    >
                                        <Move className="w-4 h-4" />
                                        Mover em Bloco
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    <div className="absolute bottom-full right-0 mb-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-4 opacity-0 group-hover/batch:opacity-100 pointer-events-none group-hover/batch:pointer-events-auto transition-all scale-95 group-hover/batch:scale-100 origin-bottom-right">
                                        <p className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-[0.2em]">Selecione o Destino</p>
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                                            {categories.map((oc: Category) => (
                                                <button
                                                    key={oc.id}
                                                    onClick={() => handleQuickMove(Array.from(selectedIds), oc)}
                                                    className="w-full text-left p-3 text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm">
                                                        {oc.icon || '📁'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{oc.name}</span>
                                                        {oc.parent_id && <span className="text-[8px] opacity-50">SUB-ITEM</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedIds(new Set())}
                                    className="p-4 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function TreeNode({
    node,
    expanded,
    toggleExpand,
    onDelete,
    loadData,
    officialCategories,
    onQuickMove,
    onRegisterPhantom,
    selectedIds,
    toggleSelect,
    editingId,
    setEditingId,
    editingName,
    setEditingName,
    onUpdateName
}: any) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const [subSearch, setSubSearch] = useState("");
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");

    const filteredTransactions = useMemo(() => {
        if (!subSearch) return node.transactions;
        const low = subSearch.toLowerCase();
        return node.transactions.filter((t: any) => t.description.toLowerCase().includes(low));
    }, [node.transactions, subSearch]);

    const hasAnyAction = hasChildren || node.transactions.length > 0;

    const startEditing = () => {
        if (!node.isOfficial) return;
        setEditingId(node.id);
        setEditingName(node.name);
    };

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
                    icon: "↳"
                })
            });
            if (response.ok) {
                setNewSubName("");
                setIsAddingSub(false);
                loadData();
            } catch (e) {
                console.error("Error creating subcategory:", e);
            }
        };

        return (
            <div className="select-none group/node">
                <div
                    className={`flex items-center justify-between p-4 rounded-[1.5rem] transition-all border ${node.parent_id
                        ? 'ml-8 bg-white border-slate-100 hover:border-indigo-100 pl-6'
                        : node.isPhantom
                            ? 'bg-amber-50/40 border-amber-100 shadow-sm'
                            : 'bg-white border-slate-50 shadow-sm hover:shadow-md'
                        }`}
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button
                            onClick={() => hasAnyAction && toggleExpand(node.id)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition-all hover:border-indigo-200 ${!hasAnyAction && 'opacity-0 cursor-default'}`}
                        >
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                        </button>

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner ${node.type === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {node.icon || (node.parent_id ? '↳' : '📁')}
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingId === node.id ? (
                                <div className="flex items-center gap-2 pr-4">
                                    <input
                                        autoFocus
                                        className="bg-slate-50 border-2 border-indigo-500 rounded-lg px-3 py-1 text-sm font-black w-full outline-none"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onUpdateName(node.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                    />
                                    <button onClick={() => onUpdateName(node.id)} className="text-indigo-600"><Save className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span
                                        onClick={startEditing}
                                        className={`text-sm font-black text-slate-900 truncate ${node.isOfficial ? 'cursor-pointer hover:underline decoration-indigo-200 decoration-2 underline-offset-4' : ''}`}
                                    >
                                        {node.name}
                                    </span>
                                    {node.isPhantom && (
                                        <span className="text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1.5 shrink-0">
                                            <History className="w-2.5 h-2.5" /> IA PENDENTE
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[8px] font-black tracking-widest uppercase ${node.type === 'receita' ? 'text-emerald-500' : 'text-rose-400'}`}>
                                    {node.type}
                                </span>
                                {node.transactions.length > 0 && (
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        {node.transactions.length} LANÇAMENTOS
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${node.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(node.transactions.reduce((s: any, t: any) => s + t.amount, 0))}
                            </span>
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Fluxo Total</span>
                        </div>

                        <div className="flex items-center gap-1.5 ml-4 border-l border-slate-100 pl-6">
                            {node.isPhantom && (
                                <button
                                    onClick={() => onRegisterPhantom(null, node.name)}
                                    className="px-3 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 transition-all"
                                >
                                    EFETIVAR
                                </button>
                            )}
                            {node.isOfficial && (
                                <button
                                    onClick={() => setIsAddingSub(!isAddingSub)}
                                    className="p-2.5 text-indigo-500 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-xl transition-all"
                                    title="Sub-Nível"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                </button>
                            )}
                            {node.isOfficial && (
                                <button
                                    onClick={() => onDelete(node.id)}
                                    className="p-2.5 text-rose-300 hover:text-rose-600 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-xl transition-all"
                                    title="Excluir Categoria"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-addition field */}
                {isAddingSub && (
                    <div className="ml-16 mt-2 mb-4 bg-indigo-50/50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <ArrowDownWideNarrow className="w-4 h-4 text-indigo-600" />
                        </div>
                        <input
                            autoFocus
                            className="flex-1 bg-transparent outline-none font-black text-sm text-indigo-900 placeholder:text-indigo-300"
                            placeholder={`Definir subcategoria de ${node.name}...`}
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateSub()}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCreateSub} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-90 transition-all"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setIsAddingSub(false)} className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-200"><X className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}

                {isExpanded && (
                    <div className="mt-3 space-y-3">
                        {/* Recursive Children */}
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
                                selectedIds={selectedIds}
                                toggleSelect={toggleSelect}
                                editingId={editingId}
                                setEditingId={setEditingId}
                                editingName={editingName}
                                setEditingName={setEditingName}
                                onUpdateName={onUpdateName}
                            />
                        ))}

                        {/* Transaction Audit Panel */}
                        {node.transactions.length > 0 && (
                            <div className={`ml-12 mr-2 bg-slate-50/60 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-inner ${node.children.length > 0 ? 'mt-6' : ''}`}>
                                <div className="p-6 bg-white/40 border-b border-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <History className="w-4 h-4 text-slate-400" />
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Filtrar Lançamentos em {node.name}</h5>
                                    </div>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Filtrar por nome..."
                                            className="pl-8 pr-4 py-2 rounded-xl border border-white bg-slate-100/50 focus:bg-white text-xs font-bold outline-none transition-all placeholder:text-slate-400"
                                            value={subSearch}
                                            onChange={(e) => setSubSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-1">
                                    {filteredTransactions.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <p className="text-xs font-bold text-slate-400">Nenhum lançamento corresponde ao filtro</p>
                                        </div>
                                    ) : (
                                        filteredTransactions.map((t: Transaction) => {
                                            const isSelected = selectedIds.has(t.id!);
                                            return (
                                                <div
                                                    key={t.id}
                                                    className={`flex items-center justify-between p-4 border-b border-transparent transition-all group/item ${isSelected ? 'bg-indigo-50/80 border-indigo-100' : 'hover:bg-white/60'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <button
                                                            onClick={() => toggleSelect(t.id!)}
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white rotate-0' : 'bg-white border border-slate-100 text-slate-300 hover:border-indigo-200 hover:text-indigo-400'
                                                                }`}
                                                        >
                                                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                        </button>

                                                        <div className="flex-1">
                                                            <p className="text-sm font-black text-slate-800 leading-tight group-hover/item:text-indigo-900 transition-colors">{t.description}</p>
                                                            <div className="flex items-center gap-4 mt-1.5 opacity-60">
                                                                <span className="text-[10px] font-bold flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {new Date(t.date).toLocaleDateString('pt-BR')}
                                                                </span>
                                                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.account_name || 'PADRÃO'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-8">
                                                        <span className={`text-sm font-black tracking-tight ${t.type === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                                        </span>

                                                        <div className="relative group/pop">
                                                            <button className="p-2.5 bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md rounded-xl transition-all">
                                                                <ArrowUpRight className="w-4 h-4" />
                                                            </button>

                                                            {/* Single Item Quick Move */}
                                                            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-4 opacity-0 group-hover/pop:opacity-100 pointer-events-none group-hover/pop:pointer-events-auto transition-all scale-95 group-hover/pop:scale-100 origin-top-right z-30">
                                                                <p className="text-[9px] font-black text-slate-400 px-3 mb-4 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">Destino Individual</p>
                                                                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                                                                    {officialCategories.map((oc: Category) => (
                                                                        <button
                                                                            key={oc.id}
                                                                            onClick={() => onQuickMove([t.id!], oc)}
                                                                            className="w-full text-left p-2.5 text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-3 border border-transparent hover:border-slate-100"
                                                                        >
                                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                                {oc.icon || '📁'}
                                                                            </div>
                                                                            <div>
                                                                                {oc.name}
                                                                                {oc.parent_id && <div className="text-[7px] opacity-40 leading-none mt-0.5">FILHA</div>}
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
