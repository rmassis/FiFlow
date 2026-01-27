import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import type { TransactionFilters as Filters } from "@/react-app/pages/Transactions";

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/transactions/stats/categories');
      const data = await response.json();
      const cats = data.categories.map((c: any) => c.category);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any || undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value || undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              showAdvanced
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Avançado
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor Mínimo
              </label>
              <input
                type="number"
                placeholder="R$ 0,00"
                value={filters.minAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valor Máximo
              </label>
              <input
                type="number"
                placeholder="R$ 999.999,99"
                value={filters.maxAmount || ''}
                onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Needs Review Checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.needsReview || false}
                onChange={(e) => onFiltersChange({ ...filters, needsReview: e.target.checked || undefined })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Mostrar apenas transações que precisam de revisão
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Filtros ativos:</span>
            {filters.type && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                Tipo: {filters.type === 'receita' ? 'Receitas' : 'Despesas'}
              </span>
            )}
            {filters.category && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                Categoria: {filters.category}
              </span>
            )}
            {filters.search && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                Busca: "{filters.search}"
              </span>
            )}
            {filters.startDate && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                De: {new Date(filters.startDate).toLocaleDateString('pt-BR')}
              </span>
            )}
            {filters.endDate && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                Até: {new Date(filters.endDate).toLocaleDateString('pt-BR')}
              </span>
            )}
            {filters.needsReview && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Precisa revisão
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
