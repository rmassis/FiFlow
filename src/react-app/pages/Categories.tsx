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
    ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { Category } from "@/shared/types";

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
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<'receita' | 'despesa'>('despesa');
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'manage' | 'reclassify'>('manage');

    // Reclassification state
    const [oldCategoryText, setOldCategoryText] = useState("");
    const [newCategoryId, setNewCategoryId] = useState("");
    const [reclassifying, setReclassifying] = useState(false);
    const [affectedCount, setAffectedCount] = useState(0);
    const [distinctOldCategories, setDistinctOldCategories] = useState<string[]>([]);

    useEffect(() => {
        loadCategories();
        loadDistinctOldCategories();
    }, []);

    useEffect(() => {
        if (oldCategoryText) {
            fetch(`/api/transactions?category=${encodeURIComponent(oldCategoryText)}`)
                .then(res => res.json())
                .then(data => setAffectedCount(data.transactions.length));
        } else {
            setAffectedCount(0);
        }
    }, [oldCategoryText]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            const cats = Array.isArray(data) ? data : [];
            setCategories(cats);
            // Auto expand root items
            setExpanded(new Set(cats.filter((c: any) => !c.parent_id).map((c: any) => c.id)));
        } catch (error) {
            console.error("Error loading categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const loadDistinctOldCategories = async () => {
        try {
            const response = await fetch("/api/transactions/stats/categories");
            const data = await response.json();
            const cats = Array.isArray(data?.categories) ? data.categories : [];
            setDistinctOldCategories(cats.map((c: any) => c.category));
        } catch (error) {
            console.error("Error loading transaction categories:", error);
            setDistinctOldCategories([]);
        }
    };

    const toggleExpand = (id: string) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpanded(next);
    };

    const handleAddCategory = async (parentId?: string | null) => {
        if (!newCatName.trim()) return;

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCatName,
                    type: newCatType,
                    parent_id: parentId,
                    color: "#94A3B8",
                    icon: parentId ? "🔹" : "📁"
                })
            });
            if (response.ok) {
                setNewCatName("");
                loadCategories();
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria? Subcategorias também serão excluídas.")) return;
        try {
            await fetch(`/api/categories/${id}`, { method: "DELETE" });
            loadCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const handleReclassify = async () => {
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
            loadCategories();
        } catch (error) {
            console.error("Error seeding:", error);
        } finally {
            setLoading(false);
        }
    };

    // Build tree structure
    const categoryTree = useMemo(() => {
        const map: Record<string, any> = {};
        const roots: any[] = [];
        const cats = Array.isArray(categories) ? categories : [];

        cats.forEach(cat => {
            map[cat.id] = { ...cat, children: [] };
        });

        cats.forEach(cat => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(map[cat.id]);
            } else {
                roots.push(map[cat.id]);
            }
        });

        return roots;
    }, [categories]);

    const filteredTree = useMemo(() => {
        if (!searchTerm) return categoryTree;
        const lowerSearch = searchTerm.toLowerCase();

        const filterNode = (node: any) => {
            const nameMatch = node.name.toLowerCase().includes(lowerSearch);
            const filteredChildren = node.children.map(filterNode).filter((c: any) => c !== null);

            if (nameMatch || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        return categoryTree.map(filterNode).filter(n => n !== null);
    }, [categoryTree, searchTerm]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestão de Categorias</h1>
                        <p className="text-gray-500">Organize sua árvore de gastos e reclassifique transações em massa.</p>
                    </div>

                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 self-start">
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'manage' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Árvore de Categorias
                        </button>
                        <button
                            onClick={() => setActiveTab('reclassify')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'reclassify' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Reclassificação em Massa
                        </button>
                    </div>
                </header>

                {activeTab === 'manage' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tree View */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar categoria..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={seedDefaults}
                                        className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Sugerir Padrões
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                                    </div>
                                ) : filteredTree.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                                        <p className="text-sm text-gray-400">Adicione uma categoria raiz para começar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredTree.map(node => (
                                            <TreeNode
                                                key={node.id}
                                                node={node}
                                                expanded={expanded}
                                                toggleExpand={toggleExpand}
                                                onDelete={handleDelete}
                                                onAddSub={() => setEditingId(node.id)}
                                                onEdit={() => {/* TODO */ }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Add Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <PlusCircle className="w-5 h-5 text-indigo-600" />
                                    Nova Categoria Raiz
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Lazer"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={newCatName}
                                            onChange={(e) => setNewCatName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
                                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                                            <button
                                                onClick={() => setNewCatType('despesa')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${newCatType === 'despesa' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Despesa
                                            </button>
                                            <button
                                                onClick={() => setNewCatType('receita')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${newCatType === 'receita' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Receita
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAddCategory(null)}
                                        disabled={!newCatName}
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Criar Categoria
                                    </button>
                                </div>

                                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            Categorias servem como tags para agrupar suas transações. O banco de dados suporta ilimitados níveis de subcategorias.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Reclassification View */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Processamento em Massa</h3>
                                <p className="text-sm text-gray-500">Mude o nome ou a categoria de centenas de transações de uma vez.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">De (Categoria Atual no Extrato)</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                    value={oldCategoryText}
                                    onChange={(e) => setOldCategoryText(e.target.value)}
                                >
                                    <option value="">Selecione uma categoria existente...</option>
                                    {distinctOldCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat || "(Sem categoria)"}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="hidden md:flex justify-center pb-4">
                                <ArrowRight className="w-6 h-6 text-gray-300" />
                            </div>

                            <div className="md:col-start-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Para (Nova Categoria FiFlow)</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                    value={newCategoryId}
                                    onChange={(e) => setNewCategoryId(e.target.value)}
                                >
                                    <option value="">Selecione para onde mover...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.parent_id ? "  ↳ " : ""}{cat.type === 'receita' ? "⬆️ " : "⬇️ "}{cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleReclassify}
                            disabled={!oldCategoryText || !newCategoryId || reclassifying}
                            className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {reclassifying ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                            Executar Reclassificação Global
                        </button>

                        <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-amber-900">Atenção ao Reclassificar</p>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Esta ação irá atualizar **{affectedCount}** transações que possuem a categoria "{oldCategoryText || '???'}" nos extratos.
                                    Você não poderá desfazer essa ação facilmente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function TreeNode({ node, expanded, toggleExpand, onDelete, onAddSub, onEdit }: any) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;

    const [isAdding, setIsAdding] = useState(false);
    const [subName, setSubName] = useState("");

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
                // We'd need to lift this state up or just re-re-render
                window.location.reload(); // Simple reload for MVP sub-adding refresh
            }
        } catch (e) { }
    };

    return (
        <div className="select-none">
            <div
                className={`group flex items-center justify-between p-2 rounded-xl transition-all ${node.parent_id ? 'ml-6 border-l border-gray-100 pl-4' : 'bg-gray-50/30'
                    } hover:bg-gray-100/100`}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => hasChildren && toggleExpand(node.id)}
                        className={`p-1 rounded hover:bg-white transition-colors ${!hasChildren && 'opacity-0 cursor-default'}`}
                    >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${node.type === 'receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {node.icon || (node.parent_id ? '↳' : '📁')}
                    </div>

                    <div>
                        <span className="text-sm font-medium text-gray-900">{node.name}</span>
                        <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-tighter ${node.type === 'receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {node.type}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!node.parent_id && (
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="p-1.5 text-indigo-600 hover:bg-white rounded-md transition-colors"
                            title="Adicionar Subcategoria"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(node.id)}
                        className="p-1.5 text-red-500 hover:bg-white rounded-md transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="ml-14 mt-1 mb-2 flex items-center gap-2 p-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <input
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                        placeholder="Nome da subcategoria..."
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSub()}
                    />
                    <button onClick={handleCreateSub} className="p-1 text-indigo-600 hover:bg-white rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setIsAdding(false)} className="p-1 text-gray-400 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                </div>
            )}

            {isExpanded && hasChildren && (
                <div className="mt-1">
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
