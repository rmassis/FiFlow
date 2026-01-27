import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Filter,
  Trash2,
  Loader2
} from "lucide-react";
import type { Transaction } from "@/shared/types";

interface PreviewStepProps {
  transactions: Transaction[];
  onConfirm: (transactions: Transaction[]) => void;
  onBack: () => void;
}

export function PreviewStep({ transactions, onConfirm, onBack }: PreviewStepProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categorizationProgress, setCategorizationProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    applyFilters();
  }, [categoryFilter, confidenceFilter, typeFilter, transactions]);

  useEffect(() => {
    if (transactions.length > 0 && transactions[0].category === '') {
      startCategorization();
    }
  }, []);

  const startCategorization = async () => {
    setIsCategorizing(true);
    setCategorizationProgress({ current: 0, total: transactions.length });

    try {
      const response = await fetch('/api/categorize-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao categorizar transações');
      }

      const data = await response.json();
      
      // Check if we got valid categorized transactions
      if (data.transactions && Array.isArray(data.transactions)) {
        setFilteredTransactions(data.transactions);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Error categorizing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao categorizar transações';
      alert(errorMessage);
    } finally {
      setIsCategorizing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (confidenceFilter !== 'all') {
      if (confidenceFilter === 'low') {
        filtered = filtered.filter(t => t.confidence < 0.7);
      } else if (confidenceFilter === 'medium') {
        filtered = filtered.filter(t => t.confidence >= 0.7 && t.confidence < 0.9);
      } else if (confidenceFilter === 'high') {
        filtered = filtered.filter(t => t.confidence >= 0.9);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((_, i) => i.toString())));
    }
  };

  const deleteSelected = () => {
    const remainingTransactions = transactions.filter((_, i) => !selectedIds.has(i.toString()));
    setFilteredTransactions(remainingTransactions);
    setSelectedIds(new Set());
  };

  const stats = {
    total: transactions.length,
    receitas: transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
    despesas: transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
    lowConfidence: transactions.filter(t => t.needsReview).length,
  };

  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Alta';
    if (confidence >= 0.7) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Receitas</p>
              <p className="text-2xl font-bold text-emerald-600">{formatBRL(stats.receitas)}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Despesas</p>
              <p className="text-2xl font-bold text-red-600">{formatBRL(stats.despesas)}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Revisão</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowConfidence}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Categorization Progress */}
      {isCategorizing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <p className="font-semibold text-indigo-900">
              Categorizando com IA... {categorizationProgress.current} de {categorizationProgress.total}
            </p>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${categorizationProgress.total > 0 ? (categorizationProgress.current / categorizationProgress.total) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filtros:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas confiâncias</option>
            <option value="low">Baixa (&lt; 70%)</option>
            <option value="medium">Média (70-90%)</option>
            <option value="high">Alta (&gt; 90%)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>

          <div className="ml-auto flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subcategoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Confiança</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(index.toString())}
                      onChange={() => toggleSelection(index.toString())}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(transaction.date instanceof Date ? transaction.date : new Date(transaction.date)).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span className={transaction.type === 'receita' ? 'text-emerald-600' : 'text-red-600'}>
                      {transaction.type === 'receita' ? '+' : '-'}{formatBRL(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{transaction.subcategory || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(transaction.confidence)}`}>
                      {getConfidenceLabel(transaction.confidence)} ({Math.round(transaction.confidence * 100)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma transação encontrada com os filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => onConfirm(filteredTransactions)}
          disabled={isCategorizing}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar e Importar ({filteredTransactions.length} transações)
        </button>
      </div>
    </div>
  );
}